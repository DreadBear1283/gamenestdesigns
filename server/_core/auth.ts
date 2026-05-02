import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const TOKEN_LIFETIME_DAYS = 30;

function getKey() {
  return new TextEncoder().encode(ENV.jwtSecret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: number, role: string): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_LIFETIME_DAYS}d`)
    .sign(getKey());
}

export async function verifySessionToken(token: string): Promise<{ userId: number; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (typeof payload.userId !== "number" || typeof payload.role !== "string") return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "gnd_session";

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: TOKEN_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
  };
}
