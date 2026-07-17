import { useState, useEffect } from 'react';
import { Plus, Search, RotateCcw, Edit, Trash2, Eye, ClipboardList } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  ConfirmModal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import {
  useHqnhatAdmissionBatches,
  useCreateHqnhatAdmissionBatch,
  useUpdateHqnhatAdmissionBatch,
  useDeleteHqnhatAdmissionBatch,
} from '@/hooks/useHqnhat';
import type { HqnhatAdmissionBatch, HqnhatAdmissionBatchCreatePayload } from '@/types/hqnhat.types';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  0: { label: 'Ngừng hoạt động', variant: 'neutral' },
  1: { label: 'Đang hoạt động', variant: 'success' },
};

export default function AdmissionBatchList() {
  const { pagination, setPage, setPageSize } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatAdmissionBatch | null>(null);
  const [deleting, setDeleting] = useState<HqnhatAdmissionBatch | null>(null);
  const [viewing, setViewing] = useState<HqnhatAdmissionBatch | null>(null);

  const { data, isLoading, isError, error, refetch } = useHqnhatAdmissionBatches({
    page: pagination.page,
    per_page: pagination.pageSize,
    sort_by: 'id',
    sort_direction: 'desc',
    name: search || undefined,
    status: status === '' ? undefined : (Number(status) as 0 | 1),
  });

  const createMut = useCreateHqnhatAdmissionBatch();
  const updateMut = useUpdateHqnhatAdmissionBatch();
  const deleteMut = useDeleteHqnhatAdmissionBatch();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách đợt tuyển sinh"
        description={`${total} đợt tuyển sinh trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Đợt tuyển sinh' },
        ]}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm đợt tuyển sinh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên đợt tuyển sinh..."
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
        <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
          Đặt lại
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-16">STT</TableHeadCell>
            <TableHeadCell>Mã đợt</TableHeadCell>
            <TableHeadCell>Tên đợt tuyển sinh</TableHeadCell>
            <TableHeadCell>Năm</TableHeadCell>
            <TableHeadCell>Ngày bắt đầu</TableHeadCell>
            <TableHeadCell>Ngày kết thúc</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="w-40 text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : isError ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                <div className="space-y-2">
                  <p className="text-red-500">{(error as Error)?.message || 'Lỗi không xác định'}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Thử lại
                  </Button>
                </div>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                <ClipboardList className="mx-auto h-12 w-12 mb-3 text-[rgb(var(--text-muted))]" />
                <p>Không có đợt tuyển sinh nào</p>
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(pagination.page - 1) * pagination.pageSize + i + 1}
                </TableCell>
                <TableCell className="font-mono">{item.code}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="tabular-nums">{item.year}</TableCell>
                <TableCell>{item.start_date}</TableCell>
                <TableCell>{item.end_date}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_CONFIG[item.status]?.variant ?? 'neutral'} dot>
                    {STATUS_CONFIG[item.status]?.label ?? `Trạng thái ${item.status}`}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewing(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setFormModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(item)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {meta && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      )}

      {/* Detail modal */}
      <AdmissionBatchDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        batch={viewing}
      />

      {/* Create / Edit modal */}
      <AdmissionBatchFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editing={editing}
        onSubmit={async (payload) => {
          try {
            if (editing) {
              await updateMut.mutateAsync({ id: editing.id, payload });
            } else {
              await createMut.mutateAsync(payload);
            }
            setFormModalOpen(false);
          } catch (err) {
            console.error('Submit error:', err);
            throw err;
          }
        }}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteMut.mutate(deleting.id);
            setDeleting(null);
          }
        }}
        title="Xác nhận xóa đợt tuyển sinh"
        description={`Bạn có chắc chắn muốn xóa đợt tuyển sinh "${deleting?.name}" (mã ${deleting?.code})? Hành động này không thể hoàn tác.`}
        confirmText="Xóa đợt tuyển sinh"
        loading={deleteMut.isPending}
        variant="danger"
      />
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────
function AdmissionBatchDetailModal({
  open,
  onClose,
  batch,
}: {
  open: boolean;
  onClose: () => void;
  batch: HqnhatAdmissionBatch | null;
}) {
  if (!batch) return null;

  const statusCfg = STATUS_CONFIG[batch.status] ?? { variant: 'neutral' as const, label: `Trạng thái ${batch.status}` };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return dateStr;
  };

  return (
    <Modal open={open} onClose={onClose} title="Chi tiết đợt tuyển sinh" size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID</p>
            <p className="font-mono text-sm">{batch.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mã đợt</p>
            <p className="font-mono text-sm">{batch.code}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Tên đợt tuyển sinh</p>
            <p className="text-base font-semibold">{batch.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Năm</p>
            <p className="text-sm font-medium">{batch.year}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
            <Badge variant={statusCfg.variant} dot>{statusCfg.label}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày bắt đầu</p>
            <p className="text-sm">{formatDate(batch.start_date)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày kết thúc</p>
            <p className="text-sm">{formatDate(batch.end_date)}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[rgb(var(--border))]">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
}

// ─── Form modal ───────────────────────────────────────────────────────────
function AdmissionBatchFormModal({
  open,
  onClose,
  editing,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editing: HqnhatAdmissionBatch | null;
  onSubmit: (payload: HqnhatAdmissionBatchCreatePayload) => Promise<unknown>;
}) {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    code: '',
    name: '',
    year: currentYear,
    start_date: `${currentYear}-01-01`,
    end_date: `${currentYear}-12-31`,
    status: 1 as 0 | 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        code: editing?.code ?? '',
        name: editing?.name ?? '',
        year: editing?.year ?? currentYear,
        start_date: editing?.start_date ?? `${currentYear}-01-01`,
        end_date: editing?.end_date ?? `${currentYear}-12-31`,
        status: (editing?.status ?? 1) as 0 | 1,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editing, currentYear]);

  useEffect(() => {
    if (open) {
      setForm({
        code: editing?.code ?? '',
        name: editing?.name ?? '',
        year: editing?.year ?? currentYear,
        start_date: editing?.start_date ?? `${currentYear}-01-01`,
        end_date: editing?.end_date ?? `${currentYear}-12-31`,
        status: (editing?.status ?? 1) as 0 | 1,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editing, currentYear]);

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã đợt không được để trống';
    if (!form.name.trim()) e.name = 'Tên đợt tuyển sinh không được để trống';
    if (!form.start_date) e.start_date = 'Ngày bắt đầu không được để trống';
    if (!form.end_date) e.end_date = 'Ngày kết thúc không được để trống';
    if (form.start_date && form.end_date && form.start_date >= form.end_date) {
      e.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      let message = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }
      if (message.includes('unique') || message.includes('duplicate') || message.includes('trùng')) {
        message = `Mã đợt "${form.code}" đã tồn tại. Vui lòng sử dụng mã khác.`;
      }
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Sửa đợt tuyển sinh' : 'Thêm đợt tuyển sinh'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
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
        <FormField label="Mã đợt" error={errors.code} required>
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="VD: TS2026"
          />
        </FormField>
        <FormField label="Tên đợt tuyển sinh" error={errors.name} required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Tuyển sinh năm 2026"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Năm" error={errors.year}>
            <Input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            />
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
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Ngày bắt đầu" error={errors.start_date} required>
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </FormField>
          <FormField label="Ngày kết thúc" error={errors.end_date} required>
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  );
}
