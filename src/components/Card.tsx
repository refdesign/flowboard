import { useDrag } from 'react-dnd';
import type { CardData } from '../types';
import { DRAG_TYPE } from '../types';
import './Card.css';

interface CardProps {
  card: CardData;
  onEdit: (card: CardData) => void;
  onDelete: (id: string) => void;
}

interface DragItem {
  id: string;
  sourceColumnId: CardData['columnId'];
}

function formatDueDate(dueDate: string): string {
  if (!dueDate) return '';
  const date = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dueDate;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function Card({ card, onEdit, onDelete }: CardProps) {
  const [{ isDragging }, dragRef] = useDrag<DragItem, void, { isDragging: boolean }>(
    () => ({
      type: DRAG_TYPE,
      item: { id: card.id, sourceColumnId: card.columnId },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [card.id, card.columnId]
  );

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={`card priority-${card.priority.toLowerCase()}${isDragging ? ' dragging' : ''}`}
      onClick={() => onEdit(card)}
    >
      <div className="card-header">
        <span className={`priority-badge priority-badge-${card.priority.toLowerCase()}`}>
          {card.priority}
        </span>
        <button
          type="button"
          className="card-delete"
          aria-label={`Delete ${card.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
        >
          ×
        </button>
      </div>
      <p className="card-title">{card.title}</p>
      <div className="card-footer">
        <span className="card-assignee">{card.assignee}</span>
        {card.dueDate && <span className="card-due">{formatDueDate(card.dueDate)}</span>}
      </div>
    </div>
  );
}
