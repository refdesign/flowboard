import { useDrop } from 'react-dnd';
import type { CardData, ColumnDef } from '../types';
import { DRAG_TYPE } from '../types';
import { Card } from './Card';
import './Column.css';

interface ColumnProps {
  column: ColumnDef;
  cards: CardData[];
  onMoveCard: (id: string, columnId: ColumnDef['id']) => void;
  onEditCard: (card: CardData) => void;
  onDeleteCard: (id: string) => void;
  onAddCard: (columnId: ColumnDef['id']) => void;
}

interface DragItem {
  id: string;
  sourceColumnId: ColumnDef['id'];
}

export function Column({ column, cards, onMoveCard, onEditCard, onDeleteCard, onAddCard }: ColumnProps) {
  const [{ isOver }, dropRef] = useDrop<DragItem, void, { isOver: boolean }>(
    () => ({
      accept: DRAG_TYPE,
      drop: (item) => {
        if (item.sourceColumnId !== column.id) {
          onMoveCard(item.id, column.id);
        }
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [column.id, onMoveCard]
  );

  return (
    <div
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      className={`column${column.tint && cards.length > 0 ? ` column-tint-${column.tint}` : ''}${isOver ? ' column-over' : ''}`}
    >
      <div className="column-header">
        <h2 className="column-title">{column.label}</h2>
        <span className="column-count">{cards.length}</span>
      </div>
      <div className="column-cards">
        {cards.length === 0 ? (
          <div className="column-empty">
            <svg
              className="column-empty-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 8L12 3L7 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="column-empty-text">Drop a card here or add one below</p>
          </div>
        ) : (
          cards.map((card) => (
            <Card key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
          ))
        )}
      </div>
      <button type="button" className="column-add" onClick={() => onAddCard(column.id)}>
        + Add card
      </button>
    </div>
  );
}
