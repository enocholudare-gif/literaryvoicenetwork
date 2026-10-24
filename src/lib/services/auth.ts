import { z } from "zod";
import { getDb } from "../db";
import {
  generateId,
  generateSecureToken,
  hashPassword,
  signSessionToken,
  slugify,
  verifyPassword,
  verifySessionToken,
} from "../auth/crypto";
import type { Profile, User, UserRole } from "../db/types";
import { createNotification, recordAuditLog } from "./notifications";
import { checkRateLimit } from "../security/sanitize";

export const RegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100),
  accountType: z.enum(["member", "author"]).default("member"),
  headline: z.string().max(180).optional(),
  bio: z.string().max(4000).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(2).max(100),
  penName: z.string().max(100).nullable().optional(),
  headline: z.string().max(200).optional().default(""),
  bio: z.string().max(5000).optional().default(""),
  avatarUrl: z.string().max(500).optional().default(""),
  bannerUrl: z.string().max(500).optional().default(""),
  location: z.string().max(120).optional().default(""),
  websiteUrl: z.string().max(300).optional().default(""),
  genres: z.array(z.string().max(60)).max(12).optional().default([]),
  socialLinks: z
    .object({
      twitter: z.string().max(300).optional(),
      instagram: z.string().max(300).optional(),
      goodreads: z.string().max(300).optional(),
      linkedin: z.string().max(300).optional(),
      substack: z.string().max(300).optional(),
    })
    .optional()
    .default({}),
  isAuthorProfile: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  notificationPrefs: z
    .object({
      emailSubmissions: z.boolean(),
      emailEvents: z.boolean(),
      emailNewsletter: z.boolean(),
    })
    .optional(),
});

export interface AuthenticatedContext {
  user: Omit<User, "password_hash">;
  profile: Profile;
}

export function mapUserRow(row: Record<string, unknown>): User {
  let prefs = {
    emailSubmissions: true,
    emailEvents: true,
    emailNewsletter: true,
  };
  try {
    if (typeof row.notification_prefs_json === "string") {
      prefs = { ...prefs, ...JSON.parse(row.notification_prefs_json) };
    }
  } catch {
    // ignore invalid json
  }
  return {
    id: String(row.id),
    email: String(row.email),
    password_hash: String(row.password_hash),
    role: row.role as UserRole,
    email_verified: Boolean(row.email_verified),
    verification_token: row.verification_token ? String(row.verification_token) : null,
    reset_token: row.reset_token ? String(row.reset_token) : null,
    reset_token_expires_at: row.reset_token_expires_at
      ? String(row.reset_token_expires_at)
      : null,
    account_status: row.account_status as User["account_status"],
    notification_prefs: prefs,
    last_login_at: row.last_login_at ? String(row.last_login_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function mapProfileRow(row: Record<string, unknown>): Profile {
  let genres: string[] = [];
  let socialLinks: Profile["social_links"] = {};
  try {
    if (typeof row.genres_json === "string") {
      genres = JSON.parse(row.genres_json);
    }
  } catch {
    genres = [];
  }
  try {
    if (typeof row.social_links_json === "string") {
      socialLinks = JSON.parse(row.social_links_json);
    }
  } catch {
    socialLinks = {};
  }

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    slug: String(row.slug),
    display_name: String(row.display_name),
    pen_name: row.pen_name ? String(row.pen_name) : null,
    headline: String(row.headline || ""),
    bio: String(row.bio || ""),
    avatar_url: String(row.avatar_url || ""),
    banner_url: String(row.banner_url || ""),
    location: String(row.location || ""),
    website_url: String(row.website_url || ""),
    genres,
    social_links: socialLinks,
    is_author_profile: Boolean(row.is_author_profile),
    is_featured: Boolean(row.is_featured),
    is_public: Boolean(row.is_public),
    role: row.role ? (row.role as UserRole) : undefined,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function generateUniqueProfileSlug(displayName: string): string {
  const db = getDb();
  const base = slugify(displayName) || "member";
  let candidate = base;
  let counter = 1;
  while (true) {
    const existing = db
      .prepare("SELECT id FROM profiles WHERE slug = ?")
      .get(candidate);
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export async function registerUser(
  rawInput: z.infer<typeof RegisterSchema>,
  ipAddress = "127.0.0.1"
): Promise<{
  context: AuthenticatedContext;
  sessionToken: string;
  verificationToken: string;
}> {
  const rate = checkRateLimit(`register:${ipAddress}`, 10, 60_000);
  if (!rate.allowed) {
    throw new Error("Too many registration attempts. Please wait a moment and try again.");
  }

  const parsed = RegisterSchema.parse(rawInput);
  const emailNormalized = parsed.email.trim().toLowerCase();
  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(emailNormalized);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const userId = generateId();
  const profileId = generateId();
  const slug = generateUniqueProfileSlug(parsed.displayName);
  const passwordHash = hashPassword(parsed.password);
  const verificationToken = generateSecureToken(20);
  const now = new Date().toISOString();
  // Never allow client to self-assign editor or admin role
  const assignedRole: UserRole = parsed.accountType === "author" ? "author" : "member";
  const isAuthor = assignedRole === "author" ? 1 : 0;

  db.exec("BEGIN TRANSACTION");
  try {
    db.prepare(`
      INSERT INTO users (
        id, email, password_hash, role, email_verified, verification_token,
        account_status, notification_prefs_json, last_login_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 0, ?, 'active', ?, ?, ?, ?)
    `).run(
      userId,
      emailNormalized,
      passwordHash,
      assignedRole,
      verificationToken,
      JSON.stringify({
        emailSubmissions: true,
        emailEvents: true,
        emailNewsletter: true,
      }),
      now,
      now,
      now
    );

    db.prepare(`
      INSERT INTO profiles (
        id, user_id, slug, display_name, pen_name, headline, bio,
        avatar_url, banner_url, location, website_url, genres_json,
        social_links_json, is_author_profile, is_featured, is_public,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, NULL, ?, ?, '/media/avatars/default-portrait.svg', '/media/banners/editorial-desk.svg', '', '', '[]', '{}', ?, 0, 1, ?, ?)
    `).run(
      profileId,
      userId,
      slug,
      parsed.displayName.trim(),
      (parsed.headline || (assignedRole === "author" ? "LVN Author & Contributor" : "LVN Community Member")).trim(),
      (parsed.bio || "").trim(),
      isAuthor,
      now,
      now
    );

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  await createNotification({
    userId,
    type: "email_verification",
    title: "Welcome to Literary Voices Network — Verify Your Email",
    message: `Welcome, ${parsed.displayName}! Your LVN profile (/authors/${slug}) is ready. Verification token: ${verificationToken}`,
    linkUrl: `/auth/verify?token=${verificationToken}`,
    recipientEmail: emailNormalized,
  });

  recordAuditLog({
    actorUserId: userId,
    actorRole: assignedRole,
    action: "USER_REGISTERED",
    entityType: "user",
    entityId: userId,
    summary: `New ${assignedRole} account registered (${emailNormalized}) with profile /authors/${slug}`,
    ipAddress,
  });

  const context = getUserWithProfileById(userId)!;
  const sessionToken = signSessionToken(userId);

  return { context, sessionToken, verificationToken };
}

export function verifyEmailWithToken(token: string): AuthenticatedContext {
  if (!token || token.trim().length < 10) {
    throw new Error("Invalid verification token.");
  }
  const db = getDb();
  const row = db
    .prepare("SELECT id FROM users WHERE verification_token = ?")
    .get(token.trim()) as { id: string } | undefined;

  if (!row) {
    throw new Error("Verification token not found or already used.");
  }

  const now = new Date().toISOString();
  db.prepare(
    "UPDATE users SET email_verified = 1, verification_token = NULL, updated_at = ? WHERE id = ?"
  ).run(now, row.id);

  const ctx = getUserWithProfileById(row.id);
  if (!ctx) {
    throw new Error("Account not found.");
  }

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "EMAIL_VERIFIED",
    entityType: "user",
    entityId: ctx.user.id,
    summary: `Verified email for ${ctx.user.email}`,
  });

  return ctx;
}

export function authenticateUser(
  rawInput: z.infer<typeof LoginSchema>,
  ipAddress = "127.0.0.1"
): { context: AuthenticatedContext; sessionToken: string } {
  const rate = checkRateLimit(`login:${ipAddress}`, 15, 60_000);
  if (!rate.allowed) {
    throw new Error("Too many sign-in attempts. Please wait before trying again.");
  }

  const parsed = LoginSchema.parse(rawInput);
  const emailNormalized = parsed.email.trim().toLowerCase();
  const db = getDb();

  const userRow = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(emailNormalized) as Record<string, unknown> | undefined;

  if (!userRow) {
    throw new Error("Invalid email or password.");
  }

  const user = mapUserRow(userRow);
  if (user.account_status !== "active") {
    throw new Error(`This account is currently ${user.account_status}.`);
  }

  if (!verifyPassword(parsed.password, user.password_hash)) {
    throw new Error("Invalid email or password.");
  }

  const now = new Date().toISOString();
  db.prepare("UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?").run(
    now,
    now,
    user.id
  );

  const context = getUserWithProfileById(user.id)!;
  const sessionToken = signSessionToken(user.id);

  recordAuditLog({
    actorUserId: user.id,
    actorRole: user.role,
    action: "USER_LOGIN",
    entityType: "user",
    entityId: user.id,
    summary: `${user.email} signed in (${user.role})`,
    ipAddress,
  });

  return { context, sessionToken };
}

export async function requestPasswordReset(
  email: string,
  ipAddress = "127.0.0.1"
): Promise<{ resetToken: string | null }> {
  const rate = checkRateLimit(`reset:${ipAddress}`, 8, 60_000);
  if (!rate.allowed) {
    throw new Error("Too many password reset requests. Please try again later.");
  }

  const emailNormalized = email.trim().toLowerCase();
  const db = getDb();
  const userRow = db
    .prepare("SELECT * FROM users WHERE email = ? AND account_status = 'active'")
    .get(emailNormalized) as Record<string, unknown> | undefined;

  if (!userRow) {
    // Do not leak user existence
    return { resetToken: null };
  }

  const resetToken = generateSecureToken(24);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  db.prepare(
    "UPDATE users SET reset_token = ?, reset_token_expires_at = ?, updated_at = ? WHERE id = ?"
  ).run(resetToken, expiresAt, now, String(userRow.id));

  await createNotification({
    userId: String(userRow.id),
    type: "password_reset",
    title: "Password Reset Requested",
    message: `A password reset was requested for your LVN account. Use token: ${resetToken}`,
    linkUrl: `/auth?mode=reset&token=${resetToken}`,
    recipientEmail: emailNormalized,
  });

  return { resetToken };
}

export function resetPasswordWithToken(
  token: string,
  newPassword: string
): AuthenticatedContext {
  if (!token || newPassword.length < 8) {
    throw new Error("Valid reset token and a password of at least 8 characters are required.");
  }
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE reset_token = ?")
    .get(token.trim()) as Record<string, unknown> | undefined;

  if (!row) {
    throw new Error("Invalid or expired password reset token.");
  }

  const expiresAt = row.reset_token_expires_at
    ? new Date(String(row.reset_token_expires_at)).getTime()
    : 0;
  if (expiresAt < Date.now()) {
    throw new Error("Password reset token has expired.");
  }

  const newHash = hashPassword(newPassword);
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL, updated_at = ? WHERE id = ?"
  ).run(newHash, now, String(row.id));

  const ctx = getUserWithProfileById(String(row.id))!;
  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "user",
    entityId: ctx.user.id,
    summary: `Password reset completed for ${ctx.user.email}`,
  });

  return ctx;
}

export function getUserWithProfileById(userId: string): AuthenticatedContext | null {
  const db = getDb();
  const userRow = db
    .prepare("SELECT * FROM users WHERE id = ? AND account_status = 'active'")
    .get(userId) as Record<string, unknown> | undefined;

  if (!userRow) return null;

  const profileRow = db
    .prepare("SELECT * FROM profiles WHERE user_id = ?")
    .get(userId) as Record<string, unknown> | undefined;

  if (!profileRow) return null;

  const fullUser = mapUserRow(userRow);
  const { password_hash: _omitted, ...safeUser } = fullUser;
  const profile = mapProfileRow({ ...profileRow, role: fullUser.role });

  return { user: safeUser, profile };
}

export function getSessionFromToken(token: string | undefined | null): AuthenticatedContext | null {
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return getUserWithProfileById(payload.userId);
}

const ROLE_WEIGHT: Record<UserRole, number> = {
  member: 1,
  author: 2,
  editor: 3,
  admin: 4,
};

export function hasMinimumRole(actualRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_WEIGHT[actualRole] >= ROLE_WEIGHT[minimumRole];
}

export function requireRole(
  ctx: AuthenticatedContext | null,
  allowedRoles: UserRole[]
): AuthenticatedContext {
  if (!ctx) {
    throw new Error("UNAUTHORIZED: Authentication is required.");
  }
  if (!allowedRoles.includes(ctx.user.role)) {
    throw new Error(
      `FORBIDDEN: Requires one of [${allowedRoles.join(", ")}], current role is '${ctx.user.role}'.`
    );
  }
  return ctx;
}

export function updateUserProfile(
  ctx: AuthenticatedContext,
  rawInput: z.infer<typeof ProfileUpdateSchema>
): AuthenticatedContext {
  const parsed = ProfileUpdateSchema.parse(rawInput);
  const db = getDb();
  const now = new Date().toISOString();

  const isAuthor =
    parsed.isAuthorProfile !== undefined
      ? parsed.isAuthorProfile
        ? 1
        : 0
      : ctx.profile.is_author_profile
        ? 1
        : 0;
  const isPublic =
    parsed.isPublic !== undefined
      ? parsed.isPublic
        ? 1
        : 0
      : ctx.profile.is_public
        ? 1
        : 0;

  db.prepare(`
    UPDATE profiles SET
      display_name = ?,
      pen_name = ?,
      headline = ?,
      bio = ?,
      avatar_url = ?,
      banner_url = ?,
      location = ?,
      website_url = ?,
      genres_json = ?,
      social_links_json = ?,
      is_author_profile = ?,
      is_public = ?,
      updated_at = ?
    WHERE user_id = ?
  `).run(
    parsed.displayName.trim(),
    parsed.penName ? parsed.penName.trim() : null,
    parsed.headline.trim(),
    parsed.bio.trim(),
    parsed.avatarUrl.trim() || ctx.profile.avatar_url,
    parsed.bannerUrl.trim() || ctx.profile.banner_url,
    parsed.location.trim(),
    parsed.websiteUrl.trim(),
    JSON.stringify(parsed.genres),
    JSON.stringify(parsed.socialLinks),
    isAuthor,
    isPublic,
    now,
    ctx.user.id
  );

  // If a member enables author profile, upgrade role from member to author (never downgrade editor/admin)
  if (isAuthor && ctx.user.role === "member") {
    db.prepare("UPDATE users SET role = 'author', updated_at = ? WHERE id = ?").run(
      now,
      ctx.user.id
    );
  }

  if (parsed.notificationPrefs) {
    db.prepare(
      "UPDATE users SET notification_prefs_json = ?, updated_at = ? WHERE id = ?"
    ).run(JSON.stringify(parsed.notificationPrefs), now, ctx.user.id);
  }

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "PROFILE_UPDATED",
    entityType: "profile",
    entityId: ctx.profile.id,
    summary: `Updated public profile /authors/${ctx.profile.slug}`,
  });

  return getUserWithProfileById(ctx.user.id)!;
}

export function deleteUserAccount(
  ctx: AuthenticatedContext,
  confirmationText: string
): void {
  if (confirmationText !== "DELETE MY ACCOUNT") {
    throw new Error("Please type 'DELETE MY ACCOUNT' to confirm account deletion.");
  }
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE users SET account_status = 'deleted', updated_at = ? WHERE id = ?"
  ).run(now, ctx.user.id);
  db.prepare(
    "UPDATE profiles SET is_public = 0, updated_at = ? WHERE user_id = ?"
  ).run(now, ctx.user.id);

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "ACCOUNT_DELETED",
    entityType: "user",
    entityId: ctx.user.id,
    summary: `Account soft-deleted by owner (${ctx.user.email})`,
  });
}

