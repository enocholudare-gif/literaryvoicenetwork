import fs from "node:fs";
import path from "node:path";
import { getDb } from "./index";

const dbPath = path.join(process.cwd(), process.env.LVN_SQLITE_PATH || "./data/lvn.sqlite");
for (const suffix of ["", "-wal", "-shm"]) {
  const target = `${dbPath}${suffix}`;
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}
getDb();
console.log("Database reset and re-seeded cleanly at:", dbPath);

