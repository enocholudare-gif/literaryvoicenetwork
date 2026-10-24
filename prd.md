# LITERARY VOICES NETWORK (LVN)
## Product Requirements Document — Full-Stack Literary Publishing Web Application

**Product name:** Literary Voices Network  
**Abbreviation:** LVN  
**Product type:** Literary community, publishing platform, digital magazine, and media web application  
**Reference prototype:** https://bookbroadcastnetwork.org/  
**Status:** Ready for implementation planning

## 1. Product Vision

Build Literary Voices Network into a premium digital literary ecosystem where authors, readers, editors, and publishers can discover books, publish original work, participate in literary discussions, explore interviews, attend events, and access editorial and broadcast content.

Use Book Broadcast Network as the functional reference for the breadth of features, page organization, and publishing experience. Create an original LVN brand identity, design system, content, and user experience. Do not copy its branding or proprietary copy verbatim.

This must be a fully functional web application, not a static website. Implement secure authentication, persistent database storage, member accounts, content management, editorial moderation, media handling, search, and role-based permissions.

### Core principle

**Literary Voices Network must be both a literary publication and a publishing platform.**

The administrator must have a normal public LVN member profile and be able to publish original books, articles, essays, stories, author spotlights, interviews, and other supported editorial work under that profile while retaining full administrative privileges.

## 2. Product Objectives

1. Create a polished public platform for literary discovery.
2. Enable authors to register, create profiles, submit books, and manage their work.
3. Allow eligible members to create and submit articles, stories, and other original content.
4. Provide a unified publishing workflow for administrators, editors, and members.
5. Support editorial features, author interviews, book launches, events, audio, and video broadcasts.
6. Create a searchable book directory, author directory, digital magazine, and newsroom.
7. Provide an administrative dashboard for content, users, moderation, media, and site configuration.
8. Deliver a cinematic homepage with a looping hero background video.
9. Make the platform accessible, secure, SEO-friendly, responsive, and ready for production deployment.

## 3. User Roles and Permissions

### Visitor
- Browse published books, authors, articles, broadcasts, and events.
- Search and filter public content.
- View author profiles and book details.
- Register or sign in.

### Member / Reader
- Manage a profile, biography, avatar, and interests.
- Save books and articles to favourites.
- Follow authors and literary topics.
- Register interest in events.
- Submit eligible original work where member publishing is enabled.

### Author
- Manage an author profile and published book listings.
- Create book drafts and submit them for review.
- Add cover images, descriptions, genres, publication information, and retailer links.
- Track submission status and editorial feedback.
- Pitch interviews, spotlights, book launches, and magazine features.
- Edit eligible content and request corrections.

### Editor
- Review and moderate member submissions.
- Create and edit articles, books, interviews, and event listings within assigned permissions.
- Request revisions, approve or reject content, and schedule publication.
- Manage categories, tags, editorial issues, and featured content.

### Administrator
- Access all authorized administrative functions.
- Manage users, roles, content, media, homepage sections, navigation, and platform settings.
- Approve, reject, schedule, archive, and feature submissions.
- Manage events, broadcasts, enquiries, and editorial calendars.
- View audit logs and platform activity.
- Maintain a public LVN member/author profile.
- Publish original work under that public identity.
- Use the same content editor and publishing pipeline as members, with authorized administrative overrides.
- Maintain transparent authorship and attribution for all content.

Enforce every permission on the server. Frontend visibility controls are not sufficient authorization.

## 4. Public Website Architecture

### 4.1 Homepage — `/`

Build an editorial-style homepage with configurable sections:

1. Announcement bar.
2. Navigation with Books, Authors, Magazine, Broadcasts, Events, About, and account actions.
3. Cinematic hero with background video, dark overlay, headline, supporting copy, and calls to action.
4. Featured or live broadcast.
5. Platform introduction.
6. Featured authors.
7. Upcoming interviews and events.
8. New book releases and editorial selections.
9. Recently approved member books.
10. Book directory preview and genre discovery.
11. Magazine cover stories and recent articles.
12. Author spotlights and interviews.
13. Audio/video archive.
14. Literary news and press releases.
15. Upcoming book clubs, readings, and launches.
16. Membership and author-publishing calls to action.
17. Partner section, where verified partnerships exist.
18. Newsletter signup.
19. Comprehensive footer with policies, contact information, social links, and copyright.

Administrators must be able to reorder, edit, hide, and feature homepage sections without modifying code.

Never fabricate statistics, partnerships, live audiences, or editorial endorsements.

### 4.2 Books — `/books`

- Search by title, author, ISBN, description, and keywords.
- Filter by genre, format, publication date, and featured status.
- Sort by newest, title, and editorial recommendation.
- Display cover, title, author, description, and publication details.
- Support pagination, loading states, and empty states.

### 4.3 Book Details — `/books/[slug]`

- Cover, title, subtitle, author, description, genre, and publication metadata.
- ISBN, publisher, page count, and format where available.
- Approved excerpts and external retailer links.
- Author profile and related books.
- Related articles and interviews.
- Favourite and share actions.
- Canonical URL and SEO metadata.

Only offer full-book reading or downloads when authorized content is available.

### 4.4 Authors — `/authors`

Provide a searchable author directory and public author profiles at `/authors/[slug]`.

Profiles include biography, portrait, genres, approved social links, books, articles, interviews, and upcoming appearances.

### 4.5 Magazine — `/magazine`

Build a professional digital magazine with:

- Cover stories.
- Author interviews.
- Book reviews.
- Essays and literary commentary.
- Publishing resources.
- Literary culture.
- Author spotlights.
- Editorial announcements.

Article pages must support title, slug, rich-text body, excerpt, cover image, author attribution, category, tags, publication status, scheduled date, reading time, and SEO metadata.

### 4.6 Editorial Calendar — `/editorial-calendar`

- Display planned issues, editorial themes, deadlines, and publication dates.
- Allow editors to manage issues.
- Allow eligible members to submit pitches.
- Display open and closed submission windows.

### 4.7 Newsroom — `/press-releases`

Provide press releases and official announcements with dates, categories, images, source attribution, contact information, and searchable archives.

### 4.8 Broadcasts and Audio — `/live`, `/broadcasts`

- Live audio/video player with verified live/offline state.
- Upcoming broadcasts and interview schedules.
- Host and guest profiles.
- Archived broadcasts and replay links.
- External podcast embeds and provider integrations.
- Accessible playback controls.

Use actual authorized media integrations. Never simulate a live stream when no stream is connected.

### 4.9 Events — `/events`

Support author interviews, book launches, readings, workshops, literary panels, and virtual book clubs.

Each event includes a title, description, date, time, timezone, host, guests, image, venue or virtual link, registration options, and archive link where applicable.

### 4.10 Partners and Services

Provide configurable pages for partnerships, author promotion, editorial services, sponsorship enquiries, and contact requests. Publish pricing only when the service and pricing have been confirmed.

## 5. Member Dashboard — `/dashboard`

Create a secure workspace with:

### Overview
- Welcome message and profile completion.
- Published content and book counts.
- Drafts and pending submissions.
- Recent editorial feedback.
- Upcoming events and activity.

### My Books
- Create, edit, and save drafts.
- Upload and preview cover images.
- Enter book metadata and descriptions.
- Submit for review.
- Track status and feedback.
- Access published URLs.

### My Publications
- Create articles, essays, stories, and other eligible content.
- Use a rich-text editor with headings, lists, quotations, links, and images.
- Save drafts, preview, and submit for review.
- Manage published content according to editorial policy.

### My Profile
- Edit display name, biography, portrait, genres, and social links.
- Preview the public profile.
- Manage notification preferences.

### My Library
- View saved books, articles, and followed authors.

### My Pitches
- Submit interview proposals and editorial pitches.
- Track decisions and feedback.

Members must never be allowed to access another member's private drafts or modify content without permission.

## 6. Administrator Dashboard — `/admin`

### Dashboard overview
Display real database-backed metrics for members, books, articles, submissions, published content, and upcoming events.

### Content management
Provide management screens for:

- Books and authors.
- Members and roles.
- Articles and magazine issues.
- Interviews and broadcasts.
- Events and editorial calendars.
- Press releases.
- Categories and tags.
- Homepage sections and navigation.
- Media library.
- Partner listings and service enquiries.
- Contact messages and member pitches.
- Site settings and SEO defaults.

### Moderation
- Review submissions.
- Preview content.
- Approve, reject, request revisions, schedule, or archive.
- Add internal notes and author-visible feedback.
- Record decisions and reviewer details.
- Notify members of status changes.

### Administrator's public publishing identity

This requirement is mandatory.

- The administrator must have a public LVN member/author profile.
- The administrator can create and publish original work under that profile.
- The administrator can publish books, essays, stories, articles, interviews, spotlights, and other supported content.
- The administrator uses the same validated content editor as other members.
- Administrative publishing overrides are permitted only where authorized.
- Record privileged actions in audit logs.
- Show correct author attribution on all public pages.
- Never silently attribute content to another person.

### Site settings
Allow authorized administrators to manage the LVN logo, colors, typography, hero video, poster image, navigation, footer, homepage sections, SEO defaults, email configuration, and feature flags.

## 7. Publishing Workflow

Use the following lifecycle:

`Draft → Submitted → In Review → Revision Requested / Approved → Scheduled → Published → Archived`

- Members create drafts and submit eligible content.
- Editors review and provide feedback.
- Approved content can be scheduled.
- Only published items appear in public directories.
- Members can access their own submissions and feedback.
- Admins can publish directly where authorized.
- Preserve revisions and moderation history.
- Send notifications when status changes.
- Validate content and media uploads on the server.

Book-listing approval must remain distinct from permission to distribute a full manuscript.

## 8. Visual Identity and UI

### Brand direction
Literary Voices Network should feel like a premium independent literary magazine combined with a contemporary digital publishing network.

### Suggested palette
- Deep ink blue.
- Charcoal.
- Warm ivory.
- Muted gold or copper.
- Natural neutral tones.

### Typography
Use an elegant editorial display typeface for headlines and a highly readable sans-serif for body text and application controls.

### Interface principles
- Strong typographic hierarchy.
- Generous whitespace.
- High-quality book imagery.
- Consistent grid layouts and spacing.
- Refined cards, borders, and hover states.
- Responsive desktop, tablet, and mobile layouts.
- Accessible focus states and reduced-motion support.

Avoid generic template styling, excessive glassmorphism, distracting animations, and decorative UI that harms usability.

## 9. Hero Background Video

Implement a cinematic, silent, seamless video loop behind the homepage hero content.

Requirements:
- H.264 MP4, optionally with WebM.
- `autoplay`, `muted`, `loop`, and `playsinline`.
- `object-fit: cover`.
- Dark gradient overlay for readable text.
- Poster image before playback.
- Mobile-specific cropping or a static fallback.
- Respect reduced-motion preferences.
- Do not autoplay audio.
- Avoid blocking the main heading while loading.
- Allow replacement of the video and poster through admin settings.

Target desktop hero height: approximately 75–90vh, with appropriate mobile sizing.

The hero headline, description, and buttons must remain separate HTML elements above the video.

## 10. Database Architecture

Use a relational database with migrations, constraints, indexes, and timestamps.

Core entities:

- `users`
- `profiles`
- `books`
- `articles`
- `categories`
- `tags`
- `content_revisions`
- `submissions`
- `broadcasts`
- `events`
- `event_registrations`
- `favourites`
- `follows`
- `pitches`
- `editorial_issues`
- `partners`
- `media_assets`
- `notifications`
- `enquiries`
- `site_settings`
- `audit_logs`

Use foreign keys and ownership rules to ensure correct attribution and secure access. Store publication status, scheduling information, and review history consistently.

## 11. Recommended Technology

Inspect the existing project before choosing or replacing technologies.

For a new implementation, use:

- Next.js and TypeScript.
- React.
- Tailwind CSS or the existing project styling system.
- PostgreSQL.
- Supabase for authentication, database, and storage, or an equivalent production-ready backend.
- Server-side authorization and validated API/action handlers.
- A maintained rich-text editor with sanitized content.
- An email delivery provider.
- Authorized audio/video integrations.
- Automated deployment and database migrations.

Choose one consistent architecture rather than combining unnecessary competing systems.

## 12. Security and Quality

- Enforce server-side permissions and row-level access policies.
- Validate all inputs.
- Sanitize rich-text content.
- Validate uploads by MIME type, size, ownership, and access.
- Use environment variables for credentials.
- Implement rate limiting, secure sessions, and account recovery.
- Protect private drafts and internal moderation notes.
- Maintain administrative audit logs.
- Provide privacy, terms, submission guidelines, and account deletion workflows.
- Support semantic HTML, keyboard navigation, and accessible forms.
- Optimize images, video delivery, page rendering, and database queries.
- Implement metadata, canonical URLs, sitemaps, and appropriate structured data.

## 13. Acceptance Criteria

The application is complete only when:

1. Visitors can browse books, authors, articles, broadcasts, and events.
2. Users can register, authenticate, and manage their profiles.
3. Authors can submit books and track review status.
4. Eligible members can create, edit, and submit original publications.
5. Editors can review, approve, reject, request revisions, and schedule content.
6. Administrators can manage the platform through a protected dashboard.
7. Administrators can publish their own work under their public LVN member profile.
8. Search, filtering, favourites, and publication URLs work with real persistent data.
9. Homepage sections can be managed without code changes.
10. The hero video loops silently and provides mobile and reduced-motion fallbacks.
11. Events display accurate dates and timezone information.
12. Broadcasts use real media integrations or clearly display an offline state.
13. Private drafts and administrative actions are protected.
14. Major user journeys pass functional and responsive tests.
15. Deployment, database setup, integrations, and environment variables are documented.

## 14. Implementation Roadmap

**Phase 1 — Foundation:** Inspect the repository, establish design tokens, database, authentication, roles, storage, and shared components.

**Phase 2 — Public website:** Implement the homepage, video hero, book and author directories, magazine, navigation, and public profiles.

**Phase 3 — Publishing:** Implement member dashboards, book submissions, article editing, moderation, and administrator publishing under a public profile.

**Phase 4 — Media and editorial:** Implement broadcasts, events, editorial calendar, newsroom, archives, and enquiries.

**Phase 5 — Production readiness:** Implement notifications, security hardening, SEO, accessibility, performance optimization, automated tests, and deployment documentation.

## 15. Instructions to Antigravity

Act as the senior full-stack engineer responsible for delivering Literary Voices Network.

1. Audit the existing repository before changing it.
2. Convert this PRD into a feature checklist.
3. Preserve working functionality.
4. Implement real backend behavior rather than static mockups.
5. Use reusable components, typed data models, database migrations, and secure authorization.
6. Distinguish seed data from production content.
7. Implement administrator publishing under a public LVN member identity as a first-class feature.
8. Run the application and test it in a browser.
9. Fix errors and verify the principal user journeys.
10. Document setup, environment variables, storage, integrations, migrations, testing, and deployment.

**Definition of done:** Literary Voices Network is a functional, deployable literary publishing platform with a premium public website, member publishing, editorial review, author discovery, media and event features, and a fully operational administrator dashboard.