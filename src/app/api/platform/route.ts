import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  createEnquiry,
  getAdminDashboardMetrics,
  globalSearch,
  listAllPitchesForStaff,
  listAllUsersForAdmin,
  listBroadcasts,
  listCategories,
  listEditorialIssues,
  listEnquiries,
  listEvents,
  listHomepageSections,
  listPartners,
  listUserEventRegistrations,
  listUserFavourites,
  listUserFollows,
  listUserPitches,
  registerForEvent,
  reviewPitch,
  submitPitch,
  toggleFavourite,
  toggleFollow,
  updateEnquiryStatus,
  updateHomepageSection,
  updateSiteSettings,
  updateUserRoleOrStatus,
  upsertBroadcast,
  upsertEditorialIssue,
  upsertEvent,
  getSiteSettings,
} from "@/lib/services/platform";
import { listAuditLogs } from "@/lib/services/notifications";
import { listMediaAssets } from "@/lib/services/media";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "search";
    const session = await getCurrentSession();

    if (scope === "search") {
      const q = searchParams.get("q") || "";
      return NextResponse.json({ ok: true, ...globalSearch(q) });
    }

    if (scope === "public-config") {
      return NextResponse.json({
        ok: true,
        settings: getSiteSettings(),
        homepageSections: listHomepageSections(false),
        categories: listCategories(),
        issues: listEditorialIssues(),
        partners: listPartners(true),
      });
    }

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (scope === "member-library") {
      return NextResponse.json({
        ok: true,
        favourites: listUserFavourites(session),
        follows: listUserFollows(session),
        pitches: listUserPitches(session),
        eventRegistrations: listUserEventRegistrations(session.user.id),
      });
    }

    if (scope === "admin-overview") {
      const metrics = getAdminDashboardMetrics(session);
      const isAdmin = session.user.role === "admin";
      return NextResponse.json({
        ok: true,
        metrics,
        users: isAdmin ? listAllUsersForAdmin(session) : [],
        pitches: listAllPitchesForStaff(session),
        enquiries: listEnquiries(session),
        homepageSections: listHomepageSections(true),
        settings: getSiteSettings(),
        auditLogs: isAdmin ? listAuditLogs(100) : [],
        mediaAssets: listMediaAssets(session),
        broadcasts: listBroadcasts({ status: "all" }),
        events: listEvents({ timeframe: "all" }),
        issues: listEditorialIssues(),
        categories: listCategories(),
        partners: listPartners(false),
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown platform scope: ${scope}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error loading platform data";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
        ? 403
        : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "");
    const session = await getCurrentSession();

    // Publicly accessible actions (Event Registration, Enquiries, Newsletter Signup)
    if (action === "create-enquiry") {
      const enquiry = createEnquiry(body.enquiryData);
      return NextResponse.json({ ok: true, enquiry });
    }

    if (action === "register-event") {
      const registration = await registerForEvent({
        eventId: String(body.eventId || ""),
        userId: session?.user.id || null,
        attendeeName: String(body.attendeeName || session?.profile.display_name || ""),
        attendeeEmail: String(body.attendeeEmail || session?.user.email || ""),
        reminderEnabled: body.reminderEnabled !== false,
      });
      return NextResponse.json({ ok: true, registration });
    }

    // Authenticated actions below
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED: Please sign in to perform this action." },
        { status: 401 }
      );
    }

    if (action === "toggle-favourite") {
      const res = toggleFavourite(
        session,
        body.entityType === "book" ? "book" : "article",
        String(body.entityId || "")
      );
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "toggle-follow") {
      const res = toggleFollow(
        session,
        body.targetType === "category" ? "category" : "author",
        String(body.targetId || "")
      );
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "submit-pitch") {
      const pitch = await submitPitch(session, body.pitchData);
      return NextResponse.json({ ok: true, pitch });
    }

    if (action === "review-pitch") {
      const pitch = await reviewPitch(
        session,
        String(body.pitchId || ""),
        body.status,
        String(body.editorFeedback || ""),
        String(body.internalNotes || "")
      );
      return NextResponse.json({ ok: true, pitch });
    }

    if (action === "update-homepage-section") {
      const section = updateHomepageSection(
        session,
        String(body.sectionKey || ""),
        body.sectionData
      );
      return NextResponse.json({ ok: true, section });
    }

    if (action === "update-site-settings") {
      const settings = updateSiteSettings(session, body.settingsData);
      return NextResponse.json({ ok: true, settings });
    }

    if (action === "upsert-broadcast") {
      const broadcast = upsertBroadcast(session, body.broadcastData);
      return NextResponse.json({ ok: true, broadcast });
    }

    if (action === "upsert-event") {
      const event = upsertEvent(session, body.eventData);
      return NextResponse.json({ ok: true, event });
    }

    if (action === "upsert-issue") {
      const issue = upsertEditorialIssue(session, body.issueData);
      return NextResponse.json({ ok: true, issue });
    }

    if (action === "update-enquiry") {
      const enquiry = updateEnquiryStatus(
        session,
        String(body.enquiryId || ""),
        body.status,
        String(body.adminNotes || "")
      );
      return NextResponse.json({ ok: true, enquiry });
    }

    if (action === "admin-update-user") {
      const updatedUser = updateUserRoleOrStatus(
        session,
        String(body.targetUserId || ""),
        body.updates
      );
      return NextResponse.json({ ok: true, user: updatedUser });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown platform action: ${action}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Platform action failed";
    const status = message.startsWith("UNAUTHORIZED")
      ? 401
      : message.startsWith("FORBIDDEN")
        ? 403
        : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
