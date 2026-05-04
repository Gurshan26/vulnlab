import { ensureSeeded } from '@/lib/bootstrap';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  ensureSeeded();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  return Response.json({ query, results: [] });
}
