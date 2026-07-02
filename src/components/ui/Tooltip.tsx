import * as React from 'react';
import { clsx } from 'clsx';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Nội dung tooltip */
  content: React.ReactNode;
  /** Placement relative to trigger */
  placement?: TooltipPlacement;
  /** Delay in ms before showing */
  delay?: number;
  /** Trigger element */
  children: React.ReactElement;
}

export function Tooltip({ content, placement = 'top', delay = 400, children }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }

  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  const placementClasses: Record<TooltipPlacement, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-50 whitespace-nowrap rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]',
            'px-2.5 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] shadow-[var(--shadow-lg)]',
            'animate-in fade-in zoom-in-95 duration-100',
            placementClasses[placement],
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
