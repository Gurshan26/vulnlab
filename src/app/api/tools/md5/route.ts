import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { value } = (await req.json()) as { value?: string };

  if (typeof value !== 'string') {
    return Response.json({ error: 'Invalid value' }, { status: 400 });
  }

  const md5 = crypto.createHash('md5').update(value).digest('hex');
  return Response.json({ md5 });
}
