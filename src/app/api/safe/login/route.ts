import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { ensureSeeded } from '@/lib/bootstrap';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  ensureSeeded();
  const db = getDb();
  const { username, password } = (await req.json()) as { username: string; password: string };

  const user = db
    .prepare('SELECT id, username, role, password_secure FROM users WHERE username = ?')
    .get(username) as
    | { id: number; username: string; role: 'user' | 'admin'; password_secure: string | null }
    | undefined;

  if (!user || !user.password_secure) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const ok = bcrypt.compareSync(password || '', user.password_secure);
  if (!ok) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = createSession(user.id);
  return Response.json({
    sessionId: session.id,
    userId: session.userId,
    username: session.username,
    role: session.role,
    csrfToken: session.csrfToken
  });
}
