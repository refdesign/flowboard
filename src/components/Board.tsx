import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useBoardState } from '../hooks/useBoardState';
import { COLUMNS } from '../types';
import type { CardData, ColumnId } from '../types';
import { Column } from './Column';
import { CardModal } from './CardModal';
import './Board.css';

export function Board() {
  const { cards, addCard, updateCard, deleteCard, moveCard } = useBoardState();
  const [modalState, setModalState] = useState<{
    open: boolean;
    card: CardData | null;
    defaultColumnId: ColumnId;
  }>({ open: false, card: null, defaultColumnId: 'backlog' });

  function openAddModal(columnId: ColumnId) {
    setModalState({ open: true, card: null, defaultColumnId: columnId });
  }

  function openEditModal(card: CardData) {
    setModalState({ open: true, card, defaultColumnId: card.columnId });
  }

  function closeModal() {
    setModalState({ open: false, card: null, defaultColumnId: 'backlog' });
  }

  function handleSave(card: CardData) {
    if (modalState.card) {
      updateCard(card);
    } else {
      addCard(card);
    }
    closeModal();
  }

  function handleDelete(id: string) {
    deleteCard(id);
    closeModal();
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board">
        <header className="board-header">
          <h1>FlowBoard</h1>
        </header>
        <div className="board-columns">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={cards.filter((c) => c.columnId === column.id)}
              onMoveCard={moveCard}
              onEditCard={openEditModal}
              onDeleteCard={deleteCard}
              onAddCard={openAddModal}
            />
          ))}
        </div>
      </div>
      {modalState.open && (
        <CardModal
          card={modalState.card}
          defaultColumnId={modalState.defaultColumnId}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </DndProvider>
  );
}
