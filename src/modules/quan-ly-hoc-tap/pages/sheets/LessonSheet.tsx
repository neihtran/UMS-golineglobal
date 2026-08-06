import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, Layers, FileText, Clock, EyeOff, CheckCircle2 } from 'lucide-react';
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
  useLessons,
  useLesson,
  useDeleteLesson,
  useCourseModules,
  useLearningCourses,
} from '@/hooks/useLms';
import {
  useCreateLesson,
  useUpdateLesson,
  useReorderLessons,
} from '@/hooks/useLmsPart2';
import { useNotificationStore } from '@/stores/notificationStore';
import type {
  Lesson,
  LessonListParams,
  LessonType,
  LmsStatus,
} from '@/types/lms.types';

const LESSON_TYPE_OPTS: { value: LessonType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Tài liệu' },
  { value: 'reading', label: 'Đọc' },
  { value: 'practice', label: 'Thực hành' },
  { value: 'assignment', label: 'Bài tập' },
];

const STATUS_OPTS: { value: LmsStatus; label: string; variant: 'success' | 'neutral' }[] = [
  { value: 'active', label: 'Hoạt động', variant: 'success' },
  { value: 'inactive', label: 'Ngừng', variant: 'neutral' },
];

const LESSON_TYPE_LABEL: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  video: { label: 'Video', variant: 'error' },
  document: { label: 'Tài liệu', variant: 'info' },
  reading: { label: 'Đọc', variant: 'neutral' },
  practice: { label: 'Thực hành', variant: 'warning' },
  assignment: { label: 'Bài tập', variant: 'success' },
};

interface LessonFormState {
  title: string;
  summary: string | null;
  course_module_id: number | null;
  lesson_type: LessonType;
  estimated_minutes: number | null;
  display_order: number;
  is_preview: boolean;
  is_published: boolean;
  status: LmsStatus;
}

const emptyForm = (): LessonFormState => ({
  title: '',
  summary: null,
  course_module_id: null,
  lesson_type: 'video',
  estimated_minutes: null,
  display_order: 0,
  is_preview: false,
  is_published: true,
  status: 'active',
});

export function LessonSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | null>(null);
  const [moduleFilter, setModuleFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<LessonType | ''>('');

  // Lookup danh sách khóa học
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses = Array.isArray(coursesData?.data) ? coursesData.data : [];

  // Modules phụ thuộc vào khóa học đã chọn
  const { data: modulesData } = useCourseModules(
    courseFilter ? { per_page: 100, learning_course_id: courseFilter, sort_by: 'display_order' } : { per_page: 1 }
  );
  const modules = Array.isArray(modulesData?.data) ? modulesData.data : [];
  const moduleMap = useMemo(() => Object.fromEntries(modules.map((m) => [m.id, m])), [modules]);

  const params: LessonListParams | undefined = moduleFilter
    ? {
        page,
        per_page: pageSize,
        title: search || undefined,
        course_module_id: moduleFilter,
        lesson_type: typeFilter || undefined,
        sort_by: 'display_order',
        sort_direction: 'asc',
      }
    : undefined;

  const { data, isLoading, isFetching } = useLessons(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Lesson | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<LessonFormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useLesson(detailId ?? undefined);
  const createMut = useCreateLesson();
  const updateMut = useUpdateLesson();
  const deleteMut = useDeleteLesson();
  const notify = useNotificationStore();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Lesson) => {
    setEditing(item);
    setForm({
      title: item.title,
      summary: item.summary,
      course_module_id: item.course_module_id,
      lesson_type: (item.lesson_type ?? 'video') as LessonType,
      estimated_minutes: item.estimated_minutes,
      display_order: item.display_order ?? 0,
      is_preview: !!item.is_preview,
      is_published: !!item.is_published,
      status: (item.status ?? 'active') as LmsStatus,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Lesson) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Lesson) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setCourseFilter(null);
    setModuleFilter(null);
    setTypeFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!form.course_module_id) e.course_module_id = 'Vui lòng chọn chương học';
    if (!form.lesson_type) e.lesson_type = 'Vui lòng chọn loại bài học';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload = {
        title: form.title.trim(),
        summary: form.summary?.trim() || null,
        course_module_id: form.course_module_id,
        lesson_type: form.lesson_type,
        estimated_minutes: form.estimated_minutes,
        display_order: form.display_order,
        is_preview: form.is_preview,
        is_published: form.is_published,
        status: form.status,
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
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Không thể xóa' });
    }
  };

  const statusBadge = (s: LmsStatus | null) => STATUS_OPTS.find((o) => o.value === s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tiêu đề bài học..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select
            value={courseFilter ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setCourseFilter(val);
              setModuleFilter(null); // Reset module when course changes
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px]"
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} – {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Chương học</label>
          <select
            value={moduleFilter ?? ''}
            onChange={(e) => {
              setModuleFilter(e.target.value ? Number(e.target.value) : null);
              setPage(1);
            }}
            disabled={!courseFilter}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px] disabled:opacity-50"
          >
            <option value="">— Chọn chương —</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Loại</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as LessonType | '');
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]"
          >
            <option value="">Tất cả</option>
            {LESSON_TYPE_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {(search || moduleFilter || courseFilter || typeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!moduleFilter}>
          Thêm bài học
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Tiêu đề</TableHeadCell>
            <TableHeadCell>Chương học</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Thời lượng</TableHeadCell>
            <TableHeadCell>Hiển thị</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-44">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!moduleFilter ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Layers className="h-8 w-8 text-[rgb(var(--text-muted))]" />
                  <p className="text-[rgb(var(--text-muted))]">Vui lòng chọn chương học để xem danh sách bài học</p>
                </div>
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có bài học nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sb = statusBadge(item.status);
              const tMeta = LESSON_TYPE_LABEL[item.lesson_type ?? ''] ?? { label: '—', variant: 'neutral' as const };
              const mod = moduleMap[item.course_module_id ?? -1];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      <span className="line-clamp-1">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {mod ? (
                      <span className="line-clamp-1">{mod.title}</span>
                    ) : (
                      <span className="text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tMeta.variant} size="sm">{tMeta.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.estimated_minutes ? (
                      <span className="inline-flex items-center gap-1 text-[rgb(var(--text-muted))]">
                        <Clock className="h-3 w-3" /> {item.estimated_minutes} phút
                      </span>
                    ) : (
                      <span className="text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.is_published ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          <EyeOff className="h-3 w-3 mr-1" /> Draft
                        </Badge>
                      )}
                      {item.is_preview && (
                        <Badge variant="info" size="sm">Preview</Badge>
                      )}
                    </div>
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
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa bài học' : 'Thêm bài học'}
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
          <FormField label="Tiêu đề bài học" error={errors.title} required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Bài 1: Giới thiệu về HTML5"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Chương học" error={errors.course_module_id} required>
              <select
                value={form.course_module_id ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    course_module_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">— Chọn chương —</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Loại bài học" error={errors.lesson_type} required>
              <select
                value={form.lesson_type}
                onChange={(e) => setForm({ ...form, lesson_type: e.target.value as LessonType })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {LESSON_TYPE_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Tóm tắt">
            <textarea
              value={form.summary ?? ''}
              onChange={(e) => setForm({ ...form, summary: e.target.value || null })}
              placeholder="Tóm tắt nội dung bài học"
              rows={2}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
            />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Thứ tự hiển thị">
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label="Thời lượng (phút)">
              <Input
                type="number"
                value={form.estimated_minutes ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimated_minutes: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LmsStatus })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
              />
              <span>Xuất bản ngay</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_preview}
                onChange={(e) => setForm({ ...form, is_preview: e.target.checked })}
                className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
              />
              <span>Cho phép học thử</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bài học"
        description={`Bạn có chắc muốn xóa bài học "${deleting?.title}"? Nội dung bài học và bài tập liên quan có thể bị xóa theo.`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết bài học" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b flex-wrap">
              <Layers className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.title}</h3>
              {(() => {
                const tMeta = LESSON_TYPE_LABEL[detailData.data.lesson_type ?? ''];
                return tMeta ? <Badge variant={tMeta.variant} size="sm">{tMeta.label}</Badge> : null;
              })()}
              {detailData.data.is_published ? (
                <Badge variant="success" size="sm">Đã xuất bản</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Nháp</Badge>
              )}
              {detailData.data.is_preview && <Badge variant="info" size="sm">Preview</Badge>}
              {(() => {
                const sb = statusBadge(detailData.data.status);
                return sb ? <Badge variant={sb.variant} size="sm">{sb.label}</Badge> : null;
              })()}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chương học</p>
                <p className="font-medium">
                  {(() => {
                    const m = moduleMap[detailData.data.course_module_id ?? -1];
                    return m ? m.title : `#${detailData.data.course_module_id}`;
                  })()}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thời lượng ước tính</p>
                <p className="font-medium">{detailData.data.estimated_minutes ? `${detailData.data.estimated_minutes} phút` : '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thứ tự</p>
                <p className="font-medium">{detailData.data.display_order}</p>
              </div>
            </div>
            {detailData.data.summary && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Tóm tắt
                </p>
                <p className="text-sm whitespace-pre-wrap">{detailData.data.summary}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => {
                setDetailOpen(false);
                openEdit(detailData.data);
              }}>
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

export default LessonSheet;
