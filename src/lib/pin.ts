import bcrypt from "bcryptjs";
import { createHmac } from "node:crypto";

const LOOKUP_SECRET = process.env.PIN_LOOKUP_SECRET ?? "dev-only-secret";

export function pinLookup(pin: string): string {
  return createHmac("sha256", LOOKUP_SECRET).update(pin).digest("hex");
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
