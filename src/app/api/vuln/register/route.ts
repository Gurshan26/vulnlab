import { md5 } from '@/lib/auth';
import { ensureSeeded } from '@/lib/bootstrap';
import { getDb } from '@/lib/db';
import { isValidEmail, isValidUsername } from '@/lib/sanitise';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  ensureSeeded();
  const db = getDb();
  const { username, email, password } = (await req.json()) as {
    username: string;
    email: string;
    password: string;
  };

  if (!isValidUsername(username) || !isValidEmail(email) || !password) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, md5(password));
    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json({ error: 'User already exists' }, { status: 409 });
  }
}
