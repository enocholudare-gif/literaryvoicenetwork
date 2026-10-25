import React from "react";

/**
 * Auth pages get a bare layout — no site navbar or footer.
 * The auth page itself renders its own full-screen carousel background.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

