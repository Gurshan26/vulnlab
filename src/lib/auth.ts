import crypto from 'crypto';
import { getDb } from './db';
import { generateCsrfToken } from './csrf';

export interface Session {
  id: string;
  userId: number;
  username: string;
  role: 'user' | 'admin';
  csrfToken: string;
  expiresAt: string;
}

export function md5(value: string): string {
  return crypto.createHash('md5').update(value).digest('hex');
}

export function createSession(userId: number): Session {
  const db = getDb();
  const user = db
    .prepare('SELECT id, username, role FROM users WHERE id = ?')
    .get(userId) as { id: number; username: string; role: 'user' | 'admin' } | undefined;

  if (!user) {
    throw new Error('User not found for session creation');
  }

  const id = crypto.randomBytes(24).toString('hex');
  const csrfToken = generateCsrfToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();

  db.prepare(
    'INSERT INTO sessions (id, user_id, csrf_token, expires_at) VALUES (?, ?, ?, ?)'
  ).run(id, user.id, csrfToken, expiresAt);

  return {
    id,
    userId: user.id,
    username: user.username,
    role: user.role,
    csrfToken,
    expiresAt
  };
}

export function getSession(sessionId: string | null | undefined): Session | null {
  if (!sessionId) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT s.id, s.user_id as userId, s.csrf_token as csrfToken, s.expires_at as expiresAt,
              u.username, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(sessionId) as Session | undefined;

  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return null;
  }
  return row;
}

export function deleteSessions(): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions').run();
}
