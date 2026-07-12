import * as React from 'react';

import { cn } from '{{utils}}/cn';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /**
   * Announce content changes to assistive technology by rendering the badge
   * as a `status` live region. Reserve this for badges whose text updates
   * in place; static labels should stay non-live.
   */
  live?: boolean;
}

export function Badge({
  tone = 'neutral',
  live = false,
  className,
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  return (
    <span
      role={live ? 'status' : undefined}
      className={cn('aliencn-badge', `aliencn-badge--${tone}`, className)}
      {...props}
    >
      {children}
    </span>
  );
}
