import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && (
        <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">{description}</p>
      )}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={() => { onConfirm(); }}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
            variant === 'danger'
              ? 'bg-[rgb(var(--error))] text-white hover:bg-[rgb(var(--error)/0.9)]'
              : 'bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-light))]'
          }`}
        >
          {loading ? 'Đang xử lý...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
