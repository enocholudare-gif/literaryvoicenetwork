"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { LvnCrestLogo } from "@/components/layout/SiteShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/auth?mode=login");
        } else if (
          data.user?.role !== "admin" &&
          data.user?.role !== "editor"
        ) {
          // Non-admin/editor users go to their dashboard
          router.push("/dashboard");
        } else {
          setUserName(data.profile?.display_name || data.user?.email || "");
          setUserRole(data.user?.role || "");
        }
      })
      .catch(() => router.push("/auth?mode=login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/auth?mode=login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF8F3] flex flex-col">
      {/* Admin top bar */}
      <header className="sticky top-0 z-50 bg-[#060606] border-b border-[#D4AF37]/30 shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <LvnCrestLogo className="size-8" />
            <div className="leading-tight">
              <p className="font-serif text-sm font-bold text-[#FAF8F3]">
                LVN Admin Console
              </p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-[#D4AF37]">
                {userRole === "admin" ? "Administrator" : "Editorial Staff"}
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {userName && (
              <span className="hidden sm:block text-xs text-[#FAF8F3]/60 border border-white/10 rounded-full px-3 py-1">
                {userName}
              </span>
            )}

            {/* Return to website */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#141414] px-3 py-1.5 text-[11px] font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/15 transition-all"
            >
              <ExternalLink className="size-3" />
              <span className="hidden sm:inline">Return to Website</span>
              <span className="sm:hidden">Site</span>
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#141414] px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:text-white hover:border-white/40 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Admin footer */}
      <footer className="border-t border-[#D4AF37]/20 bg-[#060606] py-4 px-6 text-center text-[10px] text-[#FAF8F3]/40">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="size-3 text-[#D4AF37]" />
          <span>LVN Administrative Console — All actions are audit-logged.</span>
        </div>
      </footer>
    </div>
  );
}
