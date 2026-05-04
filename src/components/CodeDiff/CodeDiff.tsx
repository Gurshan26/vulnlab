'use client';

import type { CodeDiff as CodeDiffType } from '@/lib/labs';
import styles from './CodeDiff.module.css';

interface Props {
  diff: CodeDiffType;
  mode: 'vulnerable' | 'patched';
}

export default function CodeDiff({ diff, mode }: Props) {
  const lines = (mode === 'vulnerable' ? diff.vulnerable : diff.patched).split('\n');
  const label = mode === 'vulnerable' ? 'VULNERABLE CODE' : 'PATCHED CODE';

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${mode === 'vulnerable' ? styles.vulnHeader : styles.safeHeader}`}>
        <span className={styles.filename}>{diff.filename}</span>
        <span className={styles.label}>{label}</span>
      </div>

      <div className={styles.code}>
        {lines.map((line, idx) => {
          const markVuln = mode === 'vulnerable' && line.includes('← vulnerable');
          const markSafe = mode === 'patched' && (line.includes('← fixed') || line.includes('← safe'));
          return (
            <div key={`${idx}-${line}`} className={`${styles.row} ${markVuln ? styles.remove : ''} ${markSafe ? styles.add : ''}`}>
              <span className={styles.num}>{idx + 1}</span>
              <span className={styles.line}>{line}</span>
            </div>
          );
        })}
      </div>

      <p className={styles.explain}>{diff.explanation}</p>
    </div>
  );
}
