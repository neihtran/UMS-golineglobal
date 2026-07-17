import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import {
  Button,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatSubjectPrerequisites,
  useCreateHqnhatSubjectPrerequisite,
  useUpdateHqnhatSubjectPrerequisite,
  useDeleteHqnhatSubjectPrerequisite,
  useHqnhatSubjects,
} from '@/hooks/useHqnhat';
import type {
  HqnhatSubjectPrerequisite,
  HqnhatSubjectPrerequisiteCreatePayload,
} from '@/types/hqnhat.types';

const emptyForm = (): HqnhatSubjectPrerequisiteCreatePayload => ({
  subject_id: 0, prerequisite_subject_id: 0, type: 1,
});

export function SubjectPrerequisiteSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const params = {
    page, per_page: pageSize,
    subject_id: subjectFilter ? Number(subjectFilter) : undefined,
    type: typeFilter ? Number(typeFilter) as 1 | 2 : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatSubjectPrerequisites(params);
  const { data: subjData } = useHqnhatSubjects({ page: 1, per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const subjects = subjData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [form, setForm] = useState<HqnhatSubjectPrerequisiteCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMut = useCreateHqnhatSubjectPrerequisite();
  const updateMut = useUpdateHqnhatSubjectPrerequisite();
  const deleteMut = useDeleteHqnhatSubjectPrerequisite();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getSubjName = (id: number) => subjects.find(s => s.id === id)?.name ?? '—';
  const getSubjCode = (id: number) => subjects.find(s => s.id === id)?.code ?? '';

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: HqnhatSubjectPrerequisite) => { setEditing(item); setForm({ subject_id: item.subject_id, prerequisite_subject_id: item.prerequisite_subject_id, type: item.type as 1 | 2 }); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openDetail = (item: HqnhatSubjectPrerequisite) => { setDetailItem(item); setDetailOpen(true); };
  const openDelete = (item: HqnhatSubjectPrerequisite) => { setDeleting(item); setDeleteOpen(true); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.subject_id || form.subject_id === 0) e.subject_id = 'Chọn môn học';
    if (!form.prerequisite_subject_id || form.prerequisite_subject_id === 0) e.prerequisite_subject_id = 'Chọn môn tiên quyết';
    if (form.subject_id === form.prerequisite_subject_id) e.prerequisite_subject_id = 'Môn tiên quyết phải khác môn chính';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload: form })
        : await createMut.mutateAsync(form);
      setModalOpen(false);
    } catch (err: any) { setSubmitError(err.message || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await deleteMut.mutateAsync(deleting.id); setDeleteOpen(false); setDeleting(null); } catch (_) {}
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
          <option value="">Tất cả môn học</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
          <option value="">Tất cả loại</option><option value="1">Tiên quyết</option><option value="2">Học trước</option>
        </select>
        {(subjectFilter || typeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSubjectFilter(''); setTypeFilter(''); setPage(1); }}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm tiên quyết</Button>
      </div>

      <Table>
        <TableHead><TableRow>
          <TableHeadCell>STT</TableHeadCell><TableHeadCell>Môn học</TableHeadCell><TableHeadCell>Môn tiên quyết</TableHeadCell>
          <TableHeadCell>Loại</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
        </TableRow></TableHead>
        <TableBody>
          {isLoading ? <TableSkeleton colSpan={5} rows={5} /> :
           items.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có tiên quyết nào</TableCell></TableRow> :
           items.map((item, i) => (
             <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
               <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
               <TableCell className="font-medium"><span className="font-mono text-sm">{getSubjCode(item.subject_id)}</span> {getSubjName(item.subject_id)}</TableCell>
               <TableCell className="text-sm"><span className="font-mono">{getSubjCode(item.prerequisite_subject_id)}</span> {getSubjName(item.prerequisite_subject_id)}</TableCell>
               <TableCell>{item.type === 1 ? <Badge variant="warning">Tiên quyết</Badge> : <Badge variant="info">Học trước</Badge>}</TableCell>
               <TableCell className="text-right">
                 <div className="flex items-center justify-end gap-1">
                   <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                 </div>
               </TableCell>
             </TableRow>
           ))}
        </TableBody>
      </Table>
      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa tiên quyết' : 'Thêm tiên quyết'} size="md" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <FormField label="Môn học" error={errors.subject_id} required>
            <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn môn --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Môn tiên quyết" error={errors.prerequisite_subject_id} required>
            <select value={form.prerequisite_subject_id} onChange={e => setForm({ ...form, prerequisite_subject_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn môn --</option>
              {subjects.filter(s => s.id !== form.subject_id).map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Loại" required>
            <select value={form.type} onChange={e => setForm({ ...form, type: Number(e.target.value) as 1 | 2 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={1}>Tiên quyết (prerequisite)</option>
              <option value={2}>Học trước (corequisite)</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa tiên quyết" description="Bạn có chắc muốn xóa liên kết tiên quyết này?" confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết" size="md">
        {detailItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Môn học</p><p className="font-medium">{getSubjName(detailItem.subject_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Môn tiên quyết</p><p className="font-medium">{getSubjName(detailItem.prerequisite_subject_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại</p><p className="font-medium">{detailItem.type === 1 ? 'Tiên quyết' : 'Học trước'}</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}
