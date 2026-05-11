"use server";

import { prisma } from "@/lib/prisma";
import { hashPin, pinLookup, verifyPin as verifyPinHash } from "@/lib/pin";
import { setAdminCookie, clearAdminCookie, getAdminSession } from "@/lib/admin-session";
import { revalidatePath } from "next/cache";

export type ItemDTO = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  count: number;
  low: number;
  slot: number;
};

export type UserDTO = {
  id: string;
  name: string;
  role: string;
};

export async function getItems(): Promise<ItemDTO[]> {
  const rows = await prisma.item.findMany({ orderBy: { slotIndex: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    unit: r.unit,
    count: r.count,
    low: r.lowThreshold,
    slot: r.slotIndex,
  }));
}

export async function verifyKioskPin(
  pin: string
): Promise<{ ok: true; user: UserDTO; sessionId: string } | { ok: false }> {
  if (!/^\d{2,8}$/.test(pin)) return { ok: false };
  const lookup = pinLookup(pin);
  const user = await prisma.user.findUnique({ where: { pinLookup: lookup } });
  if (!user || !user.active) return { ok: false };
  const ok = await verifyPinHash(pin, user.pinHash);
  if (!ok) return { ok: false };

  const session = await prisma.session.create({
    data: { userId: user.id },
  });

  return {
    ok: true,
    user: { id: user.id, name: user.name, role: user.role },
    sessionId: session.id,
  };
}

export async function endSession(sessionId: string) {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
  } catch {
    // ignore unknown session
  }
}

export async function recordTransaction(input: {
  itemId: string;
  userId: string;
  sessionId: string;
  type: "take" | "return";
}): Promise<{ ok: true; newCount: number } | { ok: false; error: string }> {
  const { itemId, userId, sessionId, type } = input;

  return await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item) return { ok: false as const, error: "item-missing" };
    if (type === "take" && item.count <= 0) {
      return { ok: false as const, error: "empty" };
    }
    const newCount = type === "take" ? Math.max(0, item.count - 1) : item.count + 1;
    await tx.item.update({
      where: { id: itemId },
      data: { count: newCount },
    });
    await tx.transaction.create({
      data: {
        itemId,
        userId,
        sessionId,
        type: type === "take" ? "take" : "return_",
        qty: 1,
      },
    });
    revalidatePath("/");
    return { ok: true as const, newCount };
  });
}

// ============================================================
// Admin
// ============================================================

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s) throw new Error("unauthorized");
  return s;
}

export async function verifyAdminPin(
  pin: string
): Promise<{ ok: true; name: string } | { ok: false }> {
  if (!/^\d{2,8}$/.test(pin)) return { ok: false };
  const lookup = pinLookup(pin);
  const user = await prisma.user.findUnique({ where: { pinLookup: lookup } });
  if (!user || !user.active || user.role !== "Administrator") return { ok: false };
  const ok = await verifyPinHash(pin, user.pinHash);
  if (!ok) return { ok: false };

  await setAdminCookie(user.id, user.name);
  return { ok: true, name: user.name };
}

export async function signOutAdmin() {
  await clearAdminCookie();
}

export type DashboardStats = {
  totalStock: number;
  itemCount: number;
  lowCount: number;
  emptyCount: number;
  txLast7d: number;
  txLast14d: number;
  daily: { day: string; takes: number; returns: number }[];
  topUsers: { userName: string; count: number }[];
  topItems: { itemName: string; count: number }[];
  lowItems: { id: string; name: string; count: number; low: number; unit: string }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();
  const items = await prisma.item.findMany({ orderBy: { slotIndex: "asc" } });
  const totalStock = items.reduce((s, i) => s + i.count, 0);
  const lowItems = items.filter((i) => i.count > 0 && i.count <= i.lowThreshold);
  const emptyItems = items.filter((i) => i.count <= 0);

  const now = Date.now();
  const DAY = 24 * 3600 * 1000;
  const since14 = new Date(now - 14 * DAY);
  const since7 = new Date(now - 7 * DAY);

  const recent = await prisma.transaction.findMany({
    where: { ts: { gte: since14 } },
    select: { ts: true, type: true, userId: true, itemId: true },
  });
  const usersById = new Map(
    (await prisma.user.findMany()).map((u) => [u.id, u.name])
  );
  const itemsById = new Map(items.map((i) => [i.id, i.name]));

  // Daily buckets
  const days: { day: string; takes: number; returns: number }[] = [];
  for (let d = 13; d >= 0; d--) {
    const dayStart = new Date(now - d * DAY);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + DAY);
    const slice = recent.filter((t) => t.ts >= dayStart && t.ts < dayEnd);
    days.push({
      day: dayStart.toISOString().slice(0, 10),
      takes: slice.filter((t) => t.type === "take").length,
      returns: slice.filter((t) => t.type === "return_").length,
    });
  }

  const txLast7d = recent.filter((t) => t.ts >= since7).length;
  const txLast14d = recent.length;

  const userCount = new Map<string, number>();
  const itemCount = new Map<string, number>();
  for (const t of recent) {
    if (t.type === "take") {
      userCount.set(t.userId, (userCount.get(t.userId) ?? 0) + 1);
      itemCount.set(t.itemId, (itemCount.get(t.itemId) ?? 0) + 1);
    }
  }
  const topUsers = [...userCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ userName: usersById.get(id) ?? "—", count }));
  const topItems = [...itemCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ itemName: itemsById.get(id) ?? "—", count }));

  return {
    totalStock,
    itemCount: items.length,
    lowCount: lowItems.length,
    emptyCount: emptyItems.length,
    txLast7d,
    txLast14d,
    daily: days,
    topUsers,
    topItems,
    lowItems: [...lowItems, ...emptyItems].map((i) => ({
      id: i.id,
      name: i.name,
      count: i.count,
      low: i.lowThreshold,
      unit: i.unit,
    })),
  };
}

export type TxRow = {
  id: number;
  ts: string;
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  type: "take" | "return";
  qty: number;
};

export async function listTransactions(filter: {
  search?: string;
  type?: "all" | "take" | "return";
  itemId?: string;
  userId?: string;
  fromDays?: number;
  limit?: number;
}): Promise<TxRow[]> {
  await requireAdmin();
  const fromDays = filter.fromDays ?? 30;
  const since = new Date(Date.now() - fromDays * 24 * 3600 * 1000);

  const rows = await prisma.transaction.findMany({
    where: {
      ts: { gte: since },
      ...(filter.type && filter.type !== "all"
        ? { type: filter.type === "take" ? "take" : "return_" }
        : {}),
      ...(filter.itemId ? { itemId: filter.itemId } : {}),
      ...(filter.userId ? { userId: filter.userId } : {}),
    },
    orderBy: { ts: "desc" },
    include: { item: true, user: true },
    take: filter.limit ?? 500,
  });

  const search = filter.search?.trim().toLowerCase();
  const filtered = search
    ? rows.filter(
        (r) =>
          r.item.name.toLowerCase().includes(search) ||
          r.user.name.toLowerCase().includes(search)
      )
    : rows;

  return filtered.map((r) => ({
    id: r.id,
    ts: r.ts.toISOString(),
    itemId: r.itemId,
    itemName: r.item.name,
    userId: r.userId,
    userName: r.user.name,
    type: r.type === "take" ? "take" : "return",
    qty: r.qty,
  }));
}

export type UserRow = {
  id: string;
  name: string;
  role: string;
  active: boolean;
  takes7d: number;
  returns7d: number;
};

export async function listUsers(): Promise<UserRow[]> {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const tx = await prisma.transaction.findMany({
    where: { ts: { gte: since } },
    select: { userId: true, type: true },
  });
  const takes = new Map<string, number>();
  const returns = new Map<string, number>();
  for (const t of tx) {
    if (t.type === "take") takes.set(t.userId, (takes.get(t.userId) ?? 0) + 1);
    else returns.set(t.userId, (returns.get(t.userId) ?? 0) + 1);
  }
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    active: u.active,
    takes7d: takes.get(u.id) ?? 0,
    returns7d: returns.get(u.id) ?? 0,
  }));
}

export async function addUser(input: { name: string; role: string; pin: string }) {
  const admin = await requireAdmin();
  if (!/^\d{2,8}$/.test(input.pin)) throw new Error("invalid-pin");
  const lookup = pinLookup(input.pin);
  const existing = await prisma.user.findUnique({ where: { pinLookup: lookup } });
  if (existing) throw new Error("pin-taken");
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      role: input.role,
      pinHash: await hashPin(input.pin),
      pinLookup: lookup,
    },
  });
  await prisma.auditLog.create({
    data: { actor: admin.userId, action: "user.create", target: user.id },
  });
  revalidatePath("/admin");
}

export async function removeUser(
  id: string
): Promise<{ ok: true } | { ok: false; reason: "has-history" }> {
  const admin = await requireAdmin();
  if (id === admin.userId) {
    throw new Error("cannot-remove-self");
  }
  const txCount = await prisma.transaction.count({ where: { userId: id } });
  if (txCount > 0) {
    return { ok: false, reason: "has-history" };
  }
  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { actor: admin.userId, action: "user.delete", target: id },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUser(input: {
  id: string;
  name?: string;
  role?: string;
  active?: boolean;
  newPin?: string;
}) {
  const admin = await requireAdmin();
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.role !== undefined) data.role = input.role;
  if (input.active !== undefined) data.active = input.active;
  if (input.newPin) {
    if (!/^\d{2,8}$/.test(input.newPin)) throw new Error("invalid-pin");
    data.pinHash = await hashPin(input.newPin);
    data.pinLookup = pinLookup(input.newPin);
  }
  await prisma.user.update({ where: { id: input.id }, data });
  await prisma.auditLog.create({
    data: { actor: admin.userId, action: "user.update", target: input.id },
  });
  revalidatePath("/admin");
}

export type ItemAdminRow = {
  id: string;
  name: string;
  code: string | null;
  accountingCode: string | null;
  unit: string;
  count: number;
  low: number;
  slot: number;
  startCount: number;
};

export async function listItemsAdmin(): Promise<ItemAdminRow[]> {
  await requireAdmin();
  const rows = await prisma.item.findMany({ orderBy: { slotIndex: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    accountingCode: r.accountingCode,
    unit: r.unit,
    count: r.count,
    low: r.lowThreshold,
    slot: r.slotIndex,
    startCount: r.startCount,
  }));
}

export async function updateItem(input: {
  id: string;
  name?: string;
  code?: string | null;
  accountingCode?: string | null;
  unit?: string;
  low?: number;
}) {
  const admin = await requireAdmin();
  await prisma.item.update({
    where: { id: input.id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.code !== undefined
        ? { code: input.code === null ? null : input.code.trim() || null }
        : {}),
      ...(input.accountingCode !== undefined
        ? {
            accountingCode:
              input.accountingCode === null
                ? null
                : input.accountingCode.trim() || null,
          }
        : {}),
      ...(input.unit !== undefined ? { unit: input.unit.trim() } : {}),
      ...(input.low !== undefined ? { lowThreshold: input.low } : {}),
    },
  });
  await prisma.auditLog.create({
    data: { actor: admin.userId, action: "item.update", target: input.id },
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function adjustStock(input: { itemId: string; newCount: number }) {
  const admin = await requireAdmin();
  if (input.newCount < 0) throw new Error("negative");
  await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: input.itemId } });
    if (!item) throw new Error("not-found");
    const delta = input.newCount - item.count;
    if (delta === 0) return;
    await tx.item.update({
      where: { id: input.itemId },
      data: { count: input.newCount },
    });
    // Log as an admin transaction so the audit trail reflects the change.
    await tx.transaction.create({
      data: {
        itemId: input.itemId,
        userId: admin.userId,
        type: delta < 0 ? "take" : "return_",
        qty: Math.abs(delta),
      },
    });
    await tx.auditLog.create({
      data: {
        actor: admin.userId,
        action: "item.stock-adjust",
        target: input.itemId,
        metadata: { from: item.count, to: input.newCount },
      },
    });
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function exportBackup(): Promise<{
  items: unknown[];
  users: unknown[];
  transactions: unknown[];
  exportedAt: string;
}> {
  await requireAdmin();
  const [items, users, transactions] = await Promise.all([
    prisma.item.findMany({ orderBy: { slotIndex: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.transaction.findMany({ orderBy: { ts: "asc" } }),
  ]);
  // Strip PIN hashes from the export — these are sensitive.
  const safeUsers = users.map(({ pinHash, pinLookup, ...rest }) => rest);
  return {
    items,
    users: safeUsers,
    transactions,
    exportedAt: new Date().toISOString(),
  };
}

export async function factoryReset() {
  const admin = await requireAdmin();
  await prisma.$transaction([
    prisma.transaction.deleteMany({}),
    prisma.session.deleteMany({}),
    prisma.auditLog.create({
      data: { actor: admin.userId, action: "settings.factory-reset" },
    }),
    prisma.item.updateMany({
      data: { count: 0 },
    }),
  ]);
  // Re-set counts to startCount.
  const items = await prisma.item.findMany();
  for (const it of items) {
    await prisma.item.update({
      where: { id: it.id },
      data: { count: it.startCount },
    });
  }
  revalidatePath("/admin");
  revalidatePath("/");
}
