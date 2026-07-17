import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, RotateCcw, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  ConfirmModal,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import {
  useHqnhatCurriculums,
  useCreateHqnhatCurriculum,
  useUpdateHqnhatCurriculum,
  useDeleteHqnhatCurriculum,
  useHqnhatMajors,
  useHqnhatTrainingSystems,
  useHqnhatCurriculum,
  useHqnhatCourses,
  useHqnhatSpecializations,
} from '@/hooks/useHqnhat';
import type { HqnhatCurriculum, HqnhatCurriculumCreatePayload } from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'error' }> = {
  0: { label: 'Ngừng hoạt động', variant: 'error' },
  1: { label: 'Đang hoạt động', variant: 'success' },
};

const emptyForm = (): HqnhatCurriculumCreatePayload => ({
  code: '',
  name: '',
  major_id: 0,
  training_system_id: 0,
  course_id: 0,
  total_credit: 0,
  elective_credit: 0,
  description: '',
  status: 1,
});

export default function CurriculumList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatCurriculum | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<HqnhatCurriculum | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatCurriculumCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    status: status ? Number(status) as 0 | 1 : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatCurriculums(params);
  const { data: majorsData } = useHqnhatMajors({ per_page: 100 });
  const { data: trainingSystemsData } = useHqnhatTrainingSystems({ per_page: 100 });
  const { data: coursesData } = useHqnhatCourses({ per_page: 100 });
  const { data: specializationsData } = useHqnhatSpecializations({ per_page: 100 });
  const { data: detailData, isLoading: detailLoading } = useHqnhatCurriculum(detailItemId ?? undefined);
  const createMut = useCreateHqnhatCurriculum();
  const updateMut = useUpdateHqnhatCurriculum();
  const deleteMut = useDeleteHqnhatCurriculum();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const majors = majorsData?.data ?? [];
  const trainingSystems = trainingSystemsData?.data ?? [];
  const courses = coursesData?.data ?? [];
  const specializations = specializationsData?.data ?? [];

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setFormModalOpen(true);
  };

  const openEdit = (item: HqnhatCurriculum) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      major_id: item.major_id,
      specialization_id: item.specialization_id,
      training_system_id: item.training_system_id,
      course_id: item.course_id,
      total_credit: item.total_credit,
      elective_credit: item.elective_credit,
      description: item.description ?? '',
      status: item.status as 0 | 1,
    });
    setErrors({});
    setSubmitError(null);
    setFormModalOpen(true);
  };

  const openDetail = (item: HqnhatCurriculum) => {
    setDetailItemId(item.id);
    setDetailModalOpen(true);
  };

  const openDelete = (item: HqnhatCurriculum) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Mã CTĐT không được để trống';
    if (!form.name.trim()) newErrors.name = 'Tên không được để trống';
    if (!form.major_id) newErrors.major_id = 'Chọn ngành';
    if (!form.training_system_id) newErrors.training_system_id = 'Chọn hệ đào tạo';
    if (!form.course_id) newErrors.course_id = 'Chọn khóa sinh viên';
    if (!form.total_credit || form.total_credit <= 0) newErrors.total_credit = 'Tổng tín chỉ phải > 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: form });
      } else {
        await createMut.mutateAsync(form);
      }
      setFormModalOpen(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Có lỗi xảy ra');
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

  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getMajorName = (id: number) => majors.find(m => m.id === id)?.name ?? `ID: ${id}`;
  const getTrainingSystemName = (id: number) => trainingSystems.find(t => t.id === id)?.name ?? `ID: ${id}`;
  const getCourseName = (id: number) => courses.find(c => c.id === id)?.name ?? `ID: ${id}`;
  const getSpecializationName = (id: number | null) =>
    id ? specializations.find(s => s.id === id)?.name ?? `ID: ${id}` : '—';
  const filteredSpecs = (majorId: number) =>
    specializations.filter(s => s.major_id === majorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách chương trình đào tạo"
        description={`${total} CTĐT trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'CTĐT' },
        ]}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm CTĐT
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Đang hoạt động</option>
          <option value="0">Ngừng hoạt động</option>
        </select>
        {(search || status) && (
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
            <TableHeadCell>Mã CTĐT</TableHeadCell>
            <TableHeadCell>Tên chương trình</TableHeadCell>
            <TableHeadCell>Ngành</TableHeadCell>
            <TableHeadCell>Hệ đào tạo</TableHeadCell>
            <TableHeadCell>Tổng TC</TableHeadCell>
            <TableHeadCell>TC tự chọn</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">
                <div className="flex flex-col items-center gap-2">
                  <BookOpen className="h-8 w-8" />
                  <p>Không tìm thấy CTĐT nào</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-medium">{item.code}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => openDetail(item)}
                      className="font-medium hover:text-[rgb(var(--primary))] text-left"
                    >
                      {item.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">{getMajorName(item.major_id)}</TableCell>
                  <TableCell className="text-sm">{getTrainingSystemName(item.training_system_id)}</TableCell>
                  <TableCell className="text-center">{item.total_credit}</TableCell>
                  <TableCell className="text-center">{item.elective_credit}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} dot>
                      {statusConfig.label}
                    </Badge>
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
        pageSizeOptions={[10, 25, 50]}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editing ? 'Sửa CTĐT' : 'Thêm CTĐT'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormModalOpen(false)}>
              Hủy
            </Button>
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã CTĐT" error={errors.code} required>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: SE2026"
              />
            </FormField>
            <FormField label="Tổng tín chỉ" error={errors.total_credit} required>
              <Input
                type="number"
                value={form.total_credit}
                onChange={(e) => setForm({ ...form, total_credit: Number(e.target.value) })}
                placeholder="VD: 120"
              />
            </FormField>
          </div>
          <FormField label="Tên chương trình" error={errors.name} required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Chương trình đào tạo Kỹ thuật phần mềm 2026"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngành" error={errors.major_id} required>
              <select
                value={form.major_id}
                onChange={(e) => setForm({ ...form, major_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn ngành --</option>
                {majors.map(m => (
                  <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Hệ đào tạo" error={errors.training_system_id} required>
              <select
                value={form.training_system_id}
                onChange={(e) => setForm({ ...form, training_system_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn hệ --</option>
                {trainingSystems.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Khóa sinh viên" error={errors.course_id} required>
              <select
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn khóa SV --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Tín chỉ tự chọn">
              <input
                type="number"
                value={form.elective_credit}
                onChange={(e) => setForm({ ...form, elective_credit: Number(e.target.value) })}
                placeholder="VD: 20"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Chuyên ngành (tùy chọn)">
              <select
                value={form.specialization_id ?? ''}
                onChange={(e) => setForm({ ...form, specialization_id: e.target.value ? Number(e.target.value) : null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Không chọn --</option>
                {filteredSpecs(form.major_id).map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Ngừng hoạt động</option>
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả chi tiết chương trình đào tạo..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa CTĐT"
        message={`Bạn có chắc muốn xóa CTĐT "${deletingItem?.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi tiết CTĐT"
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{detailData.data.name}</h3>
                <p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {detailData.data.code}</p>
              </div>
              <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant === 'success' ? 'success' : 'error'} dot>
                {STATUS_CONFIG[detailData.data.status]?.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngành</p>
                <p className="font-medium">{getMajorName(detailData.data.major_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Hệ đào tạo</p>
                <p className="font-medium">{getTrainingSystemName(detailData.data.training_system_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tổng tín chỉ</p>
                <p className="text-2xl font-bold">{detailData.data.total_credit}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tín chỉ tự chọn</p>
                <p className="text-2xl font-bold">{detailData.data.elective_credit}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Khóa sinh viên</p>
                <p className="text-xl font-bold">{getCourseName(detailData.data.course_id)}</p>
              </div>
              {detailData.data.specialization_id && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chuyên ngành</p>
                  <p className="font-medium">{getSpecializationName(detailData.data.specialization_id)}</p>
                </div>
              )}
            </div>

            {detailData.data.description && (
              <div>
                <p className="text-sm font-medium mb-2">Mô tả</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{detailData.data.description}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailModalOpen(false); openEdit(detailData.data); }}>
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
