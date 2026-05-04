import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../src/lib/db';

const md5 = (s: string) => crypto.createHash('md5').update(s).digest('hex');

export function seedDatabase(): void {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c > 0) return;

  const users = [
    { username: 'admin', email: 'admin@vulnlab.dev', password: 'admin123', role: 'admin' },
    { username: 'alice', email: 'alice@example.com', password: 'password', role: 'user' },
    { username: 'bob', email: 'bob@example.com', password: 'hunter2', role: 'user' },
    { username: 'charlie', email: 'charlie@example.com', password: 'qwerty', role: 'user' }
  ] as const;

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (username, email, password, password_secure, role) VALUES (?, ?, ?, ?, ?)'
  );

  for (const user of users) {
    insertUser.run(user.username, user.email, md5(user.password), bcrypt.hashSync(user.password, 12), user.role);
  }

  const commentCount = db.prepare('SELECT COUNT(*) as c FROM comments').get() as { c: number };
  if (commentCount.c > 0) return;

  const insertComment = db.prepare(
    'INSERT INTO comments (user_id, username, content, content_safe) VALUES (?, ?, ?, ?)'
  );

  const xssPayload = `<img src=x onerror="this.style.display='none'; var b=document.createElement('div'); b.innerHTML='<h2 style=color:red;padding:12px>XSS: Session hijacked! Cookie: '+document.cookie+'</h2>'; document.body.prepend(b)">`;
  const safePayload = xssPayload
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  insertComment.run(2, 'alice', 'Hey everyone, great app!', 'Hey everyone, great app!');
  insertComment.run(3, 'bob', 'Really useful tutorial.', 'Really useful tutorial.');
  insertComment.run(2, 'alice', xssPayload, safePayload);
  insertComment.run(4, 'charlie', 'Checking in.', 'Checking in.');

  console.log('Database seeded with demo users and comments.');
  console.log('Users: admin/admin123, alice/password, bob/hunter2, charlie/qwerty');
}

if (require.main === module) {
  seedDatabase();
}
