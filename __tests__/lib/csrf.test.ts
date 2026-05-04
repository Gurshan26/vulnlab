import { describe, expect, it } from 'vitest';
import { generateCsrfToken, validateCsrfToken } from '../../src/lib/csrf';

describe('csrf token helpers', () => {
  it('generates 64-char hex', () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it('validation works', () => {
    const token = generateCsrfToken();
    expect(validateCsrfToken(token, token)).toBe(true);
    expect(validateCsrfToken(token, generateCsrfToken())).toBe(false);
    expect(validateCsrfToken(null, token)).toBe(false);
    expect(validateCsrfToken('', token)).toBe(false);
  });
});
