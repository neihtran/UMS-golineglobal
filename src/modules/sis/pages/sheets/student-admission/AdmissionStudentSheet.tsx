import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RotateCcw, Search } from 'lucide-react';
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
import { formatDate } from '@/utils/formatters';
import {
  useHqnhatAdmissionStudents,
  useCreateHqnhatAdmissionStudent,
  useUpdateHqnhatAdmissionStudent,
  useDeleteHqnhatAdmissionStudent,
  useHqnhatAdmissionBatches,
  useHqnhatTrainingSystems,
  useHqnhatCourses,
  useHqnhatMajors,
} from '@/hooks/useHqnhat';
import type {
  HqnhatAdmissionStudent,
  HqnhatAdmissionStudentCreatePayload,
} from '@/types/hqnhat.types';

const GENDER_CONFIG: Record<number, { label: string; variant: 'info' | 'warning' | 'neutral' }> = {
  1: { label: 'Nam', variant: 'info' },
  2: { label: 'Nữ', variant: 'warning' },
  3: { label: 'Khác', variant: 'neutral' },
};

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  0: { label: 'Chờ xử lý', variant: 'warning' },
  1: { label: 'Đã trúng tuyển', variant: 'success' },
  2: { label: 'Đã nhập học', variant: 'info' },
  3: { label: 'Đã hủy', variant: 'neutral' },
};

const emptyForm = (): HqnhatAdmissionStudentCreatePayload => ({
  batch_id: 0,
  training_system_id: 0,
  course_id: 0,
  candidate_code: '',
  full_name: '',
  gender: 1,
  date_of_birth: '',
  citizen_id: '',
  phone: '',
  email: '',
  major_id: undefined,
  admission_score: undefined,
  status: 0,
});

export function AdmissionStudentSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    candidate_code: search || undefined,
    full_name: search || undefined,
    batch_id: batchFilter ? Number(batchFilter) : undefined,
    status: statusFilter ? Number(statusFilter) as 0 | 1 | 2 | 3 : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useHqnhatAdmissionStudents(params);
  const { data: batchData } = useHqnhatAdmissionBatches({ per_page: 100, status: 1 });
  const { data: tsData } = useHqnhatTrainingSystems({ per_page: 100, status: 1 });
  const { data: courseData } = useHqnhatCourses({ per_page: 100, status: 1 });
  const { data: majorData } = useHqnhatMajors({ per_page: 100, status: 1 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const batches = Array.isArray(batchData?.data) ? batchData.data : [];
  const trainingSystems = Array.isArray(tsData?.data) ? tsData.data : [];
  const courses = Array.isArray(courseData?.data) ? courseData.data : [];
  const majors = Array.isArray(majorData?.data) ? majorData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatAdmissionStudent | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatAdmissionStudent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HqnhatAdmissionStudent | null>(null);
  const [form, setForm] = useState<HqnhatAdmissionStudentCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMut = useCreateHqnhatAdmissionStudent();
  const updateMut = useUpdateHqnhatAdmissionStudent();
  const deleteMut = useDeleteHqnhatAdmissionStudent();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getBatchName = (id: number) => batches.find(b => b.id === id)?.name ?? `Đợt #${id}`;
  const getTSName = (id: number) => trainingSystems.find(t => t.id === id)?.name ?? `Hệ #${id}`;
  const getCourseName = (id: number) => courses.find(c => c.id === id)?.name ?? `Khóa #${id}`;
  const getMajorName = (id: number | null | undefined) => {
    if (!id) return '—';
    return majors.find(m => m.id === id)?.name ?? `Ngành #${id}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatAdmissionStudent) => {
    setEditing(item);
    // Convert date for input[type=date] which expects YYYY-MM-DD
    const formatDateForInput = (dateStr: string | null | undefined) => {
      if (!dateStr) return '';
      // API returns DD/MM/YYYY or YYYY-MM-DD, normalize to YYYY-MM-DD
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateStr.slice(0, 10);
    };
    setForm({
      batch_id: item.batch_id,
      training_system_id: item.training_system_id,
      course_id: item.course_id,
      candidate_code: item.candidate_code,
      full_name: item.full_name,
      gender: item.gender as 1 | 2 | 3,
      date_of_birth: formatDateForInput(item.date_of_birth),
      citizen_id: item.citizen_id ?? '',
      phone: item.phone ?? '',
      email: item.email ?? '',
      major_id: item.major_id ?? undefined,
      admission_score: item.admission_score ?? undefined,
      status: item.status as 0 | 1 | 2 | 3,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: HqnhatAdmissionStudent) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const openDelete = (item: HqnhatAdmissionStudent) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setBatchFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.batch_id || form.batch_id === 0) e.batch_id = 'Chọn đợt tuyển sinh';
    if (!form.training_system_id || form.training_system_id === 0) e.training_system_id = 'Chọn hệ đào tạo';
    if (!form.course_id || form.course_id === 0) e.course_id = 'Chọn khóa học';
    if (!form.candidate_code?.trim()) e.candidate_code = 'Mã thí sinh không được để trống';
    if (!form.full_name?.trim()) e.full_name = 'Họ tên không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: HqnhatAdmissionStudentCreatePayload = {
        ...form,
        batch_id: Number(form.batch_id),
        training_system_id: Number(form.training_system_id),
        course_id: Number(form.course_id),
        major_id: form.major_id ? Number(form.major_id) : undefined,
        admission_score: form.admission_score ?? undefined,
      };
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload })
        : await createMut.mutateAsync(payload);
      setModalOpen(false);
    } catch (err: any) {
      let message = 'Có lỗi xảy ra';
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }
      setSubmitError(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting.id);
      setDeleteOpen(false);
      setDeleting(null);
    } catch (_) {}
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-72">
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Mã TS, họ tên..."
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-10 pr-3 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Đợt tuyển sinh</label>
          <select
            value={batchFilter}
            onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả đợt</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="0">Chờ xử lý</option>
            <option value="1">Đã trúng tuyển</option>
            <option value="2">Đã nhập học</option>
            <option value="3">Đã hủy</option>
          </select>
        </div>
        {(search || batchFilter || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm thí sinh
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã TS</TableHeadCell>
            <TableHeadCell>Họ tên</TableHeadCell>
            <TableHeadCell>Giới tính</TableHeadCell>
            <TableHeadCell>Ngày sinh</TableHeadCell>
            <TableHeadCell>Đợt tuyển sinh</TableHeadCell>
            <TableHeadCell>Ngành</TableHeadCell>
            <TableHeadCell>Điểm</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={10} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-10 text-[rgb(var(--text-muted))]">
                Chưa có thí sinh nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="font-mono text-sm">{item.candidate_code}</TableCell>
                <TableCell className="font-medium">{item.full_name}</TableCell>
                <TableCell>
                  <Badge variant={GENDER_CONFIG[item.gender]?.variant ?? 'neutral'} size="sm">
                    {GENDER_CONFIG[item.gender]?.label ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{item.date_of_birth ? formatDate(item.date_of_birth) : '—'}</TableCell>
                <TableCell className="text-sm">{getBatchName(item.batch_id)}</TableCell>
                <TableCell className="text-sm">{getMajorName(item.major_id)}</TableCell>
                <TableCell className="tabular-nums font-mono">
                  {item.admission_score != null ? Number(item.admission_score).toFixed(2) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_CONFIG[item.status]?.variant ?? 'neutral'} dot size="sm">
                    {STATUS_CONFIG[item.status]?.label ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa thí sinh' : 'Thêm thí sinh'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              {editing ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã thí sinh" error={errors.candidate_code} required>
              <input
                type="text"
                value={form.candidate_code}
                onChange={(e) => setForm({ ...form, candidate_code: e.target.value.toUpperCase() })}
                placeholder="VD: SV2024001"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Họ tên" error={errors.full_name} required>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Giới tính" error={errors.gender} required>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: Number(e.target.value) as 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Nam</option>
                <option value={2}>Nữ</option>
                <option value={3}>Khác</option>
              </select>
            </FormField>
            <FormField label="Ngày sinh">
              <input
                type="date"
                value={form.date_of_birth ?? ''}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số CCCD">
              <input
                type="text"
                value={form.citizen_id ?? ''}
                onChange={(e) => setForm({ ...form, citizen_id: e.target.value })}
                placeholder="VD: 001205000001"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Điểm tuyển sinh">
              <input
                type="number"
                value={form.admission_score ?? ''}
                onChange={(e) => setForm({ ...form, admission_score: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="VD: 25.5"
                step="0.01"
                min="0"
                max="30"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm tabular-nums"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Điện thoại">
              <input
                type="text"
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="VD: 0901234567"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="VD: email@example.com"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Đợt tuyển sinh" error={errors.batch_id} required>
              <select
                value={form.batch_id}
                onChange={(e) => setForm({ ...form, batch_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn đợt --</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </FormField>
            <FormField label="Hệ đào tạo" error={errors.training_system_id} required>
              <select
                value={form.training_system_id}
                onChange={(e) => setForm({ ...form, training_system_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn hệ --</option>
                {trainingSystems.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Khóa học" error={errors.course_id} required>
              <select
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn khóa --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Ngành">
              <select
                value={form.major_id ?? ''}
                onChange={(e) => setForm({ ...form, major_id: e.target.value ? Number(e.target.value) : undefined })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn ngành --</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Trạng thái">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 | 2 | 3 })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>Chờ xử lý</option>
              <option value={1}>Đã trúng tuyển</option>
              <option value={2}>Đã nhập học</option>
              <option value={3}>Đã hủy</option>
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa thí sinh"
        description={`Bạn có chắc muốn xóa thí sinh "${deleting?.full_name}" (mã ${deleting?.candidate_code})? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết thí sinh"
        size="lg"
      >
        {detailItem ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mã thí sinh</p>
                <p className="font-mono text-sm font-semibold">{detailItem.candidate_code}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
                <Badge variant={STATUS_CONFIG[detailItem.status]?.variant ?? 'neutral'} dot>
                  {STATUS_CONFIG[detailItem.status]?.label ?? '—'}
                </Badge>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Họ tên</p>
                <p className="text-base font-semibold">{detailItem.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Giới tính</p>
                <p className="text-sm">{GENDER_CONFIG[detailItem.gender]?.label ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày sinh</p>
                <p className="text-sm">{detailItem.date_of_birth ? formatDate(detailItem.date_of_birth) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Số CCCD</p>
                <p className="font-mono text-sm">{detailItem.citizen_id ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm tuyển sinh</p>
                <p className="font-mono text-sm">{detailItem.admission_score != null ? Number(detailItem.admission_score).toFixed(2) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điện thoại</p>
                <p className="text-sm">{detailItem.phone ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Email</p>
                <p className="text-sm">{detailItem.email ?? '—'}</p>
              </div>
              <div className="col-span-2 space-y-1 border-t border-[rgb(var(--border))] pt-4 mt-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Thông tin tuyển sinh</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Đợt tuyển sinh</p>
                <p className="text-sm font-medium">{getBatchName(detailItem.batch_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Hệ đào tạo</p>
                <p className="text-sm">{getTSName(detailItem.training_system_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Khóa học</p>
                <p className="text-sm">{getCourseName(detailItem.course_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngành</p>
                <p className="text-sm">{getMajorName(detailItem.major_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID</p>
                <p className="font-mono text-sm">#{detailItem.id}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}>
                <Edit className="h-4 w-4 mr-1" /> Sửa
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>
    </div>
  );
}
