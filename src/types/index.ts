export type Mode = 'vulnerable' | 'patched';

export interface ActiveSession {
  sessionId: string;
  userId?: number;
  username?: string;
  role?: 'user' | 'admin';
  csrfToken?: string;
}
