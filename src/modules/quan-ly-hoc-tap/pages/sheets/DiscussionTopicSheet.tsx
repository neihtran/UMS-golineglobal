import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, RotateCcw,
  MessageSquare, Pin, Lock, BookOpen, Hash,
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
  useDiscussionTopics,
  useDiscussionTopic,
  useCreateDiscussionTopic,
  useUpdateDiscussionTopic,
  useDeleteDiscussionTopic,
} from '@/hooks/useLmsPart4';
import { useLearningCourses, useCourseLessons } from '@/hooks/useLms';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDateVietnam } from '@/utils/formatters';
import type {
  DiscussionTopic,
  DiscussionTopicCreatePayload,
  DiscussionStatus,
  DiscussionTopicListParams,
  LearningCourse,
} from '@/types/lms.types';

const STATUS_OPTS: { value: DiscussionStatus; label: string; variant: 'success' | 'warning' | 'neutral' }[] = [
  { value: 'active', label: 'Hoạt động', variant: 'success' },
  { value: 'inactive', label: 'Tạm ẩn', variant: 'neutral' },
];

const emptyForm = (): Omit<DiscussionTopicCreatePayload, 'title' | 'learning_course_id'> & {
  title: string;
  learning_course_id: number;
} => ({
  title: '',
  description: null,
  learning_course_id: 0,
  lesson_id: null,
  is_pinned: false,
  is_locked: false,
  status: 'active',
});

export function DiscussionTopicSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;
  const notify = useNotificationStore();

  // Filters
  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DiscussionStatus | ''>('');
  const [lockedFilter, setLockedFilter] = useState<'' | 'true' | 'false'>('');

  // Lookup lists
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses: LearningCourse[] = Array.isArray(coursesData?.data) ? coursesData.data : [];

  // Auto-select first course
  useEffect(() => {
    if (!courseId && courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  const params: DiscussionTopicListParams = useMemo(() => ({
    page,
    per_page: pageSize,
    learning_course_id: courseId,
    title: search || undefined,
    status: statusFilter || undefined,
    is_locked: lockedFilter === '' ? undefined : lockedFilter === 'true',
    sort_by: 'created_at',
    sort_direction: 'desc',
  }), [page, pageSize, courseId, search, statusFilter, lockedFilter]);

  const { data, isLoading, isFetching } = useDiscussionTopics(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DiscussionTopic | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<DiscussionTopic | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<ReturnType<typeof emptyForm>>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Lessons lookup for selected course (via course modules)
  const { data: courseLessons, isLoading: lessonsLoading } = useCourseLessons(
    form.learning_course_id || undefined
  );

  const { data: detailData, isLoading: detailLoading } = useDiscussionTopic(detailId ?? undefined);
  const createMut = useCreateDiscussionTopic();
  const updateMut = useUpdateDiscussionTopic();
  const deleteMut = useDeleteDiscussionTopic();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), learning_course_id: courseId ?? 0 });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: DiscussionTopic) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      learning_course_id: item.learning_course_id,
      lesson_id: item.lesson_id,
      is_pinned: item.is_pinned,
      is_locked: item.is_locked,
      status: item.status ?? 'active',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: DiscussionTopic) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: DiscussionTopic) => { setDeleting(item); setDeleteOpen(true); };

  const resetFilters = () => {
    setSearch(''); setStatusFilter(''); setLockedFilter(''); setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề chủ đề không được để trống';
    if (!form.learning_course_id) e.learning_course_id = 'Vui lòng chọn khóa học';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: DiscussionTopicCreatePayload = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
      };
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload });
        notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật chủ đề thành công' });
      } else {
        await createMut.mutateAsync(payload);
        notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo chủ đề thảo luận thành công' });
      }
      setModalOpen(false);
    } catch (err: any) {
      const message = err?.message || 'Có lỗi xảy ra';
      setSubmitError(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting.id);
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa chủ đề thành công' });
      setDeleteOpen(false);
      setDeleting(null);
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Xóa thất bại' });
    }
  };

  const statusBadge = (s: DiscussionStatus | null | undefined) =>
    STATUS_OPTS.find(o => o.value === s);

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select
            value={courseId ?? ''}
            onChange={(e) => { setCourseId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[220px]"
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Tìm tiêu đề chủ đề..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-56"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as DiscussionStatus | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa</label>
          <select
            value={lockedFilter}
            onChange={(e) => { setLockedFilter(e.target.value as '' | 'true' | 'false'); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="false">Đang mở</option>
            <option value="true">Đã khóa</option>
          </select>
        </div>
        {(search || statusFilter || lockedFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!courseId}>
          Thêm chủ đề
        </Button>
      </div>

      {!courseId ? (
        <div className="flex flex-col items-center justify-center py-12 text-[rgb(var(--text-muted))]">
          <BookOpen className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">Vui lòng chọn khóa học để xem danh sách chủ đề thảo luận</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-14">STT</TableHeadCell>
                <TableHeadCell>Tiêu đề chủ đề</TableHeadCell>
                <TableHeadCell>Bài học</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell>Cập nhật</TableHeadCell>
                <TableHeadCell className="text-right w-40">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton colSpan={6} rows={5} />
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">
                    Chưa có chủ đề thảo luận nào
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, i) => {
                  const sb = statusBadge(item.status);
                  const course = courseMap.get(item.learning_course_id);
                  return (
                    <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                      <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                        {(page - 1) * pageSize + i + 1}
                      </TableCell>
                      <TableCell className="font-medium max-w-md">
                        <div className="flex items-center gap-2">
                          {item.is_pinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                          {item.is_locked && <Lock className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                          <span className="line-clamp-1">{item.title}</span>
                        </div>
                        {course && (
                          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{course.code}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.lesson ? (
                          <span>{item.lesson.title}</span>
                        ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                      </TableCell>
                      <TableCell>
                        {sb && <Badge variant={sb.variant} size="sm">{sb.label}</Badge>}
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
        title={editing ? 'Sửa chủ đề thảo luận' : 'Thêm chủ đề thảo luận'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo chủ đề'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>
          )}
          <FormField label="Tiêu đề chủ đề" error={errors.title} required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Q&A cho bài tập tuần 1" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Khóa học" error={errors.learning_course_id} required>
              <select
                value={form.learning_course_id || ''}
                onChange={(e) => setForm({ ...form, learning_course_id: e.target.value ? Number(e.target.value) : 0, lesson_id: null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">— Chọn khóa học —</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Bài học (không bắt buộc)" hint="Gắn chủ đề vào một bài học cụ thể">
              <select
                value={form.lesson_id ?? ''}
                onChange={(e) => setForm({ ...form, lesson_id: e.target.value ? Number(e.target.value) : null })}
                disabled={!form.learning_course_id || lessonsLoading}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm disabled:opacity-50"
              >
                <option value="">— Không gắn bài học —</option>
                {courseLessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả / Nội dung">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              placeholder="Mô tả chi tiết nội dung chủ đề, hướng dẫn thảo luận..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
            />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DiscussionStatus })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <div className="flex flex-col gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_pinned}
                  onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                  className="h-4 w-4 rounded border-[rgb(var(--border))] accent-amber-500" />
                <Pin className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-sm">Ghim lên đầu</span>
              </label>
            </div>
            <div className="flex flex-col gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_locked}
                  onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
                  className="h-4 w-4 rounded border-[rgb(var(--border))] accent-red-500" />
                <Lock className="h-3.5 w-3.5 text-red-500" />
                <span className="text-sm">Khóa (không nhận bài mới)</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Xác nhận xóa chủ đề"
        description={`Bạn có chắc muốn xóa chủ đề "${deleting?.title}"? Tất cả bài viết trong chủ đề cũng sẽ bị xóa.`}
        confirmText="Xóa" variant="danger" loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết chủ đề thảo luận" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b flex-wrap">
              {detailData.data.is_pinned && (
                <Badge variant="warning" size="sm" className="gap-1"><Pin className="h-3 w-3" /> Ghim</Badge>
              )}
              {detailData.data.is_locked && (
                <Badge variant="error" size="sm" className="gap-1"><Lock className="h-3 w-3" /> Khóa</Badge>
              )}
              <h3 className="text-lg font-bold">{detailData.data.title}</h3>
              {statusBadge(detailData.data.status) && (
                <Badge variant={statusBadge(detailData.data.status)!.variant} size="sm">
                  {statusBadge(detailData.data.status)!.label}
                </Badge>
              )}
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
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Bài học</p>
                <p className="font-medium">{detailData.data.lesson?.title ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Người tạo</p>
                <p className="font-medium">{detailData.data.creator?.full_name ?? `User #${detailData.data.created_by ?? '?'}`}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Cập nhật lần cuối</p>
                <p className="font-medium">{detailData.data.updated_at ? formatDateVietnam(detailData.data.updated_at) : '—'}</p>
              </div>
            </div>
            {detailData.data.description && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
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

export default DiscussionTopicSheet;
