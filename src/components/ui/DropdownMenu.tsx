import * as React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

// ─── DropdownMenu Item ───────────────────────────────────────────────────────

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  description?: string;
  checked?: boolean;
  onClick?: () => void;
}

interface DropdownSeparator {
  type: 'separator';
}

interface DropdownLabel {
  type: 'label';
  label: string;
}

type DropdownContent = DropdownItem | DropdownSeparator | DropdownLabel;

// ─── DropdownMenu Trigger + Menu ─────────────────────────────────────────────

interface DropdownMenuProps {
  trigger: React.ReactElement;
  items: DropdownContent[];
  className?: string;
  menuClassName?: string;
  /** Đóng khi click item */
  closeOnItemClick?: boolean;
}

export function DropdownMenu({
  trigger,
  items,
  className,
  menuClassName,
  closeOnItemClick = true,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={clsx('relative inline-flex', className)}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={clsx(
            'absolute right-0 top-full z-50 mt-1.5 min-w-[180px] rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-[var(--shadow-xl)]',
            'animate-in fade-in slide-in-from-top-2 duration-150 py-1',
            menuClassName,
          )}
          role="menu"
        >
          {items.map((item, i) => {
            if ('type' in item) {
              if (item.type === 'separator') {
                return <div key={i} className="my-1 border-t border-[rgb(var(--border)/0.6)]" />;
              }
              return (
                <div key={i} className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  {item.label}
                </div>
              );
            }

            const { id, label, icon, disabled, danger, description, checked, onClick } = item;

            return (
              <button
                key={id}
                disabled={disabled}
                onClick={() => {
                  if (!disabled && closeOnItemClick) setOpen(false);
                  onClick?.();
                }}
                className={clsx(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                  disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : danger
                    ? 'text-[rgb(var(--error))] hover:bg-red-50'
                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]',
                )}
                role="menuitem"
              >
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="flex-1 text-left">{label}</span>
                {description && <span className="text-xs text-[rgb(var(--text-muted))]">{description}</span>}
                {checked !== undefined && (
                  <span className="shrink-0">
                    {checked ? <Check className="h-3.5 w-3.5 text-[rgb(var(--primary))]" /> : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ContextMenu (right-click) ─────────────────────────────────────────────

interface ContextMenuProps extends DropdownMenuProps {
  x: number;
  y: number;
}

export function ContextMenu({ x, y, ...props }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handler() { setOpen(false); }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <div ref={ref} className="fixed z-[200]">
      <div style={{ left: x, top: y }} className="animate-in fade-in zoom-in-95 duration-100">
        <DropdownMenu
          {...props}
          trigger={<span />}
          className="contents"
          closeOnItemClick
        />
      </div>
    </div>
  );
}
