-- =============================================================================
-- LITERARY VOICES NETWORK (LVN) — PostgreSQL / Supabase Initial Schema Migration
-- Migration: 0001_lvn_schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'author', 'editor', 'admin')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  notification_prefs_json TEXT NOT NULL DEFAULT '{"emailSubmissions":true,"emailEvents":true,"emailNewsletter":true}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. PROFILES (1:1 public member/author identity, including Mandatory Administrator Public Profile)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
  is_author_profile BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_featured ON profiles(is_featured, is_author_profile);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_scope TEXT NOT NULL DEFAULT 'magazine' CHECK (category_scope IN ('magazine', 'book', 'press', 'both')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_scope ON categories(category_scope);

-- 4. TAGS & CONTENT_TAGS
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article', 'event', 'broadcast')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tag_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_content_tags_lookup ON content_tags(entity_type, entity_id);

-- 5. EDITORIAL ISSUES
CREATE TABLE IF NOT EXISTS editorial_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  issue_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  submission_deadline TIMESTAMPTZ NOT NULL,
  publication_date TIMESTAMPTZ NOT NULL,
  submission_window_open BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'open_for_submissions', 'in_production', 'published', 'archived')),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_editorial_issues_status ON editorial_issues(status, publication_date);

-- 6. BOOKS
-- Lifecycle: draft -> submitted -> in_review -> revision_requested / approved -> scheduled -> published -> archived
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submitted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  manuscript_distribution_authorized BOOLEAN NOT NULL DEFAULT FALSE,
  full_manuscript_url TEXT NOT NULL DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  editorial_recommendation BOOLEAN NOT NULL DEFAULT FALSE,
  is_community_member_book BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'revision_requested', 'approved', 'scheduled', 'published', 'archived', 'rejected')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status, published_at);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_profile_id);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured, editorial_recommendation);

-- 7. ARTICLES (Magazine Cover Stories, Interviews, Reviews, Essays, Commentary, Resources, Spotlights, Announcements, Press Releases)
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  issue_id UUID REFERENCES editorial_issues(id) ON DELETE SET NULL,
  related_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  featured_author_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
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
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_cover_story BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'revision_requested', 'approved', 'scheduled', 'published', 'archived', 'rejected')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(article_type, status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_profile_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);

-- 8. CONTENT REVISIONS
CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article')),
  entity_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  change_summary TEXT NOT NULL DEFAULT '',
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_entity ON content_revisions(entity_type, entity_id, version_number DESC);

-- 9. SUBMISSIONS & MODERATION DECISIONS
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article')),
  entity_id UUID NOT NULL,
  submitted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'revision_requested', 'approved', 'scheduled', 'published', 'rejected', 'archived')),
  submission_notes TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  author_feedback TEXT NOT NULL DEFAULT '',
  decision_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_entity ON submissions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(submitted_by_user_id);

-- 10. BROADCASTS & AUDIO/VIDEO PROGRAMMES
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  programme_name TEXT NOT NULL,
  episode_number INTEGER,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  host_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  guest_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL DEFAULT '',
  featured_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  broadcast_type TEXT NOT NULL DEFAULT 'audio' CHECK (broadcast_type IN ('audio', 'video', 'podcast')),
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  live_stream_url TEXT NOT NULL DEFAULT '',
  replay_url TEXT NOT NULL DEFAULT '',
  external_embed_url TEXT NOT NULL DEFAULT '',
  audio_file_url TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'LVN Studio' CHECK (provider IN ('LVN Studio', 'Spotify', 'YouTube', 'Apple Podcasts', 'SoundCloud', 'HLS Stream')),
  banner_url TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'live', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_slug ON broadcasts(slug);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status, is_live, scheduled_start DESC);

-- 11. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'interview' CHECK (event_type IN ('interview', 'book_launch', 'reading', 'workshop', 'panel', 'book_club')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  host_name TEXT NOT NULL,
  host_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_names_json TEXT NOT NULL DEFAULT '[]',
  featured_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  banner_url TEXT NOT NULL DEFAULT '',
  venue_or_link TEXT NOT NULL DEFAULT '',
  is_virtual BOOLEAN NOT NULL DEFAULT TRUE,
  registration_open BOOLEAN NOT NULL DEFAULT TRUE,
  max_attendees INTEGER,
  archive_url TEXT NOT NULL DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'completed', 'cancelled', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(status, start_at ASC);

-- 12. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, attendee_email)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON event_registrations(user_id);

-- 13. FAVOURITES
CREATE TABLE IF NOT EXISTS favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('book', 'article')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites(user_id, entity_type);

-- 14. FOLLOWS
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('author', 'category')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(follower_user_id, target_type);

-- 15. PITCHES (Author & Member Proposals for Interviews, Spotlights, Book Launches, Magazine Features)
CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES editorial_issues(id) ON DELETE SET NULL,
  related_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  pitch_type TEXT NOT NULL CHECK (pitch_type IN ('interview', 'spotlight', 'book_launch', 'magazine_feature', 'broadcast_guest')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  supporting_links TEXT NOT NULL DEFAULT '',
  proposed_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'accepted', 'declined', 'revision_requested')),
  editor_feedback TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitches_user ON pitches(submitted_by_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches(status);

-- 16. PARTNERS
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Publishing',
  location TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL,
  logo_url TEXT NOT NULL DEFAULT '',
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'public',
  public_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  asset_category TEXT NOT NULL DEFAULT 'editorial' CHECK (asset_category IN ('book_cover', 'avatar', 'article_cover', 'editorial', 'audio_video', 'hero_media', 'partner_logo')),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_uploader ON media_assets(uploaded_by_user_id);

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT NOT NULL DEFAULT '/dashboard',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  email_delivery_status TEXT NOT NULL DEFAULT 'logged_dev' CHECK (email_delivery_status IN ('pending', 'sent', 'logged_dev', 'failed', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- 19. ENQUIRIES (Contact, Partnerships, Sponsorships, Author Promotion, Editorial Services, Newsletter)
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('contact', 'partnership', 'sponsorship', 'author_promotion', 'editorial_service', 'newsletter')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  admin_notes TEXT NOT NULL DEFAULT '',
  handled_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries(enquiry_type, status, created_at DESC);

-- 20. HOMEPAGE SECTIONS (Configurable Order, Visibility, Headlines & Featured Items without code changes)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cta_label TEXT NOT NULL DEFAULT '',
  cta_href TEXT NOT NULL DEFAULT '',
  config_json TEXT NOT NULL DEFAULT '{}',
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(sort_order ASC);

-- 21. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value_json TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  ip_address TEXT NOT NULL DEFAULT '127.0.0.1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);

