'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** The multi-line counterpart to Input, sharing its optical styling. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid = false, className, ...props }, ref) => (
    <textarea
      {...props}
      ref={ref}
      className={cn('aliencn-input', 'aliencn-textarea', className)}
      aria-invalid={invalid || undefined}
    />
  )
);
Textarea.displayName = 'Textarea';
