import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, RotateCcw,
  FileText, Link2, Upload, Type, BookOpen, FolderTree,
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
  useAssignments,
  useAssignment,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
} from '@/hooks/useLmsPart3';
import { useLearningCourses, useCourseModules, useLessons } from '@/hooks/useLms';
import { formatDateVietnam } from '@/utils/formatters';
import type {
  Assignment,
  AssignmentCreatePayload,
  AssignmentType,
  AssignmentStatus,
  AssignmentListParams,
  LearningCourse,
  CourseModule,
  Lesson,
} from '@/types/lms.types';

const ASSIGNMENT_TYPE_OPTS: { value: AssignmentType; label: string; icon: React.ReactNode }[] = [
  { value: 'file', label: 'Nộp file', icon: <FileText className="h-3.5 w-3.5" /> },
  { value: 'text', label: 'Viết text', icon: <Type className="h-3.5 w-3.5" /> },
  { value: 'url', label: 'Nộp URL', icon: <Link2 className="h-3.5 w-3.5" /> },
  { value: 'mixed', label: 'Kết hợp', icon: <Upload className="h-3.5 w-3.5" /> },
];

const STATUS_OPTS: { value: AssignmentStatus; label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }[] = [
  { value: 'active', label: 'Đang mở', variant: 'success' },
  { value: 'inactive', label: 'Tạm đóng', variant: 'warning' },
];

const TYPE_LABEL: Record<string, string> = {
  file: 'Nộp file',
  text: 'Viết text',
  url: 'Nộp URL',
  mixed: 'Kết hợp',
};

const emptyForm = (): Omit<AssignmentCreatePayload, 'title' | 'assignment_type'> & {
  title: string;
  assignment_type: AssignmentType;
} => ({
  title: '',
  description: null,
  learning_course_id: null,
  lesson_id: null,
  assignment_type: 'file',
  open_at: null,
  due_at: null,
  close_at: null,
  max_score: null,
  max_attempts: null,
  allow_late_submission: false,
  allow_resubmission: false,
  status: 'active',
});

export function AssignmentSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  // Filters: Course → CourseModule → Lesson → Assignment
  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);
  const [lessonId, setLessonId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssignmentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('');

  // Lookup lists
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses: LearningCourse[] = Array.isArray(coursesData?.data) ? coursesData.data : [];

  const { data: modulesData } = useCourseModules(
    courseId ? { learning_course_id: courseId, per_page: 100 } : undefined
  );
  const modules: CourseModule[] = Array.isArray(modulesData?.data) ? modulesData.data : [];

  const { data: lessonsData } = useLessons(
    moduleId ? { course_module_id: moduleId, per_page: 100 } : undefined
  );
  const lessons: Lesson[] = Array.isArray(lessonsData?.data) ? lessonsData.data : [];

  // Auto-select first items
  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].id);
  }, [courses, courseId]);

  useEffect(() => {
    if (courseId && !moduleId && modules.length > 0) setModuleId(modules[0].id);
    if (!courseId) { setModuleId(undefined); setLessonId(undefined); }
  }, [courseId, modules, moduleId]);

  useEffect(() => {
    if (moduleId && !lessonId && lessons.length > 0) setLessonId(lessons[0].id);
    if (!moduleId) setLessonId(undefined);
  }, [moduleId, lessons, lessonId]);

  const params: AssignmentListParams = useMemo(() => ({
    page,
    per_page: pageSize,
    learning_course_id: courseId,
    lesson_id: lessonId,
    title: search || undefined,
    assignment_type: typeFilter || undefined,
    status: statusFilter || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  }), [page, pageSize, courseId, lessonId, search, typeFilter, statusFilter]);

  const { data, isLoading, isFetching } = useAssignments(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Assignment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<ReturnType<typeof emptyForm>>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useAssignment(detailId ?? undefined);
  const createMut = useCreateAssignment();
  const updateMut = useUpdateAssignment();
  const deleteMut = useDeleteAssignment();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm(),
      learning_course_id: courseId ?? null,
      lesson_id: lessonId ?? null,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Assignment) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      learning_course_id: item.learning_course_id,
      lesson_id: item.lesson_id,
      assignment_type: item.assignment_type ?? 'file',
      open_at: item.open_at ? item.open_at.replace(' ', 'T').slice(0, 16) : null,
      due_at: item.due_at ? item.due_at.replace(' ', 'T').slice(0, 16) : null,
      close_at: item.close_at ? item.close_at.replace(' ', 'T').slice(0, 16) : null,
      max_score: item.max_score,
      max_attempts: item.max_attempts,
      allow_late_submission: item.allow_late_submission,
      allow_resubmission: item.allow_resubmission,
      status: item.status ?? 'active',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Assignment) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: Assignment) => { setDeleting(item); setDeleteOpen(true); };

  const resetFilters = () => {
    setSearch(''); setTypeFilter(''); setStatusFilter(''); setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề bài tập không được để trống';
    if (!form.learning_course_id) e.learning_course_id = 'Vui lòng chọn khóa học';
    if (!form.lesson_id) e.lesson_id = 'Vui lòng chọn bài học';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: AssignmentCreatePayload = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        // Convert datetime-local (YYYY-MM-DDTHH:MM) to API format (YYYY-MM-DD HH:MM:SS)
        open_at: form.open_at ? form.open_at.replace('T', ' ') + ':00' : null,
        due_at: form.due_at ? form.due_at.replace('T', ' ') + ':00' : null,
        close_at: form.close_at ? form.close_at.replace('T', ' ') + ':00' : null,
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
    try { await deleteMut.mutateAsync(deleting.id); setDeleteOpen(false); setDeleting(null); }
    catch (_) {}
  };

  const statusBadge = (s: AssignmentStatus | null | undefined) => STATUS_OPTS.find(o => o.value === s);

  const canList = !!(courseId && moduleId && lessonId);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select
            value={courseId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              setCourseId(val);
              setModuleId(undefined);
              setLessonId(undefined);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px]"
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Chương học</label>
          <select
            value={moduleId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              setModuleId(val);
              setLessonId(undefined);
              setPage(1);
            }}
            disabled={!courseId}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[180px] disabled:opacity-50"
          >
            <option value="">— Chọn chương —</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Bài học</label>
          <select
            value={lessonId ?? ''}
            onChange={(e) => { setLessonId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            disabled={!moduleId}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[180px] disabled:opacity-50"
          >
            <option value="">— Chọn bài học —</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Tìm tiêu đề bài tập..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-56"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Loại nộp</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as AssignmentType | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {ASSIGNMENT_TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as AssignmentStatus | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {(search || typeFilter || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!canList}>
          Thêm bài tập
        </Button>
      </div>

      {!canList ? (
        <div className="flex flex-col items-center justify-center py-12 text-[rgb(var(--text-muted))]">
          <BookOpen className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">Vui lòng chọn khóa học, chương học và bài học để xem danh sách bài tập</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-14">STT</TableHeadCell>
                <TableHeadCell>Tiêu đề bài tập</TableHeadCell>
                <TableHeadCell>Loại nộp</TableHeadCell>
                <TableHeadCell>Thời hạn</TableHeadCell>
                <TableHeadCell>Điểm tối đa</TableHeadCell>
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
                    Chưa có bài tập nào cho bài học này
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
                      <TableCell className="font-medium max-w-xs">
                        <span className="line-clamp-1">{item.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" size="sm">{TYPE_LABEL[item.assignment_type ?? ''] ?? '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.due_at ? <span className="text-[rgb(var(--text-muted))]">{formatDateVietnam(item.due_at)}</span> : <span className="text-[rgb(var(--text-muted))]">—</span>}
                      </TableCell>
                      <TableCell className="font-mono">{item.max_score != null ? item.max_score : '—'}</TableCell>
                      <TableCell>{sb && <Badge variant={sb.variant} size="sm">{sb.label}</Badge>}</TableCell>
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
        title={editing ? 'Sửa bài tập' : 'Thêm bài tập mới'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo bài tập'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>
          )}
          <FormField label="Tiêu đề bài tập" error={errors.title} required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Bài tập 1 — HTML Form" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Khóa học" error={errors.learning_course_id} required>
              <select
                value={form.learning_course_id ?? ''}
                onChange={(e) => setForm({ ...form, learning_course_id: e.target.value ? Number(e.target.value) : null, lesson_id: null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">— Chọn khóa học —</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Bài học" error={errors.lesson_id} required>
              <select
                value={form.lesson_id ?? ''}
                onChange={(e) => setForm({ ...form, lesson_id: e.target.value ? Number(e.target.value) : null })}
                disabled={!form.learning_course_id}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm disabled:opacity-50"
              >
                <option value="">— Chọn bài học —</option>
                {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả / Hướng dẫn">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              placeholder="Mô tả chi tiết bài tập, yêu cầu, tiêu chí chấm điểm..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
            />
          </FormField>
          <FormField label="Loại nộp bài">
            <div className="flex gap-2 flex-wrap">
              {ASSIGNMENT_TYPE_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, assignment_type: opt.value })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    form.assignment_type === opt.value
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                      : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))]/50'
                  }`}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AssignmentStatus })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Điểm tối đa">
              <Input type="number" min={0} value={form.max_score ?? ''}
                onChange={(e) => setForm({ ...form, max_score: e.target.value ? Number(e.target.value) : null })}
                placeholder="VD: 10" />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Ngày mở">
              <Input type="datetime-local" value={form.open_at ?? ''}
                onChange={(e) => setForm({ ...form, open_at: e.target.value || null })} />
            </FormField>
            <FormField label="Hạn nộp">
              <Input type="datetime-local" value={form.due_at ?? ''}
                onChange={(e) => setForm({ ...form, due_at: e.target.value || null })} />
            </FormField>
            <FormField label="Đóng sau hạn">
              <Input type="datetime-local" value={form.close_at ?? ''}
                onChange={(e) => setForm({ ...form, close_at: e.target.value || null })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số lần nộp tối đa">
              <Input type="number" min={1} value={form.max_attempts ?? ''}
                onChange={(e) => setForm({ ...form, max_attempts: e.target.value ? Number(e.target.value) : null })}
                placeholder="Không giới hạn" />
            </FormField>
            <div className="flex flex-col gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.allow_late_submission}
                  onChange={(e) => setForm({ ...form, allow_late_submission: e.target.checked })}
                  className="h-4 w-4 rounded border-[rgb(var(--border))]" />
                <span className="text-sm">Cho phép nộp trễ</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.allow_resubmission}
                  onChange={(e) => setForm({ ...form, allow_resubmission: e.target.checked })}
                  className="h-4 w-4 rounded border-[rgb(var(--border))]" />
                <span className="text-sm">Cho phép nộp lại</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Xác nhận xóa bài tập"
        description={`Bạn có chắc muốn xóa bài tập "${deleting?.title}"?`}
        confirmText="Xóa" variant="danger" loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết bài tập" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-lg font-bold">{detailData.data.title}</h3>
              {statusBadge(detailData.data.status) && (
                <Badge variant={statusBadge(detailData.data.status)!.variant} size="sm">{statusBadge(detailData.data.status)!.label}</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại nộp bài</p>
                <p className="font-medium">{TYPE_LABEL[detailData.data.assignment_type ?? ''] ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Điểm tối đa</p>
                <p className="font-medium font-mono">{detailData.data.max_score ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Hạn nộp</p>
                <p className="font-medium">{formatDateVietnam(detailData.data.due_at)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số lần nộp tối đa</p>
                <p className="font-medium">{detailData.data.max_attempts ?? 'Không giới hạn'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nộp trễ</p>
                <p className="font-medium">{detailData.data.allow_late_submission ? 'Có' : 'Không'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nộp lại</p>
                <p className="font-medium">{detailData.data.allow_resubmission ? 'Có' : 'Không'}</p>
              </div>
            </div>
            {detailData.data.description && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả / Hướng dẫn</p>
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

export default AssignmentSheet;
