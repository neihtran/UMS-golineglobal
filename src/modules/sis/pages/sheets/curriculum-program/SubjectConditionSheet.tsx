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
  useHqnhatSubjectConditions,
  useCreateHqnhatSubjectCondition,
  useUpdateHqnhatSubjectCondition,
  useDeleteHqnhatSubjectCondition,
  useHqnhatSubjects,
} from '@/hooks/useHqnhat';
import type {
  HqnhatSubjectCondition,
  HqnhatSubjectConditionCreatePayload,
} from '@/types/hqnhat.types';

const emptyForm = (): HqnhatSubjectConditionCreatePayload => ({
  subject_id: 0, min_gpa: null, min_completed_credit: null, max_failed_subject: null, note: '',
});

const formatGPA = (v: number | string | null | undefined) =>
  v === null || v === undefined || v === '' ? '—' : Number(v).toFixed(2);
const formatNum = (v: number | string | null | undefined) =>
  v === null || v === undefined || v === '' ? '—' : String(v);

export function SubjectConditionSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [subjectFilter, setSubjectFilter] = useState('');

  const params = {
    page, per_page: pageSize,
    subject_id: subjectFilter ? Number(subjectFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatSubjectConditions(params);
  const { data: subjData } = useHqnhatSubjects({ page: 1, per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const subjects = subjData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatSubjectCondition | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatSubjectCondition | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HqnhatSubjectCondition | null>(null);
  const [form, setForm] = useState<HqnhatSubjectConditionCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMut = useCreateHqnhatSubjectCondition();
  const updateMut = useUpdateHqnhatSubjectCondition();
  const deleteMut = useDeleteHqnhatSubjectCondition();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getSubjName = (id: number) => subjects.find(s => s.id === id)?.name ?? '—';
  const getSubjCode = (id: number) => subjects.find(s => s.id === id)?.code ?? '';

  const openCreate = () => {
    setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true);
  };
  const openEdit = (item: HqnhatSubjectCondition) => {
    setEditing(item);
    setForm({
      subject_id: item.subject_id,
      min_gpa: item.min_gpa === null || item.min_gpa === undefined ? null : Number(item.min_gpa),
      min_completed_credit: item.min_completed_credit === null || item.min_completed_credit === undefined ? null : Number(item.min_completed_credit),
      max_failed_subject: item.max_failed_subject === null || item.max_failed_subject === undefined ? null : Number(item.max_failed_subject),
      note: item.note ?? '',
    });
    setErrors({}); setSubmitError(null); setModalOpen(true);
  };
  const openDetail = (item: HqnhatSubjectCondition) => { setDetailItem(item); setDetailOpen(true); };
  const openDelete = (item: HqnhatSubjectCondition) => { setDeleting(item); setDeleteOpen(true); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.subject_id || form.subject_id === 0) e.subject_id = 'Chọn môn học';
    if (form.min_gpa !== null && form.min_gpa !== undefined && form.min_gpa !== ('' as any)) {
      const g = Number(form.min_gpa);
      if (Number.isNaN(g) || g < 0 || g > 4) e.min_gpa = 'GPA tối thiểu 0–4';
    }
    if (form.min_completed_credit !== null && form.min_completed_credit !== undefined && Number(form.min_completed_credit) < 0) e.min_completed_credit = 'Tín chỉ tích lũy không âm';
    if (form.max_failed_subject !== null && form.max_failed_subject !== undefined && Number(form.max_failed_subject) < 0) e.max_failed_subject = 'Số môn trượt không âm';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: HqnhatSubjectConditionCreatePayload = {
        subject_id: Number(form.subject_id),
        min_gpa: form.min_gpa === ('' as any) || form.min_gpa === undefined ? null : Number(form.min_gpa),
        min_completed_credit: form.min_completed_credit === ('' as any) || form.min_completed_credit === undefined ? null : Number(form.min_completed_credit),
        max_failed_subject: form.max_failed_subject === ('' as any) || form.max_failed_subject === undefined ? null : Number(form.max_failed_subject),
        note: form.note?.trim() ? form.note.trim() : null,
      };
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload })
        : await createMut.mutateAsync(payload);
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
        {subjectFilter && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSubjectFilter(''); setPage(1); }}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm điều kiện đăng ký</Button>
      </div>

      <Table>
        <TableHead><TableRow>
          <TableHeadCell>STT</TableHeadCell>
          <TableHeadCell>Môn học</TableHeadCell>
          <TableHeadCell>GPA tối thiểu</TableHeadCell>
          <TableHeadCell>Tín chỉ tích lũy</TableHeadCell>
          <TableHeadCell>Số môn trượt tối đa</TableHeadCell>
          <TableHeadCell>Ghi chú</TableHeadCell>
          <TableHeadCell className="text-right">Thao tác</TableHeadCell>
        </TableRow></TableHead>
        <TableBody>
          {isLoading ? <TableSkeleton colSpan={7} rows={5} /> :
           items.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có điều kiện nào</TableCell></TableRow> :
           items.map((item, i) => (
             <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
               <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
               <TableCell className="font-medium">
                 <span className="font-mono text-sm">{getSubjCode(item.subject_id)}</span> {getSubjName(item.subject_id)}
               </TableCell>
               <TableCell>
                 {item.min_gpa !== null && item.min_gpa !== undefined
                   ? <Badge variant="info">{formatGPA(item.min_gpa)}</Badge>
                   : <span className="text-[rgb(var(--text-muted))]">—</span>}
               </TableCell>
               <TableCell className="tabular-nums">{formatNum(item.min_completed_credit)}</TableCell>
               <TableCell className="tabular-nums">{formatNum(item.max_failed_subject)}</TableCell>
               <TableCell className="text-sm text-[rgb(var(--text-muted))] max-w-xs truncate" title={item.note ?? ''}>{item.note ?? '—'}</TableCell>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa điều kiện đăng ký' : 'Thêm điều kiện đăng ký'} size="md" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <FormField label="Môn học" error={errors.subject_id} required>
            <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn môn --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="GPA tối thiểu" error={errors.min_gpa} hint="Thang 0–4 (để trống nếu không yêu cầu)">
              <InputNumber value={form.min_gpa} onChange={v => setForm({ ...form, min_gpa: v })} step={0.1} min={0} max={4} />
            </FormField>
            <FormField label="Tín chỉ tích lũy" error={errors.min_completed_credit} hint="Số TC hoàn thành tối thiểu">
              <InputNumber value={form.min_completed_credit} onChange={v => setForm({ ...form, min_completed_credit: v })} step={1} min={0} />
            </FormField>
            <FormField label="Môn trượt tối đa" error={errors.max_failed_subject} hint="Để trống = không giới hạn">
              <InputNumber value={form.max_failed_subject} onChange={v => setForm({ ...form, max_failed_subject: v })} step={1} min={0} />
            </FormField>
          </div>
          <FormField label="Ghi chú" hint="Mô tả thêm về điều kiện đăng ký">
            <textarea
              value={form.note ?? ''}
              onChange={e => setForm({ ...form, note: e.target.value })}
              rows={3}
              placeholder="VD: Yêu cầu sinh viên đã hoàn thành 60 tín chỉ và đạt GPA tối thiểu 2.5"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa điều kiện" description="Bạn có chắc muốn xóa điều kiện đăng ký này?" confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết điều kiện đăng ký" size="md">
        {detailItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 col-span-2">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Môn học</p>
                <p className="font-medium"><span className="font-mono">{getSubjCode(detailItem.subject_id)}</span> {getSubjName(detailItem.subject_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">GPA tối thiểu</p>
                <p className="font-medium">{formatGPA(detailItem.min_gpa)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tín chỉ tích lũy tối thiểu</p>
                <p className="font-medium">{formatNum(detailItem.min_completed_credit)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số môn trượt tối đa</p>
                <p className="font-medium">{formatNum(detailItem.max_failed_subject)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">ID</p>
                <p className="font-medium">#{detailItem.id}</p>
              </div>
              {detailItem.note && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 col-span-2">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p>
                  <p className="text-sm whitespace-pre-wrap">{detailItem.note}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button>
            </div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}

function InputNumber({
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const display = value === null || value === undefined || value === ('' as any) ? '' : String(value);
  return (
    <input
      type="number"
      value={display}
      step={step}
      min={min}
      max={max}
      onChange={e => {
        const raw = e.target.value;
        if (raw === '') onChange(null);
        else onChange(Number(raw));
      }}
      placeholder="—"
      className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm tabular-nums"
    />
  );
}
