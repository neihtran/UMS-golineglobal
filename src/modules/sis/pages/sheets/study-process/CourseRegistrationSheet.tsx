import { useState } from 'react';
import { Plus, Trash2, Eye, RotateCcw, UserPlus, CheckCircle2 } from 'lucide-react';
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
  useHqnhatCourseRegistrations,
  useHqnhatCourseRegistration,
  useCreateHqnhatCourseRegistration,
  useDeleteHqnhatCourseRegistration,
  useHqnhatCourseSections,
  useHqnhatStudents,
} from '@/hooks/useHqnhat';
import type {
  HqnhatCourseRegistration,
  HqnhatCourseRegistrationCreatePayload,
  HqnhatCourseSection,
  HqnhatStudent,
} from '@/types/hqnhat.types';
import { formatDateTime } from '@/utils/formatters';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'error' }> = {
  1: { label: 'Đã đăng ký', variant: 'success' },
  2: { label: 'Đã hủy', variant: 'error' },
};

const emptyForm = (): HqnhatCourseRegistrationCreatePayload => ({
  student_id: 0,
  course_section_id: 0,
  status: 1,
});

export function CourseRegistrationSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    status: statusFilter ? (Number(statusFilter) as 1 | 2) : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useHqnhatCourseRegistrations(params);
  const { data: sectionsData } = useHqnhatCourseSections({ per_page: 100 });
  // Load all students for registration dropdown (no status filter - show all available students)
  const { data: studentsData } = useHqnhatStudents({ per_page: 50 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const sections = Array.isArray(sectionsData?.data) ? sectionsData.data : [];
  const students = Array.isArray(studentsData?.data) ? studentsData.data : [];
  // Tính sĩ số thực tế từ registrations (vì backend không tự động tăng current_students)
  const getSectionStudentCount = (sectionId: number): number => {
    return items.filter((r) => r.course_section_id === sectionId && r.status === 1).length;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatCourseRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatCourseRegistrationCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatCourseRegistration(detailId ?? undefined);
  const createMut = useCreateHqnhatCourseRegistration();
  const deleteMut = useDeleteHqnhatCourseRegistration();
  const isSubmitting = createMut.isPending;

  const getSectionCode = (id: number) =>
    sections.find((s: HqnhatCourseSection) => s.id === id)?.section_code ?? `LHP #${id}`;
  const getStudentName = (id: number) => {
    const s = students.find((x: HqnhatStudent) => x.id === id);
    return s ? `${s.student_code} - ${s.full_name}` : `SV #${id}`;
  };

  const openCreate = () => {
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: HqnhatCourseRegistration) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: HqnhatCourseRegistration) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleCancel = async (item: HqnhatCourseRegistration) => {
    // Soft-cancel by deleting the registration (backend uses cancelled_at flag in API)
    try {
      await deleteMut.mutateAsync(item.id);
      refetch();
    } catch (_) {}
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.student_id || form.student_id === 0) e.student_id = 'Chọn sinh viên';
    if (!form.course_section_id || form.course_section_id === 0) e.course_section_id = 'Chọn lớp học phần';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: HqnhatCourseRegistrationCreatePayload = {
        student_id: Number(form.student_id),
        course_section_id: Number(form.course_section_id),
        status: 1,
      };
      await createMut.mutateAsync(payload);
      setModalOpen(false);
      // Refetch registrations để cập nhật sĩ số
      refetch();
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

  // Filter students by search text
  const filteredStudents = search
    ? students.filter((s: HqnhatStudent) =>
        s.student_code?.toLowerCase().includes(search.toLowerCase()) ||
        s.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : students;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm sinh viên (mã hoặc tên)..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả</option>
            <option value="1">Đã đăng ký</option>
            <option value="2">Đã hủy</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<UserPlus className="h-4 w-4" />} onClick={openCreate}>
          Thêm đăng ký
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Sinh viên</TableHeadCell>
            <TableHeadCell>Lớp học phần</TableHeadCell>
            <TableHeadCell>Ngày đăng ký</TableHeadCell>
            <TableHeadCell>Ngày hủy</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có đăng ký nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[1];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{getStudentName(item.student_id)}</div>
                  </TableCell>
                  <TableCell className="font-mono">{getSectionCode(item.course_section_id)}</TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))]">
                    {item.registered_at ? formatDateTime(item.registered_at) : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))]">
                    {item.cancelled_at ? formatDateTime(item.cancelled_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
                      {item.status === 1 && (
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(item)} title="Hủy đăng ký">
                          <CheckCircle2 className="h-4 w-4 text-orange-500" />
                        </Button>
                      )}
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
        pageSizeOptions={[10, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Thêm đăng ký học phần"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>Đăng ký</Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <FormField label="Sinh viên" error={errors.student_id} required>
            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn sinh viên --</option>
              {students.map((s: HqnhatStudent) => (
                <option key={s.id} value={s.id}>{s.student_code} - {s.full_name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Lớp học phần" error={errors.course_section_id} required>
            <select value={form.course_section_id} onChange={(e) => setForm({ ...form, course_section_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn lớp HP --</option>
              {sections.map((s: HqnhatCourseSection) => (
                <option key={s.id} value={s.id}>
                  {s.section_code} (Sĩ số: {getSectionStudentCount(s.id)}/{s.max_students})
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa đăng ký"
        description={`Xóa đăng ký học phần của sinh viên này?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Chi tiết đăng ký #${detailData?.data?.id ?? ''}`} size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Sinh viên</p>
                <p className="text-base font-semibold">{getStudentName(detailData.data.student_id)}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Lớp học phần</p>
                <p className="font-mono text-sm">{getSectionCode(detailData.data.course_section_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày đăng ký</p>
                <p className="text-sm">{detailData.data.registered_at ? formatDateTime(detailData.data.registered_at) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày hủy</p>
                <p className="text-sm">{detailData.data.cancelled_at ? formatDateTime(detailData.data.cancelled_at) : '—'}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
                <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant} dot>{STATUS_CONFIG[detailData.data.status]?.label}</Badge>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
            </div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}
