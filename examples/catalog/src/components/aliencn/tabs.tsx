'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: TabsProps): React.JSX.Element {
  const available = items.filter((item) => !item.disabled);
  const initial = defaultValue ?? available[0]?.value ?? '';
  const [internalValue, setInternalValue] = React.useState(initial);
  const activeValue = value ?? internalValue;
  const baseId = React.useId();
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());

  const activate = (next: string): void => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const moveFocus = (current: string, direction: -1 | 1): void => {
    const index = available.findIndex((item) => item.value === current);
    if (index < 0 || available.length === 0) return;
    const nextIndex = (index + direction + available.length) % available.length;
    const next = available[nextIndex];
    if (!next) return;
    activate(next.value);
    buttons.current.get(next.value)?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    current: string
  ): void => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(current, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(current, -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const next = event.key === 'Home' ? available[0] : available.at(-1);
      if (next) {
        activate(next.value);
        buttons.current.get(next.value)?.focus();
      }
    }
  };

  return (
    <div className={cn('aliencn-tabs', className)} {...props}>
      <div className="aliencn-tabs__list" role="tablist">
        {items.map((item) => {
          const selected = item.value === activeValue;
          return (
            <button
              key={item.value}
              ref={(element) => {
                if (element) buttons.current.set(item.value, element);
                else buttons.current.delete(item.value);
              }}
              id={`${baseId}-tab-${item.value}`}
              className="aliencn-tab"
              type="button"
              role="tab"
              aria-controls={`${baseId}-panel-${item.value}`}
              aria-selected={selected}
              disabled={item.disabled}
              tabIndex={selected ? 0 : -1}
              onClick={() => activate(item.value)}
              onKeyDown={(event) => handleKeyDown(event, item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          id={`${baseId}-panel-${item.value}`}
          className="aliencn-tabpanel"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.value}`}
          hidden={item.value !== activeValue}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
