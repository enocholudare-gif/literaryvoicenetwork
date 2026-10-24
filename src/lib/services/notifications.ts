import { getDb } from "../db";
import { generateId } from "../auth/crypto";
import type { AuditLog, NotificationItem } from "../db/types";

export interface CreateAuditLogInput {
  actorUserId: string | null;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export function recordAuditLog(input: CreateAuditLogInput): AuditLog {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();
  const metadataJson = JSON.stringify(input.metadata || {});
  const ip = input.ipAddress || "127.0.0.1";

  db.prepare(`
    INSERT INTO audit_logs (
      id, actor_user_id, actor_role, action, entity_type, entity_id,
      summary, metadata_json, ip_address, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.actorUserId,
    input.actorRole,
    input.action,
    input.entityType,
    input.entityId,
    input.summary,
    metadataJson,
    ip,
    now
  );

  return {
    id,
    actor_user_id: input.actorUserId,
    actor_role: input.actorRole,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    summary: input.summary,
    metadata_json: metadataJson,
    ip_address: ip,
    created_at: now,
  };
}

export function listAuditLogs(limit = 100): AuditLog[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT a.*, u.email as actor_email, p.display_name as actor_name
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_user_id = u.id
      LEFT JOIN profiles p ON a.actor_user_id = p.user_id
      ORDER BY a.created_at DESC
      LIMIT ?
    `)
    .all(limit) as unknown as AuditLog[];
  return rows;
}

export interface SendNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  recipientEmail?: string;
}

export async function createNotification(
  input: SendNotificationInput
): Promise<NotificationItem> {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();
  const linkUrl = input.linkUrl || "/dashboard";

  let emailStatus: NotificationItem["email_delivery_status"] = "logged_dev";

  // Integration boundary: only attempt external email send when RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && input.recipientEmail) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            process.env.EMAIL_FROM ||
            "Literary Voices Network <editorial@literaryvoicesnetwork.org>",
          to: [input.recipientEmail],
          subject: `[LVN] ${input.title}`,
          html: `<p>${input.message}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${linkUrl}">View on Literary Voices Network</a></p>`,
        }),
      });
      emailStatus = response.ok ? "sent" : "failed";
    } catch {
      // Never let external email failure corrupt database state
      emailStatus = "failed";
    }
  }

  db.prepare(`
    INSERT INTO notifications (
      id, user_id, type, title, message, link_url, is_read, email_delivery_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    input.userId,
    input.type,
    input.title,
    input.message,
    linkUrl,
    emailStatus,
    now
  );

  return {
    id,
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link_url: linkUrl,
    is_read: false,
    email_delivery_status: emailStatus,
    created_at: now,
  };
}

export function listUserNotifications(userId: string, limit = 50): NotificationItem[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(userId, limit) as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    user_id: String(r.user_id),
    type: String(r.type),
    title: String(r.title),
    message: String(r.message),
    link_url: String(r.link_url),
    is_read: Boolean(r.is_read),
    email_delivery_status: r.email_delivery_status as NotificationItem["email_delivery_status"],
    created_at: String(r.created_at),
  }));
}

export function markNotificationRead(userId: string, notificationId: string): boolean {
  const db = getDb();
  const res = db
    .prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")
    .run(notificationId, userId);
  return res.changes > 0;
}

export function markAllNotificationsRead(userId: string): number {
  const db = getDb();
  const res = db
    .prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0")
    .run(userId);
  return Number(res.changes);
}

