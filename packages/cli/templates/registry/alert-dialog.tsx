'use client';

import * as React from 'react';

import { Button } from '{{components}}/button';
import { Dialog } from '{{components}}/dialog';

export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  cancelLabel?: string;
  actionLabel: string;
  onAction: () => void;
  /** Destructive confirms use the danger action tone. */
  tone?: 'danger' | 'primary';
  children?: React.ReactNode;
}

/**
 * A confirm preset over the native Dialog: focus starts on Cancel, the
 * action is explicit, and destructive intent gets the danger tone.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Cancel',
  actionLabel,
  onAction,
  tone = 'danger',
  children
}: AlertDialogProps): React.JSX.Element {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button tone="ghost" autoFocus onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            tone={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onAction();
              onOpenChange(false);
            }}
          >
            {actionLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
