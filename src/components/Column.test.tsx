import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Column } from './Column';
import type { CardData, ColumnDef } from '../types';

function renderColumn(column: ColumnDef, cards: CardData[]) {
  return render(
    <DndProvider backend={HTML5Backend}>
      <Column
        column={column}
        cards={cards}
        onMoveCard={vi.fn()}
        onEditCard={vi.fn()}
        onDeleteCard={vi.fn()}
        onAddCard={vi.fn()}
      />
    </DndProvider>
  );
}

const card: CardData = {
  id: '1',
  title: 'Sample',
  assignee: 'A',
  priority: 'High',
  dueDate: '2026-01-01',
  columnId: 'blocked',
};

describe('Column', () => {
  it('shows the empty-state placeholder when it has no cards', () => {
    renderColumn({ id: 'done', label: 'Done' }, []);
    expect(screen.getByText('Drop a card here or add one below')).toBeInTheDocument();
  });

  it('does not tint the Blocked column red while it is empty', () => {
    const { container } = renderColumn({ id: 'blocked', label: 'Blocked', tint: 'red' }, []);
    expect(container.querySelector('.column-tint-red')).not.toBeInTheDocument();
  });

  it('tints the Blocked column red once it has at least one card', () => {
    const { container } = renderColumn({ id: 'blocked', label: 'Blocked', tint: 'red' }, [card]);
    expect(container.querySelector('.column-tint-red')).toBeInTheDocument();
  });
});
