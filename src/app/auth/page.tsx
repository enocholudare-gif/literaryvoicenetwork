"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   Carousel background images — literary / broadcast themed
────────────────────────────────────────────────────────── */
const BG_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=80",
    caption: "Where every voice finds its stage",
  },
  {
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80",
    caption: "Connecting authors, readers & literary culture",
  },
  {
    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&q=80",
    caption: "Stories that echo around the world",
  },
  {
    url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80",
    caption: "Broadcast 24 / 7 across our global network",
  },
];

function CarouselBackground() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % BG_SLIDES.length);
        setFading(false);
      }, 600);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {BG_SLIDES.map((slide, i) => (
        <div
          key={slide.url}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            i === idx && !fading ? "opacity-35" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${slide.url})` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-[#050505]/60" />

      <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none">
        <p className="text-xs text-white/50 italic tracking-wide">
          &ldquo;{BG_SLIDES[idx].caption}&rdquo;
        </p>
        <div className="flex gap-1.5 pointer-events-auto">
          {BG_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`size-1.5 rounded-full transition-all ${i === idx ? "bg-[#D4AF37] w-4" : "bg-white/35"}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────
   Admin Sign In Portal (Strictly Admin Access)
────────────────────────────────────────────────────────── */
function AuthFormContent() {
  const router = useRouter();
  const [email, setEmail] = useState("perrycreativity@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign-in failed. Please check your credentials.");
      } else if (data.user?.role !== "admin") {
        setError("Access restricted: Only authorized administrators may log in through this portal.");
      } else {
        setSuccessMsg("Administrator verified! Opening Admin Operations Console…");
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 600);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      <CarouselBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* LVN brand mark */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center gap-1 group">
            <img
              src="/logo.png"
              alt="LVN Logo"
              className="size-12 object-contain rounded-xl group-hover:scale-105 transition-transform shadow-md"
            />
            <span className="font-serif-display text-lg font-bold text-white">
              Literary Voices Network
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Executive Administrator Gateway
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#080808]/92 backdrop-blur-xl border border-[#D4AF37]/45 shadow-[0_24px_64px_rgba(0,0,0,0.85)] p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-gradient text-[10px] font-bold uppercase tracking-widest text-[#050505]">
              <ShieldCheck className="size-3.5" />
              Administrator Access Only
            </span>
            <h1 className="font-serif-display text-2xl font-bold text-white pt-2">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#FAF8F3]/60">
              Sign in with your administrator email and password to access the moderation queue, publishing controls, and broadcast console.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/90 text-rose-200 text-xs font-medium border border-rose-500/40 flex items-start gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/90 text-emerald-200 text-xs font-medium border border-emerald-500/40 flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="perrycreativity@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-[0_4px_16px_rgba(212,175,55,0.35)] cursor-pointer"
            >
              {loading ? "Verifying Credentials…" : "Sign In to Admin Console"}
            </button>
          </form>
        </div>

        {/* Back to site */}
        <p className="text-center mt-4 text-[11px] text-white/50">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">
            ← Return to Literary Voices Network
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center text-sm">
          Loading sign in portal…
        </div>
      }
    >
      <AuthFormContent />
    </Suspense>
  );
}
