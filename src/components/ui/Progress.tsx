import { clsx } from 'clsx';

type ProgressVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: string;
  showValue?: boolean;
  trackClassName?: string;
  className?: string;
}

const variantColor: Record<ProgressVariant, string> = {
  primary:  'bg-[rgb(var(--primary))]',
  accent:   'bg-[rgb(var(--accent))]',
  success:  'bg-[rgb(var(--success))]',
  warning:  'bg-[rgb(var(--warning))]',
  error:    'bg-[rgb(var(--error))]',
};

const sizeHeight: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function Progress({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  label,
  showValue = false,
  trackClassName,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-[rgb(var(--text-secondary))]">{label}</span>}
          {showValue && <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={clsx('w-full overflow-hidden rounded-full bg-[rgb(var(--bg-base))]', sizeHeight[size], trackClassName)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', variantColor[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Progress Circle ───────────────────────────────────────────────────────

interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressCircle({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  variant = 'primary',
  label,
  showValue = false,
  className,
}: ProgressCircleProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  const colorMap: Record<ProgressVariant, string> = {
    primary: 'var(--primary)',
    accent:  'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error:   'var(--error)',
  };

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-[rgb(var(--bg-base))]" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={colorMap[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{Math.round(pct)}%</span>}
        {label && <span className="text-[10px] text-[rgb(var(--text-muted))] leading-tight text-center px-1">{label}</span>}
      </div>
    </div>
  );
}
