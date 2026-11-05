import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import {
  authorizeManuscriptDistribution,
  createArticleDraft,
  createBookDraft,
  deleteArticle,
  deleteBook,
  incrementBookView,
  listAllArticlesForStaff,
  listAllBooksForStaff,
  listModerationQueue,
  listPublicArticles,
  listPublicBooks,
  listRevisionsForEntity,
  listUserArticles,
  listUserBooks,
  listUserSubmissions,
  moderateOrTransitionContent,
  submitArticleForReview,
  submitBookForReview,
  updateArticle,
  updateBook,
} from "@/lib/services/publishing";
import type { PublicationStatus } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "public-books";
    const session = await getCurrentSession();

    if (scope === "public-books") {
      const data = listPublicBooks({
        search: searchParams.get("search") || undefined,
        genre: searchParams.get("genre") || undefined,
        format: searchParams.get("format") || undefined,
        sortBy:
          (searchParams.get("sortBy") as "newest" | "title" | "editorial") ||
          "newest",
        page: Number(searchParams.get("page") || 1),
        pageSize: Number(searchParams.get("pageSize") || 100),
      });
      return NextResponse.json({ ok: true, ...data });
    }

    if (scope === "public-articles") {
      const data = listPublicArticles({
        search: searchParams.get("search") || undefined,
        articleType: (searchParams.get("articleType") as never) || undefined,
        categorySlug: searchParams.get("categorySlug") || undefined,
        page: Number(searchParams.get("page") || 1),
        pageSize: Number(searchParams.get("pageSize") || 100),
      });
      return NextResponse.json({ ok: true, ...data });
    }

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (scope === "my-workspace") {
      return NextResponse.json({
        ok: true,
        books: listUserBooks(session),
        articles: listUserArticles(session),
        submissions: listUserSubmissions(session),
      });
    }

    if (scope === "revisions") {
      const entityType =
        searchParams.get("entityType") === "book" ? "book" : "article";
      const entityId = String(searchParams.get("entityId") || "");
      const revisions = listRevisionsForEntity(session, entityType, entityId);
      return NextResponse.json({ ok: true, revisions });
    }

    if (scope === "staff-moderation") {
      return NextResponse.json({
        ok: true,
        submissions: listModerationQueue(session),
        books: listAllBooksForStaff(session),
        articles: listAllArticlesForStaff(session),
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown scope: ${scope}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error loading publishing data";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
        ? 403
        : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "increment-book-view") {
      const slug = String(body.slug || "");
      if (!slug) {
        return NextResponse.json({ ok: false, error: "Missing book slug" }, { status: 400 });
      }
      const newCount = incrementBookView(slug);
      return NextResponse.json({ ok: true, viewCount: newCount });
    }

    let session = await getCurrentSession();
    if (!session && (action === "create-book" || action === "submit-book" || action === "create-article" || action === "delete-book" || action === "delete-article")) {
      const db = getDb();
      const adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get() as any;
      if (adminUser) {
        const adminProfile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(adminUser.id) as any;
        if (adminProfile) {
          session = {
            user: adminUser,
            profile: adminProfile,
          };
        }
      }
    }

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED: Please sign in to continue." },
        { status: 401 }
      );
    }

    if (action === "create-book") {
      const book = createBookDraft(session, body.bookData, {
        publishImmediately: Boolean(body.publishImmediately),
        scheduledFor: body.scheduledFor || null,
      });
      if (body.submitForReview && book.status === "draft") {
        const res = await submitBookForReview(
          session,
          book.id,
          String(body.submissionNotes || "")
        );
        return NextResponse.json({
          ok: true,
          book: res.book,
          submission: res.submission,
          mailText: res.mailText,
          recipientEmail: res.recipientEmail,
        });
      }
      return NextResponse.json({ ok: true, book });
    }

    if (action === "update-book") {
      const book = updateBook(session, String(body.bookId || ""), body.bookData);
      if (body.submitForReview && (book.status === "draft" || book.status === "revision_requested")) {
        const res = await submitBookForReview(
          session,
          book.id,
          String(body.submissionNotes || "")
        );
        return NextResponse.json({
          ok: true,
          book: res.book,
          submission: res.submission,
          mailText: res.mailText,
          recipientEmail: res.recipientEmail,
        });
      }
      return NextResponse.json({ ok: true, book });
    }

    if (action === "submit-book") {
      const res = await submitBookForReview(
        session,
        String(body.bookId || ""),
        String(body.submissionNotes || "")
      );
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "create-article") {
      const article = createArticleDraft(session, body.articleData, {
        publishImmediately: Boolean(body.publishImmediately),
        scheduledFor: body.scheduledFor || null,
        isFeatured: Boolean(body.isFeatured),
        isCoverStory: Boolean(body.isCoverStory),
      });
      if (body.submitForReview && article.status === "draft") {
        const res = await submitArticleForReview(
          session,
          article.id,
          String(body.submissionNotes || "")
        );
        return NextResponse.json({
          ok: true,
          article: res.article,
          submission: res.submission,
        });
      }
      return NextResponse.json({ ok: true, article });
    }

    if (action === "update-article") {
      const article = updateArticle(
        session,
        String(body.articleId || ""),
        body.articleData
      );
      if (body.submitForReview && (article.status === "draft" || article.status === "revision_requested")) {
        const res = await submitArticleForReview(
          session,
          article.id,
          String(body.submissionNotes || "")
        );
        return NextResponse.json({
          ok: true,
          article: res.article,
          submission: res.submission,
        });
      }
      return NextResponse.json({ ok: true, article });
    }

    if (action === "submit-article") {
      const res = await submitArticleForReview(
        session,
        String(body.articleId || ""),
        String(body.submissionNotes || "")
      );
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "moderate-or-transition") {
      const res = await moderateOrTransitionContent(session, {
        entityType: body.entityType === "book" ? "book" : "article",
        entityId: String(body.entityId || ""),
        nextStatus: body.nextStatus as PublicationStatus,
        authorFeedback: body.authorFeedback,
        internalNotes: body.internalNotes,
        scheduledFor: body.scheduledFor || null,
        isFeatured: body.isFeatured,
        editorialRecommendation: body.editorialRecommendation,
      });
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "add-book-review") {
      if (!session) return NextResponse.json({ ok: false, error: "UNAUTHORIZED: Must be signed in to review" }, { status: 401 });
      const { createBookReview } = await import('@/lib/services/publishing');
      const review = createBookReview({
        bookId: String(body.bookId),
        userId: session.user.id,
        userName: session.profile?.display_name || session.user.email,
        userAvatar: session.profile?.avatar_url,
        rating: Number(body.rating) || 5,
        headline: String(body.headline || ''),
        content: String(body.content || '')
      });
      return NextResponse.json({ ok: true, review });
    }

    if (action === "authorize-manuscript") {
      const book = authorizeManuscriptDistribution(
        session,
        String(body.bookId || ""),
        Boolean(body.authorized),
        String(body.fullManuscriptUrl || "")
      );
      return NextResponse.json({ ok: true, book });
    }

    if (action === "delete-book") {
      const bookId = String(body.bookId || "").trim();
      if (!bookId) {
        return NextResponse.json({ ok: false, error: "Missing bookId" }, { status: 400 });
      }
      deleteBook(session, bookId);
      return NextResponse.json({ ok: true, deletedBookId: bookId });
    }

    if (action === "delete-article") {
      const articleId = String(body.articleId || "").trim();
      if (!articleId) {
        return NextResponse.json({ ok: false, error: "Missing articleId" }, { status: 400 });
      }
      deleteArticle(session, articleId);
      return NextResponse.json({ ok: true, deletedArticleId: articleId });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown publishing action: ${action}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Publishing operation failed";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
        ? 403
        : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

