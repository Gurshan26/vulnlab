import type { VulnType } from '@/lib/labs';
import styles from './VulnBadge.module.css';

const COLOURS: Record<VulnType, { bg: string; text: string }> = {
  XSS: { bg: '#ffe3e3', text: '#c92a2a' },
  SQLi: { bg: '#fff3bf', text: '#864d0e' },
  CSRF: { bg: '#e7f5ff', text: '#1864ab' },
  'Broken Auth': { bg: '#f3f0ff', text: '#5f3dc4' },
  IDOR: { bg: '#ebfbee', text: '#2b8a3e' }
};

export default function VulnBadge({ type }: { type: VulnType }) {
  const cfg = COLOURS[type];
  return (
    <span className={styles.badge} style={{ background: cfg.bg, color: cfg.text }} aria-label={`Vulnerability type: ${type}`}>
      {type}
    </span>
  );
}
