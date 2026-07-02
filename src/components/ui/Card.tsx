import * as React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply hover shadow transition */
  hoverable?: boolean;
  /** Remove default border (use for nested cards) */
  borderless?: boolean;
  /** Add top accent bar */
  accentTop?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, borderless = false, accentTop = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-[var(--radius-md)] bg-[rgb(var(--bg-card))] shadow-[var(--shadow-sm)]',
          !borderless && 'border border-[rgb(var(--border))]',
          hoverable && 'transition-shadow duration-200 hover:shadow-[var(--shadow-md)] cursor-pointer',
          className,
        )}
        {...props}
      >
        {accentTop && (
          <div
            className="h-1 rounded-t-[var(--radius-md)] bg-[rgb(var(--primary))]" aria-hidden="true" />
        )}
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

// ─── Card.Header ─────────────────────────────────────────────────────────────

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex items-center justify-between px-5 pt-5 pb-4',
        'border-b border-[rgb(var(--border)/0.6)]',
        className,
      )}
      {...props}
    />
  ),
);

CardHeader.displayName = 'CardHeader';

// ─── Card.Title ──────────────────────────────────────────────────────────────

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', className, ...props }, ref) => (
    <Tag
      ref={ref}
      className={clsx('text-base font-semibold text-[rgb(var(--text-primary))]', className)}
      {...props}
    />
  ),
);

CardTitle.displayName = 'CardTitle';

// ─── Card.Description ────────────────────────────────────────────────────────

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx('text-sm text-[rgb(var(--text-secondary))]', className)}
      {...props}
    />
  ),
);

CardDescription.displayName = 'CardDescription';

// ─── Card.Content ────────────────────────────────────────────────────────────

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('px-5 py-4', className)} {...props} />
  ),
);

CardContent.displayName = 'CardContent';

// ─── Card.Footer ─────────────────────────────────────────────────────────────

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex items-center px-5 py-4',
        'border-t border-[rgb(var(--border)/0.6)]',
        className,
      )}
      {...props}
    />
  ),
);

CardFooter.displayName = 'CardFooter';
