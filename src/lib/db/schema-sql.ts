// =============================================================================
// LITERARY VOICES NETWORK (LVN) — Relational Schema DDL (SQLite & PostgreSQL compatible)
// =============================================================================

export const INITIAL_MIGRATION_VERSION = "0001_initial_lvn_schema";

export const INITIAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'author', 'editor', 'admin')),
  email_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires_at TEXT,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  notification_prefs_json TEXT NOT NULL DEFAULT '{"emailSubmissions":true,"emailEvents":true,"emailNewsletter":true}',
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  pen_name TEXT,
  headline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  banner_url TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  genres_json TEXT NOT NULL DEFAULT '[]',
  social_links_json TEXT NOT NULL DEFAULT '{}',
  is_author_profile INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_featured ON profiles(is_featured, is_author_profile);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_scope TEXT NOT NULL DEFAULT 'magazine' CHECK (category_scope IN ('magazine', 'book', 'press', 'both')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_scope ON categories(category_scope);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_tags (
  id TEXT PRIMARY KEY,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article', 'event', 'broadcast')),
  entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(tag_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_content_tags_lookup ON content_tags(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS editorial_issues (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  issue_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  submission_deadline TEXT NOT NULL,
  publication_date TEXT NOT NULL,
  submission_window_open INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'open_for_submissions', 'in_production', 'published', 'archived')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_editorial_issues_status ON editorial_issues(status, publication_date);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  author_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submitted_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  isbn TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL,
  secondary_genres_json TEXT NOT NULL DEFAULT '[]',
  format TEXT NOT NULL DEFAULT 'Hardcover' CHECK (format IN ('Hardcover', 'Paperback', 'eBook', 'Audiobook', 'Multi-format')),
  publisher TEXT NOT NULL DEFAULT '',
  publication_date TEXT NOT NULL DEFAULT '',
  page_count INTEGER,
  language TEXT NOT NULL DEFAULT 'English',
  retailer_links_json TEXT NOT NULL DEFAULT '{}',
  manuscript_distribution_authorized INTEGER NOT NULL DEFAULT 0,
  full_manuscript_url TEXT NOT NULL DEFAULT '',
  is_featured INTEGER NOT NULL DEFAULT 0,
  editorial_recommendation INTEGER NOT NULL DEFAULT 0,
  is_community_member_book INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'revision_requested', 'approved', 'scheduled', 'published', 'archived', 'rejected')),
  scheduled_for TEXT,
  published_at TEXT,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status, published_at);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_profile_id);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured, editorial_recommendation);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  author_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  issue_id TEXT REFERENCES editorial_issues(id) ON DELETE SET NULL,
  related_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  featured_author_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  article_type TEXT NOT NULL DEFAULT 'essay' CHECK (article_type IN (
    'cover_story',
    'interview',
    'review',
    'essay',
    'commentary',
    'resource',
    'culture',
    'spotlight',
    'announcement',
    'press_release'
  )),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL,
  cover_url TEXT NOT NULL DEFAULT '',
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  source_attribution TEXT NOT NULL DEFAULT 'Literary Voices Network Editorial',
  media_contact_info TEXT NOT NULL DEFAULT '',
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_cover_story INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'revision_requested', 'approved', 'scheduled', 'published', 'archived', 'rejected')),
  scheduled_for TEXT,
  published_at TEXT,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(article_type, status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_profile_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);

CREATE TABLE IF NOT EXISTS content_revisions (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article')),
  entity_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  change_summary TEXT NOT NULL DEFAULT '',
  created_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revisions_entity ON content_revisions(entity_type, entity_id, version_number DESC);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article')),
  entity_id TEXT NOT NULL,
  submitted_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_editor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'revision_requested', 'approved', 'scheduled', 'published', 'rejected', 'archived')),
  submission_notes TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  author_feedback TEXT NOT NULL DEFAULT '',
  decision_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_entity ON submissions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(submitted_by_user_id);

CREATE TABLE IF NOT EXISTS broadcasts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  programme_name TEXT NOT NULL,
  episode_number INTEGER,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  host_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  guest_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL DEFAULT '',
  featured_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  broadcast_type TEXT NOT NULL DEFAULT 'audio' CHECK (broadcast_type IN ('audio', 'video', 'podcast')),
  is_live INTEGER NOT NULL DEFAULT 0,
  live_stream_url TEXT NOT NULL DEFAULT '',
  replay_url TEXT NOT NULL DEFAULT '',
  external_embed_url TEXT NOT NULL DEFAULT '',
  audio_file_url TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'LVN Studio' CHECK (provider IN ('LVN Studio', 'Spotify', 'YouTube', 'Apple Podcasts', 'SoundCloud', 'HLS Stream')),
  banner_url TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  scheduled_start TEXT NOT NULL,
  scheduled_end TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  is_featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'live', 'published', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_slug ON broadcasts(slug);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status, is_live, scheduled_start DESC);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'interview' CHECK (event_type IN ('interview', 'book_launch', 'reading', 'workshop', 'panel', 'book_club')),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  host_name TEXT NOT NULL,
  host_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  guest_names_json TEXT NOT NULL DEFAULT '[]',
  featured_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  banner_url TEXT NOT NULL DEFAULT '',
  venue_or_link TEXT NOT NULL DEFAULT '',
  is_virtual INTEGER NOT NULL DEFAULT 1,
  registration_open INTEGER NOT NULL DEFAULT 1,
  max_attendees INTEGER,
  archive_url TEXT NOT NULL DEFAULT '',
  is_featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'completed', 'cancelled', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(status, start_at ASC);

CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  reminder_enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  created_at TEXT NOT NULL,
  UNIQUE(event_id, attendee_email)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON event_registrations(user_id);

CREATE TABLE IF NOT EXISTS favourites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article')),
  entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites(user_id, entity_type);

CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  follower_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('author', 'category')),
  target_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(follower_user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(follower_user_id, target_type);

CREATE TABLE IF NOT EXISTS pitches (
  id TEXT PRIMARY KEY,
  submitted_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id TEXT REFERENCES editorial_issues(id) ON DELETE SET NULL,
  related_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  pitch_type TEXT NOT NULL CHECK (pitch_type IN ('interview', 'spotlight', 'book_launch', 'magazine_feature', 'broadcast_guest')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  supporting_links TEXT NOT NULL DEFAULT '',
  proposed_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'accepted', 'declined', 'revision_requested')),
  editor_feedback TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pitches_user ON pitches(submitted_by_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches(status);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Publishing',
  location TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL,
  logo_url TEXT NOT NULL DEFAULT '',
  is_verified INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  uploaded_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'public',
  public_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  asset_category TEXT NOT NULL DEFAULT 'editorial' CHECK (asset_category IN ('book_cover', 'avatar', 'article_cover', 'editorial', 'audio_video', 'hero_media', 'partner_logo')),
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_uploader ON media_assets(uploaded_by_user_id);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT NOT NULL DEFAULT '/dashboard',
  is_read INTEGER NOT NULL DEFAULT 0,
  email_delivery_status TEXT NOT NULL DEFAULT 'logged_dev' CHECK (email_delivery_status IN ('pending', 'sent', 'logged_dev', 'failed', 'skipped')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('contact', 'partnership', 'sponsorship', 'author_promotion', 'editorial_service', 'newsletter')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  admin_notes TEXT NOT NULL DEFAULT '',
  handled_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries(enquiry_type, status, created_at DESC);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  is_visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cta_label TEXT NOT NULL DEFAULT '',
  cta_href TEXT NOT NULL DEFAULT '',
  config_json TEXT NOT NULL DEFAULT '{}',
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(sort_order ASC);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value_json TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  ip_address TEXT NOT NULL DEFAULT '127.0.0.1',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
`;

