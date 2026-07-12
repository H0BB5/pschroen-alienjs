'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface MagneticProps extends React.HTMLAttributes<HTMLDivElement> {
  threshold?: number;
  onLoadError?: (error: Error) => void;
}

export function Magnetic({
  threshold = 50,
  onLoadError,
  className,
  children,
  ...props
}: MagneticProps): React.JSX.Element {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const errorRef = React.useRef(onLoadError);
  errorRef.current = onLoadError;

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let disposeMagnetic: (() => void) | undefined;

    void import('@alienkitty/space.js')
      .then(({ Interface, Magnetic: SpaceMagnetic }) => {
        if (disposed) return;
        const object = new Interface(element);
        const magnetic = new SpaceMagnetic(object, { threshold });
        disposeMagnetic = () => {
          magnetic.destroy();
          object.clearTween();
          element.style.removeProperty('transform');
          element.style.removeProperty('will-change');
        };
      })
      .catch((error: unknown) => {
        if (!disposed) {
          errorRef.current?.(
            error instanceof Error ? error : new Error('Unable to load @alienkitty/space.js.')
          );
        }
      });

    return () => {
      disposed = true;
      disposeMagnetic?.();
    };
  }, [threshold]);

  return (
    <div {...props} ref={elementRef} className={cn('aliencn-magnetic', className)}>
      {children}
    </div>
  );
}
