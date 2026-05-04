import { getSession } from '@/lib/auth';
import { ensureSeeded } from '@/lib/bootstrap';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  ensureSeeded();
  const db = getDb();
  const comments = db.prepare('SELECT id, user_id, username, content, created_at FROM comments ORDER BY id DESC').all();
  return Response.json({ comments });
}

export async function POST(req: Request) {
  ensureSeeded();
  const db = getDb();
  const { content, sessionId } = (await req.json()) as { content: string; sessionId: string };
  const session = getSession(sessionId);
  if (!session) return Response.json({ error: 'Not logged in' }, { status: 401 });

  db.prepare('INSERT INTO comments (user_id, username, content) VALUES (?, ?, ?)').run(
    session.userId,
    session.username,
    content
  );

  return Response.json({ success: true }, { status: 201 });
}
