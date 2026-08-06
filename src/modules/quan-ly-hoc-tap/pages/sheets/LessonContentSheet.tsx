import { useState, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, RotateCcw,
  FileText, FileVideo, Image as ImageIcon, FileCode, Link2, Archive, Download, ExternalLink, Clock,
  Music,
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
  useLessonContents,
  useDeleteLessonContent,
  useCourseModules,
  useLessons,
  useLearningCourses,
} from '@/hooks/useLms';
import {
  useLessonContent,
  useCreateLessonContent,
  useUpdateLessonContent,
  useReorderLessonContents,
} from '@/hooks/useLmsPart2';
import { lessonContentsApi } from '@/services/lmsApi';
import { useNotificationStore } from '@/stores/notificationStore';
import type {
  LessonContent,
  LessonContentCreatePayload,
  LessonContentListParams,
  LessonContentType,
  LmsStatus,
} from '@/types/lms.types';

const TYPE_OPTS: { value: LessonContentType; label: string; needsFile: boolean }[] = [
  { value: 'pdf', label: 'PDF', needsFile: true },
  { value: 'slide', label: 'Slide', needsFile: true },
  { value: 'document', label: 'Tài liệu', needsFile: true },
  { value: 'source_code', label: 'Source code', needsFile: true },
  { value: 'image', label: 'Hình ảnh', needsFile: true },
  { value: 'audio', label: 'Âm thanh', needsFile: true },
  { value: 'video', label: 'Video (URL)', needsFile: false },
  { value: 'link', label: 'Liên kết ngoài', needsFile: false },
];

const STATUS_OPTS: { value: LmsStatus; label: string; variant: 'success' | 'neutral' }[] = [
  { value: 'active', label: 'Hoạt động', variant: 'success' },
  { value: 'inactive', label: 'Ngừng', variant: 'neutral' },
];

const TYPE_LABEL: Record<string, { label: string; icon: React.ReactNode; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  pdf: { label: 'PDF', icon: <FileText className="h-3 w-3" />, variant: 'info' },
  slide: { label: 'Slide', icon: <FileText className="h-3 w-3" />, variant: 'info' },
  document: { label: 'Document', icon: <FileText className="h-3 w-3" />, variant: 'neutral' },
  source_code: { label: 'Code', icon: <FileCode className="h-3 w-3" />, variant: 'warning' },
  image: { label: 'Hình ảnh', icon: <ImageIcon className="h-3 w-3" />, variant: 'success' },
  audio: { label: 'Âm thanh', icon: <Music className="h-3 w-3" />, variant: 'info' },
  video: { label: 'Video', icon: <FileVideo className="h-3 w-3" />, variant: 'error' },
  link: { label: 'Liên kết', icon: <Link2 className="h-3 w-3" />, variant: 'info' },
};

const emptyForm = (): LessonContentCreatePayload => ({
  title: '',
  lesson_id: null,
  content_type: 'pdf',
  content: null,
  external_url: null,
  duration: null,
  is_downloadable: true,
  status: 'active',
  file: null,
});

export function LessonContentSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | null>(null);
  const [moduleFilter, setModuleFilter] = useState<number | null>(null);
  const [lessonFilter, setLessonFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<LessonContentType | ''>('');

  // Lookup khóa học
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses = Array.isArray(coursesData?.data) ? coursesData.data : [];

  // Modules phụ thuộc vào khóa học
  const { data: modulesData } = useCourseModules(
    courseFilter ? { per_page: 100, learning_course_id: courseFilter, sort_by: 'display_order' } : { per_page: 1 }
  );
  const modules = Array.isArray(modulesData?.data) ? modulesData.data : [];

  // Lessons phụ thuộc vào module
  const { data: lessonsData } = useLessons(
    moduleFilter ? { per_page: 100, course_module_id: moduleFilter, sort_by: 'display_order' } : { per_page: 1 }
  );
  const lessons = Array.isArray(lessonsData?.data) ? lessonsData.data : [];
  const lessonMap = useMemo(() => Object.fromEntries(lessons.map((l) => [l.id, l])), [lessons]);

  const params: LessonContentListParams | undefined = lessonFilter
    ? {
        page,
        per_page: pageSize,
        title: search || undefined,
        lesson_id: lessonFilter,
        content_type: typeFilter || undefined,
        sort_by: 'display_order',
        sort_direction: 'asc',
      }
    : undefined;

  const { data, isLoading, isFetching } = useLessonContents(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LessonContent | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<LessonContent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<LessonContentCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useLessonContent(detailId ?? undefined);
  const createMut = useCreateLessonContent();
  const updateMut = useUpdateLessonContent();
  const deleteMut = useDeleteLessonContent();
  const notify = useNotificationStore();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const typeMeta = TYPE_OPTS.find((t) => t.value === form.content_type);
  const needsFile = typeMeta?.needsFile ?? true;

  // Lessons thuộc module đang chọn (cascade)
  const selectedModuleId = form.lesson_id ? lessonMap[form.lesson_id]?.course_module_id : null;
  const filteredLessons = selectedModuleId
    ? lessons.filter((l) => l.course_module_id === selectedModuleId)
    : lessons;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: LessonContent) => {
    setEditing(item);
    setForm({
      title: item.title,
      lesson_id: item.lesson_id,
      content_type: (item.content_type ?? 'pdf') as LessonContentType,
      content: item.content,
      external_url: item.external_url,
      duration: item.duration,
      is_downloadable: !!item.is_downloadable,
      status: (item.status ?? 'active') as LmsStatus,
      file: null,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: LessonContent) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: LessonContent) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setCourseFilter(null);
    setModuleFilter(null);
    setLessonFilter(null);
    setTypeFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!form.lesson_id) e.lesson_id = 'Vui lòng chọn bài học';
    if (!form.content_type) e.content_type = 'Vui lòng chọn loại nội dung';
    if (form.content_type === 'video' || form.content_type === 'link') {
      if (!form.external_url?.trim()) e.external_url = 'Video/Link yêu cầu URL ngoài';
    } else if (!editing && !form.file) {
      e.file = 'Vui lòng chọn file đính kèm';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: LessonContentCreatePayload = {
        ...form,
        title: form.title.trim(),
        content: form.content?.trim() || null,
        external_url: form.external_url?.trim() || null,
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

  const handleDownload = async (item: LessonContent) => {
    try {
      const blob = await lessonContentsApi.download(item.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.file_path?.split('/').pop() || item.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Tải xuống thất bại' });
    }
  };

  const statusBadge = (s: LmsStatus | null) => STATUS_OPTS.find((o) => o.value === s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tiêu đề nội dung..."
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
              setModuleFilter(null);
              setLessonFilter(null);
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
              const val = e.target.value ? Number(e.target.value) : null;
              setModuleFilter(val);
              setLessonFilter(null);
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
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Bài học</label>
          <select
            value={lessonFilter ?? ''}
            onChange={(e) => {
              setLessonFilter(e.target.value ? Number(e.target.value) : null);
              setPage(1);
            }}
            disabled={!moduleFilter}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px] disabled:opacity-50"
          >
            <option value="">— Chọn bài học —</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Loại</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as LessonContentType | '');
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]"
          >
            <option value="">Tất cả</option>
            {TYPE_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {(search || courseFilter || moduleFilter || lessonFilter || typeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!lessonFilter}>
          Thêm nội dung
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Tiêu đề</TableHeadCell>
            <TableHeadCell>Bài học</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Tải về</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-44">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!lessonFilter ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-[rgb(var(--text-muted))]" />
                  <p className="text-[rgb(var(--text-muted))]">Vui lòng chọn bài học để xem danh sách nội dung</p>
                </div>
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có nội dung bài học nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sb = statusBadge(item.status);
              const tMeta = TYPE_LABEL[item.content_type ?? ''] ?? { label: '—', icon: null, variant: 'neutral' as const };
              const lesson = lessonMap[item.lesson_id ?? -1];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      <span className="line-clamp-1">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lesson ? (
                      <span className="line-clamp-1">{lesson.title}</span>
                    ) : (
                      <span className="text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tMeta.variant} size="sm">
                      <span className="inline-flex items-center gap-1">
                        {tMeta.icon}
                        {tMeta.label}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.is_downloadable ? (
                      <Badge variant="success" size="sm">Có</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Không</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {sb && <Badge variant={sb.variant} size="sm">{sb.label}</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.is_downloadable && item.content_type !== 'video' && item.content_type !== 'link' && (
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(item)} title="Tải xuống">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {(item.content_type === 'video' || item.content_type === 'link') && item.external_url && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(item.external_url!, '_blank')} title="Mở liên kết">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
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
        title={editing ? 'Sửa nội dung bài học' : 'Thêm nội dung bài học'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              {editing ? 'Lưu thay đổi' : 'Tải lên'}
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
          <FormField label="Tiêu đề" error={errors.title} required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Video bài giảng HTML5"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Bài học" error={errors.lesson_id} required>
              <select
                value={form.lesson_id ?? ''}
                onChange={(e) => setForm({ ...form, lesson_id: e.target.value ? Number(e.target.value) : null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">— Chọn bài học —</option>
                {filteredLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Loại nội dung" error={errors.content_type} required>
              <select
                value={form.content_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content_type: e.target.value as LessonContentType,
                    file: null,
                    external_url: null,
                  })
                }
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {TYPE_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          {needsFile ? (
            <FormField label={`File đính kèm (tối đa 500MB)${editing ? ' — để trống nếu không đổi' : ''}`} error={errors.file}>
              <input
                type="file"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                className="block w-full text-sm text-[rgb(var(--text-muted))] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgb(var(--primary))]/10 file:text-[rgb(var(--primary))] hover:file:bg-[rgb(var(--primary))]/20 cursor-pointer"
              />
              {editing && editing.file_path && !form.file && (
                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                  File hiện tại: <span className="font-mono">{editing.file_path.split('/').pop()}</span>
                </p>
              )}
            </FormField>
          ) : (
            <FormField label="URL ngoài (YouTube / Drive / ...)" error={errors.external_url} required>
              <Input
                value={form.external_url ?? ''}
                onChange={(e) => setForm({ ...form, external_url: e.target.value || null })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </FormField>
          )}
          <FormField label="Mô tả / Nội dung văn bản">
            <textarea
              value={form.content ?? ''}
              onChange={(e) => setForm({ ...form, content: e.target.value || null })}
              placeholder="Nội dung mô tả chi tiết (tùy chọn)"
              rows={2}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
            />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Thời lượng (giây)">
              <Input
                type="number"
                value={form.duration ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status ?? 'active'}
                onChange={(e) => setForm({ ...form, status: e.target.value as LmsStatus })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
            <label className="flex items-end gap-2 text-sm cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.is_downloadable ?? true}
                onChange={(e) => setForm({ ...form, is_downloadable: e.target.checked })}
                className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
              />
              <span>Cho phép tải về</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa nội dung"
        description={`Bạn có chắc muốn xóa nội dung "${deleting?.title}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết nội dung bài học" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b flex-wrap">
              <FileText className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.title}</h3>
              {(() => {
                const tMeta = TYPE_LABEL[detailData.data.content_type ?? ''];
                return tMeta ? <Badge variant={tMeta.variant} size="sm">{tMeta.label}</Badge> : null;
              })()}
              {(() => {
                const sb = statusBadge(detailData.data.status);
                return sb ? <Badge variant={sb.variant} size="sm">{sb.label}</Badge> : null;
              })()}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Bài học</p>
                <p className="font-medium">
                  {(() => {
                    const l = lessonMap[detailData.data.lesson_id ?? -1];
                    return l ? l.title : `#${detailData.data.lesson_id}`;
                  })()}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thời lượng</p>
                <p className="font-medium">{detailData.data.duration ? `${detailData.data.duration} giây` : '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tải về</p>
                <p className="font-medium">{detailData.data.is_downloadable ? 'Cho phép' : 'Không'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thứ tự</p>
                <p className="font-medium">{detailData.data.display_order ?? 0}</p>
              </div>
              {(detailData.data.file_path || detailData.data.external_url) && (
                <div className="col-span-2 bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">File / URL</p>
                  <p className="font-mono text-sm break-all">
                    {detailData.data.external_url ?? detailData.data.file_path}
                  </p>
                </div>
              )}
            </div>
            {detailData.data.content && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nội dung</p>
                <p className="text-sm whitespace-pre-wrap">{detailData.data.content}</p>
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

export default LessonContentSheet;
