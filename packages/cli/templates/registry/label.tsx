import * as React from 'react';

import { cn } from '{{utils}}/cn';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

/** The registration-mark form label used across Aliencn field components. */
export function Label({ className, children, ...props }: LabelProps): React.JSX.Element {
  return (
    <label {...props} className={cn('aliencn-label', className)}>
      {children}
    </label>
  );
}
