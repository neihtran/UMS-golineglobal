import * as React from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

type InputSize = 'sm' | 'default' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const sizeClasses: Record<InputSize, { input: string; icon: string }> = {
  sm: { input: 'h-7 text-xs px-2.5', icon: 'h-3.5 w-3.5' },
  default: { input: 'h-9 text-sm px-3', icon: 'h-4 w-4' },
  lg: { input: 'h-11 text-base px-4', icon: 'h-5 w-5' },
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      size = 'default',
      leftIcon,
      rightIcon,
      wrapperClassName,
      className,
      id,
      type,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputId = id ?? React.useId();
    const actualType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[rgb(var(--text-primary))]"
          >
            {label}
            {props.required && <span className="ml-0.5 text-[rgb(var(--error))]" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-[rgb(var(--text-muted))] pointer-events-none">
              <span className={sizeClasses[size].icon} aria-hidden="true">{leftIcon}</span>
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={clsx(
              'w-full rounded border bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))]',
              'placeholder:text-[rgb(var(--text-muted))]',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              sizeClasses[size].input,
              leftIcon && 'pl-9',
              (rightIcon || isPassword) && 'pr-9',
              error
                ? 'border-[rgb(var(--error))] focus:border-[rgb(var(--error))] focus:ring-red-500/20'
                : 'border-[rgb(var(--border))] focus:border-[rgb(var(--border-focus))] focus:ring-[rgb(var(--primary-light))/0.2]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))] transition-colors focus:outline-none"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword
                ? <EyeOff className={sizeClasses[size].icon} aria-hidden="true" />
                : <Eye className={sizeClasses[size].icon} aria-hidden="true" />}
            </button>
          ) : (
            rightIcon && (
              <span className="absolute right-3 flex items-center text-[rgb(var(--text-muted))] pointer-events-none">
                <span className={sizeClasses[size].icon} aria-hidden="true">{rightIcon}</span>
              </span>
            )
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="flex items-center gap-1 text-xs text-[rgb(var(--error))]" role="alert">
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[rgb(var(--text-muted))]">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, wrapperClassName, className, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[rgb(var(--text-primary))]">
            {label}
            {props.required && <span className="ml-0.5 text-[rgb(var(--error))]" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={clsx(
            'w-full rounded border bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))]',
            'px-3 py-2 text-sm min-h-[80px] resize-y',
            'placeholder:text-[rgb(var(--text-muted))]',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-[rgb(var(--error))] focus:border-[rgb(var(--error))] focus:ring-red-500/20'
              : 'border-[rgb(var(--border))] focus:border-[rgb(var(--border-focus))] focus:ring-[rgb(var(--primary-light))/0.2]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 text-xs text-[rgb(var(--error))]" role="alert">
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-[rgb(var(--text-muted))]">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
