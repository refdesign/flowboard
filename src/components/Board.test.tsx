import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryBuilder } from '../test/mockSupabase';

vi.mock('../lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../lib/supabaseClient';
import { Board } from './Board';

function mockInitialLoad(rows: unknown[]) {
  vi.mocked(supabase.from).mockReturnValueOnce(createQueryBuilder({ data: rows, error: null }));
}

async function waitForLoaded() {
  await waitFor(() => expect(screen.queryByText('Loading board…')).not.toBeInTheDocument());
}

beforeEach(() => {
  vi.mocked(supabase.from).mockReset();
});

describe('Board', () => {
  it('creates a new card via the modal', async () => {
    const user = userEvent.setup();
    mockInitialLoad([]);
    const inserted = {
      id: 'new-1',
      title: 'Write docs',
      assignee: 'Dana',
      priority: 'Medium',
      due_date: '2026-03-01',
      column_id: 'backlog',
    };
    vi.mocked(supabase.from).mockReturnValueOnce(createQueryBuilder({ data: inserted, error: null }));

    render(<Board userEmail="a@b.com" onSignOut={vi.fn()} />);
    await waitForLoaded();

    await user.click(screen.getAllByRole('button', { name: '+ Add card' })[0]);
    await user.type(screen.getByLabelText('Title'), 'Write docs');
    await user.type(screen.getByLabelText('Assignee'), 'Dana');
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2026-03-01' } });
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Write docs')).toBeInTheDocument();
  });

  it('edits an existing card', async () => {
    const user = userEvent.setup();
    mockInitialLoad([
      {
        id: '1',
        title: 'Old title',
        assignee: 'Alice',
        priority: 'High',
        due_date: '2026-01-01',
        column_id: 'backlog',
      },
    ]);
    vi.mocked(supabase.from).mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

    render(<Board userEmail="a@b.com" onSignOut={vi.fn()} />);
    await waitForLoaded();

    await user.click(screen.getByRole('button', { name: 'Edit Old title' }));
    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New title');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('New title')).toBeInTheDocument();
    expect(screen.queryByText('Old title')).not.toBeInTheDocument();
  });

  it('moves a card to another column via the Column dropdown (keyboard-accessible alternative to dragging)', async () => {
    const user = userEvent.setup();
    mockInitialLoad([
      {
        id: '1',
        title: 'Move me',
        assignee: 'Alice',
        priority: 'High',
        due_date: '2026-01-01',
        column_id: 'backlog',
      },
    ]);
    vi.mocked(supabase.from).mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

    render(<Board userEmail="a@b.com" onSignOut={vi.fn()} />);
    await waitForLoaded();

    await user.click(screen.getByRole('button', { name: 'Edit Move me' }));
    await user.click(screen.getByRole('combobox', { name: 'Column' }));
    await user.click(screen.getByRole('option', { name: 'Done' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const doneColumn = screen.getByText('Done').closest('.column');
      expect(doneColumn).not.toBeNull();
      expect(within(doneColumn as HTMLElement).getByText('Move me')).toBeInTheDocument();
    });
  });

  it('deletes a card', async () => {
    const user = userEvent.setup();
    mockInitialLoad([
      {
        id: '1',
        title: 'Delete me',
        assignee: 'Alice',
        priority: 'High',
        due_date: '2026-01-01',
        column_id: 'backlog',
      },
    ]);
    vi.mocked(supabase.from).mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

    render(<Board userEmail="a@b.com" onSignOut={vi.fn()} />);
    await waitForLoaded();

    await user.click(screen.getByRole('button', { name: 'Delete Delete me' }));

    await waitFor(() => expect(screen.queryByText('Delete me')).not.toBeInTheDocument());
  });

  it('sorts cards within a column by priority, High first, regardless of load order', async () => {
    mockInitialLoad([
      {
        id: '1',
        title: 'Low card',
        assignee: 'B',
        priority: 'Low',
        due_date: '2026-01-02',
        column_id: 'backlog',
      },
      {
        id: '2',
        title: 'High card',
        assignee: 'A',
        priority: 'High',
        due_date: '2026-01-01',
        column_id: 'backlog',
      },
      {
        id: '3',
        title: 'Medium card',
        assignee: 'C',
        priority: 'Medium',
        due_date: '2026-01-03',
        column_id: 'backlog',
      },
    ]);

    render(<Board userEmail="a@b.com" onSignOut={vi.fn()} />);
    await waitForLoaded();

    const editButtons = screen.getAllByRole('button', { name: /^Edit /i });
    expect(editButtons.map((b) => b.textContent)).toEqual([
      expect.stringContaining('High card'),
      expect.stringContaining('Medium card'),
      expect.stringContaining('Low card'),
    ]);
  });
});
