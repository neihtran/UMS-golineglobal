import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
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
  useHqnhatCurriculumSubjects,
  useCreateHqnhatCurriculumSubject,
  useUpdateHqnhatCurriculumSubject,
  useDeleteHqnhatCurriculumSubject,
  useHqnhatCurriculums,
  useHqnhatSubjects,
} from '@/hooks/useHqnhat';
import type {
  HqnhatCurriculumSubject,
  HqnhatCurriculumSubjectCreatePayload,
} from '@/types/hqnhat.types';

const emptyForm = (): HqnhatCurriculumSubjectCreatePayload => ({
  curriculum_id: '', subject_id: '',
  semester: null, year_no: null, display_order: null,
  is_capstone: false, is_internship: false, is_required: true,
  elective_group: null,
});

export function CurriculumSubjectSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [curriculumFilter, setCurriculumFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const params = {
    page, per_page: pageSize,
    curriculum_id: curriculumFilter || undefined,
    subject_id: subjectFilter || undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatCurriculumSubjects(params);
  // Lookup cho select box — fetch all rồi cache 10 phút
  const { data: ctdtData } = useHqnhatCurriculums({ page: 1, per_page: 100 });
  const { data: subjData } = useHqnhatSubjects({ page: 1, per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const ctdts = ctdtData?.data ?? [];
  const subjects = subjData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatCurriculumSubject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatCurriculumSubject | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HqnhatCurriculumSubject | null>(null);
  const [form, setForm] = useState<HqnhatCurriculumSubjectCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMut = useCreateHqnhatCurriculumSubject();
  const updateMut = useUpdateHqnhatCurriculumSubject();
  const deleteMut = useDeleteHqnhatCurriculumSubject();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getCtdtName = (id: number | string) => ctdts.find(c => c.id == id)?.name ?? '—';
  const getSubjName = (id: number | string) => subjects.find(s => s.id == id)?.name ?? '—';
  const getSubjCode = (id: number | string) => subjects.find(s => s.id == id)?.code ?? '';

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: HqnhatCurriculumSubject) => { setEditing(item); setForm({ curriculum_id: item.curriculum_id, subject_id: item.subject_id, semester: item.semester, year_no: item.year_no, display_order: item.display_order, is_capstone: item.is_capstone ?? false, is_internship: item.is_internship ?? false, is_required: item.is_required ?? true, elective_group: item.elective_group }); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openDetail = (item: HqnhatCurriculumSubject) => { setDetailItem(item); setDetailOpen(true); };
  const openDelete = (item: HqnhatCurriculumSubject) => { setDeleting(item); setDeleteOpen(true); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.curriculum_id) e.curriculum_id = 'Chọn CTĐT';
    if (!form.subject_id) e.subject_id = 'Chọn môn học';
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
        <select value={curriculumFilter} onChange={e => { setCurriculumFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
          <option value="">Tất cả CTĐT</option>
          {ctdts.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </select>
        <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
          <option value="">Tất cả môn học</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
        </select>
        {(curriculumFilter || subjectFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setCurriculumFilter(''); setSubjectFilter(''); setPage(1); }}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm môn vào CTĐT</Button>
      </div>

      <Table>
        <TableHead><TableRow>
          <TableHeadCell>STT</TableHeadCell><TableHeadCell>CTĐT</TableHeadCell><TableHeadCell>Mã MH</TableHeadCell><TableHeadCell>Tên môn</TableHeadCell>
          <TableHeadCell>Năm</TableHeadCell><TableHeadCell>Học kỳ</TableHeadCell><TableHeadCell>Tín chỉ</TableHeadCell><TableHeadCell>Loại</TableHeadCell><TableHeadCell className="text-right">Thao tác</TableHeadCell>
        </TableRow></TableHead>
        <TableBody>
          {isLoading ? <TableSkeleton colSpan={9} rows={5} /> :
           items.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có môn nào trong CTĐT</TableCell></TableRow> :
           items.map((item, i) => {
             const subj = subjects.find(s => s.id == item.subject_id);
             return (
               <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                 <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                 <TableCell className="font-medium">{getCtdtName(item.curriculum_id)}</TableCell>
                 <TableCell><span className="font-mono text-sm">{getSubjCode(item.subject_id)}</span></TableCell>
                 <TableCell>{getSubjName(item.subject_id)}</TableCell>
                 <TableCell>{item.year_no ? `Năm ${item.year_no}` : '—'}</TableCell>
                 <TableCell>{item.semester ? `HK${item.semester}` : '—'}</TableCell>
                 <TableCell>{subj?.credit ?? '—'}</TableCell>
                 <TableCell>
                   {item.is_capstone ? <Badge variant="warning">Đồ án</Badge> :
                    item.is_internship ? <Badge variant="info">Thực tập</Badge> :
                    item.is_required === false ? <Badge variant="neutral">Tự chọn</Badge> :
                    <Badge variant="success">Bắt buộc</Badge>}
                 </TableCell>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa môn trong CTĐT' : 'Thêm môn vào CTĐT'} size="md" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <FormField label="CTĐT" error={errors.curriculum_id} required>
            <select value={form.curriculum_id} onChange={e => setForm({ ...form, curriculum_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">-- Chọn CTĐT --</option>
              {ctdts.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Môn học" error={errors.subject_id} required>
            <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="">-- Chọn môn --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Học kỳ"><Input type="number" value={form.semester ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, semester: e.target.value ? Number(e.target.value) : null })} placeholder="VD: 1" /></FormField>
            <FormField label="Năm học"><Input type="number" value={form.year_no ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, year_no: e.target.value ? Number(e.target.value) : null })} placeholder="VD: 1" /></FormField>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa môn khỏi CTĐT" description="Bạn có chắc muốn xóa môn này khỏi chương trình đào tạo?" confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết" size="md">
        {detailItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">CTĐT</p><p className="font-medium">{getCtdtName(detailItem.curriculum_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Môn học</p><p className="font-medium">{getSubjName(detailItem.subject_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học kỳ</p><p className="font-medium">{detailItem.semester ?? '—'}</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}
