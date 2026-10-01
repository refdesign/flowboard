import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from './Card';
import type { CardData } from '../types';

const card: CardData = {
  id: '1',
  title: 'Ship it',
  assignee: 'Alice',
  priority: 'High',
  dueDate: '2026-01-01',
  columnId: 'backlog',
};

function renderCard(onEdit = vi.fn(), onDelete = vi.fn()) {
  return render(
    <DndProvider backend={HTML5Backend}>
      <Card card={card} onEdit={onEdit} onDelete={onDelete} />
    </DndProvider>
  );
}

describe('Card', () => {
  it('renders the edit control as a real, keyboard-reachable button', () => {
    renderCard();
    const editButton = screen.getByRole('button', { name: 'Edit Ship it' });
    expect(editButton.tagName).toBe('BUTTON');
  });

  it('does not nest the delete button inside the edit button (invalid HTML / blocks focus)', () => {
    renderCard();
    const editButton = screen.getByRole('button', { name: 'Edit Ship it' });
    const deleteButton = screen.getByRole('button', { name: 'Delete Ship it' });
    expect(editButton.contains(deleteButton)).toBe(false);
  });

  it('clicking delete removes the card without also triggering edit', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderCard(onEdit, onDelete);

    await user.click(screen.getByRole('button', { name: 'Delete Ship it' }));

    expect(onDelete).toHaveBeenCalledWith('1');
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('clicking the card body opens it for editing', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    renderCard(onEdit);

    await user.click(screen.getByRole('button', { name: 'Edit Ship it' }));

    expect(onEdit).toHaveBeenCalledWith(card);
  });
});
