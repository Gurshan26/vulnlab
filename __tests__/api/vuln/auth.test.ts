import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { seedDatabase } from '../../../db/seed';

let app: any;

beforeAll(async () => {
  seedDatabase();
  const { createApp } = await import('../../../src/lib/test-app');
  app = createApp();
});

const md5 = (s: string) => crypto.createHash('md5').update(s).digest('hex');

describe('VULNERABLE: broken auth (MD5)', () => {
  it('registers via vulnerable route', async () => {
    const res = await request(app)
      .post('/api/vuln/register')
      .send({ username: `u_${Date.now()}`, email: `u_${Date.now()}@e.com`, password: 'password123' });
    expect(res.status).toBe(201);
  });

  it('known md5 hash matches password', () => {
    expect(md5('password')).toBe('5f4dcc3b5aa765d61d8327deb882cf99');
  });

  it('same password same hash (no salt)', () => {
    expect(md5('hunter2')).toBe(md5('hunter2'));
  });
});

describe('PATCHED: bcrypt auth', () => {
  it('registers via safe route', async () => {
    const user = `s_${Date.now()}`;
    const res = await request(app)
      .post('/api/safe/register')
      .send({ username: user, email: `${user}@e.com`, password: 'password123' });
    expect(res.status).toBe(201);
  });

  it('same password yields different bcrypt hashes', async () => {
    const a = await bcrypt.hash('password', 12);
    const b = await bcrypt.hash('password', 12);
    expect(a).not.toBe(b);
  });

  it('bcrypt compare works', async () => {
    const h = await bcrypt.hash('password123', 12);
    expect(await bcrypt.compare('password123', h)).toBe(true);
    expect(await bcrypt.compare('wrong', h)).toBe(false);
  });
});
