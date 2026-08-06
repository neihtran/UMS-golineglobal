import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, FileText, Download, ExternalLink, FileVideo, Image as ImageIcon, Archive, Link2, FileCode } from 'lucide-react';
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
  useCourseMaterials,
  useCourseMaterial,
  useCreateCourseMaterial,
  useUpdateCourseMaterial,
  useDeleteCourseMaterial,
  useLearningCourses,
} from '@/hooks/useLms';
import { courseMaterialsApi } from '@/services/lmsApi';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDateTimeVietnam } from '@/utils/formatters';
import type {
  CourseMaterial,
  CourseMaterialCreatePayload,
  CourseMaterialListParams,
  CourseMaterialType,
  LmsStatus,
} from '@/types/lms.types';

const TYPE_OPTS: { value: CourseMaterialType; label: string; icon: React.ReactNode; needsFile: boolean }[] = [
  { value: 'pdf', label: 'PDF', icon: <FileText className="h-3.5 w-3.5" />, needsFile: true },
  { value: 'slide', label: 'Slide', icon: <FileText className="h-3.5 w-3.5" />, needsFile: true },
  { value: 'document', label: 'Tài liệu', icon: <FileText className="h-3.5 w-3.5" />, needsFile: true },
  { value: 'source_code', label: 'Source code', icon: <FileCode className="h-3.5 w-3.5" />, needsFile: true },
  { value: 'archive', label: 'Lưu trữ (zip)', icon: <Archive className="h-3.5 w-3.5" />, needsFile: true },
  { value: 'image', label: 'Hình ảnh', icon: <ImageIcon className="h-3.5 w-3.5" />, needsFile: true },
  { value: 'video', label: 'Video (URL)', icon: <FileVideo className="h-3.5 w-3.5" />, needsFile: false },
  { value: 'link', label: 'Liên kết ngoài', icon: <Link2 className="h-3.5 w-3.5" />, needsFile: false },
];

const STATUS_OPTS: { value: LmsStatus; label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }[] = [
  { value: 'active', label: 'Hoạt động', variant: 'success' },
  { value: 'inactive', label: 'Ngừng', variant: 'neutral' },
];

const TYPE_LABEL: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  pdf: { label: 'PDF', variant: 'info' },
  slide: { label: 'Slide', variant: 'info' },
  document: { label: 'Tài liệu', variant: 'neutral' },
  source_code: { label: 'Code', variant: 'warning' },
  archive: { label: 'Archive', variant: 'warning' },
  image: { label: 'Hình ảnh', variant: 'success' },
  video: { label: 'Video', variant: 'error' },
  link: { label: 'Liên kết', variant: 'info' },
};

const formatBytes = (bytes: number | null | undefined) => {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const emptyForm = (): CourseMaterialCreatePayload => ({
  title: '',
  description: null,
  learning_course_id: null,
  material_type: 'pdf',
  file_path: null,
  duration: null,
  display_order: 0,
  is_downloadable: true,
  status: 'active',
  file: null,
});

export function CourseMaterialSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CourseMaterialType | ''>('');
  const [courseFilter, setCourseFilter] = useState<number | null>(null);

  // Lookup danh sách khóa học cho dropdown filter + form
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses = Array.isArray(coursesData?.data) ? coursesData.data : [];
  const courseMap = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);

  const params: CourseMaterialListParams | undefined = courseFilter
    ? {
        page,
        per_page: pageSize,
        title: search || undefined,
        material_type: typeFilter || undefined,
        learning_course_id: courseFilter,
        sort_by: 'created_at',
        sort_direction: 'desc',
      }
    : undefined;

  const { data, isLoading, isFetching } = useCourseMaterials(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CourseMaterial | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<CourseMaterial | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<CourseMaterialCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useCourseMaterial(detailId ?? undefined);
  const createMut = useCreateCourseMaterial();
  const updateMut = useUpdateCourseMaterial();
  const deleteMut = useDeleteCourseMaterial();
  const notify = useNotificationStore();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const typeMeta = TYPE_OPTS.find(t => t.value === form.material_type);
  const needsFile = typeMeta?.needsFile ?? true;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: CourseMaterial) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      learning_course_id: item.learning_course_id,
      material_type: (item.material_type ?? 'pdf') as CourseMaterialType,
      file_path: item.file_path,
      duration: item.duration,
      display_order: item.display_order ?? 0,
      is_downloadable: !!item.is_downloadable,
      status: (item.status ?? 'active') as LmsStatus,
      file: null,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: CourseMaterial) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: CourseMaterial) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCourseFilter(null);
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!form.material_type) e.material_type = 'Vui lòng chọn loại tài liệu';
    // Logic: video|link bắt buộc có file_path, các loại khác bắt buộc có file (khi tạo) hoặc giữ nguyên (khi sửa)
    if (form.material_type === 'video' || form.material_type === 'link') {
      if (!form.file_path?.trim()) e.file_path = 'Video/Link yêu cầu URL ngoài';
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
      const payload: CourseMaterialCreatePayload = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        file_path: form.file_path?.trim() || null,
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

  const handleDownload = async (item: CourseMaterial) => {
    try {
      const blob = await courseMaterialsApi.download(item.id);
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

  const statusBadge = (s: LmsStatus | null) => STATUS_OPTS.find(o => o.value === s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tiêu đề..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Loại</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as CourseMaterialType | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]"
          >
            <option value="">Tất cả</option>
            {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select
            value={courseFilter ?? ''}
            onChange={(e) => { setCourseFilter(e.target.value ? Number(e.target.value) : null); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[180px]"
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
          </select>
        </div>
        {(search || typeFilter || courseFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm học liệu
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Tiêu đề</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Khóa học</TableHeadCell>
            <TableHeadCell>Dung lượng</TableHeadCell>
            <TableHeadCell>Tải về</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-48">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!courseFilter ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-[rgb(var(--text-muted))]" />
                  <p className="text-[rgb(var(--text-muted))]">Vui lòng chọn khóa học để xem danh sách học liệu</p>
                </div>
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có học liệu nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sb = statusBadge(item.status);
              const tMeta = TYPE_LABEL[item.material_type ?? ''] ?? { label: '—', variant: 'neutral' as const };
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
                  <TableCell>
                    <Badge variant={tMeta.variant} size="sm">{tMeta.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {(() => {
                      const c = item.learning_course_id != null ? courseMap[item.learning_course_id] : undefined;
                      return c ? (
                        <span className="font-medium">{c.code} – {c.name}</span>
                      ) : item.learning_course ? (
                        <span className="font-mono text-xs">{item.learning_course.code}</span>
                      ) : (
                        <span className="text-[rgb(var(--text-muted))]">—</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-sm">{formatBytes(item.file_size)}</TableCell>
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
                      {item.is_downloadable && item.material_type !== 'video' && item.material_type !== 'link' && (
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(item)} title="Tải xuống">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {(item.material_type === 'video' || item.material_type === 'link') && item.file_path && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(item.file_path!, '_blank')} title="Mở liên kết">
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
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa học liệu' : 'Thêm học liệu'}
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
              placeholder="VD: Bài giảng Lập trình Web - Chương 1"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Loại tài liệu" error={errors.material_type} required>
              <select
                value={form.material_type}
                onChange={(e) => setForm({ ...form, material_type: e.target.value as CourseMaterialType, file: null, file_path: null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Khóa học">
              <select
                value={form.learning_course_id ?? ''}
                onChange={(e) => setForm({ ...form, learning_course_id: e.target.value ? Number(e.target.value) : null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">— Không gắn —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
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
            <FormField label="URL ngoài (YouTube / Drive / ...)" error={errors.file_path} required>
              <Input
                value={form.file_path ?? ''}
                onChange={(e) => setForm({ ...form, file_path: e.target.value || null })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </FormField>
          )}
          <FormField label="Mô tả">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              placeholder="Mô tả chi tiết tài liệu"
              rows={2}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
            />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Thứ tự hiển thị">
              <Input
                type="number"
                value={form.display_order ?? 0}
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label="Thời lượng (giây)">
              <Input
                type="number"
                value={form.duration ?? ''}
                onChange={(e) => setForm({ ...form, duration: e.target.value ? Number(e.target.value) : null })}
              />
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status ?? 'active'}
                onChange={(e) => setForm({ ...form, status: e.target.value as LmsStatus })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_downloadable ?? true}
              onChange={(e) => setForm({ ...form, is_downloadable: e.target.checked })}
              className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
            />
            <span>Cho phép học viên tải về</span>
          </label>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa học liệu"
        description={`Bạn có chắc muốn xóa học liệu "${deleting?.title}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết học liệu" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.title}</h3>
              {(() => {
                const tMeta = TYPE_LABEL[detailData.data.material_type ?? ''];
                return tMeta ? <Badge variant={tMeta.variant} size="sm">{tMeta.label}</Badge> : null;
              })()}
              {(() => {
                const sb = statusBadge(detailData.data.status);
                return sb ? <Badge variant={sb.variant} size="sm">{sb.label}</Badge> : null;
              })()}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Khóa học</p>
                <p className="font-medium">
                  {(() => {
                    const id = detailData.data.learning_course_id;
                    const c = id != null ? courseMap[id] : undefined;
                    if (c) return `${c.code} – ${c.name}`;
                    if (detailData.data.learning_course) return `${detailData.data.learning_course.code} – ${detailData.data.learning_course.name}`;
                    return '—';
                  })()}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Dung lượng</p>
                <p className="font-medium">{formatBytes(detailData.data.file_size)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tải về</p>
                <p className="font-medium">{detailData.data.is_downloadable ? 'Cho phép' : 'Không'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thứ tự</p>
                <p className="font-medium">{detailData.data.display_order ?? 0}</p>
              </div>
              {detailData.data.file_path && (
                <div className="col-span-2 bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">File / URL</p>
                  <p className="font-mono text-sm break-all">{detailData.data.file_path}</p>
                </div>
              )}
              <div className="col-span-2 bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDateTimeVietnam(detailData.data.updated_at ?? null)}</p>
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

export default CourseMaterialSheet;
