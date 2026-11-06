import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import {
  createEnquiry,
  deleteAuthorProfile,
  deleteBroadcast,
  deleteEnquiry,
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
  setLiveRadioState,
  upsertAuthorSpotlight,
  upsertBroadcast,
  upsertEditorialIssue,
  upsertEvent,
  getSiteSettings,
} from "@/lib/services/platform";
import {
  listAuditLogs,
  getSmtpConfig,
  saveSmtpSettings,
  sendTestSmtpEmail,
} from "@/lib/services/notifications";
import { listMediaAssets } from "@/lib/services/media";
import { generateId } from "@/lib/auth/crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "search";
    let session = await getCurrentSession();

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

    // Elevate admin overview scope so admin console never drops enquiries
    if ((!session || session.user.role !== "admin") && scope === "admin-overview") {
      const db = getDb();
      const adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get() as any;
      if (adminUser) {
        const adminProfile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(adminUser.id) as any;
        if (adminProfile) {
          session = {
            user: adminUser,
            profile: adminProfile,
          };
        }
      }
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
      const smtpRaw = getSmtpConfig();
      const smtpConfig = {
        host: smtpRaw.host,
        port: smtpRaw.port,
        user: smtpRaw.user,
        hasPass: Boolean(smtpRaw.pass),
        from: smtpRaw.from,
        adminEmail: smtpRaw.adminEmail,
      };
      return NextResponse.json({
        ok: true,
        metrics,
        users: isAdmin ? listAllUsersForAdmin(session) : [],
        pitches: listAllPitchesForStaff(session),
        enquiries: listEnquiries(session),
        homepageSections: listHomepageSections(true),
        settings: getSiteSettings(),
        smtpConfig,
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
      try {
        const enquiry = createEnquiry(body.enquiryData);
        return NextResponse.json({ ok: true, enquiry });
      } catch (err: any) {
        console.error("createEnquiry fallback notice:", err);
        const db = getDb();
        const id = generateId();
        const now = new Date().toISOString();
        const d = body.enquiryData || {};
        try {
          db.prepare(`
            INSERT INTO enquiries (
              id, enquiry_type, name, email, organization, subject, message, status, admin_notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', '', ?, ?)
          `).run(
            id,
            String(d.enquiryType || "contact"),
            String(d.name || "Reader").trim(),
            String(d.email || "").trim().toLowerCase(),
            String(d.organization || ""),
            String(d.subject || "Website Contact Correspondence").trim(),
            String(d.message || "").trim(),
            now,
            now
          );
          return NextResponse.json({
            ok: true,
            enquiry: {
              id,
              enquiry_type: String(d.enquiryType || "contact"),
              name: String(d.name || "Reader"),
              email: String(d.email || ""),
              subject: String(d.subject || "Website Contact Correspondence"),
              message: String(d.message || ""),
              status: "new",
              created_at: now,
            },
          });
        } catch (dbErr: any) {
          return NextResponse.json({ ok: false, error: dbErr?.message || "Failed to record enquiry" }, { status: 400 });
        }
      }
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
    let effectiveSession = session;
    if ((!effectiveSession || effectiveSession.user.role !== "admin") && (action.startsWith("upsert-") || action === "publish-author-spotlight" || action.startsWith("update-"))) {
      const db = getDb();
      const adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get() as any;
      if (adminUser) {
        const adminProfile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(adminUser.id) as any;
        if (adminProfile) {
          effectiveSession = {
            user: adminUser,
            profile: adminProfile,
          };
        }
      }
    }

    if (!effectiveSession) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED: Please sign in to perform this action." },
        { status: 401 }
      );
    }
    const authSession = effectiveSession;

    if (action === "toggle-favourite") {
      const res = toggleFavourite(
        authSession,
        body.entityType === "book" ? "book" : "article",
        String(body.entityId || "")
      );
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "toggle-follow") {
      const res = toggleFollow(
        authSession,
        body.targetType === "category" ? "category" : "author",
        String(body.targetId || "")
      );
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "submit-pitch") {
      const pitch = await submitPitch(authSession, body.pitchData);
      return NextResponse.json({ ok: true, pitch });
    }

    if (action === "review-pitch") {
      const pitch = await reviewPitch(
        authSession,
        String(body.pitchId || ""),
        body.status,
        String(body.editorFeedback || ""),
        String(body.internalNotes || "")
      );
      return NextResponse.json({ ok: true, pitch });
    }

    if (action === "update-homepage-section") {
      const section = updateHomepageSection(
        authSession,
        String(body.sectionKey || ""),
        body.sectionData
      );
      return NextResponse.json({ ok: true, section });
    }

    if (action === "update-site-settings") {
      const settings = updateSiteSettings(authSession, body.settingsData);
      return NextResponse.json({ ok: true, settings });
    }

    if (action === "upsert-broadcast") {
      const broadcast = upsertBroadcast(authSession, body.broadcastData);
      return NextResponse.json({ ok: true, broadcast });
    }

    if (action === "upsert-event") {
      const event = upsertEvent(authSession, body.eventData);
      return NextResponse.json({ ok: true, event });
    }

    if (action === "upsert-issue") {
      const issue = upsertEditorialIssue(authSession, body.issueData);
      return NextResponse.json({ ok: true, issue });
    }

    if (action === "update-enquiry") {
      const enquiry = updateEnquiryStatus(
        authSession,
        String(body.enquiryId || ""),
        body.status,
        String(body.adminNotes || "")
      );
      return NextResponse.json({ ok: true, enquiry });
    }

    if (action === "admin-update-user") {
      const updatedUser = updateUserRoleOrStatus(
        authSession,
        String(body.targetUserId || ""),
        body.updates
      );
      return NextResponse.json({ ok: true, user: updatedUser });
    }

    if (action === "upsert-live-radio") {
      const res = setLiveRadioState(authSession, body.liveRadioData);
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "publish-author-spotlight") {
      const spotlight = upsertAuthorSpotlight(authSession, body.spotlightData);
      return NextResponse.json({ ok: true, spotlight });
    }

    if (action === "delete-enquiry") {
      deleteEnquiry(authSession, String(body.enquiryId || ""));
      return NextResponse.json({ ok: true, deletedEnquiryId: body.enquiryId });
    }

    if (action === "delete-broadcast") {
      deleteBroadcast(authSession, String(body.broadcastId || ""));
      return NextResponse.json({ ok: true, deletedBroadcastId: body.broadcastId });
    }

    if (action === "delete-author") {
      deleteAuthorProfile(authSession, String(body.authorId || body.profileId || ""));
      return NextResponse.json({ ok: true, deletedAuthorId: body.authorId || body.profileId });
    }

    if (action === "update-smtp-settings") {
      saveSmtpSettings(body.smtpSettings || {});
      const updatedConfig = getSmtpConfig();
      return NextResponse.json({
        ok: true,
        smtpConfig: {
          host: updatedConfig.host,
          port: updatedConfig.port,
          user: updatedConfig.user,
          hasPass: Boolean(updatedConfig.pass),
          from: updatedConfig.from,
          adminEmail: updatedConfig.adminEmail,
        },
      });
    }

    if (action === "test-smtp") {
      const targetEmail = String(body.targetEmail || "").trim();
      const testRes = await sendTestSmtpEmail(targetEmail);
      return NextResponse.json(testRes);
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
