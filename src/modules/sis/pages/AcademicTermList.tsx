import { useState } from 'react';
import { Plus, Search, RotateCcw, Edit, Trash2, Eye } from 'lucide-react';
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
  useHqnhatAcademicTerms,
  useHqnhatAcademicTerm,
  useCreateHqnhatAcademicTerm,
  useUpdateHqnhatAcademicTerm,
  useDeleteHqnhatAcademicTerm,
} from '@/hooks/useHqnhat';
import type { HqnhatAcademicTerm, HqnhatAcademicTermCreatePayload } from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  0: { label: 'Lập kế hoạch', variant: 'neutral' },
  1: { label: 'Mở đăng ký', variant: 'info' },
  2: { label: 'Đang học', variant: 'success' },
  3: { label: 'Đã kết thúc', variant: 'warning' },
};

const SEMESTER_LABELS: Record<number, string> = {
  1: 'HK1',
  2: 'HK2',
  3: 'HK Hè',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

const emptyForm = (): HqnhatAcademicTermCreatePayload => ({
  code: '',
  academic_year: '',
  semester: 1,
  start_date: '',
  end_date: '',
  registration_start: '',
  registration_end: '',
  status: 0,
});

export default function AcademicTermList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatAcademicTerm | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<HqnhatAcademicTerm | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatAcademicTermCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    status: status ? Number(status) as 0 | 1 | 2 | 3 : undefined,
    semester: semesterFilter ? Number(semesterFilter) : undefined,
    include_deleted: includeDeleted || undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatAcademicTerms(params);
  const { data: detailData, isLoading: detailLoading } = useHqnhatAcademicTerm(detailItemId ?? undefined);
  const createMut = useCreateHqnhatAcademicTerm();
  const updateMut = useUpdateHqnhatAcademicTerm();
  const deleteMut = useDeleteHqnhatAcademicTerm();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setSemesterFilter('');
    setIncludeDeleted(false);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setFormModalOpen(true);
  };

  const openEdit = (item: HqnhatAcademicTerm) => {
    setEditing(item);
    setForm({
      code: item.code,
      academic_year: item.academic_year,
      semester: item.semester,
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
      registration_start: item.registration_start ?? '',
      registration_end: item.registration_end ?? '',
      status: item.status as 0 | 1 | 2 | 3,
    });
    setErrors({});
    setSubmitError(null);
    setFormModalOpen(true);
  };

  const openDetail = (item: HqnhatAcademicTerm) => {
    setDetailItemId(item.id);
    setDetailModalOpen(true);
  };

  const openDelete = (item: HqnhatAcademicTerm) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Mã học kỳ không được để trống';
    if (!form.academic_year.trim()) newErrors.academic_year = 'Năm học không được để trống (VD: 2023-2024)';
    if (!form.semester || form.semester < 1 || form.semester > 3) newErrors.semester = 'Học kỳ phải từ 1 đến 3';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách học kỳ"
        description={`${total} học kỳ trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Học kỳ' },
        ]}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm học kỳ
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã học kỳ..."
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
          <option value="0">Lập kế hoạch</option>
          <option value="1">Mở đăng ký</option>
          <option value="2">Đang học</option>
          <option value="3">Đã kết thúc</option>
        </select>
        <select
          value={semesterFilter}
          onChange={(e) => {
            setSemesterFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả học kỳ</option>
          <option value="1">Học kỳ 1</option>
          <option value="2">Học kỳ 2</option>
          <option value="3">Học kỳ hè</option>
        </select>
        {(search || status || semesterFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => {
              setIncludeDeleted(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
          />
          <span className="text-sm text-[rgb(var(--text-secondary))]">Hiển thị đã xóa</span>
        </label>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã HK</TableHeadCell>
            <TableHeadCell>Năm học</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
            <TableHeadCell>Ngày bắt đầu</TableHeadCell>
            <TableHeadCell>Ngày kết thúc</TableHeadCell>
            <TableHeadCell>Đăng ký</TableHeadCell>
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
                Không tìm thấy học kỳ nào
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
                  <TableCell>{item.academic_year}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{SEMESTER_LABELS[item.semester] || `HK${item.semester}`}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                    {formatDate(item.start_date)}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                    {formatDate(item.end_date)}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                    {formatDate(item.registration_start)} — {formatDate(item.registration_end)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
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
        title={editing ? 'Sửa học kỳ' : 'Thêm học kỳ'}
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
            <FormField label="Mã học kỳ" error={errors.code} required>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: HK1_2024_2025"
              />
            </FormField>
            <FormField label="Năm học" error={errors.academic_year} required>
              <Input
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                placeholder="VD: 2024-2025"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Học kỳ" error={errors.semester} required>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) as 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Học kỳ 1</option>
                <option value={2}>Học kỳ 2</option>
                <option value={3}>Học kỳ hè</option>
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 | 2 | 3 })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>Lập kế hoạch</option>
                <option value={1}>Mở đăng ký</option>
                <option value={2}>Đang học</option>
                <option value={3}>Đã kết thúc</option>
              </select>
            </FormField>
          </div>
          <div className="border-t border-[rgb(var(--border))] pt-4">
            <p className="text-sm font-medium mb-3 text-[rgb(var(--text-muted))]">Ngày tháng</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Ngày bắt đầu HK">
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </FormField>
              <FormField label="Ngày kết thúc HK">
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </FormField>
              <FormField label="Ngày bắt đầu đăng ký">
                <Input
                  type="date"
                  value={form.registration_start}
                  onChange={(e) => setForm({ ...form, registration_start: e.target.value })}
                />
              </FormField>
              <FormField label="Ngày kết thúc đăng ký">
                <Input
                  type="date"
                  value={form.registration_end}
                  onChange={(e) => setForm({ ...form, registration_end: e.target.value })}
                />
              </FormField>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa học kỳ"
        message={`Bạn có chắc muốn xóa học kỳ "${deletingItem?.code}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi tiết học kỳ"
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
                <h3 className="text-lg font-bold">{detailData.data.code}</h3>
                <p className="text-sm text-[rgb(var(--text-muted))]">{detailData.data.academic_year}</p>
              </div>
              <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant}>
                {STATUS_CONFIG[detailData.data.status]?.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm học</p>
                <p className="font-medium">{detailData.data.academic_year}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học kỳ</p>
                <p className="font-medium">{SEMESTER_LABELS[detailData.data.semester] || `HK${detailData.data.semester}`}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày bắt đầu</p>
                <p className="font-medium">{formatDate(detailData.data.start_date)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày kết thúc</p>
                <p className="font-medium">{formatDate(detailData.data.end_date)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Bắt đầu đăng ký</p>
                <p className="font-medium">{formatDate(detailData.data.registration_start)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Kết thúc đăng ký</p>
                <p className="font-medium">{formatDate(detailData.data.registration_end)}</p>
              </div>
            </div>

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
