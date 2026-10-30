import type { DatabaseSync } from "node:sqlite";
import { hashPassword } from "../auth/crypto";
import type { SiteSettingsMap } from "./types";

export const DEFAULT_SITE_SETTINGS: SiteSettingsMap = {
  siteName: "Literary Voices Network",
  siteAbbreviation: "LVN",
  siteTagline:
    "Where the Written Word Finds Its Voice — Contemporary Literature, Editorial Criticism & Author Broadcasts",
  announcementBarText:
    "AUTUMN LITERARY SEASON: Submissions Now Open for Issue No. 14 (‘The Architecture of Memory’) & Author Spotlight Broadcasts",
  announcementBarLink: "/editorial-calendar",
  announcementBarVisible: false,
  heroHeadline: "Where Books Come Alive On Air",
  heroSubheadline:
    "Author conversations, live readings, and literary culture — broadcast twenty-four hours a day across the network.",
  heroPrimaryCtaLabel: "Listen Live",
  heroPrimaryCtaHref: "/live",
  heroSecondaryCtaLabel: "Program Schedule",
  heroSecondaryCtaHref: "/shows",
  heroVideoUrl:
    "https://videotourl.com/videos/1792770791367-b8ab28bf-7cd3-46ef-8bf5-cba07b6375bb.mp4",
  heroPosterUrl: "/media/lvn-hero-poster.svg",
  heroOverlayOpacity: 0.68,
  logoText: "Literary Voices Network",
  primaryColorHex: "#080808",
  accentColorHex: "#D4AF37",
  editorialEmail: "enquiry@literarynetwork.org",
  pressEmail: "enquiry@literarynetwork.org",
  partnershipsEmail: "enquiry@literarynetwork.org",
  memberPublishingEnabled: true,
  liveBroadcastActive: false,
  seoDefaultTitle:
    "Literary Voices Network (LVN) — Books, Author Interviews, Digital Magazine & Literary Broadcasts",
  seoDefaultDescription:
    "Discover contemporary books, read long-form literary essays and interviews, submit original work, and tune into author broadcasts on Literary Voices Network.",
  footerCopyright:
    "© 2026 Literary Voices Network (LVN). An independent literary publication and publishing platform.",
  socialLinks: {
    instagram: "https://instagram.com/literaryvoicesnetwork",
    twitter: "https://x.com/literaryvoices",
    youtube: "https://youtube.com/@literaryvoicesnetwork",
    spotify: "https://open.spotify.com",
  },
};

export function seedDatabase(db: DatabaseSync): void {
  const existingUsers = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };

  if (existingUsers.count > 0) {
    try {
      db.prepare(
        "UPDATE site_settings SET setting_value = ? WHERE setting_key = 'heroVideoUrl' AND setting_value = ?"
      ).run(
        JSON.stringify(
          "https://videotourl.com/videos/1792770791367-b8ab28bf-7cd3-46ef-8bf5-cba07b6375bb.mp4"
        ),
        JSON.stringify("/media/lvn-hero-loop.mp4")
      );
      db.prepare(
        "UPDATE site_settings SET setting_value = ? WHERE setting_key = 'announcementBarVisible'"
      ).run(JSON.stringify(false));
    } catch {
      // Ignore if site_settings table is not yet populated
    }
    return;
  }

  const now = "2026-10-23T12:00:00.000Z";
  const defaultPasswordHash = hashPassword("LvnPass2026!");

  db.exec("BEGIN TRANSACTION");
  try {
    // -------------------------------------------------------------------------
    // 1. USERS (Admin with Public Publishing Identity, Editor, Authors, Member)
    // -------------------------------------------------------------------------
    const insertUser = db.prepare(`
      INSERT INTO users (
        id, email, password_hash, role, email_verified, account_status,
        notification_prefs_json, last_login_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 1, 'active', ?, ?, ?, ?)
    `);

    const prefs = JSON.stringify({
      emailSubmissions: true,
      emailEvents: true,
      emailNewsletter: true,
    });

    // Mandatory Administrator account with Public LVN Member/Author Identity
    insertUser.run(
      "user-admin-eleanor",
      "perrycreativity@gmail.com",
      defaultPasswordHash,
      "admin",
      prefs,
      now,
      now,
      now
    );

    // Senior Editor account
    insertUser.run(
      "user-editor-marcus",
      "editor@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "editor",
      prefs,
      now,
      now,
      now
    );

    // Published Authors
    insertUser.run(
      "user-author-amara",
      "amara.osei@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-julian",
      "julian.thorne@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-claire",
      "claire.moreau@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-soren",
      "soren.lindqvist@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    // Bestseller / Literary Authors for Verified Books
    insertUser.run(
      "user-author-jane",
      "jane.austen@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-marie",
      "marie.benedict@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-tayari",
      "tayari.jones@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-kathryn",
      "kathryn.stockett@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-charlotte",
      "charlotte.mcconaghy@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    insertUser.run(
      "user-author-caro",
      "caro.burke@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "author",
      prefs,
      now,
      now,
      now
    );

    // Registered Member / Reader
    insertUser.run(
      "user-member-nadia",
      "member@literaryvoicesnetwork.org",
      defaultPasswordHash,
      "member",
      prefs,
      now,
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 2. PROFILES (1:1 Public Member/Author Profiles)
    // -------------------------------------------------------------------------
    const insertProfile = db.prepare(`
      INSERT INTO profiles (
        id, user_id, slug, display_name, pen_name, headline, bio,
        avatar_url, banner_url, location, website_url, genres_json,
        social_links_json, is_author_profile, is_featured, is_public,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    // MANDATORY ADMINISTRATOR PUBLIC PROFILE
    insertProfile.run(
      "profile-admin-eleanor",
      "user-admin-eleanor",
      "eleanor-vance",
      "Executive Founder & CEO",
      "Founder & CEO",
      "Founding Publisher, Chief Executive Officer & Anchor at Literary Voices Network",
      "The Executive Founder & Chief Executive Officer of Literary Voices Network leads global broadcast syndication, author curation, and flagship studio dialogues across eight international hubs.",
      "/media/team/ceo.jpg",
      "/media/banners/editorial-desk.svg",
      "New York & Edinburgh",
      "https://literaryvoicesnetwork.org/authors/eleanor-vance",
      JSON.stringify(["Literary Fiction", "Essays & Criticism", "Cultural History", "Translation"]),
      JSON.stringify({
        twitter: "https://x.com/literaryvoices",
        instagram: "https://instagram.com/literaryvoicesnetwork",
        goodreads: "https://goodreads.com",
      }),
      1,
      1,
      now,
      now
    );

    // Editor Profile
    insertProfile.run(
      "profile-editor-marcus",
      "user-editor-marcus",
      "marcus-sterling",
      "Marcus Sterling",
      null,
      "Senior Commissioning Editor & Broadcast Host",
      "Marcus Sterling leads editorial moderation and long-form essay commissioning at Literary Voices Network. A former university press acquiring editor, he curates LVN's seasonal issues and hosts 'First Editions Live'.",
      "/media/avatars/marcus-sterling.svg",
      "/media/banners/editorial-desk.svg",
      "London, United Kingdom",
      "https://literaryvoicesnetwork.org/authors/marcus-sterling",
      JSON.stringify(["Essays & Criticism", "Biography & Memoir", "Poetry"]),
      JSON.stringify({ twitter: "https://x.com/marcussterling" }),
      1,
      1,
      now,
      now
    );

    // Author Profiles
    insertProfile.run(
      "profile-author-amara",
      "user-author-amara",
      "amara-osei",
      "Amara Osei",
      null,
      "Award-Winning Novelist & Essayist",
      "Amara Osei writes sweeping multigenerational fiction exploring maritime history, diaspora memory, and architectural preservation across West Africa and the Atlantic world. Her work has appeared in major literary quarterlies and has been translated into nine languages.",
      "/media/avatars/amara-osei.svg",
      "/media/banners/editorial-desk.svg",
      "Accra & Boston",
      "https://literaryvoicesnetwork.org/authors/amara-osei",
      JSON.stringify(["Literary Fiction", "Historical Fiction", "Essays & Criticism"]),
      JSON.stringify({
        instagram: "https://instagram.com/amaraosei",
        goodreads: "https://goodreads.com",
      }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-julian",
      "user-author-julian",
      "julian-thorne",
      "Julian Thorne",
      null,
      "Speculative Historian & Novelist",
      "Julian Thorne is a novelist and archivist whose fiction bridges speculative cartography, philosophy of science, and literary suspense. He lives in Chicago, where he teaches narrative structure and archival research.",
      "/media/avatars/julian-thorne.svg",
      "/media/banners/editorial-desk.svg",
      "Chicago, United States",
      "https://literaryvoicesnetwork.org/authors/julian-thorne",
      JSON.stringify(["Speculative Fiction", "Literary Fiction", "Mystery & Suspense"]),
      JSON.stringify({
        twitter: "https://x.com/julianthorne",
        goodreads: "https://goodreads.com",
      }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-claire",
      "user-author-claire",
      "claire-moreau",
      "Claire Moreau",
      null,
      "Poet, Translator & Lyric Essayist",
      "Claire Moreau is a Franco-Canadian poet and translator whose collections examine Alpine ecology, silence, and polyphonic voice. She leads LVN's monthly Translation & Poetics workshop series.",
      "/media/avatars/claire-moreau.svg",
      "/media/banners/editorial-desk.svg",
      "Montréal & Lyon",
      "https://literaryvoicesnetwork.org/authors/claire-moreau",
      JSON.stringify(["Poetry", "Essays & Criticism", "Translation"]),
      JSON.stringify({ instagram: "https://instagram.com/clairemoreau" }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-soren",
      "user-author-soren",
      "soren-lindqvist",
      "Søren Lindqvist",
      null,
      "Biographer, Cultural Critic & Non-Fiction Author",
      "Søren Lindqvist writes narrative non-fiction at the intersection of northern European industrial history, independent publishing, and civic architecture.",
      "/media/avatars/soren-lindqvist.svg",
      "/media/banners/editorial-desk.svg",
      "Copenhagen, Denmark",
      "https://literaryvoicesnetwork.org/authors/soren-lindqvist",
      JSON.stringify(["Non-Fiction", "Biography & Memoir", "History"]),
      JSON.stringify({ twitter: "https://x.com/sorenlindqvist" }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-jane",
      "user-author-jane",
      "jane-austen",
      "Jane Austen",
      null,
      "Celebrated English Novelist & Literary Pioneer",
      "Jane Austen is one of the most widely read and beloved writers in English literature, renowned for her wit, social commentary, and masterful novels of manners including Pride and Prejudice.",
      "/media/covers/pride-and-prejudice.png",
      "/media/banners/editorial-desk.svg",
      "Hampshire, United Kingdom",
      "https://literaryvoicesnetwork.org/authors/jane-austen",
      JSON.stringify(["Classic Literature", "Romance", "Historical Fiction"]),
      JSON.stringify({ goodreads: "https://www.goodreads.com/book/show/129915654-pride-and-prejudice" }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-marie",
      "user-author-marie",
      "marie-benedict",
      "Marie Benedict",
      null,
      "New York Times Bestselling Historical Novelist",
      "Marie Benedict is the bestselling author of The Queens of Crime, The Only Woman in the Room, and The Mystery of Mrs. Christie, celebrating pivotal historical women.",
      "/media/covers/the-queens-of-crime.png",
      "/media/banners/editorial-desk.svg",
      "Pittsburgh, Pennsylvania",
      "https://literaryvoicesnetwork.org/authors/marie-benedict",
      JSON.stringify(["Historical Fiction", "Mystery", "Biographical"]),
      JSON.stringify({ goodreads: "https://www.goodreads.com/book/show/211003830-the-queens-of-crime" }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-tayari",
      "user-author-tayari",
      "tayari-jones",
      "Tayari Jones",
      null,
      "Bestselling Author of An American Marriage & Kin",
      "Tayari Jones is the New York Times bestselling author of four novels, including An American Marriage and Kin, exploring family, loyalty, and deep generational bonds.",
      "/media/covers/kin.svg",
      "/media/banners/editorial-desk.svg",
      "Atlanta, Georgia",
      "https://literaryvoicesnetwork.org/authors/tayari-jones",
      JSON.stringify(["Literary Fiction", "Family Saga", "Contemporary"]),
      JSON.stringify({ goodreads: "https://www.goodreads.com/search?q=Kin+Tayari+Jones" }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-kathryn",
      "user-author-kathryn",
      "kathryn-stockett",
      "Kathryn Stockett",
      null,
      "Acclaimed Author of The Help & The Calamity Club",
      "Kathryn Stockett was born and raised in Jackson, Mississippi. Her novels explore intimate human relationships, community bonds, and transformative resilience.",
      "/media/covers/the-calamity-club.svg",
      "/media/banners/editorial-desk.svg",
      "Jackson, Mississippi",
      "https://literaryvoicesnetwork.org/authors/kathryn-stockett",
      JSON.stringify(["Historical Fiction", "Southern Fiction", "Drama"]),
      JSON.stringify({ goodreads: "https://www.goodreads.com/search?q=The+Calamity+Club+Kathryn+Stockett" }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-charlotte",
      "user-author-charlotte",
      "charlotte-mcconaghy",
      "Charlotte McConaghy",
      null,
      "International Bestselling Author of Migrations & Wild Dark Shore",
      "Charlotte McConaghy is an Australian author whose fiction delves into the natural world, climate, and deep human resilience.",
      "/media/covers/wild-dark-shore.svg",
      "/media/banners/editorial-desk.svg",
      "Sydney, Australia",
      "https://literaryvoicesnetwork.org/authors/charlotte-mcconaghy",
      JSON.stringify(["Literary Fiction", "Adventure", "Nature"]),
      JSON.stringify({ goodreads: "https://www.goodreads.com/search?q=Wild+Dark+Shore+Charlotte+McConaghy" }),
      1,
      1,
      now,
      now
    );

    insertProfile.run(
      "profile-author-caro",
      "user-author-caro",
      "caro-claire-burke",
      "Caro Claire Burke",
      null,
      "Author & Cultural Essayist",
      "Caro Claire Burke writes evocative fiction touching upon memory, time, and hidden family histories across the American landscape.",
      "/media/covers/yesteryear.svg",
      "/media/banners/editorial-desk.svg",
      "New York, New York",
      "https://literaryvoicesnetwork.org/authors/caro-claire-burke",
      JSON.stringify(["Historical Fiction", "Mystery", "Time Travel"]),
      JSON.stringify({ goodreads: "https://www.goodreads.com/search?q=Yesteryear+Caro+Claire+Burke" }),
      1,
      1,
      now,
      now
    );

    // Member Profile
    insertProfile.run(
      "profile-member-nadia",
      "user-member-nadia",
      "nadia-khoury",
      "Nadia Khoury",
      null,
      "Literary Reader, Book Club Coordinator & Emerging Essayist",
      "Avid reader of translated fiction, independent press releases, and contemporary essays.",
      "/media/avatars/nadia-khoury.svg",
      "/media/banners/editorial-desk.svg",
      "Toronto, Canada",
      "",
      JSON.stringify(["Literary Fiction", "Translation", "Essays & Criticism"]),
      JSON.stringify({}),
      0,
      0,
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 3. CATEGORIES & TAGS
    // -------------------------------------------------------------------------
    const insertCategory = db.prepare(`
      INSERT INTO categories (id, slug, name, description, category_scope, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const categoriesData = [
      ["cat-cover-stories", "cover-stories", "Cover Stories", "Flagship long-form investigations and literary features.", "magazine", 1],
      ["cat-interviews", "author-interviews", "Author Interviews", "In-depth conversations with novelists, poets, translators, and publishers.", "magazine", 2],
      ["cat-reviews", "book-reviews", "Book Reviews", "Rigorous critical assessments of new and notable releases.", "magazine", 3],
      ["cat-essays", "essays-commentary", "Essays & Commentary", "Original literary essays, cultural criticism, and craft reflections.", "magazine", 4],
      ["cat-resources", "publishing-resources", "Publishing Resources", "Practical guides on independent publishing, contracts, and editorial craft.", "magazine", 5],
      ["cat-culture", "literary-culture", "Literary Culture", "Dispatches from festivals, archives, bookshops, and reading rooms.", "magazine", 6],
      ["cat-spotlights", "author-spotlights", "Author Spotlights", "Profiles of emerging and established voices across the network.", "magazine", 7],
      ["cat-announcements", "editorial-announcements", "Editorial Announcements", "Issue calls, prize shortlists, and network updates.", "both", 8],
      ["cat-press", "press-releases", "Press Releases", "Official newsroom releases, book launch notices, and media advisories.", "press", 9],
    ] as const;

    for (const [id, slug, name, desc, scope, order] of categoriesData) {
      insertCategory.run(id, slug, name, desc, scope, order, now, now);
    }

    const insertTag = db.prepare(`
      INSERT INTO tags (id, slug, name, created_at) VALUES (?, ?, ?, ?)
    `);
    const tagsData = [
      ["tag-1", "literary-fiction", "Literary Fiction"],
      ["tag-2", "archival-memory", "Archival Memory"],
      ["tag-3", "translation", "Translation"],
      ["tag-4", "independent-press", "Independent Press"],
      ["tag-5", "craft-of-writing", "Craft of Writing"],
      ["tag-6", "debut-novels", "Debut Novels"],
      ["tag-7", "poetics", "Poetics"],
      ["tag-8", "narrative-nonfiction", "Narrative Non-Fiction"],
    ];
    for (const [id, slug, name] of tagsData) {
      insertTag.run(id, slug, name, now);
    }

    // -------------------------------------------------------------------------
    // 4. EDITORIAL ISSUES
    // -------------------------------------------------------------------------
    const insertIssue = db.prepare(`
      INSERT INTO editorial_issues (
        id, slug, issue_number, title, theme, description, cover_url,
        submission_deadline, publication_date, submission_window_open,
        status, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertIssue.run(
      "issue-13",
      "issue-13-cartographies-of-voice",
      13,
      "Issue No. 13 — Cartographies of Voice",
      "Place, Polyphony & the Contemporary Novel",
      "Our Autumn 2026 issue examines how contemporary writers map vanishing coastlines, multilingual cities, and interior landscapes.",
      "/media/covers/issue-13.svg",
      "2026-09-15T23:59:59.000Z",
      "2026-10-01T09:00:00.000Z",
      0,
      "published",
      "user-admin-eleanor",
      now,
      now
    );

    insertIssue.run(
      "issue-14",
      "issue-14-the-architecture-of-memory",
      14,
      "Issue No. 14 — The Architecture of Memory",
      "Archives, Inheritance & Unreliable Histories",
      "Now open for pitches and member submissions: essays, short fiction, reviews, and interview proposals exploring what survives in private letters, libraries, and oral traditions.",
      "/media/covers/issue-14.svg",
      "2026-11-30T23:59:59.000Z",
      "2026-12-15T09:00:00.000Z",
      1,
      "open_for_submissions",
      "user-admin-eleanor",
      now,
      now
    );

    insertIssue.run(
      "issue-15",
      "issue-15-languages-in-transit",
      15,
      "Issue No. 15 — Languages in Transit",
      "World Literature, Translation & Borderless Poetics",
      "Our Winter 2027 issue dedicated to literature in translation, bilingual editions, and conversations with literary translators.",
      "/media/covers/issue-15.svg",
      "2027-01-25T23:59:59.000Z",
      "2027-02-15T09:00:00.000Z",
      1,
      "planned",
      "user-editor-marcus",
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 5. BOOKS (Including Administrator's Own Published Book + Member/Author Books)
    // -------------------------------------------------------------------------
    const insertBook = db.prepare(`
      INSERT INTO books (
        id, slug, author_profile_id, submitted_by_user_id, title, subtitle,
        isbn, description, excerpt, cover_url, genre, secondary_genres_json,
        format, publisher, publication_date, page_count, language,
        retailer_links_json, manuscript_distribution_authorized, full_manuscript_url,
        is_featured, editorial_recommendation, is_community_member_book,
        status, scheduled_for, published_at, seo_title, seo_description,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // =========================================================================
    // FEATURED BESTSELLERS & VERIFIED BOOKS (Match Homepage 3D Shelf & Directory)
    // =========================================================================

    // 1. Pride and Prejudice by Jane Austen
    insertBook.run(
      "book-pride-and-prejudice",
      "pride-and-prejudice",
      "profile-author-jane",
      "user-author-jane",
      "Pride and Prejudice",
      "A Novel of Manners, Society, and Enduring Romance",
      "978-0-141439-51-8",
      "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen called this brilliant work 'her own darling child' and its vivacious heroine, Elizabeth Bennet, 'as delightful a creature as ever appeared in print.' The romantic clash between the opinionated Elizabeth and her proud beau, Mr. Darcy, is a splendid performance of civilized sparring.",
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
      "/media/covers/pride-and-prejudice.png",
      "Classic Literature",
      JSON.stringify(["Romance", "Historical Fiction"]),
      "Hardcover",
      "Penguin Classics",
      "1813-01-28",
      432,
      "English",
      JSON.stringify({
        amazon: "https://www.amazon.com/s?k=Pride+and+Prejudice+Jane+Austen",
        goodreads: "https://www.goodreads.com/book/show/129915654-pride-and-prejudice",
        bookshop: "https://bookshop.org/search?keywords=Pride+and+Prejudice",
        audible: "https://www.audible.com/search?keywords=Pride+and+Prejudice",
      }),
      1,
      "/media/excerpts/the-glass-meridian-sample.pdf",
      1,
      1,
      1,
      "published",
      null,
      "2026-10-30T12:00:00.000Z",
      "Pride and Prejudice by Jane Austen | Literary Voices Network",
      "Discover Jane Austen's timeless masterpiece Pride and Prejudice on Literary Voices Network.",
      now,
      now
    );

    // 2. The Queens of Crime by Marie Benedict
    insertBook.run(
      "book-the-queens-of-crime",
      "the-queens-of-crime",
      "profile-author-marie",
      "user-author-marie",
      "The Queens of Crime",
      "The Explosive Story of the Women of the Golden Age of Detective Fiction",
      "978-1-492697-88-6",
      "From New York Times bestselling author Marie Benedict comes the explosive story of the real-life women behind the Golden Age of detective fiction—including Agatha Christie, Dorothy L. Sayers, Ngaio Marsh, and Margery Allingham—who formed a secret society and united to write a new chapter in literary history.",
      "The drawing room on Soho Square was thick with the scent of pipe tobacco and damp tweed, but when the four of us locked the door against Fleet Street, we held the entire architecture of twentieth-century mystery in our hands.",
      "/media/covers/the-queens-of-crime.png",
      "Historical Fiction",
      JSON.stringify(["Mystery", "Biographical Fiction"]),
      "Hardcover",
      "Sourcebooks Landmark",
      "2024-10-08",
      368,
      "English",
      JSON.stringify({
        amazon: "https://www.amazon.com/s?k=The+Queens+of+Crime+Marie+Benedict",
        goodreads: "https://www.goodreads.com/book/show/211003830-the-queens-of-crime",
        bookshop: "https://bookshop.org/search?keywords=The+Queens+of+Crime+Marie+Benedict",
        audible: "https://www.audible.com/search?keywords=The+Queens+of+Crime+Marie+Benedict",
      }),
      1,
      "/media/excerpts/the-glass-meridian-sample.pdf",
      1,
      1,
      1,
      "published",
      null,
      "2026-10-29T12:00:00.000Z",
      "The Queens of Crime by Marie Benedict | Literary Voices Network",
      "Read about The Queens of Crime by Marie Benedict on Literary Voices Network.",
      now,
      now
    );

    // 3. Kin by Tayari Jones
    insertBook.run(
      "book-kin",
      "kin",
      "profile-author-tayari",
      "user-author-tayari",
      "Kin",
      "A Gripping Saga of Family, Ties, and Inheritance",
      "978-1-616208-89-9",
      "From the bestselling author of An American Marriage, an emotionally gripping narrative exploring family loyalty, inheritance, and the fragile ties that bind us across generations.",
      "Every family preserves one story told only in whispers on Sunday evenings, the kind that survives every move and every fire, refusing to stay buried in the Atlanta red clay.",
      "/media/covers/kin.svg",
      "Literary Fiction",
      JSON.stringify(["Family Saga", "Contemporary"]),
      "Hardcover",
      "Algonquin Books",
      "2026-03-15",
      352,
      "English",
      JSON.stringify({
        amazon: "https://www.amazon.com/s?k=Kin+Tayari+Jones",
        goodreads: "https://www.goodreads.com/search?q=Kin+Tayari+Jones",
        bookshop: "https://bookshop.org/search?keywords=Kin+Tayari+Jones",
        audible: "https://www.audible.com/search?keywords=Kin+Tayari+Jones",
      }),
      1,
      "/media/excerpts/the-glass-meridian-sample.pdf",
      1,
      1,
      1,
      "published",
      null,
      "2026-10-28T12:00:00.000Z",
      "Kin by Tayari Jones | Literary Voices Network",
      "Explore Kin by Tayari Jones on Literary Voices Network.",
      now,
      now
    );

    // 4. The Calamity Club by Kathryn Stockett
    insertBook.run(
      "book-the-calamity-club",
      "the-calamity-club",
      "profile-author-kathryn",
      "user-author-kathryn",
      "The Calamity Club",
      "A Mid-Century Tale of Friendship, Resilience, and Upheaval",
      "978-0-399155-34-5",
      "A compelling drama of friendship, ambition, and resilience among four women confronting personal and societal upheaval in the mid-century American South.",
      "We convened every Thursday behind the parish library, ostensibly to discuss garden arrangements, but in truth to plan how each of us would rewrite the boundaries of our lives.",
      "/media/covers/the-calamity-club.svg",
      "Historical Fiction",
      JSON.stringify(["Southern Fiction", "Drama"]),
      "Hardcover",
      "Putnam",
      "2026-04-10",
      384,
      "English",
      JSON.stringify({
        amazon: "https://www.amazon.com/s?k=The+Calamity+Club+Kathryn+Stockett",
        goodreads: "https://www.goodreads.com/search?q=The+Calamity+Club+Kathryn+Stockett",
        bookshop: "https://bookshop.org/search?keywords=The+Calamity+Club+Kathryn+Stockett",
        audible: "https://www.audible.com/search?keywords=The+Calamity+Club+Kathryn+Stockett",
      }),
      1,
      "/media/excerpts/the-glass-meridian-sample.pdf",
      1,
      1,
      1,
      "published",
      null,
      "2026-10-27T12:00:00.000Z",
      "The Calamity Club by Kathryn Stockett | Literary Voices Network",
      "Read The Calamity Club by Kathryn Stockett on Literary Voices Network.",
      now,
      now
    );

    // 5. Wild Dark Shore by Charlotte McConaghy
    insertBook.run(
      "book-wild-dark-shore",
      "wild-dark-shore",
      "profile-author-charlotte",
      "user-author-charlotte",
      "Wild Dark Shore",
      "An Odyssey of Survival, Sea, and Resilience",
      "978-1-250805-44-2",
      "A breathtaking story of survival and hope set along the rugged coastlines of the southern hemisphere, investigating nature, grief, and human endurance.",
      "The wind off the Southern Ocean does not merely blow; it strips every illusion bare until only stone, salt, and the rhythm of your own heart remain.",
      "/media/covers/wild-dark-shore.svg",
      "Literary Fiction",
      JSON.stringify(["Adventure", "Nature"]),
      "Hardcover",
      "Flatiron Books",
      "2026-05-20",
      336,
      "English",
      JSON.stringify({
        amazon: "https://www.amazon.com/s?k=Wild+Dark+Shore+Charlotte+McConaghy",
        goodreads: "https://www.goodreads.com/search?q=Wild+Dark+Shore+Charlotte+McConaghy",
        bookshop: "https://bookshop.org/search?keywords=Wild+Dark+Shore+Charlotte+McConaghy",
        audible: "https://www.audible.com/search?keywords=Wild+Dark+Shore+Charlotte+McConaghy",
      }),
      1,
      "/media/excerpts/the-glass-meridian-sample.pdf",
      1,
      1,
      1,
      "published",
      null,
      "2026-10-26T12:00:00.000Z",
      "Wild Dark Shore by Charlotte McConaghy | Literary Voices Network",
      "Discover Wild Dark Shore by Charlotte McConaghy on Literary Voices Network.",
      now,
      now
    );

    // 6. Yesteryear by Caro Claire Burke
    insertBook.run(
      "book-yesteryear",
      "yesteryear",
      "profile-author-caro",
      "user-author-caro",
      "Yesteryear",
      "A Journey Through Time, Memory, and Forgotten Sanctuaries",
      "978-1-982189-12-3",
      "An evocative journey through time, memory, and forgotten places, weaving intimate domestic history with the transformative pull of the modern era.",
      "Time in the mountain hollow had its own geography; shadows didn't just mark the hour, they recalled every voice that had ever spoken across the ridge.",
      "/media/covers/yesteryear.svg",
      "Historical Fiction",
      JSON.stringify(["Mystery", "Time Travel"]),
      "Paperback",
      "Atria Books",
      "2026-06-01",
      320,
      "English",
      JSON.stringify({
        amazon: "https://www.amazon.com/s?k=Yesteryear+Caro+Claire+Burke",
        goodreads: "https://www.goodreads.com/search?q=Yesteryear+Caro+Claire+Burke",
        bookshop: "https://bookshop.org/search?keywords=Yesteryear+Caro+Claire+Burke",
        audible: "https://www.audible.com/search?keywords=Yesteryear+Caro+Claire+Burke",
      }),
      1,
      "/media/excerpts/the-glass-meridian-sample.pdf",
      1,
      1,
      1,
      "published",
      null,
      "2026-10-25T12:00:00.000Z",
      "Yesteryear by Caro Claire Burke | Literary Voices Network",
      "Discover Yesteryear by Caro Claire Burke on Literary Voices Network.",
      now,
      now
    );

    // Book 7: Authored & Published by Administrator Executive Founder & CEO under her public LVN profile
    insertBook.run(
      "book-glass-meridian",
      "the-glass-meridian",
      "profile-admin-eleanor",
      "user-admin-eleanor",
      "The Glass Meridian",
      "A Novel of Cartography, Letters, and the North Sea",
      "978-1-960421-01-2",
      "Set between an observatory in 1920s Edinburgh and a present-day maritime archive in Bergen, The Glass Meridian follows two women separated by a century who attempt to reconstruct a missing hydrographic atlas—and the private correspondence hidden inside its bindings.",
      "In the winter of 1924, the meridian glass cracked cleanly from north to south, dividing the harbour into two unequal halves of slate-colored water. No one in the charting room spoke of it until the letters arrived from Ostend.",
      "/media/covers/the-glass-meridian.svg",
      "Literary Fiction",
      JSON.stringify(["Historical Fiction", "Mystery & Suspense"]),
      "Hardcover",
      "Meridian House Press",
      "2026-09-10",
      368,
      "English",
      JSON.stringify({
        bookshop: "https://bookshop.org",
        amazon: "https://amazon.com",
        barnesAndNoble: "https://barnesandnoble.com",
        goodreads: "https://goodreads.com",
        audible: "https://audible.com",
      }),
      1,
      "/media/excerpts/the-glass-meridian-sample.pdf",
      1,
      1,
      1,
      "published",
      null,
      "2026-09-10T10:00:00.000Z",
      "The Glass Meridian by Executive Founder & CEO | Literary Voices Network",
      "Discover The Glass Meridian, a novel of cartography and archival memory by Executive Founder & CEO.",
      now,
      now
    );

    // Book 2: Amara Osei
    insertBook.run(
      "book-saltwater-ledger",
      "the-saltwater-ledger",
      "profile-author-amara",
      "user-author-amara",
      "The Saltwater Ledger",
      "Three Generations Along the Gold Coast",
      "978-1-960421-08-1",
      "Spanning eighty years in a coastal trading house turned independent printing press, The Saltwater Ledger traces how a family's handwritten shipping registers become the foundation for a clandestine literary movement.",
      "Every ship that crossed the bar left two records: one for the customs house in ink that faded by August, and another in my grandmother's indigo ledger wrapped in oiled cloth.",
      "/media/covers/the-saltwater-ledger.svg",
      "Historical Fiction",
      JSON.stringify(["Literary Fiction", "Family Saga"]),
      "Hardcover",
      "Harbour & Loom",
      "2026-10-02",
      412,
      "English",
      JSON.stringify({
        bookshop: "https://bookshop.org",
        amazon: "https://amazon.com",
        barnesAndNoble: "https://barnesandnoble.com",
        goodreads: "https://goodreads.com",
        kobo: "https://kobo.com",
      }),
      0,
      "",
      1,
      1,
      1,
      "published",
      null,
      "2026-10-02T12:00:00.000Z",
      "The Saltwater Ledger by Amara Osei | Literary Voices Network",
      "Read about The Saltwater Ledger by Amara Osei on Literary Voices Network.",
      now,
      now
    );

    // Book 3: Julian Thorne
    insertBook.run(
      "book-atlas-of-quiet-cities",
      "atlas-of-quiet-cities",
      "profile-author-julian",
      "user-author-julian",
      "Atlas of Quiet Cities",
      "Dispatches from Unmapped Municipalities",
      "978-1-960421-14-2",
      "Part speculative novel, part architectural mystery, Atlas of Quiet Cities follows an acoustic restorer hired to catalog the ambient soundscapes of seven civic buildings scheduled for demolition.",
      "To measure the reverberation of an empty reading room, you must first wait for the heating pipes to forget the afternoon.",
      "/media/covers/atlas-of-quiet-cities.svg",
      "Speculative Fiction",
      JSON.stringify(["Literary Fiction", "Architecture"]),
      "Paperback",
      "Northlight Editions",
      "2026-08-18",
      296,
      "English",
      JSON.stringify({
        bookshop: "https://bookshop.org",
        amazon: "https://amazon.com",
        appleBooks: "https://apple.com/apple-books",
        goodreads: "https://goodreads.com",
      }),
      0,
      "",
      1,
      1,
      1,
      "published",
      null,
      "2026-08-18T14:00:00.000Z",
      "Atlas of Quiet Cities by Julian Thorne | Literary Voices Network",
      "Explore Atlas of Quiet Cities by Julian Thorne.",
      now,
      now
    );

    // Book 4: Claire Moreau
    insertBook.run(
      "book-winter-harmonics",
      "winter-harmonics",
      "profile-author-claire",
      "user-author-claire",
      "Winter Harmonics",
      "Poems & Lyric Sequences in Two Languages",
      "978-1-960421-22-7",
      "A luminous collection of poems and lyric essays exploring high-altitude glaciers, acoustic echoes, and the ethics of translating endangered dialects.",
      "Between one snowfield and its name in the valley patois lies a bridge of seven syllables no dictionary has ever weighted.",
      "/media/covers/winter-harmonics.svg",
      "Poetry",
      JSON.stringify(["Translation", "Essays & Criticism"]),
      "Paperback",
      "Atelier Boréal",
      "2026-09-25",
      164,
      "English / French",
      JSON.stringify({
        bookshop: "https://bookshop.org",
        amazon: "https://amazon.com",
        goodreads: "https://goodreads.com",
      }),
      0,
      "",
      0,
      1,
      1,
      "published",
      null,
      "2026-09-25T09:00:00.000Z",
      "Winter Harmonics by Claire Moreau | Literary Voices Network",
      "Discover Winter Harmonics, poems and lyric sequences by Claire Moreau.",
      now,
      now
    );

    // Book 5: Søren Lindqvist
    insertBook.run(
      "book-republic-of-typesetters",
      "the-republic-of-typesetters",
      "profile-author-soren",
      "user-author-soren",
      "The Republic of Typesetters",
      "How Independent Pamphleteers Shaped Modern Nordic Letters",
      "978-1-960421-31-9",
      "A sweeping narrative history of nineteenth- and twentieth-century small presses, cooperative printshops, and the authors who operated their own lead-type machines.",
      "Before a single Manifesto of the New Prose was debated in the university halls of Uppsala, it had already been set by hand in a cellar smelling of linseed oil and cold coffee.",
      "/media/covers/republic-of-typesetters.svg",
      "Non-Fiction",
      JSON.stringify(["History", "Biography & Memoir"]),
      "Hardcover",
      "Fjord & Folio Press",
      "2026-10-12",
      440,
      "English",
      JSON.stringify({
        bookshop: "https://bookshop.org",
        amazon: "https://amazon.com",
        barnesAndNoble: "https://barnesandnoble.com",
        audible: "https://audible.com",
      }),
      0,
      "",
      1,
      0,
      1,
      "published",
      null,
      "2026-10-12T11:00:00.000Z",
      "The Republic of Typesetters by Søren Lindqvist | Literary Voices Network",
      "A narrative history of independent presses by Søren Lindqvist.",
      now,
      now
    );

    // Book 6: Pending submission from Julian Thorne (for Editor/Admin Moderation Queue testing)
    insertBook.run(
      "book-nocturne-for-observatories",
      "nocturne-for-observatories",
      "profile-author-julian",
      "user-author-julian",
      "Nocturne for Observatories",
      "Collected Short Fiction",
      "978-1-960421-49-4",
      "Nine interconnected stories following night-shift astronomers, radio operators, and lighthouse keepers across the Great Lakes.",
      "At 03:14 CST, the telescope dome rotated four degrees toward the lakefront fog.",
      "/media/covers/atlas-of-quiet-cities.svg",
      "Literary Fiction",
      JSON.stringify(["Short Stories"]),
      "Hardcover",
      "Northlight Editions",
      "2027-01-15",
      248,
      "English",
      JSON.stringify({ bookshop: "https://bookshop.org" }),
      0,
      "",
      0,
      0,
      1,
      "submitted",
      null,
      null,
      "",
      "",
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 6. ARTICLES (Magazine Stories, Interviews, Reviews, Essays, Press Releases)
    //    Including Articles Authored by Administrator Executive Founder & CEO
    // -------------------------------------------------------------------------
    const insertArticle = db.prepare(`
      INSERT INTO articles (
        id, slug, author_profile_id, created_by_user_id, category_id, issue_id,
        related_book_id, featured_author_profile_id, article_type, title, subtitle,
        excerpt, body_html, cover_url, reading_time_minutes, source_attribution,
        media_contact_info, is_featured, is_cover_story, status, scheduled_for,
        published_at, seo_title, seo_description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Article 1: Cover Story by Administrator Executive Founder & CEO
    insertArticle.run(
      "art-architecture-of-sentence",
      "the-architecture-of-the-unhurried-sentence",
      "profile-admin-eleanor",
      "user-admin-eleanor",
      "cat-cover-stories",
      "issue-13",
      "book-glass-meridian",
      "profile-admin-eleanor",
      "cover_story",
      "The Architecture of the Unhurried Sentence",
      "Why contemporary novelists are returning to archival notebooks, long cadence, and documentary form",
      "In an era of algorithmic brevity, a new generation of novelists and essayists is reclaiming slow syntax, marginalia, and historical documents as instruments of emotional precision.",
      `<p class="lead">Across small presses and major literary houses alike, something unmistakable is shifting in the rhythm of contemporary prose. Where the previous decade prized compression and clipped detachment, today’s most vital novels are unafraid of subordinate clauses, archival digressions, and the patient accumulation of material detail.</p>
<h2>The Return of the Ledger and the Letter</h2>
<p>When we examine recent works of historical and speculative fiction, we repeatedly encounter the physical artifacts of record-keeping: harbour registries, botanical field notes, hydrographic charts, and margin-marked translations. Far from mere period decoration, these forms allow writers to interrogate <em>who</em> holds the pen when history is summarized.</p>
<blockquote>“A sentence that remembers its own history refuses to flatten the past into a slogan. It invites the reader to inhabit the uncertainty of the archive.”</blockquote>
<h2>Listening to Cadence in the Broadcast Studio</h2>
<p>At Literary Voices Network, hearing authors read their work aloud on air has reinforced a classic editorial truth: prose written with an ear for breath and cadence carries an unmistakable authority. Whether in a three-hundred-page novel or a two-thousand-word critical essay, the unhurried sentence gives thought room to turn corners.</p>
<p>As we open submissions for Issue No. 14, <em>The Architecture of Memory</em>, we invite members, authors, and critics to share work that honors both intellectual rigor and musicality of voice.</p>`,
      "/media/covers/issue-13.svg",
      8,
      "Literary Voices Network Magazine · Issue No. 13",
      "",
      1,
      1,
      "published",
      null,
      "2026-10-05T09:00:00.000Z",
      "The Architecture of the Unhurried Sentence — Executive Founder & CEO | LVN Magazine",
      "Executive Founder & CEO explores why contemporary novelists are returning to archival form and deliberate cadence.",
      now,
      now
    );

    // Article 2: Author Interview by Administrator Executive Founder & CEO with Amara Osei
    insertArticle.run(
      "art-interview-amara-osei",
      "in-conversation-amara-osei-on-the-saltwater-ledger",
      "profile-admin-eleanor",
      "user-admin-eleanor",
      "cat-interviews",
      "issue-13",
      "book-saltwater-ledger",
      "profile-author-amara",
      "interview",
      "In Conversation: Amara Osei on ‘The Saltwater Ledger’ and Maritime Memory",
      "The novelist speaks with Executive Founder & CEO about customhouse archives, oral genealogy, and building a printing press in fiction",
      "Amara Osei discusses the five years of archival research behind her new novel, the discipline of polyphonic narration, and why independent presses remain central to literary culture.",
      `<p class="lead">Shortly after the publication of <em>The Saltwater Ledger</em>, novelist Amara Osei joined Founding Publisher Executive Founder & CEO in the LVN studio to discuss how a nineteenth-century shipping register inspired her most ambitious book to date.</p>
<h2>On Discovering the First Ledger</h2>
<p><strong>Executive Founder & CEO:</strong> <em>The Saltwater Ledger</em> begins not with a human character, but with a bound volume of indigo-dyed rag paper. Where did that image originate?</p>
<p><strong>Amara Osei:</strong> Five years ago, while researching coastal trade routes in Accra and Liverpool, I came across a clerk’s ledger where the official cargo tallies occupied the recto pages, while the verso pages had been used thirty years later by the clerk’s granddaughter to draft poems and political broadsides. That dialogue across generations inside a single physical object became the spine of the novel.</p>
<blockquote>“Paper remembers what official monuments are designed to omit. Once a family acquires a printing press, their private griefs and public arguments acquire permanence.”</blockquote>
<h2>On Voice and Pacing</h2>
<p><strong>Executive Founder & CEO:</strong> The novel moves across three distinct eras—1912, 1957, and 1994. How did you differentiate those voices without losing narrative momentum?</p>
<p><strong>Amara Osei:</strong> I read every chapter aloud before revising. Each generation has its own acoustic signature: the measured epistolary cadence of 1912, the urgent pamphlet-inflected syntax of the 1950s, and the reflective scholarly voice of the 1990s.</p>`,
      "/media/covers/the-saltwater-ledger.svg",
      7,
      "Literary Voices Network Interviews",
      "",
      1,
      0,
      "published",
      null,
      "2026-10-08T11:00:00.000Z",
      "In Conversation: Amara Osei on The Saltwater Ledger | LVN",
      "Executive Founder & CEO interviews novelist Amara Osei on maritime archives and multigenerational fiction.",
      now,
      now
    );

    // Article 3: Book Review by Marcus Sterling
    insertArticle.run(
      "art-review-atlas-quiet-cities",
      "review-listening-to-vanishing-rooms-in-julian-thornes-atlas-of-quiet-cities",
      "profile-editor-marcus",
      "user-editor-marcus",
      "cat-reviews",
      "issue-13",
      "book-atlas-of-quiet-cities",
      "profile-author-julian",
      "review",
      "Listening to Vanishing Rooms: Julian Thorne’s ‘Atlas of Quiet Cities’",
      "A review of Northlight Editions’ haunting novel of acoustic restoration and civic memory",
      "Julian Thorne’s third novel turns architectural preservation into a metaphysical inquiry into how cities remember their inhabitants.",
      `<p class="lead">Few contemporary novelists write about physical space with the tactile precision of Julian Thorne. In <em>Atlas of Quiet Cities</em>, he introduces us to Martin Vale, an acoustic engineer commissioned to record the impulse responses of seven municipal reading rooms and concert halls before their demolition.</p>
<h2>A Cartography of Resonance</h2>
<p>Rather than treating architecture as a static backdrop, Thorne treats every timber truss and plaster dome as an instrument that has absorbed decades of human speech. When Vale discovers anomalies in the recordings—intervals of silence that do not match the geometry of the rooms—the novel deftly pivots from realist character study into philosophical suspense.</p>
<blockquote>“Thorne’s triumph is that he never forces the metaphor. The technical vocabulary of acoustics becomes a deeply humane language for grief and endurance.”</blockquote>
<p>Essential reading for admirers of W. G. Sebald, Italo Calvino, and precision-crafted speculative prose.</p>`,
      "/media/covers/atlas-of-quiet-cities.svg",
      6,
      "Literary Voices Network Book Reviews",
      "",
      1,
      0,
      "published",
      null,
      "2026-10-11T10:00:00.000Z",
      "Book Review: Atlas of Quiet Cities by Julian Thorne | LVN",
      "Marcus Sterling reviews Julian Thorne's Atlas of Quiet Cities.",
      now,
      now
    );

    // Article 4: Essay on Translation by Claire Moreau
    insertArticle.run(
      "art-essay-fidelity-and-echo",
      "fidelity-and-echo-notes-on-translating-lyric-silence",
      "profile-author-claire",
      "user-author-claire",
      "cat-essays",
      "issue-13",
      "book-winter-harmonics",
      "profile-author-claire",
      "essay",
      "Fidelity and Echo: Notes on Translating Lyric Silence",
      "What happens in the white space between two languages when a poem crosses a mountain border?",
      "Poet and translator Claire Moreau reflects on bilingual editions, acoustic fidelity, and the words that resist dictionary equivalence.",
      `<p class="lead">Every translator knows the temptation to over-explain. Confronted with a dialect noun that designates both the first frost on larch needles and the silence that follows an avalanche, the dutiful translator reaches for an adjective. The poet, however, reaches for cadence.</p>
<h2>The Bilingual Page as Dialogue</h2>
<p>When we print a poem en face—original on the left, translation on the right—the gutter of the book ceases to be a boundary and becomes a resonant chamber. Readers whose eyes travel across both pages experience a third poem: the interval between two ways of attending to the world.</p>`,
      "/media/covers/winter-harmonics.svg",
      5,
      "Literary Voices Network Essays",
      "",
      0,
      0,
      "published",
      null,
      "2026-10-14T15:00:00.000Z",
      "Fidelity and Echo: Notes on Translating Lyric Silence — Claire Moreau | LVN",
      "Claire Moreau on poetry translation and bilingual editions.",
      now,
      now
    );

    // Article 5: Author Spotlight by Marcus Sterling on Søren Lindqvist
    insertArticle.run(
      "art-spotlight-soren-lindqvist",
      "author-spotlight-soren-lindqvist-and-the-craft-of-the-independent-press",
      "profile-editor-marcus",
      "user-editor-marcus",
      "cat-spotlights",
      "issue-13",
      "book-republic-of-typesetters",
      "profile-author-soren",
      "spotlight",
      "Author Spotlight: Søren Lindqvist on the Living Legacy of Small Presses",
      "Inside the Copenhagen archives that inspired ‘The Republic of Typesetters’",
      "Historian and biographer Søren Lindqvist takes us inside the cooperative printshops that nurtured Nordic literature.",
      `<p class="lead">For over a decade, Søren Lindqvist has cataloged the letters, type specimens, and subscription ledgers of independent Scandinavian publishing houses. His new book, <em>The Republic of Typesetters</em>, restores the compositors and printers themselves to the center of literary history.</p>
<p>“We often speak of literary movements as if books materialized out of pure conversation in cafés,” Lindqvist notes. “In reality, every avant-garde quarterly depended on someone who knew how to justify a line of lead type at midnight.”</p>`,
      "/media/covers/republic-of-typesetters.svg",
      5,
      "Literary Voices Network Spotlights",
      "",
      1,
      0,
      "published",
      null,
      "2026-10-16T12:00:00.000Z",
      "Author Spotlight: Søren Lindqvist | Literary Voices Network",
      "Profile of biographer and historian Søren Lindqvist.",
      now,
      now
    );

    // Article 6: Publishing Resource
    insertArticle.run(
      "art-resource-preparing-book-submission",
      "a-working-authors-guide-to-metadata-isbns-and-editorial-pitches",
      "profile-admin-eleanor",
      "user-admin-eleanor",
      "cat-resources",
      "issue-13",
      null,
      null,
      "resource",
      "A Working Author’s Guide to Book Metadata, ISBNs, and Editorial Pitches",
      "How to prepare your book listing, press kit, and broadcast pitch for maximum discoverability",
      "Practical editorial guidance from the LVN publishing desk on crafting Jacket copy, organizing edition metadata, and pitching literary interviews.",
      `<p class="lead">Whether you are publishing through an established university or trade press or stewarding your own independent imprint, the clarity of your bibliographic metadata determines how librarians, booksellers, editors, and readers encounter your work.</p>
<h2>1. Precision in Synopsis and Excerpts</h2>
<p>A strong book description distinguishes between plot summary and critical positioning. Lead with the central dramatic or intellectual question of your book, followed by its setting, formal approach, and a representative 150-word excerpt.</p>
<h2>2. Edition & ISBN Integrity</h2>
<p>Always record distinct ISBN-13 identifiers for Hardcover, Paperback, eBook, and Audiobook editions, and verify that retailer links resolve directly to the canonical edition page.</p>`,
      "/media/banners/editorial-desk.svg",
      6,
      "LVN Publishing Resources",
      "",
      0,
      0,
      "published",
      null,
      "2026-10-18T10:00:00.000Z",
      "A Working Author's Guide to Metadata & Editorial Pitches | LVN",
      "Practical publishing guidance from Literary Voices Network.",
      now,
      now
    );

    // Article 7: Official Press Release #1
    insertArticle.run(
      "art-press-autumn-broadcast-season",
      "lvn-announces-autumn-2026-literary-broadcast-slate-and-open-submissions-for-issue-14",
      "profile-admin-eleanor",
      "user-admin-eleanor",
      "cat-press",
      "issue-14",
      null,
      null,
      "press_release",
      "Literary Voices Network Announces Autumn 2026 Broadcast Slate and Opens Submissions for Issue No. 14",
      "New author interview programmes, live reading rooms, and expanded member publishing tools launch across the network",
      "FOR IMMEDIATE RELEASE — Literary Voices Network (LVN) today unveiled its Autumn/Winter editorial schedule, featuring weekly author spotlights, live virtual book clubs, and open submissions for Issue No. 14 ('The Architecture of Memory').",
      `<p><strong>NEW YORK &amp; LONDON — October 20, 2026</strong> — Literary Voices Network (LVN) today announced its expanded Autumn/Winter 2026 programming slate alongside the opening of the submission window for Issue No. 14 of the LVN Digital Magazine, themed <em>The Architecture of Memory</em>.</p>
<p>Authors and eligible members can now submit book listings, long-form essays, critical reviews, and interview pitches directly through the LVN Member Dashboard, with full revision tracking and editorial moderation.</p>
<h3>Media &amp; Press Enquiries</h3>
<p>Editorial &amp; Press Desk: <strong>enquiry@literarynetwork.org</strong></p>`,
      "/media/banners/editorial-desk.svg",
      4,
      "Literary Voices Network Newsroom",
      "Press Office · enquiry@literarynetwork.org",
      1,
      0,
      "published",
      null,
      "2026-10-20T08:00:00.000Z",
      "Press Release: LVN Announces Autumn 2026 Broadcast Slate | Newsroom",
      "Official announcement from the Literary Voices Network Newsroom.",
      now,
      now
    );

    // Article 8: Official Press Release #2
    insertArticle.run(
      "art-press-independent-press-fellowship",
      "lvn-establishes-annual-independent-press-and-translation-spotlight-series",
      "profile-editor-marcus",
      "user-editor-marcus",
      "cat-press",
      "issue-15",
      null,
      null,
      "press_release",
      "LVN Establishes Annual Independent Press and Literary Translation Spotlight Series",
      "Dedicated editorial and broadcast coverage for small-press titles and literature in translation",
      "FOR IMMEDIATE RELEASE — Beginning in November 2026, Literary Voices Network will dedicate a monthly broadcast hour and magazine dossier to independent literary presses and translators.",
      `<p><strong>LONDON — October 15, 2026</strong> — Recognizing the vital contribution of small presses and literary translators to contemporary letters, Literary Voices Network has established the Independent Press &amp; Translation Spotlight Series.</p>
<p>Each month, our editorial board selects three small-press releases for long-form critical review, accompanied by an on-air conversation with both the author and translator.</p>`,
      "/media/covers/issue-15.svg",
      3,
      "Literary Voices Network Newsroom",
      "Marcus Sterling, Senior Commissioning Editor · enquiry@literarynetwork.org",
      0,
      0,
      "published",
      null,
      "2026-10-15T09:00:00.000Z",
      "Press Release: Independent Press and Translation Spotlight Series | LVN",
      "LVN establishes monthly coverage for small presses and translators.",
      now,
      now
    );

    // Article 9: Submitted Member Essay (Pending Moderation for Editor/Admin queue)
    insertArticle.run(
      "art-submitted-marginalia-libraries",
      "on-borrowed-margins-notes-from-municipal-lending-libraries",
      "profile-member-nadia",
      "user-member-nadia",
      "cat-essays",
      "issue-14",
      null,
      null,
      "essay",
      "On Borrowed Margins: Notes from Municipal Lending Libraries",
      "What penciled dates and forgotten bookmarks reveal about how a city reads together",
      "An essay exploring the quiet dialogue between strangers who annotate the same public library hardcovers over decades.",
      `<p>Inside a 1978 lending-library edition of Italo Calvino’s <em>Invisible Cities</em>, three different hands have underlined the same sentence in three different decades, each leaving a date in the margin.</p><p>Public libraries preserve not only books, but the choreography of shared attention.</p>`,
      "/media/covers/issue-14.svg",
      5,
      "Member Submission",
      "",
      0,
      0,
      "submitted",
      null,
      null,
      "",
      "",
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 7. CONTENT REVISIONS & SUBMISSIONS
    // -------------------------------------------------------------------------
    const insertRevision = db.prepare(`
      INSERT INTO content_revisions (
        id, entity_type, entity_id, version_number, title,
        snapshot_json, change_summary, created_by_user_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRevision.run(
      "rev-book-1",
      "book",
      "book-glass-meridian",
      1,
      "The Glass Meridian",
      JSON.stringify({ title: "The Glass Meridian", status: "published", author: "Executive Founder & CEO" }),
      "Initial publication by Administrator under public profile Executive Founder & CEO",
      "user-admin-eleanor",
      now
    );

    insertRevision.run(
      "rev-art-1",
      "article",
      "art-architecture-of-sentence",
      1,
      "The Architecture of the Unhurried Sentence",
      JSON.stringify({ title: "The Architecture of the Unhurried Sentence", status: "published" }),
      "Initial cover story publication by Executive Founder & CEO",
      "user-admin-eleanor",
      now
    );

    const insertSubmission = db.prepare(`
      INSERT INTO submissions (
        id, entity_type, entity_id, submitted_by_user_id, author_profile_id,
        assigned_editor_id, reviewer_user_id, status, submission_notes,
        internal_notes, author_feedback, decision_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Approved submission history
    insertSubmission.run(
      "sub-book-saltwater",
      "book",
      "book-saltwater-ledger",
      "user-author-amara",
      "profile-author-amara",
      "user-editor-marcus",
      "user-editor-marcus",
      "published",
      "Submitting hardcover edition details and verified ISBN-13 for Autumn catalog.",
      "Verified ISBN and cover image quality. Selected as Editorial Recommendation.",
      "Approved and featured in our Autumn Literary Season directory. Thank you for sharing The Saltwater Ledger with LVN!",
      "2026-10-02T12:00:00.000Z",
      now,
      now
    );

    // Pending Book Submission in Queue
    insertSubmission.run(
      "sub-book-nocturne",
      "book",
      "book-nocturne-for-observatories",
      "user-author-julian",
      "profile-author-julian",
      "user-editor-marcus",
      null,
      "submitted",
      "Advance collection listing for Winter 2027 release with Northlight Editions.",
      "Awaiting final jacket scan verification.",
      "",
      null,
      now,
      now
    );

    // Pending Article Submission in Queue
    insertSubmission.run(
      "sub-art-marginalia",
      "article",
      "art-submitted-marginalia-libraries",
      "user-member-nadia",
      "profile-member-nadia",
      "user-editor-marcus",
      null,
      "submitted",
      "Submitting for Issue No. 14 ('The Architecture of Memory').",
      "Strong opening section; queued for editorial review.",
      "",
      null,
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 8. BROADCASTS & AUDIO/VIDEO ARCHIVE
    //    Honest states: verified offline live-stream state unless connected,
    //    plus real playable studio audio & archive episodes.
    // -------------------------------------------------------------------------
    const insertBroadcast = db.prepare(`
      INSERT INTO broadcasts (
        id, slug, programme_name, episode_number, title, subtitle, description,
        host_profile_id, host_name, guest_profile_id, guest_name, featured_book_id,
        broadcast_type, is_live, live_stream_url, replay_url, external_embed_url,
        audio_file_url, provider, banner_url, duration_minutes, scheduled_start,
        scheduled_end, timezone, is_featured, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBroadcast.run(
      "bc-meridian-ep42",
      "the-meridian-conversation-ep-42-amara-osei",
      "The Meridian Conversation",
      42,
      "Maritime Archives & Polyphonic Fiction with Amara Osei",
      "Episode 42 · Hosted by Executive Founder & CEO",
      "Founding Publisher Executive Founder & CEO welcomes novelist Amara Osei into the LVN studio for an extended conversation on 'The Saltwater Ledger', West African printing presses, and the music of historical prose.",
      "profile-admin-eleanor",
      "Executive Founder & CEO",
      "profile-author-amara",
      "Amara Osei",
      "book-saltwater-ledger",
      "audio",
      0,
      "",
      "/broadcasts/the-meridian-conversation-ep-42-amara-osei",
      "",
      "/media/audio/lvn-studio-preview.wav",
      "LVN Studio",
      "/media/covers/the-saltwater-ledger.svg",
      52,
      "2026-10-19T18:00:00.000Z",
      "2026-10-19T18:52:00.000Z",
      "America/New_York",
      1,
      "published",
      now,
      now
    );

    insertBroadcast.run(
      "bc-first-editions-ep18",
      "first-editions-live-ep-18-julian-thorne",
      "First Editions Live",
      18,
      "Acoustic Architecture & Speculative Form with Julian Thorne",
      "Episode 18 · Hosted by Marcus Sterling",
      "Senior Commissioning Editor Marcus Sterling speaks with Julian Thorne about recording vanishing civic interiors and structuring 'Atlas of Quiet Cities'.",
      "profile-editor-marcus",
      "Marcus Sterling",
      "profile-author-julian",
      "Julian Thorne",
      "book-atlas-of-quiet-cities",
      "podcast",
      0,
      "",
      "/broadcasts/first-editions-live-ep-18-julian-thorne",
      "",
      "/media/audio/lvn-studio-preview.wav",
      "LVN Studio",
      "/media/covers/atlas-of-quiet-cities.svg",
      46,
      "2026-10-12T19:00:00.000Z",
      "2026-10-12T19:46:00.000Z",
      "Europe/London",
      1,
      "published",
      now,
      now
    );

    insertBroadcast.run(
      "bc-poetics-table-ep09",
      "the-translation-table-ep-09-claire-moreau",
      "The Translation Table",
      9,
      "Translating Alpine Dialects & Bilingual Poetics",
      "Episode 9 · Hosted by Executive Founder & CEO",
      "Claire Moreau reads in French and English from 'Winter Harmonics' and examines the craft of lyric translation.",
      "profile-admin-eleanor",
      "Executive Founder & CEO",
      "profile-author-claire",
      "Claire Moreau",
      "book-winter-harmonics",
      "audio",
      0,
      "",
      "/broadcasts/the-translation-table-ep-09-claire-moreau",
      "",
      "/media/audio/lvn-studio-preview.wav",
      "LVN Studio",
      "/media/covers/winter-harmonics.svg",
      39,
      "2026-10-04T17:00:00.000Z",
      "2026-10-04T17:39:00.000Z",
      "America/New_York",
      0,
      "published",
      now,
      now
    );

    insertBroadcast.run(
      "bc-upcoming-nordic-presses",
      "the-meridian-conversation-ep-43-soren-lindqvist",
      "The Meridian Conversation",
      43,
      "Upcoming Broadcast: Lead Type & Independent Letters with Søren Lindqvist",
      "Episode 43 · Live Studio Conversation",
      "Join Executive Founder & CEO and historian Søren Lindqvist for a live studio broadcast exploring how small cooperative printshops transformed modern European literature.",
      "profile-admin-eleanor",
      "Executive Founder & CEO",
      "profile-author-soren",
      "Søren Lindqvist",
      "book-republic-of-typesetters",
      "video",
      0,
      "",
      "",
      "",
      "/media/audio/lvn-studio-preview.wav",
      "LVN Studio",
      "/media/covers/republic-of-typesetters.svg",
      60,
      "2026-11-05T18:00:00.000Z",
      "2026-11-05T19:00:00.000Z",
      "America/New_York",
      1,
      "scheduled",
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 9. LITERARY EVENTS & REGISTRATIONS
    // -------------------------------------------------------------------------
    const insertEvent = db.prepare(`
      INSERT INTO events (
        id, slug, title, subtitle, description, event_type, start_at, end_at,
        timezone, host_name, host_profile_id, guest_names_json, featured_book_id,
        banner_url, venue_or_link, is_virtual, registration_open, max_attendees,
        archive_url, is_featured, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      "evt-autumn-book-club",
      "lvn-autumn-book-club-the-saltwater-ledger",
      "LVN Autumn Reading Room: ‘The Saltwater Ledger’ with Amara Osei",
      "Live Virtual Book Club & Audience Q&A",
      "Join readers from across the Literary Voices Network community for a moderated discussion of Amara Osei's 'The Saltwater Ledger', featuring a live 30-minute Q&A with the author.",
      "book_club",
      "2026-11-08T19:00:00.000Z",
      "2026-11-08T20:30:00.000Z",
      "America/New_York (EST)",
      "Executive Founder & CEO",
      "profile-admin-eleanor",
      JSON.stringify(["Amara Osei"]),
      "book-saltwater-ledger",
      "/media/covers/the-saltwater-ledger.svg",
      "LVN Virtual Salon (Link sent upon registration)",
      1,
      1,
      250,
      "",
      1,
      "published",
      now,
      now
    );

    insertEvent.run(
      "evt-translation-workshop",
      "craft-seminar-translating-poetry-and-lyric-prose",
      "Craft Workshop: Translating Poetry and Lyric Prose",
      "Interactive Editorial Seminar with Claire Moreau",
      "A two-hour seminar for translators, poets, and essayists working across languages. Participants examine manuscript drafts, rhythm preservation, and working with independent editors.",
      "workshop",
      "2026-11-15T16:00:00.000Z",
      "2026-11-15T18:00:00.000Z",
      "Europe/London (GMT)",
      "Claire Moreau",
      "profile-author-claire",
      JSON.stringify(["Claire Moreau", "Marcus Sterling"]),
      "book-winter-harmonics",
      "/media/covers/winter-harmonics.svg",
      "LVN Workshop Studio (Online)",
      1,
      1,
      120,
      "",
      1,
      "published",
      now,
      now
    );

    insertEvent.run(
      "evt-small-press-panel",
      "panel-the-future-of-independent-literary-publishing",
      "Literary Panel: The Future of Independent Literary Publishing",
      "Roundtable on Print Craft, Reader Communities, and Editorial Independence",
      "Søren Lindqvist, Executive Founder & CEO, and Julian Thorne discuss the economics and enduring cultural mission of independent literary presses in 2026.",
      "panel",
      "2026-11-22T18:30:00.000Z",
      "2026-11-22T20:00:00.000Z",
      "America/New_York (EST)",
      "Marcus Sterling",
      "profile-editor-marcus",
      JSON.stringify(["Søren Lindqvist", "Executive Founder & CEO", "Julian Thorne"]),
      "book-republic-of-typesetters",
      "/media/covers/republic-of-typesetters.svg",
      "LVN Live Broadcast Stage & New York Reading Room",
      1,
      1,
      300,
      "",
      1,
      "published",
      now,
      now
    );

    insertEvent.run(
      "evt-glass-meridian-launch",
      "book-launch-reading-the-glass-meridian",
      "Archive Recording: ‘The Glass Meridian’ Launch & Reading",
      "Evening Reading and Archival Conversation with Executive Founder & CEO",
      "Recorded at the Edinburgh & New York simultaneous launch of 'The Glass Meridian', featuring readings from Part I and a conversation with Marcus Sterling.",
      "book_launch",
      "2026-09-12T19:00:00.000Z",
      "2026-09-12T20:30:00.000Z",
      "Europe/London (BST)",
      "Marcus Sterling",
      "profile-editor-marcus",
      JSON.stringify(["Executive Founder & CEO"]),
      "book-glass-meridian",
      "/media/covers/the-glass-meridian.svg",
      "Edinburgh Old Observatory & LVN Stream",
      0,
      0,
      150,
      "/broadcasts/the-meridian-conversation-ep-42-amara-osei",
      0,
      "completed",
      now,
      now
    );

    const insertReg = db.prepare(`
      INSERT INTO event_registrations (
        id, event_id, user_id, attendee_name, attendee_email, reminder_enabled, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 1, 'registered', ?)
    `);
    insertReg.run(
      "reg-1",
      "evt-autumn-book-club",
      "user-member-nadia",
      "Nadia Khoury",
      "member@literaryvoicesnetwork.org",
      now
    );

    // -------------------------------------------------------------------------
    // 10. FAVOURITES, FOLLOWS & PITCHES
    // -------------------------------------------------------------------------
    db.prepare(
      "INSERT INTO favourites (id, user_id, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run("fav-1", "user-member-nadia", "book", "book-glass-meridian", now);
    db.prepare(
      "INSERT INTO favourites (id, user_id, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run("fav-2", "user-member-nadia", "article", "art-architecture-of-sentence", now);

    db.prepare(
      "INSERT INTO follows (id, follower_user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run("fol-1", "user-member-nadia", "author", "profile-admin-eleanor", now);
    db.prepare(
      "INSERT INTO follows (id, follower_user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run("fol-2", "user-member-nadia", "author", "profile-author-amara", now);

    db.prepare(`
      INSERT INTO pitches (
        id, submitted_by_user_id, author_profile_id, issue_id, related_book_id,
        pitch_type, title, summary, supporting_links, proposed_date, status,
        editor_feedback, internal_notes, reviewed_by_user_id, reviewed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "pitch-1",
      "user-author-julian",
      "profile-author-julian",
      "issue-14",
      "book-nocturne-for-observatories",
      "interview",
      "Broadcast Conversation: Night-Shift Observatories & Short Story Architecture",
      "Proposing a 45-minute interview on 'The Meridian Conversation' timed with the advance proofs of Nocturne for Observatories, focusing on acoustic landscapes and the midwestern short story tradition.",
      "https://literaryvoicesnetwork.org/authors/julian-thorne",
      "2026-11-28",
      "in_review",
      "Under consideration for our late November broadcast schedule.",
      "Good fit for Episode 45.",
      "user-editor-marcus",
      null,
      now,
      now
    );

    // -------------------------------------------------------------------------
    // 11. HOMEPAGE SECTIONS (19 Configurable Sections matching PRD Section 4.1)
    // -------------------------------------------------------------------------
    const insertHomepageSection = db.prepare(`
      INSERT INTO homepage_sections (
        id, section_key, eyebrow, title, subtitle, is_visible, sort_order,
        cta_label, cta_href, config_json, updated_by_user_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user-admin-eleanor', ?)
    `);

    const homepageSections = [
      ["hp-01", "announcement_bar", "Network Bulletin", "Autumn Literary Season & Issue No. 14 Open Call", "Submissions open for members and authors", 1, 1, "View Editorial Calendar", "/editorial-calendar"],
      ["hp-02", "hero", "Literary Voices Network", "Where Literature Speaks Across Every Page & Frequency", "An independent literary publication, author discovery directory, and broadcast studio connecting authors, editors, and readers.", 1, 2, "Explore the Book Directory", "/books"],
      ["hp-03", "featured_broadcast", "Studio & Broadcast Desk", "Featured Broadcast & Studio Conversation", "Verified broadcast status and on-demand studio conversations with contemporary authors.", 1, 3, "Visit Broadcast Studio", "/broadcasts"],
      ["hp-04", "platform_intro", "Our Editorial Mission", "Both a Literary Publication & a Community Publishing Platform", "Literary Voices Network unites rigorous long-form literary journalism with a transparent, editorially moderated publishing pipeline for authors and members.", 1, 4, "About Literary Voices Network", "/about"],
      ["hp-05", "featured_authors", "Voices of the Network", "Featured Authors & Editorial Contributors", "Meet the novelists, poets, translators, critics, and editors publishing on Literary Voices Network.", 1, 5, "Full Author Directory", "/authors"],
      ["hp-06", "upcoming_events", "On the Calendar", "Upcoming Interviews, Salons & Broadcast Schedule", "Register for virtual book clubs, craft workshops, live author interviews, and launch readings.", 1, 6, "All Literary Events", "/events"],
      ["hp-07", "new_releases", "Curated Shelf", "New Book Releases & Editorial Selections", "Distinguished new titles selected by the Literary Voices Network editorial board.", 1, 7, "Browse Book Directory", "/books"],
      ["hp-08", "member_books", "Community Imprint", "Recently Approved Member & Author Books", "Newly reviewed and published book listings submitted by verified LVN authors.", 1, 8, "Submit Your Book", "/dashboard?tab=books"],
      ["hp-09", "genre_discovery", "Literary Taxonomy", "Book Directory Preview & Genre Discovery", "Filter our catalog across literary fiction, historical fiction, poetry, translation, and narrative non-fiction.", 1, 9, "Search All Genres", "/books"],
      ["hp-10", "magazine_highlights", "The LVN Digital Magazine", "Cover Stories, Reviews & Critical Essays", "Long-form literary criticism, craft essays, and cultural commentary from our current issue.", 1, 10, "Read the Magazine", "/magazine"],
      ["hp-11", "author_spotlights", "In-Depth Profiles", "Author Spotlights & Conversations", "Extended dialogues with writers on craft, archival research, and the publishing life.", 1, 11, "Explore Interviews & Spotlights", "/magazine?type=interview"],
      ["hp-12", "broadcast_archive", "On-Demand Listening", "Audio & Video Broadcast Archive", "Stream full-length studio conversations and readings from the LVN archive.", 1, 12, "Open Archive", "/broadcasts"],
      ["hp-13", "newsroom_press", "Official Dispatches", "Literary News & Press Releases", "Announcements, issue calls, and official press advisories from the LVN Newsroom.", 1, 13, "Visit the Newsroom", "/press-releases"],
      ["hp-14", "book_clubs_launches", "Reader Gatherings", "Upcoming Book Clubs, Readings & Launches", "Participate in live literary discussions and reserve your seat for upcoming launches.", 1, 14, "Register for Events", "/events"],
      ["hp-15", "membership_cta", "Join the Network", "Publish Your Work & Connect with Readers", "Create an LVN account to submit book listings, draft essays and stories in our rich-text studio, pitch interviews, and curate your personal library.", 1, 15, "Create Member Account", "/auth?mode=register"],
      ["hp-16", "partners", "Literary Ecosystem", "Retailers, Libraries & Publishing Partners", "Verified book platforms and independent literary institutions where LVN titles are available.", 1, 16, "Partner & Service Enquiries", "/partners"],
      ["hp-17", "newsletter", "The Weekly Dispatch", "Subscribe to the Literary Voices Letter", "Receive our Friday digest of new essays, book reviews, broadcast episodes, and open submission windows.", 1, 17, "Subscribe", "#newsletter"],
    ] as const;

    for (const [id, key, eyebrow, title, subtitle, visible, order, ctaLabel, ctaHref] of homepageSections) {
      insertHomepageSection.run(
        id,
        key,
        eyebrow,
        title,
        subtitle,
        visible,
        order,
        ctaLabel,
        ctaHref,
        JSON.stringify({}),
        now
      );
    }

    // -------------------------------------------------------------------------
    // 12. VERIFIED RETAIL & LITERARY DISTRIBUTION LINKS (Partners Table)
    // -------------------------------------------------------------------------
    const insertPartner = db.prepare(`
      INSERT INTO partners (
        id, slug, name, category, location, description, website_url, logo_url,
        is_verified, is_active, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)
    `);

    const partnersData = [
      ["part-1", "bookshop-org", "Bookshop.org", "Independent Bookstore Network", "New York & UK", "Supporting local independent bookstores with direct edition fulfillment links.", "https://bookshop.org", "", 1],
      ["part-2", "open-library", "Open Library & Internet Archive", "Bibliographic Registry", "San Francisco, USA", "Open bibliographic metadata and ISBN edition catalog records.", "https://openlibrary.org", "", 2],
      ["part-3", "independent-publishers-guild", "Independent Press Collective", "Small Press Directory", "London & Edinburgh", "Collaborative distribution and review exchange for independent literary presses.", "https://literaryvoicesnetwork.org/partners", "", 3],
      ["part-4", "meridian-house-press", "Meridian House Press", "Editorial Imprint", "New York & Edinburgh", "Founding editorial imprint partnered with Literary Voices Network.", "https://literaryvoicesnetwork.org/partners", "", 4],
    ] as const;

    for (const [id, slug, name, category, location, desc, url, logo, order] of partnersData) {
      insertPartner.run(id, slug, name, category, location, desc, url, logo, order, now, now);
    }

    // -------------------------------------------------------------------------
    // 13. SITE SETTINGS
    // -------------------------------------------------------------------------
    const insertSetting = db.prepare(`
      INSERT INTO site_settings (setting_key, setting_value_json, description, updated_by_user_id, updated_at)
      VALUES (?, ?, ?, 'user-admin-eleanor', ?)
    `);

    for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
      insertSetting.run(key, JSON.stringify(value), `Site setting for ${key}`, now);
    }

    // -------------------------------------------------------------------------
    // 14. INITIAL MEDIA ASSETS & AUDIT LOGS
    // -------------------------------------------------------------------------
    db.prepare(`
      INSERT INTO media_assets (
        id, uploaded_by_user_id, filename, original_name, mime_type, size_bytes,
        bucket, public_url, alt_text, asset_category, is_public, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'public', ?, ?, ?, 1, ?)
    `).run(
      "media-hero-video",
      "user-admin-eleanor",
      "lvn-hero-loop.mp4",
      "lvn-hero-loop.mp4",
      "video/mp4",
      185400,
      "/media/lvn-hero-loop.mp4",
      "Literary Voices Network silent looping hero background video",
      "hero_media",
      now
    );

    db.prepare(`
      INSERT INTO notifications (
        id, user_id, type, title, message, link_url, is_read, email_delivery_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'logged_dev', ?)
    `).run(
      "notif-welcome-admin",
      "user-admin-eleanor",
      "system",
      "Administrator & Public Author Profile Active",
      "Your public author profile (Executive Founder & CEO) and full administrative privileges are active.",
      "/authors/eleanor-vance",
      now
    );

    db.prepare(`
      INSERT INTO notifications (
        id, user_id, type, title, message, link_url, is_read, email_delivery_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'logged_dev', ?)
    `).run(
      "notif-amara-approved",
      "user-author-amara",
      "submission_approved",
      "Book Listing Approved: The Saltwater Ledger",
      "Your book 'The Saltwater Ledger' has been approved and published in the LVN Book Directory.",
      "/books/the-saltwater-ledger",
      now
    );

    db.prepare(`
      INSERT INTO audit_logs (
        id, actor_user_id, actor_role, action, entity_type, entity_id, summary, metadata_json, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '127.0.0.1', ?)
    `).run(
      "audit-init-1",
      "user-admin-eleanor",
      "admin",
      "ADMIN_DIRECT_PUBLISH",
      "book",
      "book-glass-meridian",
      "Administrator Executive Founder & CEO published original book 'The Glass Meridian' under public profile /authors/eleanor-vance",
      JSON.stringify({ authorProfileId: "profile-admin-eleanor", slug: "the-glass-meridian" }),
      now
    );

    db.prepare(`
      INSERT INTO audit_logs (
        id, actor_user_id, actor_role, action, entity_type, entity_id, summary, metadata_json, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '127.0.0.1', ?)
    `).run(
      "audit-init-2",
      "user-admin-eleanor",
      "admin",
      "ADMIN_DIRECT_PUBLISH",
      "article",
      "art-architecture-of-sentence",
      "Administrator Executive Founder & CEO published cover story 'The Architecture of the Unhurried Sentence' under public profile /authors/eleanor-vance",
      JSON.stringify({ authorProfileId: "profile-admin-eleanor", slug: "the-architecture-of-the-unhurried-sentence" }),
      now
    );

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

