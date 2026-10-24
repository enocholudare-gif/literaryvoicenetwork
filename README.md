# Literary Voices Network (LVN)

**Official Name:** Literary Voices Network (`LVN`)  
**Positioning:** A modern literary publishing, broadcast, and discovery network connecting authors, readers, editors, and literary culture.

---

## 1. Architecture Overview

Literary Voices Network is built as a full-stack **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4** application with a dual-compatible relational database layer:

1. **PostgreSQL / Supabase Production Migrations:**
   - [`supabase/migrations/0001_lvn_schema.sql`](supabase/migrations/0001_lvn_schema.sql) — 21+ normalized relational tables with foreign keys, check constraints, unique slug enforcement, and composite search indexes.
   - [`supabase/migrations/0002_supabase_rls.sql`](supabase/migrations/0002_supabase_rls.sql) — Row-Level Security (RLS) policies for Guest, Member, Author, Editor, and Administrator access control.
2. **Embedded Persistent Relational Engine (`node:sqlite` WAL):**
   - [`src/lib/db/index.ts`](src/lib/db/index.ts) — Zero-dependency persistent relational database (`./data/lvn.sqlite`) powered by Node 24's built-in `node:sqlite` (`DatabaseSync` with WAL mode and foreign keys enforced), automatically running migrations and seeding rich literary content on first boot.
3. **Server-Side Services & RBAC Security:**
   - [`src/lib/services/auth.ts`](src/lib/services/auth.ts) — `scrypt` password hashing, HMAC-SHA256 HTTP-only session cookies, email verification tokens, password reset tokens, rate limiting, and server-enforced `requireRole()` checks.
   - [`src/lib/services/publishing.ts`](src/lib/services/publishing.ts) — Enforces the 7-stage publication lifecycle (`draft → submitted → in_review → revision_requested / approved → scheduled → published → archived`), content revision snapshots, separation of book-listing approval from full-manuscript distribution authorization, and the **Mandatory Administrator Publishing Identity**.
   - [`src/lib/services/platform.ts`](src/lib/services/platform.ts) — Author directory & portfolio aggregation, audio/video broadcast archive, literary events & RSVP registrations, editorial issues & calendar, member pitches, favourites, follows, homepage section ordering/visibility, site settings, global search, and admin metrics.
   - [`src/lib/services/media.ts`](src/lib/services/media.ts) — Server-validated file uploads (MIME type, size limits, role checks) stored in `public/uploads`.
   - [`src/lib/services/notifications.ts`](src/lib/services/notifications.ts) — In-app notification center, immutable audit logging (`audit_logs`), and Resend email provider integration with a safe development outbox mode.

---

## 2. Mandatory Administrator Dual Identity (Admin + Public Author)

The Administrator account (`Eleanor Vance` / `admin@literaryvoicesnetwork.org`) simultaneously holds:
- **Full Administrative Privileges** at [`/admin`](src/app/admin/page.tsx) (moderating member submissions, managing users/roles, reordering homepage sections, configuring the hero video, managing broadcasts/events/issues, and inspecting audit logs).
- **A Normal Public LVN Author Profile** at [`/authors/eleanor-vance`](src/app/authors/[slug]/page.tsx) under which she publishes books (e.g., *The Glass Meridian* at `/books/the-glass-meridian`), cover stories, essays, interviews, and press releases using the same validation rules, rich-text studio, and database tables as member content—with authorized direct publication and `ADMIN_DIRECT_PUBLISH` audit logging.

---

## 3. Seeded Demo Accounts (One-Click Sign-In Available on `/auth`)

All seeded accounts share the password: **`LvnPass2026!`**

| Role | Name | Email | Public Profile | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator + Public Author** | Eleanor Vance | `admin@literaryvoicesnetwork.org` | `/authors/eleanor-vance` | Full `/admin` console + direct publishing under her public author profile |
| **Senior Commissioning Editor** | Marcus Sterling | `editor@literaryvoicesnetwork.org` | `/authors/marcus-sterling` | Editorial moderation queue, revision requests, approvals, scheduling |
| **Verified Author** | Amara Osei | `amara.osei@literaryvoicesnetwork.org` | `/authors/amara-osei` | Book submissions, Rich-Text Article Studio, pitches, profile editing |
| **Verified Author** | Julian Thorne | `julian.thorne@literaryvoicesnetwork.org` | `/authors/julian-thorne` | Has a pending book submission (`Nocturne for Observatories`) in the moderation queue |
| **Registered Member / Reader** | Nadia Khoury | `member@literaryvoicesnetwork.org` | `/authors/nadia-khoury` | Has a submitted essay in the moderation queue, saved library items, and event RSVPs |

---

## 4. Local Setup, Database Scripts & Testing

### Install Dependencies
```bash
npm install
```

### Database Migration & Seeding Commands
```bash
# Run schema migrations
npm run db:migrate

# Seed (or re-verify) initial literary data
npm run db:seed

# Reset and re-seed database from scratch
npm run db:reset
```

### Run Automated Backend & Security Tests (Vitest)
```bash
npm test
```

### Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000`.

### Production Build & Start
```bash
npm run build
npm start
```

