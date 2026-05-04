import { ensureSeeded } from '@/lib/bootstrap';
import { escapeHtml } from '@/lib/sanitise';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  ensureSeeded();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const strippedHandlers = query
    .replace(/on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '');
  return Response.json({ query: escapeHtml(strippedHandlers), results: [] });
}
