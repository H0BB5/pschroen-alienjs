import * as React from 'react';

import { cn } from '{{utils}}/cn';

export interface ProgressProps
  extends Omit<React.ProgressHTMLAttributes<HTMLProgressElement>, 'value' | 'max'> {
  /** Omit for an indeterminate scanning state. */
  value?: number;
  max?: number;
  label?: string;
}

/**
 * A styled native <progress>. Determinate values render a signal fill;
 * omitting `value` renders the indeterminate scan, which pauses under
 * reduced motion.
 */
export function Progress({
  value,
  max = 100,
  label,
  className,
  ...props
}: ProgressProps): React.JSX.Element {
  return (
    <progress
      {...props}
      {...(value === undefined ? {} : { value })}
      max={max}
      aria-label={label ?? props['aria-label']}
      className={cn('aliencn-progress', className)}
    />
  );
}
