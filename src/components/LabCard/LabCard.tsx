import Link from 'next/link';
import type { Lab } from '@/lib/labs';
import VulnBadge from '@/components/VulnBadge/VulnBadge';
import SeverityBar from '@/components/SeverityBar/SeverityBar';
import styles from './LabCard.module.css';

interface Props {
  lab: Lab;
  active?: boolean;
}

export default function LabCard({ lab, active = false }: Props) {
  return (
    <Link href={`/lab/${lab.slug}`} className={`${styles.card} ${active ? styles.active : ''}`}>
      <div className={styles.top}>
        <h3>{lab.title}</h3>
        <VulnBadge type={lab.vulnType} />
      </div>
      <p className={styles.subtitle}>{lab.subtitle}</p>
      <SeverityBar score={lab.cvssScore} />
    </Link>
  );
}
