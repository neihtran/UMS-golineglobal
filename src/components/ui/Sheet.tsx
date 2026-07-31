import * as React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
  side?: 'left' | 'right';
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SheetHeaderProps {
  children: React.ReactNode;
  showClose?: boolean;
  onClose?: () => void;
}

interface SheetTitleProps {
  children: React.ReactNode;
}

function SheetOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

export function Sheet({ open, onClose, children, className, hideCloseButton = true, side = 'right' }: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <SheetOverlay open={open} onClose={onClose} />
      <div
        className={clsx(
          'fixed top-0 bottom-0 z-[10000] flex flex-col',
          'bg-[rgb(var(--bg-card))] shadow-[var(--shadow-xl)]',
          'animate-in slide-in-from-right fade-in duration-300',
          'max-w-full overflow-hidden',
          side === 'right' ? 'right-0' : 'left-0',
          className,
        )}
        style={{
          width: '100%',
          maxWidth: '32rem',
          animationName: side === 'right' ? 'sheetSlideInRight' : 'sheetSlideInLeft',
        }}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
      <style>{`
        @keyframes sheetSlideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes sheetSlideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

export function SheetContent({ children, className = '' }: SheetContentProps) {
  return (
    <div className={clsx('flex-1 overflow-y-auto px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function SheetHeader({ children, showClose = false, onClose }: SheetHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))] shrink-0">
      <div className="text-base font-semibold text-[rgb(var(--text-primary))]">
        {children}
      </div>
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SheetTitle({ children }: SheetTitleProps) {
  return <>{children}</>;
}
