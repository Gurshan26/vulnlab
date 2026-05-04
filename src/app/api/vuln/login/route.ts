import { createSession, md5 } from '@/lib/auth';
import { ensureSeeded } from '@/lib/bootstrap';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  ensureSeeded();
  const db = getDb();
  const { username, password } = (await req.json()) as { username: string; password: string };
  const md5Password = md5(password || '');

  const query = `SELECT * FROM users WHERE username='${username}' AND password='${md5Password}'`;
  const user = db.prepare(query).get() as
    | { id: number; username: string; role: 'user' | 'admin' }
    | undefined;

  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = createSession(user.id);
  return Response.json({ sessionId: session.id, userId: session.userId, username: session.username, role: session.role });
}
