import { getSession } from '@/lib/auth';
import { ensureSeeded } from '@/lib/bootstrap';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  ensureSeeded();
  const db = getDb();
  const sessionId = req.headers.get('x-session-id');
  const session = getSession(sessionId);
  if (!session) return Response.json({ error: 'Not logged in' }, { status: 401 });

  const targetId = Number.parseInt(params.id, 10);
  if (Number.isNaN(targetId)) return Response.json({ error: 'Invalid user id' }, { status: 400 });

  if (session.userId !== targetId && session.role !== 'admin') {
    return Response.json({ error: 'Access denied' }, { status: 403 });
  }

  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(targetId);
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  return Response.json({ user });
}
