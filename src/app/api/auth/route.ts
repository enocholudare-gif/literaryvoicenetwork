import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  getCurrentSession,
  setSessionCookie,
} from "@/lib/auth/session";
import {
  authenticateUser,
  deleteUserAccount,
  registerUser,
  requestPasswordReset,
  resetPasswordWithToken,
  updateUserProfile,
  verifyEmailWithToken,
} from "@/lib/services/auth";
import {
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null, profile: null });
  }
  const notifications = listUserNotifications(session.user.id, 25);
  return NextResponse.json({
    authenticated: true,
    user: session.user,
    profile: session.profile,
    notifications,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "");
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    if (action === "login") {
      const { context, sessionToken } = authenticateUser(
        { email: body.email, password: body.password },
        ip
      );
      await setSessionCookie(sessionToken);
      return NextResponse.json({
        ok: true,
        user: context.user,
        profile: context.profile,
      });
    }

    if (action === "register") {
      const { context, sessionToken, verificationToken } = await registerUser(
        {
          email: body.email,
          password: body.password,
          displayName: body.displayName,
          accountType: body.accountType || "member",
          headline: body.headline,
          bio: body.bio,
        },
        ip
      );
      await setSessionCookie(sessionToken);
      return NextResponse.json({
        ok: true,
        user: context.user,
        profile: context.profile,
        verificationToken,
      });
    }

    if (action === "logout") {
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }

    if (action === "verify-email") {
      const ctx = verifyEmailWithToken(String(body.token || ""));
      return NextResponse.json({
        ok: true,
        user: ctx.user,
        profile: ctx.profile,
      });
    }

    if (action === "request-reset") {
      const res = await requestPasswordReset(String(body.email || ""), ip);
      return NextResponse.json({
        ok: true,
        message:
          "If an active account matches that email, password recovery instructions have been recorded.",
        devResetToken:
          process.env.NODE_ENV !== "production" ? res.resetToken : undefined,
      });
    }

    if (action === "reset-password") {
      const ctx = resetPasswordWithToken(
        String(body.token || ""),
        String(body.newPassword || "")
      );
      return NextResponse.json({
        ok: true,
        user: ctx.user,
        profile: ctx.profile,
      });
    }

    // Authenticated actions below
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (action === "update-profile") {
      const updated = updateUserProfile(session, body.profileData);
      return NextResponse.json({
        ok: true,
        user: updated.user,
        profile: updated.profile,
      });
    }

    if (action === "mark-notification-read") {
      markNotificationRead(session.user.id, String(body.notificationId || ""));
      return NextResponse.json({ ok: true });
    }

    if (action === "mark-all-notifications-read") {
      markAllNotificationsRead(session.user.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-account") {
      deleteUserAccount(session, String(body.confirmationText || ""));
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown auth action: ${action}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
        ? 403
        : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

