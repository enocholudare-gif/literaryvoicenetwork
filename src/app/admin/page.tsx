"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Feather,
  Headphones,
  KeyRound,
  Layers,
  LayoutDashboard,
  Mail,
  Mic2,
  Newspaper,
  Radio,
  Send,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Cards";
import type {
  Article,
  ArticleType,
  Book,
  BookFormat,
  Broadcast,
  Profile,
  PublicationStatus,
  SiteSettingsMap,
  Submission,
  User as UserModel,
} from "@/lib/db/types";

type AdminTab =
  | "approvals"
  | "podcast"
  | "audiobook"
  | "magazine"
  | "spotlight"
  | "live_radio"
  | "catalog"
  | "settings";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("approvals");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Omit<UserModel, "password_hash"> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [settings, setSettings] = useState<SiteSettingsMap | null>(null);

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Moderation state
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [modFeedback, setModFeedback] = useState("");

  // 1. Publish Podcast Form State
  const [podTitle, setPodTitle] = useState("");
  const [podProgramme, setPodProgramme] = useState("The Meridian Conversation");
  const [podAuthorGuest, setPodAuthorGuest] = useState("");
  const [podAudioUrl, setPodAudioUrl] = useState("/media/audio/lvn-studio-preview.wav");
  const [podEpisodeNum, setPodEpisodeNum] = useState<number>(45);
  const [podDesc, setPodDesc] = useState("");
  const [podDate, setPodDate] = useState("2026-11-20T18:00:00.000Z");

  // 2. Publish Audiobook Form State
  const [abTitle, setAbTitle] = useState("");
  const [abSubtitle, setAbSubtitle] = useState("");
  const [abAuthor, setAbAuthor] = useState("");
  const [abNarrator, setAbNarrator] = useState("");
  const [abGenre, setAbGenre] = useState("Literary Fiction");
  const [abCoverUrl, setAbCoverUrl] = useState("/media/covers/the-glass-meridian.jpg");
  const [abAudibleUrl, setAbAudibleUrl] = useState("");
  const [abSpotifyUrl, setAbSpotifyUrl] = useState("");
  const [abBookshopUrl, setAbBookshopUrl] = useState("");
  const [abSynopsis, setAbSynopsis] = useState("");

  // 3. Publish Magazine Form State
  const [magTitle, setMagTitle] = useState("");
  const [magSubtitle, setMagSubtitle] = useState("");
  const [magType, setMagType] = useState<ArticleType>("essay");
  const [magAuthor, setMagAuthor] = useState("");
  const [magCoverUrl, setMagCoverUrl] = useState("/media/banners/editorial-desk.svg");
  const [magExcerpt, setMagExcerpt] = useState("");
  const [magBody, setMagBody] = useState(
    "<p class=\"lead\">Published by the Executive Editorial Desk for the LVN Digital Magazine.</p>\n<h2>Section I</h2>\n<p>Enter the long-form essay, interview, review, or cultural commentary here.</p>"
  );

  // 4. Author Spotlight Form State
  const [spotName, setSpotName] = useState("");
  const [spotHeadline, setSpotHeadline] = useState("Featured Novelist & Literary Essayist");
  const [spotBio, setSpotBio] = useState("");
  const [spotPhoto, setSpotPhoto] = useState("/media/avatars/default-portrait.svg");
  const [spotLocation, setSpotLocation] = useState("New York");
  const [spotGenres, setSpotGenres] = useState("Literary Fiction, Historical Fiction");

  // 5. Live Radio Form State
  const [radioIsLive, setRadioIsLive] = useState(false);
  const [radioTitle, setRadioTitle] = useState("Live On Air: Author Dialogues & Literary Culture");
  const [radioProgramme, setRadioProgramme] = useState("LVN Live Studio");
  const [radioStreamUrl, setRadioStreamUrl] = useState(
    "https://videotourl.com/videos/1792770791367-b8ab28bf-7cd3-46ef-8bf5-cba07b6375bb.mp4"
  );
  const [radioDesc, setRadioDesc] = useState("Live studio audio broadcast streaming worldwide across the network.");

  // 6. Settings Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newLoginEmail, setNewLoginEmail] = useState("");
  const [receivingEmail, setReceivingEmail] = useState("enquiry@literaryvoicenetwork.org");

  const loadData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();
      if (!authData.authenticated || authData.user?.role !== "admin") {
        router.push("/auth?mode=login");
        return;
      }
      setUser(authData.user);
      setProfile(authData.profile);
      setNewLoginEmail(authData.user.email);

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
        setBroadcasts(admData.broadcasts || []);
        setSettings(admData.settings || null);
        if (admData.settings?.editorialEmail) {
          setReceivingEmail(admData.settings.editorialEmail);
        }
        if (admData.settings?.liveBroadcastActive !== undefined) {
          setRadioIsLive(Boolean(admData.settings.liveBroadcastActive));
        }
      }
    } catch {
      setBanner({
        type: "error",
        text: "Could not load administrative console data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Moderate / Approve Author Submission
  const handleModerate = async (
    entityType: "book" | "article",
    entityId: string,
    nextStatus: PublicationStatus,
    authorFeedback = ""
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
        isFeatured: true,
        editorialRecommendation: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Approval update failed." });
      return;
    }
    setBanner({
      type: "success",
      text: `Success! ${entityType === "book" ? "Book" : "Publication"} is now marked as '${nextStatus}' and live on the main website.`,
    });
    setSelectedSub(null);
    setModFeedback("");
    loadData();
  };

  // 2. Publish Podcast for Author
  const handlePublishPodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-broadcast",
        broadcastData: {
          programmeName: podProgramme,
          episodeNumber: Number(podEpisodeNum) || 1,
          title: podTitle,
          hostName: profile?.display_name || "Executive Founder & CEO",
          guestName: podAuthorGuest.trim(),
          broadcastType: "podcast",
          audioFileUrl: podAudioUrl.trim(),
          description: podDesc.trim(),
          scheduledStart: podDate,
          status: "published",
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to publish podcast." });
      return;
    }
    setBanner({
      type: "success",
      text: `Podcast episode "${podTitle}" published live for author ${podAuthorGuest || "Guest"}!`,
    });
    setPodTitle("");
    setPodAuthorGuest("");
    setPodDesc("");
    loadData();
  };

  // 3. Publish Audiobook
  const handlePublishAudiobook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-book",
        publishImmediately: true,
        bookData: {
          title: abTitle.trim(),
          subtitle: abSubtitle.trim(),
          authorName: abAuthor.trim() || profile?.display_name || "Executive Founder & CEO",
          genre: abGenre,
          format: "Audiobook" as BookFormat,
          publisher: abNarrator ? `Narrated by ${abNarrator}` : "LVN Audio Editions",
          coverUrl: abCoverUrl.trim() || "/media/covers/the-glass-meridian.jpg",
          description: abSynopsis.trim(),
          retailerLinks: {
            audible: abAudibleUrl.trim(),
            spotify: abSpotifyUrl.trim(),
            bookshop: abBookshopUrl.trim(),
          },
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to publish audiobook." });
      return;
    }
    setBanner({
      type: "success",
      text: `Audiobook "${abTitle}" published live in the book directory and audiobook catalogue!`,
    });
    setAbTitle("");
    setAbSubtitle("");
    setAbAuthor("");
    setAbNarrator("");
    setAbSynopsis("");
    loadData();
  };

  // 4. Publish Magazine Article
  const handlePublishMagazine = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-article",
        publishImmediately: true,
        isFeatured: true,
        isCoverStory: magType === "cover_story",
        articleData: {
          title: magTitle.trim(),
          subtitle: magSubtitle.trim(),
          articleType: magType,
          excerpt: magExcerpt.trim(),
          bodyHtml: magBody,
          coverUrl: magCoverUrl.trim(),
          tags: ["magazine", "editorial", "digital issue"],
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to publish magazine article." });
      return;
    }
    setBanner({
      type: "success",
      text: `Magazine article "${magTitle}" published live to the Digital Magazine!`,
    });
    setMagTitle("");
    setMagSubtitle("");
    setMagExcerpt("");
    loadData();
  };

  // 5. Publish Author Spotlight
  const handlePublishSpotlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publish-author-spotlight",
        spotlightData: {
          displayName: spotName.trim(),
          headline: spotHeadline.trim(),
          bio: spotBio.trim(),
          avatarUrl: spotPhoto.trim(),
          location: spotLocation.trim(),
          genres: spotGenres.split(",").map((g) => g.trim()).filter(Boolean),
          isFeatured: true,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to publish author spotlight." });
      return;
    }
    setBanner({
      type: "success",
      text: `Author "${spotName}" published and featured in the Author Spotlight!`,
    });
    setSpotName("");
    setSpotBio("");
    loadData();
  };

  // 6. Update Live Radio
  const handleUpdateLiveRadio = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-live-radio",
        liveRadioData: {
          isLive: radioIsLive,
          liveStreamUrl: radioStreamUrl.trim(),
          title: radioTitle.trim(),
          programmeName: radioProgramme.trim(),
          hostName: profile?.display_name || "Executive Founder & CEO",
          description: radioDesc.trim(),
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to update live radio." });
      return;
    }
    setBanner({
      type: "success",
      text: radioIsLive
        ? "Live Radio is now ON AIR! Broadcast feed updated across the website and /live."
        : "Live Radio set to Off Air.",
    });
    loadData();
  };

  // 7. Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (newPassword.length < 8) {
      setBanner({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setBanner({ type: "error", text: "Password confirmation does not match." });
      return;
    }
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "change-password",
        newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to update password." });
      return;
    }
    setBanner({ type: "success", text: "Admin password successfully updated!" });
    setNewPassword("");
    setConfirmPassword("");
  };

  // 8. Update Admin Login Email
  const handleUpdateLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-login-email",
        newEmail: newLoginEmail.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to update login email." });
      return;
    }
    setBanner({ type: "success", text: `Admin login email updated to ${newLoginEmail.trim()}!` });
    loadData();
  };

  // 9. Update Receiving Email
  const handleUpdateReceivingEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-site-settings",
        settingsData: {
          editorialEmail: receivingEmail.trim(),
          pressEmail: receivingEmail.trim(),
          partnershipsEmail: receivingEmail.trim(),
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to update receiving email." });
      return;
    }
    setBanner({
      type: "success",
      text: `Notification & receiving email set to ${receivingEmail.trim()}! Authors' submissions will dispatch here.`,
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-12 text-sm text-[#080808]">
        Loading Admin Operations Console...
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(
    (s) => s.status === "submitted" || s.status === "in_review"
  );
  const audiobooks = allBooks.filter((b) => b.format === "Audiobook");

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Top Banner Header */}
      <section className="bg-[#080808] text-[#FAF8F3] border-b border-[#D4AF37]/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gold-gradient text-[10px] font-bold uppercase tracking-widest text-[#050505]">
                Admin Operations
              </span>
              <span className="text-xs text-[#D4AF37] font-semibold">
                Logged in as: {profile?.display_name || "Executive Founder & CEO"} ({user?.email})
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mt-2">
              Executive Publishing &amp; Moderation Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              ← Return to Main Website
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl border border-[#D4AF37]/40 text-xs font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/15 transition-colors"
            >
              Author Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Navigation Tabs */}
      <section className="bg-white border-b border-[#080808]/10 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-2 py-3 scrollbar-none">
            {[
              {
                id: "approvals" as AdminTab,
                label: `Author Approvals (${pendingSubmissions.length})`,
                icon: ShieldCheck,
                highlight: pendingSubmissions.length > 0,
              },
              { id: "podcast" as AdminTab, label: "Publish Podcast", icon: Headphones },
              { id: "audiobook" as AdminTab, label: "Publish Audiobook", icon: BookOpen },
              { id: "magazine" as AdminTab, label: "Publish Magazine", icon: Newspaper },
              { id: "spotlight" as AdminTab, label: "Author Spotlight", icon: Award },
              { id: "live_radio" as AdminTab, label: "Live Radio Control", icon: Radio },
              { id: "catalog" as AdminTab, label: "Published Catalog", icon: Layers },
              { id: "settings" as AdminTab, label: "Settings & Security", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-[#080808] text-[#F7DF8B] shadow-sm"
                      : tab.highlight
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-[#FAF8F3] text-[#080808]/75 hover:bg-neutral-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {banner && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm ${
              banner.type === "success"
                ? "bg-emerald-950 text-emerald-100 border border-emerald-500/40"
                : "bg-rose-950 text-rose-100 border border-rose-500/40"
            }`}
          >
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. APPROVALS TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#080808]">
                  Author Submissions Moderation Queue
                </h2>
                <p className="text-xs text-[#080808]/70">
                  Every book or article submitted by authors requires Admin approval before appearing on the main website.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#080808] text-[#F7DF8B]">
                {pendingSubmissions.length} Pending Approval
              </span>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="rounded-3xl bg-white border border-[#080808]/10 p-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-[#080808]">
                  Queue Clear — All Submissions Approved
                </h3>
                <p className="text-xs text-[#080808]/60 max-w-md mx-auto">
                  There are no author submissions waiting in the queue. When authors submit books or publications, they will appear here with mail notification text.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 rounded-3xl bg-white border-2 border-[#D4AF37]/50 shadow-md space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#080808] text-[#F7DF8B]">
                          {sub.entity_type}
                        </span>
                        <StatusBadge status={sub.status} />
                      </div>
                      <span className="text-xs text-[#080808]/70">
                        Submitted by: <strong className="text-[#080808]">{sub.author_name}</strong>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#080808]">
                        {sub.entity_title}
                      </h3>
                      {sub.submission_notes && (
                        <p className="text-xs text-[#080808]/80 mt-1 italic">
                          Author note: &ldquo;{sub.submission_notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Mail Notification Text Box */}
                    <div className="rounded-2xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/40 p-4 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-[10px] uppercase text-[#D4AF37] border-b border-white/10 pb-1 mb-1">
                        <span>✉ Mail Dispatched to {receivingEmail}</span>
                        <span>Status: {sub.status}</span>
                      </div>
                      <p><strong>Subject:</strong> [LVN Admin Approval Required] New {sub.entity_type === "book" ? "Book" : "Article"} Submitted: &ldquo;{sub.entity_title}&rdquo;</p>
                      <p><strong>Author:</strong> {sub.author_name}</p>
                      <p><strong>Notes:</strong> {sub.submission_notes || "Please review and approve for publication on Literary Voices Network."}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <Link
                        href={
                          sub.entity_type === "book"
                            ? `/books/${sub.entity_slug}`
                            : `/magazine/${sub.entity_slug}`
                        }
                        target="_blank"
                        className="text-xs font-bold text-[#AA7C11] hover:underline"
                      >
                        Inspect Preview →
                      </Link>

                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleModerate(sub.entity_type, sub.entity_id, "published", "Approved by Administrator.")}
                          className="px-5 py-2 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs hover:brightness-110 shadow-xs cursor-pointer"
                        >
                          ✓ Approve &amp; Publish to Website
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const feedback = prompt("Enter revision instructions for the author:");
                            if (feedback) {
                              handleModerate(sub.entity_type, sub.entity_id, "revision_requested", feedback);
                            }
                          }}
                          className="px-4 py-2 rounded-xl border border-amber-600/50 text-amber-900 bg-amber-50 text-xs font-semibold hover:bg-amber-100 cursor-pointer"
                        >
                          Request Revisions
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Reject this submission?")) {
                              handleModerate(sub.entity_type, sub.entity_id, "rejected", "Does not meet editorial guidelines.");
                            }
                          }}
                          className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. PUBLISH PODCAST TAB */}
        {activeTab === "podcast" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                Admin Audio Syndication
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1">
                Publish Podcast for Author
              </h2>
              <p className="text-xs text-[#080808]/70 mt-1">
                Directly syndicate and publish a podcast episode or author interview to the LVN Podcast feed and Spotify broadcast network.
              </p>
            </div>

            <form onSubmit={handlePublishPodcast} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Episode / Interview Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={podTitle}
                    onChange={(e) => setPodTitle(e.target.value)}
                    placeholder="e.g. Navigating Historical Fiction & Archives"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Featured Author / Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={podAuthorGuest}
                    onChange={(e) => setPodAuthorGuest(e.target.value)}
                    placeholder="e.g. Amara Osei"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Programme Show
                  </label>
                  <select
                    value={podProgramme}
                    onChange={(e) => setPodProgramme(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm bg-white"
                  >
                    <option>The Meridian Conversation</option>
                    <option>First Editions Live</option>
                    <option>In the Hot Seat</option>
                    <option>Atlantic Archives &amp; Voices</option>
                    <option>LVN Author Spotlight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Episode Number
                  </label>
                  <input
                    type="number"
                    value={podEpisodeNum}
                    onChange={(e) => setPodEpisodeNum(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Release Date
                  </label>
                  <input
                    type="text"
                    value={podDate}
                    onChange={(e) => setPodDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Audio Link or File Stream URL *
                </label>
                <input
                  type="text"
                  required
                  value={podAudioUrl}
                  onChange={(e) => setPodAudioUrl(e.target.value)}
                  placeholder="https://open.spotify.com/... or MP3 link"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Episode Synopsis &amp; Show Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  value={podDesc}
                  onChange={(e) => setPodDesc(e.target.value)}
                  placeholder="In-depth conversation with the author exploring themes, research, and craft..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#080808] text-[#F7DF8B] font-bold text-xs hover:bg-[#141414] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Headphones className="w-4 h-4 text-[#D4AF37]" />
                Publish Podcast to Main Site
              </button>
            </form>
          </div>
        )}

        {/* 3. PUBLISH AUDIOBOOK TAB */}
        {activeTab === "audiobook" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                Admin Audiobook Catalogue
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1">
                Publish Audiobook
              </h2>
              <p className="text-xs text-[#080808]/70 mt-1">
                Add an audiobook edition directly to the LVN Book Directory and /books?format=audiobook collection.
              </p>
            </div>

            <form onSubmit={handlePublishAudiobook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Audiobook Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={abTitle}
                    onChange={(e) => setAbTitle(e.target.value)}
                    placeholder="e.g. The Glass Meridian"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={abSubtitle}
                    onChange={(e) => setAbSubtitle(e.target.value)}
                    placeholder="e.g. An Audio Drama"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={abAuthor}
                    onChange={(e) => setAbAuthor(e.target.value)}
                    placeholder="Author name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Narrator
                  </label>
                  <input
                    type="text"
                    value={abNarrator}
                    onChange={(e) => setAbNarrator(e.target.value)}
                    placeholder="Narrated by..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Genre
                  </label>
                  <select
                    value={abGenre}
                    onChange={(e) => setAbGenre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm bg-white"
                  >
                    <option>Literary Fiction</option>
                    <option>Historical Fiction</option>
                    <option>Speculative Fiction</option>
                    <option>Poetry</option>
                    <option>Non-Fiction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={abCoverUrl}
                  onChange={(e) => setAbCoverUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Audible URL
                  </label>
                  <input
                    type="url"
                    value={abAudibleUrl}
                    onChange={(e) => setAbAudibleUrl(e.target.value)}
                    placeholder="https://audible.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Spotify Audio Link
                  </label>
                  <input
                    type="url"
                    value={abSpotifyUrl}
                    onChange={(e) => setAbSpotifyUrl(e.target.value)}
                    placeholder="https://spotify.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Bookshop / Store Link
                  </label>
                  <input
                    type="url"
                    value={abBookshopUrl}
                    onChange={(e) => setAbBookshopUrl(e.target.value)}
                    placeholder="https://bookshop.org/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Synopsis &amp; Production Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={abSynopsis}
                  onChange={(e) => setAbSynopsis(e.target.value)}
                  placeholder="Complete jacket synopsis of this audiobook edition..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#080808] text-[#F7DF8B] font-bold text-xs hover:bg-[#141414] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                Publish Audiobook to Directory
              </button>
            </form>
          </div>
        )}

        {/* 4. PUBLISH MAGAZINE TAB */}
        {activeTab === "magazine" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                LVN Digital Magazine Studio
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1">
                Publish Magazine Article or Essay
              </h2>
              <p className="text-xs text-[#080808]/70 mt-1">
                Publish long-form literary essays, critical reviews, author interviews, or lifestyle dispatches live to /magazine.
              </p>
            </div>

            <form onSubmit={handlePublishMagazine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={magTitle}
                    onChange={(e) => setMagTitle(e.target.value)}
                    placeholder="Article title"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={magSubtitle}
                    onChange={(e) => setMagSubtitle(e.target.value)}
                    placeholder="Subtitle or thesis statement"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Article Category / Type
                  </label>
                  <select
                    value={magType}
                    onChange={(e) => setMagType(e.target.value as ArticleType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm bg-white"
                  >
                    <option value="essay">Essay &amp; Critical Commentary</option>
                    <option value="interview">Author Interview</option>
                    <option value="review">Book Review</option>
                    <option value="cover_story">Cover Story</option>
                    <option value="lifestyle">Literary Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Cover Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={magCoverUrl}
                    onChange={(e) => setMagCoverUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Lead Excerpt (Summary for Magazine Cards) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={magExcerpt}
                  onChange={(e) => setMagExcerpt(e.target.value)}
                  placeholder="One or two sentences summarizing the piece for readers..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Full Article Body (HTML / Prose) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={magBody}
                  onChange={(e) => setMagBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#080808] text-[#F7DF8B] font-bold text-xs hover:bg-[#141414] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Newspaper className="w-4 h-4 text-[#D4AF37]" />
                Publish to Digital Magazine
              </button>
            </form>
          </div>
        )}

        {/* 5. AUTHOR SPOTLIGHT TAB */}
        {activeTab === "spotlight" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                Author Spotlight Management
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1">
                Publish Author Spotlight
              </h2>
              <p className="text-xs text-[#080808]/70 mt-1">
                Feature an author in the dedicated Author Spotlight navigation section (/authors and /author-spotlight).
              </p>
            </div>

            <form onSubmit={handlePublishSpotlight} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Author Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. Chinua Achebe or Amara Osei"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Headline / Byline
                  </label>
                  <input
                    type="text"
                    value={spotHeadline}
                    onChange={(e) => setSpotHeadline(e.target.value)}
                    placeholder="e.g. Prize-Winning Historical Novelist"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Author Photo URL
                  </label>
                  <input
                    type="text"
                    value={spotPhoto}
                    onChange={(e) => setSpotPhoto(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={spotLocation}
                    onChange={(e) => setSpotLocation(e.target.value)}
                    placeholder="e.g. London &amp; New York"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Primary Genres (comma separated)
                </label>
                <input
                  type="text"
                  value={spotGenres}
                  onChange={(e) => setSpotGenres(e.target.value)}
                  placeholder="Literary Fiction, Historical Fiction, Essays"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Author Spotlight Biography &amp; Recognition *
                </label>
                <textarea
                  rows={4}
                  required
                  value={spotBio}
                  onChange={(e) => setSpotBio(e.target.value)}
                  placeholder="Comprehensive profile of the author's work, honours, and contribution to literature..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs hover:brightness-110 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#050505]" />
                Publish to Author Spotlight
              </button>
            </form>
          </div>
        )}

        {/* 6. LIVE RADIO CONTROL TAB */}
        {activeTab === "live_radio" && (
          <div className="max-w-3xl bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                Master Broadcast Feed
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1">
                Live Radio Control
              </h2>
              <p className="text-xs text-[#080808]/70 mt-1">
                Control the network&apos;s 24/7 Live Radio status, broadcast title, and stream feed across /live and homepage.
              </p>
            </div>

            <form onSubmit={handleUpdateLiveRadio} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#080808] text-white flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Broadcast Transmission Status</p>
                  <p className="text-xs text-[#F7DF8B]">
                    {radioIsLive ? "● Currently Broadcasting Live On Air" : "○ Currently Off Air"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRadioIsLive(!radioIsLive)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    radioIsLive
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-[#25D366] hover:bg-[#20ba5a] text-white"
                  }`}
                >
                  {radioIsLive ? "Switch to Off Air" : "Go Live On Air"}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Current Live Show Title *
                </label>
                <input
                  type="text"
                  required
                  value={radioTitle}
                  onChange={(e) => setRadioTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Station / Programme
                  </label>
                  <input
                    type="text"
                    value={radioProgramme}
                    onChange={(e) => setRadioProgramme(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Stream / HLS / Media Feed URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={radioStreamUrl}
                    onChange={(e) => setRadioStreamUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Live Show Description
                </label>
                <textarea
                  rows={3}
                  value={radioDesc}
                  onChange={(e) => setRadioDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#080808] text-[#F7DF8B] font-bold text-xs hover:bg-[#141414] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-[#D4AF37]" />
                Update Live Radio Configuration
              </button>
            </form>
          </div>
        )}

        {/* 7. SETTINGS & SECURITY TAB */}
        {activeTab === "settings" && (
          <div className="max-w-3xl space-y-8">
            {/* Password Change Form */}
            <div className="bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-5 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                  Authentication
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                  Change Admin Password
                </h2>
                <p className="text-xs text-[#080808]/70 mt-1">
                  Update the password required to sign in to the Admin Operations Console.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      New Password (Min 8 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414] transition-colors cursor-pointer"
                >
                  Save New Password
                </button>
              </form>
            </div>

            {/* Change Admin Login Email */}
            <div className="bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-5 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                  Account Identity
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#D4AF37]" />
                  Update Admin Login Email
                </h2>
                <p className="text-xs text-[#080808]/70 mt-1">
                  Change the email used to authenticate into this Admin Console.
                </p>
              </div>

              <form onSubmit={handleUpdateLoginEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Admin Sign-In Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newLoginEmail}
                    onChange={(e) => setNewLoginEmail(e.target.value)}
                    placeholder="perrycreativity@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414] transition-colors cursor-pointer"
                >
                  Update Admin Login Email
                </button>
              </form>
            </div>

            {/* Update Email for Receiving Requests & Submissions */}
            <div className="bg-white rounded-3xl border border-[#080808]/12 p-8 space-y-5 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
                  Communications &amp; Notifications
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#D4AF37]" />
                  Receiving Email for Submissions &amp; Requests
                </h2>
                <p className="text-xs text-[#080808]/70 mt-1">
                  Where email dispatches for book submissions, author pitches, and contact requests are forwarded.
                </p>
              </div>

              <form onSubmit={handleUpdateReceivingEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Forwarding / Dispatch Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={receivingEmail}
                    onChange={(e) => setReceivingEmail(e.target.value)}
                    placeholder="enquiry@literaryvoicenetwork.org"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#080808] text-white text-xs space-y-1 font-mono">
                  <p className="text-[#D4AF37] font-bold">SMTP Transport Configuration:</p>
                  <p>• Dispatch Target: {receivingEmail}</p>
                  <p>• SMTP Environment: {process.env.SMTP_HOST ? `Active (${process.env.SMTP_HOST})` : "Standard Server Mail Transport"}</p>
                  <p>• Fallback: Direct In-Database Activity Logging &amp; Resend</p>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414] transition-colors cursor-pointer"
                >
                  Save Receiving Email
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 8. CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Published Website Catalogue
              </h2>
              <p className="text-xs text-[#080808]/70">
                Overview of verified books, audiobooks, and magazine articles published live across the network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Published Books & Audiobooks */}
              <div className="bg-white rounded-3xl border border-[#080808]/12 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#080808] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#AA7C11]" />
                    Books &amp; Audiobooks ({allBooks.length})
                  </h3>
                  <span className="text-xs text-[#080808]/60">{audiobooks.length} Audiobooks</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allBooks.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#080808]/8 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-bold text-[#080808] truncate">{b.title}</p>
                        <p className="text-[#080808]/60 text-[11px] truncate">
                          By {b.author_name} · {b.format} · {b.genre}
                        </p>
                      </div>
                      <Link
                        href={`/books/${b.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-[#AA7C11] hover:underline shrink-0"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Published Magazine Articles */}
              <div className="bg-white rounded-3xl border border-[#080808]/12 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#080808] flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-[#AA7C11]" />
                    Magazine Articles &amp; Essays ({allArticles.length})
                  </h3>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allArticles.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#080808]/8 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-bold text-[#080808] truncate">{a.title}</p>
                        <p className="text-[#080808]/60 text-[11px] truncate">
                          {a.article_type} · By {a.author_name}
                        </p>
                      </div>
                      <Link
                        href={`/magazine/${a.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-[#AA7C11] hover:underline shrink-0"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
