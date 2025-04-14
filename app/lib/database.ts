import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "database.sqlite");
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS pdf_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    baseFilename TEXT NOT NULL,
    summary TEXT NOT NULL,
    uploadedAt TEXT NOT NULL
  )
`);

export default db;
