'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';
export type ToasterPosition = 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';

export interface ToastOptions {
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss; 0 keeps the toast until dismissed. */
  duration?: number;
}

export interface ToastRecord {
  id: number;
  message: React.ReactNode;
  tone: ToastTone;
  duration: number;
}

type Listener = (toasts: readonly ToastRecord[]) => void;

const EMPTY_QUEUE: readonly ToastRecord[] = [];
let nextId = 1;
let queue: readonly ToastRecord[] = EMPTY_QUEUE;
const listeners = new Set<Listener>();

function publish(): void {
  for (const listener of listeners) listener(queue);
}

/** Enqueue a toast from anywhere (event handlers, effects, stores). */
export function toast(message: React.ReactNode, options: ToastOptions = {}): number {
  const record: ToastRecord = {
    id: nextId,
    message,
    tone: options.tone ?? 'info',
    duration: options.duration ?? 5000
  };
  nextId += 1;
  queue = [...queue, record];
  publish();
  return record.id;
}

export function dismissToast(id: number): void {
  queue = queue.filter((record) => record.id !== id);
  publish();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getQueue(): readonly ToastRecord[] {
  return queue;
}

function getServerQueue(): readonly ToastRecord[] {
  return EMPTY_QUEUE;
}

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: ToasterPosition;
  label?: string;
}

/**
 * The toast outlet. Mount once, near the end of the root layout. Timers
 * pause while the stack is hovered; danger toasts announce assertively.
 */
export function Toaster({
  position = 'bottom-right',
  label = 'Notifications',
  className,
  ...props
}: ToasterProps): React.JSX.Element {
  const toasts = React.useSyncExternalStore(subscribe, getQueue, getServerQueue);
  const timersRef = React.useRef(new Map<number, number>());
  const pausedRef = React.useRef(false);

  React.useEffect(() => {
    const timers = timersRef.current;
    if (pausedRef.current) return;
    for (const record of toasts) {
      if (record.duration > 0 && !timers.has(record.id)) {
        timers.set(
          record.id,
          window.setTimeout(() => {
            timers.delete(record.id);
            dismissToast(record.id);
          }, record.duration)
        );
      }
    }
    return () => {
      for (const [id, timer] of timers) {
        if (!toasts.some((record) => record.id === id)) {
          window.clearTimeout(timer);
          timers.delete(id);
        }
      }
    };
  }, [toasts]);

  const pause = (): void => {
    pausedRef.current = true;
    for (const timer of timersRef.current.values()) window.clearTimeout(timer);
    timersRef.current.clear();
  };

  const resume = (): void => {
    pausedRef.current = false;
    for (const record of toasts) {
      if (record.duration > 0 && !timersRef.current.has(record.id)) {
        timersRef.current.set(
          record.id,
          window.setTimeout(() => {
            timersRef.current.delete(record.id);
            dismissToast(record.id);
          }, record.duration)
        );
      }
    }
  };

  return (
    <div
      {...props}
      className={cn('aliencn-toaster', `aliencn-toaster--${position}`, className)}
      role="region"
      aria-label={label}
      onPointerEnter={pause}
      onPointerLeave={resume}
    >
      {toasts.map((record) => (
        <div
          key={record.id}
          role={record.tone === 'danger' ? 'alert' : 'status'}
          className={cn('aliencn-toast', `aliencn-toast--${record.tone}`)}
        >
          <span className="aliencn-toast__message">{record.message}</span>
          <button
            type="button"
            className="aliencn-toast__dismiss"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(record.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
