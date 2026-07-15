import * as React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[rgb(var(--primary))] text-[rgb(var(--text-inverse))] hover:bg-[rgb(var(--primary-light))]',
  accent: 'bg-[rgb(var(--accent))] text-[rgb(var(--primary-dark))] hover:bg-[rgb(var(--accent-light))]',
  outline: 'bg-transparent border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-hover))] hover:border-[rgb(var(--primary-light))] hover:border-[rgb(var(--error))]',
  ghost: 'bg-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]',
  danger: 'bg-[rgb(var(--error))] text-white hover:bg-red-700 border border-transparent hover:border-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded',
  default: 'h-9 px-4 text-sm gap-2 rounded',
  lg: 'h-11 px-6 text-base gap-2.5 rounded',
  icon: 'h-9 w-9 text-sm rounded',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary-light))] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.98]',
          'select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
