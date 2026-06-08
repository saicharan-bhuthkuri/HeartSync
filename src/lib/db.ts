import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set');
}

export const db = createClient({
  url,
  authToken,
});

let initPromise: Promise<void> | null = null;

export async function initDb() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Create tables sequentially in SQLite/Libsql
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          email_2 TEXT UNIQUE,
          password_hash TEXT NOT NULL,
          partner_name_1 TEXT NOT NULL,
          partner_name_2 TEXT,
          relationship_start_date TEXT NOT NULL,
          avatar_url_1 TEXT,
          avatar_url_2 TEXT,
          playlist_url TEXT,
          theme_preference TEXT DEFAULT 'system',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS milestones (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          event_type TEXT NOT NULL,
          event_date TEXT NOT NULL,
          description TEXT,
          photo_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          milestone_id TEXT,
          title TEXT NOT NULL,
          notes TEXT NOT NULL,
          image_url TEXT,
          memory_date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS reminders (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          milestone_id TEXT NOT NULL,
          days_before INTEGER NOT NULL,
          is_recurring_yearly INTEGER DEFAULT 1 NOT NULL,
          email_recipient TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS love_map_pins (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          visit_date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS bucket_list (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          completed_at TEXT,
          target_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS time_capsules (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          sender_name TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          unlock_date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Safely alter users table to add playlist_url (since SQLite does not have ADD COLUMN IF NOT EXISTS)
      try {
        await db.execute(`
          ALTER TABLE users ADD COLUMN playlist_url TEXT;
        `);
      } catch (err) {
        // Column probably already exists, which is expected on subsequent runs
      }

      console.log('Database initialized successfully or verified existing schema.');
    } catch (error) {
      console.error('Error during database initialization:', error);
      throw error;
    }
  })();

  return initPromise;
}
