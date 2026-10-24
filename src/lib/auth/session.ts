import { cookies } from "next/headers";
import { getSessionFromToken, type AuthenticatedContext } from "../services/auth";

export const LVN_SESSION_COOKIE = "lvn_session";

export async function getCurrentSession(): Promise<AuthenticatedContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(LVN_SESSION_COOKIE)?.value;
    if (!token) return null;
    return getSessionFromToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LVN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(LVN_SESSION_COOKIE);
}

