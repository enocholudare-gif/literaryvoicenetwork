"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Feather,
  Headphones,
  Image as ImageIcon,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MailCheck,
  Mic2,
  Newspaper,
  Plus,
  Radio,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Users,
  Video,
} from "lucide-react";
import type {
  Article,
  Book,
  BookFormat,
  Broadcast,
  Enquiry,
  Profile,
  PublicationStatus,
  SiteSettingsMap,
  Submission,
  User as UserModel,
} from "@/lib/db/types";

type AdminTab =
  | "books"
  | "authors"
  | "articles"
  | "broadcast"
  | "approvals"
  | "enquiries"
  | "catalog"
  | "settings";

const PRESET_COVERS = [
  { name: "AI: An Unlikely War", url: "/media/covers/the-first.jpg" },
  { name: "You Can Wine Too", url: "/media/covers/second-image.jpg" },
  { name: "Legends of the Grail", url: "/media/covers/third-image.jpg" },
  { name: "Canthany Rising", url: "/media/covers/fourth-image.jpg" },
  { name: "From Doctor to Healer", url: "/media/covers/fifth-image.jpg" },
  { name: "LEAP: Leadership Barriers", url: "/media/covers/sixth-image.jpg" },
  { name: "Missed Cue", url: "/media/covers/seventh-image.jpg" },
  { name: "Vengeance", url: "/media/covers/ninth-image.jpg" },
  { name: "Seeking the Hook (Magazine)", url: "/media/covers/maga1.jpg" },
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
    } catch {}

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
          <ImageIcon className="size-3.5 text-[#AA7C11]" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-[11px] font-semibold text-[#AA7C11] hover:underline cursor-pointer"
        >
          {showPresets ? "Hide Presets" : "Choose from Library Presets"}
        </button>
      </div>

      {showPresets && (
        <div className="p-3 rounded-2xl bg-neutral-100 border border-neutral-300 grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
          {PRESET_COVERS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                onChange(preset.url);
                setShowPresets(false);
              }}
              className="text-left group cursor-pointer"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden border border-neutral-300 group-hover:border-[#D4AF37] shadow-xs">
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="size-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-[10px] text-neutral-700 truncate mt-1">
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div
          className={`shrink-0 rounded-2xl border-2 border-dashed border-[#D4AF37]/50 bg-neutral-900 flex items-center justify-center overflow-hidden shadow-xs ${
            aspect === "book"
              ? "w-28 aspect-[2/3]"
              : aspect === "square"
              ? "size-24 aspect-square"
              : "w-44 aspect-video"
          }`}
        >
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="size-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/media/covers/the-first.jpg";
              }}
            />
          ) : (
            <span className="text-[10px] text-neutral-400 text-center px-2">
              No image selected
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2 w-full">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
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
  const [activeTab, setActiveTab] = useState<AdminTab>("books");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<Omit<UserModel, "password_hash"> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Authentication State for Admin
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState("perrycreativity@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [settings, setSettings] = useState<SiteSettingsMap | null>(null);

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Moderation state
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [modFeedback, setModFeedback] = useState("");

  // 1. Publish Book for Author State
  const [bkTitle, setBkTitle] = useState("");
  const [bkSubtitle, setBkSubtitle] = useState("");
  const [bkAuthor, setBkAuthor] = useState("");
  const [bkAuthorAvatar, setBkAuthorAvatar] = useState("/media/avatars/default-portrait.svg");
  const [bkAuthorBio, setBkAuthorBio] = useState("");
  const [bkTargetSection, setBkTargetSection] = useState("Editorial Desk");
  const [bkCategory, setBkCategory] = useState("Editorial");
  const [bkFormat, setBkFormat] = useState<BookFormat>("Hardcover");
  const [bkPublisher, setBkPublisher] = useState("LVN Imprint Editions");
  const [bkCoverUrl, setBkCoverUrl] = useState("/media/covers/the-first.jpg");
  const [bkSynopsis, setBkSynopsis] = useState("");
  const [bkExcerpt, setBkExcerpt] = useState("");
  const [bkLink, setBkLink] = useState("");
  const [bkGoodreads, setBkGoodreads] = useState("");
  const [bkIsFeatured, setBkIsFeatured] = useState(true);
  const [bkInitialViews, setBkInitialViews] = useState(1450);
  const [isPublishingBook, setIsPublishingBook] = useState(false);

  // Catalog State
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("All");

  // 2. Author Spotlight State
  const [spotlightName, setSpotlightName] = useState("");
  const [spotlightAvatar, setSpotlightAvatar] = useState("/media/avatars/default-portrait.svg");
  const [spotlightHeadline, setSpotlightHeadline] = useState("");
  const [spotlightBio, setSpotlightBio] = useState("");
  const [spotlightLocation, setSpotlightLocation] = useState("");
  const [spotlightIsFeatured, setSpotlightIsFeatured] = useState(true);
  const [isPublishingAuthor, setIsPublishingAuthor] = useState(false);
  const [customSpotlightAuthors, setCustomSpotlightAuthors] = useState<any[]>([]);

  // 3. Magazine & Articles State
  const [artTitle, setArtTitle] = useState("");
  const [artSubtitle, setArtSubtitle] = useState("");
  const [artCategory, setArtCategory] = useState("Literary Essay");
  const [artCoverUrl, setArtCoverUrl] = useState("/media/banners/editorial-desk.svg");
  const [artExcerpt, setArtExcerpt] = useState("");
  const [artBody, setArtBody] = useState("");
  const [artAuthor, setArtAuthor] = useState("");
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);

  // 4. Step Inside Broadcast State
  const [broadcastGuestName, setBroadcastGuestName] = useState("");
  const [broadcastGuestTitle, setBroadcastGuestTitle] = useState("Featured Author & Historian");
  const [broadcastGuestBio, setBroadcastGuestBio] = useState("");
  const [broadcastVideoUrl, setBroadcastVideoUrl] = useState("/media/hero-video.mp4");
  const [radioIsLive, setRadioIsLive] = useState(false);
  const [radioStreamUrl, setRadioStreamUrl] = useState(
    "https://videotourl.com/videos/1792770791367-b8ab28bf-7cd3-46ef-8bf5-cba07b6375bb.mp4"
  );
  const [radioProgramme, setRadioProgramme] = useState("LVN Live Studio");
  const [isSavingBroadcast, setIsSavingBroadcast] = useState(false);

  // 5. Inbox & Inquiries State
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [inboxFilter, setInboxFilter] = useState<string>("all");
  const [inboxSearch, setInboxSearch] = useState<string>("");

  // 6. Settings Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newLoginEmail, setNewLoginEmail] = useState("");
  const [receivingEmail, setReceivingEmail] = useState("enquiry@literaryvoicenetwork.org");

  const loadData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();

      if (!authData.authenticated || authData.user?.role !== "admin") {
        setIsAuthenticatedAdmin(false);
        setInitialLoading(false);
        setIsRefreshing(false);
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
        let bks: Book[] = modData.books || [];
        try {
          const stored: Book[] = JSON.parse(localStorage.getItem("lvn_custom_published_books") || "[]");
          if (stored.length > 0) {
            bks = [...stored, ...bks.filter(b => !stored.some(s => s.id === b.id || s.title === b.title))];
          }
        } catch {}
        setAllBooks(bks);
        setAllArticles(modData.articles || []);
      }

      const admData = await admRes.json();
      if (admData.ok) {
        setBroadcasts(admData.broadcasts || []);
        let enqs: Enquiry[] = admData.enquiries || [];
        try {
          const storedEnqs: Enquiry[] = JSON.parse(localStorage.getItem("lvn_custom_enquiries") || "[]");
          if (storedEnqs.length > 0) {
            enqs = [...storedEnqs, ...enqs.filter(e => !storedEnqs.some(s => s.id === e.id))];
          }
        } catch {}
        setEnquiries(enqs);
        setSettings(admData.settings || null);
        if (admData.settings?.editorialEmail) {
          setReceivingEmail(admData.settings.editorialEmail);
        }
        if (admData.settings?.liveBroadcastActive !== undefined) {
          setRadioIsLive(Boolean(admData.settings.liveBroadcastActive));
        }
      }

      // Load custom spotlight authors from localStorage
      try {
        const storedAuths = JSON.parse(localStorage.getItem("lvn_custom_spotlight_authors") || "[]");
        setCustomSpotlightAuthors(storedAuths);
      } catch {}
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Admin Login
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

  // 1. Publish Book for Author (Direct Publish to Website)
  const handlePublishBookForAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setIsPublishingBook(true);

    try {
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
            authorAvatar: bkAuthorAvatar.trim() || "/media/avatars/default-portrait.svg",
            authorBio: bkAuthorBio.trim(),
            genre: bkCategory,
            section: bkTargetSection,
            format: bkFormat,
            publisher: bkPublisher.trim() || "LVN Imprint Editions",
            coverUrl: bkCoverUrl.trim() || "/media/covers/the-first.jpg",
            description: bkSynopsis.trim() || "A featured title on Literary Voices Network.",
            excerpt: bkExcerpt.trim(),
            isFeatured: bkIsFeatured,
            viewCount: Number(bkInitialViews) || 1450,
            retailerLinks: {
              amazon: bkLink.trim(),
              goodreads: bkGoodreads.trim(),
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to publish book." });
        setIsPublishingBook(false);
        return;
      }

      const savedBook = data.book
        ? {
            ...data.book,
            genre: bkCategory,
            section: bkTargetSection,
            author_name: bkAuthor.trim() || data.book.author_name || profile?.display_name || "Author",
            author_avatar: bkAuthorAvatar.trim() || data.book.author_avatar || "/media/avatars/default-portrait.svg",
          }
        : {
            id: "pub-" + Date.now(),
            slug: (bkTitle.trim() || "book").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            title: bkTitle.trim(),
            subtitle: bkSubtitle.trim(),
            author_name: bkAuthor.trim() || profile?.display_name || "Author",
            author_avatar: bkAuthorAvatar.trim() || "/media/avatars/default-portrait.svg",
            author_headline: bkAuthorBio.trim(),
            author_slug: (bkAuthor.trim() || "author").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            genre: bkCategory,
            section: bkTargetSection,
            cover_url: bkCoverUrl.trim() || "/media/covers/the-first.jpg",
            description: bkSynopsis.trim() || "A featured title on Literary Voices Network.",
            status: "published",
            is_featured: bkIsFeatured ? 1 : 0,
            view_count: Number(bkInitialViews) || 1450,
            retailer_links: {
              amazon: bkLink.trim(),
              goodreads: bkGoodreads.trim(),
            },
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };

      try {
        const stored = JSON.parse(localStorage.getItem("lvn_custom_published_books") || "[]");
        const updated = [savedBook, ...stored.filter((x: any) => x.id !== savedBook.id && x.title !== savedBook.title)];
        localStorage.setItem("lvn_custom_published_books", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("lvn-book-published", { detail: savedBook }));
      } catch {}

      // If category is Spotlight or section is Author Spotlight, also add to custom spotlight authors
      if (bkCategory === "Spotlight" || bkTargetSection.includes("Spotlight")) {
        try {
          const authObj = {
            id: "auth-" + (savedBook.author_slug || Date.now()),
            slug: savedBook.author_slug || (bkAuthor.trim() || "author").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            display_name: bkAuthor.trim() || "Featured Author",
            headline: bkAuthorBio.trim() || "Spotlight Author",
            bio: bkSynopsis.trim() || "Spotlight author on Literary Voices Network.",
            avatar_url: bkAuthorAvatar.trim() || "/media/avatars/default-portrait.svg",
            book_count: 1,
            is_featured: 1,
          };
          const curAuths = JSON.parse(localStorage.getItem("lvn_custom_spotlight_authors") || "[]");
          const nextAuths = [authObj, ...curAuths.filter((a: any) => a.slug !== authObj.slug)];
          localStorage.setItem("lvn_custom_spotlight_authors", JSON.stringify(nextAuths));
          setCustomSpotlightAuthors(nextAuths);
        } catch {}
      }

      setAllBooks((prev) => [savedBook, ...prev.filter((b) => b.id !== savedBook.id)]);

      setBanner({
        type: "success",
        text: `Book "${bkTitle}" published successfully to ${bkTargetSection} (${bkCategory})!`,
      });

      setBkTitle("");
      setBkSubtitle("");
      setBkAuthor("");
      setBkSynopsis("");
      setBkExcerpt("");
      setBkLink("");
      setBkGoodreads("");
      void loadData(true);
    } catch (err: any) {
      setBanner({ type: "error", text: "Error publishing book: " + (err?.message || "Please check connection.") });
    } finally {
      setIsPublishingBook(false);
    }
  };

  // 1a. Delete Book from Catalog
  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${book.title}" from the network catalog?`)) {
      return;
    }
    setBanner(null);
    try {
      const res = await fetch("/api/publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-book",
          bookId: book.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to delete book." });
        return;
      }

      setAllBooks((prev) => prev.filter((b) => b.id !== book.id));

      try {
        const stored = JSON.parse(localStorage.getItem("lvn_custom_published_books") || "[]");
        const filtered = stored.filter(
          (b: any) => b.id !== book.id && b.slug !== book.slug && b.title !== book.title
        );
        localStorage.setItem("lvn_custom_published_books", JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent("lvn-book-published"));
      } catch {}

      setBanner({
        type: "success",
        text: `Book "${book.title}" has been deleted from the catalog.`,
      });
    } catch {
      setBanner({ type: "error", text: "Network error while deleting book." });
    }
  };

  // 1b. Author Spotlight Handler
  const handleSaveAuthorSpotlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setIsPublishingAuthor(true);

    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish-author-spotlight",
          spotlightData: {
            displayName: spotlightName.trim(),
            avatarUrl: spotlightAvatar.trim() || "/media/avatars/default-portrait.svg",
            headline: spotlightHeadline.trim() || "Featured Network Author & Contributor",
            bio: spotlightBio.trim() || "Contributing author and literary voice at the Literary Voices Network.",
            location: spotlightLocation.trim() || "New York",
            isFeatured: spotlightIsFeatured,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to add author spotlight." });
        return;
      }

      const authObj = {
        id: data.spotlight?.id || "auth-" + Date.now(),
        slug: data.spotlight?.slug || spotlightName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        display_name: spotlightName.trim(),
        headline: spotlightHeadline.trim() || "Featured Author",
        bio: spotlightBio.trim() || "Contributing author at LVN.",
        avatar_url: spotlightAvatar.trim() || "/media/avatars/default-portrait.svg",
        book_count: 1,
        is_featured: 1,
      };

      try {
        const curAuths = JSON.parse(localStorage.getItem("lvn_custom_spotlight_authors") || "[]");
        const nextAuths = [authObj, ...curAuths.filter((a: any) => a.slug !== authObj.slug)];
        localStorage.setItem("lvn_custom_spotlight_authors", JSON.stringify(nextAuths));
        setCustomSpotlightAuthors(nextAuths);
        window.dispatchEvent(new CustomEvent("lvn-book-published"));
      } catch {}

      setBanner({
        type: "success",
        text: `Author "${spotlightName}" added to Author Spotlight successfully!`,
      });

      setSpotlightName("");
      setSpotlightHeadline("");
      setSpotlightBio("");
      setSpotlightLocation("");
      void loadData(true);
    } catch {
      setBanner({ type: "error", text: "Network error saving author spotlight." });
    } finally {
      setIsPublishingAuthor(false);
    }
  };

  // 1ba. Delete Author from Spotlight
  const handleDeleteAuthor = async (authorId: string, authorName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${authorName}" from the author spotlight?`)) {
      return;
    }
    setBanner(null);
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-author",
          authorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to remove author." });
        return;
      }

      try {
        const stored = JSON.parse(localStorage.getItem("lvn_custom_spotlight_authors") || "[]");
        const filtered = stored.filter((a: any) => a.id !== authorId && a.display_name !== authorName);
        localStorage.setItem("lvn_custom_spotlight_authors", JSON.stringify(filtered));
        setCustomSpotlightAuthors(filtered);
        window.dispatchEvent(new CustomEvent("lvn-book-published"));
      } catch {}

      setBanner({
        type: "success",
        text: `Author "${authorName}" removed from spotlight.`,
      });
      void loadData(true);
    } catch {
      setBanner({ type: "error", text: "Network error while removing author." });
    }
  };

  // 1c. Magazine & Articles Handler
  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setIsPublishingArticle(true);

    try {
      const res = await fetch("/api/publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-article",
          publishImmediately: true,
          articleData: {
            title: artTitle.trim(),
            subtitle: artSubtitle.trim(),
            articleType: artCategory === "Author Interview" ? "interview" : "essay",
            coverUrl: artCoverUrl.trim() || "/media/banners/editorial-desk.svg",
            excerpt: artExcerpt.trim() || "Featured piece on Literary Voices Network.",
            bodyHtml: artBody.trim() || "<p>Article text content published by Literary Voices Network editorial desk.</p>",
            sourceAttribution: artAuthor.trim() || "LVN Editorial Staff",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to publish article." });
        return;
      }

      if (data.article) {
        setAllArticles((prev) => [data.article, ...prev.filter((a) => a.id !== data.article.id)]);
      }

      setBanner({
        type: "success",
        text: `Article "${artTitle}" published successfully to ${artCategory}!`,
      });

      setArtTitle("");
      setArtSubtitle("");
      setArtExcerpt("");
      setArtBody("");
      setArtAuthor("");
      void loadData(true);
    } catch {
      setBanner({ type: "error", text: "Network error publishing article." });
    } finally {
      setIsPublishingArticle(false);
    }
  };

  // 1ca. Delete Article Handler
  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete article "${articleTitle}"?`)) {
      return;
    }
    setBanner(null);
    try {
      const res = await fetch("/api/publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-article",
          articleId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to delete article." });
        return;
      }
      setAllArticles((prev) => prev.filter((a) => a.id !== articleId));
      setBanner({
        type: "success",
        text: `Article "${articleTitle}" has been permanently deleted.`,
      });
    } catch {
      setBanner({ type: "error", text: "Network error while deleting article." });
    }
  };

  // 2. Author Moderation Approval Handler
  const handleModerate = async (
    entityType: "book" | "article",
    entityId: string,
    nextStatus: PublicationStatus,
    authorFeedback = ""
  ) => {
    setBanner(null);
    try {
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
        text: `Submission updated to "${nextStatus}" successfully!`,
      });
      setSelectedSub(null);
      void loadData(true);
    } catch {
      setBanner({ type: "error", text: "Network error while updating submission." });
    }
  };

  // 3. Step Inside Broadcast & Video Update
  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setIsSavingBroadcast(true);

    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-broadcast",
          broadcastData: {
            programmeName: radioProgramme,
            episodeNumber: 44,
            title: `Step Inside the Broadcast with ${broadcastGuestName || "Studio Guest"}`,
            hostName: profile?.display_name || "Executive Founder & CEO",
            guestName: broadcastGuestName.trim(),
            broadcastType: "video",
            replayUrl: broadcastVideoUrl.trim(),
            description: broadcastGuestBio.trim(),
            status: "published",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to update broadcast settings." });
        return;
      }

      try {
        localStorage.setItem("lvn_custom_broadcast", JSON.stringify({
          guestName: broadcastGuestName.trim(),
          guestBio: broadcastGuestBio.trim(),
          videoUrl: broadcastVideoUrl.trim(),
          programme: radioProgramme,
        }));
        window.dispatchEvent(new CustomEvent("lvn-broadcast-updated"));
      } catch {}

      setBanner({
        type: "success",
        text: `Broadcast guest "${broadcastGuestName}" and video settings saved!`,
      });
      void loadData(true);
    } catch {
      setBanner({ type: "error", text: "Network error saving broadcast." });
    } finally {
      setIsSavingBroadcast(false);
    }
  };

  // 3a. Delete Broadcast
  const handleDeleteBroadcast = async (broadcastId: string, broadcastTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete broadcast "${broadcastTitle}"?`)) {
      return;
    }
    setBanner(null);
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-broadcast",
          broadcastId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to delete broadcast." });
        return;
      }
      setBroadcasts((prev) => prev.filter((b) => b.id !== broadcastId));
      setBanner({
        type: "success",
        text: `Broadcast "${broadcastTitle}" has been deleted.`,
      });
    } catch {
      setBanner({ type: "error", text: "Network error while deleting broadcast." });
    }
  };

  // 4. Delete Enquiry from Inbox
  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this message from the inbox?")) {
      return;
    }
    setBanner(null);
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-enquiry",
          enquiryId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: data.error || "Failed to delete message." });
        return;
      }
      setEnquiries((prev) => prev.filter((e) => e.id !== enquiryId));
      try {
        const stored = JSON.parse(localStorage.getItem("lvn_custom_enquiries") || "[]");
        const filtered = stored.filter((e: any) => e.id !== enquiryId);
        localStorage.setItem("lvn_custom_enquiries", JSON.stringify(filtered));
      } catch {}
      setBanner({
        type: "success",
        text: "Message removed from inbox.",
      });
    } catch {
      setBanner({ type: "error", text: "Network error while deleting message." });
    }
  };

  // 5. Copy Email Helper
  const handleCopyEmail = (email: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmailId(id);
      setTimeout(() => setCopiedEmailId(null), 2500);
    }
  };

  // 6. Change Password
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

  // 7. Update Receiving Email
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
      text: `Official correspondence and contact email updated to ${receivingEmail.trim()}!`,
    });
    void loadData(true);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-12 text-sm text-[#080808]">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-[#D4AF37] animate-spin" />
          <span className="font-semibold">Loading Executive Admin Operations Console...</span>
        </div>
      </div>
    );
  }

  // Gateway Login Screen for unauthenticated visitors
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
              Sign in with your pre-authorized administrator credentials to access publishing controls, moderation, and correspondence.
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
              className="w-full rounded-xl bg-gold-gradient py-3 text-xs font-bold text-[#050505] shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
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
  const editorialBooks = allBooks.filter((b) => b.genre === "Editorial");
  const magazineBooks = allBooks.filter((b) => b.genre === "Magazine");

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Top Banner Header */}
      <section className="bg-[#080808] text-[#FAF8F3] border-b border-[#D4AF37]/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gold-gradient text-[10px] font-bold uppercase tracking-widest text-[#050505]">
                Admin Command
              </span>
              <span className="text-xs text-white/60">
                Connected: <strong className="text-[#F7DF8B]">{user?.email}</strong>
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-[#FAF8F3]">
              LVN Executive Publishing &amp; Broadcast Dashboard
            </h1>
            <p className="text-xs text-[#FAF8F3]/75 mt-1 max-w-2xl">
              Publish books for authors across categories, moderate community submissions, manage live studio broadcasts, and review correspondence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white/80 hover:text-white hover:border-[#D4AF37] transition-colors"
            >
              View Live Website
            </Link>
          </div>
        </div>
      </section>

      {/* Balanced Stat Metric Cards Across Top */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <BookOpen className="size-3.5 text-[#AA7C11]" /> Total Books
            </span>
            <p className="font-serif text-2xl font-bold text-[#080808]">
              {allBooks.length}
            </p>
            <p className="text-[11px] text-neutral-500">In network catalog</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Feather className="size-3.5 text-[#AA7C11]" /> Editorial Books
            </span>
            <p className="font-serif text-2xl font-bold text-[#AA7C11]">
              {editorialBooks.length}
            </p>
            <p className="text-[11px] text-neutral-500">Verified editorial</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Newspaper className="size-3.5 text-[#AA7C11]" /> Magazine Books
            </span>
            <p className="font-serif text-2xl font-bold text-[#AA7C11]">
              {magazineBooks.length}
            </p>
            <p className="text-[11px] text-neutral-500">Curated magazine</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Clock className="size-3.5 text-[#AA7C11]" /> Approvals Queue
            </span>
            <p className="font-serif text-2xl font-bold text-amber-700">
              {pendingSubmissions.length}
            </p>
            <p className="text-[11px] text-neutral-500">Pending review</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Mail className="size-3.5 text-[#AA7C11]" /> Correspondence
            </span>
            <p className="font-serif text-2xl font-bold text-emerald-700">
              {enquiries.length}
            </p>
            <p className="text-[11px] text-neutral-500">Contact messages</p>
          </div>
        </div>
      </section>

      {/* Navigation Tab Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-2xl border border-[#D4AF37]/30 p-2 shadow-xs">
          <div className="flex overflow-x-auto gap-2 scrollbar-none">
            {[
              { id: "books" as AdminTab, label: "Publish Book", icon: Plus },
              { id: "authors" as AdminTab, label: `Author Spotlight (${customSpotlightAuthors.length})`, icon: Users },
              { id: "enquiries" as AdminTab, label: `Inbox & Messages (${enquiries.length})`, icon: Mail, highlight: enquiries.length > 0 },
              { id: "catalog" as AdminTab, label: `Catalog & Library (${allBooks.length})`, icon: Layers },
              { id: "articles" as AdminTab, label: `Magazine & Essays (${allArticles.length})`, icon: Newspaper },
              {
                id: "approvals" as AdminTab,
                label: `Author Approvals (${pendingSubmissions.length})`,
                icon: ShieldCheck,
                highlight: pendingSubmissions.length > 0,
              },
              { id: "broadcast" as AdminTab, label: "Studio Broadcast", icon: Video },
              { id: "settings" as AdminTab, label: "Settings & Profile", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Main Working Panel */}
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

        {/* 1. PUBLISH BOOK (ANY SECTION) TAB */}
        {activeTab === "books" && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-xs space-y-8">
            <div className="border-b border-neutral-200 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#AA7C11] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Network Publishing Control
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-2">
                Publish Book to Any Section
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                Add and publish any author's book directly to the homepage, 3D Floating Shelf, Editorial Desk, Magazine, or Podcast section. Set author picture, category tags, cover image with preview, and description.
              </p>
            </div>

            <form onSubmit={handlePublishBookForAuthor} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={bkTitle}
                    onChange={(e) => setBkTitle(e.target.value)}
                    placeholder="e.g. AI: An Unlikely War"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={bkSubtitle}
                    onChange={(e) => setBkSubtitle(e.target.value)}
                    placeholder="e.g. The Battle for the Soul of Human Thought"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Section Placement & Category Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Target Section Placement *</label>
                  <select
                    value={bkTargetSection}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBkTargetSection(val);
                      if (val.includes("Editorial")) setBkCategory("Editorial");
                      else if (val.includes("Magazine")) setBkCategory("Magazine");
                      else if (val.includes("Podcast")) setBkCategory("Podcast");
                      else if (val.includes("Spotlight")) setBkCategory("Spotlight");
                    }}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white font-medium"
                  >
                    <option value="Editorial Desk">Editorial Desk (/editorial &amp; Shelf)</option>
                    <option value="Magazine Shelf">Magazine Shelf (/magazine)</option>
                    <option value="Podcast & Audio">Podcast &amp; Studio Audio (/podcast)</option>
                    <option value="Author Spotlight">Author Spotlight Section (/authors)</option>
                    <option value="On the Charts">On the Charts · 3D Floating Shelf</option>
                    <option value="Trending Books">Trending Books</option>
                    <option value="Recently Added">Recently Added Books</option>
                    <option value="General Library">General Library (/books)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Category Tag *</label>
                  <select
                    value={bkCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBkCategory(val);
                      if (val === "Editorial") setBkTargetSection("Editorial Desk");
                      else if (val === "Magazine") setBkTargetSection("Magazine Shelf");
                      else if (val === "Podcast") setBkTargetSection("Podcast & Audio");
                      else if (val === "Spotlight") setBkTargetSection("Author Spotlight");
                    }}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white font-medium"
                  >
                    <option value="Editorial">Editorial</option>
                    <option value="Magazine">Magazine</option>
                    <option value="Podcast">Podcast</option>
                    <option value="Spotlight">Spotlight</option>
                    <option value="Literary Fiction">Literary Fiction</option>
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Poetry">Poetry</option>
                    <option value="Memoir">Memoir &amp; Biography</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Mystery &amp; Thriller">Mystery &amp; Thriller</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Format</label>
                  <select
                    value={bkFormat}
                    onChange={(e) => setBkFormat(e.target.value as BookFormat)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white"
                  >
                    <option value="Hardcover">Hardcover</option>
                    <option value="Paperback">Paperback</option>
                    <option value="eBook">eBook</option>
                    <option value="Audiobook">Audiobook</option>
                    <option value="Multi-format">Multi-format</option>
                  </select>
                </div>
              </div>

              {/* Author Information & Portrait */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                <p className="text-xs font-bold text-[#AA7C11] uppercase tracking-wider">
                  Author Profile Information
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#080808]">Author Name *</label>
                    <input
                      type="text"
                      required
                      value={bkAuthor}
                      onChange={(e) => setBkAuthor(e.target.value)}
                      placeholder="e.g. Tony Rebeiro"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#080808]">Author Role / Headline</label>
                    <input
                      type="text"
                      value={bkAuthorBio}
                      onChange={(e) => setBkAuthorBio(e.target.value)}
                      placeholder="e.g. Award-winning Novelist &amp; Essayist"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Author Profile Picture / Portrait (Upload file or URL with live preview)"
                  value={bkAuthorAvatar}
                  onChange={setBkAuthorAvatar}
                  aspect="square"
                  helperText="Upload the author's portrait photo so their profile image appears next to the book and on their author page."
                />
              </div>

              {/* Book Cover Image Upload with Live Visual Preview */}
              <ImageUploadField
                label="Book Cover Image (Upload or URL with live preview) *"
                value={bkCoverUrl}
                onChange={setBkCoverUrl}
                aspect="book"
                helperText="Upload cover image directly from your computer or pick from the preset library."
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Book Synopsis / Description</label>
                <textarea
                  rows={4}
                  value={bkSynopsis}
                  onChange={(e) => setBkSynopsis(e.target.value)}
                  placeholder="Enter the book synopsis or critical overview (will be visible in the quick overview modal before users click Amazon)..."
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Book Purchase Link (Amazon / Retailer) *</label>
                  <input
                    type="url"
                    required
                    value={bkLink}
                    onChange={(e) => setBkLink(e.target.value)}
                    placeholder="https://www.amazon.com/dp/..."
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Starting View Count</label>
                  <input
                    type="number"
                    value={bkInitialViews}
                    onChange={(e) => setBkInitialViews(Number(e.target.value))}
                    placeholder="1450"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bkIsFeatured"
                  checked={bkIsFeatured}
                  onChange={(e) => setBkIsFeatured(e.target.checked)}
                  className="size-4 accent-[#AA7C11] rounded cursor-pointer"
                />
                <label htmlFor="bkIsFeatured" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                  Feature this book prominently on the Homepage, 3D Floating Shelf, and Curated Sections
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-neutral-500">
                  When published, this title will immediately appear on the homepage and library tagged as <strong>{bkCategory}</strong> under <strong>{bkTargetSection}</strong>.
                </span>
                <button
                  type="submit"
                  disabled={isPublishingBook}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer shrink-0"
                >
                  {isPublishingBook ? (
                    <>
                      <ShieldCheck className="size-4 animate-spin text-[#050505]" />
                      <span>Publishing &amp; Distributing Book...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="size-4" />
                      <span>Publish Book for Author</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 1b. AUTHOR SPOTLIGHT MANAGER TAB */}
        {activeTab === "authors" && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-xs space-y-8">
            <div className="border-b border-neutral-200 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#AA7C11] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Spotlight Directory
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-2">
                Author Spotlight Manager
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                Add and manage authors featured in the Author Spotlight section, homepage banners, and verified contributors directory.
              </p>
            </div>

            <form onSubmit={handleSaveAuthorSpotlight} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author Display Name *</label>
                  <input
                    type="text"
                    required
                    value={spotlightName}
                    onChange={(e) => setSpotlightName(e.target.value)}
                    placeholder="e.g. Tony Rebeiro"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author Headline / Role</label>
                  <input
                    type="text"
                    value={spotlightHeadline}
                    onChange={(e) => setSpotlightHeadline(e.target.value)}
                    placeholder="e.g. Award-winning Novelist &amp; Essayist"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Author Profile Picture / Portrait (Upload file or URL with live preview) *"
                value={spotlightAvatar}
                onChange={setSpotlightAvatar}
                aspect="square"
                helperText="Upload the author's portrait picture to feature on the Author Spotlight cards and author overview pages."
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Author Biography</label>
                <textarea
                  rows={4}
                  value={spotlightBio}
                  onChange={(e) => setSpotlightBio(e.target.value)}
                  placeholder="Enter author biography, achievements, and background..."
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Location (City / Country)</label>
                  <input
                    type="text"
                    value={spotlightLocation}
                    onChange={(e) => setSpotlightLocation(e.target.value)}
                    placeholder="e.g. London, UK"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="spotlightIsFeatured"
                    checked={spotlightIsFeatured}
                    onChange={(e) => setSpotlightIsFeatured(e.target.checked)}
                    className="size-4 accent-[#AA7C11] rounded cursor-pointer"
                  />
                  <label htmlFor="spotlightIsFeatured" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                    Feature prominently in Author Spotlight on Homepage
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isPublishingAuthor}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 disabled:opacity-60 transition-all shadow-md cursor-pointer"
                >
                  {isPublishingAuthor ? (
                    <>
                      <ShieldCheck className="size-4 animate-spin text-[#050505]" />
                      <span>Saving Spotlight...</span>
                    </>
                  ) : (
                    <>
                      <Users className="size-4" />
                      <span>Save Author Spotlight</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* List of Current Spotlight Authors with Delete */}
            <div className="pt-6 border-t border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#080808]">
                  Current Spotlight Authors ({customSpotlightAuthors.length})
                </h3>
                <span className="text-xs text-neutral-500">
                  Visible under /authors and homepage spotlight
                </span>
              </div>

              {customSpotlightAuthors.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500">
                  No custom spotlight authors added yet. Use the form above to add an author into the spotlight.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customSpotlightAuthors.map((ca: any) => (
                    <div
                      key={ca.id || ca.slug}
                      className="p-4 rounded-2xl bg-[#FAF8F3] border border-neutral-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={ca.avatar_url || "/media/avatars/default-portrait.svg"}
                          alt={ca.display_name}
                          className="size-11 rounded-full object-cover border border-[#D4AF37]/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-serif text-sm font-bold text-[#080808] truncate">
                            {ca.display_name}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate">
                            {ca.headline || "Spotlight Author"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAuthor(ca.id, ca.display_name)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer shrink-0"
                        title={`Remove "${ca.display_name}" from spotlight`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1c. MAGAZINE & ARTICLES MANAGER TAB */}
        {activeTab === "articles" && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-xs space-y-8">
            <div className="border-b border-neutral-200 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#AA7C11] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Editorial Publications
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-2">
                Publish Magazine &amp; Editorial Article
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                Publish essays, author interviews, critiques, and features directly to the Digital Magazine (/magazine) and Editorial Desk (/editorial).
              </p>
            </div>

            <form onSubmit={handlePublishArticle} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    placeholder="e.g. The Architecture of Silence: On Lyric Form"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={artSubtitle}
                    onChange={(e) => setArtSubtitle(e.target.value)}
                    placeholder="e.g. Modernist poetics in an age of automated language"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Category / Type *</label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white font-medium"
                  >
                    <option value="Literary Essay">Literary Essay</option>
                    <option value="Author Interview">Author Interview</option>
                    <option value="Cultural Review">Cultural Review</option>
                    <option value="Poetry Dispatch">Poetry Dispatch</option>
                    <option value="Critique">Critique &amp; Commentary</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author / Source Attribution</label>
                  <input
                    type="text"
                    value={artAuthor}
                    onChange={(e) => setArtAuthor(e.target.value)}
                    placeholder="e.g. LVN Editorial Desk"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Article Header Banner Image (Upload file or URL with live preview)"
                value={artCoverUrl}
                onChange={setArtCoverUrl}
                aspect="wide"
                helperText="Upload wide banner for the article header."
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Article Excerpt</label>
                <textarea
                  rows={2}
                  value={artExcerpt}
                  onChange={(e) => setArtExcerpt(e.target.value)}
                  placeholder="Short excerpt or hook summarizing the article..."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Article Body Content</label>
                <textarea
                  rows={6}
                  value={artBody}
                  onChange={(e) => setArtBody(e.target.value)}
                  placeholder="Enter full article text, paragraphs, or markdown..."
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isPublishingArticle}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 disabled:opacity-60 transition-all shadow-md cursor-pointer"
                >
                  {isPublishingArticle ? (
                    <>
                      <ShieldCheck className="size-4 animate-spin text-[#050505]" />
                      <span>Publishing Article...</span>
                    </>
                  ) : (
                    <>
                      <Newspaper className="size-4" />
                      <span>Publish Article</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* List of Published Articles with Delete */}
            <div className="pt-6 border-t border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#080808]">
                  Published Articles &amp; Essays ({allArticles.length})
                </h3>
                <span className="text-xs text-neutral-500">
                  Featured on /magazine
                </span>
              </div>

              {allArticles.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500">
                  No articles published yet. Use the form above to publish an article or essay.
                </div>
              ) : (
                <div className="space-y-3">
                  {allArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 rounded-2xl bg-[#FAF8F3] border border-neutral-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                            {art.article_type}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {art.published_at ? new Date(art.published_at).toLocaleDateString() : "Draft"}
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#080808] truncate">
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 truncate">
                          By {art.author_name || "LVN Staff"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/magazine/${art.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id, art.title)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                          title={`Delete "${art.title}"`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. AUTHOR APPROVALS QUEUE TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#080808]">
                  Author Submissions Moderation Queue
                </h2>
                <p className="text-xs text-[#080808]/70">
                  Review and approve book and article requests submitted by authors before they go live on the site.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-700">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                Alerts to: <span className="text-[#080808] font-bold">{receivingEmail}</span>
              </div>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-neutral-200 bg-white space-y-3">
                <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#080808]">
                  Queue Clear — All Submissions Approved!
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  There are no pending submissions awaiting review. When an author requests a book or article, it will immediately appear here for your approval.
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
                              src={(entity as Book).cover_url || "/media/covers/the-first.jpg"}
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
                      </div>

                      <div className="pt-4 border-t border-neutral-200 space-y-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleModerate(sub.entity_type, sub.entity_id, "published", "Approved by Executive Founder & CEO")}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer text-center"
                          >
                            ✓ Approve &amp; Publish to Main Site
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSub(selectedSub?.id === sub.id ? null : sub)}
                            className="py-2.5 px-4 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                          >
                            Feedback
                          </button>
                        </div>

                        {selectedSub?.id === sub.id && (
                          <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
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
                                Approve
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

        {/* 3. STEP INSIDE BROADCAST & STUDIO GUESTS TAB */}
        {activeTab === "broadcast" && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#AA7C11] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Studio Operations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-2">
                Step Inside the Broadcast Settings
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                Configure who steps into the broadcast, attach studio video reels, and manage live streaming feeds.
              </p>
            </div>

            <form onSubmit={handleSaveBroadcast} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Guest Name Stepping into Broadcast *</label>
                  <input
                    type="text"
                    required
                    value={broadcastGuestName}
                    onChange={(e) => setBroadcastGuestName(e.target.value)}
                    placeholder="e.g. Tony Rebeiro / Dr. Stacey L. Horn"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Guest Title / Role</label>
                  <input
                    type="text"
                    value={broadcastGuestTitle}
                    onChange={(e) => setBroadcastGuestTitle(e.target.value)}
                    placeholder="e.g. Author of AI: An Unlikely War"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Guest Biography &amp; Topic</label>
                <textarea
                  rows={3}
                  value={broadcastGuestBio}
                  onChange={(e) => setBroadcastGuestBio(e.target.value)}
                  placeholder="Enter notes on the guest's background and discussion topic..."
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Video URL & File Upload with Size Guidance */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#080808] flex items-center gap-1.5">
                    <Video className="size-4 text-[#AA7C11]" />
                    Featured Broadcast Video Reel
                  </label>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Recommended file size: &lt; 50MB
                  </span>
                </div>
                <input
                  type="url"
                  value={broadcastVideoUrl}
                  onChange={(e) => setBroadcastVideoUrl(e.target.value)}
                  placeholder="https://... or /media/hero-video.mp4"
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
                <p className="text-[11px] text-neutral-500">
                  Keep video files concise (under 50MB) to ensure fast buffering and smooth streaming for mobile listeners worldwide.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingBroadcast}
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 disabled:opacity-60 shadow-md cursor-pointer transition-all"
                >
                  {isSavingBroadcast ? "Saving Broadcast Settings..." : "Save Broadcast Settings"}
                </button>
              </div>
            </form>

            {/* List of Existing Studio Broadcasts with Delete */}
            <div className="pt-6 border-t border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#080808]">
                  Existing Broadcasts &amp; Episodes ({broadcasts.length})
                </h3>
                <span className="text-xs text-neutral-500">
                  Featured on /broadcasts and homepage studio player
                </span>
              </div>

              {broadcasts.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500">
                  No broadcasts recorded yet. Use the form above to add an episode.
                </div>
              ) : (
                <div className="space-y-3">
                  {broadcasts.map((bc) => (
                    <div
                      key={bc.id}
                      className="p-4 rounded-2xl bg-[#FAF8F3] border border-neutral-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                            {bc.programme_name || "Live Studio"}
                          </span>
                          {bc.episode_number && (
                            <span className="text-[10px] text-[#AA7C11] font-semibold">
                              Ep. {bc.episode_number}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#080808] truncate">
                          {bc.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 truncate">
                          Guest: {bc.guest_name || "N/A"} · Host: {bc.host_name || "LVN Host"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/broadcasts/${bc.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteBroadcast(bc.id, bc.title)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                          title={`Delete "${bc.title}"`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. CORRESPONDENCE & INBOX TAB */}
        {activeTab === "enquiries" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#080808]">
                  Messages &amp; Inquiries Inbox
                </h2>
                <p className="text-xs text-[#080808]/70">
                  Direct correspondence from website contact forms. Click <strong>Reply via Email</strong> to answer correspondents directly using your email client.
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-bold text-emerald-900 shrink-0">
                {enquiries.length} {enquiries.length === 1 ? "Message" : "Messages"} Received
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <input
                type="search"
                placeholder="Search messages by sender name, email, or content..."
                value={inboxSearch}
                onChange={(e) => setInboxSearch(e.target.value)}
                className="flex-1 rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
              />
              <div className="flex overflow-x-auto gap-1.5 shrink-0">
                {["all", "contact", "author_pitch", "founder_spotlight", "newsletter"].map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setInboxFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                      inboxFilter === filterKey
                        ? "bg-[#080808] text-[#F7DF8B]"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {filterKey === "all" ? "All Inquiries" : filterKey.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const filteredEnquiries = enquiries.filter((enq) => {
                const matchFilter = inboxFilter === "all" || enq.enquiry_type === inboxFilter;
                const matchSearch =
                  !inboxSearch ||
                  enq.name.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                  enq.email.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                  (enq.subject || "").toLowerCase().includes(inboxSearch.toLowerCase()) ||
                  (enq.message || "").toLowerCase().includes(inboxSearch.toLowerCase());
                return matchFilter && matchSearch;
              });

              if (filteredEnquiries.length === 0) {
                return (
                  <div className="p-12 text-center rounded-3xl border border-neutral-200 bg-white space-y-3">
                    <Mail className="size-12 text-[#D4AF37] mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-[#080808]">
                      No Messages Found
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto">
                      When readers or authors send enquiries via the /contact page, their messages and email addresses will appear here.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4 hover:border-[#D4AF37]/50 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-base font-bold text-[#080808]">
                            {enq.name}
                          </span>
                          <span className="text-xs text-[#AA7C11] font-mono">
                            &lt;{enq.email}&gt;
                          </span>
                          {enq.organization && (
                            <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                              {enq.organization}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-gold-gradient text-[#050505]">
                            {enq.enquiry_type || "Contact"}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {new Date(enq.created_at).toLocaleDateString()} at {new Date(enq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-[#080808]">
                        {enq.subject || "No Subject"}
                      </h4>

                      <div className="text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap bg-[#FAF8F3] p-4 rounded-xl border border-neutral-200">
                        {enq.message}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(enq.email, enq.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            {copiedEmailId === enq.id ? (
                              <>
                                <Check className="size-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Email Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5 text-neutral-500" />
                                <span>Copy Email</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEnquiry(enq.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete this message"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                        <a
                          href={`mailto:${enq.email}?subject=Re: ${encodeURIComponent(enq.subject || "Literary Voices Network Correspondence")}&body=Dear ${encodeURIComponent(enq.name)},%0D%0A%0D%0AThank you for contacting Literary Voices Network.%0D%0A%0D%0A`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 shadow-xs cursor-pointer"
                        >
                          <Mail className="size-3.5" />
                          <span>Reply via Email</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* 5. PUBLISHED CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#080808]">
                  Published Books Catalog ({allBooks.length})
                </h2>
                <p className="text-xs text-[#080808]/70">
                  Every active book listing on the network with its category tag, live view count, and deletion management.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("books")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 cursor-pointer shrink-0"
              >
                <Plus className="size-3.5" />
                Add Another Book
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <input
                type="search"
                placeholder="Search catalog by title, author, or genre..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="flex-1 rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
              />
              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                aria-label="Filter catalog by category"
                className="rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-[#080808] bg-white focus:border-[#D4AF37] focus:outline-none shrink-0"
              >
                <option value="All">All Categories</option>
                <option value="Editorial">Editorial</option>
                <option value="Magazine">Magazine</option>
                <option value="Spotlight">Spotlight</option>
                <option value="Podcast">Podcast</option>
                <option value="Literary Fiction">Literary Fiction</option>
                <option value="Historical Fiction">Historical Fiction</option>
                <option value="Poetry">Poetry</option>
                <option value="Translation">Translation</option>
              </select>
            </div>

            {(() => {
              const filteredCatalog = allBooks.filter((b) => {
                const matchSearch =
                  !catalogSearch ||
                  b.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                  (b.author_name || "").toLowerCase().includes(catalogSearch.toLowerCase()) ||
                  (b.genre || "").toLowerCase().includes(catalogSearch.toLowerCase());
                const matchCategory =
                  catalogCategory === "All" ||
                  (b.genre || "").toLowerCase() === catalogCategory.toLowerCase();
                return matchSearch && matchCategory;
              });

              if (filteredCatalog.length === 0) {
                return (
                  <div className="p-12 text-center rounded-2xl bg-white border border-neutral-200 space-y-2">
                    <p className="font-serif text-lg font-bold text-[#080808]">No books match your filter</p>
                    <p className="text-xs text-neutral-500">Try adjusting your search query or category filter above.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex gap-4 items-start hover:border-[#D4AF37]/50 transition-all"
                    >
                      <img
                        src={b.cover_url || "/media/covers/the-first.jpg"}
                        alt={b.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/media/covers/the-first.jpg";
                        }}
                        className="w-16 h-24 object-cover rounded-xl border border-neutral-200 shrink-0 shadow-xs"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="rounded-full bg-gold-gradient px-2 py-0.5 text-[9px] font-bold text-[#050505]">
                            {b.genre}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600">
                            <Eye className="size-3 text-[#AA7C11]" />
                            {(b.view_count || 1200).toLocaleString()}
                          </span>
                        </div>

                        <h3 className="font-serif text-base font-bold text-[#080808] truncate" title={b.title}>
                          {b.title}
                        </h3>
                        <p className="text-xs text-neutral-600 truncate">
                          By {b.author_name || "Author"}
                        </p>

                        <div className="pt-2 flex items-center justify-between border-t border-neutral-100 mt-2">
                          <Link
                            href={`/books/${b.slug}`}
                            target="_blank"
                            className="text-[11px] font-bold text-[#AA7C11] hover:underline"
                          >
                            View Page →
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(b)}
                            title={`Delete "${b.title}" from catalog`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-white hover:bg-red-600 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* 6. SETTINGS & SECURITY TAB */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Change Password */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-[#080808] flex items-center gap-2">
                  <KeyRound className="size-4 text-[#AA7C11]" />
                  Change Administrator Password
                </h3>
                <p className="text-xs text-neutral-500">
                  Update your executive sign-in password.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">New Password (min 8 characters)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Notification Email */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-[#080808] flex items-center gap-2">
                  <Mail className="size-4 text-[#AA7C11]" />
                  Correspondence Receiving Email
                </h3>
                <p className="text-xs text-neutral-500">
                  Where reader contact messages and author submissions are dispatched.
                </p>
              </div>

              <form onSubmit={handleUpdateReceivingEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Receiving Email Address</label>
                  <input
                    type="email"
                    required
                    value={receivingEmail}
                    onChange={(e) => setReceivingEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 shadow-xs cursor-pointer"
                >
                  Save Receiving Email
                </button>
              </form>
            </div>

            {/* Live Radio Stream Broadcast Settings */}
            <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-[#D4AF37]/35 shadow-xs space-y-5">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#080808] flex items-center gap-2">
                    <Radio className="size-5 text-[#AA7C11]" />
                    Live Radio Studio Broadcast Feed
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Configure the live stream running on the site header and live radio player.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`size-3 rounded-full ${radioIsLive ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"}`} />
                  <span className="text-xs font-bold text-neutral-700">
                    {radioIsLive ? "Radio is Live" : "Radio Offline"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[#080808]">Stream Audio / Video URL</label>
                  <input
                    type="url"
                    value={radioStreamUrl}
                    onChange={(e) => setRadioStreamUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Programme Name</label>
                  <input
                    type="text"
                    value={radioProgramme}
                    onChange={(e) => setRadioProgramme(e.target.value)}
                    placeholder="LVN Live Studio"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="radioIsLiveToggle"
                    checked={radioIsLive}
                    onChange={(e) => setRadioIsLive(e.target.checked)}
                    className="size-4 accent-[#AA7C11] rounded cursor-pointer"
                  />
                  <label htmlFor="radioIsLiveToggle" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                    Enable Live Streaming Player for Visitors
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setBanner(null);
                    try {
                      const res = await fetch("/api/platform", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "upsert-live-radio",
                          liveRadioData: {
                            isLive: radioIsLive,
                            streamUrl: radioStreamUrl,
                            programmeName: radioProgramme,
                          },
                        }),
                      });
                      const data = await res.json();
                      if (data.ok) {
                        setBanner({ type: "success", text: "Live Radio settings updated successfully!" });
                      } else {
                        setBanner({ type: "error", text: data.error || "Failed to update radio stream." });
                      }
                    } catch {
                      setBanner({ type: "error", text: "Network error saving radio stream." });
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 shadow-xs cursor-pointer"
                >
                  Save Live Stream Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
