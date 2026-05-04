import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import LabShell from '../../src/components/LabShell/LabShell';
import { LABS } from '../../src/lib/labs';

describe('LabShell user-focused flow', () => {
  it('renders account panel and can reset demo credentials', () => {
    render(<LabShell labs={LABS} lab={LABS[0]} />);

    expect(screen.getByText('Use Your Own Account')).toBeInTheDocument();

    const username = screen.getByTestId('user-username') as HTMLInputElement;
    const email = screen.getByTestId('user-email') as HTMLInputElement;
    const password = screen.getByTestId('user-password') as HTMLInputElement;

    fireEvent.change(username, { target: { value: 'custom_user' } });
    fireEvent.change(email, { target: { value: 'custom@example.com' } });
    fireEvent.change(password, { target: { value: 'custompass' } });

    fireEvent.click(screen.getByText('Fill Demo User'));

    expect(username.value).toBe('alice');
    expect(email.value).toBe('alice@example.com');
    expect(password.value).toBe('password');
  });
});
