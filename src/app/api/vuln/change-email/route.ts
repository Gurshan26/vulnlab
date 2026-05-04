import { getSession } from '@/lib/auth';
import { ensureSeeded } from '@/lib/bootstrap';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  ensureSeeded();
  const db = getDb();
  const { newEmail, sessionId } = (await req.json()) as { newEmail: string; sessionId: string };
  const session = getSession(sessionId);
  if (!session) return Response.json({ error: 'Not logged in' }, { status: 401 });

  const old = db.prepare('SELECT email FROM users WHERE id = ?').get(session.userId) as { email: string } | undefined;
  db.prepare('UPDATE users SET email = ? WHERE id = ?').run(newEmail, session.userId);
  db.prepare('INSERT INTO email_changes (user_id, old_email, new_email) VALUES (?, ?, ?)').run(
    session.userId,
    old?.email || '',
    newEmail
  );
  return Response.json({ success: true, email: newEmail });
}
