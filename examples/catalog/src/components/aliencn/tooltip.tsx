'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  /** Preferred side; flips automatically when the viewport is too tight. */
  side?: TooltipSide;
  /** Milliseconds of hover intent before showing. Focus shows immediately. */
  delay?: number;
  className?: string;
  children: React.ReactElement;
}

const OPPOSITE: Readonly<Record<TooltipSide, TooltipSide>> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
};

/**
 * A hover/focus tooltip with no positioning dependency. The trigger child is
 * cloned to receive `aria-describedby` and the interaction handlers, the
 * bubble flips to the opposite side when it would leave the viewport, and
 * Escape dismisses it while hovered (WCAG 1.4.13). Content stays hoverable.
 */
export function Tooltip({
  content,
  side = 'top',
  delay = 250,
  className,
  children
}: TooltipProps): React.JSX.Element {
  const tooltipId = React.useId();
  const anchorRef = React.useRef<HTMLSpanElement>(null);
  const bubbleRef = React.useRef<HTMLSpanElement>(null);
  const timerRef = React.useRef<number | undefined>(undefined);
  const [open, setOpen] = React.useState(false);
  const [resolvedSide, setResolvedSide] = React.useState<TooltipSide>(side);

  const show = React.useCallback((): void => {
    window.clearTimeout(timerRef.current);
    setResolvedSide(side);
    setOpen(true);
  }, [side]);

  const showSoon = (): void => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(show, delay);
  };

  const hide = (): void => {
    window.clearTimeout(timerRef.current);
    setOpen(false);
  };

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  React.useEffect(() => {
    if (!open) return;
    const bubble = bubbleRef.current;
    if (bubble) {
      const bounds = bubble.getBoundingClientRect();
      const overflows =
        (resolvedSide === 'top' && bounds.top < 4) ||
        (resolvedSide === 'bottom' && bounds.bottom > window.innerHeight - 4) ||
        (resolvedSide === 'left' && bounds.left < 4) ||
        (resolvedSide === 'right' && bounds.right > window.innerWidth - 4);
      if (overflows) setResolvedSide(OPPOSITE[resolvedSide]);
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, resolvedSide]);

  const child = React.Children.only(children);
  const trigger = React.isValidElement<React.HTMLAttributes<HTMLElement>>(child)
    ? React.cloneElement(child, {
        'aria-describedby': open ? tooltipId : child.props['aria-describedby'],
        onFocus: (event: React.FocusEvent<HTMLElement>) => {
          child.props.onFocus?.(event);
          show();
        },
        onBlur: (event: React.FocusEvent<HTMLElement>) => {
          child.props.onBlur?.(event);
          hide();
        }
      })
    : child;

  return (
    <span
      ref={anchorRef}
      className={cn('aliencn-tooltip-anchor', className)}
      onPointerEnter={showSoon}
      onPointerLeave={hide}
    >
      {trigger}
      {open ? (
        <span
          ref={bubbleRef}
          id={tooltipId}
          role="tooltip"
          data-side={resolvedSide}
          className="aliencn-tooltip"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
