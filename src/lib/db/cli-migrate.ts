import { getDb } from "./index";

const db = getDb();
const migrations = db.prepare("SELECT * FROM schema_migrations").all();
console.log("Applied migrations:", migrations);

