import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createQueryBuilder } from '../test/mockSupabase';

vi.mock('../lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../lib/supabaseClient';
import { useBoardState } from './useBoardState';

const seedRow = {
  id: '1',
  title: 'Test card',
  assignee: 'Alice',
  priority: 'High',
  due_date: '2026-01-01',
  column_id: 'backlog',
};

beforeEach(() => {
  vi.mocked(supabase.from).mockReset();
});

describe('useBoardState', () => {
  it('loads cards on mount and maps snake_case rows to CardData', async () => {
    vi.mocked(supabase.from).mockReturnValue(createQueryBuilder({ data: [seedRow], error: null }));

    const { result } = renderHook(() => useBoardState());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cards).toEqual([
      {
        id: '1',
        title: 'Test card',
        assignee: 'Alice',
        priority: 'High',
        dueDate: '2026-01-01',
        columnId: 'backlog',
      },
    ]);
  });

  it('addCard inserts the card and appends the row Supabase returns', async () => {
    vi.mocked(supabase.from)
      .mockReturnValueOnce(createQueryBuilder({ data: [], error: null })) // initial load
      .mockReturnValueOnce(createQueryBuilder({ data: seedRow, error: null })); // insert

    const { result } = renderHook(() => useBoardState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addCard({
        id: '1',
        title: 'Test card',
        assignee: 'Alice',
        priority: 'High',
        dueDate: '2026-01-01',
        columnId: 'backlog',
      });
    });

    expect(supabase.from).toHaveBeenCalledWith('cards');
    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].title).toBe('Test card');
  });

  it('updateCard persists the full edited card and updates local state', async () => {
    vi.mocked(supabase.from)
      .mockReturnValueOnce(createQueryBuilder({ data: [seedRow], error: null }))
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

    const { result } = renderHook(() => useBoardState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = {
      id: '1',
      title: 'Updated title',
      assignee: 'Bob',
      priority: 'Low' as const,
      dueDate: '2026-02-02',
      columnId: 'done' as const,
    };

    await act(async () => {
      await result.current.updateCard(updated);
    });

    expect(result.current.cards[0]).toEqual(updated);
  });

  it('deleteCard removes the card from local state', async () => {
    vi.mocked(supabase.from)
      .mockReturnValueOnce(createQueryBuilder({ data: [seedRow], error: null }))
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

    const { result } = renderHook(() => useBoardState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteCard('1');
    });

    expect(result.current.cards).toHaveLength(0);
  });

  it('moveCard only sends the new column, leaving priority untouched', async () => {
    const moveBuilder = createQueryBuilder({ data: null, error: null });
    vi.mocked(supabase.from)
      .mockReturnValueOnce(createQueryBuilder({ data: [seedRow], error: null }))
      .mockReturnValueOnce(moveBuilder);

    const { result } = renderHook(() => useBoardState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.moveCard('1', 'in-progress');
    });

    expect(result.current.cards[0].columnId).toBe('in-progress');
    expect(result.current.cards[0].priority).toBe('High');
    expect(moveBuilder.update).toHaveBeenCalledWith({ column_id: 'in-progress' });
  });

  it('surfaces an error message when the initial load fails', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({ data: null, error: { message: 'network down' } })
    );

    const { result } = renderHook(() => useBoardState());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('network down');
    expect(result.current.cards).toEqual([]);
  });
});
