import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret() {
  return process.env.PIN_LOOKUP_SECRET ?? "dev-only-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeToken(userId: string, name: string): string {
  const expires = Date.now() + TTL_MS;
  const payload = `${userId}|${encodeURIComponent(name)}|${expires}`;
  return `${payload}|${sign(payload)}`;
}

export function parseToken(
  token: string | undefined
): { userId: string; name: string; expires: number } | null {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 4) return null;
  const [userId, nameEnc, expiresStr, mac] = parts;
  const payload = `${userId}|${nameEnc}|${expiresStr}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(mac, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  return { userId, name: decodeURIComponent(nameEnc), expires };
}

export async function setAdminCookie(userId: string, name: string) {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(userId, name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getAdminSession() {
  const jar = await cookies();
  return parseToken(jar.get(COOKIE)?.value);
}
