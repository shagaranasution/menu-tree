import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

export type Option = {
  value: string;
  label: string;
};

type Props = {
  options: Option[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  renderOption?: (opt: Option) => React.ReactNode;
};

export default function SearchableSelect({
  options,
  value = null,
  onChange,
  placeholder = 'Select menu...',
  disabled = false,
  className = '',
  renderOption,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    let raf = 0;
    if (open) {
      raf = requestAnimationFrame(() => {
        setHighlightIndex(0);
        inputRef.current?.focus();
      });
    } else {
      raf = requestAnimationFrame(() => {
        setQuery('');
      });
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open]);

  // close when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // keyboard support for search input
  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) =>
        Math.min(i + 1, Math.max(0, filtered.length - 1))
      );
      scrollToHighlighted();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      scrollToHighlighted();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlightIndex];
      if (opt) {
        selectOption(opt);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function scrollToHighlighted() {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[highlightIndex] as HTMLElement | undefined;
    if (!el) return;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.bottom > listRect.bottom) {
      list.scrollTop += elRect.bottom - listRect.bottom;
    } else if (elRect.top < listRect.top) {
      list.scrollTop -= listRect.top - elRect.top;
    }
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen((s) => !s);
  }

  function selectOption(opt: Option) {
    onChange?.(opt.value);
    setOpen(false);
    // move focus back to button
    buttonRef.current?.focus();
  }

  function clearSelection(e?: React.MouseEvent) {
    e?.stopPropagation();
    onChange?.(null);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full text-left flex items-center justify-between gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm'
        }`}
        onClick={toggleOpen}
        disabled={disabled}>
        <div className="min-w-0 truncate">
          {selected ? (
            selected.label
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selected && (
            <div onClick={clearSelection}>
              <X className="size-4 rounded hover:bg-gray-100" />
            </div>
          )}
          {open ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-auto">
          {/* Search input */}
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search..."
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>

          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={filtered[highlightIndex]?.value ?? undefined}
            className="max-h-48 overflow-auto divide-y">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">No options</li>
            ) : (
              filtered.map((opt, idx) => {
                const isHighlighted = idx === highlightIndex;
                return (
                  <li
                    id={opt.value}
                    key={opt.value}
                    role="option"
                    aria-selected={value === opt.value}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between border-none ${
                      isHighlighted ? 'bg-gray-200' : 'bg-white'
                    } hover:bg-gray-50`}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onClick={() => selectOption(opt)}>
                    <div className="truncate">
                      {renderOption ? renderOption(opt) : opt.label}
                    </div>
                    {value === opt.value && <Check className="size-4" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
