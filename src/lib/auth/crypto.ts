import {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createHmac,
  randomUUID,
} from "node:crypto";

const KEY_LENGTH = 64;

export function generateId(): string {
  return randomUUID();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, keyHex] = parts;
    const keyBuffer = Buffer.from(keyHex, "hex");
    const derivedBuffer = scryptSync(password, salt, KEY_LENGTH);
    if (keyBuffer.length !== derivedBuffer.length) {
      return false;
    }
    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

function getSessionSecret(): string {
  return (
    process.env.LVN_SESSION_SECRET ||
    "lvn-production-grade-fallback-secret-key-2026-literary-voices-network"
  );
}

export interface SessionPayload {
  userId: string;
  exp: number;
}

export function signSessionToken(userId: string, ttlSeconds = 60 * 60 * 24 * 7): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;
    const expectedSig = createHmac("sha256", getSessionSecret())
      .update(encoded)
      .digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload.userId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function generateSecureToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

