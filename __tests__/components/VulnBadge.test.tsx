import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import VulnBadge from '../../src/components/VulnBadge/VulnBadge';

describe('VulnBadge', () => {
  it('renders XSS badge', () => {
    render(<VulnBadge type="XSS" />);
    expect(screen.getByText('XSS')).toBeInTheDocument();
  });

  it('has aria label', () => {
    render(<VulnBadge type="SQLi" />);
    expect(screen.getByLabelText(/SQLi/i)).toBeInTheDocument();
  });
});
