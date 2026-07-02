import * as React from 'react';
import { clsx } from 'clsx';

export type ChipVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
type ChipSize = 'sm' | 'md';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  /** X icon để close */
  onRemove?: () => void;
}

const variantClasses: Record<ChipVariant, string> = {
  default:   'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border))]',
  primary:   'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] border border-[rgb(var(--primary)/0.2)]',
  accent:    'bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.2)]',
  success:   'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))] border border-[rgb(var(--success)/0.2)]',
  warning:   'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))] border border-[rgb(var(--warning)/0.2)]',
  error:     'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))] border border-[rgb(var(--error)/0.2)]',
  info:      'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))] border border-[rgb(var(--info)/0.2)]',
  neutral:   'bg-[rgb(var(--text-muted)/0.1)] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border))]',
};

const sizeClasses: Record<ChipSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export const Chip: React.FC<ChipProps> = ({
  variant = 'default',
  size = 'md',
  onRemove,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium leading-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgb(var(--primary))]"
          aria-label="Remove"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M9.354 3.354a.5.5 0 0 0-.708-.708L6 5.293 3.354 2.646a.5.5 0 1 0-.708.708L5.293 6 2.646 8.646a.5.5 0 0 0 .708.708L6 6.707l2.646 2.647a.5.5 0 0 0 .708-.708L6.707 6l2.647-2.646z" />
          </svg>
        </button>
      )}
    </span>
  );
};

// ─── ChipGroup ─────────────────────────────────────────────────────────────

interface ChipGroupProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  variant?: ChipVariant;
  size?: ChipSize;
  /** Cho phép chọn nhiều hay chỉ 1 */
  multiple?: boolean;
}

export function ChipGroup({ options, value, onChange, variant = 'default', size = 'sm', multiple = true }: ChipGroupProps) {
  function toggle(v: string) {
    if (multiple) {
      if (value.includes(v)) onChange(value.filter((x) => x !== v));
      else onChange([...value, v]);
    } else {
      onChange(value.includes(v) ? [] : [v]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <Chip
            key={opt.value}
            variant={active ? 'primary' : variant}
            size={size}
            onRemove={active && multiple ? () => toggle(opt.value) : undefined}
            onClick={() => toggle(opt.value)}
            className="cursor-pointer hover:opacity-80"
          >
            {opt.label}
          </Chip>
        );
      })}
    </div>
  );
}
