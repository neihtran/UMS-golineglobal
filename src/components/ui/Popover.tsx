import * as React from 'react';
import { clsx } from 'clsx';

type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

interface PopoverProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  /** Đóng khi click outside */
  closeOnClickOutside?: boolean;
  className?: string;
  contentClassName?: string;
}

const placementMap: Record<PopoverPlacement, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Popover({
  children,
  content,
  placement = 'bottom',
  closeOnClickOutside = true,
  className,
  contentClassName,
}: PopoverProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !closeOnClickOutside) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeOnClickOutside]);

  return (
    <div ref={ref} className={clsx('relative inline-flex', className)}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {children}
      </div>
      {open && (
        <div
          className={clsx(
            'absolute z-50 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-[var(--shadow-xl)]',
            'animate-in fade-in zoom-in-95 duration-150',
            placementMap[placement],
            contentClassName,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
