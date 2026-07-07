import * as React from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  fullscreen: 'max-w-[95vw] max-h-[95vh]',
};

export const Modal = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  hideCloseButton = false,
  className,
}: ModalProps) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, closeOnEsc, onClose]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        className={clsx(
          'relative rounded-[var(--radius-lg)] bg-[rgb(var(--bg-card))] shadow-[var(--shadow-xl)]',
          'animate-in zoom-in-95 fade-in duration-200',
          size === 'fullscreen'
            ? 'flex flex-col w-full h-full overflow-hidden'
            : 'max-h-[90vh] flex flex-col',
          sizeClasses[size],
          className,
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] shrink-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 id="modal-title" className="text-base font-semibold text-[rgb(var(--text-primary))] truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Đóng"
                className="shrink-0 -mr-1 -mt-0.5"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className={clsx(
          'flex-1 overflow-y-auto',
          size === 'fullscreen' ? 'px-6 py-4' : 'px-6 py-4'
        )}>
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[rgb(var(--border)/0.6)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    size="sm"
    footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div className="text-center">
      <p className="text-sm text-[rgb(var(--text-primary))]">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">{description}</p>
      )}
    </div>
  </Modal>
);

// ─── Drawer ──────────────────────────────────────────────────────────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  placement?: 'left' | 'right';
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
  className?: string;
}

export const Drawer = ({
  open,
  onClose,
  title,
  description,
  placement = 'right',
  width = '480px',
  children,
  footer,
  hideCloseButton = false,
  className,
}: DrawerProps) => {
  const isRight = placement === 'right';

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={clsx(
          'relative bg-[rgb(var(--bg-card))] shadow-[var(--shadow-xl)] flex flex-col',
          'animate-in slide-in-from-right fade-in duration-300',
          'h-full overflow-hidden',
          className,
        )}
        style={{
          width,
          maxWidth: '100vw',
          [isRight ? 'marginLeft' : 'marginRight']: 'auto',
          animationName: isRight ? 'slideInFromRight' : 'slideInFromLeft',
        }}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] shrink-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{description}</p>
              )}
            </div>
            {!hideCloseButton && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng" className="-mr-1 -mt-0.5 shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[rgb(var(--border)/0.6)] shrink-0">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
