'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/**
 * A styled native <select>. Options are ordinary <option>/<optgroup>
 * children, so keyboard, screen-reader, form, and mobile behavior come from
 * the platform.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid = false, className, children, ...props }, ref) => (
    <span className={cn('aliencn-select-wrap', className)}>
      <select
        {...props}
        ref={ref}
        className="aliencn-select"
        aria-invalid={invalid || undefined}
      >
        {children}
      </select>
      <span className="aliencn-select-marker" aria-hidden="true">+</span>
    </span>
  )
);
Select.displayName = 'Select';
