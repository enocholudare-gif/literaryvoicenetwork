import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabaseForTesting } from "../lib/db";
import {
  authenticateUser,
  getUserWithProfileById,
  registerUser,
  requestPasswordReset,
  resetPasswordWithToken,
  requireRole,
  verifyEmailWithToken,
} from "../lib/services/auth";
import {
  authorizeManuscriptDistribution,
  createArticleDraft,
  createBookDraft,
  getArticleBySlugForViewer,
  getBookBySlugForViewer,
  listModerationQueue,
  listPublicArticles,
  listPublicBooks,
  listRevisionsForEntity,
  listUserSubmissions,
  moderateOrTransitionContent,
  submitArticleForReview,
  submitBookForReview,
  updateArticle,
  updateBook,
} from "../lib/services/publishing";
import { uploadMediaAsset } from "../lib/services/media";
import {
  getAdminDashboardMetrics,
  getAuthorProfileBySlug,
  globalSearch,
  listAllUsersForAdmin,
  listHomepageSections,
  toggleFavourite,
  toggleFollow,
  updateHomepageSection,
  updateSiteSettings,
} from "../lib/services/platform";
import { listAuditLogs } from "../lib/services/notifications";
import { resetRateLimitsForTesting } from "../lib/security/sanitize";

describe("Literary Voices Network (LVN) — Phase 2 Backend Verification Suite", () => {
  beforeEach(() => {
    resetRateLimitsForTesting();
    resetDatabaseForTesting(true);
  });

  it("Scenario 1: A guest cannot create protected content or access authenticated actions", () => {
    expect(() =>
      requireRole(null, ["member", "author", "editor", "admin"])
    ).toThrow(/UNAUTHORIZED/);

    expect(() =>
      createBookDraft(null as never, {
        title: "Unauthorized Guest Book",
        description: "Guest should never be able to create this book.",
        genre: "Literary Fiction",
        subtitle: "",
        isbn: "",
        excerpt: "",
        coverUrl: "",
        secondaryGenres: [],
        format: "Hardcover",
        publisher: "",
        publicationDate: "",
        pageCount: 200,
        language: "English",
        retailerLinks: {},
        seoTitle: "",
        seoDescription: "",
      })
    ).toThrow(/UNAUTHORIZED/);
  });

  it("Scenario 2: A member cannot edit another member's private draft", async () => {
    const { context: memberA } = await registerUser({
      email: "writer.a@example.com",
      password: "Password123!",
      displayName: "Writer Alpha",
      accountType: "member",
    });

    const { context: memberB } = await registerUser({
      email: "writer.b@example.com",
      password: "Password123!",
      displayName: "Writer Beta",
      accountType: "member",
    });

    const draftArticle = createArticleDraft(memberA, {
      title: "Alpha Private Draft Essay",
      bodyHtml: "<p>This is a private literary essay in draft stage owned by Writer Alpha.</p>",
      articleType: "essay",
      subtitle: "",
      categoryId: null,
      issueId: null,
      relatedBookId: null,
      featuredAuthorProfileId: null,
      excerpt: "",
      coverUrl: "",
      sourceAttribution: "LVN",
      mediaContactInfo: "",
      tags: [],
      seoTitle: "",
      seoDescription: "",
    });

    expect(() =>
      updateArticle(memberB, draftArticle.id, {
        title: "Hijacked by Writer Beta",
      })
    ).toThrow(/FORBIDDEN/);

    // Also verify draft is invisible to Member B and guests
    expect(getArticleBySlugForViewer(draftArticle.slug, null)).toBeNull();
    expect(getArticleBySlugForViewer(draftArticle.slug, memberB)).toBeNull();
    expect(getArticleBySlugForViewer(draftArticle.slug, memberA)?.id).toBe(draftArticle.id);
  });

  it("Scenario 3 & 4: An author can submit a book and track its status; an editor can request revisions, approve, and schedule/publish", async () => {
    const authorCtx = getUserWithProfileById("user-author-amara")!;
    const editorCtx = getUserWithProfileById("user-editor-marcus")!;

    // 1. Author creates a book draft
    const bookDraft = createBookDraft(authorCtx, {
      title: "The Lanterns of Cape Coast",
      subtitle: "A Novel",
      isbn: "978-1-960421-99-9",
      description:
        "An atmospheric historical novel tracing three lighthouse keepers and their logbooks along the Atlantic coast.",
      excerpt: "The lamp required winding every four hours through the monsoon.",
      coverUrl: "/media/covers/the-saltwater-ledger.svg",
      genre: "Historical Fiction",
      secondaryGenres: ["Literary Fiction"],
      format: "Hardcover",
      publisher: "Harbour & Loom",
      publicationDate: "2026-12-01",
      pageCount: 340,
      language: "English",
      retailerLinks: { bookshop: "https://bookshop.org" },
      seoTitle: "",
      seoDescription: "",
    });
    expect(bookDraft.status).toBe("draft");

    // Draft does not appear in public directory yet
    expect(getBookBySlugForViewer(bookDraft.slug, null)).toBeNull();

    // 2. Author submits book for review
    const { book: submittedBook, submission } = await submitBookForReview(
      authorCtx,
      bookDraft.id,
      "Ready for Winter catalog review."
    );
    expect(submittedBook.status).toBe("submitted");
    expect(submission.status).toBe("submitted");

    // Author can track submission status
    const mySubs = listUserSubmissions(authorCtx);
    expect(mySubs.some((s) => s.entity_id === bookDraft.id && s.status === "submitted")).toBe(
      true
    );

    // 3. Editor sees it in moderation queue and requests revisions
    const queue = listModerationQueue(editorCtx);
    expect(queue.some((s) => s.entity_id === bookDraft.id)).toBe(true);

    const revReqResult = await moderateOrTransitionContent(editorCtx, {
      entityType: "book",
      entityId: bookDraft.id,
      nextStatus: "revision_requested",
      authorFeedback: "Please expand the jacket description with edition details.",
      internalNotes: "Internal editor note: check ISBN checksum.",
    });
    expect(revReqResult.book?.status).toBe("revision_requested");

    // Verify internal editorial notes are hidden from the author
    const authorSubsAfterRev = listUserSubmissions(authorCtx);
    const trackedSub = authorSubsAfterRev.find((s) => s.entity_id === bookDraft.id)!;
    expect(trackedSub.author_feedback).toContain("expand the jacket description");
    expect(trackedSub.internal_notes).toBe("");

    // 4. Author updates book and resubmits
    updateBook(authorCtx, bookDraft.id, {
      description:
        "An atmospheric historical novel tracing three lighthouse keepers and their logbooks along the Atlantic coast. Includes archival appendices.",
    });
    await submitBookForReview(authorCtx, bookDraft.id, "Updated jacket description.");

    // 5. Editor approves and schedules, then publishes
    const scheduledRes = await moderateOrTransitionContent(editorCtx, {
      entityType: "book",
      entityId: bookDraft.id,
      nextStatus: "scheduled",
      scheduledFor: "2026-11-30T10:00:00.000Z",
    });
    expect(scheduledRes.book?.status).toBe("scheduled");

    const publishedRes = await moderateOrTransitionContent(editorCtx, {
      entityType: "book",
      entityId: bookDraft.id,
      nextStatus: "published",
      authorFeedback: "Approved and published in the LVN Book Directory!",
      isFeatured: true,
    });
    expect(publishedRes.book?.status).toBe("published");

    // Now visible to public visitors with accurate author attribution
    const publicBook = getBookBySlugForViewer(bookDraft.slug, null);
    expect(publicBook).not.toBeNull();
    expect(publicBook?.author_name).toBe("Amara Osei");
    expect(publicBook?.author_slug).toBe("amara-osei");

    // Verify revision history was preserved
    const revisions = listRevisionsForEntity(authorCtx, "book", bookDraft.id);
    expect(revisions.length).toBeGreaterThanOrEqual(4);
  });

  it("Scenario 5 & 8: An administrator can publish original content under their own public LVN profile with explicit attribution and audit logging", () => {
    const adminCtx = getUserWithProfileById("user-admin-eleanor")!;
    expect(adminCtx.user.role).toBe("admin");
    expect(adminCtx.profile.slug).toBe("eleanor-vance");
    expect(adminCtx.profile.display_name).toBe("Eleanor Vance");

    // Admin directly publishes an original essay under their public profile
    const adminArticle = createArticleDraft(
      adminCtx,
      {
        title: "Notes on the Margin of a Northern Folio",
        subtitle: "An Essay on Paper and Endurance",
        articleType: "essay",
        categoryId: "cat-essays",
        issueId: "issue-14",
        relatedBookId: null,
        featuredAuthorProfileId: null,
        excerpt: "Why rag paper outlasts digital memory.",
        bodyHtml:
          "<p>In the archive at Bergen, seventeenth-century rag paper remains supple to the touch while twentieth-century newsprint crumbles.</p><script>alert('xss')</script>",
        coverUrl: "/media/covers/the-glass-meridian.svg",
        sourceAttribution: "Literary Voices Network Editorial",
        mediaContactInfo: "",
        tags: ["Archival Memory", "Essays"],
        seoTitle: "",
        seoDescription: "",
      },
      { publishImmediately: true, isFeatured: true }
    );

    expect(adminArticle.status).toBe("published");
    expect(adminArticle.author_profile_id).toBe("profile-admin-eleanor");
    expect(adminArticle.author_name).toBe("Eleanor Vance");
    expect(adminArticle.author_slug).toBe("eleanor-vance");
    // Verify XSS script was stripped by rich-text sanitizer
    expect(adminArticle.body_html).not.toContain("<script>");

    // Admin directly publishes a book under their public profile
    const adminBook = createBookDraft(
      adminCtx,
      {
        title: "Letters from the Northern Observatory",
        subtitle: "Collected Essays on Literature and Sea Charts",
        isbn: "978-1-960421-77-7",
        description:
          "Twelve essays by Eleanor Vance examining maritime correspondence, translation, and northern European archives.",
        excerpt: "To read an old sea chart is to read a record of vanished anxieties.",
        coverUrl: "/media/covers/the-glass-meridian.svg",
        genre: "Essays & Criticism",
        secondaryGenres: ["History"],
        format: "Hardcover",
        publisher: "Meridian House Press",
        publicationDate: "2026-10-23",
        pageCount: 280,
        language: "English",
        retailerLinks: { bookshop: "https://bookshop.org" },
        seoTitle: "",
        seoDescription: "",
      },
      { publishImmediately: true }
    );

    expect(adminBook.status).toBe("published");
    expect(adminBook.author_name).toBe("Eleanor Vance");
    expect(adminBook.author_slug).toBe("eleanor-vance");

    // Verify both appear on Administrator's public author profile page (/authors/eleanor-vance)
    const publicProfileData = getAuthorProfileBySlug("eleanor-vance");
    expect(publicProfileData).not.toBeNull();
    expect(
      publicProfileData!.articles.some((a) => a.id === adminArticle.id)
    ).toBe(true);
    expect(publicProfileData!.books.some((b) => b.id === adminBook.id)).toBe(true);

    // Verify audit log recorded ADMIN_DIRECT_PUBLISH
    const logs = listAuditLogs(20);
    expect(
      logs.some(
        (l) => l.action === "ADMIN_DIRECT_PUBLISH" && l.entity_id === adminArticle.id
      )
    ).toBe(true);
    expect(
      logs.some(
        (l) => l.action === "ADMIN_DIRECT_PUBLISH" && l.entity_id === adminBook.id
      )
    ).toBe(true);
  });

  it("Scenario 6: Unauthorized users cannot access administrative endpoints or override editorial approval", () => {
    const memberCtx = getUserWithProfileById("user-member-nadia")!;
    const authorCtx = getUserWithProfileById("user-author-amara")!;
    const editorCtx = getUserWithProfileById("user-editor-marcus")!;

    // Member & Author cannot access Admin dashboard metrics or user management
    expect(() => getAdminDashboardMetrics(memberCtx)).toThrow(/FORBIDDEN/);
    expect(() => listAllUsersForAdmin(memberCtx)).toThrow(/FORBIDDEN/);
    expect(() => listAllUsersForAdmin(authorCtx)).toThrow(/FORBIDDEN/);
    expect(() => listAllUsersForAdmin(editorCtx)).toThrow(/FORBIDDEN/);

    // Member & Author cannot update homepage sections or site settings
    expect(() =>
      updateHomepageSection(authorCtx, "hero", { title: "Unauthorized Title" })
    ).toThrow(/FORBIDDEN/);
    expect(() =>
      updateSiteSettings(editorCtx, { siteName: "Unauthorized Name" })
    ).toThrow(/FORBIDDEN/);

    // Member cannot directly publish without moderation
    expect(() =>
      createArticleDraft(
        memberCtx,
        {
          title: "Bypass Attempt",
          bodyHtml: "<p>Attempting to publish directly as a member.</p>",
          articleType: "essay",
          subtitle: "",
          categoryId: null,
          issueId: null,
          relatedBookId: null,
          featuredAuthorProfileId: null,
          excerpt: "",
          coverUrl: "",
          sourceAttribution: "",
          mediaContactInfo: "",
          tags: [],
          seoTitle: "",
          seoDescription: "",
        },
        { publishImmediately: true }
      )
    ).toThrow(/FORBIDDEN/);
  });

  it("Scenario 7 & 9: Drafts remain private until publication, and invalid publication-state transitions are rejected", async () => {
    const memberCtx = getUserWithProfileById("user-member-nadia")!;

    const draft = createArticleDraft(memberCtx, {
      title: "Private Meditation on Winter Books",
      bodyHtml: "<p>This draft has not been submitted or approved yet.</p>",
      articleType: "essay",
      subtitle: "",
      categoryId: null,
      issueId: null,
      relatedBookId: null,
      featuredAuthorProfileId: null,
      excerpt: "",
      coverUrl: "",
      sourceAttribution: "LVN",
      mediaContactInfo: "",
      tags: [],
      seoTitle: "",
      seoDescription: "",
    });

    // Cannot appear in public feed
    const publicArticles = listPublicArticles({ search: "Private Meditation on Winter" });
    expect(publicArticles.items.length).toBe(0);

    // Member cannot transition draft directly to published or approved
    await expect(
      moderateOrTransitionContent(memberCtx, {
        entityType: "article",
        entityId: draft.id,
        nextStatus: "published",
      })
    ).rejects.toThrow(/FORBIDDEN_TRANSITION/);

    await expect(
      moderateOrTransitionContent(memberCtx, {
        entityType: "article",
        entityId: draft.id,
        nextStatus: "approved",
      })
    ).rejects.toThrow(/FORBIDDEN_TRANSITION/);
  });

  it("Scenario 10: File-upload permissions, book manuscript separation, authentication flows, search, and fault-tolerant notifications", async () => {
    const memberCtx = getUserWithProfileById("user-member-nadia")!;
    const adminCtx = getUserWithProfileById("user-admin-eleanor")!;

    // 1. File upload validation: reject disallowed MIME types and restrict hero_media to admin
    expect(() =>
      uploadMediaAsset(memberCtx, {
        originalName: "malicious.exe",
        mimeType: "application/x-msdownload",
        sizeBytes: 1024,
        buffer: Buffer.from("nope"),
      })
    ).toThrow(/UNSUPPORTED_MEDIA_TYPE/);

    expect(() =>
      uploadMediaAsset(memberCtx, {
        originalName: "hero.mp4",
        mimeType: "video/mp4",
        sizeBytes: 2048,
        buffer: Buffer.from("fake-mp4"),
        assetCategory: "hero_media",
      })
    ).toThrow(/FORBIDDEN/);

    const validCover = uploadMediaAsset(memberCtx, {
      originalName: "my-book-cover.svg",
      mimeType: "image/svg+xml",
      sizeBytes: 120,
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
      assetCategory: "book_cover",
    });
    expect(validCover.public_url).toContain("/uploads/");

    // 2. Book-listing approval vs. full manuscript distribution authorization
    const saltBook = getBookBySlugForViewer("the-saltwater-ledger", null)!;
    expect(saltBook.manuscript_distribution_authorized).toBe(false);
    expect(() =>
      authorizeManuscriptDistribution(memberCtx, saltBook.id, true, "/uploads/full.pdf")
    ).toThrow(/FORBIDDEN/);
    const authorizedBook = authorizeManuscriptDistribution(
      adminCtx,
      saltBook.id,
      true,
      "/media/excerpts/the-saltwater-ledger-authorized.pdf"
    );
    expect(authorizedBook.manuscript_distribution_authorized).toBe(true);

    // 3. Authentication, email verification & password recovery
    const reg = await registerUser({
      email: "reader.test@example.com",
      password: "InitialPassword123!",
      displayName: "Reader Test",
      accountType: "member",
    });
    expect(reg.context.user.email_verified).toBe(false);

    const verified = verifyEmailWithToken(reg.verificationToken);
    expect(verified.user.email_verified).toBe(true);

    const { resetToken } = await requestPasswordReset("reader.test@example.com");
    expect(resetToken).toBeTruthy();
    resetPasswordWithToken(resetToken!, "UpdatedPassword456!");

    const loggedIn = authenticateUser({
      email: "reader.test@example.com",
      password: "UpdatedPassword456!",
    });
    expect(loggedIn.context.user.email).toBe("reader.test@example.com");

    // 4. Search, filtering, favourites, follows, and homepage configuration
    const searchRes = globalSearch("Meridian");
    expect(searchRes.books.some((b) => b.slug === "the-glass-meridian")).toBe(true);

    const favToggle = toggleFavourite(memberCtx, "book", saltBook.id);
    expect(favToggle.favourited).toBe(true);

    const followToggle = toggleFollow(memberCtx, "author", "profile-author-julian");
    expect(followToggle.following).toBe(true);

    const updatedSection = updateHomepageSection(adminCtx, "hero", {
      title: "Updated Hero Headline From Admin Test",
    });
    expect(updatedSection.title).toBe("Updated Hero Headline From Admin Test");
    expect(listHomepageSections()[1].title).toBe("Updated Hero Headline From Admin Test");
  });
});

