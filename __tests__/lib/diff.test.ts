import { describe, expect, it } from 'vitest';
import { computeLineDiff } from '../../src/lib/diff';

describe('computeLineDiff', () => {
  it('returns diff segments', () => {
    const diff = computeLineDiff('a\nb\n', 'a\nc\n');
    expect(diff.length).toBeGreaterThan(0);
  });
});
