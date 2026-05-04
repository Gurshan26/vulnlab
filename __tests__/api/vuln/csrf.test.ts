import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { seedDatabase } from '../../../db/seed';

let app: any;

beforeAll(async () => {
  seedDatabase();
  const { createApp } = await import('../../../src/lib/test-app');
  app = createApp();
});

describe('VULNERABLE: CSRF on /api/vuln/change-email', () => {
  it('changes email without csrf token', async () => {
    const login = await request(app).post('/api/vuln/login').send({ username: 'bob', password: 'hunter2' });
    const res = await request(app)
      .post('/api/vuln/change-email')
      .set('Origin', 'http://evil.com')
      .send({ sessionId: login.body.sessionId, newEmail: 'attacker@evil.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('PATCHED: CSRF blocked on /api/safe/change-email', () => {
  it('rejects missing token', async () => {
    const login = await request(app).post('/api/safe/login').send({ username: 'bob', password: 'hunter2' });
    const res = await request(app)
      .post('/api/safe/change-email')
      .send({ sessionId: login.body.sessionId, newEmail: 'attacker@evil.com' });

    expect(res.status).toBe(403);
  });

  it('rejects wrong token', async () => {
    const login = await request(app).post('/api/safe/login').send({ username: 'bob', password: 'hunter2' });
    const res = await request(app)
      .post('/api/safe/change-email')
      .send({ sessionId: login.body.sessionId, csrfToken: 'bad', newEmail: 'attacker@evil.com' });

    expect(res.status).toBe(403);
  });

  it('accepts correct token', async () => {
    const login = await request(app).post('/api/safe/login').send({ username: 'bob', password: 'hunter2' });
    const res = await request(app).post('/api/safe/change-email').send({
      sessionId: login.body.sessionId,
      csrfToken: login.body.csrfToken,
      newEmail: 'bob.new@example.com'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
