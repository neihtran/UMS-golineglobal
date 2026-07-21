import { useState } from 'react';
import { Plus, RotateCcw, Search, Edit, Trash2, Eye } from 'lucide-react';
import {
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  Modal,
  Badge,
} from '@/components/ui';
import { FormField, StudentPicker } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatStudentMajorChanges,
  useCreateHqnhatStudentMajorChange,
  useUpdateHqnhatStudentMajorChange,
  useDeleteHqnhatStudentMajorChange,
  useHqnhatStudents,
  useHqnhatMajors,
  useUpdateHqnhatStudent,
} from '@/hooks/useHqnhat';
import type {
  HqnhatStudent,
  HqnhatStudentMajorChange,
  HqnhatStudentMajorChangeCreatePayload,
} from '@/types/hqnhat.types';

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
};

const emptyForm = (): HqnhatStudentMajorChangeCreatePayload => ({
  student_id: 0,
  from_major_id: undefined,
  to_major_id: 0,
  from_specialization_id: undefined,
  to_specialization_id: undefined,
  effective_date: '',
  decision_no: '',
  decision_date: '',
  reason: '',
});

export default function StudentMajorChangeList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    to_major_id: majorFilter ? Number(majorFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatStudentMajorChanges(params);
  // Lấy TẤT CẢ SV (không filter status) để hiển thị đúng tên/mã SV cho các bản ghi
  // đã được tạo trước đó ngay cả khi SV đã chuyển trạng thái.
  const { data: studentData } = useHqnhatStudents({ per_page: 100 });
  const { data: majorData } = useHqnhatMajors({ per_page: 100, status: 1 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const students = Array.isArray(studentData?.data) ? studentData.data : [];
  const majors = Array.isArray(majorData?.data) ? majorData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatStudentMajorChange | null>(null);
  const [viewing, setViewing] = useState<HqnhatStudentMajorChange | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatStudentMajorChange | null>(null);
  const [form, setForm] = useState<HqnhatStudentMajorChangeCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMut = useCreateHqnhatStudentMajorChange();
  const updateMut = useUpdateHqnhatStudentMajorChange();
  const deleteMut = useDeleteHqnhatStudentMajorChange();
  const updateStudentMut = useUpdateHqnhatStudent();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getStudentName = (id: number | string) => {
    const numId = typeof id === 'string' ? Number(id) : id;
    const s = students.find((s: HqnhatStudent) => Number(s.id) === numId);
    return s ? `${s.student_code} — ${s.full_name}` : `SV #${id}`;
  };

  const getStudentCode = (id: number | string) => {
    const numId = typeof id === 'string' ? Number(id) : id;
    const s = students.find((s: HqnhatStudent) => Number(s.id) === numId);
    return s?.student_code ?? `SV #${id}`;
  };

  const getMajorName = (id: number | string | null | undefined) => {
    if (id === null || id === undefined || id === '') return '—';
    const numId = typeof id === 'string' ? Number(id) : id;
    const m = majors.find((m: any) => Number(m.id) === numId);
    return m?.name ?? `Ngành #${id}`;
  };

  const resetFilters = () => {
    setSearch('');
    setMajorFilter('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatStudentMajorChange) => {
    setEditing(item);
    setForm({
      student_id: item.student_id,
      from_major_id: item.from_major_id ?? undefined,
      to_major_id: item.to_major_id,
      from_specialization_id: item.from_specialization_id ?? undefined,
      to_specialization_id: item.to_specialization_id ?? undefined,
      effective_date: item.effective_date,
      decision_no: item.decision_no ?? '',
      decision_date: item.decision_date ?? '',
      reason: item.reason ?? '',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDelete = (item: HqnhatStudentMajorChange) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.student_id || form.student_id === 0) e.student_id = 'Chọn sinh viên';
    if (!form.to_major_id || form.to_major_id === 0) e.to_major_id = 'Chọn ngành chuyển đến';
    if (!form.effective_date) e.effective_date = 'Chọn ngày hiệu lực';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload = {
        ...form,
        student_id: Number(form.student_id),
        to_major_id: Number(form.to_major_id),
        from_major_id: form.from_major_id ? Number(form.from_major_id) : undefined,
        from_specialization_id: form.from_specialization_id ? Number(form.from_specialization_id) : undefined,
        to_specialization_id: form.to_specialization_id ? Number(form.to_specialization_id) : undefined,
      };
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload });
      } else {
        await createMut.mutateAsync(payload);

        // Cập nhật trạng thái và ngành sinh viên
        // API yêu cầu đầy đủ fields: major_id, training_system_id, course_id, full_name, status
        const student = students.find(s => s.id === Number(form.student_id));
        if (student) {
          await updateStudentMut.mutateAsync({
            id: Number(form.student_id),
            payload: {
              major_id: Number(form.to_major_id),
              training_system_id: student.training_system_id,
              course_id: student.course_id,
              full_name: student.full_name,
              status: 5, // Chuyển ngành
            }
          });
        }
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
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Ngành chuyển đến</label>
          <select
            value={majorFilter}
            onChange={(e) => { setMajorFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả ngành</option>
            {majors.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        {(search || majorFilter) && (
          <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Tạo chuyển ngành
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã SV</TableHeadCell>
            <TableHeadCell>Họ tên</TableHeadCell>
            <TableHeadCell>Từ ngành</TableHeadCell>
            <TableHeadCell>Đến ngành</TableHeadCell>
            <TableHeadCell>Ngày hiệu lực</TableHeadCell>
            <TableHeadCell>Số QĐ</TableHeadCell>
            <TableHeadCell>Ngày QĐ</TableHeadCell>
            <TableHeadCell>Lý do</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={5} colSpan={10} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12 text-[rgb(var(--text-muted))]">
                {search || majorFilter ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có bản ghi chuyển ngành nào'}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item: HqnhatStudentMajorChange, i) => {
              const numStudentId = typeof item.student_id === 'string' ? Number(item.student_id) : item.student_id;
              const student = students.find((s: HqnhatStudent) => Number(s.id) === numStudentId);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{getStudentCode(item.student_id)}</TableCell>
                  <TableCell className="font-medium">{student?.full_name ?? `Sinh viên #${item.student_id}`}</TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{getMajorName(item.from_major_id)}</TableCell>
                  <TableCell className="text-sm font-medium">{getMajorName(item.to_major_id)}</TableCell>
                  <TableCell className="text-sm">{formatDate(item.effective_date)}</TableCell>
                  <TableCell className="font-mono text-xs">{item.decision_no ?? '—'}</TableCell>
                  <TableCell className="text-sm">{formatDate(item.decision_date)}</TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))] max-w-[200px] truncate" title={item.reason ?? ''}>
                    {item.reason ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewing(item)} title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Sửa">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(item)} title="Xóa">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
        title={editing ? 'Sửa chuyển ngành' : 'Tạo chuyển ngành'}
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
              onChange={(id, s) => setForm({
                ...form,
                student_id: id,
                from_major_id: s?.major_id,
              })}
              error={errors.student_id}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Từ ngành" error={errors.from_major_id}>
              <select
                value={form.from_major_id ?? ''}
                onChange={(e) => setForm({ ...form, from_major_id: e.target.value ? Number(e.target.value) : undefined })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">— Không xác định —</option>
                {majors.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </FormField>
            <FormField label="Đến ngành" error={errors.to_major_id} required>
              <select
                value={form.to_major_id}
                onChange={(e) => setForm({ ...form, to_major_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>— Chọn ngành —</option>
                {majors.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngày hiệu lực" error={errors.effective_date} required>
              <input
                type="date"
                value={form.effective_date}
                onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
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

          <FormField label="Số quyết định">
            <input
              type="text"
              value={form.decision_no ?? ''}
              onChange={(e) => setForm({ ...form, decision_no: e.target.value })}
              placeholder="VD: QD-123/2024"
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            />
          </FormField>

          <FormField label="Lý do">
            <textarea
              value={form.reason ?? ''}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Nhập lý do chuyển ngành..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none"
            />
          </FormField>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Chi tiết chuyển ngành"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setViewing(null)}>Đóng</Button>
        }
      >
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[rgb(var(--text-muted))]">Mã SV:</span> <span className="font-mono font-semibold ml-1">{getStudentCode(viewing.student_id)}</span></div>
              <div><span className="text-[rgb(var(--text-muted))]">Họ tên:</span> <span className="font-medium ml-1">{getStudentName(viewing.student_id)}</span></div>
              <div><span className="text-[rgb(var(--text-muted))]">Từ ngành:</span> <span className="ml-1">{getMajorName(viewing.from_major_id)}</span></div>
              <div><span className="text-[rgb(var(--text-muted))]">Đến ngành:</span> <span className="ml-1 font-medium">{getMajorName(viewing.to_major_id)}</span></div>
              <div><span className="text-[rgb(var(--text-muted))]">Ngày hiệu lực:</span> <span className="ml-1">{formatDate(viewing.effective_date)}</span></div>
              <div><span className="text-[rgb(var(--text-muted))]">Ngày QĐ:</span> <span className="ml-1">{formatDate(viewing.decision_date)}</span></div>
              <div className="col-span-2"><span className="text-[rgb(var(--text-muted))]">Số QĐ:</span> <span className="font-mono ml-1">{viewing.decision_no ?? '—'}</span></div>
              <div className="col-span-2"><span className="text-[rgb(var(--text-muted))]">Lý do:</span> <span className="ml-1">{viewing.reason ?? '—'}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa bản ghi chuyển ngành"
        description={`Xác nhận xóa bản ghi chuyển ngành của sinh viên "${deleting ? getStudentName(deleting.student_id) : ''}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />
    </div>
  );
}