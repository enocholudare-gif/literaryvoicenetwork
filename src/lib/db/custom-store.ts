import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

export interface CustomContentData {
  books: any[];
  articles: any[];
  authors: any[];
  broadcasts: any[];
  enquiries: any[];
}

const STORE_PATH = path.join(process.cwd(), "src", "lib", "db", "custom-content.json");
const TMP_STORE_PATH = path.join("/tmp", "lvn-custom-content.json");

export function getCustomContent(): CustomContentData {
  const empty: CustomContentData = {
    books: [],
    articles: [],
    authors: [],
    broadcasts: [],
    enquiries: [],
  };

  // Try file paths
  for (const p of [STORE_PATH, TMP_STORE_PATH]) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          books: Array.isArray(parsed.books) ? parsed.books : [],
          articles: Array.isArray(parsed.articles) ? parsed.articles : [],
          authors: Array.isArray(parsed.authors) ? parsed.authors : [],
          broadcasts: Array.isArray(parsed.broadcasts) ? parsed.broadcasts : [],
          enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
        };
      }
    } catch {}
  }

  return empty;
}

export function saveCustomContent(data: Partial<CustomContentData>): void {
  const current = getCustomContent();
  const next: CustomContentData = {
    books: data.books ? data.books : current.books,
    articles: data.articles ? data.articles : current.articles,
    authors: data.authors ? data.authors : current.authors,
    broadcasts: data.broadcasts ? data.broadcasts : current.broadcasts,
    enquiries: data.enquiries ? data.enquiries : current.enquiries,
  };

  const jsonStr = JSON.stringify(next, null, 2);
  for (const p of [STORE_PATH, TMP_STORE_PATH]) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, jsonStr, "utf-8");
    } catch {}
  }
}

export function appendCustomBook(book: any): void {
  const current = getCustomContent();
  const filtered = current.books.filter(
    (b) => b.id !== book.id && b.slug !== book.slug && b.title.toLowerCase() !== book.title.toLowerCase()
  );
  saveCustomContent({ books: [book, ...filtered] });
}

export function appendCustomAuthor(author: any): void {
  const current = getCustomContent();
  const filtered = current.authors.filter(
    (a) => a.id !== author.id && a.slug !== author.slug && a.display_name.toLowerCase() !== author.display_name.toLowerCase()
  );
  saveCustomContent({ authors: [author, ...filtered] });
}

export function appendCustomArticle(article: any): void {
  const current = getCustomContent();
  const filtered = current.articles.filter(
    (a) => a.id !== article.id && a.slug !== article.slug && a.title.toLowerCase() !== article.title.toLowerCase()
  );
  saveCustomContent({ articles: [article, ...filtered] });
}

export function syncCustomContentToDb(db: DatabaseSync): void {
  const content = getCustomContent();
  const now = new Date().toISOString();

  // Sync authors
  for (const a of content.authors) {
    try {
      const authId = a.id || `profile-custom-${a.slug}`;
      const userId = a.user_id || `user-custom-${a.slug}`;
      db.prepare(`
        INSERT OR IGNORE INTO users (id, email, password_hash, role, email_verified, account_status, created_at, updated_at)
        VALUES (?, ?, 'N/A', 'author', 1, 'active', ?, ?)
      `).run(userId, `${a.slug}@literaryvoicenetwork.org`, now, now);

      db.prepare(`
        INSERT OR REPLACE INTO profiles (
          id, user_id, slug, display_name, pen_name, headline, bio, avatar_url,
          banner_url, location, website_url, genres_json, social_links_json,
          is_author_profile, is_featured, is_public, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?)
      `).run(
        authId,
        userId,
        a.slug,
        a.display_name,
        a.display_name,
        a.headline || "Featured Author",
        a.bio || "Contributing author at Literary Voices Network.",
        a.avatar_url || "/media/avatars/default-portrait.svg",
        "",
        a.location || "",
        a.website_url || "",
        JSON.stringify(a.genres || ["Editorial"]),
        JSON.stringify(a.social_links || {}),
        a.created_at || now,
        now
      );
    } catch {}
  }

  // Sync books
  for (const b of content.books) {
    try {
      db.prepare(`
        INSERT OR REPLACE INTO books (
          id, slug, author_profile_id, submitted_by_user_id, title, subtitle,
          isbn, description, excerpt, cover_url, genre, secondary_genres_json,
          format, publisher, publication_date, page_count, language,
          retailer_links_json, manuscript_distribution_authorized, full_manuscript_url,
          is_featured, editorial_recommendation, is_community_member_book,
          status, scheduled_for, published_at, seo_title, seo_description,
          created_at, updated_at, view_count, section
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        b.id,
        b.slug,
        b.author_profile_id || "profile-author-manikarnika",
        b.submitted_by_user_id || "user-admin-eleanor",
        b.title,
        b.subtitle || "",
        b.isbn || "",
        b.description || "",
        b.excerpt || "",
        b.cover_url || "/media/covers/the-first.jpg",
        b.genre || "Editorial",
        JSON.stringify(b.secondary_genres || ["Editorial", "Editorial Desk"]),
        b.format || "Hardcover",
        b.publisher || "LVN Imprint Editions",
        b.publication_date || now.slice(0, 10),
        b.page_count || 320,
        b.language || "English",
        JSON.stringify(b.retailer_links || {}),
        b.manuscript_distribution_authorized ? 1 : 0,
        b.full_manuscript_url || "",
        b.is_featured ? 1 : 0,
        b.editorial_recommendation ? 1 : 0,
        b.is_community_member_book ? 1 : 0,
        b.status || "published",
        b.scheduled_for || null,
        b.published_at || now,
        b.seo_title || b.title,
        b.seo_description || b.description,
        b.created_at || now,
        b.updated_at || now,
        b.view_count || 1200,
        b.section || "Editorial Desk"
      );
    } catch {}
  }
}
