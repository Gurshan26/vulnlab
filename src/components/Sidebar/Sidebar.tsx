import type { Lab } from '@/lib/labs';
import LabCard from '@/components/LabCard/LabCard';
import styles from './Sidebar.module.css';

interface Props {
  labs: Lab[];
  activeSlug?: string;
}

export default function Sidebar({ labs, activeSlug }: Props) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.heading}>Labs</h2>
      <div className={styles.list}>
        {labs.map((lab) => (
          <LabCard key={lab.slug} lab={lab} active={lab.slug === activeSlug} />
        ))}
      </div>
    </aside>
  );
}
