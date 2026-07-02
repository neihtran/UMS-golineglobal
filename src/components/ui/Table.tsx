import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

// ─── Table ──────────────────────────────────────────────────────────────────

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  caption?: string;
  noCol?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, caption, noCol, children, ...props }, ref) => (
    <div className={clsx('w-full overflow-x-auto rounded-[var(--radius-md)] border border-[rgb(var(--border))]', noCol && 'overflow-x-visible')}>
      <table
        ref={ref}
        className={clsx('w-full caption-bottom text-sm', className)}
        {...props}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  ),
);

Table.displayName = 'Table';

// ─── Thead ───────────────────────────────────────────────────────────────────

export const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={clsx('bg-[rgb(var(--bg-base))]', className)} {...props} />
  ),
);

TableHead.displayName = 'TableHead';

// ─── Tbody ──────────────────────────────────────────────────────────────────

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={clsx('divide-y divide-[rgb(var(--border)/0.5)]', className)} {...props} />
  ),
);

TableBody.displayName = 'TableBody';

// ─── Tr ─────────────────────────────────────────────────────────────────────

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        'transition-colors duration-150 hover:bg-[rgb(var(--bg-hover))]',
        className,
      )}
      {...props}
    />
  ),
);

TableRow.displayName = 'TableRow';

// ─── Th ─────────────────────────────────────────────────────────────────────

interface TableHeadCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDir?: 'asc' | 'desc' | null;
}

export const TableHeadCell = React.forwardRef<HTMLTableCellElement, TableHeadCellProps>(
  ({ className, sortable, sortDir, children, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
        'text-[rgb(var(--text-secondary))]',
        'border-b border-[rgb(var(--border))]',
        sortable && 'cursor-pointer select-none hover:text-[rgb(var(--text-primary))]',
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className={clsx('text-[rgb(var(--text-muted))]', sortDir && 'text-[rgb(var(--primary))]')}>
            {sortDir === 'asc' ? '↑' : sortDir === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </span>
    </th>
  ),
);

TableHeadCell.displayName = 'TableHeadCell';

// ─── Td ─────────────────────────────────────────────────────────────────────

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, numeric, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx(
        'px-4 py-3 text-[rgb(var(--text-primary))]',
        numeric && 'text-right font-mono tabular-nums',
        className,
      )}
      {...props}
    />
  ),
);

TableCell.displayName = 'TableCell';

// ─── Pagination ─────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const TablePagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) => {
  const { t } = useTranslation('common');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className={clsx(
      'flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3',
      'border-t border-[rgb(var(--border))] text-sm text-[rgb(var(--text-secondary))]',
      className,
    )}>
      {/* Info */}
      <span>
        {total === 0 ? t('pagination.noData') : `${start}–${end} ${t('pagination.in')} ${total}`}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[rgb(var(--text-muted))]">{t('pagination.rows')}:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 w-16 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-1.5 text-xs text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <span className="text-xs text-[rgb(var(--text-muted))]">
          {t('pagination.page')} {page} / {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label={t('pagination.firstPage')}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={t('pagination.prevPage')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label={t('pagination.nextPage')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label={t('pagination.lastPage')}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  description?: string;
}

export const TableEmpty = ({
  colSpan,
  message,
  description,
}: TableEmptyProps) => {
  const { t } = useTranslation('common');
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-[rgb(var(--bg-hover))] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[rgb(var(--text-muted))]" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">{message ?? t('pagination.noData')}</p>
          {description && <p className="text-xs text-[rgb(var(--text-muted))]">{description}</p>}
        </div>
      </td>
    </tr>
  );
};

// ─── Loading Skeleton ────────────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  colSpan?: number;
}

export const TableSkeleton = ({ rows = 5, cols = 5, colSpan }: TableSkeletonProps) => (
  <tbody>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="border-b border-[rgb(var(--border)/0.5)]">
        {Array.from({ length: colSpan ?? cols }).map((_, j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-4 w-3/4 rounded bg-[rgb(var(--bg-hover))] animate-pulse" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);
