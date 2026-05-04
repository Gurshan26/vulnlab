import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { seedDatabase } from '../../../db/seed';

let app: any;

beforeAll(async () => {
  seedDatabase();
  const { createApp } = await import('../../../src/lib/test-app');
  app = createApp();
});

describe('VULNERABLE: Reflected XSS on /api/vuln/search', () => {
  it('returns raw query', async () => {
    const payload = '<script>alert("xss")</script>';
    const res = await request(app).get(`/api/vuln/search?q=${encodeURIComponent(payload)}`);
    expect(res.status).toBe(200);
    expect(res.body.query).toBe(payload);
  });

  it('returns raw onerror payload', async () => {
    const payload = '<img src=x onerror="alert(1)">';
    const res = await request(app).get(`/api/vuln/search?q=${encodeURIComponent(payload)}`);
    expect(res.body.query).toContain('onerror');
  });
});

describe('PATCHED: Reflected XSS blocked on /api/safe/search', () => {
  it('escapes script tags', async () => {
    const payload = '<script>alert("xss")</script>';
    const res = await request(app).get(`/api/safe/search?q=${encodeURIComponent(payload)}`);
    expect(res.status).toBe(200);
    expect(res.body.query).not.toContain('<script>');
    expect(res.body.query).toContain('&lt;script&gt;');
  });

  it('strips event handlers from payload text', async () => {
    const payload = '<img src=x onerror="alert(1)">';
    const res = await request(app).get(`/api/safe/search?q=${encodeURIComponent(payload)}`);
    expect(res.body.query).not.toContain('onerror=');
    expect(res.body.query).toContain('&lt;img');
  });
});

describe('VULNERABLE: Stored XSS on /api/vuln/comments', () => {
  it('stores raw comment payload', async () => {
    const loginRes = await request(app).post('/api/vuln/login').send({ username: 'alice', password: 'password' });
    const sessionId = loginRes.body.sessionId;

    const payload = '<script>document.title="HACKED"</script>';
    const postRes = await request(app).post('/api/vuln/comments').send({ content: payload, sessionId });
    expect(postRes.status).toBe(201);

    const getRes = await request(app).get('/api/vuln/comments');
    const found = getRes.body.comments.find((c: any) => c.content === payload);
    expect(found).toBeDefined();
  });
});

describe('PATCHED: Stored XSS blocked on /api/safe/comments', () => {
  it('stores escaped payload for safe rendering', async () => {
    const loginRes = await request(app).post('/api/safe/login').send({ username: 'alice', password: 'password' });
    const sessionId = loginRes.body.sessionId;

    const payload = '<script>alert("stored")</script>';
    await request(app).post('/api/safe/comments').send({ content: payload, sessionId });

    const getRes = await request(app).get('/api/safe/comments');
    expect(getRes.status).toBe(200);
    const found = getRes.body.comments.find((c: any) => c.content.includes('&lt;script&gt;'));
    expect(found).toBeDefined();
  });
});
