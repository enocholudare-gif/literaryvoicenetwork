import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { INITIAL_MIGRATION_VERSION, INITIAL_SCHEMA_SQL } from "./schema-sql";
import { seedDatabase } from "./seed";

declare global {
  // eslint-disable-next-line no-var
  var __lvnDbInstance: DatabaseSync | undefined;
  // eslint-disable-next-line no-var
  var __lvnDbPath: string | undefined;
}

function resolveDbPath(): string {
  const configured = process.env.LVN_SQLITE_PATH;
  if (configured === ":memory:") {
    return ":memory:";
  }
  if (configured) {
    const absPath = path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
    const dir = path.dirname(absPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return absPath;
  }
  // On Vercel serverless environments, only /tmp is writable
  if (process.env.VERCEL) {
    return path.join("/tmp", "lvn.sqlite");
  }
  const defaultPath = path.join(process.cwd(), "data", "lvn.sqlite");
  const dir = path.dirname(defaultPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return defaultPath;
}

export function initializeSchema(db: DatabaseSync): void {
  db.exec("PRAGMA foreign_keys = ON;");
  try {
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA busy_timeout = 5000;");
  } catch {
    // In-memory databases ignore WAL pragma safely
  }

  db.exec(INITIAL_SCHEMA_SQL);
  try {
    db.exec("ALTER TABLE books ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;");
  } catch {
    // column already exists
  }
  db.exec(
    "CREATE TABLE IF NOT EXISTS book_reviews (id TEXT PRIMARY KEY, book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, user_name TEXT NOT NULL, user_avatar TEXT NOT NULL DEFAULT '/media/avatars/default-portrait.svg', rating INTEGER NOT NULL, headline TEXT NOT NULL DEFAULT '', content TEXT NOT NULL, created_at TEXT NOT NULL);"
  );

  // Ensure Admin login email is perrycreativity@gmail.com and official email is enquiry@literarynetwork.org
  try {
    db.exec("UPDATE users SET email = 'perrycreativity@gmail.com' WHERE role = 'admin';");
    db.exec(
      "UPDATE site_settings SET setting_value_json = '\"enquiry@literarynetwork.org\"' WHERE setting_key IN ('editorialEmail', 'pressEmail', 'partnershipsEmail');"
    );
  } catch {
    // ignore if tables are not yet seeded
  }

  const existingMigration = db
    .prepare("SELECT version FROM schema_migrations WHERE version = ?")
    .get(INITIAL_MIGRATION_VERSION) as { version: string } | undefined;

  if (!existingMigration) {
    db.prepare(
      "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)"
    ).run(INITIAL_MIGRATION_VERSION, new Date().toISOString());
  }
}

export function getDb(): DatabaseSync {
  let targetPath = resolveDbPath();
  if (globalThis.__lvnDbInstance && globalThis.__lvnDbPath === targetPath) {
    return globalThis.__lvnDbInstance;
  }

  let db: DatabaseSync;
  try {
    db = new DatabaseSync(targetPath);
  } catch (err) {
    console.warn("Failed to open database at", targetPath, "falling back to :memory:", err);
    targetPath = ":memory:";
    db = new DatabaseSync(":memory:");
  }

  initializeSchema(db);

  if (process.env.LVN_SKIP_AUTO_SEED !== "true") {
    seedDatabase(db);
  }

  // Re-ensure Admin email and enquiry email after seeding
  try {
    db.exec("UPDATE users SET email = 'perrycreativity@gmail.com' WHERE role = 'admin';");
    db.exec(
      "UPDATE site_settings SET setting_value_json = '\"enquiry@literarynetwork.org\"' WHERE setting_key IN ('editorialEmail', 'pressEmail', 'partnershipsEmail');"
    );
  } catch {
    // ignore
  }

  globalThis.__lvnDbInstance = db;
  globalThis.__lvnDbPath = targetPath;
  return db;
}

export function resetDatabaseForTesting(seed = true): DatabaseSync {
  if (globalThis.__lvnDbInstance) {
    try {
      globalThis.__lvnDbInstance.close();
    } catch {
      // ignore close error
    }
    globalThis.__lvnDbInstance = undefined;
  }
  process.env.LVN_SQLITE_PATH = ":memory:";
  process.env.LVN_SKIP_AUTO_SEED = seed ? "false" : "true";
  return getDb();
}
