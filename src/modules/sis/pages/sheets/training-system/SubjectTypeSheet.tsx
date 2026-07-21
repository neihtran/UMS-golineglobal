import { useState } from 'react';
import { Plus, Search, Edit, Trash2, RotateCcw } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatSubjectTypes,
  useCreateHqnhatSubjectType,
  useUpdateHqnhatSubjectType,
  useDeleteHqnhatSubjectType,
} from '@/hooks/useHqnhat';
import type {
  HqnhatSubjectType,
  HqnhatSubjectTypeCreatePayload,
} from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'error' }> = {
  0: { label: 'Ngừng hoạt động', variant: 'error' },
  1: { label: 'Đang hoạt động', variant: 'success' },
};

const emptyForm = (): HqnhatSubjectTypeCreatePayload => ({
  code: '', name: '', description: '', status: 1,
});

export function SubjectTypeSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page, per_page: pageSize,
    code: search || undefined, name: search || undefined,
    status: statusFilter ? Number(statusFilter) as 0 | 1 : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatSubjectTypes(params, { staleTime: 0, gcTime: 5 * 60 * 1000 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatSubjectType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatSubjectType | null>(null);
  const [form, setForm] = useState<HqnhatSubjectTypeCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMut = useCreateHqnhatSubjectType();
  const updateMut = useUpdateHqnhatSubjectType();
  const deleteMut = useDeleteHqnhatSubjectType();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: HqnhatSubjectType) => { setEditing(item); setForm({ code: item.code, name: item.name, description: item.description ?? '', status: item.status as 0 | 1 }); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openDelete = (item: HqnhatSubjectType) => { setDeleting(item); setDeleteOpen(true); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã nhóm không được để trống';
    if (!form.name.trim()) e.name = 'Tên nhóm không được để trống';
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
        <Input placeholder="Tìm theo mã, tên nhóm môn..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
          <option value="">Tất cả trạng thái</option><option value="1">Đang hoạt động</option><option value="0">Ngừng hoạt động</option>
        </select>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm nhóm môn</Button>
      </div>

      <Table>
        <TableHead><TableRow>
          <TableHeadCell>STT</TableHeadCell><TableHeadCell>Mã nhóm</TableHeadCell><TableHeadCell>Tên nhóm môn</TableHeadCell>
          <TableHeadCell>Mô tả</TableHeadCell><TableHeadCell>Trạng thái</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
        </TableRow></TableHead>
        <TableBody>
          {isLoading ? <TableSkeleton colSpan={6} rows={5} /> :
           items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy nhóm môn nào</TableCell></TableRow> :
           items.map((item, i) => {
             const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
             return (
               <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                 <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                 <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                 <TableCell className="font-medium">{item.name}</TableCell>
                 <TableCell className="text-sm text-[rgb(var(--text-muted))] max-w-xs truncate">{item.description || '—'}</TableCell>
                 <TableCell><Badge variant={sc.variant}>{sc.label}</Badge></TableCell>
                 <TableCell className="text-right">
                   <div className="flex items-center justify-end gap-1">
                     <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                   </div>
                 </TableCell>
               </TableRow>
             );
           })}
        </TableBody>
      </Table>
      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa nhóm môn' : 'Thêm nhóm môn'} size="md" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã nhóm" error={errors.code} required><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: CS" /></FormField>
            <FormField label="Trạng thái">
              <select value={form.status} onChange={e => setForm({ ...form, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Đang hoạt động</option><option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
          <FormField label="Tên nhóm môn" error={errors.name} required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Khoa học máy tính" /></FormField>
          <FormField label="Mô tả"><textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa nhóm môn" description={`Bạn có chắc muốn xóa nhóm môn "${deleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />
    </div>
  );
}
