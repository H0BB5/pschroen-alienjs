'use client';

import * as React from 'react';

import { cn } from '{{utils}}/cn';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

/**
 * A native checkbox with the square instrument treatment. Uncontrolled and
 * controlled usage both work exactly like <input type="checkbox">; the
 * optional label wires the click target for free.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => (
    <label className={cn('aliencn-checkbox', className)}>
      <input {...props} ref={ref} type="checkbox" className="aliencn-checkbox__input" />
      <span className="aliencn-checkbox__box" aria-hidden="true" />
      {label ? <span className="aliencn-checkbox__label">{label}</span> : null}
    </label>
  )
);
Checkbox.displayName = 'Checkbox';
