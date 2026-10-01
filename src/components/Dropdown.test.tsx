import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from './Dropdown';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

describe('Dropdown', () => {
  it('opens on click, selects an option, and closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Dropdown value="a" options={options} onChange={onChange} label="Test" />);

    await user.click(screen.getByRole('combobox', { name: 'Test' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Beta' }));

    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports arrow-key navigation and Enter to select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Dropdown value="a" options={options} onChange={onChange} label="Test" />);

    screen.getByRole('combobox', { name: 'Test' }).focus();
    await user.keyboard('{ArrowDown}'); // opens, highlights current value (a)
    await user.keyboard('{ArrowDown}'); // moves highlight to b
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('Escape closes the list and does not let the keydown reach a document-level listener (e.g. a modal\'s Escape-to-close)', async () => {
    const user = userEvent.setup();
    const documentKeyDown = vi.fn();
    document.addEventListener('keydown', documentKeyDown);

    try {
      render(<Dropdown value="a" options={options} onChange={vi.fn()} label="Test" />);
      await user.click(screen.getByRole('combobox', { name: 'Test' }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(documentKeyDown).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keydown', documentKeyDown);
    }
  });
});
