import { useState } from 'react';
import { Plus, Eye, Pencil, RotateCcw, Search, Edit, Trash2 } from 'lucide-react';
import {
  Button,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import { formatDate } from '@/utils/formatters';
import {
  useHqnhatAdmissionBatches,
  useCreateHqnhatAdmissionBatch,
  useUpdateHqnhatAdmissionBatch,
  useDeleteHqnhatAdmissionBatch,
} from '@/hooks/useHqnhat';
import type {
  HqnhatAdmissionBatch,
  HqnhatAdmissionBatchCreatePayload,
} from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { variant: 'success' | 'warning' | 'neutral' | 'info'; label: string }> = {
  0: { variant: 'neutral', label: 'Không hoạt động' },
  1: { variant: 'success', label: 'Hoạt động' },
};

const emptyForm = (): HqnhatAdmissionBatchCreatePayload => ({
  code: '',
  name: '',
  year: new Date().getFullYear(),
  start_date: '',
  end_date: '',
  status: 1,
});

export function AdmissionBatchSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    code: search || undefined,
    name: search || undefined,
    year: yearFilter ? Number(yearFilter) : undefined,
    status: statusFilter ? Number(statusFilter) as 0 | 1 : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useHqnhatAdmissionBatches(params);

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatAdmissionBatch | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatAdmissionBatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HqnhatAdmissionBatch | null>(null);
  const [form, setForm] = useState<HqnhatAdmissionBatchCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMut = useCreateHqnhatAdmissionBatch();
  const updateMut = useUpdateHqnhatAdmissionBatch();
  const deleteMut = useDeleteHqnhatAdmissionBatch();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatAdmissionBatch) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      year: item.year,
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
      status: item.status as 0 | 1,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: HqnhatAdmissionBatch) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const openDelete = (item: HqnhatAdmissionBatch) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setYearFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code?.trim()) e.code = 'Mã đợt tuyển sinh không được để trống';
    if (!form.name?.trim()) e.name = 'Tên đợt tuyển sinh không được để trống';
    if (!form.year) e.year = 'Chọn năm tuyển sinh';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload: form })
        : await createMut.mutateAsync(form);
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-72">
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Mã, tên đợt tuyển sinh..."
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-10 pr-3 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Năm</label>
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="1">Hoạt động</option>
            <option value="0">Không hoạt động</option>
          </select>
        </div>
        {(search || yearFilter || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Tạo đợt mới
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Tên đợt tuyển sinh</TableHeadCell>
            <TableHeadCell>Năm</TableHeadCell>
            <TableHeadCell>Ngày bắt đầu</TableHeadCell>
            <TableHeadCell>Ngày kết thúc</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-[rgb(var(--text-muted))]">
                Chưa có đợt tuyển sinh nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="font-mono text-sm">{item.code}</TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">{item.name}</TableCell>
                <TableCell>{item.year}</TableCell>
                <TableCell className="text-sm">{item.start_date ? formatDate(item.start_date) : '—'}</TableCell>
                <TableCell className="text-sm">{item.end_date ? formatDate(item.end_date) : '—'}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_CONFIG[item.status]?.variant ?? 'neutral'} dot size="sm">
                    {STATUS_CONFIG[item.status]?.label ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa đợt tuyển sinh' : 'Tạo đợt tuyển sinh'}
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
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã đợt tuyển sinh" error={errors.code} required>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: TS2026"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Năm tuyển sinh" error={errors.year} required>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                placeholder="VD: 2026"
                min="2000"
                max="2100"
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>

          <FormField label="Tên đợt tuyển sinh" error={errors.name} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Tuyển sinh đại học chính quy 2026"
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngày bắt đầu">
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Ngày kết thúc">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>

          <FormField label="Trạng thái">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa đợt tuyển sinh"
        description={`Bạn có chắc muốn xóa đợt tuyển sinh "${deleting?.name}" (mã ${deleting?.code})? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết đợt tuyển sinh"
        size="lg"
      >
        {detailItem ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mã đợt</p>
                <p className="font-mono text-sm font-semibold">{detailItem.code}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Năm</p>
                <p className="text-sm font-medium">{detailItem.year}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Tên đợt tuyển sinh</p>
                <p className="text-base font-semibold">{detailItem.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày bắt đầu</p>
                <p className="text-sm">{detailItem.start_date ? formatDate(detailItem.start_date) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày kết thúc</p>
                <p className="text-sm">{detailItem.end_date ? formatDate(detailItem.end_date) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
                <Badge variant={STATUS_CONFIG[detailItem.status]?.variant ?? 'neutral'} dot>
                  {STATUS_CONFIG[detailItem.status]?.label ?? '—'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID</p>
                <p className="font-mono text-sm">#{detailItem.id}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}>
                <Pencil className="h-4 w-4 mr-1" /> Sửa
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
