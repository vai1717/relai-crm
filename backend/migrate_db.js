const db = require('./db');

try {
    db.exec('BEGIN TRANSACTION');

    // Create new table without the CHECK constraint on source
    db.exec(`
    CREATE TABLE new_leads (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL UNIQUE,
      city        TEXT,
      source      TEXT,
      status      TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','follow_up','closed')),
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Copy data
    db.exec('INSERT INTO new_leads SELECT id, name, phone, city, source, status, created_at FROM leads');

    // Drop old table
    db.exec('DROP TABLE leads');

    // Rename new table to leads
    db.exec('ALTER TABLE new_leads RENAME TO leads');

    db.exec('COMMIT');
    console.log('Migration successful: Removed ENUM constraint from source column.');
} catch (err) {
    db.exec('ROLLBACK');
    console.error('Migration failed:', err);
}
