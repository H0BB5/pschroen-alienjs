'use client';

import * as React from 'react';

import { cn } from '{{utils}}/cn';

export type SwitchVariant = 'default' | 'system';

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  /**
   * `default` is the standard settings toggle. `system` is the square
   * instrument treatment for telemetry racks and dev surfaces.
   */
  variant?: SwitchVariant;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  variant = 'default',
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
      className={cn('aliencn-switch', `aliencn-switch--${variant}`, className)}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="aliencn-switch__track" aria-hidden="true">
        <span className="aliencn-switch__thumb" />
      </span>
      {label ? <span className="aliencn-switch__label">{label}</span> : null}
    </button>
  );
}
