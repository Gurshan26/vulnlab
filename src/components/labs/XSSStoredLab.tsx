'use client';

import { useEffect, useMemo, useState } from 'react';
import AttackConsole from '@/components/AttackConsole/AttackConsole';
import type { Lab } from '@/lib/labs';
import type { ActiveSession, Mode } from '@/types';
import styles from './labs.module.css';

interface Comment {
  id: number;
  username: string;
  content: string;
}

interface Props {
  mode: Mode;
  lab: Lab;
  activeSession: ActiveSession | null;
}

export default function XSSStoredLab({ mode, lab, activeSession }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const vulnerableCommentsDoc = useMemo(() => {
    const list = comments
      .slice(0, 6)
      .map((c) => {
        const safeUsername = c.username
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<article style="border-bottom:1px solid #e9ecef;padding-bottom:8px;margin-bottom:8px">
  <strong>${safeUsername}</strong>
  <div>${c.content}</div>
</article>`;
      })
      .join('');

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; padding: 10px; font-family: sans-serif; background: #f1f3f5; color: #212529; }
    </style>
  </head>
  <body>${list || '<p>No comments yet.</p>'}</body>
</html>`;
  }, [comments]);

  async function refreshComments() {
    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const res = await fetch(`/api/${route}/comments`);
    const data = await res.json();
    setComments(data.comments || []);
  }

  useEffect(() => {
    void refreshComments();
  }, [mode]);

  async function postComment(override?: string): Promise<{ success: boolean; output: string }> {
    if (!activeSession?.sessionId) {
      const output = 'No active session. Use the account panel above and click Login first.';
      setStatus(output);
      return { success: false, output };
    }

    const route = mode === 'vulnerable' ? 'vuln' : 'safe';
    const payload = override ?? content;
    const res = await fetch(`/api/${route}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: payload, sessionId: activeSession.sessionId })
    });
    if (!res.ok) return { success: false, output: 'Comment post failed.' };
    await refreshComments();
    const output = mode === 'vulnerable' ? 'Stored raw payload. Anyone loading this page is exposed.' : 'Stored escaped payload. Rendered as plain text.';
    setStatus(output);
    return { success: mode === 'vulnerable', output };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3>Comment Board</h3>
        <p className={styles.copy}>Stored XSS persists. One payload can hit every visitor. You post as the currently logged-in user.</p>
        <div className={styles.row}>
          <input className={styles.input} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a comment" />
          <button className={styles.button} onClick={() => void postComment()}>
            Post
          </button>
        </div>
        {mode === 'vulnerable' ? (
          <iframe
            className={styles.commentsFrame}
            title="stored-xss-sandbox"
            sandbox="allow-scripts allow-modals"
            srcDoc={vulnerableCommentsDoc}
          />
        ) : (
          <div className={styles.comments}>
            {comments.slice(0, 6).map((c) => (
              <div key={c.id} className={styles.commentRow}>
                <strong>{c.username}</strong>
                <div>{c.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AttackConsole payloads={lab.payloads} mode={mode} onLaunch={postComment} />
      <div className={styles.output}>{status}</div>
    </div>
  );
}
