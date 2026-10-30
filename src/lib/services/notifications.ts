import { getDb } from "../db";
import { generateId } from "../auth/crypto";
import type { AuditLog, NotificationItem } from "../db/types";
import nodemailer from "nodemailer";

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

  // 1. SMTP Transport if configured via environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    "Literary Voices Network <enquiry@literaryvoicenetwork.org>";
  const targetRecipient = input.recipientEmail || "enquiry@literaryvoicenetwork.org";

  if (smtpHost && input.recipientEmail) {
    try {
      const port = Number(process.env.SMTP_PORT || 587);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: smtpUser ? { user: smtpUser, pass: smtpPass || "" } : undefined,
      });

      await transporter.sendMail({
        from: fromEmail,
        to: targetRecipient,
        subject: `[LVN] ${input.title}`,
        text: `${input.message}\n\nView on Literary Voices Network: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${linkUrl}`,
        html: `<div style="font-family: Georgia, serif; max-width: 600px; padding: 24px; background: #080808; color: #FAF8F3; border: 1px solid #D4AF37; border-radius: 12px;"><h2 style="color: #F7DF8B; margin-top: 0;">${input.title}</h2><pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6; color: #FAF8F3;">${input.message}</pre><p style="margin-top: 20px;"><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${linkUrl}" style="display: inline-block; padding: 10px 20px; background: #D4AF37; color: #050505; font-weight: bold; text-decoration: none; border-radius: 999px;">Review &amp; Approve in Admin Console →</a></p></div>`,
      });
      emailStatus = "sent";
    } catch (smtpErr) {
      console.warn("SMTP Send Error:", smtpErr);
      emailStatus = "failed";
    }
  } else if (process.env.RESEND_API_KEY && input.recipientEmail) {
    // 2. Fallback to Resend API if RESEND_API_KEY is configured
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetRecipient],
          subject: `[LVN] ${input.title}`,
          text: `${input.message}\n\nView on Literary Voices Network: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${linkUrl}`,
          html: `<div style="font-family: Georgia, serif; max-width: 600px; padding: 24px; background: #080808; color: #FAF8F3; border: 1px solid #D4AF37; border-radius: 12px;"><h2 style="color: #F7DF8B; margin-top: 0;">${input.title}</h2><pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6; color: #FAF8F3;">${input.message}</pre><p style="margin-top: 20px;"><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${linkUrl}" style="display: inline-block; padding: 10px 20px; background: #D4AF37; color: #050505; font-weight: bold; text-decoration: none; border-radius: 999px;">Review &amp; Approve in Admin Console →</a></p></div>`,
        }),
      });
      emailStatus = response.ok ? "sent" : "failed";
    } catch {
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

