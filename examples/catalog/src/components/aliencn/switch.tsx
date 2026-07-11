'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
  disabled,
  ...props
}: SwitchProps): React.JSX.Element {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn('aliencn-switch', className)}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="aliencn-switch__track" aria-hidden="true">
        <span className="aliencn-switch__thumb" />
      </span>
      {label ? <span>{label}</span> : null}
    </button>
  );
}
