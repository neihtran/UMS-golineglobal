import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

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
  const [localLoading, setLocalLoading] = useState(false);

  const handleConfirm = async () => {
    if (localLoading || loading) return;
    setLocalLoading(true);
    try {
      await onConfirm();
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && (
        <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">{description}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={localLoading || loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          loading={localLoading || loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
