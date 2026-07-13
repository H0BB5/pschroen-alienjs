import * as React from 'react';

import { cn } from '{{utils}}/cn';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Dashed registration style instead of a solid hairline. */
  dashed?: boolean;
  /** Purely visual separators are hidden from assistive technology. */
  decorative?: boolean;
}

export function Separator({
  orientation = 'horizontal',
  dashed = false,
  decorative = true,
  className,
  ...props
}: SeparatorProps): React.JSX.Element {
  return (
    <div
      {...props}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'aliencn-separator',
        `aliencn-separator--${orientation}`,
        dashed && 'aliencn-separator--dashed',
        className
      )}
    />
  );
}
