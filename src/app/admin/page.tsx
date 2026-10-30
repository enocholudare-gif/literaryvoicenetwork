"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Feather,
  Headphones,
  Image as ImageIcon,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Mic2,
  Newspaper,
  Radio,
  Send,
  Settings,
  ShieldCheck,
  Upload,
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
  | "books"
  | "podcast"
  | "audiobook"
  | "magazine"
  | "spotlight"
  | "live_radio"
  | "catalog"
  | "settings";

const PRESET_COVERS = [
  { name: "The Glass Meridian", url: "/media/covers/the-glass-meridian.jpg" },
  { name: "Atlas of Quiet Cities", url: "/media/covers/atlas-of-quiet-cities.jpg" },
  { name: "The Saltwater Ledger", url: "/media/covers/the-saltwater-ledger.jpg" },
  { name: "Winter Harmonics", url: "/media/covers/winter-harmonics.jpg" },
  { name: "Republic of Typesetters", url: "/media/covers/republic-of-typesetters.jpg" },
  { name: "Redwood Echo", url: "/media/covers/cover-redwood.jpg" },
  { name: "The Scoundrel", url: "/media/covers/cover-scoundrel.jpg" },
  { name: "The Librarian", url: "/media/covers/cover-librarian.jpg" },
];

/* ──────────────────────────────────────────────────────────
   Reusable Image Upload & Live Preview Field
────────────────────────────────────────────────────────── */
function ImageUploadField({
  label,
  value,
  onChange,
  aspect = "book",
  helperText,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: "book" | "square" | "wide";
  helperText?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetCategory", "editorial");
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.asset?.url) {
        onChange(data.asset.url);
        setUploading(false);
        return;
      }
    } catch {
      // Fallback below
    }

    // Fallback: FileReader Base64 Data URL
    const reader = new FileReader();
    reader.onload = (evt) => {
      onChange(String(evt.target?.result || ""));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#080808] uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="size-3.5 text-[#D4AF37]" />
          {label}
        </label>
        {aspect === "book" && (
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] font-semibold text-[#D4AF37] hover:underline cursor-pointer"
          >
            {showPresets ? "Close Library" : "Choose from LVN Library"}
          </button>
        )}
      </div>

      {showPresets && (
        <div className="p-3 rounded-2xl border border-[#D4AF37]/40 bg-[#141414] text-white grid grid-cols-2 sm:grid-cols-4 gap-2.5 shadow-md">
          {PRESET_COVERS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                onChange(preset.url);
                setShowPresets(false);
              }}
              className={`flex items-center gap-2 p-1.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                value === preset.url
                  ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#F7DF8B] font-bold"
                  : "border-white/10 hover:border-white/30 text-white/80"
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="size-8 object-cover rounded shadow"
              />
              <span className="truncate">{preset.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start bg-white p-3.5 rounded-2xl border border-[#080808]/10 shadow-xs">
        {/* Thumbnail Preview */}
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-[#D4AF37]/50 bg-[#080808] shadow flex items-center justify-center ${
            aspect === "book"
              ? "w-24 h-32"
              : aspect === "square"
              ? "w-24 h-24 rounded-full"
              : "w-40 h-24"
          }`}
        >
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-2 text-white/40 text-[10px]">
              No Image
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px] text-[#F7DF8B] font-bold">
              Uploading…
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2.5 w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37] bg-gold-gradient px-3.5 py-2 text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Upload className="size-3.5" />
              <span>{value ? "Upload Different Image" : "Upload Image from Device"}</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-600 hover:text-black hover:border-black cursor-pointer transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#080808]/60 uppercase tracking-wider block">
              Or paste hosted image URL:
            </label>
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or /media/covers/..."
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs text-[#080808] placeholder:text-neutral-400 focus:border-[#D4AF37] focus:bg-white focus:outline-none"
            />
          </div>
          {helperText && (
            <p className="text-[11px] text-neutral-500">{helperText}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Admin Dashboard Component
────────────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("approvals");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Omit<UserModel, "password_hash"> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Authentication State for unauthenticated visitors
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState("perrycreativity@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

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
  const [modEditCoverUrl, setModEditCoverUrl] = useState("");

  // 1. Publish Book for Author State
  const [bkTitle, setBkTitle] = useState("");
  const [bkSubtitle, setBkSubtitle] = useState("");
  const [bkAuthor, setBkAuthor] = useState("");
  const [bkGenre, setBkGenre] = useState("Literary Fiction");
  const [bkFormat, setBkFormat] = useState<BookFormat>("Hardcover");
  const [bkPublisher, setBkPublisher] = useState("LVN Imprint Editions");
  const [bkCoverUrl, setBkCoverUrl] = useState("/media/covers/the-glass-meridian.jpg");
  const [bkSynopsis, setBkSynopsis] = useState("");
  const [bkExcerpt, setBkExcerpt] = useState("");
  const [bkAmazon, setBkAmazon] = useState("");
  const [bkBookshop, setBkBookshop] = useState("");
  const [bkBarnes, setBkBarnes] = useState("");

  // 2. Publish Podcast Form State
  const [podTitle, setPodTitle] = useState("");
  const [podProgramme, setPodProgramme] = useState("The Meridian Conversation");
  const [podAuthorGuest, setPodAuthorGuest] = useState("");
  const [podCoverUrl, setPodCoverUrl] = useState("/media/covers/atlas-of-quiet-cities.jpg");
  const [podAudioUrl, setPodAudioUrl] = useState("/media/audio/lvn-studio-preview.wav");
  const [podEpisodeNum, setPodEpisodeNum] = useState<number>(45);
  const [podDesc, setPodDesc] = useState("");
  const [podDate, setPodDate] = useState("2026-11-20T18:00:00.000Z");

  // 3. Publish Audiobook Form State
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

  // 4. Publish Magazine Form State
  const [magTitle, setMagTitle] = useState("");
  const [magSubtitle, setMagSubtitle] = useState("");
  const [magType, setMagType] = useState<ArticleType>("essay");
  const [magAuthor, setMagAuthor] = useState("");
  const [magCoverUrl, setMagCoverUrl] = useState("/media/banners/editorial-desk.svg");
  const [magExcerpt, setMagExcerpt] = useState("");
  const [magBody, setMagBody] = useState(
    "<p class=\"lead\">Published by the Executive Editorial Desk for the LVN Digital Magazine.</p>\n<h2>Section I</h2>\n<p>Enter the long-form essay, interview, review, or cultural commentary here.</p>"
  );

  // 5. Author Spotlight Form State
  const [spotName, setSpotName] = useState("");
  const [spotHeadline, setSpotHeadline] = useState("Featured Novelist & Literary Essayist");
  const [spotBio, setSpotBio] = useState("");
  const [spotPhoto, setSpotPhoto] = useState("/media/avatars/default-portrait.svg");
  const [spotLocation, setSpotLocation] = useState("New York");
  const [spotGenres, setSpotGenres] = useState("Literary Fiction, Historical Fiction");

  // 6. Live Radio Form State
  const [radioIsLive, setRadioIsLive] = useState(false);
  const [radioTitle, setRadioTitle] = useState("Live On Air: Author Dialogues & Literary Culture");
  const [radioProgramme, setRadioProgramme] = useState("LVN Live Studio");
  const [radioStreamUrl, setRadioStreamUrl] = useState(
    "https://videotourl.com/videos/1792770791367-b8ab28bf-7cd3-46ef-8bf5-cba07b6375bb.mp4"
  );
  const [radioDesc, setRadioDesc] = useState("Live studio audio broadcast streaming worldwide across the network.");

  // 7. Settings Form State
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
        setIsAuthenticatedAdmin(false);
        setLoading(false);
        return;
      }
      setIsAuthenticatedAdmin(true);
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
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Direct In-Page Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.user?.role !== "admin") {
        setLoginError(data.error || "Access denied. Only authorized administrators may log in.");
        setLoginLoading(false);
        return;
      }
      setIsAuthenticatedAdmin(true);
      setUser(data.user);
      setProfile(data.profile);
      loadData();
    } catch {
      setLoginError("Network connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. Author Moderation Approval Handler
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

  // 2. Publish Book for Author
  const handlePublishBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-book",
        publishImmediately: true,
        bookData: {
          title: bkTitle.trim(),
          subtitle: bkSubtitle.trim(),
          authorName: bkAuthor.trim() || profile?.display_name || "Author",
          genre: bkGenre,
          format: bkFormat,
          publisher: bkPublisher.trim(),
          coverUrl: bkCoverUrl.trim() || "/media/covers/the-glass-meridian.jpg",
          description: bkSynopsis.trim(),
          excerpt: bkExcerpt.trim(),
          retailerLinks: {
            amazon: bkAmazon.trim(),
            bookshop: bkBookshop.trim(),
            barnesAndNoble: bkBarnes.trim(),
          },
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to publish book." });
      return;
    }
    setBanner({
      type: "success",
      text: `Book "${bkTitle}" has been published directly to the main website shelf and directory for author "${bkAuthor || "Author"}"!`,
    });
    setBkTitle("");
    setBkSubtitle("");
    setBkAuthor("");
    setBkSynopsis("");
    setBkExcerpt("");
    loadData();
  };

  // 3. Publish Podcast for Author
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
          featuredImageUrl: podCoverUrl.trim(),
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

  // 4. Publish Audiobook
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

  // 5. Publish Magazine Article
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

  // 6. Publish Author Spotlight
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

  // 7. Master Live Radio Toggle
  const handleToggleRadio = async (nextState: boolean) => {
    setBanner(null);
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-live-radio",
        isLive: nextState,
        title: radioTitle.trim(),
        streamUrl: radioStreamUrl.trim(),
        programmeName: radioProgramme.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: data.error || "Failed to update Live Radio feed." });
      return;
    }
    setRadioIsLive(nextState);
    setBanner({
      type: "success",
      text: `Live Radio Master Feed updated! Live broadcast is now ${
        nextState ? "ON AIR (Streaming Live worldwide)" : "OFF AIR"
      }.`,
    });
    loadData();
  };

  // 8. Update Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!newPassword || newPassword.length < 8) {
      setBanner({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setBanner({ type: "error", text: "New password and confirmation do not match." });
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
      setBanner({ type: "error", text: data.error || "Failed to change password." });
      return;
    }
    setBanner({ type: "success", text: "Admin password successfully updated!" });
    setNewPassword("");
    setConfirmPassword("");
  };

  // 9. Update Login Email
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

  // 10. Update Receiving Email
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
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-[#D4AF37] animate-spin" />
          <span className="font-semibold">Loading Admin Operations Console...</span>
        </div>
      </div>
    );
  }

  // ── Unauthenticated Admin Gateway Login Screen ──
  if (isAuthenticatedAdmin === false) {
    return (
      <div className="min-h-[85vh] bg-[#060606] text-[#FAF8F3] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 rounded-3xl border border-[#D4AF37]/40 bg-[#0e0e0e] shadow-[0_8px_32px_rgba(0,0,0,0.8)] space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-[10px] font-bold uppercase tracking-widest text-[#050505]">
              <ShieldCheck className="size-3.5" />
              Executive Admin Gateway
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#FAF8F3]">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#FAF8F3]/60">
              Sign in with your pre-authorized administrator credentials to access the moderation queue, publishing controls, and live radio feed.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl border border-rose-500/50 bg-rose-950/70 text-xs text-rose-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F7DF8B]">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="perrycreativity@gmail.com"
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F7DF8B]">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-gold-gradient py-3 text-xs font-bold text-[#050505] shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {loginLoading ? "Authenticating Admin…" : "Sign In to Admin Console"}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <Link
              href="/"
              className="text-xs text-white/50 hover:text-[#F7DF8B] transition-colors"
            >
              ← Return to Main Website
            </Link>
          </div>
        </div>
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
              <span className="text-xs text-white/60">
                Connected: <strong className="text-[#F7DF8B]">{user?.email}</strong>
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-[#FAF8F3]">
              Executive Publishing & Broadcast Control
            </h1>
            <p className="text-xs text-[#FAF8F3]/75 mt-1 max-w-2xl">
              Centralized command for author approvals, live radio broadcast, podcasts, audiobooks, digital magazines, and author spotlight.
            </p>
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
              { id: "books" as AdminTab, label: "Publish Book for Author", icon: BookOpen },
              { id: "podcast" as AdminTab, label: "Publish Podcast", icon: Headphones },
              { id: "audiobook" as AdminTab, label: "Publish Audiobook", icon: Mic2 },
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-700">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                Alerts dispatched to: <span className="text-[#080808] font-bold">{receivingEmail}</span>
              </div>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-neutral-200 bg-white space-y-3">
                <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#080808]">
                  Queue Clear — All Submissions Approved!
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  There are no pending submissions awaiting review. When an author submits a book or article, it will immediately appear here for your review and notification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingSubmissions.map((sub) => {
                  const isBook = sub.entity_type === "book";
                  const entity = isBook
                    ? allBooks.find((b) => b.id === sub.entity_id)
                    : allArticles.find((a) => a.id === sub.entity_id);

                  return (
                    <div
                      key={sub.id}
                      className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                            {isBook ? "Book Submission" : "Article Submission"}
                          </span>
                          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(sub.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-4 items-start">
                          {isBook && entity && (
                            <img
                              src={(entity as Book).cover_url || "/media/covers/the-glass-meridian.jpg"}
                              alt="Book Cover"
                              className="w-16 h-22 object-cover rounded-lg border border-neutral-200 shrink-0 shadow-xs"
                            />
                          )}
                          <div className="space-y-1 flex-1">
                            <h3 className="font-serif text-xl font-bold text-[#080808]">
                              {entity?.title || "Untitled Submission"}
                            </h3>
                            <p className="text-xs text-neutral-600 font-medium">
                              Author: <strong className="text-neutral-900">{sub.author_name || "Author"}</strong>
                            </p>
                            {sub.submission_notes && (
                              <p className="text-xs text-neutral-500 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                                "{sub.submission_notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {entity && (
                          <div className="text-xs text-neutral-600 space-y-1.5 pt-2 border-t border-neutral-100">
                            {isBook ? (
                              <>
                                <p><strong>Genre:</strong> {(entity as Book).genre}</p>
                                <p><strong>Format:</strong> {(entity as Book).format}</p>
                                <p className="line-clamp-2"><strong>Synopsis:</strong> {(entity as Book).description}</p>
                              </>
                            ) : (
                              <>
                                <p><strong>Type:</strong> {(entity as Article).article_type}</p>
                                <p className="line-clamp-2"><strong>Excerpt:</strong> {(entity as Article).excerpt}</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-neutral-200 space-y-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleModerate(sub.entity_type, sub.entity_id, "published", "Approved by Executive Founder & CEO")}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer text-center"
                          >
                            ✓ Approve & Publish to Main Site
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSub(selectedSub?.id === sub.id ? null : sub)}
                            className="py-2.5 px-4 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                          >
                            Details & Feedback
                          </button>
                        </div>

                        {selectedSub?.id === sub.id && (
                          <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                            <label className="text-xs font-semibold text-neutral-800 block">
                              Editorial Feedback to Author:
                            </label>
                            <textarea
                              rows={2}
                              value={modFeedback}
                              onChange={(e) => setModFeedback(e.target.value)}
                              placeholder="Optional notes or feedback sent to author..."
                              className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleModerate(sub.entity_type, sub.entity_id, "published", modFeedback)}
                                className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                              >
                                Approve with Note
                              </button>
                              <button
                                type="button"
                                onClick={() => handleModerate(sub.entity_type, sub.entity_id, "revision_requested", modFeedback)}
                                className="flex-1 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
                              >
                                Request Revision
                              </button>
                              <button
                                type="button"
                                onClick={() => handleModerate(sub.entity_type, sub.entity_id, "rejected", modFeedback)}
                                className="py-2 px-3 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. PUBLISH BOOK FOR AUTHOR TAB */}
        {activeTab === "books" && (
          <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6 shadow-xs max-w-4xl mx-auto">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Publish Book for Author
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Publish any author's book directly to the main LVN website, 3D Interactive Shelf, charts, and public book directory.
              </p>
            </div>

            <form onSubmit={handlePublishBook} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={bkTitle}
                    onChange={(e) => setBkTitle(e.target.value)}
                    placeholder="e.g. The Architecture of Silence"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={bkSubtitle}
                    onChange={(e) => setBkSubtitle(e.target.value)}
                    placeholder="e.g. Essays on Solitude and Craft"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={bkAuthor}
                    onChange={(e) => setBkAuthor(e.target.value)}
                    placeholder="e.g. Maya Thorne"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Primary Genre</label>
                  <select
                    value={bkGenre}
                    onChange={(e) => setBkGenre(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Literary Fiction">Literary Fiction</option>
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Poetry">Poetry</option>
                    <option value="Memoir">Memoir</option>
                    <option value="Science Fiction & Fantasy">Science Fiction & Fantasy</option>
                    <option value="Mystery & Thriller">Mystery & Thriller</option>
                    <option value="Philosophy & Culture">Philosophy & Culture</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Format</label>
                  <select
                    value={bkFormat}
                    onChange={(e) => setBkFormat(e.target.value as BookFormat)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Hardcover">Hardcover</option>
                    <option value="Paperback">Paperback</option>
                    <option value="Audiobook">Audiobook</option>
                    <option value="eBook">eBook</option>
                  </select>
                </div>
              </div>

              {/* Book Cover Image Upload */}
              <ImageUploadField
                label="Book Cover Art"
                value={bkCoverUrl}
                onChange={setBkCoverUrl}
                aspect="book"
                helperText="Upload cover image directly from your phone/computer, or pick from our high-resolution library."
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Publisher / Imprint</label>
                <input
                  type="text"
                  value={bkPublisher}
                  onChange={(e) => setBkPublisher(e.target.value)}
                  placeholder="e.g. LVN Press / Riverhead Books"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Book Synopsis / Description *</label>
                <textarea
                  rows={4}
                  required
                  value={bkSynopsis}
                  onChange={(e) => setBkSynopsis(e.target.value)}
                  placeholder="Enter the full book synopsis and thematic overview..."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Book Excerpt / Opening Chapter (Optional)</label>
                <textarea
                  rows={3}
                  value={bkExcerpt}
                  onChange={(e) => setBkExcerpt(e.target.value)}
                  placeholder="Paste excerpt or sample passage for reader previews..."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Amazon Link</label>
                  <input
                    type="url"
                    value={bkAmazon}
                    onChange={(e) => setBkAmazon(e.target.value)}
                    placeholder="https://amazon.com/dp/..."
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Bookshop.org Link</label>
                  <input
                    type="url"
                    value={bkBookshop}
                    onChange={(e) => setBkBookshop(e.target.value)}
                    placeholder="https://bookshop.org/..."
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Barnes & Noble Link</label>
                  <input
                    type="url"
                    value={bkBarnes}
                    onChange={(e) => setBkBarnes(e.target.value)}
                    placeholder="https://barnesandnoble.com/..."
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gold-gradient text-xs font-bold text-[#050505] shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Publish Book Directly to Live Website
              </button>
            </form>
          </div>
        )}

        {/* 3. PUBLISH PODCAST TAB */}
        {activeTab === "podcast" && (
          <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6 shadow-xs max-w-4xl mx-auto">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Publish Podcast for Author
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Release an audio podcast interview or feature to the network feed and Spotify syndicate.
              </p>
            </div>

            <form onSubmit={handlePublishPodcast} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Episode Title *</label>
                  <input
                    type="text"
                    required
                    value={podTitle}
                    onChange={(e) => setPodTitle(e.target.value)}
                    placeholder="e.g. Dialogue: The Interior Landscape"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Featured Author / Guest *</label>
                  <input
                    type="text"
                    required
                    value={podAuthorGuest}
                    onChange={(e) => setPodAuthorGuest(e.target.value)}
                    placeholder="e.g. Julian Hayes"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Podcast Cover Art Upload */}
              <ImageUploadField
                label="Podcast Episode Cover Art"
                value={podCoverUrl}
                onChange={setPodCoverUrl}
                aspect="wide"
                helperText="Upload episode artwork or banner image."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Show / Programme</label>
                  <input
                    type="text"
                    value={podProgramme}
                    onChange={(e) => setPodProgramme(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Episode Number</label>
                  <input
                    type="number"
                    value={podEpisodeNum}
                    onChange={(e) => setPodEpisodeNum(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Scheduled Air Date</label>
                  <input
                    type="text"
                    value={podDate}
                    onChange={(e) => setPodDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Audio Stream / File URL</label>
                <input
                  type="url"
                  value={podAudioUrl}
                  onChange={(e) => setPodAudioUrl(e.target.value)}
                  placeholder="https://... audio file"
                  className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Episode Show Notes / Description</label>
                <textarea
                  rows={3}
                  value={podDesc}
                  onChange={(e) => setPodDesc(e.target.value)}
                  placeholder="Detailed synopsis of the podcast dialogue..."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gold-gradient text-xs font-bold text-[#050505] shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Publish Podcast Episode Live
              </button>
            </form>
          </div>
        )}

        {/* 4. PUBLISH AUDIOBOOK TAB */}
        {activeTab === "audiobook" && (
          <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6 shadow-xs max-w-4xl mx-auto">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Publish Audiobook
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Add an audiobook edition with retail stream links to Spotify, Audible, and Bookshop.
              </p>
            </div>

            <form onSubmit={handlePublishAudiobook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Audiobook Title *</label>
                  <input
                    type="text"
                    required
                    value={abTitle}
                    onChange={(e) => setAbTitle(e.target.value)}
                    placeholder="e.g. The Saltwater Ledger"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Subtitle</label>
                  <input
                    type="text"
                    value={abSubtitle}
                    onChange={(e) => setAbSubtitle(e.target.value)}
                    placeholder="e.g. Unabridged Edition"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author *</label>
                  <input
                    type="text"
                    required
                    value={abAuthor}
                    onChange={(e) => setAbAuthor(e.target.value)}
                    placeholder="Author name"
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Narrator</label>
                  <input
                    type="text"
                    value={abNarrator}
                    onChange={(e) => setAbNarrator(e.target.value)}
                    placeholder="Narrator name"
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Genre</label>
                  <select
                    value={abGenre}
                    onChange={(e) => setAbGenre(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Literary Fiction">Literary Fiction</option>
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Poetry">Poetry</option>
                    <option value="Memoir">Memoir</option>
                  </select>
                </div>
              </div>

              {/* Audiobook Cover Upload */}
              <ImageUploadField
                label="Audiobook Cover Art"
                value={abCoverUrl}
                onChange={setAbCoverUrl}
                aspect="book"
                helperText="Upload square or book cover art for the audiobook."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Audible URL</label>
                  <input
                    type="url"
                    value={abAudibleUrl}
                    onChange={(e) => setAbAudibleUrl(e.target.value)}
                    placeholder="https://audible.com/..."
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Spotify URL</label>
                  <input
                    type="url"
                    value={abSpotifyUrl}
                    onChange={(e) => setAbSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/..."
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Bookshop.org URL</label>
                  <input
                    type="url"
                    value={abBookshopUrl}
                    onChange={(e) => setAbBookshopUrl(e.target.value)}
                    placeholder="https://bookshop.org/..."
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Audiobook Synopsis</label>
                <textarea
                  rows={3}
                  value={abSynopsis}
                  onChange={(e) => setAbSynopsis(e.target.value)}
                  placeholder="Audiobook description and narrator performance notes..."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gold-gradient text-xs font-bold text-[#050505] shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Publish Audiobook Live
              </button>
            </form>
          </div>
        )}

        {/* 5. PUBLISH MAGAZINE TAB */}
        {activeTab === "magazine" && (
          <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6 shadow-xs max-w-4xl mx-auto">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Publish Digital Magazine Article
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Publish long-form cover stories, essays, and critical reviews to the LVN Digital Magazine.
              </p>
            </div>

            <form onSubmit={handlePublishMagazine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={magTitle}
                    onChange={(e) => setMagTitle(e.target.value)}
                    placeholder="e.g. The Persistence of Ink"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Subtitle / Deck</label>
                  <input
                    type="text"
                    value={magSubtitle}
                    onChange={(e) => setMagSubtitle(e.target.value)}
                    placeholder="e.g. Why the printed volume defies obsolescence"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Article Format</label>
                  <select
                    value={magType}
                    onChange={(e) => setMagType(e.target.value as ArticleType)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="cover_story">Magazine Cover Story</option>
                    <option value="essay">Literary Essay</option>
                    <option value="interview">In-Depth Author Interview</option>
                    <option value="review">Book Review & Critique</option>
                    <option value="culture">Cultural Commentary</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author / Contributor</label>
                  <input
                    type="text"
                    value={magAuthor}
                    onChange={(e) => setMagAuthor(e.target.value)}
                    placeholder="Executive Editorial Desk"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Magazine Cover Upload */}
              <ImageUploadField
                label="Featured Editorial Cover Image"
                value={magCoverUrl}
                onChange={setMagCoverUrl}
                aspect="wide"
                helperText="Upload editorial header banner or feature photo."
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Excerpt / Pull Quote</label>
                <textarea
                  rows={2}
                  value={magExcerpt}
                  onChange={(e) => setMagExcerpt(e.target.value)}
                  placeholder="Short introductory summary for magazine indexes..."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Article Content (HTML or formatted text)</label>
                <textarea
                  rows={8}
                  value={magBody}
                  onChange={(e) => setMagBody(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs font-mono text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gold-gradient text-xs font-bold text-[#050505] shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Publish Magazine Article Live
              </button>
            </form>
          </div>
        )}

        {/* 6. AUTHOR SPOTLIGHT TAB */}
        {activeTab === "spotlight" && (
          <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6 shadow-xs max-w-4xl mx-auto">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Publish Author Spotlight
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Highlight and feature authors in the official Author Spotlight on the top navigation bar and homepage.
              </p>
            </div>

            <form onSubmit={handlePublishSpotlight} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author Full Name *</label>
                  <input
                    type="text"
                    required
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. Celeste Vane"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Spotlight Headline</label>
                  <input
                    type="text"
                    value={spotHeadline}
                    onChange={(e) => setSpotHeadline(e.target.value)}
                    placeholder="e.g. Winner of the 2026 National Narrative Prize"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Author Portrait Upload */}
              <ImageUploadField
                label="Author Portrait Photo"
                value={spotPhoto}
                onChange={setSpotPhoto}
                aspect="square"
                helperText="Upload author headshot or select from media directory."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Location</label>
                  <input
                    type="text"
                    value={spotLocation}
                    onChange={(e) => setSpotLocation(e.target.value)}
                    placeholder="e.g. Dublin, Ireland"
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={spotGenres}
                    onChange={(e) => setSpotGenres(e.target.value)}
                    placeholder="Literary Fiction, Poetry, Cultural Criticism"
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Author Bio & Spotlight Statement</label>
                <textarea
                  rows={4}
                  value={spotBio}
                  onChange={(e) => setSpotBio(e.target.value)}
                  placeholder="Author profile, notable publications, interviews, and literary background..."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gold-gradient text-xs font-bold text-[#050505] shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Publish and Feature in Author Spotlight
              </button>
            </form>
          </div>
        )}

        {/* 7. LIVE RADIO CONTROL TAB */}
        {activeTab === "live_radio" && (
          <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6 shadow-xs max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#080808]">
                  Live Radio Master Feed Control
                </h2>
                <p className="text-xs text-neutral-600 mt-1">
                  Toggle the 24/7 global broadcast feed On-Air or Off-Air, and configure the active streaming source.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${
                    radioIsLive
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  <span className="size-2 rounded-full bg-white" />
                  {radioIsLive ? "ON AIR NOW" : "OFF AIR"}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleRadio(!radioIsLive)}
                  className={`py-2 px-5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    radioIsLive
                      ? "bg-neutral-800 text-white hover:bg-black"
                      : "bg-gold-gradient text-[#050505] hover:brightness-110"
                  }`}
                >
                  {radioIsLive ? "Switch Off-Air" : "Switch On-Air Now"}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Broadcast Title</label>
                <input
                  type="text"
                  value={radioTitle}
                  onChange={(e) => setRadioTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Studio Programme</label>
                  <input
                    type="text"
                    value={radioProgramme}
                    onChange={(e) => setRadioProgramme(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Audio Stream URL</label>
                  <input
                    type="url"
                    value={radioStreamUrl}
                    onChange={(e) => setRadioStreamUrl(e.target.value)}
                    placeholder="https://... MP3/HLS/MP4 stream"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleRadio(radioIsLive)}
                className="py-2.5 px-6 rounded-xl bg-[#080808] text-[#F7DF8B] text-xs font-bold hover:bg-black cursor-pointer transition-all"
              >
                Save Radio Settings
              </button>
            </div>
          </div>
        )}

        {/* 8. CATALOG OVERVIEW TAB */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Published Network Catalog ({allBooks.length} Books, {audiobooks.length} Audiobooks, {allArticles.length} Articles)
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Overview of all published material currently live across the site.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBooks.slice(0, 12).map((book) => (
                <div
                  key={book.id}
                  className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center gap-3.5 shadow-xs"
                >
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg border border-neutral-200 shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                      {book.format}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-[#080808] truncate">
                      {book.title}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate">
                      {book.author_name || "Author"}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live on Site
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. SETTINGS & SECURITY TAB */}
        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Admin Settings & Security
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Configure your administrator login credentials, notification email for receiving author submissions, and password.
              </p>
            </div>

            {/* Change Password Card */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-bold text-[#080808]">Change Admin Password</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">New Password *</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#080808] text-[#F7DF8B] text-xs font-bold hover:bg-black cursor-pointer transition-all"
                >
                  Update Admin Password
                </button>
              </form>
            </div>

            {/* Update Login Email Card */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-bold text-[#080808]">Admin Login Email</h3>
              </div>
              <p className="text-xs text-neutral-600">
                Current login email for signing in: <strong className="text-[#080808]">{user?.email}</strong>
              </p>
              <form onSubmit={handleUpdateLoginEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">New Login Email</label>
                  <input
                    type="email"
                    required
                    value={newLoginEmail}
                    onChange={(e) => setNewLoginEmail(e.target.value)}
                    placeholder="perrycreativity@gmail.com"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#080808] text-[#F7DF8B] text-xs font-bold hover:bg-black cursor-pointer transition-all"
                >
                  Update Login Email
                </button>
              </form>
            </div>

            {/* Notification Receiving Email Card */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Mail className="size-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-bold text-[#080808]">
                  Notification Email for Author Submissions & Requests
                </h3>
              </div>
              <p className="text-xs text-neutral-600">
                Whenever an author submits a book, publishes, or submits an enquiry on the website, instant notifications are dispatched here.
              </p>
              <form onSubmit={handleUpdateReceivingEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Receiving Email Address</label>
                  <input
                    type="email"
                    required
                    value={receivingEmail}
                    onChange={(e) => setReceivingEmail(e.target.value)}
                    placeholder="enquiry@literaryvoicenetwork.org"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-gold-gradient text-[#050505] text-xs font-bold hover:brightness-110 cursor-pointer transition-all shadow-xs"
                >
                  Save Notification Email Address
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
     