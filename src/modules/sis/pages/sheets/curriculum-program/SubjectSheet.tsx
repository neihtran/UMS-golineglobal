import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
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
  useHqnhatSubjects,
  useHqnhatSubject,
  useHqnhatSubjectTypes,
  useCreateHqnhatSubject,
  useUpdateHqnhatSubject,
  useDeleteHqnhatSubject,
} from '@/hooks/useHqnhat';
import type {
  HqnhatSubject,
  HqnhatSubjectCreatePayload,
} from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'error' }> = {
  0: { label: 'Ngừng hoạt động', variant: 'error' },
  1: { label: 'Đang hoạt động', variant: 'success' },
};

const emptyForm = (): HqnhatSubjectCreatePayload => ({
  code: '', name: '', subject_type_id: 0, credit: 3,
  theory_hours: 30, practice_hours: 15, lab_hours: 0,
  description: '', status: 1,
});

export function SubjectSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page, per_page: pageSize,
    code: search || undefined, name: search || undefined,
    status: statusFilter ? Number(statusFilter) as 0 | 1 : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatSubjects(params, { staleTime: 0, gcTime: 5 * 60 * 1000 });
  const { data: stData } = useHqnhatSubjectTypes({ page: 1, per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const stItems = stData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatSubject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatSubject | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatSubjectCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatSubject(detailId ?? undefined);
  const createMut = useCreateHqnhatSubject();
  const updateMut = useUpdateHqnhatSubject();
  const deleteMut = useDeleteHqnhatSubject();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getStName = (id: number) => stItems.find(t => t.id === id)?.name ?? '—';

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: HqnhatSubject) => { setEditing(item); setForm({ code: item.code, name: item.name, subject_type_id: item.subject_type_id, credit: item.credit, theory_hours: item.theory_hours, practice_hours: item.practice_hours, lab_hours: item.lab_hours ?? 0, description: item.description ?? '', status: item.status as 0 | 1 }); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openDetail = (item: HqnhatSubject) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: HqnhatSubject) => { setDeleting(item); setDeleteOpen(true); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã môn không được để trống';
    if (!form.name.trim()) e.name = 'Tên môn không được để trống';
    if (!form.subject_type_id || form.subject_type_id === 0) e.subject_type_id = 'Chọn nhóm môn';
    if (!form.credit || form.credit <= 0) e.credit = 'Tín chỉ phải > 0';
    if (form.theory_hours == null || form.theory_hours < 0) e.theory_hours = 'Nhập số giờ lý thuyết';
    if (form.practice_hours == null || form.practice_hours < 0) e.practice_hours = 'Nhập số giờ thực hành';
    if (form.lab_hours == null || form.lab_hours < 0) e.lab_hours = 'Nhập số giờ thí nghiệm';
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
        <Input placeholder="Tìm theo mã, tên môn..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
          <option value="">Tất cả trạng thái</option><option value="1">Đang hoạt động</option><option value="0">Ngừng hoạt động</option>
        </select>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm môn học</Button>
      </div>

      <Table>
        <TableHead><TableRow>
          <TableHeadCell>STT</TableHeadCell><TableHeadCell>Mã môn</TableHeadCell><TableHeadCell>Tên môn</TableHeadCell>
          <TableHeadCell>Nhóm môn</TableHeadCell><TableHeadCell>Tín chỉ</TableHeadCell><TableHeadCell>TT</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
        </TableRow></TableHead>
        <TableBody>
          {isLoading ? <TableSkeleton colSpan={7} rows={5} /> :
           items.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy môn học nào</TableCell></TableRow> :
           items.map((item, i) => {
             const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
             return (
               <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                 <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                 <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                 <TableCell className="font-medium">{item.name}</TableCell>
                 <TableCell className="text-sm">{getStName(item.subject_type_id)}</TableCell>
                 <TableCell>{item.credit}</TableCell>
                 <TableCell><Badge variant={sc.variant}>{sc.label}</Badge></TableCell>
                 <TableCell className="text-right">
                   <div className="flex items-center justify-end gap-1">
                     <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa môn học' : 'Thêm môn học'} size="lg" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã môn" error={errors.code} required><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: CS101" /></FormField>
            <FormField label="Nhóm môn" error={errors.subject_type_id} required>
              <select value={form.subject_type_id} onChange={e => setForm({ ...form, subject_type_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn nhóm môn --</option>
                {stItems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Tên môn" error={errors.name} required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Nhập môn công nghệ phần mềm" /></FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Số tín chỉ" error={errors.credit} required><Input type="number" value={form.credit} onChange={e => setForm({ ...form, credit: Number(e.target.value) })} /></FormField>
            <FormField label="Giờ lý thuyết" error={errors.theory_hours}><Input type="number" value={form.theory_hours} onChange={e => setForm({ ...form, theory_hours: Number(e.target.value) })} /></FormField>
            <FormField label="Giờ thực hành" error={errors.practice_hours}><Input type="number" value={form.practice_hours} onChange={e => setForm({ ...form, practice_hours: Number(e.target.value) })} /></FormField>
            <FormField label="Giờ thí nghiệm" error={errors.lab_hours}><Input type="number" value={form.lab_hours} onChange={e => setForm({ ...form, lab_hours: Number(e.target.value) })} /></FormField>
          </div>
          <FormField label="Trạng thái">
            <select value={form.status} onChange={e => setForm({ ...form, status: Number(e.target.value) as 0 | 1 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={1}>Đang hoạt động</option><option value={0}>Ngừng hoạt động</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa môn học" description={`Bạn có chắc muốn xóa môn "${deleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết môn học" size="md">
        {detailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         detailData?.data ? (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{detailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {detailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant}>{STATUS_CONFIG[detailData.data.status]?.label}</Badge>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhóm môn</p><p className="font-medium">{getStName(detailData.data.subject_type_id)}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tín chỉ</p><p className="font-medium">{detailData.data.credit}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ LT</p><p className="font-medium">{detailData.data.theory_hours}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ TH</p><p className="font-medium">{detailData.data.practice_hours}</p></div>
             </div>
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}
