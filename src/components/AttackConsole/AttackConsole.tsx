'use client';

import { useMemo, useState } from 'react';
import type { Payload } from '@/lib/labs';
import styles from './AttackConsole.module.css';

interface Props {
  payloads: Payload[];
  mode: 'vulnerable' | 'patched';
  onLaunch: (payload: string) => Promise<{ success: boolean; output: string }>;
}

export default function AttackConsole({ payloads, mode, onLaunch }: Props) {
  const [selectedPayload, setSelectedPayload] = useState(payloads[0]?.value || '');
  const [customPayload, setCustomPayload] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<{ success: boolean; text: string } | null>(null);

  const activePayload = useMemo(() => (useCustom ? customPayload : selectedPayload), [customPayload, selectedPayload, useCustom]);

  const selectedMeta = payloads.find((p) => p.value === selectedPayload);

  async function launch() {
    if (!activePayload.trim()) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await onLaunch(activePayload);
      setOutput({ success: res.success, text: res.output });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setOutput({ success: false, text: `Error: ${message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.console}>
      <div className={styles.headerRow}>
        <h3>Attack Console</h3>
        {mode === 'patched' ? <span className={styles.badge}>Defence active</span> : null}
      </div>

      <label className={styles.label}>Payload library</label>
      <select
        className={`${styles.select} code`}
        value={useCustom ? '__custom' : selectedPayload}
        onChange={(e) => {
          if (e.target.value === '__custom') {
            setUseCustom(true);
            return;
          }
          setUseCustom(false);
          setSelectedPayload(e.target.value);
        }}
      >
        {payloads.map((p) => (
          <option key={p.label} value={p.value}>
            {p.label}
          </option>
        ))}
        <option value="__custom">Custom payload...</option>
      </select>

      {!useCustom && selectedMeta ? <p className={styles.desc}>{selectedMeta.description}</p> : null}

      <label className={styles.label}>{useCustom ? 'Custom payload' : 'Selected payload'}</label>
      <textarea
        className={`${styles.textarea} code`}
        value={activePayload}
        onChange={(e) => {
          if (!useCustom) setUseCustom(true);
          setCustomPayload(e.target.value);
        }}
        rows={4}
        placeholder="Payload here..."
        spellCheck={false}
      />

      <button
        className={`${styles.launch} ${mode === 'vulnerable' ? styles.vuln : styles.safe}`}
        onClick={launch}
        disabled={loading || !activePayload.trim()}
        data-action="launch-attack"
      >
        {loading ? 'Running...' : mode === 'vulnerable' ? 'Launch Attack' : 'Test Defence'}
      </button>

      {output ? (
        <div className={`${styles.output} ${output.success ? styles.success : styles.blocked}`}>
          <span className={`${styles.text} code`}>{output.text}</span>
        </div>
      ) : null}
    </div>
  );
}
