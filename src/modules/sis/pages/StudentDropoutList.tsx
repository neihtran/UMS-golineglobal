import { useState } from 'react';
import { Plus, RotateCcw, Search, Edit, Trash2 } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField, StudentPicker } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatStudentDropouts,
  useCreateHqnhatStudentDropout,
  useUpdateHqnhatStudentDropout,
  useDeleteHqnhatStudentDropout,
  useHqnhatStudents,
  useHqnhatMajors,
} from '@/hooks/useHqnhat';
import type {
  HqnhatStudent,
  HqnhatStudentDropout,
  HqnhatStudentDropoutCreatePayload,
} from '@/types/hqnhat.types';

const DROPOUT_STATUS: Record<number, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  1: { label: 'Đã duyệt', variant: 'success' },
  2: { label: 'Đã hủy', variant: 'neutral' },
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
};

const emptyForm = (): HqnhatStudentDropoutCreatePayload => ({
  student_id: 0,
  dropout_date: '',
  decision_no: '',
  decision_date: '',
  reason: '',
  status: 1,
});

export default function StudentDropoutList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    status: statusFilter ? Number(statusFilter) as 1 | 2 : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatStudentDropouts(params);
  const { data: studentData } = useHqnhatStudents({ per_page: 100 });
  const { data: majorData } = useHqnhatMajors({ per_page: 100, status: 1 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const students = Array.isArray(studentData?.data) ? studentData.data : [];
  const majors = Array.isArray(majorData?.data) ? majorData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatStudentDropout | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatStudentDropout | null>(null);
  const [form, setForm] = useState<HqnhatStudentDropoutCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  const createMut = useCreateHqnhatStudentDropout();
  const updateMut = useUpdateHqnhatStudentDropout();
  const deleteMut = useDeleteHqnhatStudentDropout();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const filteredStudents = students.filter((s: HqnhatStudent) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return s.full_name.toLowerCase().includes(q) || s.student_code.toLowerCase().includes(q);
  });

  const getStudentName = (id: number | string) => {
    const numId = typeof id === 'string' ? Number(id) : id;
    const s = students.find((s: HqnhatStudent) => Number(s.id) === numId);
    return s ? `${s.student_code} — ${s.full_name}` : `SV #${id}`;
  };

  const getMajorName = (id: number | string) => {
    const numId = typeof id === 'string' ? Number(id) : id;
    const m = majors.find((m: any) => Number(m.id) === numId);
    return m?.name ?? `Ngành #${id}`;
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setStudentSearch('');
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatStudentDropout) => {
    setEditing(item);
    setForm({
      student_id: item.student_id,
      dropout_date: item.dropout_date,
      decision_no: item.decision_no ?? '',
      decision_date: item.decision_date ?? '',
      reason: item.reason ?? '',
      status: item.status as 1 | 2,
    });
    const student = students.find((s: HqnhatStudent) => s.id === item.student_id);
    if (student) setStudentSearch(`${student.student_code} — ${student.full_name}`);
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDelete = (item: HqnhatStudentDropout) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.student_id || form.student_id === 0) e.student_id = 'Chọn sinh viên';
    if (!form.dropout_date) e.dropout_date = 'Chọn ngày thôi học';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload = { ...form, student_id: Number(form.student_id) };
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch (err: any) {
      let message = 'Có lỗi xảy ra';
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
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
        <div className="w-64">
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Mã SV, họ tên..."
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-10 pr-3 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="1">Đã duyệt</option>
            <option value="2">Đã hủy</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Tạo thôi học
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã SV</TableHeadCell>
            <TableHeadCell>Họ tên</TableHeadCell>
            <TableHeadCell>Ngành</TableHeadCell>
            <TableHeadCell>Ngày thôi học</TableHeadCell>
            <TableHeadCell>Số QĐ</TableHeadCell>
            <TableHeadCell>Ngày QĐ</TableHeadCell>
            <TableHeadCell>Lý do</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={5} colSpan={10} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12 text-[rgb(var(--text-muted))]">
                {search || statusFilter ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có bản ghi thôi học nào'}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item: HqnhatStudentDropout, i) => {
              const numStudentId = typeof item.student_id === 'string' ? Number(item.student_id) : item.student_id;
              const student = students.find((s: HqnhatStudent) => Number(s.id) === numStudentId);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student?.student_code ?? `SV #${item.student_id}`}</TableCell>
                  <TableCell className="font-medium">{student?.full_name ?? `Sinh viên #${item.student_id}`}</TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">
                    {student?.major_id ? getMajorName(student.major_id) : '—'}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(item.dropout_date)}</TableCell>
                  <TableCell className="font-mono text-xs">{item.decision_no ?? '—'}</TableCell>
                  <TableCell className="text-sm">{formatDate(item.decision_date)}</TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))] max-w-[200px] truncate" title={item.reason ?? ''}>
                    {item.reason ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={DROPOUT_STATUS[item.status]?.variant ?? 'neutral'} dot size="sm">
                      {DROPOUT_STATUS[item.status]?.label ?? `Trạng thái ${item.status}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
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
        title={editing ? 'Sửa thôi học' : 'Tạo thôi học'}
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

          <FormField label="Sinh viên" error={errors.student_id} required>
            <StudentPicker
              value={form.student_id}
              onChange={(id) => setForm({ ...form, student_id: id })}
              error={errors.student_id}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngày thôi học" error={errors.dropout_date} required>
              <input
                type="date"
                value={form.dropout_date}
                onChange={(e) => setForm({ ...form, dropout_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Ngày quyết định">
              <input
                type="date"
                value={form.decision_date ?? ''}
                onChange={(e) => setForm({ ...form, decision_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số quyết định">
              <input
                type="text"
                value={form.decision_no ?? ''}
                onChange={(e) => setForm({ ...form, decision_no: e.target.value })}
                placeholder="VD: QD-124/2024"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 1 | 2 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Đã duyệt</option>
                <option value={2}>Đã hủy</option>
              </select>
            </FormField>
          </div>

          <FormField label="Lý do">
            <textarea
              value={form.reason ?? ''}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Nhập lý do thôi học..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none"
            />
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa bản ghi thôi học"
        description={`Xác nhận xóa bản ghi thôi học của sinh viên "${deleting ? getStudentName(deleting.student_id) : ''}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
