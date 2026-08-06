import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, FolderTree, FileText, Calendar } from 'lucide-react';
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
  useCourseModules,
  useCourseModule,
  useCreateCourseModule,
  useUpdateCourseModule,
  useDeleteCourseModule,
  useLearningCourses,
} from '@/hooks/useLms';
import { useNotificationStore } from '@/stores/notificationStore';
import type {
  CourseModule,
  CourseModuleCreatePayload,
  CourseModuleListParams,
  LmsStatus,
} from '@/types/lms.types';

const STATUS_OPTS: { value: LmsStatus; label: string; variant: 'success' | 'neutral' }[] = [
  { value: 'active', label: 'Hoạt động', variant: 'success' },
  { value: 'inactive', label: 'Ngừng', variant: 'neutral' },
];

const emptyForm = (): CourseModuleCreatePayload => ({
  title: '',
  description: null,
  learning_course_id: 0,
  is_published: false,
  status: 'active',
  display_order: 0,
});

export function CourseModuleSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | null>(null);

  // Lookup danh sách khóa học
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses = Array.isArray(coursesData?.data) ? coursesData.data : [];
  const courseMap = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);

  const params: CourseModuleListParams | undefined = courseFilter
    ? {
        page,
        per_page: pageSize,
        title: search || undefined,
        learning_course_id: courseFilter,
        sort_by: 'display_order',
        sort_direction: 'asc',
      }
    : undefined;

  const { data, isLoading, isFetching } = useCourseModules(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CourseModule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<CourseModule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<CourseModuleCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useCourseModule(detailId ?? undefined);
  const createMut = useCreateCourseModule();
  const updateMut = useUpdateCourseModule();
  const deleteMut = useDeleteCourseModule();
  const notify = useNotificationStore();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: CourseModule) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      learning_course_id: item.learning_course_id,
      is_published: !!item.is_published,
      status: (item.status ?? 'active') as LmsStatus,
      display_order: item.display_order ?? 0,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: CourseModule) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: CourseModule) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setCourseFilter(null);
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!form.learning_course_id) e.learning_course_id = 'Vui lòng chọn khóa học';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: CourseModuleCreatePayload = {
        ...form,
        title: form.title.trim(),
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

  const statusBadge = (s: LmsStatus | null) => STATUS_OPTS.find((o) => o.value === s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tiêu đề chương..."
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
              setCourseFilter(e.target.value ? Number(e.target.value) : null);
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
        {(search || courseFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm chương học
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Tiêu đề</TableHeadCell>
            <TableHeadCell>Khóa học</TableHeadCell>
            <TableHeadCell>Thứ tự</TableHeadCell>
            <TableHeadCell>Xuất bản</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-48">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!courseFilter ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <FolderTree className="h-8 w-8 text-[rgb(var(--text-muted))]" />
                  <p className="text-[rgb(var(--text-muted))]">Vui lòng chọn khóa học để xem danh sách chương học</p>
                </div>
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có chương học nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sb = statusBadge(item.status);
              const course = courseMap[item.learning_course_id];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      <span className="line-clamp-1">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {course ? (
                      <span>{course.code} – {course.name}</span>
                    ) : (
                      <span className="text-[rgb(var(--text-muted))]"># {item.learning_course_id}</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">{item.display_order}</TableCell>
                  <TableCell>
                    {item.is_published ? (
                      <Badge variant="success" size="sm">Đã xuất bản</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Nháp</Badge>
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
        title={editing ? 'Sửa chương học' : 'Thêm chương học'}
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
          <FormField label="Tiêu đề chương" error={errors.title} required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Chương 1: Tổng quan về lập trình Web"
            />
          </FormField>
          <FormField label="Khóa học" error={errors.learning_course_id} required>
            <select
              value={form.learning_course_id || ''}
              onChange={(e) =>
                setForm({ ...form, learning_course_id: e.target.value ? Number(e.target.value) : 0 })
              }
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value="">— Chọn khóa học —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} – {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              placeholder="Mô tả chi tiết chương học"
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
            />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Thứ tự hiển thị">
              <Input
                type="number"
                value={form.display_order ?? 0}
                onChange={(e) =>
                  setForm({ ...form, display_order: Number(e.target.value) || 0 })
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
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
            <label className="flex items-end gap-2 text-sm cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={!!form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
              />
              <span>Xuất bản</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa chương học"
        description={`Bạn có chắc muốn xóa chương "${deleting?.title}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết chương học" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FolderTree className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.title}</h3>
              {detailData.data.is_published ? (
                <Badge variant="success" size="sm">Đã xuất bản</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Nháp</Badge>
              )}
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
                    const c = courseMap[detailData.data.learning_course_id];
                    return c ? `${c.code} – ${c.name}` : `#${detailData.data.learning_course_id}`;
                  })()}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thứ tự</p>
                <p className="font-medium">{detailData.data.display_order}</p>
              </div>
            </div>
            {detailData.data.description && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Mô tả
                </p>
                <p className="text-sm whitespace-pre-wrap">{detailData.data.description}</p>
              </div>
            )}
            <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Cập nhật lần cuối
              </p>
              <p className="font-medium">
                {detailData.data.updated_at ? new Date(detailData.data.updated_at).toLocaleString('vi-VN') : '—'}
              </p>
            </div>
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

export default CourseModuleSheet;
