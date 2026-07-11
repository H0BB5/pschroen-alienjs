import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className={cn('aliencn-empty', className)} {...props}>
      {icon ? <div className="aliencn-empty__icon" aria-hidden="true">{icon}</div> : null}
      <h3 className="aliencn-empty__title">{title}</h3>
      {description ? <p className="aliencn-empty__description">{description}</p> : null}
      {action}
    </div>
  );
}
