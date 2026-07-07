import * as React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Edit2, Printer } from 'lucide-react';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  /** Render the content of the detail page here */
  children: React.ReactNode;
  /** Custom footer actions — if not provided, shows default Close button */
  footer?: React.ReactNode;
  /** Show Edit button — calls onEdit when clicked */
  onEdit?: () => void;
  /** Show Print button — calls onPrint when clicked */
  onPrint?: () => void;
  /** Hide the default footer entirely */
  hideFooter?: boolean;
  className?: string;
}

/**
 * Shared modal wrapper for all detail pages opened from a list.
 * Provides consistent header (title, description, close button) and
 * optional footer (Edit, Print, Close) for every entity detail modal.
 *
 * Usage:
 * ```tsx
 * <DetailModal
 *   open={!!selectedId}
 *   onClose={close}
 *   title={staff?.name}
 *   description={staff?.code}
 *   size="fullscreen"
 *   onEdit={() => openEdit(selectedId)}
 *   onPrint={handlePrint}
 * >
 *   <VienChucDetail id={selectedId} />
 * </DetailModal>
 * ```
 */
export function DetailModal({
  open,
  onClose,
  title,
  description,
  size = 'fullscreen',
  children,
  footer,
  onEdit,
  onPrint,
  hideFooter = false,
  className,
}: DetailModalProps) {
  const defaultFooter = !hideFooter && !footer && (
    <div className="flex items-center justify-end gap-2">
      {onEdit && (
        <Button
          variant="primary"
          leftIcon={<Edit2 className="h-4 w-4" />}
          onClick={onEdit}
        >
          Sửa
        </Button>
      )}
      {onPrint && (
        <Button
          variant="outline"
          leftIcon={<Printer className="h-4 w-4" />}
          onClick={onPrint}
        >
          In
        </Button>
      )}
      <Button variant="outline" onClick={onClose}>
        Đóng
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={footer ?? defaultFooter}
      className={className}
    >
      {children}
    </Modal>
  );
}
