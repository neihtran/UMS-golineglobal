import * as React from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
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

export function Sheet({ open, onClose, children, className, hideCloseButton = true }: SheetProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      className={className}
      closeOnOverlayClick
      closeOnEsc
      hideCloseButton={hideCloseButton}
    >
      {children}
    </Modal>
  );
}

export function SheetContent({ children, className = '' }: SheetContentProps) {
  return (
    <div className={`max-h-[85vh] overflow-y-auto px-6 pt-4 pb-6 ${className}`}>
      {children}
    </div>
  );
}

export function SheetHeader({ children, showClose = false, onClose }: SheetHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[rgb(var(--border))]">
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
