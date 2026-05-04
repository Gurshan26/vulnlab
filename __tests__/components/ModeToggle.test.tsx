import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ModeToggle from '../../src/components/ModeToggle/ModeToggle';

describe('ModeToggle', () => {
  it('renders both options', () => {
    render(<ModeToggle mode="vulnerable" onChange={() => {}} />);
    expect(screen.getByText('Vulnerable')).toBeInTheDocument();
    expect(screen.getByText('Patched')).toBeInTheDocument();
  });

  it('calls onChange', () => {
    const onChange = vi.fn();
    render(<ModeToggle mode="vulnerable" onChange={onChange} />);
    fireEvent.click(screen.getByText('Patched'));
    expect(onChange).toHaveBeenCalledWith('patched');
  });
});
