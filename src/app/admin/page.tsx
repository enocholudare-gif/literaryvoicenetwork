"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Feather,
  FileText,
  Globe,
  Headphones,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Mail,
  Mic2,
  Newspaper,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Cards";
import type {
  Article,
  ArticleType,
  AuditLog,
  Book,
  Broadcast,
  EditorialIssue,
  Enquiry,
  HomepageSection,
  LiteraryEvent,
  MediaAsset,
  Pitch,
  Profile,
  PublicationStatus,
  SiteSettingsMap,
  Submission,
  User as UserModel,
  UserRole,
} from "@/lib/db/types";

type AdminTab =
  | "overview"
  | "moderation"
  | "admin_publishing"
  | "books_articles"
  | "broadcasts_events"
  | "issues_pitches"
  | "homepage_settings"
  | "users"
  | "enquiries_media"
  | "audit";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Omit<UserModel, "password_hash"> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [usersList, setUsersList] = useState<Array<Record<string, unknown>>>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);
  const [settings, setSettings] = useState<SiteSettingsMap | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [events, setEvents] = useState<LiteraryEvent[]>([]);
  const [issues, setIssues] = useState<EditorialIssue[]>([]);

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Moderation Decision Form State
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [modNextStatus, setModNextStatus] =
    useState<PublicationStatus>("published");
  const [modAuthorFeedback, setModAuthorFeedback] = useState("");
  const [modInternalNotes, setModInternalNotes] = useState("");
  const [modFeatured, setModFeatured] = useState(true);
  const [modEditorialPick, setModEditorialPick] = useState(true);

  // Administrator Personal Public Profile Publishing State
  const [adminPubMode, setAdminPubMode] = useState<"article" | "book">("article");
  const [adminArtTitle, setAdminArtTitle] = useState("");
  const [adminArtSubtitle, setAdminArtSubtitle] = useState("");
  const [adminArtType, setAdminArtType] = useState<ArticleType>("cover_story");
  const [adminArtExcerpt, setAdminArtExcerpt] = useState("");
  const [adminArtBody, setAdminArtBody] = useState(
    "<p class=\"lead\">Published directly by the Administrator under their public LVN author profile.</p>\n<h2>Editorial Perspective</h2>\n<p>Full rich-text prose with automatic audit logging and author attribution.</p>"
  );
  const [adminArtAction, setAdminArtAction] = useState<
    "publish" | "schedule" | "draft"
  >("publish");
  const [adminScheduleDate, setAdminScheduleDate] = useState("2026-12-01T12:00:00.000Z");

  const [adminBookTitle, setAdminBookTitle] = useState("");
  const [adminBookSubtitle, setAdminBookSubtitle] = useState("");
  const [adminBookIsbn, setAdminBookIsbn] = useState("978-0-9988123-9-7");
  const [adminBookGenre, setAdminBookGenre] = useState("Literary Fiction");
  const [adminBookPublisher, setAdminBookPublisher] = useState("Meridian House Press");
  const [adminBookDesc, setAdminBookDesc] = useState("");
  const [adminBookExcerpt, setAdminBookExcerpt] = useState("");

  // Broadcast Form State
  const [bcProgramme, setBcProgramme] = useState("The Meridian Conversation");
  const [bcEpisode, setBcEpisode] = useState<number>(44);
  const [bcTitle, setBcTitle] = useState("");
  const [bcGuest, setBcGuest] = useState("");
  const [bcDesc, setBcDesc] = useState("");
  const [bcStart, setBcStart] = useState("2026-11-20T18:00:00.000Z");
  const [bcStatus, setBcStatus] = useState<"scheduled" | "archived">("scheduled");

  // Event Form State
  const [evtTitle, setEvtTitle] = useState("");
  const [evtType, setEvtType] = useState<LiteraryEvent["event_type"]>("interview");
  const [evtStart, setEvtStart] = useState("2026-11-28T19:00:00.000Z");
  const [evtDesc, setEvtDesc] = useState("");

  // Issue Form State
  const [issNumber, setIssNumber] = useState<number>(16);
  const [issTitle, setIssTitle] = useState("Issue No. 16 — Spring 2027");
  const [issTheme, setIssTheme] = useState("");
  const [issDeadline, setIssDeadline] = useState("2027-02-15");
  const [issPubDate, setIssPubDate] = useState("2027-03-20");
  const [issDesc, setIssDesc] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();
      if (
        !authData.authenticated ||
        (authData.user?.role !== "admin")
      ) {
        router.push("/auth?mode=login");
        return;
      }
      setUser(authData.user);
      setProfile(authData.profile);

      const [modRes, admRes] = await Promise.all([
        fetch("/api/publishing?scope=staff-moderation"),
        fetch("/api/platform?scope=admin-overview"),
      ]);

      const modData = await modRes.json();
      if (modData.ok) {
        setSubmissions(modData.submissions || []);
        setAllBooks(modData.books || []);
        setAllArticles(modData.articles || []);
      }

      const admData = await admRes.json();
      if (admData.ok) {
        setMetrics(admData.metrics || {});
        setUsersList(admData.users || []);
        setPitches(admData.pitches || []);
        setEnquiries(admData.enquiries || []);
        setHomepageSections(admData.homepageSections || []);
        setSettings(admData.settings || null);
        setAuditLogs(admData.auditLogs || []);
        setMediaAssets(admData.mediaAssets || []);
        setBroadcasts(admData.broadcasts || []);
        setEvents(admData.events || []);
        setIssues(admData.issues || []);
      }
    } catch {
      setBanner({
        type: "error",
        text: "Failed to load administrative console data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleModerateTransition = async (
    entityType: "book" | "article",
    entityId: string,
    nextStatus: PublicationStatus,
    authorFeedback = "",
    internalNotes = "",
    isFeatured = false,
    editorialRecommendation = false
  ) => {
    setBanner(null);
    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "moderate-or-transition",
        entityType,
        entityId,
        nextStatus,
        authorFeedback,
        internalNotes,
        isFeatured,
        editorialRecommendation,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({
        type: "error",
        text: data.error || "Moderation transition failed.",
      });
      return;
    }
    setBanner({
      type: "success",
      text: `Updated ${entityType} status to '${nextStatus}'. Notification & audit log recorded.`,
    });
    setSelectedSub(null);
    loadAdminData();
  };

  const handleAdminPublishOwnArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-article",
        publishImmediately: adminArtAction === "publish",
        scheduledFor: adminArtAction === "schedule" ? adminScheduleDate : null,
        isFeatured: true,
        isCoverStory: adminArtType === "cover_story",
        articleData: {
          title: adminArtTitle,
          subtitle: adminArtSubtitle,
          articleType: adminArtType,
          excerpt: adminArtExcerpt,
          bodyHtml: adminArtBody,
          tags: ["editorial", "literary voices"],
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({
        type: "error",
        text: data.error || "Failed to publish article.",
      });
      return;
    }
    setBanner({
      type: "success",
      text: `Published "${data.article.title}" (${data.article.status}) under public author profile ${profile?.display_name} (/authors/${profile?.slug})!`,
    });
    setAdminArtTitle("");
    setAdminArtSubtitle("");
    setAdminArtExcerpt("");
    loadAdminData();
  };

  const handleAdminPublishOwnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-book",
        publishImmediately: adminArtAction === "publish",
        scheduledFor: adminArtAction === "schedule" ? adminScheduleDate : null,
        bookData: {
          title: adminBookTitle,
          subtitle: adminBookSubtitle,
          isbn: adminBookIsbn,
          genre: adminBookGenre,
          publisher: adminBookPublisher,
          description: adminBookDesc,
          excerpt: adminBookExcerpt,
          format: "Hardcover",
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({
        type: "error",
        text: data.error || "Failed to publish book.",
      });
      return;
    }
    setBanner({
      type: "success",
      text: `Published book "${data.book.title}" (${data.book.status}) under public author profile ${profile?.display_name} (/authors/${profile?.slug})!`,
    });
    setAdminBookTitle("");
    setAdminBookSubtitle("");
    setAdminBookDesc("");
    setAdminBookExcerpt("");
    loadAdminData();
  };

  const handleToggleSectionVisibility = async (sec: HomepageSection) => {
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-homepage-section",
        sectionKey: sec.section_key,
        sectionData: {
          isVisible: !sec.is_visible,
        },
      }),
    });
    if (res.ok) {
      loadAdminData();
    }
  };

  const handleReorderSection = async (sec: HomepageSection, delta: number) => {
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-homepage-section",
        sectionKey: sec.section_key,
        sectionData: {
          sortOrder: Math.max(1, sec.sort_order + delta),
        },
      }),
    });
    if (res.ok) {
      loadAdminData();
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-site-settings",
        settingsData: settings,
      }),
    });
    if (res.ok) {
      setBanner({
        type: "success",
        text: "Global site settings and Hero Video configuration saved!",
      });
      loadAdminData();
    }
  };

  const handleUpdateUserRole = async (
    targetUserId: string,
    updates: {
      role?: UserRole;
      accountStatus?: "active" | "suspended";
      isFeatured?: boolean;
    }
  ) => {
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "admin-update-user",
        targetUserId,
        updates,
      }),
    });
    if (res.ok) {
      setBanner({
        type: "success",
        text: "User role / status updated and logged to audit trail.",
      });
      loadAdminData();
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-broadcast",
        broadcastData: {
          programmeName: bcProgramme,
          episodeNumber: Number(bcEpisode),
          title: bcTitle,
          hostName: profile?.display_name || "Eleanor Vance",
          guestName: bcGuest,
          description: bcDesc,
          scheduledStart: bcStart,
          status: bcStatus,
        },
      }),
    });
    if (res.ok) {
      setBanner({ type: "success", text: "Broadcast episode created!" });
      setBcTitle("");
      setBcGuest("");
      setBcDesc("");
      loadAdminData();
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-event",
        eventData: {
          title: evtTitle,
          eventType: evtType,
          startAt: evtStart,
          endAt: evtStart,
          hostName: profile?.display_name || "Eleanor Vance",
          description: evtDesc,
        },
      }),
    });
    if (res.ok) {
      setBanner({ type: "success", text: "Literary event scheduled!" });
      setEvtTitle("");
      setEvtDesc("");
      loadAdminData();
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-issue",
        issueData: {
          issueNumber: Number(issNumber),
          title: issTitle,
          theme: issTheme,
          description: issDesc,
          submissionDeadline: issDeadline,
          publicationDate: issPubDate,
          submissionWindowOpen: true,
          status: "open_for_submissions",
        },
      }),
    });
    if (res.ok) {
      setBanner({ type: "success", text: "Editorial issue added to calendar!" });
      setIssTheme("");
      setIssDesc("");
      loadAdminData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-12 text-sm text-[#080808]">
        Loading Literary Voices Network Editorial & Administrative Command Center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Command Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-10 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#080808]">
                  {user?.role === "admin"
                    ? "Administrator & Public Author"
                    : "Senior Commissioning Editor"}
                </span>
                <span className="text-xs text-[#F7DF8B]">
                  Signed in as {profile?.display_name} ({user?.email})
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
                LVN Editorial & Administrative Console
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {profile?.slug && (
                <Link
                  href={`/authors/${profile.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#F7DF8B] text-xs font-semibold hover:bg-white/5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  My Public Profile (/authors/{profile.slug})
                </Link>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("admin_publishing")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] text-xs font-bold hover:bg-[#F7DF8B]"
              >
                <Feather className="w-3.5 h-3.5" />
                Publish Under My Author Profile
              </button>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-5">
            {(
              [
                { id: "overview", label: "Platform Metrics", icon: LayoutDashboard },
                {
                  id: "moderation",
                  label: `Moderation Queue (${submissions.length})`,
                  icon: ShieldCheck,
                },
                {
                  id: "admin_publishing",
                  label: `My Author Publishing (${profile?.display_name})`,
                  icon: Feather,
                },
                {
                  id: "books_articles",
                  label: `Catalog (${allBooks.length} Books / ${allArticles.length} Articles)`,
                  icon: BookOpen,
                },
                {
                  id: "broadcasts_events",
                  label: "Broadcasts & Events",
                  icon: Radio,
                },
                {
                  id: "issues_pitches",
                  label: `Issues & Pitches (${pitches.length})`,
                  icon: Calendar,
                },
                {
                  id: "homepage_settings",
                  label: "Homepage & Hero Video",
                  icon: Settings,
                },
                { id: "users", label: `Users & Roles (${usersList.length})`, icon: Users },
                {
                  id: "enquiries_media",
                  label: `Enquiries (${enquiries.length}) & Media`,
                  icon: Mail,
                },
                {
                  id: "audit",
                  label: `Audit Logs (${auditLogs.length})`,
                  icon: Activity,
                },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
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
        {banner && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
              banner.type === "success"
                ? "bg-amber-950 text-emerald-100 border-amber-500/40"
                : "bg-rose-950 text-rose-100 border-rose-500/40"
            }`}
          >
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: "Active Members", val: metrics.totalMembers || 0 },
                { label: "Public Authors", val: metrics.totalAuthors || 0 },
                { label: "Published Books", val: metrics.publishedBooks || 0 },
                {
                  label: "Published Articles",
                  val: metrics.publishedArticles || 0,
                },
                {
                  label: "Pending Submissions",
                  val: metrics.pendingSubmissions || 0,
                },
                { label: "Broadcast Episodes", val: metrics.totalBroadcasts || 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 rounded-2xl bg-white border border-[#080808]/12 shadow-xs"
                >
                  <span className="text-[11px] font-semibold text-[#080808]/60 block">
                    {stat.label}
                  </span>
                  <span className="font-serif text-3xl font-bold text-[#080808] mt-1 block">
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Dual Identity Highlight Card */}
            <div className="rounded-3xl bg-[#080808] text-[#FAF8F3] p-8 border border-[#D4AF37]/35 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Mandatory Administrator Publishing Identity Active
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {profile?.display_name} — Simultaneous Administrator & Public Author
                </h2>
                <p className="text-sm text-[#FAF8F3]/80 leading-relaxed">
                  Your account holds full administrative authority across Literary Voices Network AND maintains a verified public author profile at{" "}
                  <Link
                    href={`/authors/${profile?.slug || "eleanor-vance"}`}
                    className="text-[#F7DF8B] underline font-semibold"
                  >
                    /authors/{profile?.slug || "eleanor-vance"}
                  </Link>
                  . Any book, cover story, essay, review, or interview you publish in the{" "}
                  <strong>My Author Publishing</strong> tab is attributed directly to your public profile and recorded in the audit log.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("admin_publishing")}
                  className="px-5 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B]"
                >
                  Publish Original Work Under My Profile
                </button>
                <Link
                  href={`/authors/${profile?.slug || "eleanor-vance"}`}
                  className="px-5 py-3 rounded-xl border border-white/20 text-white font-semibold text-xs text-center hover:bg-white/5"
                >
                  Inspect Public Author Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDITORIAL MODERATION QUEUE */}
        {activeTab === "moderation" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Submissions & Editorial Review Queue ({submissions.length})
              </h2>
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-5 rounded-2xl bg-white border transition-all ${
                    selectedSub?.id === sub.id
                      ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30"
                      : "border-[#080808]/12"
                  } space-y-3`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#080808] text-[#F7DF8B]">
                        {sub.entity_type}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <span className="text-xs text-[#080808]/60">
                      Submitted by <strong>{sub.author_name}</strong>
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#080808]">
                    {sub.entity_title}
                  </h3>

                  {/* Formatted Mail Text Dispatch Box */}
                  <div className="rounded-xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/40 p-3.5 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-1.5 mb-1.5">
                      <span>✉ Mail Notification Text (Sent to {settings?.editorialEmail || "Admin Email"})</span>
                      <span>Status: {sub.status}</span>
                    </div>
                    <p><strong>Subject:</strong> [LVN Admin Approval Required] New {sub.entity_type === "book" ? "Book" : "Article"} Submitted — &ldquo;{sub.entity_title}&rdquo;</p>
                    <p><strong>From Author:</strong> {sub.author_name}</p>
                    <p><strong>Notes:</strong> {sub.submission_notes || "Please review and approve for publication on the Literary Voices Network directory."}</p>
                  </div>

                  {sub.submission_notes && (
                    <p className="text-xs text-[#080808]/75 bg-[#FAF8F3] p-3 rounded-xl">
                      <strong>Author’s Submission Note:</strong> {sub.submission_notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#080808]/10">
                    <Link
                      href={
                        sub.entity_type === "book"
                          ? `/books/${sub.entity_slug}`
                          : `/magazine/${sub.entity_slug}`
                      }
                      className="text-xs font-bold text-[#AA7C11] hover:underline"
                    >
                      Preview Full Submission →
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSub(sub);
                          setModNextStatus("published");
                          setModAuthorFeedback(sub.author_feedback || "");
                          setModInternalNotes(sub.internal_notes || "");
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#080808] text-white text-xs font-bold"
                      >
                        Review & Decide
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleModerateTransition(
                            sub.entity_type,
                            sub.entity_id,
                            "published",
                            "Approved and published by LVN Editorial Board.",
                            "Quick publish from queue",
                            true,
                            true
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-emerald-800"
                      >
                        Quick Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Moderation Decision Panel */}
            <div className="lg:col-span-5 rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4 sticky top-24">
              <h3 className="font-serif text-xl font-bold text-[#080808]">
                {selectedSub
                  ? `Reviewing: ${selectedSub.entity_title}`
                  : "Select a Submission to Record Decision"}
              </h3>
              {selectedSub ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Lifecycle Decision
                    </label>
                    <select
                      value={modNextStatus}
                      onChange={(e) =>
                        setModNextStatus(e.target.value as PublicationStatus)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    >
                      <option value="in_review">Mark In Review</option>
                      <option value="revision_requested">Request Revisions</option>
                      <option value="approved">Approve (Hold for Schedule)</option>
                      <option value="published">Approve & Publish Immediately</option>
                      <option value="rejected">Decline / Reject</option>
                      <option value="archived">Archive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Feedback to Author (Sent via Notification)
                    </label>
                    <textarea
                      rows={3}
                      value={modAuthorFeedback}
                      onChange={(e) => setModAuthorFeedback(e.target.value)}
                      placeholder="Constructive editorial notes or approval confirmation..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#080808]/20 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Confidential Internal Editorial Notes (Hidden from Author)
                    </label>
                    <textarea
                      rows={2}
                      value={modInternalNotes}
                      onChange={(e) => setModInternalNotes(e.target.value)}
                      placeholder="Internal staff notes..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#080808]/20 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-[#080808]">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={modFeatured}
                        onChange={(e) => setModFeatured(e.target.checked)}
                      />
                      Feature on Homepage
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={modEditorialPick}
                        onChange={(e) => setModEditorialPick(e.target.checked)}
                      />
                      Editorial Recommendation Badge
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleModerateTransition(
                        selectedSub.entity_type,
                        selectedSub.entity_id,
                        modNextStatus,
                        modAuthorFeedback,
                        modInternalNotes,
                        modFeatured,
                        modEditorialPick
                      )
                    }
                    className="w-full py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B]"
                  >
                    Record Decision & Notify Author
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#080808]/60">
                  Click “Review & Decide” on any submission card on the left to inspect notes, request revisions, or approve publication.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MANDATORY ADMINISTRATOR PERSONAL PROFILE PUBLISHING */}
        {activeTab === "admin_publishing" && (
          <div className="rounded-3xl bg-white border border-[#080808]/12 p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#080808]/10 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                  Direct Authorial Publishing Pipeline
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808]">
                  Publish Original Work as {profile?.display_name} (/authors/
                  {profile?.slug})
                </h2>
                <p className="text-xs text-[#080808]/70 mt-1">
                  Uses the exact same Zod validation, HTML sanitization, revision history, and database schema as member content, while allowing authorized direct publication and audit logging.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdminPubMode("article")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    adminPubMode === "article"
                      ? "bg-[#080808] text-white"
                      : "bg-[#F3EFE4] text-[#080808]"
                  }`}
                >
                  Publish Article / Essay / Interview
                </button>
                <button
                  type="button"
                  onClick={() => setAdminPubMode("book")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    adminPubMode === "book"
                      ? "bg-[#080808] text-white"
                      : "bg-[#F3EFE4] text-[#080808]"
                  }`}
                >
                  Publish Book Listing
                </button>
              </div>
            </div>

            {adminPubMode === "article" ? (
              <form onSubmit={handleAdminPublishOwnArticle} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminArtTitle}
                      onChange={(e) => setAdminArtTitle(e.target.value)}
                      placeholder="e.g. Notes on the Contemporary Novella"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Format / Type
                    </label>
                    <select
                      value={adminArtType}
                      onChange={(e) =>
                        setAdminArtType(e.target.value as ArticleType)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    >
                      <option value="cover_story">Cover Story</option>
                      <option value="essay">Literary Essay</option>
                      <option value="interview">Author Interview</option>
                      <option value="review">Book Review</option>
                      <option value="spotlight">Author Spotlight</option>
                      <option value="lifestyle">Lifestyle & Culture</option>
                      <option value="press_release">Official Press Release</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={adminArtSubtitle}
                    onChange={(e) => setAdminArtSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Excerpt
                  </label>
                  <textarea
                    rows={2}
                    value={adminArtExcerpt}
                    onChange={(e) => setAdminArtExcerpt(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Rich-Text Body HTML *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={adminArtBody}
                    onChange={(e) => setAdminArtBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#080808]/10">
                  <select
                    value={adminArtAction}
                    onChange={(e) =>
                      setAdminArtAction(
                        e.target.value as "publish" | "schedule" | "draft"
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-xs font-bold"
                  >
                    <option value="publish">Publish Immediately</option>
                    <option value="schedule">Schedule Publication</option>
                    <option value="draft">Save as Private Draft</option>
                  </select>

                  {adminArtAction === "schedule" && (
                    <input
                      type="text"
                      value={adminScheduleDate}
                      onChange={(e) => setAdminScheduleDate(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#080808]/20 text-xs"
                    />
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B]"
                  >
                    Execute Publication Under {profile?.display_name}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminPublishOwnBook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminBookTitle}
                      onChange={(e) => setAdminBookTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={adminBookSubtitle}
                      onChange={(e) => setAdminBookSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={adminBookGenre}
                      onChange={(e) => setAdminBookGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      ISBN-13
                    </label>
                    <input
                      type="text"
                      value={adminBookIsbn}
                      onChange={(e) => setAdminBookIsbn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Synopsis * (Min 20 characters)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={adminBookDesc}
                    onChange={(e) => setAdminBookDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B]"
                >
                  Publish Book Under {profile?.display_name}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: ALL BOOKS & ARTICLES CATALOG */}
        {activeTab === "books_articles" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                All Books ({allBooks.length})
              </h2>
              {allBooks.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-white border border-[#080808]/12 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-[#080808]/60">
                        By {b.author_name}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#080808] mt-1">
                      {b.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/books/${b.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-[#F3EFE4] text-xs font-bold text-[#080808]"
                    >
                      View
                    </Link>
                    {b.status === "published" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleModerateTransition("book", b.id, "archived")
                        }
                        className="px-3 py-1.5 rounded-lg bg-stone-200 text-xs font-bold text-stone-800"
                      >
                        Archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleModerateTransition("book", b.id, "published")
                        }
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-xs font-bold text-white"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                All Articles & Press Releases ({allArticles.length})
              </h2>
              {allArticles.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl bg-white border border-[#080808]/12 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      <span className="text-[11px] font-bold uppercase text-[#AA7C11]">
                        {a.article_type}
                      </span>
                      <span className="text-xs text-[#080808]/60">
                        By {a.author_name}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#080808] mt-1">
                      {a.title}
                    </h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/magazine/${a.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-[#F3EFE4] text-xs font-bold text-[#080808]"
                    >
                      View
                    </Link>
                    {a.status === "published" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleModerateTransition("article", a.id, "archived")
                        }
                        className="px-3 py-1.5 rounded-lg bg-stone-200 text-xs font-bold text-stone-800"
                      >
                        Archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleModerateTransition("article", a.id, "published")
                        }
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-xs font-bold text-white"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BROADCASTS & EVENTS */}
        {activeTab === "broadcasts_events" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#080808]">
                Schedule or Archive Broadcast Episode
              </h2>
              <form onSubmit={handleCreateBroadcast} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={bcProgramme}
                    onChange={(e) => setBcProgramme(e.target.value)}
                    placeholder="Programme Name"
                    className="px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  />
                  <input
                    type="number"
                    value={bcEpisode}
                    onChange={(e) => setBcEpisode(Number(e.target.value))}
                    placeholder="Episode #"
                    className="px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="Episode Title"
                  className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                />
                <input
                  type="text"
                  value={bcGuest}
                  onChange={(e) => setBcGuest(e.target.value)}
                  placeholder="Guest Author Name"
                  className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                />
                <textarea
                  rows={3}
                  required
                  value={bcDesc}
                  onChange={(e) => setBcDesc(e.target.value)}
                  placeholder="Show notes and episode summary..."
                  className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white text-xs font-bold"
                >
                  Save Broadcast Episode
                </button>
              </form>
            </div>

            <div className="rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#080808]">
                Schedule Literary Event / Salon
              </h2>
              <form onSubmit={handleCreateEvent} className="space-y-3">
                <input
                  type="text"
                  required
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="Event Title"
                  className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={evtType}
                    onChange={(e) =>
                      setEvtType(e.target.value as LiteraryEvent["event_type"])
                    }
                    className="px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  >
                    <option value="interview">Author Interview</option>
                    <option value="book_club">Book Club</option>
                    <option value="book_launch">Book Launch</option>
                    <option value="workshop">Craft Workshop</option>
                    <option value="panel">Literary Panel</option>
                  </select>
                  <input
                    type="text"
                    value={evtStart}
                    onChange={(e) => setEvtStart(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  placeholder="Event description and registration details..."
                  className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white text-xs font-bold"
                >
                  Publish Event
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: ISSUES & PITCHES */}
        {activeTab === "issues_pitches" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#080808]">
                Create Editorial Issue
              </h2>
              <form onSubmit={handleCreateIssue} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={issNumber}
                    onChange={(e) => setIssNumber(Number(e.target.value))}
                    placeholder="Issue #"
                    className="px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={issTitle}
                    onChange={(e) => setIssTitle(e.target.value)}
                    placeholder="Issue Title"
                    className="px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={issTheme}
                  onChange={(e) => setIssTheme(e.target.value)}
                  placeholder="Issue Theme (e.g. Cartographies of Voice)"
                  className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                />
                <textarea
                  rows={3}
                  required
                  value={issDesc}
                  onChange={(e) => setIssDesc(e.target.value)}
                  placeholder="Theme description and call for submissions..."
                  className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white text-xs font-bold"
                >
                  Add Issue to Editorial Calendar
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#080808]">
                Member & Author Pitches ({pitches.length})
              </h2>
              {pitches.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-white border border-[#080808]/12 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={p.status} />
                    <span className="text-xs text-[#080808]/60">
                      By {p.author_name} · {p.pitch_type}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#080808]">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#080808]/75">{p.summary}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/platform", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "review-pitch",
                            pitchId: p.id,
                            status: "approved",
                            editorFeedback:
                              "Commissioned! Our producer will follow up with scheduling.",
                          }),
                        });
                        loadAdminData();
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold"
                    >
                      Approve Pitch
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/platform", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "review-pitch",
                            pitchId: p.id,
                            status: "rejected",
                            editorFeedback:
                              "Thank you for pitching; unable to place in this issue.",
                          }),
                        });
                        loadAdminData();
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-700 text-white text-xs font-bold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: HOMEPAGE SECTIONS & HERO VIDEO SETTINGS */}
        {activeTab === "homepage_settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Homepage Section Order & Visibility */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Homepage Sections (Order & Visibility)
              </h2>
              <div className="space-y-2.5">
                {homepageSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#AA7C11]">
                          #{sec.sort_order}
                        </span>
                        <span className="font-serif font-bold text-sm text-[#080808]">
                          {sec.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#080808]/50">
                          ({sec.section_key})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleReorderSection(sec, -1)}
                        className="p-1.5 rounded-lg bg-white border border-[#080808]/15 hover:border-[#D4AF37]"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorderSection(sec, 1)}
                        className="p-1.5 rounded-lg bg-white border border-[#080808]/15 hover:border-[#D4AF37]"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSectionVisibility(sec)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                          sec.is_visible
                            ? "bg-amber-950 text-amber-300"
                            : "bg-stone-300 text-stone-700"
                        }`}
                      >
                        {sec.is_visible ? (
                          <>
                            <Eye className="w-3 h-3" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Hidden
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Video & Global Settings */}
            {settings && (
              <form
                onSubmit={handleSaveSiteSettings}
                className="lg:col-span-5 rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4"
              >
                <h2 className="font-serif text-2xl font-bold text-[#080808]">
                  Hero Video & Global Site Settings
                </h2>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#AA7C11] mb-1">
                    Admin Book &amp; Submission Notification Email (Receives Mail Texts)
                  </label>
                  <input
                    type="email"
                    value={settings.editorialEmail || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        editorialEmail: e.target.value,
                      })
                    }
                    placeholder="Enter your email address to receive book submission alerts..."
                    className="w-full px-3 py-2 mb-3 rounded-xl border-2 border-[#D4AF37] bg-[#FAF8F3] text-xs font-semibold text-[#080808]"
                  />
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Announcement Bar Text
                  </label>
                  <input
                    type="text"
                    value={settings.announcementBarText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcementBarText: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Hero Video URL (H.264 MP4)
                  </label>
                  <input
                    type="text"
                    value={settings.heroVideoUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, heroVideoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Hero Poster Image Fallback URL
                  </label>
                  <input
                    type="text"
                    value={settings.heroPosterUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, heroPosterUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Hero Dark Overlay Opacity ({settings.heroOverlayOpacity})
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.45"
                    max="0.92"
                    value={settings.heroOverlayOpacity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        heroOverlayOpacity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#080808]/20 text-xs"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-[#080808]">
                  <input
                    type="checkbox"
                    checked={settings.memberPublishingEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        memberPublishingEnabled: e.target.checked,
                      })
                    }
                  />
                  Enable Community Member & Author Publishing Studio
                </label>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#080808] text-white font-bold text-xs"
                >
                  Save Site & Hero Settings
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 8: USERS & ROLES */}
        {activeTab === "users" && (
          <div className="rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              Platform Users & Role-Based Access Control ({usersList.length})
            </h2>
            <div className="space-y-3">
              {usersList.map((u) => (
                <div
                  key={String(u.id)}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#080808]">
                        {String(u.displayName)}
                      </span>
                      <span className="text-xs text-[#080808]/60">
                        ({String(u.email)})
                      </span>
                    </div>
                    <span className="text-xs text-[#AA7C11] font-semibold">
                      Role: {String(u.role)} · Status: {String(u.accountStatus)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={String(u.role)}
                      onChange={(e) =>
                        handleUpdateUserRole(String(u.id), {
                          role: e.target.value as UserRole,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg border border-[#080808]/20 text-xs font-bold bg-white"
                    >
                      <option value="member">member</option>
                      <option value="author">author</option>
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                    {u.slug ? (
                      <Link
                        href={`/authors/${String(u.slug)}`}
                        className="px-3 py-1.5 rounded-lg bg-[#080808] text-white text-xs font-semibold"
                      >
                        Profile
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: ENQUIRIES & MEDIA */}
        {activeTab === "enquiries_media" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#080808]">
                Contact, Partnership & Newsletter Enquiries ({enquiries.length})
              </h2>
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-[#AA7C11]">
                      {enq.enquiry_type}
                    </span>
                    <StatusBadge status={enq.status} />
                  </div>
                  <div className="font-bold text-sm text-[#080808]">
                    {enq.subject} — {enq.name} ({enq.email})
                  </div>
                  <p className="text-[#080808]/75">{enq.message}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#080808]">
                Media Assets Library ({mediaAssets.length})
              </h2>
              <div className="space-y-2.5">
                {mediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#080808]/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#080808]">
                        {asset.original_name}
                      </div>
                      <div className="text-[#080808]/60 font-mono">
                        {asset.public_url} ({Math.round(asset.size_bytes / 1024)} KB)
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-[#080808] text-[#F7DF8B] text-[10px] font-bold uppercase">
                      {asset.asset_category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="rounded-3xl bg-white border border-[#080808]/12 p-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              Immutable Administrative & Publishing Audit Trail ({auditLogs.length})
            </h2>
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#080808] text-[#F7DF8B] font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                      <span className="font-bold text-[#080808]">
                        Role: {log.actor_role}
                      </span>
                      <span className="text-[#080808]/60">
                        Entity: {log.entity_type} ({log.entity_id})
                      </span>
                    </div>
                    <p className="text-[#080808]/85">{log.summary}</p>
                  </div>
                  <span className="text-[11px] font-mono text-[#080808]/55 shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

