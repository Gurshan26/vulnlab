'use client';

import { useEffect } from 'react';
import styles from './ModeToggle.module.css';

interface ModeToggleProps {
  mode: 'vulnerable' | 'patched';
  onChange: (mode: 'vulnerable' | 'patched') => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'vulnerable') {
      root.style.setProperty('--mode-primary', 'var(--vuln-primary)');
      root.style.setProperty('--mode-bg', 'var(--vuln-bg)');
      root.style.setProperty('--mode-border', 'var(--vuln-border)');
    } else {
      root.style.setProperty('--mode-primary', 'var(--patch-primary)');
      root.style.setProperty('--mode-bg', 'var(--patch-bg)');
      root.style.setProperty('--mode-border', 'var(--patch-border)');
    }
  }, [mode]);

  return (
    <div className={styles.toggle} role="group" aria-label="Lab mode">
      <button
        className={`${styles.option} ${mode === 'vulnerable' ? styles.activeVuln : ''}`}
        onClick={() => onChange('vulnerable')}
        aria-pressed={mode === 'vulnerable'}
        data-mode="vulnerable"
      >
        Vulnerable
      </button>
      <button
        className={`${styles.option} ${mode === 'patched' ? styles.activePatch : ''}`}
        onClick={() => onChange('patched')}
        aria-pressed={mode === 'patched'}
        data-mode="patched"
      >
        Patched
      </button>
    </div>
  );
}
