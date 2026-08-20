import * as React from 'react';

import { cn } from '{{utils}}/cn';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps): React.JSX.Element {
  return <div {...props} aria-hidden="true" className={cn('aliencn-skeleton', className)} />;
}
