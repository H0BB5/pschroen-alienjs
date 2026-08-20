import * as React from 'react';

import { cn } from '{{utils}}/cn';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: BannerTone;
  onDismiss?: () => void;
  dismissLabel?: string;
}

const icons: Readonly<Record<BannerTone, string>> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '×'
};

export function Banner({
  tone = 'info',
  onDismiss,
  dismissLabel = 'Dismiss message',
  className,
  children,
  ...props
}: BannerProps): React.JSX.Element {
  return (
    <div
      {...props}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('aliencn-banner', `aliencn-banner--${tone}`, className)}
    >
      <span className="aliencn-banner__icon" aria-hidden="true">{icons[tone]}</span>
      <div className="aliencn-banner__body">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          className="aliencn-banner-dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
