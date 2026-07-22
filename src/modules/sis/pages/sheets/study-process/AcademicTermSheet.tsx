import { useState, useEffect } from 'react';
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
  useHqnhatAcademicTerms,
  useHqnhatAcademicTerm,
  useCreateHqnhatAcademicTerm,
  useUpdateHqnhatAcademicTerm,
  useDeleteHqnhatAcademicTerm,
} from '@/hooks/useHqnhat';
import type {
  HqnhatAcademicTerm,
  HqnhatAcademicTermCreatePayload,
} from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  0: { label: 'Lập kế hoạch', variant: 'neutral' },
  1: { label: 'Mở đăng ký', variant: 'info' },
  2: { label: 'Đang học', variant: 'success' },
  3: { label: 'Đã kết thúc', variant: 'warning' },
};

const SEMESTER_LABELS: Record<number, string> = { 1: 'HK1', 2: 'HK2', 3: 'HK Hè' };

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
};

const toDateInput = (v: string | null | undefined): string => {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) {
    const parts = v.split(/[\sT]/);
    return parts[0] ?? '';
  }
  return d.toISOString().split('T')[0];
};

const emptyForm = (): HqnhatAcademicTermCreatePayload => ({
  code: '', academic_year: '', semester: 1, start_date: '', end_date: '',
  registration_start: '', registration_end: '', status: 0,
});

export function AcademicTermSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    status: statusFilter ? Number(statusFilter) as 0 | 1 | 2 | 3 : undefined,
    semester: semesterFilter ? Number(semesterFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatAcademicTerms(params);
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatAcademicTerm | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatAcademicTerm | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatAcademicTermCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Detail query
  const { data: detailData, isLoading: detailLoading } = useHqnhatAcademicTerm(detailId ?? undefined);
  const createMut = useCreateHqnhatAcademicTerm();
  const updateMut = useUpdateHqnhatAcademicTerm();
  const deleteMut = useDeleteHqnhatAcademicTerm();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  // Populate form from detail when editing
  useEffect(() => {
    if (editing && detailData?.data) {
      setForm({
        code: detailData.data.code,
        academic_year: detailData.data.academic_year,
        semester: detailData.data.semester,
        start_date: toDateInput(detailData.data.start_date),
        end_date: toDateInput(detailData.data.end_date),
        registration_start: toDateInput(detailData.data.registration_start),
        registration_end: toDateInput(detailData.data.registration_end),
        status: detailData.data.status as 0 | 1 | 2 | 3,
      });
    }
  }, [editing, detailData]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: HqnhatAcademicTerm) => { setEditing(item); setDetailId(item.id); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openDetail = (item: HqnhatAcademicTerm) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: HqnhatAcademicTerm) => { setDeleting(item); setDeleteOpen(true); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã học kỳ không được để trống';
    if (!form.academic_year.trim()) e.academic_year = 'Năm học không được để trống';
    if (!form.start_date) e.start_date = 'Chọn ngày bắt đầu';
    if (!form.end_date) e.end_date = 'Chọn ngày kết thúc';
    if (!form.registration_start) e.registration_start = 'Chọn ngày bắt đầu đăng ký';
    if (!form.registration_end) e.registration_end = 'Chọn ngày kết thúc đăng ký';
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
    } catch (err: any) {
      setSubmitError(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await deleteMut.mutateAsync(deleting.id); setDeleteOpen(false); setDeleting(null); } catch (_) {}
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã học kỳ..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={semesterFilter}
          onChange={e => { setSemesterFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả học kỳ</option>
          <option value="1">Học kỳ 1</option><option value="2">Học kỳ 2</option><option value="3">Học kỳ hè</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="0">Lập kế hoạch</option><option value="1">Mở đăng ký</option>
          <option value="2">Đang học</option><option value="3">Đã kết thúc</option>
        </select>
        {(search || statusFilter || semesterFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setSemesterFilter(''); setPage(1); }}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm học kỳ</Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã HK</TableHeadCell>
            <TableHeadCell>Năm học</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
            <TableHeadCell>Ngày bắt đầu</TableHeadCell>
            <TableHeadCell>Ngày kết thúc</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? <TableSkeleton colSpan={8} rows={5} /> :
           items.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy học kỳ nào</TableCell></TableRow> :
           items.map((item, i) => {
             const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
             return (
               <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                 <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">{(page - 1) * pageSize + i + 1}</TableCell>
                 <TableCell><span className="font-mono font-medium">{item.code}</span></TableCell>
                 <TableCell>{item.academic_year}</TableCell>
                 <TableCell><Badge variant="neutral">{SEMESTER_LABELS[item.semester] || `HK${item.semester}`}</Badge></TableCell>
                 <TableCell className="text-sm text-[rgb(var(--text-muted))]">{formatDate(item.start_date)}</TableCell>
                 <TableCell className="text-sm text-[rgb(var(--text-muted))]">{formatDate(item.end_date)}</TableCell>
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
      <TablePagination
        page={page} pageSize={pageSize} total={total}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa học kỳ' : 'Thêm học kỳ'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã học kỳ" error={errors.code} required>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: HK1_2024_2025" />
            </FormField>
            <FormField label="Năm học" error={errors.academic_year} required>
              <Input value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} placeholder="VD: 2024-2025" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Học kỳ" required>
              <select
                value={form.semester}
                onChange={e => setForm({ ...form, semester: Number(e.target.value) as 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Học kỳ 1</option><option value={2}>Học kỳ 2</option><option value={3}>Học kỳ hè</option>
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: Number(e.target.value) as 0 | 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>Lập kế hoạch</option><option value={1}>Mở đăng ký</option>
                <option value={2}>Đang học</option><option value={3}>Đã kết thúc</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngày bắt đầu HK" error={errors.start_date} required>
              <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </FormField>
            <FormField label="Ngày kết thúc HK" error={errors.end_date} required>
              <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </FormField>
            <FormField label="Ngày bắt đầu đăng ký" error={errors.registration_start} required>
              <Input type="date" value={form.registration_start} onChange={e => setForm({ ...form, registration_start: e.target.value })} />
            </FormField>
            <FormField label="Ngày kết thúc đăng ký" error={errors.registration_end} required>
              <Input type="date" value={form.registration_end} onChange={e => setForm({ ...form, registration_end: e.target.value })} />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa học kỳ"
        description={`Bạn có chắc muốn xóa học kỳ "${deleting?.code}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết học kỳ" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h3 className="text-lg font-bold">{detailData.data.code}</h3><p className="text-sm text-[rgb(var(--text-muted))]">{detailData.data.academic_year}</p></div>
              <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant}>{STATUS_CONFIG[detailData.data.status]?.label}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Mã học kỳ', value: detailData.data.code },
                { label: 'Năm học', value: detailData.data.academic_year },
                { label: 'Học kỳ', value: SEMESTER_LABELS[detailData.data.semester] || `HK${detailData.data.semester}` },
                { label: 'Ngày bắt đầu', value: formatDate(detailData.data.start_date) },
                { label: 'Ngày kết thúc', value: formatDate(detailData.data.end_date) },
                { label: 'Bắt đầu đăng ký', value: formatDate(detailData.data.registration_start) },
                { label: 'Kết thúc đăng ký', value: formatDate(detailData.data.registration_end) },
              ].map(r => (
                <div key={r.label} className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{r.label}</p>
                  <p className="font-medium">{r.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>
    </div>
  );
}
