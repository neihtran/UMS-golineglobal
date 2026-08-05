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
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  // An toàn với single child, array children, hoặc fragment — chỉ inject prop vào react element đầu tiên
  let enhanced: React.ReactNode = children;
  if (React.isValidElement(children)) {
    enhanced = React.cloneElement(
      children as React.ReactElement<{ id: string; 'aria-describedby'?: string; hasError?: boolean }>,
      {
        id,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        hasError: !!error,
      }
    );
  } else if (Array.isArray(children)) {
    enhanced = React.Children.map(children, (child, idx) => {
      if (idx === 0 && React.isValidElement(child)) {
        return React.cloneElement(
          child as React.ReactElement<{ id: string; 'aria-describedby'?: string; hasError?: boolean }>,
          {
            id,
            ...(describedBy ? { 'aria-describedby': describedBy } : {}),
            hasError: !!error,
          }
        );
      }
      return child;
    });
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[rgb(var(--text-primary))]">
        {label}
        {required && <span className="ml-0.5 text-[rgb(var(--error))]">*</span>}
      </label>
      {enhanced}
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
