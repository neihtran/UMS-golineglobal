import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, GraduationCap, Calendar, Users, FileText, UserCheck } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { FormField } from '@/components/forms';
import { usePagination } from '@/hooks';
import {
  useLearningCourses,
  useLearningCourse,
  useCreateLearningCourse,
  useUpdateLearningCourse,
  useDeleteLearningCourse,
} from '@/hooks/useLms';
import { useEmployeeProfiles } from '@/hooks/useHrm';
import { formatDateVietnam, toDateInputValue } from '@/utils/formatters';
import type {
  LearningCourse,
  LearningCourseCreatePayload,
  LearningCourseEnrollment,
  LearningCourseListParams,
  LearningCourseStatus,
  LearningCourseVisibility,
} from '@/types/lms.types';
import type { EmployeeProfile } from '@/types/hrm.types';

const STATUS_OPTS: { value: LearningCourseStatus; label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }[] = [
  { value: 'active', label: 'Đang hoạt động', variant: 'success' },
  { value: 'inactive', label: 'Tạm ngưng', variant: 'warning' },
  { value: 'archived', label: 'Đã lưu trữ', variant: 'neutral' },
];

const ENROLLMENT_OPTS: { value: LearningCourseEnrollment; label: string }[] = [
  { value: 'self_enrollment', label: 'Tự đăng ký' },
  { value: 'invitation', label: 'Theo lời mời' },
  { value: 'course_section', label: 'Theo lớp học phần' },
];

const VISIBILITY_OPTS: { value: LearningCourseVisibility; label: string }[] = [
  { value: 'public', label: 'Công khai' },
  { value: 'private', label: 'Riêng tư' },
];

const emptyForm = (): LearningCourseCreatePayload => ({
  code: '',
  name: '',
  description: null,
  thumbnail: null,
  course_section_id: null,
  lecturer_id: null,
  start_date: null,
  end_date: null,
  enrollment_type: 'self_enrollment',
  visibility: 'public',
  status: 'active',
});

export function LearningCourseSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LearningCourseStatus | ''>('');

  const params: LearningCourseListParams = {
    page,
    per_page: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  };

  const { data, isLoading, isFetching } = useLearningCourses(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  // Lookup danh sách giảng viên (employee_profiles) cho dropdown form
  const { data: employeesData } = useEmployeeProfiles({ per_page: 100, status: 'active' });
  const employees: EmployeeProfile[] = Array.isArray(employeesData?.data) ? employeesData.data : [];
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const getLecturerName = (id: number | null | undefined) => {
    if (!id) return null;
    const e = employeeMap.get(id);
    return e ? `${e.full_name} (${e.employee_code})` : `#${id}`;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LearningCourse | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<LearningCourse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<LearningCourseCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useLearningCourse(detailId ?? undefined);
  const createMut = useCreateLearningCourse();
  const updateMut = useUpdateLearningCourse();
  const deleteMut = useDeleteLearningCourse();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: LearningCourse) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      description: item.description,
      thumbnail: item.thumbnail,
      course_section_id: item.course_section_id,
      lecturer_id: item.lecturer_id,
      start_date: item.start_date,
      end_date: item.end_date,
      enrollment_type: item.enrollment_type ?? 'self_enrollment',
      visibility: item.visibility ?? 'public',
      status: item.status ?? 'active',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: LearningCourse) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: LearningCourse) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã khóa học không được để trống';
    if (!form.name.trim()) e.name = 'Tên khóa học không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: LearningCourseCreatePayload = {
        ...form,
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
      };
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload })
        : await createMut.mutateAsync(payload);
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

  const statusBadge = (s: LearningCourseStatus | null) => STATUS_OPTS.find(o => o.value === s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên khóa học..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as LearningCourseStatus | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[160px]"
          >
            <option value="">Tất cả</option>
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm khóa học LMS
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã khóa học</TableHeadCell>
            <TableHeadCell>Tên khóa học</TableHeadCell>
            <TableHeadCell>Giảng viên</TableHeadCell>
            <TableHeadCell>Thời gian</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-40">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có khóa học LMS nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sb = statusBadge(item.status);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono font-medium">{item.code}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      <span className="line-clamp-1">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.lecturer?.full_name ? (
                      <span>{item.lecturer.full_name}</span>
                    ) : getLecturerName(item.lecturer_id) ? (
                      <span>{getLecturerName(item.lecturer_id)}</span>
                    ) : (
                      <span className="text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.start_date || item.end_date ? (
                      <span className="inline-flex items-center gap-1 text-[rgb(var(--text-muted))]">
                        <Calendar className="h-3 w-3" />
                        {formatDateVietnam(item.start_date)} → {formatDateVietnam(item.end_date)}
                      </span>
                    ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                  </TableCell>
                  <TableCell>
                    {sb && <Badge variant={sb.variant} size="sm">{sb.label}</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết">
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
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa khóa học LMS' : 'Thêm khóa học LMS'}
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
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã khóa học" error={errors.code} required>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="VD: CS101_2027"
              />
            </FormField>
            <FormField label="Tên khóa học" error={errors.name} required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Lập trình Web nâng cao"
              />
            </FormField>
          </div>
          <FormField label="Mô tả">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              placeholder="Mô tả chi tiết khóa học"
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Giảng viên phụ trách" error={errors.lecturer_id}>
              <select
                value={form.lecturer_id ?? ''}
                onChange={(e) => setForm({ ...form, lecturer_id: e.target.value ? Number(e.target.value) : null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">— Chưa phân công —</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.employee_code})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Mã lớp học phần (SIS)">
              <Input
                type="number"
                value={form.course_section_id ?? ''}
                onChange={(e) => setForm({ ...form, course_section_id: e.target.value ? Number(e.target.value) : null })}
                placeholder="VD: 5"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngày bắt đầu">
              <Input
                type="date"
                value={toDateInputValue(form.start_date)}
                onChange={(e) => setForm({ ...form, start_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Ngày kết thúc">
              <Input
                type="date"
                value={toDateInputValue(form.end_date)}
                onChange={(e) => setForm({ ...form, end_date: e.target.value || null })}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Hình thức đăng ký">
              <select
                value={form.enrollment_type ?? 'self_enrollment'}
                onChange={(e) => setForm({ ...form, enrollment_type: e.target.value as LearningCourseEnrollment })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {ENROLLMENT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Phạm vi hiển thị">
              <select
                value={form.visibility ?? 'public'}
                onChange={(e) => setForm({ ...form, visibility: e.target.value as LearningCourseVisibility })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {VISIBILITY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status ?? 'active'}
                onChange={(e) => setForm({ ...form, status: e.target.value as LearningCourseStatus })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa khóa học LMS"
        description={`Bạn có chắc muốn xóa khóa học "${deleting?.name}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết khóa học LMS" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <GraduationCap className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.name}</h3>
              <Badge variant="neutral" size="sm" className="font-mono">{detailData.data.code}</Badge>
              {(() => {
                const sb = statusBadge(detailData.data.status);
                return sb ? <Badge variant={sb.variant} size="sm">{sb.label}</Badge> : null;
              })()}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1"><UserCheck className="h-3 w-3" /> Giảng viên</p>
                <p className="font-medium">{detailData.data.lecturer?.full_name ?? getLecturerName(detailData.data.lecturer_id) ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Thời gian</p>
                <p className="font-medium">{formatDateVietnam(detailData.data.start_date)} → {formatDateVietnam(detailData.data.end_date)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Hình thức đăng ký</p>
                <p className="font-medium">{ENROLLMENT_OPTS.find(o => o.value === detailData.data.enrollment_type)?.label ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Phạm vi</p>
                <p className="font-medium">{VISIBILITY_OPTS.find(o => o.value === detailData.data.visibility)?.label ?? '—'}</p>
              </div>
            </div>
            {detailData.data.description && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1"><FileText className="h-3 w-3" /> Mô tả</p>
                <p className="text-sm whitespace-pre-wrap">{detailData.data.description}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}>
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

export default LearningCourseSheet;
