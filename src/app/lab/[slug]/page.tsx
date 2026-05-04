import { notFound } from 'next/navigation';
import LabShell from '@/components/LabShell/LabShell';
import { getLabBySlug, LABS } from '@/lib/labs';

interface Props {
  params: {
    slug: string;
  };
}

export default function LabPage({ params }: Props) {
  const lab = getLabBySlug(params.slug);
  if (!lab) return notFound();
  return <LabShell labs={LABS} lab={lab} />;
}
