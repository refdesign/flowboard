import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import type { CardData, ColumnId, Priority } from '../types';
import { COLUMNS } from '../types';
import { Dropdown } from './Dropdown';
import './CardModal.css';

interface CardModalProps {
  card: CardData | null;
  defaultColumnId: ColumnId;
  defaultPriority: Priority;
  onSave: (card: CardData) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

interface FormState {
  title: string;
  assignee: string;
  priority: Priority;
  dueDate: string;
  columnId: ColumnId;
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function toFormState(card: CardData | null, defaultColumnId: ColumnId, defaultPriority: Priority): FormState {
  if (card) {
    return {
      title: card.title,
      assignee: card.assignee,
      priority: card.priority,
      dueDate: card.dueDate,
      columnId: card.columnId,
    };
  }
  return { title: '', assignee: '', priority: defaultPriority, dueDate: '', columnId: defaultColumnId };
}

export function CardModal({
  card,
  defaultColumnId,
  defaultPriority,
  onSave,
  onDelete,
  onClose,
}: CardModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(card, defaultColumnId, defaultPriority));
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const isEditing = card !== null;
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const errorId = useId();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = modalRef.current;
      if (!container) return;
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
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
      columnId: form.columnId,
    });
  }

  const titleInvalid = attempted && !form.title.trim();
  const assigneeInvalid = attempted && !form.assignee.trim();
  const dueDateInvalid = attempted && !form.dueDate;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 className="modal-title" id={titleId}>
          {isEditing ? 'Edit Card' : 'New Card'}
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="modal-field">
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              aria-invalid={titleInvalid}
              aria-describedby={error ? errorId : undefined}
            />
          </label>
          <label className="modal-field">
            <span>Assignee</span>
            <input
              type="text"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              aria-invalid={assigneeInvalid}
              aria-describedby={error ? errorId : undefined}
            />
          </label>
          <div className="modal-field">
            <span className="modal-field-label-drop">Column</span>
            <Dropdown
              value={form.columnId}
              options={COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
              onChange={(v) => setForm({ ...form, columnId: v as ColumnId })}
              label="Column"
            />
          </div>
          <div className="modal-field">
            <span className="modal-field-label-drop">Priority</span>
            <Dropdown
              value={form.priority}
              options={PRIORITIES.map((p) => ({ value: p, label: p }))}
              onChange={(v) => setForm({ ...form, priority: v as Priority })}
              label="Priority"
            />
          </div>
          <label className="modal-field">
            <span>Due Date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              aria-invalid={dueDateInvalid}
              aria-describedby={error ? errorId : undefined}
            />
          </label>
          {error && (
            <p className="modal-error" id={errorId} role="alert">
              {error}
            </p>
          )}
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
