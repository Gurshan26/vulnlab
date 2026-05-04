'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Lab } from '@/lib/labs';
import type { ActiveSession, Mode } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import ModeToggle from '@/components/ModeToggle/ModeToggle';
import CodeDiff from '@/components/CodeDiff/CodeDiff';
import XSSReflectedLab from '@/components/labs/XSSReflectedLab';
import XSSStoredLab from '@/components/labs/XSSStoredLab';
import SQLiLab from '@/components/labs/SQLiLab';
import CSRFLab from '@/components/labs/CSRFLab';
import AuthLab from '@/components/labs/AuthLab';
import IDORLab from '@/components/labs/IDORLab';
import styles from './LabShell.module.css';

interface Props {
  labs: Lab[];
  lab: Lab;
}

export default function LabShell({ labs, lab }: Props) {
  const [mode, setMode] = useState<Mode>('vulnerable');
  const [showDiff, setShowDiff] = useState(true);
  const [diffIndex, setDiffIndex] = useState(0);
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('password');
  const [email, setEmail] = useState('alice@example.com');
  const [authStatus, setAuthStatus] = useState('Use your own account: register, then log in.');
  const [sessions, setSessions] = useState<Record<Mode, ActiveSession | null>>({
    vulnerable: null,
    patched: null
  });

  const LabComponent = useMemo(() => {
    switch (lab.slug) {
      case 'xss-reflected':
        return XSSReflectedLab;
      case 'xss-stored':
        return XSSStoredLab;
      case 'sqli':
        return SQLiLab;
      case 'csrf':
        return CSRFLab;
      case 'broken-auth':
        return AuthLab;
      case 'idor':
        return IDORLab;
      default:
        return XSSReflectedLab;
    }
  }, [lab.slug]);

  const modeClass = mode === 'vulnerable' ? styles.vuln : styles.safe;
  const bannerText = mode === 'vulnerable' ? 'Vulnerable mode: attacks should work.' : 'Patched mode: same attacks should be blocked.';
  const activeSession = sessions[mode];

  useEffect(() => {
    const bodyChildren = Array.from(document.body.children);
    for (const element of bodyChildren) {
      const text = element.textContent?.trim() || '';
      if (/^⚠️?\s*XSS:\s*Session hijacked!\s*Cookie:/i.test(text)) {
        element.remove();
      }
    }
  }, [mode, lab.slug]);

  async function registerUser(): Promise<void> {
    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const res = await fetch(`/api/${route}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthStatus(`${res.status} ${data.error || 'Registration failed'}`);
      return;
    }
    setAuthStatus(`Registered ${username} in ${mode} mode. Now click Login.`);
  }

  async function loginUser(): Promise<void> {
    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const res = await fetch(`/api/${route}/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthStatus(`${res.status} ${data.error || 'Login failed'}`);
      return;
    }

    const nextSession: ActiveSession = {
      sessionId: data.sessionId,
      userId: data.userId,
      username: data.username,
      role: data.role,
      csrfToken: data.csrfToken
    };

    setSessions((prev) => ({ ...prev, [mode]: nextSession }));
    setAuthStatus(
      `Logged in as ${data.username} (${data.role || 'user'}) in ${mode} mode.`
    );
  }

  function useAliceDemo(): void {
    setUsername('alice');
    setPassword('password');
    setEmail('alice@example.com');
    setAuthStatus('Demo account filled. Click Login to start.');
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.banner} ${modeClass}`}>{bannerText}</div>
      <div className={styles.body}>
        <Sidebar labs={labs} activeSlug={lab.slug} />

        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1>{lab.title}</h1>
              <p>{lab.subtitle}</p>
            </div>
            <ModeToggle mode={mode} onChange={setMode} />
          </header>

          <section className={styles.userPanel}>
            <div className={styles.userTop}>
              <h2>Use Your Own Account</h2>
              <span className={styles.modePill}>{mode === 'vulnerable' ? 'Vulnerable API' : 'Patched API'}</span>
            </div>
            <p className={styles.userCopy}>
              Register and log in with your own credentials. Labs that need auth will run as your active session.
            </p>
            <div className={styles.userInputs}>
              <input
                className={styles.userInput}
                data-testid="user-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <input
                className={styles.userInput}
                data-testid="user-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <input
                className={styles.userInput}
                data-testid="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <div className={styles.userActions}>
              <button className={styles.userBtnGhost} onClick={useAliceDemo}>
                Fill Demo User
              </button>
              <button className={styles.userBtn} data-action="register-user" onClick={() => void registerUser()}>
                Register
              </button>
              <button className={styles.userBtn} data-action="login-user" onClick={() => void loginUser()}>
                Login
              </button>
            </div>
            <p className={styles.userStatus}>{authStatus}</p>
            <p className={styles.sessionLine}>
              Active session: {activeSession?.sessionId ? `${activeSession.username} (${activeSession.role || 'user'})` : 'none'}
            </p>
          </section>

          <section className={styles.livePane}>
            <LabComponent mode={mode} lab={lab} activeSession={activeSession} />
          </section>

          <section className={styles.diffPane}>
            <div className={styles.diffTop}>
              <h2>Code Diff + Why It Works</h2>
              <div className={styles.diffActions}>
                {lab.codeDiffs.length > 1 ? (
                  <select
                    value={diffIndex}
                    onChange={(e) => setDiffIndex(Number(e.target.value))}
                    className={styles.select}
                  >
                    {lab.codeDiffs.map((d, idx) => (
                      <option key={d.filename} value={idx}>
                        {d.filename}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button data-testid="show-diff" className={styles.toggleDiff} onClick={() => setShowDiff((s) => !s)}>
                  {showDiff ? 'Hide Diff' : 'Show Diff'}
                </button>
              </div>
            </div>

            {showDiff ? <CodeDiff diff={lab.codeDiffs[diffIndex]} mode={mode} /> : null}
          </section>
        </main>
      </div>
    </div>
  );
}
