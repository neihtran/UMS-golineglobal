import { useState } from 'react';
import { Plus, RotateCcw, Trash2, BookOpen, Eye, Edit } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  Modal,
  ConfirmModal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import {
  useHqnhatSubjectPrerequisites,
  useCreateHqnhatSubjectPrerequisite,
  useUpdateHqnhatSubjectPrerequisite,
  useDeleteHqnhatSubjectPrerequisite,
  useHqnhatSubjects,
} from '@/hooks/useHqnhat';
import type { HqnhatSubjectPrerequisite, HqnhatSubjectPrerequisiteCreatePayload } from '@/types/hqnhat.types';

const TYPE_CONFIG: Record<number, { label: string; variant: 'success' | 'info' }> = {
  1: { label: 'Tiên quyết', variant: 'success' },
  2: { label: 'Học trước', variant: 'info' },
};

export default function PrerequisiteList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [detailItem, setDetailItem] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<HqnhatSubjectPrerequisite | null>(null);
  const [form, setForm] = useState<HqnhatSubjectPrerequisiteCreatePayload>({
    subject_id: 0,
    prerequisite_subject_id: 0,
    type: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = {
    page,
    per_page: pageSize,
    type: typeFilter ? Number(typeFilter) as 1 | 2 : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatSubjectPrerequisites(params);
  const { data: subjectsData } = useHqnhatSubjects({ per_page: 200 });
  const createMut = useCreateHqnhatSubjectPrerequisite();
  const updateMut = useUpdateHqnhatSubjectPrerequisite();
  const deleteMut = useDeleteHqnhatSubjectPrerequisite();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const subjects = subjectsData?.data ?? [];
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ subject_id: 0, prerequisite_subject_id: 0, type: 1 });
    setErrors({});
    setSubmitError(null);
    setFormModalOpen(true);
  };

  const openEdit = (item: HqnhatSubjectPrerequisite) => {
    setEditing(item);
    setForm({ subject_id: item.subject_id, prerequisite_subject_id: item.prerequisite_subject_id, type: item.type as 1 | 2 });
    setErrors({});
    setSubmitError(null);
    setFormModalOpen(true);
  };

  const openDetail = (item: HqnhatSubjectPrerequisite) => {
    setDetailItem(item);
    setDetailModalOpen(true);
  };

  const openDelete = (item: HqnhatSubjectPrerequisite) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.subject_id) newErrors.subject_id = 'Chọn môn học';
    if (!form.prerequisite_subject_id) newErrors.prerequisite_subject_id = 'Chọn môn tiên quyết';
    if (form.subject_id && form.prerequisite_subject_id && form.subject_id === form.prerequisite_subject_id) {
      newErrors.prerequisite_subject_id = 'Môn tiên quyết không được trùng với môn học';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: form });
      } else {
        await createMut.mutateAsync(form);
      }
      setFormModalOpen(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMut.mutateAsync(deletingItem.id);
      setDeleteModalOpen(false);
      setDeletingItem(null);
    } catch {
      // error handled by hook
    }
  };

  const getSubjectName = (id: number) =>
    subjectMap.get(id)?.name ?? `ID: ${id}`;
  const getSubjectCode = (id: number) =>
    subjectMap.get(id)?.code ?? '';

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = getSubjectName(item.subject_id).toLowerCase();
    const prereqName = getSubjectName(item.prerequisite_subject_id).toLowerCase();
    const code = getSubjectCode(item.subject_id).toLowerCase();
    const prereqCode = getSubjectCode(item.prerequisite_subject_id).toLowerCase();
    return name.includes(q) || prereqName.includes(q) || code.includes(q) || prereqCode.includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách môn tiên quyết"
        description={`${total} quan hệ tiên quyết trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Môn tiên quyết' },
        ]}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm tiên quyết
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo tên hoặc mã môn..."
          className="h-10 w-64 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả loại</option>
          <option value="1">Tiên quyết</option>
          <option value="2">Học trước</option>
        </select>
        {(search || typeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã môn</TableHeadCell>
            <TableHeadCell>Tên môn học</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Mã tiên quyết</TableHeadCell>
            <TableHeadCell>Tên môn tiên quyết</TableHeadCell>
            <TableHeadCell className="text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                <div className="flex flex-col items-center gap-2">
                  <BookOpen className="h-8 w-8" />
                  <p>Không có quan hệ tiên quyết nào</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((item, i) => {
              const typeConfig = TYPE_CONFIG[item.type] ?? TYPE_CONFIG[1];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-medium">{getSubjectCode(item.subject_id)}</span>
                  </TableCell>
                  <TableCell className="font-medium">{getSubjectName(item.subject_id)}</TableCell>
                  <TableCell>
                    <Badge variant={typeConfig.variant} dot>
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-[rgb(var(--text-secondary))]">
                      {getSubjectCode(item.prerequisite_subject_id)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">
                    {getSubjectName(item.prerequisite_subject_id)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(item)}>
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
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[20, 50, 100]}
      />

      {/* Detail Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi tiết môn tiên quyết"
        size="lg"
      >
        {detailItem ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant={TYPE_CONFIG[detailItem.type]?.variant} dot>
                {TYPE_CONFIG[detailItem.type]?.label}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 space-y-1">
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Môn học</p>
                <p className="font-mono font-medium">{getSubjectCode(detailItem.subject_id)}</p>
                <p className="font-medium">{getSubjectName(detailItem.subject_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 space-y-1">
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Môn tiên quyết / Học trước</p>
                <p className="font-mono font-medium">{getSubjectCode(detailItem.prerequisite_subject_id)}</p>
                <p className="font-medium">{getSubjectName(detailItem.prerequisite_subject_id)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[rgb(var(--border))]">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailModalOpen(false); openEdit(detailItem); }}>
                <Edit className="h-4 w-4 mr-1" /> Sửa
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không có dữ liệu</p>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editing ? 'Sửa môn tiên quyết' : 'Thêm môn tiên quyết'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {submitError}
            </div>
          )}
          <FormField label="Môn học" error={errors.subject_id} required>
            <select
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn môn học --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Loại quan hệ" required>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: Number(e.target.value) as 1 | 2 })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={1}>Tiên quyết (phải học trước)</option>
              <option value={2}>Học trước (học cùng lúc)</option>
            </select>
          </FormField>
          <FormField label="Môn tiên quyết" error={errors.prerequisite_subject_id} required>
            <select
              value={form.prerequisite_subject_id}
              onChange={(e) => setForm({ ...form, prerequisite_subject_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn môn tiên quyết --</option>
              {subjects
                .filter(s => s.id !== form.subject_id)
                .map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))
              }
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa tiên quyết"
        description={`Xóa quan hệ tiên quyết giữa "${getSubjectName(deletingItem?.subject_id ?? 0)}" và "${getSubjectName(deletingItem?.prerequisite_subject_id ?? 0)}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
