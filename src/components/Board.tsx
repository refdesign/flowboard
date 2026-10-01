import { useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useBoardState } from '../hooks/useBoardState';
import { COLUMNS, PRIORITY_ORDER } from '../types';
import type { CardData, ColumnId, Priority } from '../types';
import { Column } from './Column';
import { CardModal } from './CardModal';
import './Board.css';

interface BoardProps {
  userEmail: string;
  onSignOut: () => void;
}

export function Board({ userEmail, onSignOut }: BoardProps) {
  const { cards, loading, error, addCard, updateCard, deleteCard, moveCard } = useBoardState();
  const [modalState, setModalState] = useState<{
    open: boolean;
    card: CardData | null;
    defaultColumnId: ColumnId;
    defaultPriority: Priority;
  }>({ open: false, card: null, defaultColumnId: 'backlog', defaultPriority: 'Medium' });
  const triggerRef = useRef<HTMLElement | null>(null);

  function openAddModal(columnId: ColumnId) {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setModalState({ open: true, card: null, defaultColumnId: columnId, defaultPriority: 'Medium' });
  }

  function openEditModal(card: CardData) {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setModalState({
      open: true,
      card,
      defaultColumnId: card.columnId,
      defaultPriority: card.priority,
    });
  }

  function closeModal() {
    setModalState({ open: false, card: null, defaultColumnId: 'backlog', defaultPriority: 'Medium' });
    triggerRef.current?.focus();
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
          <div className="board-header-account">
            <span className="board-header-email">{userEmail}</span>
            <button type="button" className="board-header-signout" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </header>
        <main>
        {error && (
          <p className="board-error" role="alert">
            Couldn't sync with the server: {error}
          </p>
        )}
        {loading ? (
          <p className="board-loading" role="status" aria-live="polite">
            Loading board…
          </p>
        ) : (
          <div className="board-columns">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={cards
                  .filter((c) => c.columnId === column.id)
                  .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])}
                onMoveCard={moveCard}
                onEditCard={openEditModal}
                onDeleteCard={deleteCard}
                onAddCard={openAddModal}
              />
            ))}
          </div>
        )}
        </main>
      </div>
      {modalState.open && (
        <CardModal
          card={modalState.card}
          defaultColumnId={modalState.defaultColumnId}
          defaultPriority={modalState.defaultPriority}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </DndProvider>
  );
}
