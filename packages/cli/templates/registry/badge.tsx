import * as React from 'react';

import { cn } from '{{utils}}/cn';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  return (
    <span
      role="status"
      className={cn('aliencn-badge', `aliencn-badge--${tone}`, className)}
      {...props}
    >
      {children}
    </span>
  );
}
