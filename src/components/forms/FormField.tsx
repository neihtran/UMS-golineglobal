import React, { useId } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, hint, className = '', children }: FormFieldProps) {
  const id = useId();
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[rgb(var(--text-primary))]">
        {label}
        {required && <span className="ml-0.5 text-[rgb(var(--error))]">*</span>}
      </label>
      {React.cloneElement(children as React.ReactElement<{ id: string; 'aria-describedby'?: string; hasError?: boolean }>, {
        id,
        'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
        hasError: !!error,
      })}
      {error && (
        <p id={`${id}-error`} className="text-xs text-[rgb(var(--error))] flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-[rgb(var(--text-muted))]">
          {hint}
        </p>
      )}
    </div>
  );
}
