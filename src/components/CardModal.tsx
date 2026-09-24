import { useState, type FormEvent } from 'react';
import type { CardData, ColumnId, Priority } from '../types';
import './CardModal.css';

interface CardModalProps {
  card: CardData | null;
  defaultColumnId: ColumnId;
  onSave: (card: CardData) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

interface FormState {
  title: string;
  assignee: string;
  priority: Priority;
  dueDate: string;
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

function toFormState(card: CardData | null): FormState {
  if (card) {
    return {
      title: card.title,
      assignee: card.assignee,
      priority: card.priority,
      dueDate: card.dueDate,
    };
  }
  return { title: '', assignee: '', priority: 'Medium', dueDate: '' };
}

export function CardModal({ card, defaultColumnId, onSave, onDelete, onClose }: CardModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(card));
  const [error, setError] = useState('');
  const isEditing = card !== null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.assignee.trim() || !form.dueDate) {
      setError('Title, assignee, and due date are required.');
      return;
    }
    onSave({
      id: card?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      assignee: form.assignee.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      columnId: card?.columnId ?? defaultColumnId,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isEditing ? 'Edit Card' : 'New Card'}</h2>
        <form onSubmit={handleSubmit}>
          <label className="modal-field">
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
          </label>
          <label className="modal-field">
            <span>Assignee</span>
            <input
              type="text"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            />
          </label>
          <label className="modal-field">
            <span>Priority</span>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="modal-field">
            <span>Due Date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </label>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            {isEditing && (
              <button
                type="button"
                className="modal-btn modal-btn-danger"
                onClick={() => onDelete(card.id)}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-primary">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
