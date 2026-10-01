import { useRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardModal } from './CardModal';
import type { CardData } from '../types';

/** Mirrors Board.tsx's open/close + focus-restore pattern, isolated for testing CardModal alone. */
function Harness({
  card = null,
  onSave = vi.fn(),
  onDelete = vi.fn(),
}: {
  card?: CardData | null;
  onSave?: (card: CardData) => void;
  onDelete?: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div>
      <button ref={triggerRef}>Trigger</button>
      {open && (
        <CardModal
          card={card}
          defaultColumnId="backlog"
          defaultPriority="Medium"
          onSave={(c) => {
            onSave(c);
            close();
          }}
          onDelete={(id) => {
            onDelete(id);
            close();
          }}
          onClose={close}
        />
      )}
    </div>
  );
}

describe('CardModal', () => {
  it('is marked up as an accessible dialog labelled by its visible title', () => {
    render(<Harness />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('New Card').id).toBe(dialog.getAttribute('aria-labelledby'));
  });

  it('traps focus: Shift+Tab from the first field wraps to Save, Tab from Save wraps back to the first field', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const titleInput = screen.getByLabelText('Title');
    expect(titleInput).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();

    await user.tab();
    expect(titleInput).toHaveFocus();
  });

  it('closes on Escape and returns focus to the element that opened it', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus();
  });

  it('marks the Title field invalid and announces the error when required fields are missing', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Assignee'), 'Alice');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const titleInput = screen.getByLabelText('Title');
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Title, assignee, and due date are required.');
    expect(titleInput.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('saves a new card with the values entered, including the Column selector', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<Harness onSave={onSave} />);

    await user.type(screen.getByLabelText('Title'), 'New task');
    await user.type(screen.getByLabelText('Assignee'), 'Dana');
    await user.type(screen.getByLabelText('Due Date'), '2026-03-01');

    await user.click(screen.getByRole('combobox', { name: 'Column' }));
    await user.click(screen.getByRole('option', { name: 'Done' }));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        assignee: 'Dana',
        dueDate: '2026-03-01',
        columnId: 'done',
      })
    );
  });
});
