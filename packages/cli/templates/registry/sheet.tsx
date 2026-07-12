'use client';

import * as React from 'react';

import { cn } from '{{utils}}/cn';

export type SheetSide = 'right' | 'left';

export interface SheetProps
  extends Omit<
    React.DialogHTMLAttributes<HTMLDialogElement>,
    'open' | 'title' | 'onCancel' | 'onClose'
  > {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** Compact monospace registration line above the title, e.g. "FIELD CONFIG / 01". */
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  side?: SheetSide;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  eyebrow,
  description,
  footer,
  side = 'right',
  className,
  children,
  ...props
}: SheetProps): React.JSX.Element {
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
      className={cn('aliencn-sheet', `aliencn-sheet--${side}`, className)}
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
      <header className="aliencn-sheet__header">
        <div className="aliencn-sheet__heading">
          {eyebrow ? <span className="aliencn-sheet__eyebrow">{eyebrow}</span> : null}
          <h2 id={titleId} className="aliencn-sheet__title">{title}</h2>
          {description ? (
            <p id={descriptionId} className="aliencn-sheet__description">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="aliencn-sheet__close"
          aria-label="Close sheet"
          onClick={() => onOpenChange(false)}
        >
          ×
        </button>
      </header>
      <div className="aliencn-sheet__body">{children}</div>
      {footer ? <footer className="aliencn-sheet__footer">{footer}</footer> : null}
    </dialog>
  );
}

export interface SheetSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Monospace section registration label, e.g. "SIGNAL". */
  label: React.ReactNode;
}

export function SheetSection({
  label,
  className,
  children,
  ...props
}: SheetSectionProps): React.JSX.Element {
  return (
    <section {...props} className={cn('aliencn-sheet__section', className)}>
      <span className="aliencn-sheet__section-label">{label}</span>
      <div className="aliencn-sheet__section-body">{children}</div>
    </section>
  );
}

export interface SheetRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  sublabel?: React.ReactNode;
}

export function SheetRow({
  label,
  sublabel,
  className,
  children,
  ...props
}: SheetRowProps): React.JSX.Element {
  return (
    <div {...props} className={cn('aliencn-sheet__row', className)}>
      <div className="aliencn-sheet__row-copy">
        <span className="aliencn-sheet__row-label">{label}</span>
        {sublabel ? <span className="aliencn-sheet__row-sublabel">{sublabel}</span> : null}
      </div>
      <div className="aliencn-sheet__row-control">{children}</div>
    </div>
  );
}
