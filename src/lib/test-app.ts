import express, { type Request as ExRequest, type Response as ExResponse } from 'express';
import { ensureSeeded } from './bootstrap';

import * as vulnSearch from '@/app/api/vuln/search/route';
import * as safeSearch from '@/app/api/safe/search/route';
import * as vulnComments from '@/app/api/vuln/comments/route';
import * as safeComments from '@/app/api/safe/comments/route';
import * as vulnLogin from '@/app/api/vuln/login/route';
import * as safeLogin from '@/app/api/safe/login/route';
import * as vulnCsrf from '@/app/api/vuln/change-email/route';
import * as safeCsrf from '@/app/api/safe/change-email/route';
import * as vulnRegister from '@/app/api/vuln/register/route';
import * as safeRegister from '@/app/api/safe/register/route';
import * as vulnUsers from '@/app/api/vuln/users/[id]/route';
import * as safeUsers from '@/app/api/safe/users/[id]/route';

type RouteHandler = (req: Request, ctx?: any) => Promise<Response>;

function buildHeaders(req: ExRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers[key] = value.join(', ');
    else if (typeof value === 'string') headers[key] = value;
  }
  return headers;
}

async function invoke(
  handler: RouteHandler,
  req: ExRequest,
  res: ExResponse,
  ctx?: { params?: Record<string, string> }
): Promise<void> {
  const method = req.method.toUpperCase();
  const headers = buildHeaders(req);
  const init: RequestInit = { method, headers };

  if (!['GET', 'HEAD'].includes(method)) {
    init.body = JSON.stringify(req.body || {});
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
  }

  const request = new Request(`http://localhost${req.originalUrl}`, init);
  const response = ctx ? await handler(request, ctx) : await handler(request);

  const contentType = response.headers.get('content-type') || '';
  res.status(response.status);

  if (contentType.includes('application/json')) {
    const json = await response.json();
    res.json(json);
    return;
  }

  const text = await response.text();
  res.send(text);
}

export function createApp() {
  ensureSeeded();
  const app = express();
  app.use(express.json());

  app.get('/api/vuln/search', (req, res) => void invoke(vulnSearch.GET, req, res));
  app.get('/api/safe/search', (req, res) => void invoke(safeSearch.GET, req, res));

  app.get('/api/vuln/comments', (req, res) => void invoke(vulnComments.GET, req, res));
  app.post('/api/vuln/comments', (req, res) => void invoke(vulnComments.POST, req, res));
  app.get('/api/safe/comments', (req, res) => void invoke(safeComments.GET, req, res));
  app.post('/api/safe/comments', (req, res) => void invoke(safeComments.POST, req, res));

  app.post('/api/vuln/login', (req, res) => void invoke(vulnLogin.POST, req, res));
  app.post('/api/safe/login', (req, res) => void invoke(safeLogin.POST, req, res));

  app.post('/api/vuln/change-email', (req, res) => void invoke(vulnCsrf.POST, req, res));
  app.post('/api/safe/change-email', (req, res) => void invoke(safeCsrf.POST, req, res));

  app.post('/api/vuln/register', (req, res) => void invoke(vulnRegister.POST, req, res));
  app.post('/api/safe/register', (req, res) => void invoke(safeRegister.POST, req, res));

  app.get('/api/vuln/users/:id', (req, res) =>
    void invoke(vulnUsers.GET, req, res, { params: { id: req.params.id } })
  );
  app.get('/api/safe/users/:id', (req, res) =>
    void invoke(safeUsers.GET, req, res, { params: { id: req.params.id } })
  );

  return app;
}
