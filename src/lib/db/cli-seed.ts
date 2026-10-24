import { getDb } from "./index";
import { seedDatabase } from "./seed";

const db = getDb();
seedDatabase(db);
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
const bookCount = db.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number };
const articleCount = db.prepare("SELECT COUNT(*) as count FROM articles").get() as { count: number };
console.log(`Database seeded successfully: ${userCount.count} users, ${bookCount.count} books, ${articleCount.count} articles.`);

