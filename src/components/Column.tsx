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

export function Column({
  column,
  cards,
  onMoveCard,
  onEditCard,
  onDeleteCard,
  onAddCard,
}: ColumnProps) {
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
      className={`column${isOver ? ' column-over' : ''}`}
    >
      <div className="column-header">
        <h2 className="column-title">{column.label}</h2>
        <span className="column-count">{cards.length}</span>
      </div>
      <div className="column-cards">
        {cards.map((card) => (
          <Card key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
        ))}
      </div>
      <button type="button" className="column-add" onClick={() => onAddCard(column.id)}>
        + Add card
      </button>
    </div>
  );
}
