-- =============================================================================
-- LITERARY VOICES NETWORK (LVN) — Supabase Row-Level Security (RLS) Policies
-- Migration: 0002_supabase_rls.sql
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Published books are viewable by everyone"
  ON books FOR SELECT USING (status = 'published');

CREATE POLICY "Owners and editors can view own or submitted books"
  ON books FOR SELECT USING (
    auth.uid() = submitted_by_user_id
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('editor', 'admin'))
  );

CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT USING (status = 'published');

CREATE POLICY "Owners and editors can view own or submitted articles"
  ON articles FOR SELECT USING (
    auth.uid() = created_by_user_id
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('editor', 'admin'))
  );

CREATE POLICY "Submissions visible only to owner, editor, or admin"
  ON submissions FOR SELECT USING (
    auth.uid() = submitted_by_user_id
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('editor', 'admin'))
  );

CREATE POLICY "Notifications visible only to recipient"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Audit logs visible only to administrators"
  ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

