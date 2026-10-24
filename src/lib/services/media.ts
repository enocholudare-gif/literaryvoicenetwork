import fs from "node:fs";
import path from "node:path";
import { getDb } from "../db";
import { generateId, slugify } from "../auth/crypto";
import type { MediaAsset } from "../db/types";
import type { AuthenticatedContext } from "./auth";
import { requireRole } from "./auth";
import { recordAuditLog } from "./notifications";

const ALLOWED_MIME_TYPES: Record<
  string,
  { ext: string; maxBytes: number; staffOnly?: boolean }
> = {
  "image/jpeg": { ext: "jpg", maxBytes: 8 * 1024 * 1024 },
  "image/png": { ext: "png", maxBytes: 8 * 1024 * 1024 },
  "image/webp": { ext: "webp", maxBytes: 8 * 1024 * 1024 },
  "image/svg+xml": { ext: "svg", maxBytes: 2 * 1024 * 1024 },
  "video/mp4": { ext: "mp4", maxBytes: 50 * 1024 * 1024, staffOnly: true },
  "video/webm": { ext: "webm", maxBytes: 50 * 1024 * 1024, staffOnly: true },
  "audio/mpeg": { ext: "mp3", maxBytes: 50 * 1024 * 1024, staffOnly: true },
  "audio/wav": { ext: "wav", maxBytes: 50 * 1024 * 1024, staffOnly: true },
  "application/pdf": { ext: "pdf", maxBytes: 20 * 1024 * 1024 },
};

export interface UploadMediaInput {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  altText?: string;
  assetCategory?: MediaAsset["asset_category"];
  isPublic?: boolean;
}

export function uploadMediaAsset(
  ctx: AuthenticatedContext,
  input: UploadMediaInput
): MediaAsset {
  requireRole(ctx, ["member", "author", "editor", "admin"]);

  const rule = ALLOWED_MIME_TYPES[input.mimeType.toLowerCase()];
  if (!rule) {
    throw new Error(
      `UNSUPPORTED_MEDIA_TYPE: MIME type '${input.mimeType}' is not permitted.`
    );
  }

  if (
    rule.staffOnly &&
    ctx.user.role !== "editor" &&
    ctx.user.role !== "admin"
  ) {
    throw new Error(
      "FORBIDDEN: Only editors and administrators may upload audio or video broadcast assets."
    );
  }

  if (
    input.assetCategory === "hero_media" &&
    ctx.user.role !== "admin"
  ) {
    throw new Error(
      "FORBIDDEN: Only administrators may upload homepage hero media."
    );
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > rule.maxBytes) {
    throw new Error(
      `FILE_SIZE_EXCEEDED: File size (${input.sizeBytes} bytes) exceeds limit (${rule.maxBytes} bytes).`
    );
  }

  const id = generateId();
  const safeBase =
    slugify(path.basename(input.originalName, path.extname(input.originalName))) ||
    "asset";
  const filename = `${safeBase}-${id.slice(0, 8)}.${rule.ext}`;

  const isPublic = input.isPublic !== undefined ? input.isPublic : true;
  const subFolder = isPublic ? "uploads" : "private-uploads";
  const targetDir = isPublic
    ? path.join(process.cwd(), "public", subFolder)
    : path.join(process.cwd(), "data", subFolder);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, input.buffer);

  const publicUrl = isPublic ? `/uploads/${filename}` : `/api/media/private/${id}`;
  const now = new Date().toISOString();
  const category = input.assetCategory || "editorial";

  const db = getDb();
  db.prepare(`
    INSERT INTO media_assets (
      id, uploaded_by_user_id, filename, original_name, mime_type, size_bytes,
      bucket, public_url, alt_text, asset_category, is_public, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    ctx.user.id,
    filename,
    input.originalName,
    input.mimeType.toLowerCase(),
    input.sizeBytes,
    isPublic ? "public" : "private",
    publicUrl,
    (input.altText || input.originalName).trim(),
    category,
    isPublic ? 1 : 0,
    now
  );

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "MEDIA_UPLOADED",
    entityType: "media_asset",
    entityId: id,
    summary: `Uploaded ${category} asset '${filename}' (${input.mimeType}, ${input.sizeBytes} bytes)`,
  });

  return {
    id,
    uploaded_by_user_id: ctx.user.id,
    filename,
    original_name: input.originalName,
    mime_type: input.mimeType.toLowerCase(),
    size_bytes: input.sizeBytes,
    bucket: isPublic ? "public" : "private",
    public_url: publicUrl,
    alt_text: (input.altText || input.originalName).trim(),
    asset_category: category,
    is_public: isPublic,
    created_at: now,
  };
}

export function listMediaAssets(ctx: AuthenticatedContext): MediaAsset[] {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const db = getDb();

  const isStaff = ctx.user.role === "editor" || ctx.user.role === "admin";
  const rows = isStaff
    ? (db
        .prepare(`
          SELECT m.*, p.display_name as uploader_name
          FROM media_assets m
          LEFT JOIN profiles p ON m.uploaded_by_user_id = p.user_id
          ORDER BY m.created_at DESC
        `)
        .all() as Array<Record<string, unknown>>)
    : (db
        .prepare(`
          SELECT m.*, p.display_name as uploader_name
          FROM media_assets m
          LEFT JOIN profiles p ON m.uploaded_by_user_id = p.user_id
          WHERE m.uploaded_by_user_id = ?
          ORDER BY m.created_at DESC
        `)
        .all(ctx.user.id) as Array<Record<string, unknown>>);

  return rows.map((r) => ({
    id: String(r.id),
    uploaded_by_user_id: String(r.uploaded_by_user_id),
    filename: String(r.filename),
    original_name: String(r.original_name),
    mime_type: String(r.mime_type),
    size_bytes: Number(r.size_bytes),
    bucket: String(r.bucket),
    public_url: String(r.public_url),
    alt_text: String(r.alt_text || ""),
    asset_category: r.asset_category as MediaAsset["asset_category"],
    is_public: Boolean(r.is_public),
    created_at: String(r.created_at),
    uploader_name: r.uploader_name ? String(r.uploader_name) : undefined,
  }));
}

export function deleteMediaAsset(
  ctx: AuthenticatedContext,
  assetId: string
): boolean {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM media_assets WHERE id = ?")
    .get(assetId) as Record<string, unknown> | undefined;

  if (!row) throw new Error("NOT_FOUND: Media asset not found.");
  if (
    String(row.uploaded_by_user_id) !== ctx.user.id &&
    ctx.user.role !== "admin"
  ) {
    throw new Error("FORBIDDEN: You can only delete your own uploaded media.");
  }

  db.prepare("DELETE FROM media_assets WHERE id = ?").run(assetId);
  return true;
}

