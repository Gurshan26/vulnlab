'use client';

import { useState } from 'react';
import AttackConsole from '@/components/AttackConsole/AttackConsole';
import Terminal from '@/components/shared/Terminal';
import type { Lab } from '@/lib/labs';
import type { ActiveSession, Mode } from '@/types';
import styles from './labs.module.css';

interface Props {
  mode: Mode;
  lab: Lab;
  activeSession: ActiveSession | null;
}

export default function CSRFLab({ mode, lab, activeSession }: Props) {
  const [email, setEmail] = useState('new@example.com');
  const [output, setOutput] = useState('Log in from the account panel first.');

  async function legitChange(): Promise<void> {
    if (!activeSession?.sessionId) {
      setOutput('No active session. Log in from the account panel first.');
      return;
    }

    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const body: Record<string, string> = { newEmail: email, sessionId: activeSession.sessionId };
    if (mode === 'patched' && activeSession.csrfToken) body.csrfToken = activeSession.csrfToken;

    const res = await fetch(`/api/${route}/change-email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    setOutput(res.ok ? `Email changed to ${data.email}` : `${res.status} ${data.error}`);
  }

  async function launchAttack(payload: string): Promise<{ success: boolean; output: string }> {
    if (!activeSession?.sessionId) {
      const text = 'No active session. Log in from the account panel first.';
      setOutput(text);
      return { success: false, output: text };
    }

    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const res = await fetch(`/api/${route}/change-email`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Origin: 'http://evil.com',
        Referer: 'http://evil.com/attack'
      },
      body: JSON.stringify({ newEmail: 'attacker@evil.com', sessionId: activeSession.sessionId })
    });
    const data = await res.json();
    const text = `${res.status} ${data.error || data.email || payload}`;
    setOutput(text);
    return { success: res.ok, output: text };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3>Change Email</h3>
        <p className={styles.copy}>In vulnerable mode, forged requests still succeed.</p>
        <div className={styles.row}>
          <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className={styles.button} onClick={() => void legitChange()}>
            Change Email
          </button>
        </div>
        <Terminal text={output} />
      </div>

      <AttackConsole payloads={lab.payloads} mode={mode} onLaunch={launchAttack} />
    </div>
  );
}
