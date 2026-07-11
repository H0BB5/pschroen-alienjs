import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, className, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      className={cn('aliencn-input', className)}
      aria-invalid={invalid || undefined}
    />
  )
);
Input.displayName = 'Input';

export interface InputFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  inputProps?: Omit<InputProps, 'invalid'>;
}

export function InputField({
  label,
  hint,
  error,
  className,
  inputProps = {}
}: InputFieldProps): React.JSX.Element {
  const generatedId = React.useId();
  const inputId = inputProps.id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cn('aliencn-field', className)}>
      <label className="aliencn-field__label" htmlFor={inputId}>
        {label}
      </label>
      <Input
        {...inputProps}
        id={inputId}
        invalid={Boolean(error)}
        aria-describedby={message ? messageId : undefined}
      />
      <div
        id={messageId}
        className={cn('aliencn-field__meta', Boolean(error) && 'aliencn-field__meta--error')}
        aria-live={error ? 'polite' : undefined}
      >
        {message}
      </div>
    </div>
  );
}
