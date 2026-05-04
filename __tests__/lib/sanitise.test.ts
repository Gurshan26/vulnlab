import { describe, expect, it } from 'vitest';
import { escapeHtml, isValidEmail, isValidUsername, stripHtml } from '../../src/lib/sanitise';

describe('escapeHtml', () => {
  it('escapes all required characters', () => {
    const value = `<script>alert('x') & / \"</script>`;
    const escaped = escapeHtml(value);
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&#x27;');
    expect(escaped).toContain('&amp;');
    expect(escaped).toContain('&#x2F;');
    expect(escaped).toContain('&quot;');
  });
});

describe('stripHtml', () => {
  it('removes tags', () => {
    expect(stripHtml('<b>hi</b>')).toBe('hi');
  });
});

describe('validators', () => {
  it('validates email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('bad')).toBe(false);
  });

  it('validates username', () => {
    expect(isValidUsername('user_123')).toBe(true);
    expect(isValidUsername('bad name')).toBe(false);
  });
});
