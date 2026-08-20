'use client';

import * as React from 'react';

import { cn } from '{{utils}}/cn';

export interface TickerProps extends React.HTMLAttributes<HTMLDivElement> {
  items: readonly string[];
  /** Seconds for one full loop of the stream. */
  duration?: number;
  label?: string;
}

/**
 * A hairline status stream. The item list is rendered twice (the twin is
 * hidden from assistive technology) so the loop is seamless; the marquee
 * pauses on hover and does not run under reduced motion.
 */
export function Ticker({
  items,
  duration = 36,
  label = 'Status stream',
  className,
  ...props
}: TickerProps): React.JSX.Element {
  return (
    <div {...props} className={cn('aliencn-ticker', className)} aria-label={label}>
      <div className="aliencn-ticker__track" style={{ animationDuration: `${duration}s` }}>
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <ul aria-hidden="true">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
