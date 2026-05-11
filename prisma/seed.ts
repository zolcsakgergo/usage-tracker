import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_ITEMS, DEFAULT_USERS } from "../src/lib/items-seed";
import { hashPin, pinLookup } from "../src/lib/pin";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL / DIRECT_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const wipe = process.argv.includes("--wipe");
  if (wipe) {
    console.log("Wiping transactions, sessions, audit log, and items…");
    await prisma.transaction.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.item.deleteMany({});
  }

  // Re-stage slot indexes safely: move every existing item to a high temporary
  // slot first so we don't collide with the unique constraint when re-assigning.
  const existing = await prisma.item.findMany({ select: { id: true } });
  for (let i = 0; i < existing.length; i++) {
    await prisma.item.update({
      where: { id: existing[i].id },
      data: { slotIndex: 1000 + i },
    });
  }
  // Remove any items not in the new layout (only safe when wipe drops transactions too).
  if (wipe) {
    const keepIds = new Set(DEFAULT_ITEMS.map((it) => it.id));
    const toDelete = existing.filter((e) => !keepIds.has(e.id));
    if (toDelete.length > 0) {
      await prisma.item.deleteMany({
        where: { id: { in: toDelete.map((e) => e.id) } },
      });
    }
  }

  for (let i = 0; i < DEFAULT_ITEMS.length; i++) {
    const it = DEFAULT_ITEMS[i];
    await prisma.item.upsert({
      where: { id: it.id },
      update: {
        name: it.name,
        code: it.code,
        unit: it.unit,
        startCount: it.start,
        lowThreshold: it.low,
        slotIndex: i,
      },
      create: {
        id: it.id,
        name: it.name,
        code: it.code,
        unit: it.unit,
        count: it.start,
        startCount: it.start,
        lowThreshold: it.low,
        slotIndex: i,
      },
    });
  }

  const seedLookups: string[] = [];
  for (const u of DEFAULT_USERS) {
    const lookup = pinLookup(u.pin);
    seedLookups.push(lookup);
    await prisma.user.upsert({
      where: { pinLookup: lookup },
      update: { name: u.name, role: u.role, active: true },
      create: {
        name: u.name,
        role: u.role,
        pinHash: await hashPin(u.pin),
        pinLookup: lookup,
      },
    });
  }

  // Deactivate any users not in the current authorized list (keeps history intact).
  await prisma.user.updateMany({
    where: { pinLookup: { notIn: seedLookups } },
    data: { active: false },
  });

  console.log(`Seeded ${DEFAULT_ITEMS.length} items and ${DEFAULT_USERS.length} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
