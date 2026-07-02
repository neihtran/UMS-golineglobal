import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const { t } = useTranslation('common');
  return (
    <nav aria-label={t('common.breadcrumb')} className={clsx('flex items-center gap-1 text-sm', className)}>
      <Link
        to="/dashboard"
        className="flex items-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] transition-colors"
        aria-label={t('common.home')}
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" aria-hidden="true" />
            {isLast || !item.href ? (
              <span
                className={clsx(
                  'max-w-[200px] truncate font-medium',
                  isLast ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="max-w-[200px] truncate text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={clsx('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-3">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{description}</p>
          )}
        </div>

        {actions && (
          <div className="mt-2 flex shrink-0 items-center gap-2 sm:mt-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
