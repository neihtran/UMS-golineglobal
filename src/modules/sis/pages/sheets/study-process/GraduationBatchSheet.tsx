import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
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
  Modal,
  ConfirmModal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { usePagination } from '@/hooks';
import {
  useGraduationBatches,
  useGraduationBatch,
  useCreateGraduationBatch,
  useUpdateGraduationBatch,
  useDeleteGraduationBatch,
  useSisAcademicTerms,
  useSisCourses,
  type GraduationBatch,
  type GraduationBatchCreatePayload,
  type AcademicTerm,
  type Course,
} from '@/hooks/useSisGraduation';

const BATCH_STATUS: Record<number, { variant: 'neutral' | 'warning' | 'info' | 'success' | 'error'; label: string }> = {
  0: { variant: 'neutral', label: 'Nháp' },
  1: { variant: 'warning', label: 'Đang rà soát' },
  2: { variant: 'info', label: 'Đã duyệt' },
  3: { variant: 'success', label: 'Hoàn thành' },
  4: { variant: 'error', label: 'Đã hủy' },
};

const emptyForm = (): GraduationBatchCreatePayload => ({
  code: '',
  name: '',
  academic_term_id: 0,
  course_id: 0,
  graduation_date: null,
  decision_no: null,
  decision_date: null,
  note: null,
  status: 0,
});

export function GraduationBatchSheet() {
  const { pagination, setPage, setPageSize } = usePagination({
    initialPage: 1,
    initialPageSize: 15,
  });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    name: search || undefined,
    status: statusFilter ? Number(statusFilter) : undefined,
    academic_term_id: termFilter ? Number(termFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useGraduationBatches(params);
  const { data: termsData } = useSisAcademicTerms({ per_page: 100, status: 3 });
  const { data: coursesData } = useSisCourses({ per_page: 100 });

  const items = Array.isArray(data?.data) ? (data.data as GraduationBatch[]) : [];
  const total = data?.meta?.total ?? items.length;
  const terms = Array.isArray(termsData?.data)
    ? (termsData.data as AcademicTerm[])
    : [];
  const courses = Array.isArray(coursesData?.data)
    ? (coursesData.data as Course[])
    : [];

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GraduationBatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<GraduationBatch | null>(null);
  const [form, setForm] = useState<GraduationBatchCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useGraduationBatch(
    detailId ?? undefined
  );
  const createMut = useCreateGraduationBatch();
  const updateMut = useUpdateGraduationBatch();
  const deleteMut = useDeleteGraduationBatch();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getTermName = (id: number) =>
    terms.find((t: AcademicTerm) => t.id === id)?.code ?? `HK #${id}`;

  const getCourseName = (id: number) =>
    courses.find((c: Course) => c.id === id)?.name ?? `Khóa #${id}`;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: GraduationBatch) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      academic_term_id: item.academic_term_id,
      course_id: item.course_id,
      graduation_date: item.graduation_date,
      decision_no: item.decision_no,
      decision_date: item.decision_date,
      note: item.note,
      status: item.status,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: GraduationBatch) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: GraduationBatch) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTermFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã đợt không được để trống';
    if (!form.name.trim()) e.name = 'Tên đợt không được để trống';
    if (!form.academic_term_id || form.academic_term_id === 0)
      e.academic_term_id = 'Vui lòng chọn học kỳ';
    if (!form.course_id || form.course_id === 0)
      e.course_id = 'Vui lòng chọn khóa học';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: GraduationBatchCreatePayload = {
        ...form,
        code: form.code.trim(),
        name: form.name.trim(),
        graduation_date: form.graduation_date || null,
        decision_no: form.decision_no?.trim() || null,
        decision_date: form.decision_date || null,
        note: form.note?.trim() || null,
      };
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          payload,
        });
      } else {
        await createMut.mutateAsync(payload);
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
      setDeleteOpen(false);
      setDeleting(null);
    } catch (_) {}
  };

  const hasFilters = search || statusFilter || termFilter;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên đợt xét..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(BATCH_STATUS).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Học kỳ
          </label>
          <select
            value={termFilter}
            onChange={(e) => {
              setTermFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[150px]"
          >
            <option value="">Tất cả HK</option>
            {terms.map((t: AcademicTerm) => (
              <option key={t.id} value={t.id}>
                {t.code}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={resetFilters}
          >
            Đặt lại
          </Button>
        )}
        <Button
          className="ml-auto"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openCreate}
        >
          Thêm đợt xét
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Tên đợt xét</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
            <TableHeadCell>Khóa học</TableHeadCell>
            <TableHeadCell>Ngày TN</TableHeadCell>
            <TableHeadCell>Quyết định</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có đợt xét tốt nghiệp nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sc = BATCH_STATUS[item.status] ?? BATCH_STATUS[0];
              return (
                <TableRow
                  key={item.id}
                  className={isFetching && !isLoading ? 'opacity-50' : ''}
                >
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {item.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.academic_term?.code ?? getTermName(item.academic_term_id)}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                    {getCourseName(item.course_id)}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                    {item.graduation_date
                      ? new Date(item.graduation_date).toLocaleDateString('vi-VN')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                    {item.decision_no || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} size="sm" dot>
                      {sc.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(item)}
                        title="Chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(item)}
                        title="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDelete(item)}
                        title="Xóa"
                      >
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

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa đợt xét tốt nghiệp' : 'Thêm đợt xét tốt nghiệp'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
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
          <FormField label="Mã đợt xét" error={errors.code} required>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="VD: GB2024.1"
            />
          </FormField>
          <FormField label="Tên đợt xét" error={errors.name} required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Đợt xét tốt nghiệp HK2/2025-2026"
            />
          </FormField>
          <FormField
            label="Học kỳ"
            error={errors.academic_term_id}
            required
          >
            <select
              value={form.academic_term_id}
              onChange={(e) =>
                setForm({ ...form, academic_term_id: Number(e.target.value) })
              }
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn học kỳ --</option>
              {terms.map((t: AcademicTerm) => (
                <option key={t.id} value={t.id}>
                  {t.code} — {t.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Khóa học"
            error={errors.course_id}
            required
          >
            <select
              value={form.course_id}
              onChange={(e) =>
                setForm({ ...form, course_id: Number(e.target.value) })
              }
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn khóa học --</option>
              {courses.map((c: Course) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Ngày tốt nghiệp">
            <Input
              type="date"
              value={form.graduation_date ?? ''}
              onChange={(e) =>
                setForm({ ...form, graduation_date: e.target.value || null })
              }
            />
          </FormField>
          <FormField label="Số quyết định">
            <Input
              value={form.decision_no ?? ''}
              onChange={(e) =>
                setForm({ ...form, decision_no: e.target.value || null })
              }
              placeholder="VD: 123/QĐ-DHBK"
            />
          </FormField>
          <FormField label="Ngày quyết định">
            <Input
              type="date"
              value={form.decision_date ?? ''}
              onChange={(e) =>
                setForm({ ...form, decision_date: e.target.value || null })
              }
            />
          </FormField>
          <FormField label="Trạng thái" required>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: Number(e.target.value) })
              }
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              {Object.entries(BATCH_STATUS).map(([val, cfg]) => (
                <option key={val} value={Number(val)}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Ghi chú">
            <Input
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value || null })}
              placeholder="Ghi chú thêm..."
            />
          </FormField>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết đợt xét tốt nghiệp"
        size="md"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <GraduationCap className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.name}</h3>
              <Badge
                variant={
                  BATCH_STATUS[detailData.data.status]?.variant ?? 'neutral'
                }
                size="sm"
              >
                {BATCH_STATUS[detailData.data.status]?.label ?? '—'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã đợt</p>
                <p className="font-medium font-mono">{detailData.data.code}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học kỳ</p>
                <p className="font-medium">
                  {detailData.data.academic_term?.code ??
                    `HK #${detailData.data.academic_term_id}`}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Khóa học</p>
                <p className="font-medium">
                  {getCourseName(detailData.data.course_id)}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày TN dự kiến</p>
                <p className="font-medium">
                  {detailData.data.graduation_date
                    ? new Date(detailData.data.graduation_date).toLocaleDateString(
                        'vi-VN'
                      )
                    : '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số QĐ</p>
                <p className="font-medium">
                  {detailData.data.decision_no || '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 col-span-2">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p>
                <p className="font-medium">
                  {detailData.data.note || '—'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Đóng
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDetailOpen(false);
                  openEdit(detailData.data);
                }}
              >
                <Edit className="h-4 w-4 mr-1" /> Sửa
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy dữ liệu
          </p>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa đợt xét"
        description={`Bạn có chắc muốn xóa đợt xét "${deleting?.name}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />
    </div>
  );
}

export default GraduationBatchSheet;
