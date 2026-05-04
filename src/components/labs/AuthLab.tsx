'use client';

import { useState } from 'react';
import bcrypt from 'bcryptjs';
import AttackConsole from '@/components/AttackConsole/AttackConsole';
import type { Lab } from '@/lib/labs';
import type { ActiveSession, Mode } from '@/types';
import styles from './labs.module.css';

interface Props {
  mode: Mode;
  lab: Lab;
  activeSession: ActiveSession | null;
}

export default function AuthLab({ mode, lab }: Props) {
  const [username, setUsername] = useState(`user_${Date.now()}`);
  const [email, setEmail] = useState(`user_${Date.now()}@example.com`);
  const [password, setPassword] = useState('password');
  const [md5Hash, setMd5Hash] = useState('');
  const [bcryptA, setBcryptA] = useState('');
  const [bcryptB, setBcryptB] = useState('');
  const [status, setStatus] = useState('');

  async function generate() {
    try {
      const md5Res = await fetch('/api/tools/md5', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value: password })
      });
      const md5Data = await md5Res.json();
      if (!md5Res.ok) {
        setStatus(`${md5Res.status} ${md5Data.error || 'Could not generate MD5 hash'}`);
        return;
      }

      const b1 = await bcrypt.hash(password, 12);
      const b2 = await bcrypt.hash(password, 12);
      setMd5Hash(md5Data.md5);
      setBcryptA(b1);
      setBcryptB(b2);
      setStatus('MD5 is deterministic and fast. bcrypt is salted and changes every run.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Failed to generate hashes: ${message}`);
    }
  }

  async function registerViaMode(payload: string): Promise<{ success: boolean; output: string }> {
    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const res = await fetch(`/api/${route}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, email, password: payload })
    });
    const data = await res.json();
    const text = res.ok ? `Registered ${username} (${route})` : `${res.status} ${data.error}`;
    setStatus(text);
    return { success: res.ok, output: text };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3>Password Hashing</h3>
        <p className={styles.copy}>MD5 of "password" should be <code className="code">5f4dcc3b5aa765d61d8327deb882cf99</code>.</p>
        <div className={styles.grid2}>
          <input className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username to register" />
          <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email to register" />
        </div>
        <div className={styles.row}>
          <input className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className={styles.button} onClick={() => void generate()}>
            Generate Hashes
          </button>
        </div>
        <div className={styles.table}>
          <div><strong>Plain:</strong> <span className="code">{password}</span></div>
          <div><strong>MD5:</strong> <span className="code">{md5Hash}</span></div>
          <div><strong>bcrypt #1:</strong> <span className="code">{bcryptA}</span></div>
          <div><strong>bcrypt #2:</strong> <span className="code">{bcryptB}</span></div>
        </div>
        <div className={styles.output}>{status}</div>
      </div>

      <AttackConsole payloads={lab.payloads} mode={mode} onLaunch={registerViaMode} />
    </div>
  );
}
