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

export default function IDORLab({ mode, lab, activeSession }: Props) {
  const [targetId, setTargetId] = useState('1');
  const [output, setOutput] = useState('Log in from the account panel first.');

  async function fetchUser(idOverride?: string): Promise<{ success: boolean; output: string }> {
    if (!activeSession?.sessionId) {
      const text = 'No active session. Log in from the account panel first.';
      setOutput(text);
      return { success: false, output: text };
    }

    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const id = idOverride ?? targetId;
    const res = await fetch(`/api/${route}/users/${id}`, {
      headers: { 'x-session-id': activeSession.sessionId }
    });
    const data = await res.json();
    const text = res.ok ? JSON.stringify(data.user, null, 2) : `${res.status} ${data.error}`;
    setOutput(text);
    return { success: res.ok, output: text };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3>User Profile API</h3>
        <p className={styles.copy}>In vulnerable mode, any logged-in user can request admin by changing only the ID.</p>
        <div className={styles.row}>
          <input className={styles.input} value={targetId} onChange={(e) => setTargetId(e.target.value)} />
          <button className={styles.button} onClick={() => void fetchUser()}>
            Fetch Profile
          </button>
        </div>
        <Terminal text={output} />
      </div>

      <AttackConsole
        payloads={lab.payloads}
        mode={mode}
        onLaunch={async (payload) => {
          const match = payload.match(/\/users\/(\d+)/);
          if (match) {
            setTargetId(match[1]);
            return fetchUser(match[1]);
          }
          return fetchUser('1');
        }}
      />
    </div>
  );
}
