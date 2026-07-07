import { useState, useCallback } from 'react';

export interface DetailModalOptions {
  /** Default modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  /** Title shown in modal header */
  title?: string;
}

/**
 * Shared hook for list pages that open detail/edit as modals.
 * Replaces the pattern of `useState<string | null>(null)` + `navigate` + `Link`.
 *
 * Usage:
 * ```tsx
 * const { selectedId, openDetail, openEdit, close, isEdit } = useDetailModal({ size: 'fullscreen' });
 *
 * return (
 *   <>
 *     <Button onClick={() => openDetail(s.id)}>Chi tiết</Button>
 *     <Button onClick={() => openEdit(s.id)}>Sửa</Button>
 *
 *     <DetailModal open={!!selectedId} onClose={close} size={size}>
 *       {isEdit
 *         ? <EntityEdit id={selectedId} onSuccess={close} />
 *         : <EntityDetail id={selectedId} onEdit={() => openEdit(selectedId)} onClose={close} />}
 *     </DetailModal>
 *   </>
 * );
 * ```
 */
export function useDetailModal<T = string>(options: DetailModalOptions = {}) {
  const [selectedId, setSelectedId] = useState<T | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const openDetail = useCallback((id: T) => {
    setSelectedId(id);
    setIsEditMode(false);
  }, []);

  const openEdit = useCallback((id: T) => {
    setSelectedId(id);
    setIsEditMode(true);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedId(null);
    setIsEditMode(true);
  }, []);

  const close = useCallback(() => {
    setSelectedId(null);
    setIsEditMode(false);
  }, []);

  return {
    /** The currently selected entity ID, or null */
    selectedId,
    /** True when the modal is open (id is not null) */
    isOpen: selectedId !== null,
    /** True when in edit/create mode (vs detail mode) */
    isEditMode,
    /** True when in create mode (no id selected) */
    isCreateMode: selectedId === null && isEditMode,
    openDetail,
    openEdit,
    openCreate,
    close,
    size: options.size,
    title: options.title,
  };
}
