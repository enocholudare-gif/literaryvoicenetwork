export type UserRole = "member" | "author" | "editor" | "admin";
export type AccountStatus = "active" | "suspended" | "deleted";

export type PublicationStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "revision_requested"
  | "approved"
  | "scheduled"
  | "published"
  | "archived"
  | "rejected";

export type ArticleType =
  | "cover_story"
  | "interview"
  | "review"
  | "essay"
  | "commentary"
  | "resource"
  | "culture"
  | "spotlight"
  | "announcement"
  | "press_release"
  | "lifestyle";

export type BookFormat =
  | "Hardcover"
  | "Paperback"
  | "eBook"
  | "Audiobook"
  | "Multi-format";

export type BroadcastType = "audio" | "video" | "podcast";
export type EventType =
  | "interview"
  | "book_launch"
  | "reading"
  | "workshop"
  | "panel"
  | "book_club";

export type PitchType =
  | "interview"
  | "spotlight"
  | "book_launch"
  | "magazine_feature"
  | "broadcast_guest";

export type EnquiryType =
  | "contact"
  | "partnership"
  | "sponsorship"
  | "author_promotion"
  | "editorial_service"
  | "newsletter";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  email_verified: boolean;
  verification_token: string | null;
  reset_token: string | null;
  reset_token_expires_at: string | null;
  account_status: AccountStatus;
  notification_prefs: {
    emailSubmissions: boolean;
    emailEvents: boolean;
    emailNewsletter: boolean;
  };
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  pen_name: string | null;
  headline: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  location: string;
  website_url: string;
  genres: string[];
  social_links: {
    twitter?: string;
    instagram?: string;
    goodreads?: string;
    linkedin?: string;
    substack?: string;
  };
  is_author_profile: boolean;
  is_featured: boolean;
  is_public: boolean;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_scope: "magazine" | "book" | "press" | "both";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface EditorialIssue {
  id: string;
  slug: string;
  issue_number: number;
  title: string;
  theme: string;
  description: string;
  cover_url: string;
  submission_deadline: string;
  publication_date: string;
  submission_window_open: boolean;
  status: "planned" | "open_for_submissions" | "in_production" | "published" | "archived";
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookReview {
  id: string;
  book_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  headline: string;
  content: string;
  created_at: string;
}

export interface RetailerLinks {
  amazon?: string;
  bookshop?: string;
  barnesAndNoble?: string;
  goodreads?: string;
  appleBooks?: string;
  kobo?: string;
  audible?: string;
  spotify?: string;
  publisherDirect?: string;
}

export interface Book {
  id: string;
  slug: string;
  author_profile_id: string;
  submitted_by_user_id: string;
  title: string;
  subtitle: string;
  isbn: string;
  description: string;
  excerpt: string;
  cover_url: string;
  genre: string;
  secondary_genres: string[];
  format: BookFormat;
  publisher: string;
  publication_date: string;
  page_count: number | null;
  language: string;
  retailer_links: RetailerLinks;
  manuscript_distribution_authorized: boolean;
  full_manuscript_url: string;
  is_featured: boolean;
  editorial_recommendation: boolean;
  is_community_member_book: boolean;
  status: PublicationStatus;
  scheduled_for: string | null;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  // Joined author fields
  author_name?: string;
  author_slug?: string;
  author_avatar?: string;
  author_headline?: string;
  author_bio?: string;
  author_role?: UserRole;
  tags?: string[];
}

export interface Article {
  id: string;
  slug: string;
  author_profile_id: string;
  created_by_user_id: string;
  category_id: string | null;
  issue_id: string | null;
  related_book_id: string | null;
  featured_author_profile_id: string | null;
  article_type: ArticleType;
  title: string;
  subtitle: string;
  excerpt: string;
  body_html: string;
  cover_url: string;
  reading_time_minutes: number;
  source_attribution: string;
  media_contact_info: string;
  is_featured: boolean;
  is_cover_story: boolean;
  status: PublicationStatus;
  scheduled_for: string | null;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  author_slug?: string;
  author_avatar?: string;
  author_headline?: string;
  author_bio?: string;
  author_role?: UserRole;
  category_name?: string;
  category_slug?: string;
  issue_title?: string;
  issue_number?: number;
  tags?: string[];
}

export interface ContentRevision {
  id: string;
  entity_type: "book" | "article";
  entity_id: string;
  version_number: number;
  title: string;
  snapshot_json: string;
  change_summary: string;
  created_by_user_id: string;
  created_at: string;
}

export interface Submission {
  id: string;
  entity_type: "book" | "article";
  entity_id: string;
  submitted_by_user_id: string;
  author_profile_id: string;
  assigned_editor_id: string | null;
  reviewer_user_id: string | null;
  status: PublicationStatus;
  submission_notes: string;
  internal_notes: string;
  author_feedback: string;
  decision_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined details
  entity_title?: string;
  entity_slug?: string;
  author_name?: string;
  author_slug?: string;
  reviewer_name?: string;
}

export interface Broadcast {
  id: string;
  slug: string;
  programme_name: string;
  episode_number: number | null;
  title: string;
  subtitle: string;
  description: string;
  host_profile_id: string | null;
  host_name: string;
  guest_profile_id: string | null;
  guest_name: string;
  featured_book_id: string | null;
  broadcast_type: BroadcastType;
  is_live: boolean;
  live_stream_url: string;
  replay_url: string;
  external_embed_url: string;
  audio_file_url: string;
  provider: "LVN Studio" | "Spotify" | "YouTube" | "Apple Podcasts" | "SoundCloud" | "HLS Stream";
  banner_url: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end: string | null;
  timezone: string;
  is_featured: boolean;
  status: "draft" | "scheduled" | "live" | "published" | "archived";
  created_at: string;
  updated_at: string;
  host_slug?: string;
  host_avatar?: string;
  guest_slug?: string;
  featured_book_title?: string;
  featured_book_slug?: string;
}

export interface LiteraryEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  event_type: EventType;
  start_at: string;
  end_at: string;
  timezone: string;
  host_name: string;
  host_profile_id: string | null;
  guest_names: string[];
  featured_book_id: string | null;
  banner_url: string;
  venue_or_link: string;
  is_virtual: boolean;
  registration_open: boolean;
  max_attendees: number | null;
  archive_url: string;
  is_featured: boolean;
  status: "draft" | "scheduled" | "published" | "completed" | "cancelled" | "archived";
  created_at: string;
  updated_at: string;
  registration_count?: number;
  host_slug?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string | null;
  attendee_name: string;
  attendee_email: string;
  reminder_enabled: boolean;
  status: "registered" | "cancelled" | "attended";
  created_at: string;
  event_title?: string;
  event_slug?: string;
  event_start_at?: string;
  event_timezone?: string;
}

export interface Pitch {
  id: string;
  submitted_by_user_id: string;
  author_profile_id: string;
  issue_id: string | null;
  related_book_id: string | null;
  pitch_type: PitchType;
  title: string;
  summary: string;
  supporting_links: string;
  proposed_date: string;
  status: "submitted" | "in_review" | "accepted" | "declined" | "revision_requested";
  editor_feedback: string;
  internal_notes: string;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_slug?: string;
  issue_title?: string;
}

export interface Partner {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  description: string;
  website_url: string;
  logo_url: string;
  is_verified: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  uploaded_by_user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  bucket: string;
  public_url: string;
  alt_text: string;
  asset_category:
    | "book_cover"
    | "avatar"
    | "article_cover"
    | "editorial"
    | "audio_video"
    | "hero_media"
    | "partner_logo";
  is_public: boolean;
  created_at: string;
  uploader_name?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url: string;
  is_read: boolean;
  email_delivery_status: "pending" | "sent" | "logged_dev" | "failed" | "skipped";
  created_at: string;
}

export interface Enquiry {
  id: string;
  enquiry_type: EnquiryType;
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "archived";
  admin_notes: string;
  handled_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  is_visible: boolean;
  sort_order: number;
  cta_label: string;
  cta_href: string;
  config: Record<string, unknown>;
  updated_by_user_id: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata_json: string;
  ip_address: string;
  created_at: string;
  actor_email?: string;
  actor_name?: string;
}

export interface SiteSettingsMap {
  siteName: string;
  siteAbbreviation: string;
  siteTagline: string;
  announcementBarText: string;
  announcementBarLink: string;
  announcementBarVisible: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  heroVideoUrl: string;
  heroPosterUrl: string;
  heroOverlayOpacity: number;
  logoText: string;
  primaryColorHex: string;
  accentColorHex: string;
  editorialEmail: string;
  pressEmail: string;
  partnershipsEmail: string;
  memberPublishingEnabled: boolean;
  liveBroadcastActive: boolean;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  footerCopyright: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
  };
}

