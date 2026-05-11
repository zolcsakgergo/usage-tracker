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
  for (let i = 0; i < DEFAULT_ITEMS.length; i++) {
    const it = DEFAULT_ITEMS[i];
    await prisma.item.upsert({
      where: { id: it.id },
      update: {
        name: it.name,
        unit: it.unit,
        startCount: it.start,
        lowThreshold: it.low,
        slotIndex: i,
      },
      create: {
        id: it.id,
        name: it.name,
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
