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

  const user = db
    .prepare('SELECT id, username, email, role, password, password_secure, created_at FROM users WHERE id = ?')
    .get(params.id);

  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  return Response.json({ user });
}
