import styles from './SeverityBar.module.css';

export default function SeverityBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const tone = score >= 9 ? 'critical' : score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';
  return (
    <div className={styles.wrap} aria-label={`CVSS ${score}`}>
      <div className={styles.track}>
        <div className={`${styles.fill} ${styles[tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.label}>CVSS {score.toFixed(1)}</span>
    </div>
  );
}
