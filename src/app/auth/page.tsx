"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Feather,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "login";

  const [mode, setMode] = useState<"login" | "register" | "verify" | "reset">(
    initialMode === "register"
      ? "register"
      : initialMode === "verify"
      ? "verify"
      : initialMode === "reset"
      ? "reset"
      : "login"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleChoice, setRoleChoice] = useState<"member" | "author">("author");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devTokenPreview, setDevTokenPreview] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign-in failed.");
      } else {
        setSuccessMsg("Signed in! Redirecting...");
        const target =
          data.user?.role === "admin" || data.user?.role === "editor"
            ? "/admin"
            : "/dashboard";
        router.push(target);
        router.refresh();
      }
    } catch {
      setError("Network error while signing in.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: demoEmail,
          password: "LvnPass2026!",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Demo sign-in failed.");
      } else {
        const target =
          data.user?.role === "admin" || data.user?.role === "editor"
            ? "/admin"
            : "/dashboard";
        router.push(target);
        router.refresh();
      }
    } catch {
      setError("Network error during demo login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

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
          "Account created! We also generated a verification token below for local testing before redirecting to your studio."
        );
        if (data.verificationToken) {
          setDevTokenPreview(data.verificationToken);
        }
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

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-email", token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed.");
      } else {
        setSuccessMsg("Email verified! You can now sign in.");
        setMode("login");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!email) {
      setError("Enter your email address first to request a reset token.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-reset", email }),
      });
      const data = await res.json();
      if (data.devResetToken) {
        setToken(data.devResetToken);
        setDevTokenPreview(data.devResetToken);
        setSuccessMsg(
          "Password reset token generated! In development mode it has been pre-filled below."
        );
      } else {
        setSuccessMsg(
          "If an account exists for that email, a reset token has been dispatched."
        );
      }
    } catch {
      setError("Failed to request reset token.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          token,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Password reset failed.");
      } else {
        setSuccessMsg("Password updated! Please sign in with your new password.");
        setMode("login");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Auth Form */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#080808]/12 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-[#080808]/10 pb-5">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
                Literary Voices Network
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-1">
                {mode === "login" && "Sign In to Your Account"}
                {mode === "register" && "Create Member or Author Account"}
                {mode === "verify" && "Verify Your Email Address"}
                {mode === "reset" && "Password Recovery & Reset"}
              </h1>
            </div>
            <Feather className="w-7 h-7 text-[#D4AF37]" />
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-wrap gap-2 bg-[#F3EFE4] p-1.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                mode === "login"
                  ? "bg-[#080808] text-white"
                  : "text-[#080808]/70 hover:text-[#080808]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                mode === "register"
                  ? "bg-[#080808] text-white"
                  : "text-[#080808]/70 hover:text-[#080808]"
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                mode === "reset"
                  ? "bg-[#080808] text-white"
                  : "text-[#080808]/70 hover:text-[#080808]"
              }`}
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("verify");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                mode === "verify"
                  ? "bg-[#080808] text-white"
                  : "text-[#080808]/70 hover:text-[#080808]"
              }`}
            >
              Verify Token
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/90 text-rose-100 text-xs font-medium border border-rose-500/40">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-amber-950/90 text-emerald-100 text-xs font-medium border border-amber-500/40">
              {successMsg}
              {devTokenPreview && (
                <div className="mt-2 font-mono text-[11px] bg-black/30 p-2 rounded">
                  Dev Token: {devTokenPreview}
                </div>
              )}
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#080808]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#080808]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#080808] text-white font-bold text-sm hover:bg-[#141414] transition-colors disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In to Literary Voices Network"}
              </button>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Public Display Name / Pen Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#080808]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Clara Vance"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Password (Minimum 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Account Profile Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRoleChoice("author")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      roleChoice === "author"
                        ? "border-[#080808] bg-[#080808] text-white"
                        : "border-[#080808]/20 text-[#080808]"
                    }`}
                  >
                    <span className="font-bold text-xs block">Author & Contributor</span>
                    <span className="text-[11px] opacity-75">
                      Public author profile, submit books, essays, and pitches
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleChoice("member")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      roleChoice === "member"
                        ? "border-[#080808] bg-[#080808] text-white"
                        : "border-[#080808]/20 text-[#080808]"
                    }`}
                  >
                    <span className="font-bold text-xs block">Reader & Member</span>
                    <span className="text-[11px] opacity-75">
                      Save favourite books, follow authors, and submit essays
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-sm hover:bg-[#F7DF8B] transition-colors disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create LVN Account"}
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  1. Enter Account Email & Request Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRequestReset}
                    className="px-4 py-2.5 rounded-xl bg-[#080808] text-white text-xs font-bold shrink-0"
                  >
                    Generate Token
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  2. Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste reset token"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  3. New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-sm hover:bg-[#F7DF8B] transition-colors"
              >
                Confirm New Password
              </button>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Email Verification Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter verification token"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#080808] text-white font-bold text-sm"
              >
                Verify Email
              </button>
            </form>
          )}
        </div>

        {/* Right Column: One-Click Demo Role Access for QA & Evaluation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-[#080808] text-[#FAF8F3] p-7 border border-[#D4AF37]/35 shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl font-bold text-white">
                Instant Role Switcher (Demo & QA)
              </h2>
            </div>
            <p className="text-xs text-[#FAF8F3]/80 leading-relaxed">
              Test every role-based workflow immediately with our seeded accounts (all using password{" "}
              <code className="text-[#F7DF8B] font-mono">LvnPass2026!</code>):
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin("admin@literaryvoicesnetwork.org")
                }
                className="w-full p-4 rounded-2xl bg-[#141414] hover:bg-[#1D2540] border border-[#D4AF37]/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Administrator + Public Author
                  </span>
                  <span className="text-[11px] text-white/60 group-hover:text-white">
                    Sign In →
                  </span>
                </div>
                <div className="font-serif font-bold text-base text-white mt-1">
                  Eleanor Vance (admin@literaryvoicesnetwork.org)
                </div>
                <p className="text-[11px] text-[#FAF8F3]/70 mt-1">
                  Full platform administration + personal public author profile at{" "}
                  <code>/authors/eleanor-vance</code> with direct publishing.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin("editor@literaryvoicesnetwork.org")
                }
                className="w-full p-4 rounded-2xl bg-[#141414] hover:bg-[#1D2540] border border-white/10 hover:border-[#D4AF37]/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F7DF8B]">
                    Senior Commissioning Editor
                  </span>
                  <span className="text-[11px] text-white/60 group-hover:text-white">
                    Sign In →
                  </span>
                </div>
                <div className="font-serif font-bold text-base text-white mt-1">
                  Marcus Sterling (editor@literaryvoicesnetwork.org)
                </div>
                <p className="text-[11px] text-[#FAF8F3]/70 mt-1">
                  Review member book & article submissions, request revisions, approve/schedule publications.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin("amara.osei@literaryvoicesnetwork.org")
                }
                className="w-full p-4 rounded-2xl bg-[#141414] hover:bg-[#1D2540] border border-white/10 hover:border-[#D4AF37]/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Verified Author
                  </span>
                  <span className="text-[11px] text-white/60 group-hover:text-white">
                    Sign In →
                  </span>
                </div>
                <div className="font-serif font-bold text-base text-white mt-1">
                  Amara Osei (amara.osei@literaryvoicesnetwork.org)
                </div>
                <p className="text-[11px] text-[#FAF8F3]/70 mt-1">
                  Manage books, draft essays in the rich-text studio, pitch interviews, and edit public author profile.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin("member@literaryvoicesnetwork.org")
                }
                className="w-full p-4 rounded-2xl bg-[#141414] hover:bg-[#1D2540] border border-white/10 hover:border-[#D4AF37]/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    Registered Member / Reader
                  </span>
                  <span className="text-[11px] text-white/60 group-hover:text-white">
                    Sign In →
                  </span>
                </div>
                <div className="font-serif font-bold text-base text-white mt-1">
                  Nadia Khoury (member@literaryvoicesnetwork.org)
                </div>
                <p className="text-[11px] text-[#FAF8F3]/70 mt-1">
                  Submit community essays, track review feedback, manage saved books, followed authors, and event RSVPs.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-12 text-sm text-[#080808]">
          Loading authentication studio...
        </div>
      }
    >
      <AuthFormContent />
    </Suspense>
  );
}
