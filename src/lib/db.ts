import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database | null = null;

export function resolveDbPath(): string {
  if (process.env.TEST_DB_PATH) return process.env.TEST_DB_PATH;
  if (process.env.DB_PATH) return process.env.DB_PATH;
  if (process.env.NODE_ENV === 'production') return '/tmp/vulnlab.db';
  return path.join(process.cwd(), 'db', 'vulnlab.db');
}

function ensureDbDir(filePath: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function initSchema(conn: Database.Database): void {
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  conn.exec(schema);
}

export function getDb(): Database.Database {
  if (db) return db;
  const dbPath = resolveDbPath();
  ensureDbDir(dbPath);
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetAllTables(): void {
  const conn = getDb();
  conn.exec('DELETE FROM sessions; DELETE FROM comments; DELETE FROM email_changes; DELETE FROM users;');
}
