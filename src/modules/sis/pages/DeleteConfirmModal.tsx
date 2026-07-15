import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isLoading,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className="bg-[rgb(var(--error))] hover:bg-[rgb(var(--error))]/90"
          >
            Xóa
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-[rgb(var(--error))]/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-[rgb(var(--error))]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
        <p className="text-[rgb(var(--text-muted))]">
          Bạn có chắc chắn muốn xóa <strong>{title}</strong> không?
        </p>
        {itemName && (
          <p className="text-sm font-medium mt-1 text-[rgb(var(--text-primary))]">{itemName}</p>
        )}
        <p className="text-sm text-[rgb(var(--error))] mt-3">
          Hành động này không thể hoàn tác.
        </p>
      </div>
    </Modal>
  );
}
