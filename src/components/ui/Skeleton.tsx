import { clsx } from 'clsx';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';
type SkeletonAnimation = 'pulse' | 'wave' | 'none';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animation?: SkeletonAnimation;
  className?: string;
  lines?: number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text:        'rounded h-3 w-full',
  circular:    'rounded-full',
  rectangular: 'rounded-lg',
  card:        'rounded-xl',
};

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className,
}: SkeletonProps) {
  const animClass =
    animation === 'pulse'
      ? 'animate-pulse'
      : animation === 'wave'
      ? 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-[shimmer_1.5s_infinite]'
      : '';

  return (
    <div
      className={clsx('bg-[rgb(var(--bg-base))]', variantClasses[variant], animClass, className)}
      style={{ width: width, height: height }}
      aria-hidden="true"
    />
  );
}

// ─── Skeleton Lines ─────────────────────────────────────────────────────────

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string | number;
  className?: string;
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%', className }: SkeletonTextProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('rounded-xl border border-[rgb(var(--border))] p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

// ─── Skeleton Table Row ────────────────────────────────────────────────────

export function SkeletonTableRow({ columns = 5, className }: { columns?: number; className?: string }) {
  return (
    <div className={clsx('flex items-center gap-4 py-3 border-b border-[rgb(var(--border))]', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === 0 ? '2rem' : `${Math.floor(Math.random() * 30 + 60)}%`} />
      ))}
    </div>
  );
}

// ─── Table Skeleton ─────────────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 8, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={clsx('space-y-0', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 py-3 border-b border-[rgb(var(--border))]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${Math.floor(Math.random() * 20 + 70)}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  );
}
