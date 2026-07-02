import * as React from 'react';
import { clsx } from 'clsx';
import {
  CheckCircle2, XCircle, AlertTriangle, Info, X,
} from 'lucide-react';

// ─── Toast types ────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

// ─── Toast icons ─────────────────────────────────────────────────────────────

const variantConfig: Record<ToastVariant, { icon: React.ReactNode; color: string; bg: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))]" />,
    color: 'text-[rgb(var(--success))]',
    bg: 'bg-[rgb(var(--success)/0.08)]',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-[rgb(var(--error))]" />,
    color: 'text-[rgb(var(--error))]',
    bg: 'bg-[rgb(var(--error)/0.08)]',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-[rgb(var(--warning))]" />,
    color: 'text-[rgb(var(--warning))]',
    bg: 'bg-[rgb(var(--warning)/0.08)]',
  },
  info: {
    icon: <Info className="h-5 w-5 text-[rgb(var(--info))]" />,
    color: 'text-[rgb(var(--info))]',
    bg: 'bg-[rgb(var(--info)/0.08)]',
  },
};

// ─── Toast store ────────────────────────────────────────────────────────────

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

function notify() {
  toastListeners.forEach((l) => l([...toasts]));
}

function addToast(toastData: Omit<ToastItem, 'id'>) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const item: ToastItem = { ...toastData, id };
  toasts = [...toasts, item];
  notify();

  const duration = toastData.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

// ─── Toast API (exported) ──────────────────────────────────────────────────

async function promiseToast<T>(
  p: Promise<T>,
  msgs: { loading: string; success: string; error: string },
): Promise<T> {
  const id = addToast({ title: msgs.loading, variant: 'info', duration: 0 });
  try {
    const result = await p;
    removeToast(id);
    addToast({ title: msgs.success, variant: 'success' });
    return result;
  } catch (err) {
    removeToast(id);
    addToast({ title: msgs.error, message: err instanceof Error ? err.message : undefined, variant: 'error' });
    throw err;
  }
}

export const toast = {
  success: (title: string, message?: string) => addToast({ title, message, variant: 'success' }),
  error:   (title: string, message?: string) => addToast({ title, message, variant: 'error' }),
  warning: (title: string, message?: string) => addToast({ title, message, variant: 'warning' }),
  info:    (title: string, message?: string) => addToast({ title, message, variant: 'info' }),
  promise: promiseToast,
  remove: removeToast,
};

// ─── ToastContainer ─────────────────────────────────────────────────────────

const positionClasses: Record<ToastPosition, string> = {
  'top-right':    'top-4 right-4 flex-col-reverse',
  'top-left':     'top-4 left-4 flex-col-reverse',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left':  'bottom-4 left-4',
  'top-center':   'top-4 left-1/2 -translate-x-1/2 flex-col-reverse',
  'bottom-center':'bottom-4 left-1/2 -translate-x-1/2',
};

interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
}

export function ToastContainer({ position = 'top-right', className }: ToastContainerProps) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    toastListeners.push(setItems);
    return () => { toastListeners = toastListeners.filter((l) => l !== setItems); };
  }, []);

  return (
    <div
      className={clsx(
        'fixed z-[300] flex gap-2 pointer-events-none',
        positionClasses[position],
        className,
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {items.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

// ─── Individual Toast ─────────────────────────────────────────────────────

function ToastItem({
  title, message, variant, action, onDismiss,
}: ToastItem & { onDismiss: () => void }) {
  const cfg = variantConfig[variant];

  return (
    <div
      className={clsx(
        'pointer-events-auto flex min-w-[300px] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-[var(--shadow-xl)]',
        'animate-in slide-in-from-right fade-in duration-300',
        'bg-[rgb(var(--bg-card))] border-[rgb(var(--border))]',
      )}
      role="alert"
    >
      <div className={clsx('shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg)}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-semibold text-[rgb(var(--text-primary))]', cfg.color)}>{title}</p>
        {message && (
          <p className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">{message}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-xs font-semibold text-[rgb(var(--primary))] hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
