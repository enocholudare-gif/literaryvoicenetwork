"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Feather,
  FileText,
  Heading2,
  History,
  List,
  MessageSquare,
  Plus,
  Quote,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Cards";
import type {
  Article,
  ArticleType,
  Book,
  BookFormat,
  Category,
  ContentRevision,
  EditorialIssue,
  EventRegistration,
  Pitch,
  Profile,
  Submission,
  User as UserModel,
} from "@/lib/db/types";

type DashboardTab =
  | "overview"
  | "books"
  | "publications"
  | "profile"
  | "library"
  | "pitches"
  | "events"
  | "settings";

function MemberDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as DashboardTab) || "overview";

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Omit<UserModel, "password_hash"> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [favBooks, setFavBooks] = useState<Book[]>([]);
  const [favArticles, setFavArticles] = useState<Article[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [issues, setIssues] = useState<EditorialIssue[]>([]);

  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Book Form State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookSubtitle, setBookSubtitle] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookGenre, setBookGenre] = useState("Literary Fiction");
  const [bookFormat, setBookFormat] = useState<BookFormat>("Hardcover");
  const [bookPublisher, setBookPublisher] = useState("");
  const [bookPublicationDate, setBookPublicationDate] = useState("2026-10-15");
  const [bookPageCount, setBookPageCount] = useState<number>(320);
  const [bookCoverUrl, setBookCoverUrl] = useState("/media/covers/the-glass-meridian.svg");
  const [bookDescription, setBookDescription] = useState("");
  const [bookExcerpt, setBookExcerpt] = useState("");
  const [bookBookshopUrl, setBookBookshopUrl] = useState("");
  const [bookAmazonUrl, setBookAmazonUrl] = useState("");
  const [bookSubmissionNotes, setBookSubmissionNotes] = useState("");

  // Article Rich-Text Studio State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleSubtitle, setArticleSubtitle] = useState("");
  const [articleType, setArticleType] = useState<ArticleType>("essay");
  const [articleCategoryId, setArticleCategoryId] = useState<string>("");
  const [articleIssueId, setArticleIssueId] = useState<string>("");
  const [articleExcerpt, setArticleExcerpt] = useState("");
  const [articleBodyHtml, setArticleBodyHtml] = useState(
    "<p class=\"lead\">Begin your essay, story, or critical review here...</p>\n<h2>Section I</h2>\n<p>Develop your argument or narrative with clarity and rhythm.</p>"
  );
  const [articleCoverUrl, setArticleCoverUrl] = useState("/media/banners/editorial-desk.svg");
  const [articleTags, setArticleTags] = useState("literary criticism, craft");
  const [articleSubmissionNotes, setArticleSubmissionNotes] = useState("");
  const [previewArticleMode, setPreviewArticleMode] = useState(false);

  // Revisions Modal State
  const [revisionsList, setRevisionsList] = useState<ContentRevision[]>([]);
  const [revisionsModalTitle, setRevisionsModalTitle] = useState("");

  // Profile Editor State
  const [profDisplayName, setProfDisplayName] = useState("");
  const [profPenName, setProfPenName] = useState("");
  const [profHeadline, setProfHeadline] = useState("");
  const [profBio, setProfBio] = useState("");
  const [profLocation, setProfLocation] = useState("");
  const [profWebsite, setProfWebsite] = useState("");
  const [profAvatarUrl, setProfAvatarUrl] = useState("");
  const [profGenres, setProfGenres] = useState("");
  const [profIsAuthor, setProfIsAuthor] = useState(true);

  // Pitch Form State
  const [pitchType, setPitchType] = useState<Pitch["pitch_type"]>("interview");
  const [pitchTitle, setPitchTitle] = useState("");
  const [pitchSummary, setPitchSummary] = useState("");
  const [pitchIssueId, setPitchIssueId] = useState("");
  const [pitchProposedDate, setPitchProposedDate] = useState("2026-11-25");

  // Account Deletion State
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();
      if (!authData.authenticated) {
        router.push("/auth?mode=login");
        return;
      }
      setUser(authData.user);
      setProfile(authData.profile);

      if (authData.profile) {
        setProfDisplayName(authData.profile.display_name || "");
        setProfPenName(authData.profile.pen_name || "");
        setProfHeadline(authData.profile.headline || "");
        setProfBio(authData.profile.bio || "");
        setProfLocation(authData.profile.location || "");
        setProfWebsite(authData.profile.website_url || "");
        setProfAvatarUrl(
          authData.profile.avatar_url || "/media/avatars/eleanor-vance.svg"
        );
        setProfGenres((authData.profile.genres || []).join(", "));
        setProfIsAuthor(Boolean(authData.profile.is_author_profile));
      }

      const [pubRes, libRes, cfgRes] = await Promise.all([
        fetch("/api/publishing?scope=my-workspace"),
        fetch("/api/platform?scope=member-library"),
        fetch("/api/platform?scope=public-config"),
      ]);

      const pubData = await pubRes.json();
      if (pubData.ok) {
        setBooks(pubData.books || []);
        setArticles(pubData.articles || []);
        setSubmissions(pubData.submissions || []);
      }

      const libData = await libRes.json();
      if (libData.ok) {
        setFavBooks(libData.favourites?.books || []);
        setFavArticles(libData.favourites?.articles || []);
        setFollowedAuthors(libData.follows?.authors || []);
        setPitches(libData.pitches || []);
        setEventRegistrations(libData.eventRegistrations || []);
      }

      const cfgData = await cfgRes.json();
      if (cfgData.ok) {
        setCategories(cfgData.categories || []);
        setIssues(cfgData.issues || []);
      }
    } catch {
      setFeedbackBanner({
        type: "error",
        text: "Failed to load studio workspace data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  const handleFileUpload = async (
    file: File,
    category: "book_cover" | "author_portrait" | "article_cover",
    onUploaded: (url: string) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const res = await fetch("/api/media", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: "error",
        text: data.error || "File upload failed.",
      });
      return;
    }
    onUploaded(data.asset.public_url);
    setFeedbackBanner({
      type: "success",
      text: `Uploaded ${file.name} (${data.asset.public_url})`,
    });
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setBookTitle("");
    setBookSubtitle("");
    setBookIsbn("");
    setBookGenre("Literary Fiction");
    setBookFormat("Hardcover");
    setBookPublisher("");
    setBookDescription("");
    setBookExcerpt("");
    setBookBookshopUrl("");
    setBookAmazonUrl("");
    setBookSubmissionNotes("");
  };

  const loadBookIntoForm = (b: Book) => {
    setEditingBookId(b.id);
    setBookTitle(b.title);
    setBookSubtitle(b.subtitle || "");
    setBookIsbn(b.isbn || "");
    setBookGenre(b.genre || "Literary Fiction");
    setBookFormat(b.format || "Hardcover");
    setBookPublisher(b.publisher || "");
    setBookPublicationDate(b.publication_date || "2026-10-15");
    setBookPageCount(b.page_count || 300);
    setBookCoverUrl(b.cover_url || "/media/covers/the-glass-meridian.svg");
    setBookDescription(b.description || "");
    setBookExcerpt(b.excerpt || "");
    setBookBookshopUrl(b.retailer_links?.bookshop || "");
    setBookAmazonUrl(b.retailer_links?.amazon || "");
    setActiveTab("books");
  };

  const handleSaveBook = async (
    submitForReview: boolean,
    publishImmediately = false
  ) => {
    setFeedbackBanner(null);
    const payload = {
      action: editingBookId ? "update-book" : "create-book",
      bookId: editingBookId,
      submitForReview,
      publishImmediately,
      submissionNotes: bookSubmissionNotes,
      bookData: {
        title: bookTitle,
        subtitle: bookSubtitle,
        isbn: bookIsbn,
        genre: bookGenre,
        format: bookFormat,
        publisher: bookPublisher,
        publicationDate: bookPublicationDate,
        pageCount: Number(bookPageCount) || 300,
        coverUrl: bookCoverUrl,
        description: bookDescription,
        excerpt: bookExcerpt,
        retailerLinks: {
          bookshop: bookBookshopUrl,
          amazon: bookAmazonUrl,
        },
      },
    };

    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: "error",
        text: data.error || "Could not save book.",
      });
      return;
    }

    setFeedbackBanner({
      type: "success",
      text: publishImmediately
        ? `Book "${data.book.title}" published directly under your public profile (${profile?.display_name})!`
        : submitForReview
        ? `Book "${data.book.title}" submitted to the LVN editorial board for review!`
        : `Draft saved for "${data.book.title}".`,
    });
    resetBookForm();
    loadWorkspaceData();
  };

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArticleTitle("");
    setArticleSubtitle("");
    setArticleType("essay");
    setArticleExcerpt("");
    setArticleBodyHtml(
      "<p class=\"lead\">Begin your essay, story, or critical review here...</p>\n<h2>Section I</h2>\n<p>Develop your argument or narrative with clarity and rhythm.</p>"
    );
    setArticleSubmissionNotes("");
  };

  const loadArticleIntoForm = (a: Article) => {
    setEditingArticleId(a.id);
    setArticleTitle(a.title);
    setArticleSubtitle(a.subtitle || "");
    setArticleType(a.article_type);
    setArticleCategoryId(a.category_id || "");
    setArticleIssueId(a.issue_id || "");
    setArticleExcerpt(a.excerpt || "");
    setArticleBodyHtml(a.body_html || "");
    setArticleCoverUrl(a.cover_url || "/media/banners/editorial-desk.svg");
    setArticleTags((a.tags || []).join(", "));
    setActiveTab("publications");
  };

  const insertHtmlSnippet = (snippet: string) => {
    setArticleBodyHtml((prev) => `${prev}\n${snippet}`);
  };

  const handleSaveArticle = async (
    submitForReview: boolean,
    publishImmediately = false
  ) => {
    setFeedbackBanner(null);
    const payload = {
      action: editingArticleId ? "update-article" : "create-article",
      articleId: editingArticleId,
      submitForReview,
      publishImmediately,
      submissionNotes: articleSubmissionNotes,
      articleData: {
        title: articleTitle,
        subtitle: articleSubtitle,
        articleType,
        categoryId: articleCategoryId || null,
        issueId: articleIssueId || null,
        excerpt: articleExcerpt,
        bodyHtml: articleBodyHtml,
        coverUrl: articleCoverUrl,
        tags: articleTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
    };

    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: "error",
        text: data.error || "Could not save publication.",
      });
      return;
    }

    setFeedbackBanner({
      type: "success",
      text: publishImmediately
        ? `Publication "${data.article.title}" published directly under your public profile!`
        : submitForReview
        ? `Publication "${data.article.title}" submitted for editorial review!`
        : `Draft saved for "${data.article.title}".`,
    });
    resetArticleForm();
    loadWorkspaceData();
  };

  const handleViewRevisions = async (
    entityType: "book" | "article",
    entityId: string,
    title: string
  ) => {
    const res = await fetch(
      `/api/publishing?scope=revisions&entityType=${entityType}&entityId=${entityId}`
    );
    const data = await res.json();
    if (data.ok) {
      setRevisionsList(data.revisions || []);
      setRevisionsModalTitle(title);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackBanner(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-profile",
        profileData: {
          displayName: profDisplayName,
          penName: profPenName,
          headline: profHeadline,
          bio: profBio,
          location: profLocation,
          websiteUrl: profWebsite,
          avatarUrl: profAvatarUrl,
          genres: profGenres
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
          isAuthorProfile: profIsAuthor,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: "error",
        text: data.error || "Failed to update profile.",
      });
      return;
    }
    setProfile(data.profile);
    setFeedbackBanner({
      type: "success",
      text: "Public LVN Author Profile updated!",
    });
  };

  const handleSubmitPitch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackBanner(null);
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit-pitch",
        pitchData: {
          pitchType,
          title: pitchTitle,
          summary: pitchSummary,
          issueId: pitchIssueId || null,
          proposedDate: pitchProposedDate,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: "error",
        text: data.error || "Failed to submit pitch.",
      });
      return;
    }
    setPitchTitle("");
    setPitchSummary("");
    setFeedbackBanner({
      type: "success",
      text: "Editorial pitch submitted to the commissioning desk!",
    });
    loadWorkspaceData();
  };

  const handleDeleteAccount = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete-account",
        confirmationText: deleteConfirmText,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: "error",
        text: data.error || "Account deletion requires typing DELETE MY ACCOUNT.",
      });
      return;
    }
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-12 text-sm text-[#080808]">
        Loading your Literary Voices Network Studio...
      </div>
    );
  }

  const isStaff = user?.role === "admin" || user?.role === "editor";

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Studio Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-10 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatar_url || "/media/avatars/eleanor-vance.svg"}
                alt={profile?.display_name || "Profile"}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#080808]">
                    {user?.role} Studio
                  </span>
                  <span className="text-xs text-[#F7DF8B]">
                    {user?.email}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  {profile?.display_name} — Author & Member Workspace
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {profile?.slug && (
                <Link
                  href={`/authors/${profile.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#F7DF8B] text-xs font-semibold hover:bg-white/5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Public Author Profile
                </Link>
              )}
              {isStaff && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] text-xs font-bold hover:bg-[#F7DF8B]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Editorial & Admin Console
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-5">
            {(
              [
                { id: "overview", label: "Overview & Queue", icon: Sparkles },
                { id: "books", label: `My Books (${books.length})`, icon: BookOpen },
                {
                  id: "publications",
                  label: `Rich-Text Studio (${articles.length})`,
                  icon: Feather,
                },
                { id: "profile", label: "Public Profile", icon: User },
                { id: "pitches", label: `Pitches (${pitches.length})`, icon: MessageSquare },
                {
                  id: "library",
                  label: `Saved Library (${favBooks.length + favArticles.length})`,
                  icon: Bookmark,
                },
                {
                  id: "events",
                  label: `Event RSVPs (${eventRegistrations.length})`,
                  icon: Calendar,
                },
                { id: "settings", label: "Account Settings", icon: Settings },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === t.id
                      ? "bg-[#D4AF37] text-[#080808] font-bold shadow-md"
                      : "bg-[#141414] text-[#FAF8F3]/80 hover:text-white border border-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {feedbackBanner && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
              feedbackBanner.type === "success"
                ? "bg-amber-950 text-emerald-100 border-amber-500/40"
                : "bg-rose-950 text-rose-100 border-rose-500/40"
            }`}
          >
            <span>{feedbackBanner.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#080808]/12">
                <span className="text-xs text-[#080808]/60">My Books</span>
                <div className="font-serif text-3xl font-bold text-[#080808] mt-1">
                  {books.length}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#080808]/12">
                <span className="text-xs text-[#080808]/60">My Articles & Essays</span>
                <div className="font-serif text-3xl font-bold text-[#080808] mt-1">
                  {articles.length}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#080808]/12">
                <span className="text-xs text-[#080808]/60">Submission Decisions</span>
                <div className="font-serif text-3xl font-bold text-[#080808] mt-1">
                  {submissions.length}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#080808]/12">
                <span className="text-xs text-[#080808]/60">Saved Library Items</span>
                <div className="font-serif text-3xl font-bold text-[#080808] mt-1">
                  {favBooks.length + favArticles.length}
                </div>
              </div>
            </div>

            {/* Submissions & Editorial Feedback Tracker */}
            <div className="rounded-3xl bg-white border border-[#080808]/12 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#080808]">
                    Submission Lifecycle & Editorial Feedback
                  </h2>
                  <p className="text-xs text-[#080808]/70">
                    Track the review status and commissioning editor notes for your submitted books and articles.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("books")}
                    className="px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
                  >
                    + New Book
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("publications")}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#080808] text-xs font-bold"
                  >
                    + New Essay / Story
                  </button>
                </div>
              </div>

              {submissions.length === 0 ? (
                <p className="text-sm text-[#080808]/60 italic py-4">
                  You have not submitted any drafts to the editorial review queue yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#080808] text-[#F7DF8B]">
                            {sub.entity_type}
                          </span>
                          <StatusBadge status={sub.status} />
                          <span className="font-serif font-bold text-base text-[#080808]">
                            {sub.entity_title}
                          </span>
                        </div>
                        {sub.author_feedback && (
                          <p className="text-xs text-[#080808]/80 bg-white p-2.5 rounded-xl border border-[#080808]/10 mt-2">
                            <strong className="text-[#AA7C11]">Editorial Feedback:</strong>{" "}
                            {sub.author_feedback}
                          </p>
                        )}
                      </div>
                      <Link
                        href={
                          sub.entity_type === "book"
                            ? `/books/${sub.entity_slug}`
                            : `/magazine/${sub.entity_slug}`
                        }
                        className="text-xs font-bold text-[#AA7C11] hover:underline shrink-0"
                      >
                        Preview Item →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY BOOKS */}
        {activeTab === "books" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Book Form */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-[#080808]/12 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#080808]/10 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#AA7C11]">
                    {editingBookId ? "Edit Book Listing" : "Create New Book Listing"}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#080808]">
                    Book Metadata & Submission Studio
                  </h2>
                </div>
                {editingBookId && (
                  <button
                    type="button"
                    onClick={resetBookForm}
                    className="text-xs font-semibold text-rose-700 hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g. The Glass Meridian"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={bookSubtitle}
                    onChange={(e) => setBookSubtitle(e.target.value)}
                    placeholder="A Novel of Timekeeping and Memory"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Primary Genre *
                  </label>
                  <select
                    value={bookGenre}
                    onChange={(e) => setBookGenre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  >
                    <option value="Literary Fiction">Literary Fiction</option>
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Poetry & Translation">Poetry & Translation</option>
                    <option value="Essays & Criticism">Essays & Criticism</option>
                    <option value="Biography & Literary History">
                      Biography & Literary History
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Edition Format
                  </label>
                  <select
                    value={bookFormat}
                    onChange={(e) => setBookFormat(e.target.value as BookFormat)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  >
                    <option value="Hardcover">Hardcover</option>
                    <option value="Paperback">Paperback</option>
                    <option value="eBook">eBook</option>
                    <option value="Audiobook">Audiobook</option>
                    <option value="Multi-format">Multi-format</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    ISBN-13
                  </label>
                  <input
                    type="text"
                    value={bookIsbn}
                    onChange={(e) => setBookIsbn(e.target.value)}
                    placeholder="978-0-9988123-0-4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Publisher / Imprint
                  </label>
                  <input
                    type="text"
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                    placeholder="Meridian House Press"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Cover Image URL or Upload Cover File
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bookCoverUrl}
                      onChange={(e) => setBookCoverUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-[#080808] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(f, "book_cover", setBookCoverUrl);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Synopsis & Critical Positioning * (Min 20 characters)
                  </label>
                  <textarea
                    rows={4}
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    placeholder="Enter the jacket synopsis and literary context..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Sample Excerpt (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={bookExcerpt}
                    onChange={(e) => setBookExcerpt(e.target.value)}
                    placeholder="Share a short representative passage from the book..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Bookshop.org Link
                  </label>
                  <input
                    type="url"
                    value={bookBookshopUrl}
                    onChange={(e) => setBookBookshopUrl(e.target.value)}
                    placeholder="https://bookshop.org/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Amazon / Retailer Link
                  </label>
                  <input
                    type="url"
                    value={bookAmazonUrl}
                    onChange={(e) => setBookAmazonUrl(e.target.value)}
                    placeholder="https://amazon.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Note to LVN Commissioning Editor
                  </label>
                  <input
                    type="text"
                    value={bookSubmissionNotes}
                    onChange={(e) => setBookSubmissionNotes(e.target.value)}
                    placeholder="Edition verification notes or review request..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#080808]/10">
                <button
                  type="button"
                  onClick={() => handleSaveBook(false, false)}
                  className="px-5 py-2.5 rounded-xl border border-[#080808]/25 text-[#080808] font-bold text-xs hover:bg-[#F3EFE4]"
                >
                  Save Private Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBook(true, false)}
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414] inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Submit for Editorial Review
                </button>
                {isStaff && (
                  <button
                    type="button"
                    onClick={() => handleSaveBook(false, true)}
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Direct Publish Under My Profile ({profile?.display_name})
                  </button>
                )}
              </div>
            </div>

            {/* Existing Books List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#080808]">
                My Book Listings ({books.length})
              </h3>
              {books.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-white border border-[#080808]/12 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <StatusBadge status={b.status} />
                      <h4 className="font-serif text-lg font-bold text-[#080808] mt-1">
                        {b.title}
                      </h4>
                      <span className="text-xs text-[#080808]/60">
                        {b.genre} · {b.format} · ISBN: {b.isbn || "N/A"}
                      </span>
                    </div>
                    <img
                      src={b.cover_url || "/media/covers/the-glass-meridian.svg"}
                      alt={b.title}
                      className="w-12 h-16 rounded object-cover border border-[#080808]/10"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#080808]/10 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => loadBookIntoForm(b)}
                      className="text-[#080808] hover:text-[#AA7C11]"
                    >
                      Edit Metadata
                    </button>
                    <Link
                      href={`/books/${b.slug}`}
                      className="text-[#AA7C11] hover:underline"
                    >
                      Preview Page
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleViewRevisions("book", b.id, b.title)}
                      className="text-[#080808]/60 hover:text-[#080808] inline-flex items-center gap-1"
                    >
                      <History className="w-3 h-3" />
                      Revisions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RICH-TEXT ARTICLE & STORY STUDIO */}
        {activeTab === "publications" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 rounded-3xl bg-white border border-[#080808]/12 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#080808]/10 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#AA7C11]">
                    {editingArticleId ? "Editing Publication" : "New Manuscript"}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#080808]">
                    Rich-Text Literary Publishing Studio
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewArticleMode(!previewArticleMode)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F3EFE4] text-[#080808] text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {previewArticleMode ? "Back to Editor" : "Live Magazine Preview"}
                </button>
              </div>

              {previewArticleMode ? (
                <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10 space-y-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#080808] text-[#F7DF8B]">
                    {articleType.replace(/_/g, " ")} Preview
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-[#080808]">
                    {articleTitle || "Untitled Manuscript"}
                  </h3>
                  {articleSubtitle && (
                    <p className="font-serif text-lg text-[#AA7C11] italic">
                      {articleSubtitle}
                    </p>
                  )}
                  <div className="text-xs text-[#080808]/60">
                    By <strong>{profile?.display_name}</strong>
                  </div>
                  <div
                    className="lvn-prose pt-4 border-t border-[#080808]/10"
                    dangerouslySetInnerHTML={{ __html: articleBodyHtml }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="Enter essay, review, story, or interview headline..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Subtitle / Deck
                    </label>
                    <input
                      type="text"
                      value={articleSubtitle}
                      onChange={(e) => setArticleSubtitle(e.target.value)}
                      placeholder="Secondary deck or thematic subtitle..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                        Publication Type
                      </label>
                      <select
                        value={articleType}
                        onChange={(e) => setArticleType(e.target.value as ArticleType)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#080808]/20 text-xs"
                      >
                        <option value="essay">Literary Essay</option>
                        <option value="review">Book Review</option>
                        <option value="interview">Author Interview</option>
                        <option value="spotlight">Author Spotlight</option>
                        <option value="cover_story">Cover Story</option>
                        <option value="commentary">Cultural Commentary</option>
                        <option value="resource">Publishing Resource</option>
                        <option value="press_release">Press Release</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                        Category
                      </label>
                      <select
                        value={articleCategoryId}
                        onChange={(e) => setArticleCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#080808]/20 text-xs"
                      >
                        <option value="">General Magazine</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                        Editorial Issue
                      </label>
                      <select
                        value={articleIssueId}
                        onChange={(e) => setArticleIssueId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#080808]/20 text-xs"
                      >
                        <option value="">Standalone Dispatch</option>
                        {issues.map((iss) => (
                          <option key={iss.id} value={iss.id}>
                            Issue #{iss.issue_number}: {iss.theme}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Standfirst / Excerpt Summary
                    </label>
                    <textarea
                      rows={2}
                      value={articleExcerpt}
                      onChange={(e) => setArticleExcerpt(e.target.value)}
                      placeholder="2–3 sentence summary for magazine cards and SEO..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>

                  {/* Rich-Text Formatting Toolbar */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#080808]">
                        Manuscript Body (Sanitized Rich HTML)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            insertHtmlSnippet("<h2>New Section Heading</h2>")
                          }
                          className="px-2.5 py-1 rounded bg-[#F3EFE4] text-[#080808] text-[11px] font-bold inline-flex items-center gap-1 hover:bg-[#D4AF37]/30"
                        >
                          <Heading2 className="w-3 h-3" /> H2
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertHtmlSnippet(
                              "<blockquote>“Insert literary quotation or pull-quote here.”</blockquote>"
                            )
                          }
                          className="px-2.5 py-1 rounded bg-[#F3EFE4] text-[#080808] text-[11px] font-bold inline-flex items-center gap-1 hover:bg-[#D4AF37]/30"
                        >
                          <Quote className="w-3 h-3" /> Quote
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertHtmlSnippet(
                              "<ul>\n  <li>First observation</li>\n  <li>Second observation</li>\n</ul>"
                            )
                          }
                          className="px-2.5 py-1 rounded bg-[#F3EFE4] text-[#080808] text-[11px] font-bold inline-flex items-center gap-1 hover:bg-[#D4AF37]/30"
                        >
                          <List className="w-3 h-3" /> List
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlSnippet("<p>New paragraph...</p>")}
                          className="px-2.5 py-1 rounded bg-[#F3EFE4] text-[#080808] text-[11px] font-bold"
                        >
                          + Paragraph
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={10}
                      value={articleBodyHtml}
                      onChange={(e) => setArticleBodyHtml(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#080808]/20 text-sm font-mono leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={articleTags}
                        onChange={(e) => setArticleTags(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#080808]/20 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                        Submission Notes to Editor
                      </label>
                      <input
                        type="text"
                        value={articleSubmissionNotes}
                        onChange={(e) => setArticleSubmissionNotes(e.target.value)}
                        placeholder="Optional note for commissioning desk"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#080808]/20 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#080808]/10">
                <button
                  type="button"
                  onClick={() => handleSaveArticle(false, false)}
                  className="px-5 py-2.5 rounded-xl border border-[#080808]/25 text-[#080808] font-bold text-xs hover:bg-[#F3EFE4]"
                >
                  Save Private Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveArticle(true, false)}
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414] inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Submit for Editorial Review
                </button>
                {isStaff && (
                  <button
                    type="button"
                    onClick={() => handleSaveArticle(false, true)}
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Direct Publish Under My Profile ({profile?.display_name})
                  </button>
                )}
              </div>
            </div>

            {/* Existing Articles List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#080808]">
                My Articles, Essays & Stories ({articles.length})
              </h3>
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-white border border-[#080808]/12 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={a.status} />
                    <span className="text-[11px] font-bold uppercase text-[#AA7C11]">
                      {a.article_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#080808]">
                    {a.title}
                  </h4>
                  <p className="text-xs text-[#080808]/70 line-clamp-2">
                    {a.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#080808]/10 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => loadArticleIntoForm(a)}
                      className="text-[#080808] hover:text-[#AA7C11]"
                    >
                      Open in Editor
                    </button>
                    <Link
                      href={`/magazine/${a.slug}`}
                      className="text-[#AA7C11] hover:underline"
                    >
                      Preview Article
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleViewRevisions("article", a.id, a.title)}
                      className="text-[#080808]/60 hover:text-[#080808] inline-flex items-center gap-1"
                    >
                      <History className="w-3 h-3" />
                      Revisions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PUBLIC AUTHOR PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-3xl rounded-3xl bg-white border border-[#080808]/12 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#080808]/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#AA7C11]">
                  Public Identity & Attribution
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#080808]">
                  Edit Public Author Profile
                </h2>
              </div>
              {profile?.slug && (
                <Link
                  href={`/authors/${profile.slug}`}
                  className="text-xs font-bold text-[#AA7C11] hover:underline"
                >
                  View Live Profile (/authors/{profile.slug}) →
                </Link>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profDisplayName}
                    onChange={(e) => setProfDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Pen Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={profPenName}
                    onChange={(e) => setProfPenName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Literary Headline / Role Title
                </label>
                <input
                  type="text"
                  value={profHeadline}
                  onChange={(e) => setProfHeadline(e.target.value)}
                  placeholder="Novelist, Essayist & Literary Critic"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Full Author Biography
                </label>
                <textarea
                  rows={5}
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={profLocation}
                    onChange={(e) => setProfLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={profWebsite}
                    onChange={(e) => setProfWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Genres (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={profGenres}
                    onChange={(e) => setProfGenres(e.target.value)}
                    placeholder="Literary Fiction, Essays, Poetry"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Portrait URL or Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profAvatarUrl}
                      onChange={(e) => setProfAvatarUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                    <label className="px-3.5 py-2.5 rounded-xl bg-[#080808] text-white text-xs font-bold cursor-pointer inline-flex items-center">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f)
                            handleFileUpload(f, "author_portrait", setProfAvatarUrl);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414]"
              >
                Save Public Profile
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: PITCHES */}
        {activeTab === "pitches" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 rounded-3xl bg-white border border-[#080808]/12 p-8 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Pitch an Interview, Spotlight, or Broadcast Session
              </h2>
              <form onSubmit={handleSubmitPitch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Pitch Category
                  </label>
                  <select
                    value={pitchType}
                    onChange={(e) =>
                      setPitchType(e.target.value as Pitch["pitch_type"])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  >
                    <option value="interview">Author Interview</option>
                    <option value="spotlight">Author Spotlight</option>
                    <option value="broadcast_guest">Broadcast Studio Guest</option>
                    <option value="book_launch">Book Launch Salon</option>
                    <option value="magazine_feature">Thematic Issue Feature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Target Editorial Issue (Optional)
                  </label>
                  <select
                    value={pitchIssueId}
                    onChange={(e) => setPitchIssueId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  >
                    <option value="">General Commissioning</option>
                    {issues.map((i) => (
                      <option key={i.id} value={i.id}>
                        Issue #{i.issue_number}: {i.theme}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Proposed Title / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={pitchTitle}
                    onChange={(e) => setPitchTitle(e.target.value)}
                    placeholder="e.g. In Conversation on Archival Historical Fiction"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Pitch Summary & Talking Points *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={pitchSummary}
                    onChange={(e) => setPitchSummary(e.target.value)}
                    placeholder="Outline your angle, relevant book launch dates, and key themes..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#080808] text-white font-bold text-xs"
                >
                  Submit Pitch to Commissioning Desk
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#080808]">
                My Submitted Pitches ({pitches.length})
              </h3>
              {pitches.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-white border border-[#080808]/12 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={p.status} />
                    <span className="text-xs font-bold uppercase text-[#AA7C11]">
                      {p.pitch_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#080808]">
                    {p.title}
                  </h4>
                  <p className="text-xs text-[#080808]/75">{p.summary}</p>
                  {p.editor_feedback && (
                    <div className="p-3 rounded-xl bg-[#FAF8F3] text-xs text-[#080808]">
                      <strong className="text-[#AA7C11]">Editor Response:</strong>{" "}
                      {p.editor_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SAVED LIBRARY */}
        {activeTab === "library" && (
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808] mb-4">
                Saved Books ({favBooks.length})
              </h2>
              {favBooks.length === 0 ? (
                <p className="text-sm text-[#080808]/60">
                  No saved books yet. Click the heart icon on any book in the directory to add it to your reading list.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favBooks.map((b) => (
                    <Link
                      key={b.id}
                      href={`/books/${b.slug}`}
                      className="p-4 rounded-2xl bg-white border border-[#080808]/12 hover:border-[#D4AF37] flex items-center gap-4"
                    >
                      <img
                        src={b.cover_url}
                        alt={b.title}
                        className="w-12 h-16 rounded object-cover"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#080808]">
                          {b.title}
                        </h4>
                        <span className="text-xs text-[#080808]/60">
                          {b.author_name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808] mb-4">
                Followed Authors ({followedAuthors.length})
              </h2>
              {followedAuthors.length === 0 ? (
                <p className="text-sm text-[#080808]/60">
                  You are not following any authors yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {followedAuthors.map((a) => (
                    <Link
                      key={a.id}
                      href={`/authors/${a.slug}`}
                      className="p-4 rounded-2xl bg-white border border-[#080808]/12 hover:border-[#D4AF37] flex items-center gap-3"
                    >
                      <img
                        src={a.avatar_url}
                        alt={a.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#080808]">
                          {a.display_name}
                        </h4>
                        <span className="text-xs text-[#080808]/60">
                          {a.headline}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: EVENT REGISTRATIONS */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              My Literary Event Registrations ({eventRegistrations.length})
            </h2>
            {eventRegistrations.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#080808]/12 text-center space-y-3">
                <p className="text-sm text-[#080808]/70">
                  You have not registered for any upcoming literary events yet.
                </p>
                <Link
                  href="/events"
                  className="inline-block px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
                >
                  Browse Literary Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-5 rounded-2xl bg-white border border-[#080808]/12 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950 text-amber-300">
                        {reg.status}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#080808] mt-1">
                        {reg.event_title}
                      </h3>
                      <p className="text-xs text-[#080808]/65">
                        {reg.event_start_at &&
                          new Date(reg.event_start_at).toLocaleString()}{" "}
                        ({reg.event_timezone})
                      </p>
                    </div>
                    <Link
                      href={`/events/${reg.event_slug}`}
                      className="text-xs font-bold text-[#AA7C11] hover:underline"
                    >
                      Event Page →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: ACCOUNT SETTINGS & DELETION */}
        {activeTab === "settings" && (
          <div className="max-w-2xl rounded-3xl bg-white border border-[#080808]/12 p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              Account Security & Deactivation
            </h2>
            <div className="p-4 rounded-2xl bg-[#FAF8F3] text-xs space-y-1">
              <div>
                <strong>Account Email:</strong> {user?.email}
              </div>
              <div>
                <strong>Assigned Role:</strong> {user?.role}
              </div>
              <div>
                <strong>Account Status:</strong> {user?.account_status}
              </div>
            </div>

            <div className="pt-6 border-t border-rose-500/20 space-y-3">
              <h3 className="font-serif text-lg font-bold text-rose-800 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Deactivate & Delete Account
              </h3>
              <p className="text-xs text-[#080808]/70">
                To permanently deactivate your account and unpublish your profile, type{" "}
                <code className="font-mono font-bold text-rose-800">
                  DELETE MY ACCOUNT
                </code>{" "}
                below and confirm.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE MY ACCOUNT"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-rose-300 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
                >
                  Confirm Deactivation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revisions History Modal */}
      {revisionsModalTitle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#080808]/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#080808]">
                Revision History: {revisionsModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setRevisionsModalTitle("")}
                className="text-xs font-bold text-[#080808]/60 hover:text-[#080808]"
              >
                Close ✕
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-3">
              {revisionsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#080808]/10 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-[#080808]">
                    <span>Version #{rev.version_number}</span>
                    <span className="text-[#080808]/55">
                      {new Date(rev.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#080808]/80">{rev.change_summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemberDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-12 text-sm text-[#080808]">
          Loading Author & Member Studio...
        </div>
      }
    >
      <MemberDashboardContent />
    </Suspense>
  );
}

