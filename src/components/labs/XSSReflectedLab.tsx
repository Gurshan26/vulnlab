'use client';

import { useRef, useState } from 'react';
import AttackConsole from '@/components/AttackConsole/AttackConsole';
import type { Lab } from '@/lib/labs';
import type { ActiveSession, Mode } from '@/types';
import styles from './labs.module.css';

interface Props {
  mode: Mode;
  lab: Lab;
  activeSession: ActiveSession | null;
}

export default function XSSReflectedLab({ mode, lab }: Props) {
  const [query, setQuery] = useState('');
  const [displayQuery, setDisplayQuery] = useState('');
  const [status, setStatus] = useState('');
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  async function runSearch(override?: string): Promise<{ success: boolean; output: string }> {
    const value = override ?? query;
    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const res = await fetch(`/api/${route}/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setDisplayQuery(data.query || '');

    if (mode === 'vulnerable' && frameRef.current) {
      frameRef.current.srcdoc = `<div style="font-family:sans-serif;padding:16px">Results for: ${data.query}</div>`;
    }

    const output = mode === 'vulnerable' ? 'Payload reflected unsanitised. If executable HTML is present, browser runs it.' : 'Payload escaped/sanitised. No script execution.';
    setStatus(output);
    return { success: mode === 'vulnerable', output };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3>Search Box</h3>
        <p className={styles.copy}>This is real reflected XSS. Paste a payload and run search.</p>
        <div className={styles.row}>
          <input
            data-testid="search-input"
            className={styles.input}
            placeholder="Search query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button data-action="search" className={styles.button} onClick={() => runSearch()}>
            Search
          </button>
        </div>
        {mode === 'vulnerable' ? (
          <iframe ref={frameRef} className={styles.frame} title="vuln-frame" sandbox="allow-scripts" />
        ) : (
          <div className={styles.resultBox}>Results for: {displayQuery}</div>
        )}
      </div>

      <AttackConsole
        payloads={lab.payloads}
        mode={mode}
        onLaunch={async (payload) => {
          setQuery(payload);
          return runSearch(payload);
        }}
      />

      <div className={styles.output}>{status}</div>
    </div>
  );
}
