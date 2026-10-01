import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import './Dropdown.css';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function Dropdown({ value, options, onChange, placeholder, label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  function openList() {
    setHighlightedIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function toggleOpen() {
    if (open) {
      setOpen(false);
    } else {
      openList();
    }
  }

  function selectOption(index: number) {
    const opt = options[index];
    if (opt) {
      onChange(opt.value);
    }
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          openList();
        } else {
          setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) {
          openList();
        } else {
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open) {
          selectOption(highlightedIndex);
        } else {
          openList();
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div className="dropdown" ref={containerRef} data-open={open}>
      <button
        ref={triggerRef}
        type="button"
        className="dropdown-trigger"
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        role="combobox"
        aria-controls={listId}
        aria-expanded={open}
        aria-label={label}
        aria-activedescendant={open ? `${listId}-opt-${highlightedIndex}` : undefined}
      >
        <span className={selected ? 'dropdown-value' : 'dropdown-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className="dropdown-chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul className="dropdown-list" role="listbox" id={listId}>
          {options.map((opt, index) => (
            <li
              key={opt.value}
              id={`${listId}-opt-${index}`}
              role="option"
              aria-selected={opt.value === value}
              className={`dropdown-option${opt.value === value ? ' dropdown-option-selected' : ''}${
                index === highlightedIndex ? ' dropdown-option-active' : ''
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOption(index)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
