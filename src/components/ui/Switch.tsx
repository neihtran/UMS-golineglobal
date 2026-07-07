import * as React from 'react';
import { clsx } from 'clsx';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, error, disabled, className, checked, onChange, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        {(label || description) && (
          <div className="flex flex-col flex-1 pt-0.5">
            {label && (
              <span className="text-sm font-medium text-[rgb(var(--text-primary))] leading-tight">{label}</span>
            )}
            {description && (
              <span className="text-xs text-[rgb(var(--text-muted))] leading-tight mt-0.5">{description}</span>
            )}
          </div>
        )}
        <label className={clsx('relative flex items-center cursor-pointer select-none shrink-0', disabled && 'opacity-50 cursor-not-allowed')}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <span
            className={clsx(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200',
              'border-[rgb(var(--border))] bg-[rgb(var(--border))]',
              'peer-checked:bg-[rgb(var(--primary))] peer-checked:border-[rgb(var(--primary))]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--primary))] peer-focus-visible:ring-offset-2',
              'after:absolute after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm',
              'after:transition-transform after:duration-200 after:content-[""]',
              'peer-checked:after:translate-x-4',
              disabled && 'cursor-not-allowed',
              className,
            )}
          />
        </label>
        {error && <p className="text-xs text-[rgb(var(--error))] mt-0.5">{error}</p>}
      </div>
    );
  },
);
Switch.displayName = 'Switch';
