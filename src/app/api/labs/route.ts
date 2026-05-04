import { LABS } from '@/lib/labs';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ labs: LABS.map((lab) => ({
    slug: lab.slug,
    title: lab.title,
    subtitle: lab.subtitle,
    vulnType: lab.vulnType,
    severity: lab.severity,
    cvssScore: lab.cvssScore
  })) });
}
