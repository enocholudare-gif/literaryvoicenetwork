"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Feather,
  Lock,
  Mail,
  User,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   Carousel background images — literary / broadcast themed
   (using publicly accessible placeholder images for now)
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
      {/* Slide image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundImage: `url(${BG_SLIDES[idx].url})` }}
        aria-hidden="true"
      />
      {/* Dark scrim */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(4,4,4,0.88) 0%, rgba(8,8,8,0.70) 60%, rgba(4,4,4,0.82) 100%)",
        }}
      />
      {/* Gold accent glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(212,175,55,0.18),transparent_60%)]" />

      {/* Caption */}
      <div className="absolute bottom-6 left-8 right-8 text-center pointer-events-none z-10">
        <p
          className={`font-serif-display text-sm italic text-[#F7DF8B]/80 transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          &ldquo;{BG_SLIDES[idx].caption}&rdquo;
        </p>
        <div className="flex justify-center gap-1.5 mt-3">
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
   Main auth form
────────────────────────────────────────────────────────── */
function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "login";

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">(
    initialMode === "register"
      ? "register"
      : initialMode === "forgot"
      ? "forgot"
      : initialMode === "reset"
      ? "reset"
      : "login"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleChoice, setRoleChoice] = useState<"member" | "author">("author");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  /* ── Sign In ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign-in failed. Please check your credentials.");
      } else {
        setSuccessMsg("Signed in! Redirecting…");
        const role = data.user?.role;
        const target =
          role === "admin" || role === "editor" ? "/admin" : "/dashboard";
        router.push(target);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Register ── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          email,
          password,
          displayName,
          accountType: roleChoice,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        setSuccessMsg(
          "Account created! Redirecting to your studio…"
        );
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1200);
      }
    } catch {
      setError("Network error during registration.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot Password ── */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-reset", email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reset email.");
      } else {
        setSuccessMsg(
          "If an account exists for that email, a password reset link has been sent. Please check your inbox."
        );
        // In dev mode, pre-fill the token field and switch to reset mode
        if (data.devResetToken) {
          setResetToken(data.devResetToken);
          setTimeout(() => setMode("reset"), 1500);
        }
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Reset Password ── */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          token: resetToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Password reset failed.");
      } else {
        setSuccessMsg("Password updated! You can now sign in with your new password.");
        setTimeout(() => setMode("login"), 1800);
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Carousel background */}
      <CarouselBackground />

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md">
        {/* LVN brand mark */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center gap-1 group">
            <img src="/logo.png" alt="LVN Logo" className="size-12 object-contain rounded-xl group-hover:scale-105 transition-transform shadow-md" />
            <span className="font-serif-display text-lg font-bold text-white">
              Literary Voices Network
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Authors · Readers · Editors
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#080808]/90 backdrop-blur-xl border border-[#D4AF37]/40 shadow-[0_24px_64px_rgba(0,0,0,0.85)] p-8 space-y-6">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-[#111111] p-1 rounded-xl text-[11px] font-semibold">
            {(["login", "register", "forgot"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); clearMessages(); }}
                className={`flex-1 py-2 px-2 rounded-lg transition-colors capitalize ${
                  mode === m || (m === "forgot" && mode === "reset")
                    ? "bg-gold-gradient text-[#050505] font-bold"
                    : "text-[#FAF8F3]/70 hover:text-[#FAF8F3]"
                }`}
              >
                {m === "forgot" ? "Forgot Password" : m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="font-serif-display text-2xl font-bold text-white">
              {mode === "login" && "Welcome Back"}
              {mode === "register" && "Create Your Account"}
              {mode === "forgot" && "Reset Your Password"}
              {mode === "reset" && "Enter New Password"}
            </h1>
            <p className="text-xs text-[#FAF8F3]/60 mt-1">
              {mode === "login" && "Sign in to access your dashboard"}
              {mode === "register" && "Join LVN as an author or reader member"}
              {mode === "forgot" && "We'll send a reset link to your email"}
              {mode === "reset" && "Enter the token from your email and your new password"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/90 text-rose-200 text-xs font-medium border border-rose-500/40 flex items-start gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/90 text-emerald-200 text-xs font-medium border border-emerald-500/40 flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Login Form ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); clearMessages(); }}
                    className="text-[11px] text-[#D4AF37] hover:text-[#F7DF8B] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
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
                className="w-full py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? "Signing In…" : "Sign In"}
              </button>

              <p className="text-center text-[11px] text-[#FAF8F3]/50">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); clearMessages(); }}
                  className="text-[#D4AF37] hover:underline font-semibold"
                >
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── Register Form ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  Display Name / Pen Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Clara Vance"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="author@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Account type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRoleChoice("author")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      roleChoice === "author"
                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F7DF8B]"
                        : "border-white/15 text-[#FAF8F3]/70 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <span className="font-bold text-xs block">Author &amp; Contributor</span>
                    <span className="text-[11px] opacity-75">
                      Public profile, books &amp; submissions
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleChoice("member")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      roleChoice === "member"
                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F7DF8B]"
                        : "border-white/15 text-[#FAF8F3]/70 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <span className="font-bold text-xs block">Reader &amp; Member</span>
                    <span className="text-[11px] opacity-75">
                      Save books, follow authors
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? "Creating Account…" : "Create Free Account"}
              </button>

              <p className="text-center text-[11px] text-[#FAF8F3]/50">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); clearMessages(); }}
                  className="text-[#D4AF37] hover:underline font-semibold"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ── Forgot Password Form ── */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>

              <p className="text-center text-[11px] text-[#FAF8F3]/50">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); clearMessages(); }}
                  className="text-[#D4AF37] hover:underline font-semibold"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ── Reset Password Form ── */}
          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  Reset Token (from your email)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] font-mono placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF8F3]/80 mb-1.5">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-[#FAF8F3] placeholder:text-white/35 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? "Updating…" : "Set New Password"}
              </button>
            </form>
          )}
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
        <div className="min-h-screen bg-[#040404] flex items-center justify-center p-12 text-sm text-[#FAF8F3]">
          Loading…
        </div>
      }
    >
      <AuthFormContent />
    </Suspense>
  );
}
