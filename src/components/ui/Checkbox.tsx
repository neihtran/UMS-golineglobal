import * as React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

// ─── Checkbox ────────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, disabled, ...props }, ref) => {
    return (
      <div className="flex items-start gap-2.5">
        <label className={clsx('relative flex items-start gap-2 cursor-pointer group', disabled && 'opacity-50 cursor-not-allowed')}>
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <span
            className={clsx(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150',
              'peer-checked:bg-[rgb(var(--primary))] peer-checked:border-[rgb(var(--primary))]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--primary))] peer-focus-visible:ring-offset-2',
              'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]',
              'group-hover:border-[rgb(var(--primary-light))]',
              error && 'border-[rgb(var(--error))]',
              className,
            )}
          >
            <Check className="h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </span>
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-medium text-[rgb(var(--text-primary))] leading-tight">{label}</span>
              )}
              {description && (
                <span className="text-xs text-[rgb(var(--text-muted))] leading-tight mt-0.5">{description}</span>
              )}
            </div>
          )}
        </label>
        {error && <p className="text-xs text-[rgb(var(--error))] mt-0.5">{error}</p>}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

// ─── CheckboxGroup ──────────────────────────────────────────────────────────

interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** 2+ columns */
  columns?: number;
  disabled?: boolean;
}

export function CheckboxGroup({ options, value, onChange, columns = 1, disabled }: CheckboxGroupProps) {
  function toggle(v: string) {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  }

  return (
    <div
      className="gap-x-6 gap-y-2"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {options.map((opt) => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={value.includes(opt.value)}
          onChange={() => toggle(opt.value)}
          disabled={disabled || opt.disabled}
        />
      ))}
    </div>
  );
}
