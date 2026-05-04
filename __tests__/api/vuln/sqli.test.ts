import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { seedDatabase } from '../../../db/seed';

let app: any;

beforeAll(async () => {
  seedDatabase();
  const { createApp } = await import('../../../src/lib/test-app');
  app = createApp();
});

describe('VULNERABLE: SQLi on /api/vuln/login', () => {
  it('allows login with valid credentials', async () => {
    const res = await request(app).post('/api/vuln/login').send({ username: 'alice', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('alice');
  });

  it("ATTACK: bypasses with admin' --", async () => {
    const res = await request(app).post('/api/vuln/login').send({ username: "admin' --", password: 'x' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('admin');
  });

  it('ATTACK: OR 1=1 works', async () => {
    const res = await request(app).post('/api/vuln/login').send({ username: "' OR '1'='1' --", password: 'x' });
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
  });
});

describe('PATCHED: SQLi blocked on /api/safe/login', () => {
  it('valid credentials still work', async () => {
    const res = await request(app).post('/api/safe/login').send({ username: 'alice', password: 'password' });
    expect(res.status).toBe(200);
  });

  it("BLOCKED: admin' -- fails", async () => {
    const res = await request(app).post('/api/safe/login').send({ username: "admin' --", password: 'x' });
    expect(res.status).toBe(401);
  });

  it('BLOCKED: OR 1=1 fails', async () => {
    const res = await request(app).post('/api/safe/login').send({ username: "' OR '1'='1' --", password: 'x' });
    expect(res.status).toBe(401);
  });
});
