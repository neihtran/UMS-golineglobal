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
  useHqnhatCurriculums,
  useHqnhatCurriculum,
  useHqnhatMajors,
  useHqnhatTrainingSystems,
  useHqnhatCourses,
  useCreateHqnhatCurriculum,
  useUpdateHqnhatCurriculum,
  useDeleteHqnhatCurriculum,
} from '@/hooks/useHqnhat';
import type {
  HqnhatCurriculum,
  HqnhatCurriculumCreatePayload,
} from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'error' }> = {
  0: { label: 'Ngừng hoạt động', variant: 'error' },
  1: { label: 'Đang hoạt động', variant: 'success' },
};

const emptyForm = (): HqnhatCurriculumCreatePayload => ({
  code: '', name: '', major_id: '', training_system_id: '', course_id: '',
  total_credit: 0, elective_credit: 0, description: '', status: 1,
});

export function CurriculumSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page, per_page: pageSize,
    code: search || undefined, name: search || undefined,
    status: statusFilter ? Number(statusFilter) as 0 | 1 : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatCurriculums(params);
  const { data: majorsData } = useHqnhatMajors({ page: 1, per_page: 100 });
  const { data: tsData } = useHqnhatTrainingSystems({ page: 1, per_page: 100 });
  const { data: coursesData } = useHqnhatCourses({ page: 1, per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const majors = majorsData?.data ?? [];
  const trainingSystems = tsData?.data ?? [];
  const courses = coursesData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatCurriculum | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatCurriculum | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatCurriculumCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatCurriculum(detailId ?? undefined);
  const createMut = useCreateHqnhatCurriculum();
  const updateMut = useUpdateHqnhatCurriculum();
  const deleteMut = useDeleteHqnhatCurriculum();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getMajorName = (id: number | string) => majors.find(m => m.id == id)?.name ?? '—';
  const getTsName = (id: number | string) => trainingSystems.find(t => t.id == id)?.name ?? '—';
  const getCourseName = (id: number | string) => courses.find(c => c.id == id)?.name ?? '—';

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: HqnhatCurriculum) => { setEditing(item); setForm({ code: item.code, name: item.name, major_id: item.major_id, specialization_id: item.specialization_id, training_system_id: item.training_system_id, course_id: item.course_id, total_credit: item.total_credit, elective_credit: item.elective_credit, description: item.description ?? '', status: item.status as 0 | 1 }); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openDetail = (item: HqnhatCurriculum) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: HqnhatCurriculum) => { setDeleting(item); setDeleteOpen(true); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã CTĐT không được để trống';
    if (!form.name.trim()) e.name = 'Tên không được để trống';
    if (!form.major_id) e.major_id = 'Chọn ngành';
    if (!form.training_system_id) e.training_system_id = 'Chọn hệ đào tạo';
    if (!form.course_id) e.course_id = 'Chọn khóa sinh viên';
    if (!form.total_credit || Number(form.total_credit) <= 0) e.total_credit = 'Tổng tín chỉ phải > 0';
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
        <Input placeholder="Tìm theo mã, tên CTĐT..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
          <option value="">Tất cả trạng thái</option><option value="1">Đang hoạt động</option><option value="0">Ngừng hoạt động</option>
        </select>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm CTĐT</Button>
      </div>

      <Table>
        <TableHead><TableRow>
          <TableHeadCell>STT</TableHeadCell><TableHeadCell>Mã CTĐT</TableHeadCell><TableHeadCell>Tên chương trình</TableHeadCell>
          <TableHeadCell>Ngành</TableHeadCell><TableHeadCell>Hệ</TableHeadCell><TableHeadCell>Khóa</TableHeadCell>
          <TableHeadCell>TC</TableHeadCell><TableHeadCell>TT</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
        </TableRow></TableHead>
        <TableBody>
          {isLoading ? <TableSkeleton colSpan={9} rows={5} /> :
           items.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy CTĐT nào</TableCell></TableRow> :
           items.map((item, i) => {
             const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
             return (
               <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                 <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                 <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                 <TableCell className="font-medium">{item.name}</TableCell>
                 <TableCell className="text-sm">{getMajorName(item.major_id)}</TableCell>
                 <TableCell className="text-sm">{getTsName(item.training_system_id)}</TableCell>
                 <TableCell className="text-sm">{getCourseName(item.course_id)}</TableCell>
                 <TableCell>{item.total_credit}</TableCell>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa CTĐT' : 'Thêm CTĐT'} size="lg" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã CTĐT" error={errors.code} required><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: SE2026" /></FormField>
            <FormField label="Tổng tín chỉ" error={errors.total_credit} required><Input type="number" value={form.total_credit} onChange={e => setForm({ ...form, total_credit: Number(e.target.value) })} /></FormField>
          </div>
          <FormField label="Tên chương trình" error={errors.name} required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Chương trình đào tạo Kỹ thuật phần mềm 2026" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngành" error={errors.major_id} required>
              <select value={form.major_id} onChange={e => setForm({ ...form, major_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="">-- Chọn ngành --</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
              </select>
            </FormField>
            <FormField label="Hệ đào tạo" error={errors.training_system_id} required>
              <select value={form.training_system_id} onChange={e => setForm({ ...form, training_system_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="">-- Chọn hệ --</option>
                {trainingSystems.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
            <FormField label="Khóa sinh viên" error={errors.course_id} required>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="">-- Chọn khóa --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Tín chỉ tự chọn"><Input type="number" value={form.elective_credit} onChange={e => setForm({ ...form, elective_credit: Number(e.target.value) })} /></FormField>
          </div>
          <FormField label="Mô tả"><textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm" /></FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa CTĐT" description={`Bạn có chắc muốn xóa CTĐT "${deleting?.name}" không?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết CTĐT" size="lg">
        {detailLoading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div> :
         detailData?.data ? (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div><h3 className="text-lg font-bold">{detailData.data.name}</h3><p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {detailData.data.code}</p></div>
               <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant}>{STATUS_CONFIG[detailData.data.status]?.label}</Badge>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngành</p><p className="font-medium">{getMajorName(detailData.data.major_id)}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Hệ đào tạo</p><p className="font-medium">{getTsName(detailData.data.training_system_id)}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Khóa</p><p className="font-medium">{getCourseName(detailData.data.course_id)}</p></div>
               <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tổng tín chỉ</p><p className="font-medium">{detailData.data.total_credit}</p></div>
             </div>
             {detailData.data.description && <div><p className="text-sm font-medium mb-2">Mô tả</p><p className="text-sm text-[rgb(var(--text-secondary))]">{detailData.data.description}</p></div>}
             <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
           </div>
         ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}
