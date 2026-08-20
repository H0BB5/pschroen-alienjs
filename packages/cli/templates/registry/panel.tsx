'use client';

import * as React from 'react';
import type { PanelUpdate } from '@alienkitty/space.js';

import { cn } from '{{utils}}/cn';

export type AlienPanelItem = ConstructorParameters<
  typeof import('@alienkitty/space.js')['PanelItem']
>[0];

export interface AlienPanelHandle {
  setValue: (name: string, value: unknown) => void;
  setIndex: (name: string, index: number) => void;
}

export interface AlienPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Captured once when the panel mounts; later changes are ignored so parent
   * re-renders never rebuild the panel. Use the `onReady` handle to update
   * values and indexes imperatively.
   */
  items: readonly AlienPanelItem[];
  /** Captured once when the panel mounts, like `items`. */
  fast?: boolean;
  onUpdate?: (event: PanelUpdate) => void;
  onReady?: (handle: AlienPanelHandle) => void;
  onLoadError?: (error: Error) => void;
}

export function AlienPanel({
  items,
  fast = false,
  onUpdate,
  onReady,
  onLoadError,
  className,
  ...props
}: AlienPanelProps): React.JSX.Element {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const initialItemsRef = React.useRef(items);
  const initialFastRef = React.useRef(fast);
  const updateRef = React.useRef(onUpdate);
  const readyRef = React.useRef(onReady);
  const errorRef = React.useRef(onLoadError);
  updateRef.current = onUpdate;
  readyRef.current = onReady;
  errorRef.current = onLoadError;

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!document.documentElement.hasAttribute('data-aliencn-space')) {
      errorRef.current?.(
        new Error('AlienPanel requires data-aliencn-space on the root <html> element.')
      );
      return;
    }

    let disposed = false;
    let disposePanel: (() => void) | undefined;

    void import('@alienkitty/space.js')
      .then(({ Panel, PanelItem }) => {
        if (disposed) return;
        const panel = new Panel();
        const element = panel.element;
        if (!element) {
          panel.destroy();
          errorRef.current?.(new Error('Space.js Panel did not create a root element.'));
          return;
        }
        const handleUpdate = (...events: unknown[]): void => {
          const event = events[0];
          if (isPanelUpdate(event)) updateRef.current?.(event);
        };
        panel.events.on('update', handleUpdate);

        for (const item of initialItemsRef.current) panel.add(new PanelItem(item));
        host.appendChild(element);
        panel.animateIn(initialFastRef.current);

        readyRef.current?.({
          setValue: (name, value) => panel.setPanelValue(name, value),
          setIndex: (name, index) => panel.setPanelIndex(name, index)
        });

        disposePanel = () => {
          panel.events.off('update', handleUpdate);
          element.remove();
          panel.destroy();
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
      disposePanel?.();
    };
  }, []);

  return <div {...props} ref={hostRef} className={cn('aliencn-panel-host', className)} />;
}

function isPanelUpdate(value: unknown): value is PanelUpdate {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    Array.isArray(value.path) &&
    'target' in value
  );
}
