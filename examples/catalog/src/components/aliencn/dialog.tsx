'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface DialogProps
  extends Omit<
    React.DialogHTMLAttributes<HTMLDialogElement>,
    'open' | 'title' | 'onCancel' | 'onClose'
  > {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  className,
  children,
  ...props
}: DialogProps): React.JSX.Element {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      {...props}
      ref={dialogRef}
      className={cn('aliencn-dialog', className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => {
        if (open) onOpenChange(false);
      }}
    >
      <header className="aliencn-dialog__header">
        <h2 id={titleId} className="aliencn-dialog__title">{title}</h2>
        {description ? (
          <p id={descriptionId} className="aliencn-dialog__description">{description}</p>
        ) : null}
      </header>
      <button
        type="button"
        className="aliencn-dialog-close"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      >
        ×
      </button>
      <div className="aliencn-dialog__body">{children}</div>
      {footer ? <footer className="aliencn-dialog__footer">{footer}</footer> : null}
    </dialog>
  );
}
