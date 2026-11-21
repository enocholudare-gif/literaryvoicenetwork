import { Pool } from "pg";
import { getDb } from "./index";
import type { Book } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __lvnPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __lvnPgSchemaReady: boolean | undefined;
  // eslint-disable-next-line no-var
  var __lvnLastCloudSyncAt: number | undefined;
}

function getPostgresUrl(): string | null {
  const url =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    "";
  return url.trim() || null;
}

function getPool(): Pool | null {
  const url = getPostgresUrl();
  if (!url) return null;

  if (!globalThis.__lvnPgPool) {
    const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
    // Strip sslmode from query string so pg respects ssl: { rejectUnauthorized: false }
    // on Supabase / Vercel Postgres pooler URLs without self-signed cert errors.
    let cleanUrl = url;
    try {
      const parsed = new URL(url);
      parsed.searchParams.delete("sslmode");
      cleanUrl = parsed.toString();
    } catch {
      cleanUrl = url.replace(/([?&])sslmode=[^&]+(&|$)/i, "$1").replace(/[?&]$/, "");
    }

    globalThis.__lvnPgPool = new Pool({
      connectionString: cleanUrl,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
  return globalThis.__lvnPgPool;
}

async function ensureCloudTables(pool: Pool): Promise<void> {
  if (globalThis.__lvnPgSchemaReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lvn_cloud_books (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      data_json TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS lvn_cloud_deleted_books (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL DEFAULT '',
      deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  globalThis.__lvnPgSchemaReady = true;
}

/**
 * Persists a published/updated book to Supabase/PostgreSQL so every
 * serverless instance, phone, and laptop immediately sees it.
 */
export async function saveBookToCloud(book: Book): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  try {
    await ensureCloudTables(pool);
    const payload = JSON.stringify(book);
    await pool.query(
      `
      INSERT INTO lvn_cloud_books (id, slug, data_json, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        data_json = EXCLUDED.data_json,
        updated_at = NOW()
      `,
      [book.id, book.slug, payload]
    );
    await pool.query(`DELETE FROM lvn_cloud_deleted_books WHERE id = $1`, [book.id]);
    globalThis.__lvnLastCloudSyncAt = 0;
  } catch (err) {
    console.error("[pg-sync] Failed to save book to cloud:", err);
  }
}

/**
 * Records a book deletion in Supabase/PostgreSQL so deleted books
 * stay deleted across all serverless instances and devices.
 */
export async function deleteBookFromCloud(bookId: string, slug = ""): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  try {
    await ensureCloudTables(pool);
    await pool.query(`DELETE FROM lvn_cloud_books WHERE id = $1 OR ($2 <> '' AND slug = $2)`, [
      bookId,
      slug,
    ]);
    await pool.query(
      `
      INSERT INTO lvn_cloud_deleted_books (id, slug, deleted_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) DO NOTHING
      `,
      [bookId, slug]
    );
    globalThis.__lvnLastCloudSyncAt = 0;
  } catch (err) {
    console.error("[pg-sync] Failed to delete book from cloud:", err);
  }
}

/**
 * Syncs books and deletions from Supabase/PostgreSQL into the local
 * SQLite instance before rendering pages or returning API responses.
 */
export async function syncCloudBooksToLocalDb(force = false): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  const nowMs = Date.now();
  if (!force && globalThis.__lvnLastCloudSyncAt && nowMs - globalThis.__lvnLastCloudSyncAt < 2000) {
    return;
  }

  try {
    await ensureCloudTables(pool);
    const [booksRes, deletedRes] = await Promise.all([
      pool.query<{ id: string; slug: string; data_json: string }>(
        `SELECT id, slug, data_json FROM lvn_cloud_books`
      ),
      pool.query<{ id: string; slug: string }>(
        `SELECT id, slug FROM lvn_cloud_deleted_books`
      ),
    ]);

    const db = getDb();
    const nowIso = new Date().toISOString();

    for (const del of deletedRes.rows) {
      try {
        db.prepare(`DELETE FROM books WHERE id = ? OR (? <> '' AND slug = ?)`).run(
          del.id,
          del.slug || "",
          del.slug || ""
        );
      } catch {}
    }

    for (const row of booksRes.rows) {
      try {
        const b = JSON.parse(row.data_json) as Book & {
          author_bio?: string;
          section?: string;
        };
        if (!b || !b.id || !b.title) continue;

        const authorSlug = (b.author_slug || b.author_name || "author")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "author";
        const authorProfileId = b.author_profile_id || `profile-cloud-${authorSlug}`;
        const authorUserId = `user-cloud-${authorSlug}`;

        // Ensure author user & profile exist for foreign key integrity
        const existingProfile = db
          .prepare(`SELECT id FROM profiles WHERE id = ?`)
          .get(authorProfileId) as { id: string } | undefined;

        if (!existingProfile) {
          db.prepare(`
            INSERT OR IGNORE INTO users (
              id, email, password_hash, role, email_verified, account_status, created_at, updated_at
            ) VALUES (?, ?, 'N/A', 'author', 1, 'active', ?, ?)
          `).run(authorUserId, `${authorSlug}@literaryvoicenetwork.org`, nowIso, nowIso);

          db.prepare(`
            INSERT OR IGNORE INTO profiles (
              id, user_id, slug, display_name, pen_name, headline, bio, avatar_url,
              banner_url, location, website_url, genres_json, social_links_json,
              is_author_profile, is_featured, is_public, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', '', '', '[]', '{}', 1, 1, 1, ?, ?)
          `).run(
            authorProfileId,
            authorUserId,
            authorSlug,
            b.author_name || "Contributing Author",
            b.author_name || "Contributing Author",
            b.author_headline || "Contributing Author",
            b.author_bio || "Contributing author on Literary Voices Network.",
            b.author_avatar || "/media/avatars/default-portrait.svg",
            b.created_at || nowIso,
            b.updated_at || nowIso
          );
        }

        const submitterExists = b.submitted_by_user_id
          ? (db.prepare(`SELECT id FROM users WHERE id = ?`).get(b.submitted_by_user_id) as
              | { id: string }
              | undefined)
          : undefined;
        const submitterId = submitterExists?.id || "user-admin-eleanor";

        db.prepare(`
          INSERT INTO books (
            id, slug, author_profile_id, submitted_by_user_id, title, subtitle,
            isbn, description, excerpt, cover_url, genre, secondary_genres_json,
            format, publisher, publication_date, page_count, language,
            retailer_links_json, manuscript_distribution_authorized, full_manuscript_url,
            is_featured, editorial_recommendation, is_community_member_book,
            status, scheduled_for, published_at, seo_title, seo_description,
            created_at, updated_at, view_count, section
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            slug = excluded.slug,
            author_profile_id = excluded.author_profile_id,
            title = excluded.title,
            subtitle = excluded.subtitle,
            isbn = excluded.isbn,
            description = excluded.description,
            excerpt = excluded.excerpt,
            cover_url = excluded.cover_url,
            genre = excluded.genre,
            secondary_genres_json = excluded.secondary_genres_json,
            format = excluded.format,
            publisher = excluded.publisher,
            publication_date = excluded.publication_date,
            page_count = excluded.page_count,
            language = excluded.language,
            retailer_links_json = excluded.retailer_links_json,
            is_featured = excluded.is_featured,
            editorial_recommendation = excluded.editorial_recommendation,
            status = excluded.status,
            scheduled_for = excluded.scheduled_for,
            published_at = excluded.published_at,
            seo_title = excluded.seo_title,
            seo_description = excluded.seo_description,
            updated_at = excluded.updated_at,
            view_count = MAX(books.view_count, excluded.view_count),
            section = excluded.section
        `).run(
          b.id,
          b.slug,
          authorProfileId,
          submitterId,
          b.title,
          b.subtitle || "",
          b.isbn || "",
          b.description || "A featured literary work on the Literary Voices Network.",
          b.excerpt || "",
          b.cover_url || "/media/covers/the-first.jpg",
          b.genre || "Editorial",
          JSON.stringify(Array.isArray(b.secondary_genres) ? b.secondary_genres : [b.genre || "Editorial"]),
          b.format || "Hardcover",
          b.publisher || "LVN Imprint Editions",
          b.publication_date || "",
          b.page_count ?? null,
          b.language || "English",
          JSON.stringify(b.retailer_links || {}),
          b.manuscript_distribution_authorized ? 1 : 0,
          b.full_manuscript_url || "",
          b.is_featured ? 1 : 0,
          b.editorial_recommendation ? 1 : 0,
          b.is_community_member_book !== false ? 1 : 0,
          b.status || "published",
          b.scheduled_for || null,
          b.published_at || b.created_at || nowIso,
          b.seo_title || `${b.title} | Literary Voices Network`,
          b.seo_description || (b.description || "").slice(0, 160),
          b.created_at || nowIso,
          b.updated_at || nowIso,
          b.view_count ?? 1450,
          b.section || "Editorial Desk"
        );
      } catch (bookErr) {
        console.error("[pg-sync] Failed to sync single book:", bookErr);
      }
    }

    globalThis.__lvnLastCloudSyncAt = Date.now();
  } catch (err) {
    console.error("[pg-sync] Failed to sync books from cloud:", err);
  }
}
