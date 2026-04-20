const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let dbPromise;

async function getDb() {
  if (dbPromise) return dbPromise;

  const dbPath =
    process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'data', 'cropguard_dashboard.db');
  const fullPath = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  dbPromise = open({
    filename: fullPath,
    driver: sqlite3.Database,
  });

  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT,
      disease TEXT NOT NULL,
      severity TEXT,
      confidence REAL,
      location_label TEXT,
      lat REAL,
      lng REAL,
      timestamp TEXT NOT NULL,
      disease_details_json TEXT NOT NULL
    );
  `);

  return db;
}

module.exports = { getDb };
