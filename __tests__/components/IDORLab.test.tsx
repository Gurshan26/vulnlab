import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import IDORLab from '../../src/components/labs/IDORLab';
import { getLabBySlug } from '../../src/lib/labs';

const lab = getLabBySlug('idor');
if (!lab) throw new Error('idor lab metadata missing');

describe('IDORLab user session requirements', () => {
  it('requires active session before profile fetch', async () => {
    render(<IDORLab mode="vulnerable" lab={lab} activeSession={null} />);

    fireEvent.click(screen.getByText('Fetch Profile'));

    expect(await screen.findByText(/No active session/i)).toBeInTheDocument();
  });
});
