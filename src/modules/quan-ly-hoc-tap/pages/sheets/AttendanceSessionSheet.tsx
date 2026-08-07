// ─── AttendanceSessionSheet ─────────────────────────────────────────────────────────
// Sheet: Buổi điểm danh — CRUD cho Attendance Sessions

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, RotateCcw,
  QrCode, Clock, MapPin, Users, ClipboardCheck,
} from 'lucide-react';
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
  useAttendanceSessions,
  useAttendanceSession,
  useCreateAttendanceSession,
  useUpdateAttendanceSession,
  useDeleteAttendanceSession,
} from '@/hooks/useLmsPart5';
import { useLearningCourses } from '@/hooks/useLms';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDateVietnam, toDateTimeLocalValue, toIsoString } from '@/utils/formatters';
import type {
  AttendanceSession,
  AttendanceSessionCreatePayload,
  AttendanceMethod,
  AttendanceSessionStatus,
  AttendanceSessionListParams,
  LearningCourse,
} from '@/types/lms.types';

const METHOD_OPTIONS: { value: AttendanceMethod; label: string; icon: string }[] = [
  { value: 'qr_code', label: 'Quét mã QR', icon: '📱' },
  { value: 'gps', label: 'GPS', icon: '📍' },
  { value: 'face_recognition', label: 'Nhận diện khuôn mặt', icon: '👤' },
  { value: 'manual', label: 'Thủ công', icon: '✍️' },
];

const STATUS_CONFIG: Record<AttendanceSessionStatus, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  scheduled: { variant: 'neutral', label: 'Chưa bắt đầu' },
  active: { variant: 'success', label: 'Đang hoạt động' },
  closed: { variant: 'warning', label: 'Đã đóng' },
};

const METHOD_LABELS: Record<AttendanceMethod, string> = {
  qr_code: 'Quét mã QR',
  gps: 'GPS',
  face_recognition: 'Nhận diện khuôn mặt',
  manual: 'Thủ công',
};

const emptyForm = (): Omit<AttendanceSessionCreatePayload, 'title' | 'learning_course_id' | 'attendance_method' | 'start_time' | 'end_time'> & {
  title: string;
  learning_course_id: number;
  attendance_method: AttendanceMethod;
  start_time: string;
  end_time: string;
} => ({
  title: '',
  learning_course_id: 0,
  attendance_method: 'manual',
  start_time: '',
  end_time: '',
  lesson_id: null,
  latitude: null,
  longitude: null,
  radius: null,
  face_recognition: false,
  status: 'scheduled',
});

export function AttendanceSessionSheet({
  courseId,
  onCourseIdChange,
}: {
  courseId: number | undefined;
  onCourseIdChange: (id: number | undefined) => void;
}) {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;
  const notify = useNotificationStore();

  // Filters
  const [methodFilter, setMethodFilter] = useState<AttendanceMethod | ''>('');
  const [statusFilter, setStatusFilter] = useState<AttendanceSessionStatus | ''>('');
  const [search, setSearch] = useState('');

  // Lookup
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses: LearningCourse[] = Array.isArray(coursesData?.data) ? coursesData.data : [];

  // Auto-select first course — only when courseId is undefined AND courses are loaded
  useEffect(() => {
    if (courseId === undefined && courses.length > 0) {
      onCourseIdChange(courses[0].id);
    }
  }, [courses, courseId, onCourseIdChange]);

  const params: AttendanceSessionListParams = useMemo(() => ({
    page,
    per_page: pageSize,
    learning_course_id: courseId,
    attendance_method: methodFilter || undefined,
    status: statusFilter || undefined,
    title: search || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  }), [page, pageSize, courseId, methodFilter, statusFilter, search]);

  const { data, isLoading, isFetching } = useAttendanceSessions(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceSession | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<AttendanceSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<ReturnType<typeof emptyForm>>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useAttendanceSession(detailId ?? undefined);
  const createMut = useCreateAttendanceSession();
  const updateMut = useUpdateAttendanceSession();
  const deleteMut = useDeleteAttendanceSession();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), learning_course_id: courseId ?? 0 });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: AttendanceSession) => {
    setEditing(item);
    setForm({
      title: item.title,
      learning_course_id: item.learning_course_id,
      attendance_method: item.attendance_method ?? 'manual',
      start_time: toDateTimeLocalValue(item.start_time),
      end_time: toDateTimeLocalValue(item.end_time),
      lesson_id: item.lesson_id,
      latitude: item.latitude,
      longitude: item.longitude,
      radius: item.radius,
      face_recognition: item.face_recognition,
      status: item.status ?? 'scheduled',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: AttendanceSession) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: AttendanceSession) => { setDeleting(item); setDeleteOpen(true); };

  const resetFilters = () => {
    setMethodFilter('');
    setStatusFilter('');
    setSearch('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!form.learning_course_id) e.learning_course_id = 'Vui lòng chọn khóa học';
    if (!form.start_time) e.start_time = 'Giờ bắt đầu không được để trống';
    if (!form.end_time) e.end_time = 'Giờ kết thúc không được để trống';
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      e.end_time = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
    }
    if (form.attendance_method === 'gps') {
      if (!form.latitude) e.latitude = 'Vĩ độ không được để trống';
      if (!form.longitude) e.longitude = 'Kinh độ không được để trống';
      if (!form.radius) e.radius = 'Bán kính không được để trống';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: AttendanceSessionCreatePayload = {
        ...form,
        title: form.title.trim(),
        start_time: toIsoString(form.start_time),
        end_time: toIsoString(form.end_time),
      };
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload });
        notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật buổi điểm danh thành công' });
      } else {
        await createMut.mutateAsync(payload);
        notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo buổi điểm danh thành công' });
      }
      setModalOpen(false);
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting.id);
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa buổi điểm danh thành công' });
      setDeleteOpen(false);
      setDeleting(null);
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Xóa thất bại' });
    }
  };

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select
            value={courseId ?? ''}
            onChange={(e) => { onCourseIdChange(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[220px]"
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Phương thức</label>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value as AttendanceMethod | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as AttendanceSessionStatus | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Tìm tiêu đề..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-56"
        />
        {(methodFilter || statusFilter || search) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!courseId}>
          Thêm buổi điểm danh
        </Button>
      </div>

      {/* Table */}
      {!courseId ? (
        <div className="flex flex-col items-center justify-center py-12 text-[rgb(var(--text-muted))]">
          <ClipboardCheck className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">Vui lòng chọn khóa học để xem danh sách buổi điểm danh</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-14">STT</TableHeadCell>
                <TableHeadCell>Tiêu đề buổi điểm danh</TableHeadCell>
                <TableHeadCell>Phương thức</TableHeadCell>
                <TableHeadCell>Thời gian</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell>Cập nhật</TableHeadCell>
                <TableHeadCell className="text-right w-40">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton colSpan={7} rows={5} />
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                    Chưa có buổi điểm danh nào
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, i) => {
                  const sc = STATUS_CONFIG[item.status ?? 'scheduled'];
                  return (
                    <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                      <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                        {(page - 1) * pageSize + i + 1}
                      </TableCell>
                      <TableCell className="font-medium max-w-sm">
                        <div className="line-clamp-1">{item.title}</div>
                        {item.lesson && (
                          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{item.lesson.title}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{METHOD_LABELS[item.attendance_method ?? 'manual']}</span>
                      </TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                        <div>{formatDateVietnam(item.start_time)}</div>
                        <div className="text-xs">{formatDateVietnam(item.end_time)}</div>
                      </TableCell>
                      <TableCell>
                        {sc && <Badge variant={sc.variant} size="sm">{sc.label}</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                        {item.updated_at ? formatDateVietnam(item.updated_at) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Sửa"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(item)} title="Xóa"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            page={page} pageSize={pageSize} total={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            pageSizeOptions={[10, 15, 25, 50]}
          />
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa buổi điểm danh' : 'Thêm buổi điểm danh'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo buổi điểm danh'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>
          )}
          <FormField label="Tiêu đề buổi điểm danh" error={errors.title} required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Buổi 1 - Điểm danh lớp CNTT301"
            />
          </FormField>
          <FormField label="Khóa học" error={errors.learning_course_id} required>
            <select
              value={form.learning_course_id || ''}
              onChange={(e) => setForm({ ...form, learning_course_id: e.target.value ? Number(e.target.value) : 0 })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value="">— Chọn khóa học —</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Phương thức" required>
              <select
                value={form.attendance_method}
                onChange={(e) => setForm({ ...form, attendance_method: e.target.value as AttendanceMethod })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceSessionStatus })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="scheduled">Chưa bắt đầu</option>
                <option value="active">Đang hoạt động</option>
                <option value="closed">Đã đóng</option>
              </select>
            </FormField>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.face_recognition}
                  onChange={(e) => setForm({ ...form, face_recognition: e.target.checked })}
                  className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
                />
                <span className="text-sm">Yêu cầu nhận diện khuôn mặt</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Giờ bắt đầu" error={errors.start_time} required>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Giờ kết thúc" error={errors.end_time} required>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>
          {/* GPS fields — shown only when method = gps */}
          {form.attendance_method === 'gps' && (
            <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
              <p className="col-span-3 text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Cài đặt GPS</p>
              <FormField label="Vĩ độ (Latitude)" error={errors.latitude}>
                <Input
                  type="number"
                  step="any"
                  value={form.latitude ?? ''}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : null })}
                  placeholder="10.762622"
                />
              </FormField>
              <FormField label="Kinh độ (Longitude)" error={errors.longitude}>
                <Input
                  type="number"
                  step="any"
                  value={form.longitude ?? ''}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : null })}
                  placeholder="106.660172"
                />
              </FormField>
              <FormField label="Bán kính (m)" error={errors.radius}>
                <Input
                  type="number"
                  value={form.radius ?? ''}
                  onChange={(e) => setForm({ ...form, radius: e.target.value ? Number(e.target.value) : null })}
                  placeholder="50"
                />
              </FormField>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Xác nhận xóa buổi điểm danh"
        description={`Bạn có chắc muốn xóa buổi điểm danh "${deleting?.title}"?`}
        confirmText="Xóa" variant="danger" loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết buổi điểm danh" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b flex-wrap">
              {STATUS_CONFIG[detailData.data.status ?? 'scheduled'] && (
                <Badge variant={STATUS_CONFIG[detailData.data.status ?? 'scheduled'].variant} size="sm">
                  {STATUS_CONFIG[detailData.data.status ?? 'scheduled'].label}
                </Badge>
              )}
              <h3 className="text-lg font-bold">{detailData.data.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Khóa học</p>
                <p className="font-medium">
                  {detailData.data.learning_course
                    ? `${detailData.data.learning_course.code} — ${detailData.data.learning_course.name}`
                    : `#${detailData.data.learning_course_id}`}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Phương thức</p>
                <p className="font-medium">{METHOD_LABELS[detailData.data.attendance_method ?? 'manual']}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ bắt đầu</p>
                <p className="font-medium">{formatDateVietnam(detailData.data.start_time)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ kết thúc</p>
                <p className="font-medium">{formatDateVietnam(detailData.data.end_time)}</p>
              </div>
              {detailData.data.attendance_method === 'gps' && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 col-span-2">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">GPS Location</p>
                  <p className="font-medium text-sm">
                    {detailData.data.latitude}, {detailData.data.longitude} — Bán kính {detailData.data.radius}m
                  </p>
                </div>
              )}
              {detailData.data.lesson && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 col-span-2">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Bài học</p>
                  <p className="font-medium">{detailData.data.lesson.title}</p>
                </div>
              )}
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Cập nhật lần cuối</p>
                <p className="font-medium">{detailData.data.updated_at ? formatDateVietnam(detailData.data.updated_at) : '—'}</p>
              </div>
            </div>
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

export default AttendanceSessionSheet;
