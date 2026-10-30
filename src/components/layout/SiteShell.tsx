"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Compass,
  ExternalLink,
  Feather,
  Globe,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  Newspaper,
  Phone,
  Play,
  Radio,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type {
  NotificationItem,
  Profile,
  SiteSettingsMap,
  User as UserModel,
} from "@/lib/db/types";

const SPOTIFY_URL =
  "https://open.spotify.com/user/31lygcpwpx6g66kako3vx25pa4fu?si=2rDuJW9YSeWLWsdYnLVJ_w&utm_source=copy-link";
const ORBITTECH_URL = "https://orbittechportfolio.vercel.app/";
const CONTACT_WHATSAPP = "https://wa.me/13678481372";
const CONTACT_PHONE = "+1 (367) 848-1372";

interface SiteShellProps {
  children: React.ReactNode;
  settings?: SiteSettingsMap;
  initialUser?: Omit<UserModel, "password_hash"> | null;
  initialProfile?: Profile | null;
}

interface DropdownSubItem {
  href: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  id: string;
  label: string;
  href: string;
  badge?: boolean;
  items?: DropdownSubItem[];
  featured?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    href: string;
    cta: string;
  };
}

/**
 * Custom Professional Gold-Gradient & Obsidian Crest Logo
 * Combines an open literary volume, studio broadcast waves, and a golden nib/microphone.
 */
export function LvnCrestLogo({ className = "size-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lvnGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A6F0B" />
        </linearGradient>
        <linearGradient id="lvnDarkBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#171717" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
      </defs>
      {/* Outer Shield / Seal */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="15"
        fill="url(#lvnDarkBg)"
        stroke="url(#lvnGoldGrad)"
        strokeWidth="2.2"
      />
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="11"
        stroke="url(#lvnGoldGrad)"
        strokeOpacity="0.3"
        strokeWidth="0.9"
      />
      {/* Broadcast Soundwave Arcs */}
      <path
        d="M21 22C17.5 25.5 17.5 31.5 21 35"
        stroke="url(#lvnGoldGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 18.5C11 24 11 33 16.5 38.5"
        stroke="url(#lvnGoldGrad)"
        strokeOpacity="0.6"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M43 22C46.5 25.5 46.5 31.5 43 35"
        stroke="url(#lvnGoldGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M47.5 18.5C53 24 53 33 47.5 38.5"
        stroke="url(#lvnGoldGrad)"
        strokeOpacity="0.6"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Center Studio Microphone / Fountain Nib */}
      <rect
        x="28"
        y="17"
        width="8"
        height="14"
        rx="4"
        fill="url(#lvnGoldGrad)"
      />
      <path
        d="M25 27C25 30.866 28.134 34 32 34C35.866 34 39 30.866 39 27"
        stroke="url(#lvnGoldGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="34"
        x2="32"
        y2="43"
        stroke="url(#lvnGoldGrad)"
        strokeWidth="2"
      />
      {/* Open Literary Book Pages at Base */}
      <path
        d="M15 47C21 44.5 27 45.5 32 48.5C37 45.5 43 44.5 49 47V41C43 38.5 37 39.5 32 42.5C27 39.5 21 38.5 15 41V47Z"
        fill="url(#lvnGoldGrad)"
      />
    </svg>
  );
}

export function SiteShell({
  children,
  settings,
  initialUser = null,
  initialProfile = null,
}: SiteShellProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(
    "programming"
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const navRef = useRef<HTMLElement | null>(null);

  // Close menus immediately on route transition
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fetch session once on mount so navigation clicks are instantaneous
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setProfile(data.profile);
          setNotifications(data.notifications || []);
        } else {
          setUser(null);
          setProfile(null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleFooterNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-enquiry",
        enquiryData: {
          enquiryType: "newsletter",
          name: "LVN Reader",
          email: newsletterEmail.trim(),
          subject: "Newsletter Subscription",
          message: "Subscribed via footer dispatch form.",
        },
      }),
    });
    if (res.ok) {
      setNewsletterMsg("Subscribed to the Literary Voices Weekly Dispatch.");
      setNewsletterEmail("");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navGroups: NavGroup[] = [
    {
      id: "home",
      label: "Home",
      href: "/",
    },
    {
      id: "live",
      label: "Live Radio",
      href: "/live",
      badge: true,
    },
    {
      id: "podcast",
      label: "Podcast",
      href: "/broadcasts",
    },
    {
      id: "audiobooks",
      label: "Audiobooks",
      href: "/books?format=audiobook",
    },
    {
      id: "author-spotlight",
      label: "Author Spotlight",
      href: "/authors",
    },
    {
      id: "magazine-link",
      label: "Magazine",
      href: "/#lvn-digital-magazine",
    },
    {
      id: "programming",
      label: "Programming",
      href: "/shows",
      items: [
        {
          href: "/shows",
          label: "Shows",
          desc: "Weekly broadcast schedule & syndicate slots",
          icon: Radio,
        },
        {
          href: "/events",
          label: "Events",
          desc: "Live readings, salons & author tours",
          icon: Calendar,
        },
        {
          href: "/broadcasts",
          label: "Broadcast Archive",
          desc: "Stream full recorded episodes on demand",
          icon: Headphones,
        },
        {
          href: "/partners",
          label: "Partners",
          desc: "Global book & audio distribution network",
          icon: Globe,
        },
      ],
      featured: {
        eyebrow: "On Air Now",
        title: "Literary Voices Live",
        subtitle:
          "24/7 stream of author interviews, live readings, and literary commentary.",
        href: "/live",
        cta: "Tune in live",
      },
    },
    {
      id: "library",
      label: "Library",
      href: "/books",
      items: [
        {
          href: "/authors",
          label: "Authors",
          desc: "Featured novelists, essayists & hosts",
          icon: Users,
        },
        {
          href: "/books",
          label: "Books",
          desc: "Curated reading list & ISBN directory",
          icon: BookOpen,
        },
        {
          href: "/community-books",
          label: "Recently Added Books",
          desc: "Fresh titles shared by our community",
          icon: BookOpen,
        },
        {
          href: "/founder-spotlight",
          label: "Founder Spotlight",
          desc: "Entrepreneurs, publishers & cultural builders",
          icon: Compass,
        },
        {
          href: "/magazine",
          label: "Magazine",
          desc: "Long-form essays, reviews & cover stories",
          icon: Feather,
        },
        {
          href: "/world-news",
          label: "World News",
          desc: "Global literary & cultural headlines",
          icon: Newspaper,
        },
        {
          href: "/awards",
          label: "Awards & Recognition",
          desc: "Celebrating authors honoured on our network",
          icon: Award,
        },
      ],
    },
    {
      id: "for-authors",
      label: "For Authors",
      href: "/for-authors",
      items: [
        {
          href: "/for-authors",
          label: "Submit Your Book",
          desc: "Get featured on air across the network",
          icon: Mic2,
        },
        {
          href: "/publish",
          label: "Publish a Book",
          desc: "Add your book to the LVN directory",
          icon: BookOpen,
        },
        {
          href: "/my-books",
          label: "My Books",
          desc: "Track your submissions & editorial status",
          icon: LayoutDashboard,
        },
        {
          href: "/founder-spotlight/submit",
          label: "Founder Pitch",
          desc: "Apply for Business & Founder Spotlight",
          icon: Mic2,
        },
        {
          href: "/editorial-calendar",
          label: "Editorial Calendar",
          desc: "Seasonal magazine issues & deadlines",
          icon: Calendar,
        },
      ],
    },
    {
      id: "about",
      label: "About",
      href: "/about",
    },
    {
      id: "contact",
      label: "Contact",
      href: "/contact",
    },
  ];

  const isGroupActive = (group: NavGroup): boolean => {
    if (group.href === "/") {
      return pathname === "/";
    }
    if (pathname === group.href || pathname.startsWith(`${group.href}/`)) {
      return true;
    }
    if (group.items) {
      return group.items.some(
        (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
      );
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#080808] overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#080808] focus:text-[#F7DF8B] focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* MAIN NAVIGATION HEADER — Obsidian Black & Gold Gradient */}
      <header
        ref={navRef}
        className="sticky top-0 z-50 w-full bg-[#060606]/95 backdrop-blur-xl text-[#FAF8F3] border-b border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
      >
        <div className="w-full px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Left-Shifted Custom Gold Crest Logo + Animated Brand Title */}
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-2.5 group shrink-0 min-w-0"
          >
            <div className="group-hover:scale-105 transition-transform duration-300 shrink-0">
              <img src="/logo.png" alt="LVN Crest" className="size-10 object-contain rounded-lg" />
            </div>
            <div className="leading-tight">
              <span className="block font-serif-display text-xs sm:text-sm font-bold tracking-tight brand-name-transition">
                {settings?.logoText || "Literary Voices Network"}
              </span>
              <span className="block text-[8px] uppercase tracking-[0.22em] text-[#D4AF37] group-hover:text-[#F7DF8B] transition-colors duration-300">
                Broadcast &amp; Publishing
              </span>
            </div>
          </Link>

          {/* Center Desktop Navigation Bar */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-0.5 rounded-full bg-[#121212] px-2 py-1 border border-[#D4AF37]/30 shadow-inner shrink-0"
          >
            {navGroups.map((group) => {
              const active = isGroupActive(group);
              const hasDropdown = Boolean(group.items && group.items.length > 0);
              const isOpen = openDropdown === group.id;

              if (!hasDropdown) {
                return (
                  <Link
                    key={group.id}
                    href={group.href}
                    prefetch={true}
                    onClick={() => setOpenDropdown(null)}
                    className={`relative inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-150 whitespace-nowrap ${
                      active
                        ? "bg-gold-gradient text-[#050505] font-bold shadow-xs"
                        : "text-[#FAF8F3]/85 hover:text-[#F7DF8B] hover:bg-white/5"
                    }`}
                  >
                    {group.badge && (
                      <span className="relative flex size-1.5">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            active ? "bg-[#050505]" : "bg-[#D4AF37]"
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full size-1.5 ${
                            active ? "bg-[#050505]" : "bg-[#D4AF37]"
                          }`}
                        />
                      </span>
                    )}
                    <span>{group.label}</span>
                  </Link>
                );
              }

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(group.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <div className="flex items-center">
                    <Link
                      href={group.href}
                      prefetch={true}
                      onClick={() => setOpenDropdown(null)}
                      className={`inline-flex items-center gap-1 pl-2.5 xl:pl-3 pr-1 py-1.5 rounded-l-full text-[11px] font-semibold tracking-wide transition-all duration-150 whitespace-nowrap ${
                        active
                          ? "bg-gold-gradient text-[#050505] font-bold"
                          : "text-[#FAF8F3]/85 hover:text-[#F7DF8B] hover:bg-white/5"
                      }`}
                    >
                      <span>{group.label}</span>
                    </Link>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`Toggle ${group.label} menu`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(isOpen ? null : group.id);
                      }}
                      className={`pr-2 pl-0.5 py-1.5 rounded-r-full text-[11px] transition-all duration-150 ${
                        active
                          ? "bg-gold-gradient text-[#050505]"
                          : "text-[#FAF8F3]/75 hover:text-[#F7DF8B] hover:bg-white/5"
                      }`}
                    >
                      <ChevronDown
                        className={`size-3 transition-transform duration-150 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dropdown Panel */}
                  {isOpen && (
                    <div className="absolute left-0 top-full pt-2 z-50">
                      <div
                        className={`rounded-2xl bg-[#0A0A0A] border border-[#D4AF37]/40 shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-4 ${
                          group.featured
                            ? "w-[500px] grid grid-cols-12 gap-4"
                            : "w-[320px]"
                        }`}
                      >
                        <div
                          className={
                            group.featured
                              ? "col-span-7 space-y-1"
                              : "space-y-1"
                          }
                        >
                          <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                            {group.label}
                          </p>
                          {group.items!.map((sub) => {
                            const SubIcon = sub.icon;
                            const subActive =
                              pathname === sub.href ||
                              pathname.startsWith(`${sub.href}/`);
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                prefetch={true}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-start gap-2.5 rounded-xl p-2 transition-all duration-150 ${
                                  subActive
                                    ? "bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FAF8F3]"
                                    : "hover:bg-white/5 text-[#FAF8F3]/85 border border-transparent"
                                }`}
                              >
                                <div className="size-7 rounded-lg bg-[#141414] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                                  <SubIcon className="size-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-[#FAF8F3] flex items-center gap-1.5">
                                    {sub.label}
                                    {subActive && (
                                      <span className="size-1.5 rounded-full bg-[#D4AF37]" />
                                    )}
                                  </p>
                                  <p className="text-[11px] text-[#FAF8F3]/60 leading-snug mt-0.5">
                                    {sub.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {group.featured && (
                          <div className="col-span-5 rounded-xl bg-gradient-to-br from-[#141414] to-[#1F1A0E] border border-[#D4AF37]/40 p-4 flex flex-col justify-between">
                            <div>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#F7DF8B]">
                                <span className="size-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                                {group.featured.eyebrow}
                              </span>
                              <h4 className="font-serif-display text-base font-bold text-[#FAF8F3] mt-3">
                                {group.featured.title}
                              </h4>
                              <p className="text-xs text-[#FAF8F3]/70 mt-1.5 leading-relaxed">
                                {group.featured.subtitle}
                              </p>
                            </div>
                            <Link
                              href={group.featured.href}
                              prefetch={true}
                              onClick={() => setOpenDropdown(null)}
                              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-3.5 py-2 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
                            >
                              <Play className="size-3 fill-current" />
                              {group.featured.cta}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Controls — Staggered One-After-The-Other Animation & Generous Spacing */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search books, authors, shows, and articles"
              className="animate-nav-stagger-1 p-2 rounded-full border border-[#D4AF37]/35 bg-[#141414] text-[#FAF8F3]/85 hover:border-[#F7DF8B] hover:text-[#F7DF8B] transition-colors"
            >
              <Search className="size-3.5 text-[#D4AF37]" />
            </button>

            {user ? (
              <div className="animate-nav-stagger-2 flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotifOpen(!notifOpen)}
                    aria-label="Notifications"
                    className="relative p-2 rounded-full border border-[#D4AF37]/30 bg-[#141414] text-[#FAF8F3]/85 hover:border-[#F7DF8B]"
                  >
                    <Bell className="size-3.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 size-4 rounded-full bg-gold-gradient text-[#050505] text-[10px] font-bold grid place-items-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0A0A0A] border border-[#D4AF37]/40 shadow-2xl p-4 z-50 text-xs">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                        <span className="font-semibold text-[#F7DF8B]">
                          Notifications
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch("/api/auth", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "mark-all-notifications-read",
                              }),
                            });
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, is_read: true }))
                            );
                          }}
                          className="text-[11px] text-[#D4AF37] hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-white/60 py-3 text-center">
                            No notifications yet.
                          </p>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <Link
                              key={n.id}
                              href={n.link_url}
                              onClick={() => setNotifOpen(false)}
                              className={`block rounded-lg p-2.5 border transition-colors ${
                                n.is_read
                                  ? "border-white/5 bg-white/5 text-white/70"
                                  : "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-white"
                              }`}
                            >
                              <p className="font-semibold text-[#F7DF8B]">
                                {n.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-white/80 line-clamp-2">
                                {n.message}
                              </p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/40 transition-colors"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : null}

            {/* Primary Listen Live CTA */}
            <Link
              href="/live"
              prefetch={true}
              className="animate-nav-stagger-3 inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-3.5 py-1.5 text-[11px] font-bold text-[#050505] shadow-[0_4px_16px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all whitespace-nowrap"
            >
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#050505] opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-[#050505]" />
              </span>
              <span>Listen Live</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-lg border border-[#D4AF37]/35 bg-[#141414] text-[#FAF8F3]"
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Search Drawer */}
        {searchOpen && (
          <div className="border-t border-[#D4AF37]/25 bg-[#111111] px-4 py-3.5">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto flex items-center gap-3"
            >
              <Search className="size-4 text-[#D4AF37] shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, authors, shows, events, or magazine essays…"
                className="flex-1 bg-[#060606] border border-[#D4AF37]/35 rounded-full px-4 py-2 text-xs sm:text-sm text-[#FAF8F3] placeholder:text-white/45 focus:outline-none focus:border-[#F7DF8B]"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-full bg-gold-gradient px-4 py-2 text-xs font-bold text-[#050505] hover:brightness-110"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Responsive Accordion Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D4AF37]/25 bg-[#080808] px-4 py-4 max-h-[82vh] overflow-y-auto space-y-3">
            {navGroups.map((group) => {
              const active = isGroupActive(group);
              const hasSub = Boolean(group.items && group.items.length > 0);
              const isExpanded = mobileExpandedGroup === group.id;

              if (!hasSub) {
                return (
                  <Link
                    key={group.id}
                    href={group.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-semibold border transition-colors ${
                      active
                        ? "bg-gold-gradient text-[#050505] border-[#D4AF37] font-bold"
                        : "bg-[#141414] text-[#FAF8F3] border-white/10 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {group.badge && (
                        <span className="size-2 rounded-full bg-[#D4AF37] animate-pulse" />
                      )}
                      {group.label}
                    </span>
                    <ChevronRight className="size-4 opacity-70" />
                  </Link>
                );
              }

              return (
                <div
                  key={group.id}
                  className="rounded-xl border border-white/10 bg-[#141414] overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <Link
                      href={group.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xs font-semibold ${
                        active ? "text-[#F7DF8B]" : "text-[#FAF8F3]"
                      }`}
                    >
                      {group.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedGroup(isExpanded ? null : group.id)
                      }
                      aria-label={`Expand ${group.label}`}
                      className="p-1 text-[#D4AF37]"
                    >
                      <ChevronDown
                        className={`size-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-[#080808]/90 px-3 py-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.items!.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                              subActive
                                ? "bg-gold-gradient text-[#050505] font-bold"
                                : "text-[#FAF8F3]/85 hover:bg-white/5"
                            }`}
                          >
                            <SubIcon className="size-3.5 shrink-0 text-[#D4AF37]" />
                            <div>
                              <p className="font-semibold">{sub.label}</p>
                              <p className="text-[10px] opacity-70">{sub.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
              <Link
                href="/live"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-gold-gradient px-4 py-2.5 text-xs font-bold text-[#050505] shadow-[0_2px_10px_rgba(212,175,55,0.3)]"
              >
                Listen Live Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* MAIN PAGE CONTENT */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* EDITORIAL & BROADCAST NETWORK FOOTER — Gold & Black with Spotify, Phone & OrbitTech */}
      <footer className="bg-[#060606] text-[#FAF8F3] border-t border-[#D4AF37]/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
            {/* Brand & Dispatch Column */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/logo.png" alt="LVN Crest" className="size-11 object-contain rounded-lg" />
                <div>
                  <p className="font-serif-display text-lg font-bold brand-name-transition">
                    Literary Voices Network
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37]">
                    Global Book Broadcast &amp; Publishing Network
                  </p>
                </div>
              </Link>
              <p className="text-sm text-[#FAF8F3]/70 max-w-md leading-relaxed">
                Dedicated to literature, live author conversations, and the
                craft of writing. Broadcasting 24/7 across 8 global studio hubs.
              </p>

              {/* Direct Phone & Spotify Quick Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <a
                  href={CONTACT_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#141414] border border-[#25D366]/40 px-3.5 py-1.5 text-[#25D366] hover:bg-[#25D366] hover:text-[#050505] transition-all font-semibold"
                >
                  <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.031 2C6.51 2 2.023 6.48 2.023 12c0 1.838.498 3.564 1.365 5.053L2 22l5.093-1.336A9.94 9.94 0 0 0 12.031 22c5.522 0 10.01-4.48 10.01-10s-4.488-10-10.01-10zm0 18.232c-1.574 0-3.1-.423-4.437-1.223l-.318-.19-3.295.864.88-3.21-.208-.33a8.21 8.21 0 0 1-1.26-4.343c0-4.542 3.697-8.238 8.238-8.238 4.542 0 8.238 3.696 8.238 8.238 0 4.542-3.696 8.232-8.238 8.232zm4.516-6.173c-.248-.124-1.464-.722-1.691-.805-.227-.082-.393-.124-.558.124-.165.248-.641.805-.786.971-.144.165-.29.186-.537.062-.248-.124-1.047-.386-1.994-1.23-.737-.658-1.235-1.47-1.38-1.718-.144-.248-.015-.382.109-.505.111-.111.248-.29.372-.434.124-.145.165-.248.248-.414.083-.165.041-.31-.02-.434-.063-.124-.558-1.344-.765-1.841-.201-.484-.406-.418-.558-.426l-.475-.008c-.165 0-.434.062-.661.31-.227.248-.868.848-.868 2.067s.888 2.398 1.012 2.563c.124.165 1.748 2.669 4.234 3.743.592.256 1.054.409 1.414.523.594.189 1.135.162 1.562.098.477-.071 1.464-.599 1.671-1.178.207-.579.207-1.075.145-1.178-.062-.104-.227-.166-.475-.29z" />
                  </svg>
                  <span>WhatsApp Us</span>
                </a>
                <a
                  href={SPOTIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-3.5 py-1.5 font-bold text-[#050505] hover:brightness-110 transition-all"
                >
                  <Headphones className="size-3.5" />
                  <span>Follow on Spotify</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              <form
                onSubmit={handleFooterNewsletter}
                className="flex max-w-sm gap-2 pt-1"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email for show & book alerts…"
                  aria-label="Newsletter email address"
                  className="flex-1 rounded-full bg-[#141414] border border-[#D4AF37]/35 px-4 py-2 text-xs text-[#FAF8F3] placeholder:text-white/40 focus:outline-none focus:border-[#F7DF8B]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gold-gradient px-4 py-2 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
                >
                  Subscribe
                </button>
              </form>
              {newsletterMsg && (
                <p className="text-xs text-[#F7DF8B]">{newsletterMsg}</p>
              )}
            </div>

            {/* Column 1: Listen */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">
                Listen
              </h3>
              <ul className="space-y-2.5 text-xs text-[#FAF8F3]/75">
                <li>
                  <Link
                    href="/live"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Live Stream
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shows"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Program Schedule
                  </Link>
                </li>
                <li>
                  <Link
                    href="/broadcasts"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Podcast Archive
                  </Link>
                </li>
                <li>
                  <a
                    href={SPOTIFY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F7DF8B] transition-colors inline-flex items-center gap-1"
                  >
                    Official Spotify Page <ExternalLink className="size-3" />
                  </a>
                </li>
                <li>
                  <Link
                    href="/special-editions"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Special Editions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Discover */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">
                Discover
              </h3>
              <ul className="space-y-2.5 text-xs text-[#FAF8F3]/75">
                <li>
                  <Link
                    href="/authors"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Featured Authors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/books"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Book Directory
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community-books"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Recently Added Books
                  </Link>
                </li>
                <li>
                  <Link
                    href="/founder-spotlight"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Founder Spotlight
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Live Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partners"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Partners
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Magazine */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">
                Magazine
              </h3>
              <ul className="space-y-2.5 text-xs text-[#FAF8F3]/75">
                <li>
                  <Link
                    href="/magazine"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    All Articles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/world-news"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    World News
                  </Link>
                </li>
                <li>
                  <Link
                    href="/magazine?type=review"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    href="/magazine?type=essay"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Essays
                  </Link>
                </li>
                <li>
                  <Link
                    href="/magazine?type=interview"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Interviews
                  </Link>
                </li>
                <li>
                  <Link
                    href="/editorial-calendar"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Editorial Calendar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Network */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">
                Network
              </h3>
              <ul className="space-y-2.5 text-xs text-[#FAF8F3]/75">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    About Us &amp; Leadership
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-authors"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    For Authors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publish"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Publish a Book
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press-releases"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Press &amp; Media
                  </Link>
                </li>
                <li>
                  <Link
                    href="/syndication"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Syndication
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[#F7DF8B] transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F3]/70">
            <p>
              © 2026 Literary Voices Network (LVN). An independent literary publication and publishing platform.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={ORBITTECH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#141414] px-3.5 py-1 text-xs font-bold text-[#F7DF8B] hover:bg-gold-gradient hover:text-[#050505] transition-all"
              >
                <span>Powered by OrbitTech</span>
                <ExternalLink className="size-3" />
              </a>
              <Link
                href="https://www.literaryvoicenetwork.org/privacy"
                className="hover:text-[#F7DF8B] transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="https://www.literaryvoicenetwork.org/terms"
                className="hover:text-[#F7DF8B] transition-colors"
              >
                Terms
              </Link>
              <Link
                href="https://www.literaryvoicenetwork.org/press-releases"
                className="hover:text-[#F7DF8B] transition-colors"
              >
                Press
              </Link>
              <Link
                href="/admin"
                className="text-[#F7DF8B] font-semibold hover:underline transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 right-6 z-50">
        <a
          href={CONTACT_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="group flex items-center gap-2.5 rounded-full bg-[#25D366] text-white px-4 py-3 shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:bg-[#20ba5a] hover:scale-105 transition-all duration-300"
        >
          <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.031 2C6.51 2 2.023 6.48 2.023 12c0 1.838.498 3.564 1.365 5.053L2 22l5.093-1.336A9.94 9.94 0 0 0 12.031 22c5.522 0 10.01-4.48 10.01-10s-4.488-10-10.01-10zm0 18.232c-1.574 0-3.1-.423-4.437-1.223l-.318-.19-3.295.864.88-3.21-.208-.33a8.21 8.21 0 0 1-1.26-4.343c0-4.542 3.697-8.238 8.238-8.238 4.542 0 8.238 3.696 8.238 8.238 0 4.542-3.696 8.232-8.238 8.232zm4.516-6.173c-.248-.124-1.464-.722-1.691-.805-.227-.082-.393-.124-.558.124-.165.248-.641.805-.786.971-.144.165-.29.186-.537.062-.248-.124-1.047-.386-1.994-1.23-.737-.658-1.235-1.47-1.38-1.718-.144-.248-.015-.382.109-.505.111-.111.248-.29.372-.434.124-.145.165-.248.248-.414.083-.165.041-.31-.02-.434-.063-.124-.558-1.344-.765-1.841-.201-.484-.406-.418-.558-.426l-.475-.008c-.165 0-.434.062-.661.31-.227.248-.868.848-.868 2.067s.888 2.398 1.012 2.563c.124.165 1.748 2.669 4.234 3.743.592.256 1.054.409 1.414.523.594.189 1.135.162 1.562.098.477-.071 1.464-.599 1.671-1.178.207-.579.207-1.075.145-1.178-.062-.104-.227-.166-.475-.29z" />
          </svg>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">WhatsApp Us</span>
        </a>
      </aside>
    </div>
  );
}
