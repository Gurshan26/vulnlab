import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { seedDatabase } from '../../../db/seed';

let app: any;

beforeAll(async () => {
  seedDatabase();
  const { createApp } = await import('../../../src/lib/test-app');
  app = createApp();
});

describe('VULNERABLE: IDOR on /api/vuln/users/[id]', () => {
  it('alice can read admin profile', async () => {
    const login = await request(app).post('/api/vuln/login').send({ username: 'alice', password: 'password' });
    const res = await request(app).get('/api/vuln/users/1').set('x-session-id', login.body.sessionId);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('admin');
    expect(res.body.user.password).toBeDefined();
  });
});

describe('PATCHED: IDOR blocked on /api/safe/users/[id]', () => {
  it('alice cannot read admin profile', async () => {
    const login = await request(app).post('/api/safe/login').send({ username: 'alice', password: 'password' });
    const res = await request(app).get('/api/safe/users/1').set('x-session-id', login.body.sessionId);
    expect(res.status).toBe(403);
  });

  it('alice can read her own profile', async () => {
    const login = await request(app).post('/api/safe/login').send({ username: 'alice', password: 'password' });
    const res = await request(app)
      .get(`/api/safe/users/${login.body.userId}`)
      .set('x-session-id', login.body.sessionId);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.password_secure).toBeUndefined();
  });
});
