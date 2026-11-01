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

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  adminEmail: string;
}

export function getAdminNotificationEmail(): string {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT setting_value_json FROM site_settings WHERE setting_key = 'editorialEmail'")
      .get() as { setting_value_json: string } | undefined;
    if (row?.setting_value_json) {
      const parsed = JSON.parse(row.setting_value_json);
      if (typeof parsed === "string" && parsed.includes("@")) {
        return parsed.trim();
      }
    }
  } catch {}
  return process.env.ADMIN_EMAIL || process.env.SMTP_USER || "perrycreativity@gmail.com";
}

export function getSmtpConfig(): SmtpConfig {
  const db = getDb();
  let dbSettings: Record<string, string> = {};
  try {
    const rows = db
      .prepare(
        "SELECT setting_key, setting_value_json FROM site_settings WHERE setting_key IN ('smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom', 'editorialEmail')"
      )
      .all() as Array<{ setting_key: string; setting_value_json: string }>;
    for (const r of rows) {
      try {
        dbSettings[r.setting_key] = JSON.parse(r.setting_value_json);
      } catch {
        dbSettings[r.setting_key] = r.setting_value_json;
      }
    }
  } catch {}

  const adminEmail = getAdminNotificationEmail();
  const user =
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    dbSettings.smtpUser ||
    adminEmail ||
    "perrycreativity@gmail.com";

  const pass =
    process.env.SMTP_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    dbSettings.smtpPass ||
    "";

  let host =
    process.env.SMTP_HOST ||
    dbSettings.smtpHost ||
    "smtp.gmail.com";

  let port = Number(
    process.env.SMTP_PORT ||
    dbSettings.smtpPort ||
    (host.includes("gmail") ? 465 : 587)
  );

  const secure = port === 465;

  const from =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    dbSettings.smtpFrom ||
    `Literary Voices Network <${user.includes("@") ? user : "perrycreativity@gmail.com"}>`;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    adminEmail,
  };
}

export function saveSmtpSettings(settings: Partial<SmtpConfig>): void {
  const db = getDb();
  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO site_settings (setting_key, setting_value_json, description, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(setting_key) DO UPDATE SET
      setting_value_json = excluded.setting_value_json,
      updated_at = excluded.updated_at
  `);

  if (settings.host !== undefined) {
    upsert.run("smtpHost", JSON.stringify(settings.host.trim()), "SMTP Relay Host", now);
  }
  if (settings.port !== undefined) {
    upsert.run("smtpPort", JSON.stringify(Number(settings.port)), "SMTP Relay Port", now);
  }
  if (settings.user !== undefined) {
    upsert.run("smtpUser", JSON.stringify(settings.user.trim()), "SMTP / Gmail Username", now);
  }
  if (settings.pass !== undefined) {
    upsert.run("smtpPass", JSON.stringify(settings.pass.trim()), "SMTP / Gmail App Password", now);
  }
  if (settings.from !== undefined) {
    upsert.run("smtpFrom", JSON.stringify(settings.from.trim()), "Default From Email Header", now);
  }
  if (settings.adminEmail !== undefined) {
    upsert.run("editorialEmail", JSON.stringify(settings.adminEmail.trim()), "Admin Correspondence Receiving Email", now);
  }
}

export async function sendDirectEmail(payload: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const config = getSmtpConfig();
  const targetRecipient = payload.to || config.adminEmail || "perrycreativity@gmail.com";

  // Build standard HTML if none provided
  const finalHtml =
    payload.html ||
    `<div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; padding: 32px; background: #080808; color: #FAF8F3; border: 1px solid #D4AF37; border-radius: 16px;">
      <div style="border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; font-weight: bold;">Literary Voices Network</span>
        <h2 style="color: #F7DF8B; margin: 8px 0 0 0; font-size: 22px;">${payload.subject}</h2>
      </div>
      <div style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.7; color: #FAF8F3;">${payload.text}</div>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(250,248,243,0.6);">
        Literary Voices Network · Broadcasts, Books &amp; Literary Journalism<br />
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.literaryvoicenetwork.org"}" style="color: #D4AF37; text-decoration: none;">www.literaryvoicenetwork.org</a>
      </div>
    </div>`;

  if (config.pass && config.user) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: config.from,
        to: targetRecipient,
        subject: payload.subject,
        text: payload.text,
        html: finalHtml,
        replyTo: payload.replyTo || config.user,
      });

      console.log(`[SMTP DELIVERED] Successfully sent email to "${targetRecipient}" (ID: ${info.messageId})`);
      return { ok: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn(`[SMTP DELIVERY FAILED] Error sending to "${targetRecipient}":`, err?.message || err);
      return { ok: false, error: err?.message || "Failed to deliver email through SMTP." };
    }
  }

  // Fallback to Resend API if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.from,
          to: [targetRecipient],
          subject: payload.subject,
          text: payload.text,
          html: finalHtml,
          reply_to: payload.replyTo,
        }),
      });
      if (response.ok) {
        const json = await response.json();
        return { ok: true, messageId: json.id };
      }
    } catch {}
  }

  console.log(`[SMTP DEV OUTBOX] Dispatched to: ${targetRecipient} | Subject: "${payload.subject}"`);
  return {
    ok: true,
    messageId: `dev-outbox-${Date.now()}`,
  };
}

export async function sendTestSmtpEmail(targetEmail: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  const config = getSmtpConfig();
  const recipient = targetEmail.trim() || config.adminEmail || "perrycreativity@gmail.com";

  if (!config.pass) {
    return {
      ok: false,
      error: `SMTP Password / Gmail App Password is not set. Please enter your 16-character Gmail App Password for ${config.user} in Admin Settings to activate live delivery.`,
    };
  }

  const result = await sendDirectEmail({
    to: recipient,
    subject: `[LVN Test] Gmail SMTP Gateway Connected Successfully`,
    text: `Hello!\n\nThis is a verification test from Literary Voices Network.\n\nYour Gmail SMTP gateway is active and operational:\n- Host: ${config.host}:${config.port}\n- Account: ${config.user}\n- Recipient: ${recipient}\n- Timestamp: ${new Date().toISOString()}\n\nAll contact form submissions, author book requests, and approval notices will now be dispatched live to your inbox!`,
  });

  if (result.ok && !result.error) {
    return {
      ok: true,
      message: `Test email sent successfully to ${recipient}! Check your inbox/spam folder.`,
    };
  } else {
    return {
      ok: false,
      error: result.error || "Failed to send test email. Please check your Gmail App Password and network connection.",
    };
  }
}

export async function createNotification(
  input: SendNotificationInput
): Promise<NotificationItem> {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();
  const linkUrl = input.linkUrl || "/dashboard";

  let emailStatus: NotificationItem["email_delivery_status"] = "logged_dev";
  const recipient = input.recipientEmail || getAdminNotificationEmail();

  if (recipient) {
    const res = await sendDirectEmail({
      to: recipient,
      subject: `[LVN] ${input.title}`,
      text: `${input.message}\n\nView on Literary Voices Network: ${process.env.NEXT_PUBLIC_APP_URL || "https://www.literaryvoicenetwork.org"}${linkUrl}`,
      html: `<div style="font-family: Georgia, serif; max-width: 600px; padding: 24px; background: #080808; color: #FAF8F3; border: 1px solid #D4AF37; border-radius: 12px;"><h2 style="color: #F7DF8B; margin-top: 0;">${input.title}</h2><pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6; color: #FAF8F3;">${input.message}</pre><p style="margin-top: 20px;"><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.literaryvoicenetwork.org"}${linkUrl}" style="display: inline-block; padding: 10px 20px; background: #D4AF37; color: #050505; font-weight: bold; text-decoration: none; border-radius: 999px;">Review in Admin Console →</a></p></div>`,
    });
    emailStatus = res.ok ? "sent" : "failed";
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

