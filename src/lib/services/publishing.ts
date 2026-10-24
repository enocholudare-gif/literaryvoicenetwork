import { z } from "zod";
import { getDb } from "../db";
import { generateId, slugify } from "../auth/crypto";
import type {
  Article,
  ArticleType,
  Book,
  BookFormat,
  ContentRevision,
  PublicationStatus,
  Submission,
  UserRole,
} from "../db/types";
import type { AuthenticatedContext } from "./auth";
import { requireRole } from "./auth";
import {
  estimateReadingTimeMinutes,
  sanitizeRichTextHtml,
} from "../security/sanitize";
import { createNotification, recordAuditLog } from "./notifications";

// =============================================================================
// 1. PUBLICATION LIFECYCLE STATE MACHINE
//    Draft -> Submitted -> In Review -> Revision Requested / Approved -> Scheduled -> Published -> Archived
// =============================================================================

const ALLOWED_TRANSITIONS: Record<PublicationStatus, PublicationStatus[]> = {
  draft: ["draft", "submitted", "archived"],
  submitted: ["in_review", "revision_requested", "approved", "rejected", "draft"],
  in_review: ["revision_requested", "approved", "scheduled", "published", "rejected"],
  revision_requested: ["draft", "submitted", "in_review", "archived"],
  approved: ["scheduled", "published", "revision_requested", "archived"],
  scheduled: ["published", "approved", "revision_requested", "archived"],
  published: ["archived", "revision_requested"],
  rejected: ["draft", "archived"],
  archived: ["draft", "published"],
};

export function validateStatusTransition(
  currentStatus: PublicationStatus,
  nextStatus: PublicationStatus,
  actorRole: UserRole,
  isAdminOwnContentDirectPublish = false
): void {
  if (currentStatus === nextStatus) return;

  // Administrator direct-publishing override for their own content
  if (
    actorRole === "admin" &&
    isAdminOwnContentDirectPublish &&
    (nextStatus === "published" || nextStatus === "scheduled" || nextStatus === "approved" || nextStatus === "archived" || nextStatus === "draft")
  ) {
    return;
  }

  // Regular members/authors can only move between draft, submitted, and archived (for their own items)
  if (actorRole === "member" || actorRole === "author") {
    const memberAllowed: PublicationStatus[] = ["draft", "submitted", "archived"];
    if (!memberAllowed.includes(nextStatus)) {
      throw new Error(
        `FORBIDDEN_TRANSITION: Role '${actorRole}' cannot transition content to '${nextStatus}'.`
      );
    }
    if (
      nextStatus === "submitted" &&
      currentStatus !== "draft" &&
      currentStatus !== "revision_requested"
    ) {
      throw new Error(
        `INVALID_TRANSITION: Cannot submit content from status '${currentStatus}'.`
      );
    }
    return;
  }

  // Editors and Admins moderating submissions must follow the lifecycle graph
  const validTargets = ALLOWED_TRANSITIONS[currentStatus] || [];
  // Also allow editors/admins to fast-track submitted -> scheduled / published when approving
  if (
    (currentStatus === "submitted" || currentStatus === "approved") &&
    (nextStatus === "published" || nextStatus === "scheduled")
  ) {
    return;
  }

  if (!validTargets.includes(nextStatus)) {
    throw new Error(
      `INVALID_TRANSITION: Cannot transition from '${currentStatus}' to '${nextStatus}'.`
    );
  }
}

// =============================================================================
// 2. ZOD SCHEMAS FOR BOOKS & ARTICLES
// =============================================================================

export const BookInputSchema = z.object({
  title: z.string().min(2, "Book title is required").max(200),
  subtitle: z.string().max(240).optional().default(""),
  slug: z.string().max(120).optional(),
  isbn: z.string().max(40).optional().default(""),
  description: z.string().min(20, "Book description must be at least 20 characters").max(8000),
  excerpt: z.string().max(6000).optional().default(""),
  coverUrl: z.string().max(500).optional().default("/media/covers/the-glass-meridian.svg"),
  genre: z.string().min(2, "Primary genre is required").max(80),
  secondaryGenres: z.array(z.string().max(60)).max(6).optional().default([]),
  format: z
    .enum(["Hardcover", "Paperback", "eBook", "Audiobook", "Multi-format"])
    .optional()
    .default("Hardcover"),
  publisher: z.string().max(140).optional().default(""),
  publicationDate: z.string().max(40).optional().default(""),
  pageCount: z.number().int().positive().max(10000).nullable().optional().default(null),
  language: z.string().max(60).optional().default("English"),
  retailerLinks: z
    .object({
      amazon: z.string().max(400).optional(),
      bookshop: z.string().max(400).optional(),
      barnesAndNoble: z.string().max(400).optional(),
      goodreads: z.string().max(400).optional(),
      appleBooks: z.string().max(400).optional(),
      kobo: z.string().max(400).optional(),
      audible: z.string().max(400).optional(),
      spotify: z.string().max(400).optional(),
      publisherDirect: z.string().max(400).optional(),
    })
    .optional()
    .default({}),
  seoTitle: z.string().max(180).optional().default(""),
  seoDescription: z.string().max(320).optional().default(""),
});

export const ArticleInputSchema = z.object({
  title: z.string().min(3, "Title is required").max(220),
  subtitle: z.string().max(260).optional().default(""),
  slug: z.string().max(120).optional(),
  articleType: z
    .enum([
      "cover_story",
      "interview",
      "review",
      "essay",
      "commentary",
      "resource",
      "culture",
      "spotlight",
      "announcement",
      "press_release",
    ])
    .optional()
    .default("essay"),
  categoryId: z.string().nullable().optional().default(null),
  issueId: z.string().nullable().optional().default(null),
  relatedBookId: z.string().nullable().optional().default(null),
  featuredAuthorProfileId: z.string().nullable().optional().default(null),
  excerpt: z.string().max(1000).optional().default(""),
  bodyHtml: z.string().min(20, "Article body must be at least 20 characters"),
  coverUrl: z.string().max(500).optional().default("/media/banners/editorial-desk.svg"),
  sourceAttribution: z.string().max(160).optional().default("Literary Voices Network Editorial"),
  mediaContactInfo: z.string().max(240).optional().default(""),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  seoTitle: z.string().max(180).optional().default(""),
  seoDescription: z.string().max(320).optional().default(""),
});

// =============================================================================
// 3. ROW MAPPERS
// =============================================================================

export function mapBookRow(row: Record<string, unknown>): Book {
  let secondaryGenres: string[] = [];
  let retailerLinks: Book["retailer_links"] = {};
  try {
    if (typeof row.secondary_genres_json === "string") {
      secondaryGenres = JSON.parse(row.secondary_genres_json);
    }
  } catch {
    secondaryGenres = [];
  }
  try {
    if (typeof row.retailer_links_json === "string") {
      retailerLinks = JSON.parse(row.retailer_links_json);
    }
  } catch {
    retailerLinks = {};
  }

  return {
    id: String(row.id),
    slug: String(row.slug),
    author_profile_id: String(row.author_profile_id),
    submitted_by_user_id: String(row.submitted_by_user_id),
    title: String(row.title),
    subtitle: String(row.subtitle || ""),
    isbn: String(row.isbn || ""),
    description: String(row.description || ""),
    excerpt: String(row.excerpt || ""),
    cover_url: String(row.cover_url || "/media/covers/the-glass-meridian.svg"),
    genre: String(row.genre || "Literary Fiction"),
    secondary_genres: secondaryGenres,
    format: (row.format as BookFormat) || "Hardcover",
    publisher: String(row.publisher || ""),
    publication_date: String(row.publication_date || ""),
    page_count: row.page_count !== null && row.page_count !== undefined ? Number(row.page_count) : null,
    language: String(row.language || "English"),
    retailer_links: retailerLinks,
    manuscript_distribution_authorized: Boolean(row.manuscript_distribution_authorized),
    full_manuscript_url: String(row.full_manuscript_url || ""),
    is_featured: Boolean(row.is_featured),
    editorial_recommendation: Boolean(row.editorial_recommendation),
    is_community_member_book: Boolean(row.is_community_member_book),
    status: row.status as PublicationStatus,
    scheduled_for: row.scheduled_for ? String(row.scheduled_for) : null,
    published_at: row.published_at ? String(row.published_at) : null,
    seo_title: String(row.seo_title || ""),
    seo_description: String(row.seo_description || ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    author_name: row.author_name ? String(row.author_name) : undefined,
    author_slug: row.author_slug ? String(row.author_slug) : undefined,
    author_avatar: row.author_avatar ? String(row.author_avatar) : undefined,
    author_headline: row.author_headline ? String(row.author_headline) : undefined,
    author_bio: row.author_bio ? String(row.author_bio) : undefined,
    author_role: row.author_role ? (row.author_role as UserRole) : undefined,
  };
}

export function mapArticleRow(row: Record<string, unknown>): Article {
  return {
    id: String(row.id),
    slug: String(row.slug),
    author_profile_id: String(row.author_profile_id),
    created_by_user_id: String(row.created_by_user_id),
    category_id: row.category_id ? String(row.category_id) : null,
    issue_id: row.issue_id ? String(row.issue_id) : null,
    related_book_id: row.related_book_id ? String(row.related_book_id) : null,
    featured_author_profile_id: row.featured_author_profile_id
      ? String(row.featured_author_profile_id)
      : null,
    article_type: row.article_type as ArticleType,
    title: String(row.title),
    subtitle: String(row.subtitle || ""),
    excerpt: String(row.excerpt || ""),
    body_html: String(row.body_html || ""),
    cover_url: String(row.cover_url || "/media/banners/editorial-desk.svg"),
    reading_time_minutes: Number(row.reading_time_minutes || 5),
    source_attribution: String(row.source_attribution || "Literary Voices Network Editorial"),
    media_contact_info: String(row.media_contact_info || ""),
    is_featured: Boolean(row.is_featured),
    is_cover_story: Boolean(row.is_cover_story),
    status: row.status as PublicationStatus,
    scheduled_for: row.scheduled_for ? String(row.scheduled_for) : null,
    published_at: row.published_at ? String(row.published_at) : null,
    seo_title: String(row.seo_title || ""),
    seo_description: String(row.seo_description || ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    author_name: row.author_name ? String(row.author_name) : undefined,
    author_slug: row.author_slug ? String(row.author_slug) : undefined,
    author_avatar: row.author_avatar ? String(row.author_avatar) : undefined,
    author_headline: row.author_headline ? String(row.author_headline) : undefined,
    author_bio: row.author_bio ? String(row.author_bio) : undefined,
    author_role: row.author_role ? (row.author_role as UserRole) : undefined,
    category_name: row.category_name ? String(row.category_name) : undefined,
    category_slug: row.category_slug ? String(row.category_slug) : undefined,
    issue_title: row.issue_title ? String(row.issue_title) : undefined,
    issue_number: row.issue_number !== null && row.issue_number !== undefined ? Number(row.issue_number) : undefined,
  };
}

function generateUniqueSlug(
  table: "books" | "articles",
  rawTitleOrSlug: string,
  excludeId?: string
): string {
  const db = getDb();
  const base = slugify(rawTitleOrSlug) || "untitled";
  let candidate = base;
  let counter = 1;
  while (true) {
    const row = excludeId
      ? db
          .prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`)
          .get(candidate, excludeId)
      : db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(candidate);
    if (!row) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

function recordRevisionSnapshot(
  entityType: "book" | "article",
  entityId: string,
  title: string,
  snapshot: unknown,
  changeSummary: string,
  actorUserId: string
): ContentRevision {
  const db = getDb();
  const latest = db
    .prepare(
      "SELECT MAX(version_number) as maxVer FROM content_revisions WHERE entity_type = ? AND entity_id = ?"
    )
    .get(entityType, entityId) as { maxVer: number | null };
  const nextVersion = (latest?.maxVer || 0) + 1;
  const id = generateId();
  const now = new Date().toISOString();
  const snapshotJson = JSON.stringify(snapshot);

  db.prepare(`
    INSERT INTO content_revisions (
      id, entity_type, entity_id, version_number, title,
      snapshot_json, change_summary, created_by_user_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    entityType,
    entityId,
    nextVersion,
    title,
    snapshotJson,
    changeSummary,
    actorUserId,
    now
  );

  return {
    id,
    entity_type: entityType,
    entity_id: entityId,
    version_number: nextVersion,
    title,
    snapshot_json: snapshotJson,
    change_summary: changeSummary,
    created_by_user_id: actorUserId,
    created_at: now,
  };
}

// =============================================================================
// 4. BOOK PUBLISHING & SUBMISSION SERVICES
// =============================================================================

export function createBookDraft(
  ctx: AuthenticatedContext,
  rawInput: z.infer<typeof BookInputSchema>,
  options?: {
    publishImmediately?: boolean;
    scheduledFor?: string | null;
  }
): Book {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const parsed = BookInputSchema.parse(rawInput);
  const db = getDb();
  const id = generateId();
  const slug = generateUniqueSlug("books", parsed.slug || parsed.title);
  const now = new Date().toISOString();

  // Only an administrator (or editor) with explicit override may publish or schedule directly
  let targetStatus: PublicationStatus = "draft";
  let publishedAt: string | null = null;
  let scheduledFor: string | null = null;

  if (options?.publishImmediately) {
    if (ctx.user.role !== "admin" && ctx.user.role !== "editor") {
      throw new Error(
        "FORBIDDEN: Only administrators or editors may publish directly without editorial submission."
      );
    }
    targetStatus = "published";
    publishedAt = now;
  } else if (options?.scheduledFor) {
    if (ctx.user.role !== "admin" && ctx.user.role !== "editor") {
      throw new Error(
        "FORBIDDEN: Only administrators or editors may schedule publication directly."
      );
    }
    targetStatus = "scheduled";
    scheduledFor = options.scheduledFor;
  }

  // Ensure the creator's profile is marked as an author profile when they create a book
  db.prepare("UPDATE profiles SET is_author_profile = 1 WHERE id = ?").run(
    ctx.profile.id
  );
  if (ctx.user.role === "member") {
    db.prepare("UPDATE users SET role = 'author', updated_at = ? WHERE id = ?").run(
      now,
      ctx.user.id
    );
  }

  db.prepare(`
    INSERT INTO books (
      id, slug, author_profile_id, submitted_by_user_id, title, subtitle,
      isbn, description, excerpt, cover_url, genre, secondary_genres_json,
      format, publisher, publication_date, page_count, language,
      retailer_links_json, manuscript_distribution_authorized, full_manuscript_url,
      is_featured, editorial_recommendation, is_community_member_book,
      status, scheduled_for, published_at, seo_title, seo_description,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '', 0, 0, 1, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    ctx.profile.id, // Explicitly attributed to the creator's own public LVN profile
    ctx.user.id,
    parsed.title.trim(),
    parsed.subtitle.trim(),
    parsed.isbn.trim(),
    parsed.description.trim(),
    parsed.excerpt.trim(),
    parsed.coverUrl.trim() || "/media/covers/the-glass-meridian.svg",
    parsed.genre.trim(),
    JSON.stringify(parsed.secondaryGenres),
    parsed.format,
    parsed.publisher.trim(),
    parsed.publicationDate.trim(),
    parsed.pageCount,
    parsed.language.trim(),
    JSON.stringify(parsed.retailerLinks),
    targetStatus,
    scheduledFor,
    publishedAt,
    parsed.seoTitle.trim() || `${parsed.title.trim()} | Literary Voices Network`,
    parsed.seoDescription.trim() || parsed.description.trim().slice(0, 160),
    now,
    now
  );

  recordRevisionSnapshot(
    "book",
    id,
    parsed.title.trim(),
    { ...parsed, status: targetStatus, authorProfileId: ctx.profile.id },
    targetStatus === "published"
      ? `Direct publication under public profile ${ctx.profile.display_name}`
      : "Created initial book draft",
    ctx.user.id
  );

  if (ctx.user.role === "admin" && (targetStatus === "published" || targetStatus === "scheduled")) {
    recordAuditLog({
      actorUserId: ctx.user.id,
      actorRole: ctx.user.role,
      action: targetStatus === "published" ? "ADMIN_DIRECT_PUBLISH" : "ADMIN_SCHEDULE_CONTENT",
      entityType: "book",
      entityId: id,
      summary: `Administrator ${ctx.profile.display_name} (${ctx.profile.slug}) ${targetStatus} book '${parsed.title.trim()}' under their public LVN profile`,
      metadata: {
        authorProfileId: ctx.profile.id,
        authorSlug: ctx.profile.slug,
        status: targetStatus,
      },
    });
  } else {
    recordAuditLog({
      actorUserId: ctx.user.id,
      actorRole: ctx.user.role,
      action: "BOOK_CREATED",
      entityType: "book",
      entityId: id,
      summary: `Created book '${parsed.title.trim()}' (${targetStatus})`,
    });
  }

  return getBookByIdInternal(id)!;
}

export function updateBook(
  ctx: AuthenticatedContext,
  bookId: string,
  rawInput: Partial<z.infer<typeof BookInputSchema>>
): Book {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const existing = getBookByIdInternal(bookId);
  if (!existing) {
    throw new Error("NOT_FOUND: Book not found.");
  }

  const isOwner = existing.submitted_by_user_id === ctx.user.id;
  const isStaff = ctx.user.role === "editor" || ctx.user.role === "admin";
  if (!isOwner && !isStaff) {
    throw new Error("FORBIDDEN: You do not have permission to edit another member's book.");
  }

  // Non-staff owners cannot edit while in_review unless revision was requested or draft
  if (
    !isStaff &&
    existing.status !== "draft" &&
    existing.status !== "revision_requested" &&
    existing.status !== "submitted" &&
    existing.status !== "published"
  ) {
    throw new Error(`FORBIDDEN: Cannot edit book in '${existing.status}' status.`);
  }

  const merged = BookInputSchema.parse({
    title: rawInput.title ?? existing.title,
    subtitle: rawInput.subtitle ?? existing.subtitle,
    slug: rawInput.slug ?? existing.slug,
    isbn: rawInput.isbn ?? existing.isbn,
    description: rawInput.description ?? existing.description,
    excerpt: rawInput.excerpt ?? existing.excerpt,
    coverUrl: rawInput.coverUrl ?? existing.cover_url,
    genre: rawInput.genre ?? existing.genre,
    secondaryGenres: rawInput.secondaryGenres ?? existing.secondary_genres,
    format: rawInput.format ?? existing.format,
    publisher: rawInput.publisher ?? existing.publisher,
    publicationDate: rawInput.publicationDate ?? existing.publication_date,
    pageCount: rawInput.pageCount !== undefined ? rawInput.pageCount : existing.page_count,
    language: rawInput.language ?? existing.language,
    retailerLinks: rawInput.retailerLinks ?? existing.retailer_links,
    seoTitle: rawInput.seoTitle ?? existing.seo_title,
    seoDescription: rawInput.seoDescription ?? existing.seo_description,
  });

  const slug = generateUniqueSlug("books", merged.slug || merged.title, bookId);
  const now = new Date().toISOString();
  const db = getDb();

  // Preserve original author_profile_id (never silently re-attribute to editor/admin editing someone else's book)
  db.prepare(`
    UPDATE books SET
      slug = ?,
      title = ?,
      subtitle = ?,
      isbn = ?,
      description = ?,
      excerpt = ?,
      cover_url = ?,
      genre = ?,
      secondary_genres_json = ?,
      format = ?,
      publisher = ?,
      publication_date = ?,
      page_count = ?,
      language = ?,
      retailer_links_json = ?,
      seo_title = ?,
      seo_description = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    slug,
    merged.title.trim(),
    merged.subtitle.trim(),
    merged.isbn.trim(),
    merged.description.trim(),
    merged.excerpt.trim(),
    merged.coverUrl.trim(),
    merged.genre.trim(),
    JSON.stringify(merged.secondaryGenres),
    merged.format,
    merged.publisher.trim(),
    merged.publicationDate.trim(),
    merged.pageCount,
    merged.language.trim(),
    JSON.stringify(merged.retailerLinks),
    merged.seoTitle.trim(),
    merged.seoDescription.trim(),
    now,
    bookId
  );

  recordRevisionSnapshot(
    "book",
    bookId,
    merged.title.trim(),
    merged,
    `Updated book metadata by ${ctx.profile.display_name}`,
    ctx.user.id
  );

  return getBookByIdInternal(bookId)!;
}

export async function submitBookForReview(
  ctx: AuthenticatedContext,
  bookId: string,
  submissionNotes = ""
): Promise<{ book: Book; submission: Submission }> {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const existing = getBookByIdInternal(bookId);
  if (!existing) {
    throw new Error("NOT_FOUND: Book not found.");
  }
  if (existing.submitted_by_user_id !== ctx.user.id) {
    throw new Error("FORBIDDEN: You can only submit your own book drafts.");
  }

  validateStatusTransition(existing.status, "submitted", ctx.user.role);

  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE books SET status = 'submitted', updated_at = ? WHERE id = ?").run(
    now,
    bookId
  );

  const existingSub = db
    .prepare(
      "SELECT id FROM submissions WHERE entity_type = 'book' AND entity_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(bookId) as { id: string } | undefined;

  let subId: string;
  if (existingSub) {
    subId = existingSub.id;
    db.prepare(`
      UPDATE submissions SET
        status = 'submitted',
        submission_notes = ?,
        updated_at = ?
      WHERE id = ?
    `).run(submissionNotes.trim(), now, subId);
  } else {
    subId = generateId();
    db.prepare(`
      INSERT INTO submissions (
        id, entity_type, entity_id, submitted_by_user_id, author_profile_id,
        status, submission_notes, internal_notes, author_feedback, created_at, updated_at
      ) VALUES (?, 'book', ?, ?, ?, 'submitted', ?, '', '', ?, ?)
    `).run(
      subId,
      bookId,
      ctx.user.id,
      ctx.profile.id,
      submissionNotes.trim(),
      now,
      now
    );
  }

  await createNotification({
    userId: ctx.user.id,
    type: "submission_received",
    title: `Book Submitted for Review: ${existing.title}`,
    message: `Your book listing "${existing.title}" has been received by the LVN editorial board and is queued for review.`,
    linkUrl: "/dashboard?tab=books",
    recipientEmail: ctx.user.email,
  });

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "BOOK_SUBMITTED",
    entityType: "book",
    entityId: bookId,
    summary: `${ctx.profile.display_name} submitted book '${existing.title}' for editorial review`,
  });

  return {
    book: getBookByIdInternal(bookId)!,
    submission: getSubmissionByIdInternal(subId)!,
  };
}

export function authorizeManuscriptDistribution(
  ctx: AuthenticatedContext,
  bookId: string,
  authorized: boolean,
  fullManuscriptUrl = ""
): Book {
  requireRole(ctx, ["admin"]);
  const existing = getBookByIdInternal(bookId);
  if (!existing) {
    throw new Error("NOT_FOUND: Book not found.");
  }

  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE books SET
      manuscript_distribution_authorized = ?,
      full_manuscript_url = ?,
      updated_at = ?
    WHERE id = ?
  `).run(authorized ? 1 : 0, authorized ? fullManuscriptUrl.trim() : "", now, bookId);

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: authorized
      ? "MANUSCRIPT_DISTRIBUTION_AUTHORIZED"
      : "MANUSCRIPT_DISTRIBUTION_REVOKED",
    entityType: "book",
    entityId: bookId,
    summary: `Administrator ${authorized ? "authorized" : "revoked"} full manuscript distribution for '${existing.title}'`,
  });

  return getBookByIdInternal(bookId)!;
}

// =============================================================================
// 5. ARTICLE PUBLISHING & SUBMISSION SERVICES
// =============================================================================

export function createArticleDraft(
  ctx: AuthenticatedContext,
  rawInput: z.infer<typeof ArticleInputSchema>,
  options?: {
    publishImmediately?: boolean;
    scheduledFor?: string | null;
    isFeatured?: boolean;
    isCoverStory?: boolean;
  }
): Article {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const parsed = ArticleInputSchema.parse(rawInput);
  const sanitizedBody = sanitizeRichTextHtml(parsed.bodyHtml);
  if (sanitizedBody.length < 10) {
    throw new Error("VALIDATION_ERROR: Article body contains no valid content after sanitization.");
  }

  const readingTime = estimateReadingTimeMinutes(sanitizedBody);
  const plainExcerpt =
    parsed.excerpt.trim() ||
    sanitizedBody.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220);

  const db = getDb();
  const id = generateId();
  const slug = generateUniqueSlug("articles", parsed.slug || parsed.title);
  const now = new Date().toISOString();

  let targetStatus: PublicationStatus = "draft";
  let publishedAt: string | null = null;
  let scheduledFor: string | null = null;

  if (options?.publishImmediately) {
    if (ctx.user.role !== "admin" && ctx.user.role !== "editor") {
      throw new Error(
        "FORBIDDEN: Only administrators or editors may publish articles directly without moderation."
      );
    }
    targetStatus = "published";
    publishedAt = now;
  } else if (options?.scheduledFor) {
    if (ctx.user.role !== "admin" && ctx.user.role !== "editor") {
      throw new Error(
        "FORBIDDEN: Only administrators or editors may schedule articles directly."
      );
    }
    targetStatus = "scheduled";
    scheduledFor = options.scheduledFor;
  }

  const isFeatured =
    (ctx.user.role === "admin" || ctx.user.role === "editor") && options?.isFeatured ? 1 : 0;
  const isCoverStory =
    (ctx.user.role === "admin" || ctx.user.role === "editor") &&
    (options?.isCoverStory || parsed.articleType === "cover_story")
      ? 1
      : 0;

  db.prepare(`
    INSERT INTO articles (
      id, slug, author_profile_id, created_by_user_id, category_id, issue_id,
      related_book_id, featured_author_profile_id, article_type, title, subtitle,
      excerpt, body_html, cover_url, reading_time_minutes, source_attribution,
      media_contact_info, is_featured, is_cover_story, status, scheduled_for,
      published_at, seo_title, seo_description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    ctx.profile.id, // Explicitly attributed to the creator's own public LVN profile
    ctx.user.id,
    parsed.categoryId || null,
    parsed.issueId || null,
    parsed.relatedBookId || null,
    parsed.featuredAuthorProfileId || null,
    parsed.articleType,
    parsed.title.trim(),
    parsed.subtitle.trim(),
    plainExcerpt,
    sanitizedBody,
    parsed.coverUrl.trim() || "/media/banners/editorial-desk.svg",
    readingTime,
    parsed.sourceAttribution.trim(),
    parsed.mediaContactInfo.trim(),
    isFeatured,
    isCoverStory,
    targetStatus,
    scheduledFor,
    publishedAt,
    parsed.seoTitle.trim() || `${parsed.title.trim()} | Literary Voices Network`,
    parsed.seoDescription.trim() || plainExcerpt.slice(0, 160),
    now,
    now
  );

  // Sync tags if provided
  if (parsed.tags && parsed.tags.length > 0) {
    syncEntityTags("article", id, parsed.tags);
  }

  recordRevisionSnapshot(
    "article",
    id,
    parsed.title.trim(),
    { ...parsed, bodyHtml: sanitizedBody, status: targetStatus, authorProfileId: ctx.profile.id },
    targetStatus === "published"
      ? `Direct publication under public profile ${ctx.profile.display_name}`
      : "Created initial article draft",
    ctx.user.id
  );

  if (ctx.user.role === "admin" && (targetStatus === "published" || targetStatus === "scheduled")) {
    recordAuditLog({
      actorUserId: ctx.user.id,
      actorRole: ctx.user.role,
      action: targetStatus === "published" ? "ADMIN_DIRECT_PUBLISH" : "ADMIN_SCHEDULE_CONTENT",
      entityType: "article",
      entityId: id,
      summary: `Administrator ${ctx.profile.display_name} (${ctx.profile.slug}) ${targetStatus} ${parsed.articleType} '${parsed.title.trim()}' under their public LVN profile`,
      metadata: {
        authorProfileId: ctx.profile.id,
        authorSlug: ctx.profile.slug,
        articleType: parsed.articleType,
        status: targetStatus,
      },
    });
  } else {
    recordAuditLog({
      actorUserId: ctx.user.id,
      actorRole: ctx.user.role,
      action: "ARTICLE_CREATED",
      entityType: "article",
      entityId: id,
      summary: `Created ${parsed.articleType} '${parsed.title.trim()}' (${targetStatus})`,
    });
  }

  return getArticleByIdInternal(id)!;
}

export function updateArticle(
  ctx: AuthenticatedContext,
  articleId: string,
  rawInput: Partial<z.infer<typeof ArticleInputSchema>>
): Article {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const existing = getArticleByIdInternal(articleId);
  if (!existing) {
    throw new Error("NOT_FOUND: Article not found.");
  }

  const isOwner = existing.created_by_user_id === ctx.user.id;
  const isStaff = ctx.user.role === "editor" || ctx.user.role === "admin";
  if (!isOwner && !isStaff) {
    throw new Error("FORBIDDEN: You cannot edit another member's private draft or article.");
  }

  const merged = ArticleInputSchema.parse({
    title: rawInput.title ?? existing.title,
    subtitle: rawInput.subtitle ?? existing.subtitle,
    slug: rawInput.slug ?? existing.slug,
    articleType: rawInput.articleType ?? existing.article_type,
    categoryId: rawInput.categoryId !== undefined ? rawInput.categoryId : existing.category_id,
    issueId: rawInput.issueId !== undefined ? rawInput.issueId : existing.issue_id,
    relatedBookId:
      rawInput.relatedBookId !== undefined ? rawInput.relatedBookId : existing.related_book_id,
    featuredAuthorProfileId:
      rawInput.featuredAuthorProfileId !== undefined
        ? rawInput.featuredAuthorProfileId
        : existing.featured_author_profile_id,
    excerpt: rawInput.excerpt ?? existing.excerpt,
    bodyHtml: rawInput.bodyHtml ?? existing.body_html,
    coverUrl: rawInput.coverUrl ?? existing.cover_url,
    sourceAttribution: rawInput.sourceAttribution ?? existing.source_attribution,
    mediaContactInfo: rawInput.mediaContactInfo ?? existing.media_contact_info,
    tags: rawInput.tags ?? existing.tags ?? [],
    seoTitle: rawInput.seoTitle ?? existing.seo_title,
    seoDescription: rawInput.seoDescription ?? existing.seo_description,
  });

  const sanitizedBody = sanitizeRichTextHtml(merged.bodyHtml);
  const readingTime = estimateReadingTimeMinutes(sanitizedBody);
  const slug = generateUniqueSlug("articles", merged.slug || merged.title, articleId);
  const now = new Date().toISOString();
  const db = getDb();

  // Preserve original author_profile_id (never silently re-attribute to an editor/admin)
  db.prepare(`
    UPDATE articles SET
      slug = ?,
      category_id = ?,
      issue_id = ?,
      related_book_id = ?,
      featured_author_profile_id = ?,
      article_type = ?,
      title = ?,
      subtitle = ?,
      excerpt = ?,
      body_html = ?,
      cover_url = ?,
      reading_time_minutes = ?,
      source_attribution = ?,
      media_contact_info = ?,
      seo_title = ?,
      seo_description = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    slug,
    merged.categoryId || null,
    merged.issueId || null,
    merged.relatedBookId || null,
    merged.featuredAuthorProfileId || null,
    merged.articleType,
    merged.title.trim(),
    merged.subtitle.trim(),
    merged.excerpt.trim(),
    sanitizedBody,
    merged.coverUrl.trim(),
    readingTime,
    merged.sourceAttribution.trim(),
    merged.mediaContactInfo.trim(),
    merged.seoTitle.trim(),
    merged.seoDescription.trim(),
    now,
    articleId
  );

  if (rawInput.tags) {
    syncEntityTags("article", articleId, merged.tags);
  }

  recordRevisionSnapshot(
    "article",
    articleId,
    merged.title.trim(),
    { ...merged, bodyHtml: sanitizedBody },
    `Updated article by ${ctx.profile.display_name}`,
    ctx.user.id
  );

  return getArticleByIdInternal(articleId)!;
}

export async function submitArticleForReview(
  ctx: AuthenticatedContext,
  articleId: string,
  submissionNotes = ""
): Promise<{ article: Article; submission: Submission }> {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const existing = getArticleByIdInternal(articleId);
  if (!existing) {
    throw new Error("NOT_FOUND: Article not found.");
  }
  if (existing.created_by_user_id !== ctx.user.id) {
    throw new Error("FORBIDDEN: You can only submit your own articles.");
  }

  validateStatusTransition(existing.status, "submitted", ctx.user.role);

  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE articles SET status = 'submitted', updated_at = ? WHERE id = ?").run(
    now,
    articleId
  );

  const existingSub = db
    .prepare(
      "SELECT id FROM submissions WHERE entity_type = 'article' AND entity_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(articleId) as { id: string } | undefined;

  let subId: string;
  if (existingSub) {
    subId = existingSub.id;
    db.prepare(`
      UPDATE submissions SET
        status = 'submitted',
        submission_notes = ?,
        updated_at = ?
      WHERE id = ?
    `).run(submissionNotes.trim(), now, subId);
  } else {
    subId = generateId();
    db.prepare(`
      INSERT INTO submissions (
        id, entity_type, entity_id, submitted_by_user_id, author_profile_id,
        status, submission_notes, internal_notes, author_feedback, created_at, updated_at
      ) VALUES (?, 'article', ?, ?, ?, 'submitted', ?, '', '', ?, ?)
    `).run(
      subId,
      articleId,
      ctx.user.id,
      ctx.profile.id,
      submissionNotes.trim(),
      now,
      now
    );
  }

  await createNotification({
    userId: ctx.user.id,
    type: "submission_received",
    title: `Publication Submitted: ${existing.title}`,
    message: `Your submission "${existing.title}" has been received by the LVN editorial team.`,
    linkUrl: "/dashboard?tab=publications",
    recipientEmail: ctx.user.email,
  });

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "ARTICLE_SUBMITTED",
    entityType: "article",
    entityId: articleId,
    summary: `${ctx.profile.display_name} submitted article '${existing.title}' for review`,
  });

  return {
    article: getArticleByIdInternal(articleId)!,
    submission: getSubmissionByIdInternal(subId)!,
  };
}

// =============================================================================
// 6. EDITORIAL MODERATION & ADMIN DIRECT STATUS MANAGEMENT
// =============================================================================

export interface ModerationDecisionInput {
  entityType: "book" | "article";
  entityId: string;
  nextStatus: PublicationStatus;
  authorFeedback?: string;
  internalNotes?: string;
  scheduledFor?: string | null;
  isFeatured?: boolean;
  editorialRecommendation?: boolean;
}

export async function moderateOrTransitionContent(
  ctx: AuthenticatedContext,
  input: ModerationDecisionInput
): Promise<{ book?: Book; article?: Article; submission?: Submission }> {
  const db = getDb();
  const now = new Date().toISOString();

  if (input.entityType === "book") {
    const book = getBookByIdInternal(input.entityId);
    if (!book) throw new Error("NOT_FOUND: Book not found.");

    const isOwner = book.submitted_by_user_id === ctx.user.id;
    const isAdminOwnContent = ctx.user.role === "admin" && isOwner;

    if (!isOwner && ctx.user.role !== "editor" && ctx.user.role !== "admin") {
      throw new Error("FORBIDDEN: Insufficient permissions to change book status.");
    }

    validateStatusTransition(
      book.status,
      input.nextStatus,
      ctx.user.role,
      isAdminOwnContent
    );

    const publishedAt =
      input.nextStatus === "published"
        ? book.published_at || now
        : book.published_at;
    const scheduledFor =
      input.nextStatus === "scheduled"
        ? input.scheduledFor || new Date(Date.now() + 86400000).toISOString()
        : input.nextStatus === "published"
          ? null
          : book.scheduled_for;

    const isFeatured =
      input.isFeatured !== undefined
        ? input.isFeatured
          ? 1
          : 0
        : book.is_featured
          ? 1
          : 0;
    const editorialRec =
      input.editorialRecommendation !== undefined
        ? input.editorialRecommendation
          ? 1
          : 0
        : book.editorial_recommendation
          ? 1
          : 0;

    db.prepare(`
      UPDATE books SET
        status = ?,
        scheduled_for = ?,
        published_at = ?,
        is_featured = ?,
        editorial_recommendation = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      input.nextStatus,
      scheduledFor,
      publishedAt,
      isFeatured,
      editorialRec,
      now,
      book.id
    );

    // Update or create submission moderation record if reviewed by editor/admin
    let updatedSub: Submission | undefined;
    if (ctx.user.role === "editor" || ctx.user.role === "admin") {
      const subRow = db
        .prepare(
          "SELECT id FROM submissions WHERE entity_type = 'book' AND entity_id = ? ORDER BY created_at DESC LIMIT 1"
        )
        .get(book.id) as { id: string } | undefined;

      if (subRow) {
        db.prepare(`
          UPDATE submissions SET
            status = ?,
            reviewer_user_id = ?,
            internal_notes = COALESCE(NULLIF(?, ''), internal_notes),
            author_feedback = COALESCE(NULLIF(?, ''), author_feedback),
            decision_at = ?,
            updated_at = ?
          WHERE id = ?
        `).run(
          input.nextStatus === "draft" ? "revision_requested" : input.nextStatus,
          ctx.user.id,
          (input.internalNotes || "").trim(),
          (input.authorFeedback || "").trim(),
          now,
          now,
          subRow.id
        );
        updatedSub = getSubmissionByIdInternal(subRow.id) || undefined;
      }
    }

    recordRevisionSnapshot(
      "book",
      book.id,
      book.title,
      { status: input.nextStatus, feedback: input.authorFeedback },
      `Status changed from '${book.status}' to '${input.nextStatus}' by ${ctx.profile.display_name}`,
      ctx.user.id
    );

    await createNotification({
      userId: book.submitted_by_user_id,
      type: `book_${input.nextStatus}`,
      title: `Book Status Updated: ${book.title} (${input.nextStatus.replace("_", " ").toUpperCase()})`,
      message:
        input.authorFeedback?.trim() ||
        `Your book "${book.title}" is now marked as ${input.nextStatus.replace("_", " ")}.`,
      linkUrl:
        input.nextStatus === "published"
          ? `/books/${book.slug}`
          : "/dashboard?tab=books",
    });

    recordAuditLog({
      actorUserId: ctx.user.id,
      actorRole: ctx.user.role,
      action: isAdminOwnContent
        ? `ADMIN_OWN_BOOK_${input.nextStatus.toUpperCase()}`
        : `MODERATION_BOOK_${input.nextStatus.toUpperCase()}`,
      entityType: "book",
      entityId: book.id,
      summary: `${ctx.profile.display_name} (${ctx.user.role}) transitioned book '${book.title}' from '${book.status}' to '${input.nextStatus}'`,
      metadata: {
        previousStatus: book.status,
        nextStatus: input.nextStatus,
        authorProfileId: book.author_profile_id,
      },
    });

    return {
      book: getBookByIdInternal(book.id)!,
      submission: updatedSub,
    };
  } else {
    const article = getArticleByIdInternal(input.entityId);
    if (!article) throw new Error("NOT_FOUND: Article not found.");

    const isOwner = article.created_by_user_id === ctx.user.id;
    const isAdminOwnContent = ctx.user.role === "admin" && isOwner;

    if (!isOwner && ctx.user.role !== "editor" && ctx.user.role !== "admin") {
      throw new Error("FORBIDDEN: Insufficient permissions to change article status.");
    }

    validateStatusTransition(
      article.status,
      input.nextStatus,
      ctx.user.role,
      isAdminOwnContent
    );

    const publishedAt =
      input.nextStatus === "published"
        ? article.published_at || now
        : article.published_at;
    const scheduledFor =
      input.nextStatus === "scheduled"
        ? input.scheduledFor || new Date(Date.now() + 86400000).toISOString()
        : input.nextStatus === "published"
          ? null
          : article.scheduled_for;

    const isFeatured =
      input.isFeatured !== undefined
        ? input.isFeatured
          ? 1
          : 0
        : article.is_featured
          ? 1
          : 0;

    db.prepare(`
      UPDATE articles SET
        status = ?,
        scheduled_for = ?,
        published_at = ?,
        is_featured = ?,
        updated_at = ?
      WHERE id = ?
    `).run(input.nextStatus, scheduledFor, publishedAt, isFeatured, now, article.id);

    let updatedSub: Submission | undefined;
    if (ctx.user.role === "editor" || ctx.user.role === "admin") {
      const subRow = db
        .prepare(
          "SELECT id FROM submissions WHERE entity_type = 'article' AND entity_id = ? ORDER BY created_at DESC LIMIT 1"
        )
        .get(article.id) as { id: string } | undefined;

      if (subRow) {
        db.prepare(`
          UPDATE submissions SET
            status = ?,
            reviewer_user_id = ?,
            internal_notes = COALESCE(NULLIF(?, ''), internal_notes),
            author_feedback = COALESCE(NULLIF(?, ''), author_feedback),
            decision_at = ?,
            updated_at = ?
          WHERE id = ?
        `).run(
          input.nextStatus === "draft" ? "revision_requested" : input.nextStatus,
          ctx.user.id,
          (input.internalNotes || "").trim(),
          (input.authorFeedback || "").trim(),
          now,
          now,
          subRow.id
        );
        updatedSub = getSubmissionByIdInternal(subRow.id) || undefined;
      }
    }

    recordRevisionSnapshot(
      "article",
      article.id,
      article.title,
      { status: input.nextStatus, feedback: input.authorFeedback },
      `Status changed from '${article.status}' to '${input.nextStatus}' by ${ctx.profile.display_name}`,
      ctx.user.id
    );

    await createNotification({
      userId: article.created_by_user_id,
      type: `article_${input.nextStatus}`,
      title: `Publication Status Updated: ${article.title} (${input.nextStatus.replace("_", " ").toUpperCase()})`,
      message:
        input.authorFeedback?.trim() ||
        `Your publication "${article.title}" is now marked as ${input.nextStatus.replace("_", " ")}.`,
      linkUrl:
        input.nextStatus === "published"
          ? `/magazine/${article.slug}`
          : "/dashboard?tab=publications",
    });

    recordAuditLog({
      actorUserId: ctx.user.id,
      actorRole: ctx.user.role,
      action: isAdminOwnContent
        ? `ADMIN_OWN_ARTICLE_${input.nextStatus.toUpperCase()}`
        : `MODERATION_ARTICLE_${input.nextStatus.toUpperCase()}`,
      entityType: "article",
      entityId: article.id,
      summary: `${ctx.profile.display_name} (${ctx.user.role}) transitioned article '${article.title}' from '${article.status}' to '${input.nextStatus}'`,
      metadata: {
        previousStatus: article.status,
        nextStatus: input.nextStatus,
        authorProfileId: article.author_profile_id,
      },
    });

    return {
      article: getArticleByIdInternal(article.id)!,
      submission: updatedSub,
    };
  }
}

// =============================================================================
// 7. QUERIES & VISIBILITY ENFORCEMENT
// =============================================================================

export function getBookByIdInternal(bookId: string): Book | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT b.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        p.headline as author_headline,
        p.bio as author_bio,
        u.role as author_role
      FROM books b
      JOIN profiles p ON b.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE b.id = ?
    `)
    .get(bookId) as Record<string, unknown> | undefined;

  if (!row) return null;
  return mapBookRow(row);
}

export function getBookBySlugForViewer(
  slug: string,
  viewer: AuthenticatedContext | null
): Book | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT b.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        p.headline as author_headline,
        p.bio as author_bio,
        u.role as author_role
      FROM books b
      JOIN profiles p ON b.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE b.slug = ?
    `)
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) return null;
  const book = mapBookRow(row);

  if (book.status === "published") {
    return book;
  }

  // Non-published books are strictly visible ONLY to their owner, editors, or admins
  if (!viewer) return null;
  if (
    viewer.user.id === book.submitted_by_user_id ||
    viewer.user.role === "editor" ||
    viewer.user.role === "admin"
  ) {
    return book;
  }
  return null;
}

export interface ListPublicBooksFilter {
  search?: string;
  genre?: string;
  format?: string;
  featuredOnly?: boolean;
  editorialPickOnly?: boolean;
  authorProfileId?: string;
  sortBy?: "newest" | "title" | "editorial";
  page?: number;
  pageSize?: number;
}

export function listPublicBooks(filter: ListPublicBooksFilter = {}): {
  items: Book[];
  total: number;
  page: number;
  pageSize: number;
  genres: string[];
} {
  const db = getDb();
  const conditions: string[] = ["b.status = 'published'"];
  const params: Array<string | number> = [];

  if (filter.search && filter.search.trim()) {
    const q = `%${filter.search.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(b.title) LIKE ? OR LOWER(b.subtitle) LIKE ? OR LOWER(b.isbn) LIKE ? OR LOWER(b.description) LIKE ? OR LOWER(p.display_name) LIKE ?)"
    );
    params.push(q, q, q, q, q);
  }

  if (filter.genre && filter.genre !== "All") {
    conditions.push("(LOWER(b.genre) = LOWER(?) OR LOWER(b.secondary_genres_json) LIKE LOWER(?))");
    params.push(filter.genre.trim(), `%"${filter.genre.trim()}"%`);
  }

  if (filter.format && filter.format !== "All") {
    conditions.push("b.format = ?");
    params.push(filter.format);
  }

  if (filter.featuredOnly) {
    conditions.push("b.is_featured = 1");
  }

  if (filter.editorialPickOnly) {
    conditions.push("b.editorial_recommendation = 1");
  }

  if (filter.authorProfileId) {
    conditions.push("b.author_profile_id = ?");
    params.push(filter.authorProfileId);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  let orderBy = "ORDER BY COALESCE(b.published_at, b.created_at) DESC";
  if (filter.sortBy === "title") {
    orderBy = "ORDER BY b.title COLLATE NOCASE ASC";
  } else if (filter.sortBy === "editorial") {
    orderBy =
      "ORDER BY b.editorial_recommendation DESC, b.is_featured DESC, COALESCE(b.published_at, b.created_at) DESC";
  }

  const page = Math.max(1, filter.page || 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize || 12));
  const offset = (page - 1) * pageSize;

  const totalRow = db
    .prepare(
      `SELECT COUNT(*) as count FROM books b JOIN profiles p ON b.author_profile_id = p.id ${whereClause}`
    )
    .get(...params) as { count: number };

  const rows = db
    .prepare(`
      SELECT b.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        p.headline as author_headline,
        u.role as author_role
      FROM books b
      JOIN profiles p ON b.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `)
    .all(...params, pageSize, offset) as Array<Record<string, unknown>>;

  const genreRows = db
    .prepare("SELECT DISTINCT genre FROM books WHERE status = 'published' ORDER BY genre ASC")
    .all() as Array<{ genre: string }>;

  return {
    items: rows.map(mapBookRow),
    total: totalRow.count,
    page,
    pageSize,
    genres: genreRows.map((g) => g.genre),
  };
}

export function listUserBooks(ctx: AuthenticatedContext): Book[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT b.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar
      FROM books b
      JOIN profiles p ON b.author_profile_id = p.id
      WHERE b.submitted_by_user_id = ? OR b.author_profile_id = ?
      ORDER BY b.updated_at DESC
    `)
    .all(ctx.user.id, ctx.profile.id) as Array<Record<string, unknown>>;
  return rows.map(mapBookRow);
}

export function listAllBooksForStaff(ctx: AuthenticatedContext): Book[] {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT b.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        u.role as author_role
      FROM books b
      JOIN profiles p ON b.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY b.updated_at DESC
    `)
    .all() as Array<Record<string, unknown>>;
  return rows.map(mapBookRow);
}

export function getArticleByIdInternal(articleId: string): Article | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT a.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        p.headline as author_headline,
        p.bio as author_bio,
        u.role as author_role,
        c.name as category_name,
        c.slug as category_slug,
        i.title as issue_title,
        i.issue_number as issue_number
      FROM articles a
      JOIN profiles p ON a.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN editorial_issues i ON a.issue_id = i.id
      WHERE a.id = ?
    `)
    .get(articleId) as Record<string, unknown> | undefined;

  if (!row) return null;
  const article = mapArticleRow(row);
  article.tags = getEntityTagNames("article", article.id);
  return article;
}

export function getArticleBySlugForViewer(
  slug: string,
  viewer: AuthenticatedContext | null
): Article | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT a.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        p.headline as author_headline,
        p.bio as author_bio,
        u.role as author_role,
        c.name as category_name,
        c.slug as category_slug,
        i.title as issue_title,
        i.issue_number as issue_number
      FROM articles a
      JOIN profiles p ON a.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN editorial_issues i ON a.issue_id = i.id
      WHERE a.slug = ?
    `)
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) return null;
  const article = mapArticleRow(row);
  article.tags = getEntityTagNames("article", article.id);

  if (article.status === "published") {
    return article;
  }

  if (!viewer) return null;
  if (
    viewer.user.id === article.created_by_user_id ||
    viewer.user.role === "editor" ||
    viewer.user.role === "admin"
  ) {
    return article;
  }
  return null;
}

export interface ListPublicArticlesFilter {
  search?: string;
  articleType?: ArticleType | "all";
  excludePressReleases?: boolean;
  categorySlug?: string;
  issueId?: string;
  authorProfileId?: string;
  relatedBookId?: string;
  featuredOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export function listPublicArticles(filter: ListPublicArticlesFilter = {}): {
  items: Article[];
  total: number;
  page: number;
  pageSize: number;
} {
  const db = getDb();
  const conditions: string[] = ["a.status = 'published'"];
  const params: Array<string | number> = [];

  if (filter.search && filter.search.trim()) {
    const q = `%${filter.search.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(a.title) LIKE ? OR LOWER(a.subtitle) LIKE ? OR LOWER(a.excerpt) LIKE ? OR LOWER(p.display_name) LIKE ?)"
    );
    params.push(q, q, q, q);
  }

  if (filter.articleType && filter.articleType !== "all") {
    conditions.push("a.article_type = ?");
    params.push(filter.articleType);
  } else if (filter.excludePressReleases) {
    conditions.push("a.article_type != 'press_release'");
  }

  if (filter.categorySlug && filter.categorySlug !== "all") {
    conditions.push("c.slug = ?");
    params.push(filter.categorySlug);
  }

  if (filter.issueId) {
    conditions.push("a.issue_id = ?");
    params.push(filter.issueId);
  }

  if (filter.authorProfileId) {
    conditions.push("(a.author_profile_id = ? OR a.featured_author_profile_id = ?)");
    params.push(filter.authorProfileId, filter.authorProfileId);
  }

  if (filter.relatedBookId) {
    conditions.push("a.related_book_id = ?");
    params.push(filter.relatedBookId);
  }

  if (filter.featuredOnly) {
    conditions.push("a.is_featured = 1");
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const page = Math.max(1, filter.page || 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize || 12));
  const offset = (page - 1) * pageSize;

  const totalRow = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM articles a
      JOIN profiles p ON a.author_profile_id = p.id
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
    `)
    .get(...params) as { count: number };

  const rows = db
    .prepare(`
      SELECT a.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        p.headline as author_headline,
        u.role as author_role,
        c.name as category_name,
        c.slug as category_slug,
        i.title as issue_title,
        i.issue_number as issue_number
      FROM articles a
      JOIN profiles p ON a.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN editorial_issues i ON a.issue_id = i.id
      ${whereClause}
      ORDER BY a.is_cover_story DESC, a.is_featured DESC, COALESCE(a.published_at, a.created_at) DESC
      LIMIT ? OFFSET ?
    `)
    .all(...params, pageSize, offset) as Array<Record<string, unknown>>;

  return {
    items: rows.map((r) => {
      const art = mapArticleRow(r);
      art.tags = getEntityTagNames("article", art.id);
      return art;
    }),
    total: totalRow.count,
    page,
    pageSize,
  };
}

export function listUserArticles(ctx: AuthenticatedContext): Article[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT a.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        c.name as category_name,
        c.slug as category_slug
      FROM articles a
      JOIN profiles p ON a.author_profile_id = p.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.created_by_user_id = ? OR a.author_profile_id = ?
      ORDER BY a.updated_at DESC
    `)
    .all(ctx.user.id, ctx.profile.id) as Array<Record<string, unknown>>;

  return rows.map((r) => {
    const art = mapArticleRow(r);
    art.tags = getEntityTagNames("article", art.id);
    return art;
  });
}

export function listAllArticlesForStaff(ctx: AuthenticatedContext): Article[] {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT a.*,
        p.display_name as author_name,
        p.slug as author_slug,
        p.avatar_url as author_avatar,
        u.role as author_role,
        c.name as category_name,
        c.slug as category_slug
      FROM articles a
      JOIN profiles p ON a.author_profile_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.updated_at DESC
    `)
    .all() as Array<Record<string, unknown>>;

  return rows.map(mapArticleRow);
}

// =============================================================================
// 8. SUBMISSIONS & REVISIONS HELPERS
// =============================================================================

function getSubmissionByIdInternal(submissionId: string): Submission | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT s.*,
        p.display_name as author_name,
        p.slug as author_slug,
        rp.display_name as reviewer_name,
        CASE
          WHEN s.entity_type = 'book' THEN (SELECT title FROM books WHERE id = s.entity_id)
          ELSE (SELECT title FROM articles WHERE id = s.entity_id)
        END as entity_title,
        CASE
          WHEN s.entity_type = 'book' THEN (SELECT slug FROM books WHERE id = s.entity_id)
          ELSE (SELECT slug FROM articles WHERE id = s.entity_id)
        END as entity_slug
      FROM submissions s
      JOIN profiles p ON s.author_profile_id = p.id
      LEFT JOIN profiles rp ON s.reviewer_user_id = rp.user_id
      WHERE s.id = ?
    `)
    .get(submissionId) as Record<string, unknown> | undefined;

  if (!row) return null;
  return {
    id: String(row.id),
    entity_type: row.entity_type as "book" | "article",
    entity_id: String(row.entity_id),
    submitted_by_user_id: String(row.submitted_by_user_id),
    author_profile_id: String(row.author_profile_id),
    assigned_editor_id: row.assigned_editor_id ? String(row.assigned_editor_id) : null,
    reviewer_user_id: row.reviewer_user_id ? String(row.reviewer_user_id) : null,
    status: row.status as PublicationStatus,
    submission_notes: String(row.submission_notes || ""),
    internal_notes: String(row.internal_notes || ""),
    author_feedback: String(row.author_feedback || ""),
    decision_at: row.decision_at ? String(row.decision_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    entity_title: row.entity_title ? String(row.entity_title) : undefined,
    entity_slug: row.entity_slug ? String(row.entity_slug) : undefined,
    author_name: row.author_name ? String(row.author_name) : undefined,
    author_slug: row.author_slug ? String(row.author_slug) : undefined,
    reviewer_name: row.reviewer_name ? String(row.reviewer_name) : undefined,
  };
}

export function listUserSubmissions(ctx: AuthenticatedContext): Submission[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id FROM submissions WHERE submitted_by_user_id = ? ORDER BY updated_at DESC"
    )
    .all(ctx.user.id) as Array<{ id: string }>;

  return rows
    .map((r) => getSubmissionByIdInternal(r.id))
    .filter((s): s is Submission => Boolean(s))
    .map((s) => ({
      ...s,
      // Never expose internal editorial moderation notes to non-staff members
      internal_notes:
        ctx.user.role === "editor" || ctx.user.role === "admin" ? s.internal_notes : "",
    }));
}

export function listModerationQueue(ctx: AuthenticatedContext): Submission[] {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const rows = db
    .prepare("SELECT id FROM submissions ORDER BY updated_at DESC")
    .all() as Array<{ id: string }>;

  return rows
    .map((r) => getSubmissionByIdInternal(r.id))
    .filter((s): s is Submission => Boolean(s));
}

export function listRevisionsForEntity(
  ctx: AuthenticatedContext,
  entityType: "book" | "article",
  entityId: string
): ContentRevision[] {
  const db = getDb();
  if (entityType === "book") {
    const book = getBookByIdInternal(entityId);
    if (!book) throw new Error("NOT_FOUND");
    if (
      book.submitted_by_user_id !== ctx.user.id &&
      ctx.user.role !== "editor" &&
      ctx.user.role !== "admin"
    ) {
      throw new Error("FORBIDDEN");
    }
  } else {
    const art = getArticleByIdInternal(entityId);
    if (!art) throw new Error("NOT_FOUND");
    if (
      art.created_by_user_id !== ctx.user.id &&
      ctx.user.role !== "editor" &&
      ctx.user.role !== "admin"
    ) {
      throw new Error("FORBIDDEN");
    }
  }

  return db
    .prepare(
      "SELECT * FROM content_revisions WHERE entity_type = ? AND entity_id = ? ORDER BY version_number DESC"
    )
    .all(entityType, entityId) as unknown as ContentRevision[];
}

function syncEntityTags(
  entityType: "book" | "article",
  entityId: string,
  tagNames: string[]
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("DELETE FROM content_tags WHERE entity_type = ? AND entity_id = ?").run(
    entityType,
    entityId
  );

  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) continue;

    let tagRow = db
      .prepare("SELECT id FROM tags WHERE slug = ?")
      .get(slug) as { id: string } | undefined;

    if (!tagRow) {
      const newTagId = generateId();
      db.prepare("INSERT INTO tags (id, slug, name, created_at) VALUES (?, ?, ?, ?)").run(
        newTagId,
        slug,
        name,
        now
      );
      tagRow = { id: newTagId };
    }

    db.prepare(`
      INSERT OR IGNORE INTO content_tags (id, tag_id, entity_type, entity_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(generateId(), tagRow.id, entityType, entityId, now);
  }
}

function getEntityTagNames(entityType: "book" | "article", entityId: string): string[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT t.name
      FROM content_tags ct
      JOIN tags t ON ct.tag_id = t.id
      WHERE ct.entity_type = ? AND ct.entity_id = ?
      ORDER BY t.name ASC
    `)
    .all(entityType, entityId) as Array<{ name: string }>;
  return rows.map((r) => r.name);
}

