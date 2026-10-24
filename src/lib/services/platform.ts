import { z } from "zod";
import { getDb } from "../db";
import { generateId, slugify } from "../auth/crypto";
import { DEFAULT_SITE_SETTINGS } from "../db/seed";
import type {
  Article,
  Book,
  Broadcast,
  Category,
  EditorialIssue,
  Enquiry,
  EventRegistration,
  HomepageSection,
  LiteraryEvent,
  Partner,
  Pitch,
  Profile,
  SiteSettingsMap,
  UserRole,
} from "../db/types";
import type { AuthenticatedContext } from "./auth";
import { mapProfileRow, requireRole } from "./auth";
import { listPublicArticles, listPublicBooks } from "./publishing";
import { createNotification, recordAuditLog } from "./notifications";

// =============================================================================
// 1. PUBLIC AUTHORS DIRECTORY & AUTHOR PROFILES
// =============================================================================

export function listPublicAuthors(filter?: {
  search?: string;
  genre?: string;
  featuredOnly?: boolean;
}): Array<Profile & { book_count: number; article_count: number; follower_count: number }> {
  const db = getDb();
  const conditions: string[] = [
    "p.is_public = 1",
    "u.account_status = 'active'",
    "(p.is_author_profile = 1 OR EXISTS (SELECT 1 FROM books b WHERE b.author_profile_id = p.id AND b.status = 'published') OR EXISTS (SELECT 1 FROM articles a WHERE a.author_profile_id = p.id AND a.status = 'published'))",
  ];
  const params: Array<string | number> = [];

  if (filter?.search && filter.search.trim()) {
    const q = `%${filter.search.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(p.display_name) LIKE ? OR LOWER(p.headline) LIKE ? OR LOWER(p.bio) LIKE ? OR LOWER(p.location) LIKE ?)"
    );
    params.push(q, q, q, q);
  }

  if (filter?.genre && filter.genre !== "All") {
    conditions.push("LOWER(p.genres_json) LIKE LOWER(?)");
    params.push(`%${filter.genre.trim()}%`);
  }

  if (filter?.featuredOnly) {
    conditions.push("p.is_featured = 1");
  }

  const rows = db
    .prepare(`
      SELECT p.*, u.role as role,
        (SELECT COUNT(*) FROM books b WHERE b.author_profile_id = p.id AND b.status = 'published') as book_count,
        (SELECT COUNT(*) FROM articles a WHERE a.author_profile_id = p.id AND a.status = 'published') as article_count,
        (SELECT COUNT(*) FROM follows f WHERE f.target_type = 'author' AND f.target_id = p.id) as follower_count
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.is_featured DESC, book_count DESC, article_count DESC, p.display_name ASC
    `)
    .all(...params) as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    ...mapProfileRow(r),
    book_count: Number(r.book_count || 0),
    article_count: Number(r.article_count || 0),
    follower_count: Number(r.follower_count || 0),
  }));
}

export function getAuthorProfileBySlug(slug: string): {
  profile: Profile & { follower_count: number };
  books: Book[];
  articles: Article[];
  broadcasts: Broadcast[];
  events: LiteraryEvent[];
} | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT p.*, u.role as role,
        (SELECT COUNT(*) FROM follows f WHERE f.target_type = 'author' AND f.target_id = p.id) as follower_count
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.slug = ? AND p.is_public = 1 AND u.account_status = 'active'
    `)
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) return null;
  const profile = {
    ...mapProfileRow(row),
    follower_count: Number(row.follower_count || 0),
  };

  const books = listPublicBooks({ authorProfileId: profile.id, pageSize: 50 }).items;
  const articles = listPublicArticles({
    authorProfileId: profile.id,
    pageSize: 50,
  }).items;
  const broadcasts = listBroadcasts({ profileId: profile.id });
  const events = listEvents({ profileId: profile.id });

  return { profile, books, articles, broadcasts, events };
}

// =============================================================================
// 2. BROADCASTS & LIVE / ARCHIVE AUDIO & VIDEO
// =============================================================================

export function mapBroadcastRow(row: Record<string, unknown>): Broadcast {
  return {
    id: String(row.id),
    slug: String(row.slug),
    programme_name: String(row.programme_name),
    episode_number:
      row.episode_number !== null && row.episode_number !== undefined
        ? Number(row.episode_number)
        : null,
    title: String(row.title),
    subtitle: String(row.subtitle || ""),
    description: String(row.description || ""),
    host_profile_id: row.host_profile_id ? String(row.host_profile_id) : null,
    host_name: String(row.host_name),
    guest_profile_id: row.guest_profile_id ? String(row.guest_profile_id) : null,
    guest_name: String(row.guest_name || ""),
    featured_book_id: row.featured_book_id ? String(row.featured_book_id) : null,
    broadcast_type: (row.broadcast_type as Broadcast["broadcast_type"]) || "audio",
    is_live: Boolean(row.is_live) && Boolean(row.live_stream_url), // Never fake live stream if no stream URL is connected
    live_stream_url: String(row.live_stream_url || ""),
    replay_url: String(row.replay_url || ""),
    external_embed_url: String(row.external_embed_url || ""),
    audio_file_url: String(row.audio_file_url || "/media/audio/lvn-studio-preview.wav"),
    provider: (row.provider as Broadcast["provider"]) || "LVN Studio",
    banner_url: String(row.banner_url || "/media/banners/editorial-desk.svg"),
    duration_minutes: Number(row.duration_minutes || 45),
    scheduled_start: String(row.scheduled_start),
    scheduled_end: row.scheduled_end ? String(row.scheduled_end) : null,
    timezone: String(row.timezone || "America/New_York"),
    is_featured: Boolean(row.is_featured),
    status: row.status as Broadcast["status"],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    host_slug: row.host_slug ? String(row.host_slug) : undefined,
    host_avatar: row.host_avatar ? String(row.host_avatar) : undefined,
    guest_slug: row.guest_slug ? String(row.guest_slug) : undefined,
    featured_book_title: row.featured_book_title ? String(row.featured_book_title) : undefined,
    featured_book_slug: row.featured_book_slug ? String(row.featured_book_slug) : undefined,
  };
}

export function listBroadcasts(filter?: {
  status?: string;
  broadcastType?: string;
  profileId?: string;
  search?: string;
}): Broadcast[] {
  const db = getDb();
  const conditions: string[] = ["bc.status != 'draft'"];
  const params: Array<string | number> = [];

  if (filter?.status && filter.status !== "all") {
    conditions.push("bc.status = ?");
    params.push(filter.status);
  }

  if (filter?.broadcastType && filter.broadcastType !== "all") {
    conditions.push("bc.broadcast_type = ?");
    params.push(filter.broadcastType);
  }

  if (filter?.profileId) {
    conditions.push("(bc.host_profile_id = ? OR bc.guest_profile_id = ?)");
    params.push(filter.profileId, filter.profileId);
  }

  if (filter?.search && filter.search.trim()) {
    const q = `%${filter.search.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(bc.title) LIKE ? OR LOWER(bc.programme_name) LIKE ? OR LOWER(bc.host_name) LIKE ? OR LOWER(bc.guest_name) LIKE ?)"
    );
    params.push(q, q, q, q);
  }

  const rows = db
    .prepare(`
      SELECT bc.*,
        hp.slug as host_slug,
        hp.avatar_url as host_avatar,
        gp.slug as guest_slug,
        b.title as featured_book_title,
        b.slug as featured_book_slug
      FROM broadcasts bc
      LEFT JOIN profiles hp ON bc.host_profile_id = hp.id
      LEFT JOIN profiles gp ON bc.guest_profile_id = gp.id
      LEFT JOIN books b ON bc.featured_book_id = b.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY bc.is_live DESC, bc.is_featured DESC, bc.scheduled_start DESC
    `)
    .all(...params) as Array<Record<string, unknown>>;

  return rows.map(mapBroadcastRow);
}

export function getBroadcastBySlug(slug: string): Broadcast | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT bc.*,
        hp.slug as host_slug,
        hp.avatar_url as host_avatar,
        gp.slug as guest_slug,
        b.title as featured_book_title,
        b.slug as featured_book_slug
      FROM broadcasts bc
      LEFT JOIN profiles hp ON bc.host_profile_id = hp.id
      LEFT JOIN profiles gp ON bc.guest_profile_id = gp.id
      LEFT JOIN books b ON bc.featured_book_id = b.id
      WHERE bc.slug = ?
    `)
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) return null;
  return mapBroadcastRow(row);
}

export const BroadcastInputSchema = z.object({
  id: z.string().optional(),
  programmeName: z.string().min(2).max(120),
  episodeNumber: z.number().int().positive().nullable().optional().default(null),
  title: z.string().min(3).max(200),
  subtitle: z.string().max(200).optional().default(""),
  description: z.string().min(10).max(4000),
  hostName: z.string().min(2).max(120),
  guestName: z.string().max(120).optional().default(""),
  broadcastType: z.enum(["audio", "video", "podcast"]).default("audio"),
  isLive: z.boolean().default(false),
  liveStreamUrl: z.string().max(500).optional().default(""),
  replayUrl: z.string().max(500).optional().default(""),
  externalEmbedUrl: z.string().max(500).optional().default(""),
  audioFileUrl: z
    .string()
    .max(500)
    .optional()
    .default("/media/audio/lvn-studio-preview.wav"),
  provider: z
    .enum(["LVN Studio", "Spotify", "YouTube", "Apple Podcasts", "SoundCloud", "HLS Stream"])
    .default("LVN Studio"),
  bannerUrl: z.string().max(500).optional().default("/media/banners/editorial-desk.svg"),
  durationMinutes: z.number().int().positive().max(600).default(45),
  scheduledStart: z.string().min(10),
  timezone: z.string().default("America/New_York"),
  isFeatured: z.boolean().default(false),
  status: z.enum(["draft", "scheduled", "live", "published", "archived"]).default("published"),
});

export function upsertBroadcast(
  ctx: AuthenticatedContext,
  rawInput: z.infer<typeof BroadcastInputSchema>
): Broadcast {
  requireRole(ctx, ["editor", "admin"]);
  const parsed = BroadcastInputSchema.parse(rawInput);
  const db = getDb();
  const now = new Date().toISOString();

  // Never allow is_live = true if liveStreamUrl is blank
  const verifiedLive = parsed.isLive && Boolean(parsed.liveStreamUrl.trim());

  if (parsed.id) {
    db.prepare(`
      UPDATE broadcasts SET
        programme_name = ?,
        episode_number = ?,
        title = ?,
        subtitle = ?,
        description = ?,
        host_name = ?,
        guest_name = ?,
        broadcast_type = ?,
        is_live = ?,
        live_stream_url = ?,
        replay_url = ?,
        external_embed_url = ?,
        audio_file_url = ?,
        provider = ?,
        banner_url = ?,
        duration_minutes = ?,
        scheduled_start = ?,
        timezone = ?,
        is_featured = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      parsed.programmeName.trim(),
      parsed.episodeNumber,
      parsed.title.trim(),
      parsed.subtitle.trim(),
      parsed.description.trim(),
      parsed.hostName.trim(),
      parsed.guestName.trim(),
      parsed.broadcastType,
      verifiedLive ? 1 : 0,
      parsed.liveStreamUrl.trim(),
      parsed.replayUrl.trim(),
      parsed.externalEmbedUrl.trim(),
      parsed.audioFileUrl.trim(),
      parsed.provider,
      parsed.bannerUrl.trim(),
      parsed.durationMinutes,
      parsed.scheduledStart,
      parsed.timezone,
      parsed.isFeatured ? 1 : 0,
      parsed.status,
      now,
      parsed.id
    );

    const row = db
      .prepare("SELECT * FROM broadcasts WHERE id = ?")
      .get(parsed.id) as Record<string, unknown>;
    return mapBroadcastRow(row);
  }

  const id = generateId();
  const slug = `${slugify(parsed.programmeName)}-${slugify(parsed.title)}-${id.slice(0, 6)}`;

  db.prepare(`
    INSERT INTO broadcasts (
      id, slug, programme_name, episode_number, title, subtitle, description,
      host_profile_id, host_name, guest_name, broadcast_type, is_live,
      live_stream_url, replay_url, external_embed_url, audio_file_url, provider,
      banner_url, duration_minutes, scheduled_start, timezone, is_featured,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    parsed.programmeName.trim(),
    parsed.episodeNumber,
    parsed.title.trim(),
    parsed.subtitle.trim(),
    parsed.description.trim(),
    ctx.profile.id,
    parsed.hostName.trim(),
    parsed.guestName.trim(),
    parsed.broadcastType,
    verifiedLive ? 1 : 0,
    parsed.liveStreamUrl.trim(),
    parsed.replayUrl.trim(),
    parsed.externalEmbedUrl.trim(),
    parsed.audioFileUrl.trim(),
    parsed.provider,
    parsed.bannerUrl.trim(),
    parsed.durationMinutes,
    parsed.scheduledStart,
    parsed.timezone,
    parsed.isFeatured ? 1 : 0,
    parsed.status,
    now,
    now
  );

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "BROADCAST_CREATED",
    entityType: "broadcast",
    entityId: id,
    summary: `Created broadcast episode '${parsed.title.trim()}'`,
  });

  return getBroadcastBySlug(slug)!;
}

// =============================================================================
// 3. LITERARY EVENTS & REGISTRATIONS
// =============================================================================

export function mapEventRow(row: Record<string, unknown>): LiteraryEvent {
  let guests: string[] = [];
  try {
    if (typeof row.guest_names_json === "string") {
      guests = JSON.parse(row.guest_names_json);
    }
  } catch {
    guests = [];
  }

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle || ""),
    description: String(row.description || ""),
    event_type: (row.event_type as LiteraryEvent["event_type"]) || "interview",
    start_at: String(row.start_at),
    end_at: String(row.end_at),
    timezone: String(row.timezone || "America/New_York"),
    host_name: String(row.host_name),
    host_profile_id: row.host_profile_id ? String(row.host_profile_id) : null,
    guest_names: guests,
    featured_book_id: row.featured_book_id ? String(row.featured_book_id) : null,
    banner_url: String(row.banner_url || "/media/banners/editorial-desk.svg"),
    venue_or_link: String(row.venue_or_link || ""),
    is_virtual: Boolean(row.is_virtual),
    registration_open: Boolean(row.registration_open),
    max_attendees:
      row.max_attendees !== null && row.max_attendees !== undefined
        ? Number(row.max_attendees)
        : null,
    archive_url: String(row.archive_url || ""),
    is_featured: Boolean(row.is_featured),
    status: row.status as LiteraryEvent["status"],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    registration_count:
      row.registration_count !== undefined ? Number(row.registration_count) : undefined,
    host_slug: row.host_slug ? String(row.host_slug) : undefined,
  };
}

export function listEvents(filter?: {
  timeframe?: "upcoming" | "past" | "all";
  eventType?: string;
  profileId?: string;
  search?: string;
}): LiteraryEvent[] {
  const db = getDb();
  const conditions: string[] = ["e.status != 'draft'"];
  const params: Array<string | number> = [];

  if (filter?.timeframe === "upcoming") {
    conditions.push("e.status IN ('published', 'scheduled')");
  } else if (filter?.timeframe === "past") {
    conditions.push("e.status = 'completed'");
  }

  if (filter?.eventType && filter.eventType !== "all") {
    conditions.push("e.event_type = ?");
    params.push(filter.eventType);
  }

  if (filter?.profileId) {
    conditions.push("e.host_profile_id = ?");
    params.push(filter.profileId);
  }

  if (filter?.search && filter.search.trim()) {
    const q = `%${filter.search.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(e.title) LIKE ? OR LOWER(e.description) LIKE ? OR LOWER(e.host_name) LIKE ?)"
    );
    params.push(q, q, q);
  }

  const rows = db
    .prepare(`
      SELECT e.*,
        hp.slug as host_slug,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.status = 'registered') as registration_count
      FROM events e
      LEFT JOIN profiles hp ON e.host_profile_id = hp.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY e.start_at ASC
    `)
    .all(...params) as Array<Record<string, unknown>>;

  return rows.map(mapEventRow);
}

export function getEventBySlug(slug: string): LiteraryEvent | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT e.*,
        hp.slug as host_slug,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.status = 'registered') as registration_count
      FROM events e
      LEFT JOIN profiles hp ON e.host_profile_id = hp.id
      WHERE e.slug = ?
    `)
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) return null;
  return mapEventRow(row);
}

export async function registerForEvent(input: {
  eventId: string;
  userId?: string | null;
  attendeeName: string;
  attendeeEmail: string;
  reminderEnabled?: boolean;
}): Promise<EventRegistration> {
  const db = getDb();
  const eventRow = db
    .prepare("SELECT * FROM events WHERE id = ?")
    .get(input.eventId) as Record<string, unknown> | undefined;

  if (!eventRow) {
    throw new Error("NOT_FOUND: Event not found.");
  }

  const event = mapEventRow(eventRow);
  if (!event.registration_open) {
    throw new Error("REGISTRATION_CLOSED: Registration is closed for this event.");
  }

  const emailNormalized = input.attendeeEmail.trim().toLowerCase();
  const existing = db
    .prepare(
      "SELECT * FROM event_registrations WHERE event_id = ? AND attendee_email = ?"
    )
    .get(input.eventId, emailNormalized) as Record<string, unknown> | undefined;

  if (existing) {
    return {
      id: String(existing.id),
      event_id: String(existing.event_id),
      user_id: existing.user_id ? String(existing.user_id) : null,
      attendee_name: String(existing.attendee_name),
      attendee_email: String(existing.attendee_email),
      reminder_enabled: Boolean(existing.reminder_enabled),
      status: existing.status as EventRegistration["status"],
      created_at: String(existing.created_at),
    };
  }

  const id = generateId();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO event_registrations (
      id, event_id, user_id, attendee_name, attendee_email, reminder_enabled, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'registered', ?)
  `).run(
    id,
    input.eventId,
    input.userId || null,
    input.attendeeName.trim(),
    emailNormalized,
    input.reminderEnabled !== false ? 1 : 0,
    now
  );

  if (input.userId) {
    await createNotification({
      userId: input.userId,
      type: "event_registration",
      title: `Event Registration Confirmed: ${event.title}`,
      message: `You are registered for "${event.title}" (${event.timezone}). We will send a reminder prior to the session.`,
      linkUrl: `/events/${event.slug}`,
      recipientEmail: emailNormalized,
    });
  }

  return {
    id,
    event_id: input.eventId,
    user_id: input.userId || null,
    attendee_name: input.attendeeName.trim(),
    attendee_email: emailNormalized,
    reminder_enabled: input.reminderEnabled !== false,
    status: "registered",
    created_at: now,
  };
}

export function listUserEventRegistrations(userId: string): EventRegistration[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT er.*, e.title as event_title, e.slug as event_slug, e.start_at as event_start_at, e.timezone as event_timezone
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = ?
      ORDER BY e.start_at ASC
    `)
    .all(userId) as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    event_id: String(r.event_id),
    user_id: r.user_id ? String(r.user_id) : null,
    attendee_name: String(r.attendee_name),
    attendee_email: String(r.attendee_email),
    reminder_enabled: Boolean(r.reminder_enabled),
    status: r.status as EventRegistration["status"],
    created_at: String(r.created_at),
    event_title: String(r.event_title || ""),
    event_slug: String(r.event_slug || ""),
    event_start_at: String(r.event_start_at || ""),
    event_timezone: String(r.event_timezone || ""),
  }));
}

export const EventInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(200),
  subtitle: z.string().max(220).optional().default(""),
  description: z.string().min(10).max(4000),
  eventType: z
    .enum(["interview", "book_launch", "reading", "workshop", "panel", "book_club"])
    .default("interview"),
  startAt: z.string().min(10),
  endAt: z.string().min(10),
  timezone: z.string().default("America/New_York (EST)"),
  hostName: z.string().min(2).max(120),
  guestNames: z.array(z.string()).optional().default([]),
  bannerUrl: z.string().max(500).optional().default("/media/banners/editorial-desk.svg"),
  venueOrLink: z.string().max(300).optional().default("LVN Virtual Salon"),
  isVirtual: z.boolean().default(true),
  registrationOpen: z.boolean().default(true),
  maxAttendees: z.number().int().positive().nullable().optional().default(200),
  archiveUrl: z.string().max(400).optional().default(""),
  isFeatured: z.boolean().default(false),
  status: z
    .enum(["draft", "scheduled", "published", "completed", "cancelled", "archived"])
    .default("published"),
});

export function upsertEvent(
  ctx: AuthenticatedContext,
  rawInput: z.infer<typeof EventInputSchema>
): LiteraryEvent {
  requireRole(ctx, ["editor", "admin"]);
  const parsed = EventInputSchema.parse(rawInput);
  const db = getDb();
  const now = new Date().toISOString();

  if (parsed.id) {
    db.prepare(`
      UPDATE events SET
        title = ?,
        subtitle = ?,
        description = ?,
        event_type = ?,
        start_at = ?,
        end_at = ?,
        timezone = ?,
        host_name = ?,
        guest_names_json = ?,
        banner_url = ?,
        venue_or_link = ?,
        is_virtual = ?,
        registration_open = ?,
        max_attendees = ?,
        archive_url = ?,
        is_featured = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      parsed.title.trim(),
      parsed.subtitle.trim(),
      parsed.description.trim(),
      parsed.eventType,
      parsed.startAt,
      parsed.endAt,
      parsed.timezone,
      parsed.hostName.trim(),
      JSON.stringify(parsed.guestNames),
      parsed.bannerUrl.trim(),
      parsed.venueOrLink.trim(),
      parsed.isVirtual ? 1 : 0,
      parsed.registrationOpen ? 1 : 0,
      parsed.maxAttendees,
      parsed.archiveUrl.trim(),
      parsed.isFeatured ? 1 : 0,
      parsed.status,
      now,
      parsed.id
    );
    const row = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(parsed.id) as Record<string, unknown>;
    return mapEventRow(row);
  }

  const id = generateId();
  const slug = `${slugify(parsed.title)}-${id.slice(0, 6)}`;
  db.prepare(`
    INSERT INTO events (
      id, slug, title, subtitle, description, event_type, start_at, end_at,
      timezone, host_name, host_profile_id, guest_names_json, banner_url,
      venue_or_link, is_virtual, registration_open, max_attendees, archive_url,
      is_featured, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    parsed.title.trim(),
    parsed.subtitle.trim(),
    parsed.description.trim(),
    parsed.eventType,
    parsed.startAt,
    parsed.endAt,
    parsed.timezone,
    parsed.hostName.trim(),
    ctx.profile.id,
    JSON.stringify(parsed.guestNames),
    parsed.bannerUrl.trim(),
    parsed.venueOrLink.trim(),
    parsed.isVirtual ? 1 : 0,
    parsed.registrationOpen ? 1 : 0,
    parsed.maxAttendees,
    parsed.archiveUrl.trim(),
    parsed.isFeatured ? 1 : 0,
    parsed.status,
    now,
    now
  );

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "EVENT_CREATED",
    entityType: "event",
    entityId: id,
    summary: `Created literary event '${parsed.title.trim()}'`,
  });

  return getEventBySlug(slug)!;
}

// =============================================================================
// 4. EDITORIAL CALENDAR, ISSUES & MEMBER PITCHES
// =============================================================================

export function listEditorialIssues(): EditorialIssue[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM editorial_issues ORDER BY issue_number DESC")
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    issue_number: Number(r.issue_number),
    title: String(r.title),
    theme: String(r.theme),
    description: String(r.description || ""),
    cover_url: String(r.cover_url || "/media/covers/issue-14.svg"),
    submission_deadline: String(r.submission_deadline),
    publication_date: String(r.publication_date),
    submission_window_open: Boolean(r.submission_window_open),
    status: r.status as EditorialIssue["status"],
    created_by_user_id: r.created_by_user_id ? String(r.created_by_user_id) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  }));
}

export function upsertEditorialIssue(
  ctx: AuthenticatedContext,
  input: {
    id?: string;
    issueNumber: number;
    title: string;
    theme: string;
    description: string;
    submissionDeadline: string;
    publicationDate: string;
    submissionWindowOpen: boolean;
    status: EditorialIssue["status"];
  }
): EditorialIssue {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const now = new Date().toISOString();

  if (input.id) {
    db.prepare(`
      UPDATE editorial_issues SET
        issue_number = ?,
        title = ?,
        theme = ?,
        description = ?,
        submission_deadline = ?,
        publication_date = ?,
        submission_window_open = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      input.issueNumber,
      input.title.trim(),
      input.theme.trim(),
      input.description.trim(),
      input.submissionDeadline,
      input.publicationDate,
      input.submissionWindowOpen ? 1 : 0,
      input.status,
      now,
      input.id
    );
    return listEditorialIssues().find((i) => i.id === input.id)!;
  }

  const id = generateId();
  const slug = `issue-${input.issueNumber}-${slugify(input.theme)}`;
  db.prepare(`
    INSERT INTO editorial_issues (
      id, slug, issue_number, title, theme, description, cover_url,
      submission_deadline, publication_date, submission_window_open,
      status, created_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, '/media/covers/issue-14.svg', ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    input.issueNumber,
    input.title.trim(),
    input.theme.trim(),
    input.description.trim(),
    input.submissionDeadline,
    input.publicationDate,
    input.submissionWindowOpen ? 1 : 0,
    input.status,
    ctx.user.id,
    now,
    now
  );

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "EDITORIAL_ISSUE_CREATED",
    entityType: "editorial_issue",
    entityId: id,
    summary: `Created editorial issue #${input.issueNumber}: ${input.title}`,
  });

  return listEditorialIssues().find((i) => i.id === id)!;
}

export const PitchInputSchema = z.object({
  issueId: z.string().nullable().optional().default(null),
  relatedBookId: z.string().nullable().optional().default(null),
  pitchType: z.enum([
    "interview",
    "spotlight",
    "book_launch",
    "magazine_feature",
    "broadcast_guest",
  ]),
  title: z.string().min(4).max(200),
  summary: z.string().min(20).max(4000),
  supportingLinks: z.string().max(500).optional().default(""),
  proposedDate: z.string().max(60).optional().default(""),
});

export async function submitPitch(
  ctx: AuthenticatedContext,
  rawInput: z.infer<typeof PitchInputSchema>
): Promise<Pitch> {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const parsed = PitchInputSchema.parse(rawInput);
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO pitches (
      id, submitted_by_user_id, author_profile_id, issue_id, related_book_id,
      pitch_type, title, summary, supporting_links, proposed_date, status,
      editor_feedback, internal_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', '', '', ?, ?)
  `).run(
    id,
    ctx.user.id,
    ctx.profile.id,
    parsed.issueId || null,
    parsed.relatedBookId || null,
    parsed.pitchType,
    parsed.title.trim(),
    parsed.summary.trim(),
    parsed.supportingLinks.trim(),
    parsed.proposedDate.trim(),
    now,
    now
  );

  await createNotification({
    userId: ctx.user.id,
    type: "pitch_submitted",
    title: `Editorial Pitch Received: ${parsed.title.trim()}`,
    message: `Your ${parsed.pitchType.replace("_", " ")} pitch has been sent to the LVN commissioning desk.`,
    linkUrl: "/dashboard?tab=pitches",
    recipientEmail: ctx.user.email,
  });

  return listUserPitches(ctx).find((p) => p.id === id)!;
}

export function listUserPitches(ctx: AuthenticatedContext): Pitch[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT pt.*, p.display_name as author_name, p.slug as author_slug, i.title as issue_title
      FROM pitches pt
      JOIN profiles p ON pt.author_profile_id = p.id
      LEFT JOIN editorial_issues i ON pt.issue_id = i.id
      WHERE pt.submitted_by_user_id = ?
      ORDER BY pt.created_at DESC
    `)
    .all(ctx.user.id) as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    submitted_by_user_id: String(r.submitted_by_user_id),
    author_profile_id: String(r.author_profile_id),
    issue_id: r.issue_id ? String(r.issue_id) : null,
    related_book_id: r.related_book_id ? String(r.related_book_id) : null,
    pitch_type: r.pitch_type as Pitch["pitch_type"],
    title: String(r.title),
    summary: String(r.summary),
    supporting_links: String(r.supporting_links || ""),
    proposed_date: String(r.proposed_date || ""),
    status: r.status as Pitch["status"],
    editor_feedback: String(r.editor_feedback || ""),
    internal_notes: "",
    reviewed_by_user_id: r.reviewed_by_user_id ? String(r.reviewed_by_user_id) : null,
    reviewed_at: r.reviewed_at ? String(r.reviewed_at) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    author_name: String(r.author_name || ""),
    author_slug: String(r.author_slug || ""),
    issue_title: r.issue_title ? String(r.issue_title) : undefined,
  }));
}

export function listAllPitchesForStaff(ctx: AuthenticatedContext): Pitch[] {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT pt.*, p.display_name as author_name, p.slug as author_slug, i.title as issue_title
      FROM pitches pt
      JOIN profiles p ON pt.author_profile_id = p.id
      LEFT JOIN editorial_issues i ON pt.issue_id = i.id
      ORDER BY pt.created_at DESC
    `)
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    submitted_by_user_id: String(r.submitted_by_user_id),
    author_profile_id: String(r.author_profile_id),
    issue_id: r.issue_id ? String(r.issue_id) : null,
    related_book_id: r.related_book_id ? String(r.related_book_id) : null,
    pitch_type: r.pitch_type as Pitch["pitch_type"],
    title: String(r.title),
    summary: String(r.summary),
    supporting_links: String(r.supporting_links || ""),
    proposed_date: String(r.proposed_date || ""),
    status: r.status as Pitch["status"],
    editor_feedback: String(r.editor_feedback || ""),
    internal_notes: String(r.internal_notes || ""),
    reviewed_by_user_id: r.reviewed_by_user_id ? String(r.reviewed_by_user_id) : null,
    reviewed_at: r.reviewed_at ? String(r.reviewed_at) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    author_name: String(r.author_name || ""),
    author_slug: String(r.author_slug || ""),
    issue_title: r.issue_title ? String(r.issue_title) : undefined,
  }));
}

export async function reviewPitch(
  ctx: AuthenticatedContext,
  pitchId: string,
  decision: Pitch["status"],
  editorFeedback: string,
  internalNotes = ""
): Promise<Pitch> {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM pitches WHERE id = ?")
    .get(pitchId) as Record<string, unknown> | undefined;
  if (!existing) throw new Error("NOT_FOUND: Pitch not found.");

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE pitches SET
      status = ?,
      editor_feedback = ?,
      internal_notes = ?,
      reviewed_by_user_id = ?,
      reviewed_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    decision,
    editorFeedback.trim(),
    internalNotes.trim(),
    ctx.user.id,
    now,
    now,
    pitchId
  );

  await createNotification({
    userId: String(existing.submitted_by_user_id),
    type: `pitch_${decision}`,
    title: `Pitch Update: ${String(existing.title)} (${decision.toUpperCase()})`,
    message:
      editorFeedback.trim() ||
      `Your pitch "${String(existing.title)}" has been marked as ${decision}.`,
    linkUrl: "/dashboard?tab=pitches",
  });

  return listAllPitchesForStaff(ctx).find((p) => p.id === pitchId)!;
}

// =============================================================================
// 5. FAVOURITES & FOLLOWS
// =============================================================================

export function toggleFavourite(
  ctx: AuthenticatedContext,
  entityType: "book" | "article",
  entityId: string
): { favourited: boolean } {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const db = getDb();
  const existing = db
    .prepare(
      "SELECT id FROM favourites WHERE user_id = ? AND entity_type = ? AND entity_id = ?"
    )
    .get(ctx.user.id, entityType, entityId) as { id: string } | undefined;

  if (existing) {
    db.prepare("DELETE FROM favourites WHERE id = ?").run(existing.id);
    return { favourited: false };
  }

  db.prepare(
    "INSERT INTO favourites (id, user_id, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(generateId(), ctx.user.id, entityType, entityId, new Date().toISOString());
  return { favourited: true };
}

export function listUserFavourites(ctx: AuthenticatedContext): {
  books: Book[];
  articles: Article[];
  bookIds: string[];
  articleIds: string[];
} {
  const db = getDb();
  const favRows = db
    .prepare("SELECT entity_type, entity_id FROM favourites WHERE user_id = ?")
    .all(ctx.user.id) as Array<{ entity_type: "book" | "article"; entity_id: string }>;

  const bookIds = favRows.filter((f) => f.entity_type === "book").map((f) => f.entity_id);
  const articleIds = favRows
    .filter((f) => f.entity_type === "article")
    .map((f) => f.entity_id);

  const allBooks = listPublicBooks({ pageSize: 100 }).items.filter((b) =>
    bookIds.includes(b.id)
  );
  const allArticles = listPublicArticles({ pageSize: 100 }).items.filter((a) =>
    articleIds.includes(a.id)
  );

  return {
    books: allBooks,
    articles: allArticles,
    bookIds,
    articleIds,
  };
}

export function toggleFollow(
  ctx: AuthenticatedContext,
  targetType: "author" | "category",
  targetId: string
): { following: boolean } {
  requireRole(ctx, ["member", "author", "editor", "admin"]);
  const db = getDb();
  const existing = db
    .prepare(
      "SELECT id FROM follows WHERE follower_user_id = ? AND target_type = ? AND target_id = ?"
    )
    .get(ctx.user.id, targetType, targetId) as { id: string } | undefined;

  if (existing) {
    db.prepare("DELETE FROM follows WHERE id = ?").run(existing.id);
    return { following: false };
  }

  db.prepare(
    "INSERT INTO follows (id, follower_user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(generateId(), ctx.user.id, targetType, targetId, new Date().toISOString());
  return { following: true };
}

export function listUserFollows(ctx: AuthenticatedContext): {
  authors: Profile[];
  authorIds: string[];
} {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT target_id FROM follows WHERE follower_user_id = ? AND target_type = 'author'"
    )
    .all(ctx.user.id) as Array<{ target_id: string }>;

  const authorIds = rows.map((r) => r.target_id);
  const authors = listPublicAuthors().filter((a) => authorIds.includes(a.id));
  return { authors, authorIds };
}

// =============================================================================
// 6. HOMEPAGE SECTIONS, SITE SETTINGS, PARTNERS & ENQUIRIES
// =============================================================================

export function listHomepageSections(includeHidden = false): HomepageSection[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM homepage_sections ${
        includeHidden ? "" : "WHERE is_visible = 1"
      } ORDER BY sort_order ASC`
    )
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => {
    let config: Record<string, unknown> = {};
    try {
      if (typeof r.config_json === "string") {
        config = JSON.parse(r.config_json);
      }
    } catch {
      config = {};
    }
    return {
      id: String(r.id),
      section_key: String(r.section_key),
      eyebrow: String(r.eyebrow || ""),
      title: String(r.title),
      subtitle: String(r.subtitle || ""),
      is_visible: Boolean(r.is_visible),
      sort_order: Number(r.sort_order),
      cta_label: String(r.cta_label || ""),
      cta_href: String(r.cta_href || ""),
      config,
      updated_by_user_id: r.updated_by_user_id ? String(r.updated_by_user_id) : null,
      updated_at: String(r.updated_at),
    };
  });
}

export function updateHomepageSection(
  ctx: AuthenticatedContext,
  sectionKey: string,
  input: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    isVisible?: boolean;
    sortOrder?: number;
    ctaLabel?: string;
    ctaHref?: string;
  }
): HomepageSection {
  requireRole(ctx, ["admin"]);
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM homepage_sections WHERE section_key = ?")
    .get(sectionKey) as Record<string, unknown> | undefined;

  if (!existing) {
    throw new Error(`NOT_FOUND: Homepage section '${sectionKey}' not found.`);
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE homepage_sections SET
      eyebrow = ?,
      title = ?,
      subtitle = ?,
      is_visible = ?,
      sort_order = ?,
      cta_label = ?,
      cta_href = ?,
      updated_by_user_id = ?,
      updated_at = ?
    WHERE section_key = ?
  `).run(
    input.eyebrow !== undefined ? input.eyebrow.trim() : String(existing.eyebrow),
    input.title !== undefined ? input.title.trim() : String(existing.title),
    input.subtitle !== undefined ? input.subtitle.trim() : String(existing.subtitle),
    input.isVisible !== undefined
      ? input.isVisible
        ? 1
        : 0
      : Number(existing.is_visible),
    input.sortOrder !== undefined ? input.sortOrder : Number(existing.sort_order),
    input.ctaLabel !== undefined ? input.ctaLabel.trim() : String(existing.cta_label),
    input.ctaHref !== undefined ? input.ctaHref.trim() : String(existing.cta_href),
    ctx.user.id,
    now,
    sectionKey
  );

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "HOMEPAGE_SECTION_UPDATED",
    entityType: "homepage_section",
    entityId: sectionKey,
    summary: `Administrator updated homepage section '${sectionKey}'`,
  });

  return listHomepageSections(true).find((s) => s.section_key === sectionKey)!;
}

export function getSiteSettings(): SiteSettingsMap {
  const db = getDb();
  const rows = db
    .prepare("SELECT setting_key, setting_value_json FROM site_settings")
    .all() as Array<{ setting_key: string; setting_value_json: string }>;

  const result: Record<string, unknown> = { ...DEFAULT_SITE_SETTINGS };
  for (const r of rows) {
    try {
      result[r.setting_key] = JSON.parse(r.setting_value_json);
    } catch {
      result[r.setting_key] = r.setting_value_json;
    }
  }
  return result as unknown as SiteSettingsMap;
}

export function updateSiteSettings(
  ctx: AuthenticatedContext,
  updates: Partial<SiteSettingsMap>
): SiteSettingsMap {
  requireRole(ctx, ["admin"]);
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO site_settings (setting_key, setting_value_json, description, updated_by_user_id, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(setting_key) DO UPDATE SET
      setting_value_json = excluded.setting_value_json,
      updated_by_user_id = excluded.updated_by_user_id,
      updated_at = excluded.updated_at
  `);

  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined) {
      stmt.run(key, JSON.stringify(val), `Setting ${key}`, ctx.user.id, now);
    }
  }

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "SITE_SETTINGS_UPDATED",
    entityType: "site_settings",
    entityId: "global",
    summary: `Administrator updated site settings (${Object.keys(updates).join(", ")})`,
  });

  return getSiteSettings();
}

export function listCategories(): Category[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    description: String(r.description || ""),
    category_scope: r.category_scope as Category["category_scope"],
    sort_order: Number(r.sort_order || 0),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  }));
}

export function listPartners(activeOnly = true): Partner[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM partners ${
        activeOnly ? "WHERE is_active = 1 AND is_verified = 1" : ""
      } ORDER BY sort_order ASC, name ASC`
    )
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    category: String(r.category || "Publishing"),
    location: String(r.location || ""),
    description: String(r.description || ""),
    website_url: String(r.website_url),
    logo_url: String(r.logo_url || ""),
    is_verified: Boolean(r.is_verified),
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order || 0),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  }));
}

export const EnquiryInputSchema = z.object({
  enquiryType: z
    .enum([
      "contact",
      "partnership",
      "sponsorship",
      "author_promotion",
      "editorial_service",
      "newsletter",
    ])
    .default("contact"),
  name: z.string().max(120).optional().default("Subscriber"),
  email: z.string().email("Please enter a valid email address").max(255),
  organization: z.string().max(140).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  message: z.string().max(5000).optional().default(""),
});

export function createEnquiry(
  rawInput: z.infer<typeof EnquiryInputSchema>
): Enquiry {
  const parsed = EnquiryInputSchema.parse(rawInput);
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO enquiries (
      id, enquiry_type, name, email, organization, subject, message, status, admin_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', '', ?, ?)
  `).run(
    id,
    parsed.enquiryType,
    parsed.name.trim() || "Reader",
    parsed.email.trim().toLowerCase(),
    parsed.organization.trim(),
    parsed.subject.trim() || `${parsed.enquiryType} request`,
    parsed.message.trim(),
    now,
    now
  );

  return {
    id,
    enquiry_type: parsed.enquiryType,
    name: parsed.name.trim() || "Reader",
    email: parsed.email.trim().toLowerCase(),
    organization: parsed.organization.trim(),
    subject: parsed.subject.trim() || `${parsed.enquiryType} request`,
    message: parsed.message.trim(),
    status: "new",
    admin_notes: "",
    handled_by_user_id: null,
    created_at: now,
    updated_at: now,
  };
}

export function listEnquiries(ctx: AuthenticatedContext): Enquiry[] {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM enquiries ORDER BY created_at DESC")
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    enquiry_type: r.enquiry_type as Enquiry["enquiry_type"],
    name: String(r.name),
    email: String(r.email),
    organization: String(r.organization || ""),
    subject: String(r.subject || ""),
    message: String(r.message || ""),
    status: r.status as Enquiry["status"],
    admin_notes: String(r.admin_notes || ""),
    handled_by_user_id: r.handled_by_user_id ? String(r.handled_by_user_id) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  }));
}

export function updateEnquiryStatus(
  ctx: AuthenticatedContext,
  enquiryId: string,
  status: Enquiry["status"],
  adminNotes = ""
): Enquiry {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE enquiries SET
      status = ?,
      admin_notes = ?,
      handled_by_user_id = ?,
      updated_at = ?
    WHERE id = ?
  `).run(status, adminNotes.trim(), ctx.user.id, now, enquiryId);

  return listEnquiries(ctx).find((e) => e.id === enquiryId)!;
}

// =============================================================================
// 7. GLOBAL SEARCH & ADMIN METRICS / USER MANAGEMENT
// =============================================================================

export function globalSearch(query: string): {
  books: Book[];
  authors: Profile[];
  articles: Article[];
  broadcasts: Broadcast[];
  events: LiteraryEvent[];
} {
  const q = query.trim();
  if (!q) {
    return {
      books: [],
      authors: [],
      articles: [],
      broadcasts: [],
      events: [],
    };
  }
  return {
    books: listPublicBooks({ search: q, pageSize: 10 }).items,
    authors: listPublicAuthors({ search: q }),
    articles: listPublicArticles({ search: q, pageSize: 10 }).items,
    broadcasts: listBroadcasts({ search: q }),
    events: listEvents({ search: q }),
  };
}

export function getAdminDashboardMetrics(ctx: AuthenticatedContext) {
  requireRole(ctx, ["editor", "admin"]);
  const db = getDb();

  const count = (sql: string) =>
    (db.prepare(sql).get() as { count: number }).count;

  return {
    totalMembers: count("SELECT COUNT(*) as count FROM users WHERE account_status = 'active'"),
    totalAuthors: count("SELECT COUNT(*) as count FROM profiles WHERE is_author_profile = 1"),
    totalBooks: count("SELECT COUNT(*) as count FROM books"),
    publishedBooks: count("SELECT COUNT(*) as count FROM books WHERE status = 'published'"),
    totalArticles: count("SELECT COUNT(*) as count FROM articles"),
    publishedArticles: count("SELECT COUNT(*) as count FROM articles WHERE status = 'published'"),
    pendingSubmissions: count(
      "SELECT COUNT(*) as count FROM submissions WHERE status IN ('submitted', 'in_review')"
    ),
    pendingPitches: count(
      "SELECT COUNT(*) as count FROM pitches WHERE status IN ('submitted', 'in_review')"
    ),
    upcomingEvents: count(
      "SELECT COUNT(*) as count FROM events WHERE status IN ('published', 'scheduled')"
    ),
    totalBroadcasts: count("SELECT COUNT(*) as count FROM broadcasts"),
    unreadEnquiries: count("SELECT COUNT(*) as count FROM enquiries WHERE status = 'new'"),
  };
}

export function listAllUsersForAdmin(ctx: AuthenticatedContext) {
  requireRole(ctx, ["admin"]);
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT u.id, u.email, u.role, u.email_verified, u.account_status, u.last_login_at, u.created_at,
        p.id as profile_id, p.slug, p.display_name, p.headline, p.is_author_profile, p.is_featured
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `)
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    email: String(r.email),
    role: r.role as UserRole,
    emailVerified: Boolean(r.email_verified),
    accountStatus: String(r.account_status),
    lastLoginAt: r.last_login_at ? String(r.last_login_at) : null,
    createdAt: String(r.created_at),
    profileId: r.profile_id ? String(r.profile_id) : "",
    slug: r.slug ? String(r.slug) : "",
    displayName: r.display_name ? String(r.display_name) : String(r.email),
    headline: r.headline ? String(r.headline) : "",
    isAuthorProfile: Boolean(r.is_author_profile),
    isFeatured: Boolean(r.is_featured),
  }));
}

export function updateUserRoleOrStatus(
  ctx: AuthenticatedContext,
  targetUserId: string,
  updates: {
    role?: UserRole;
    accountStatus?: "active" | "suspended" | "deleted";
    isFeatured?: boolean;
  }
) {
  requireRole(ctx, ["admin"]);
  const db = getDb();
  const now = new Date().toISOString();

  if (updates.role) {
    db.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(
      updates.role,
      now,
      targetUserId
    );
    if (updates.role === "author" || updates.role === "editor" || updates.role === "admin") {
      db.prepare("UPDATE profiles SET is_author_profile = 1 WHERE user_id = ?").run(
        targetUserId
      );
    }
  }

  if (updates.accountStatus) {
    db.prepare(
      "UPDATE users SET account_status = ?, updated_at = ? WHERE id = ?"
    ).run(updates.accountStatus, now, targetUserId);
  }

  if (updates.isFeatured !== undefined) {
    db.prepare(
      "UPDATE profiles SET is_featured = ?, updated_at = ? WHERE user_id = ?"
    ).run(updates.isFeatured ? 1 : 0, now, targetUserId);
  }

  recordAuditLog({
    actorUserId: ctx.user.id,
    actorRole: ctx.user.role,
    action: "ADMIN_USER_UPDATED",
    entityType: "user",
    entityId: targetUserId,
    summary: `Administrator updated user ${targetUserId}: ${JSON.stringify(updates)}`,
  });

  return listAllUsersForAdmin(ctx).find((u) => u.id === targetUserId);
}

