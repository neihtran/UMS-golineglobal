import * as React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]',
  accent: 'bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))]',
  success: 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]',
  warning: 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]',
  error: 'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]',
  info: 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]',
  neutral: 'bg-[rgb(var(--text-muted)/0.1)] text-[rgb(var(--text-secondary))]',
};

const dotClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[rgb(var(--primary))]',
  accent: 'bg-[rgb(var(--accent))]',
  success: 'bg-[rgb(var(--success))]',
  warning: 'bg-[rgb(var(--warning))]',
  error: 'bg-[rgb(var(--error))]',
  info: 'bg-[rgb(var(--info))]',
  neutral: 'bg-[rgb(var(--text-muted))]',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = 'primary', size = 'default', dot = false, pulse = false, className, children, ...props },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-full font-semibold select-none',
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={clsx(
              'h-1.5 w-1.5 rounded-full shrink-0',
              dotClasses[variant],
              pulse && 'animate-pulse',
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

// ─── StatusBadge ─────────────────────────────────────────────────────────────

export type StatusType = 'active' | 'inactive' | 'pending' | 'warning' | 'error' | 'info';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'success', label: 'Hoạt động' },
  inactive: { variant: 'neutral', label: 'Không hoạt động' },
  pending: { variant: 'warning', label: 'Chờ xử lý' },
  warning: { variant: 'warning', label: 'Cảnh báo' },
  error: { variant: 'error', label: 'Lỗi' },
  info: { variant: 'info', label: 'Thông tin' },
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, label, dot = true, ...props }, ref) => {
    const config = statusConfig[status];
    return (
      <Badge ref={ref} variant={config.variant} dot={dot} {...props}>
        {label ?? config.label}
      </Badge>
    );
  },
);

StatusBadge.displayName = 'StatusBadge';
