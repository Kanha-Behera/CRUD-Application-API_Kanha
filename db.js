const Database = require('better-sqlite3');

// Pass ':memory:' (used by tests) or a file path. Defaults to ./data.db
function createDb(file = process.env.DB_FILE || 'data.db') {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
      email      TEXT    NOT NULL UNIQUE,
      course     TEXT    NOT NULL,
      year       INTEGER NOT NULL CHECK (year BETWEEN 1 AND 6),
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
  `);
  return db;
}

module.exports = { createDb };
