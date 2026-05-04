import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeDiff from '../../src/components/CodeDiff/CodeDiff';

describe('CodeDiff', () => {
  it('renders vulnerable and explanation', () => {
    render(
      <CodeDiff
        mode="vulnerable"
        diff={{
          filename: 'test.ts',
          vulnerable: 'a // ← vulnerable',
          patched: 'b // ← fixed',
          explanation: 'use safe code'
        }}
      />
    );

    expect(screen.getByText('test.ts')).toBeInTheDocument();
    expect(screen.getByText(/use safe code/i)).toBeInTheDocument();
  });
});
