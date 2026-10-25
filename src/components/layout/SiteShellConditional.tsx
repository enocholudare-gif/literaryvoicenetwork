"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SiteShell } from "./SiteShell";
import type { SiteSettingsMap } from "@/lib/db/types";

// Routes that manage their own layout (no site navbar/footer)
const STANDALONE_PREFIXES = ["/admin", "/auth"];

interface Props {
  children: React.ReactNode;
  settings?: SiteSettingsMap;
}

export function SiteShellConditional({ children, settings }: Props) {
  const pathname = usePathname() || "/";

  // If we are on a standalone route, render children directly
  const isStandalone = STANDALONE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isStandalone) {
    return <>{children}</>;
  }

  return <SiteShell settings={settings}>{children}</SiteShell>;
}
