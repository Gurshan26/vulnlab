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

export default function SQLiLab({ mode, lab }: Props) {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('password');
  const [output, setOutput] = useState('Run login to see response.');

  async function doLogin(override?: string): Promise<{ success: boolean; output: string }> {
    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const res = await fetch(`/api/${route}/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: override ?? username, password })
    });
    const data = await res.json();
    const message = res.ok
      ? `200 OK - Logged in as ${data.username}`
      : `${res.status} ${data.error || 'Invalid credentials'}`;
    setOutput(message);
    return { success: res.ok, output: message };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3>Login Form</h3>
        <p className={styles.copy}>Try logging in as <code className="code">admin' --</code> in vulnerable mode.</p>
        <div className={styles.grid2}>
          <input data-field="username" className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} />
          <input
            data-field="password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button data-action="login" className={styles.button} onClick={() => void doLogin()}>
          Login
        </button>
        <Terminal text={output} />
      </div>

      <AttackConsole
        payloads={lab.payloads}
        mode={mode}
        onLaunch={async (payload) => {
          setUsername(payload);
          return doLogin(payload);
        }}
      />
    </div>
  );
}
