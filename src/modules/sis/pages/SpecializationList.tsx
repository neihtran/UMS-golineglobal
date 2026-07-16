import { useState, useEffect } from 'react';
import { Plus, Search, RotateCcw, Edit, Trash2, Eye, BookMarked, Calendar, Clock, Trash2Icon } from 'lucide-react';
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
  useHqnhatSpecializations,
  useCreateHqnhatSpecialization,
  useUpdateHqnhatSpecialization,
  useDeleteHqnhatSpecialization,
  useHqnhatMajors,
} from '@/hooks/useHqnhat';
import type { HqnhatSpecialization, HqnhatSpecializationCreatePayload } from '@/types/hqnhat.types';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '1', label: 'Đang hoạt động' },
  { value: '0', label: 'Ngừng hoạt động' },
];

export default function SpecializationList() {
  const { pagination, setPage, setPageSize } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  const [search, setSearch] = useState('');
  const [majorId, setMajorId] = useState<number | ''>('');
  const [status, setStatus] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatSpecialization | null>(null);
  const [viewing, setViewing] = useState<HqnhatSpecialization | null>(null);
  const [deleting, setDeleting] = useState<HqnhatSpecialization | null>(null);

  const { data, isLoading, isError, error, refetch } = useHqnhatSpecializations({
    page: pagination.page,
    per_page: pagination.pageSize,
    sort_by: 'id',
    sort_direction: 'desc',
    name: search || undefined,
    major_id: majorId === '' ? undefined : majorId,
    status: status === '' ? undefined : (Number(status) as 0 | 1),
  });

  const { data: majorsData } = useHqnhatMajors({ per_page: 100 });

  const createMut = useCreateHqnhatSpecialization();
  const updateMut = useUpdateHqnhatSpecialization();
  const deleteMut = useDeleteHqnhatSpecialization();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;

  const majors = majorsData?.data ?? [];
  const majorMap = new Map(majors.map((m) => [m.id, m]));

  const resetFilters = () => {
    setSearch('');
    setMajorId('');
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
        title="Danh sách chuyên ngành"
        description={`${total} chuyên ngành trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Chuyên ngành' },
        ]}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm chuyên ngành
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên chuyên ngành..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={majorId}
          onChange={(e) => {
            setMajorId(e.target.value === '' ? '' : Number(e.target.value));
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả ngành</option>
          {majors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} — {m.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
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
            <TableHeadCell>Mã CN</TableHeadCell>
            <TableHeadCell>Tên chuyên ngành</TableHeadCell>
            <TableHeadCell>Thuộc ngành</TableHeadCell>
            <TableHeadCell>Mô tả</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="w-40 text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : isError ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                <div className="space-y-2">
                  <p className="text-red-500">{(error as Error)?.message || 'Lỗi không xác định'}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Thử lại
                  </Button>
                </div>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={7} className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
              <BookMarked className="mx-auto h-12 w-12 mb-3" />
              <p>Không có chuyên ngành nào</p>
            </td></tr>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(pagination.page - 1) * pagination.pageSize + i + 1}
                </TableCell>
                <TableCell className="font-mono">{item.code}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">
                  {majorMap.get(item.major_id)?.name ?? `Ngành #${item.major_id}`}
                </TableCell>
                <TableCell className="max-w-xs truncate text-[rgb(var(--text-secondary))]">
                  {item.description || '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 1 ? 'success' : 'neutral'} dot>
                    {item.status === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
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
      <SpecializationDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        item={viewing}
        majorMap={majorMap}
      />

      {/* Create / Edit modal */}
      <SpecializationFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editing={editing}
        majors={majors}
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
        title="Xác nhận xóa chuyên ngành"
        description={`Bạn có chắc chắn muốn xóa chuyên ngành "${deleting?.name}" (mã ${deleting?.code})? Hành động này không thể hoàn tác.`}
        confirmText="Xóa chuyên ngành"
        loading={deleteMut.isPending}
        variant="danger"
      />
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────
function SpecializationDetailModal({
  open,
  onClose,
  item,
  majorMap,
}: {
  open: boolean;
  onClose: () => void;
  item: HqnhatSpecialization | null;
  majorMap: Map<number, { id: number; code: string; name: string }>;
}) {
  if (!item) return null;

  const statusCfg = item.status === 1
    ? { variant: 'success' as const, label: 'Đang hoạt động' }
    : { variant: 'neutral' as const, label: 'Ngừng hoạt động' };

  const major = majorMap.get(item.major_id);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Chi tiết chuyên ngành" size="lg">
      <div className="space-y-5">
        {/* Main info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID</p>
            <p className="font-mono text-sm">{item.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mã chuyên ngành</p>
            <p className="font-mono text-sm">{item.code}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Tên chuyên ngành</p>
            <p className="text-base font-semibold">{item.name}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Thuộc ngành</p>
            <p className="text-sm font-medium">
              {major ? `${major.code} — ${major.name}` : `Ngành #${item.major_id}`}
            </p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
            <Badge variant={statusCfg.variant} dot>{statusCfg.label}</Badge>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mô tả</p>
          <div className="rounded-lg bg-[rgb(var(--bg-secondary))] p-4">
            <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
              {item.description || 'Chưa có mô tả'}
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="border-t border-[rgb(var(--border))] pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-[rgb(var(--text-muted))]" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày tạo</p>
                <p className="text-sm">{formatDate(item.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-[rgb(var(--text-muted))]" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Cập nhật lần cuối</p>
                <p className="text-sm">{formatDate(item.updated_at)}</p>
              </div>
            </div>
            {item.deleted_at && (
              <div className="col-span-2 flex items-start gap-2 text-red-500">
                <Trash2Icon className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide">Đã xóa</p>
                  <p className="text-sm">{formatDate(item.deleted_at)}</p>
                </div>
              </div>
            )}
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
function SpecializationFormModal({
  open,
  onClose,
  editing,
  majors,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editing: HqnhatSpecialization | null;
  majors: { id: number; code: string; name: string }[];
  onSubmit: (payload: HqnhatSpecializationCreatePayload) => Promise<unknown>;
}) {
  const [form, setForm] = useState({
    major_id: 1,
    code: '',
    name: '',
    description: '',
    status: 1 as 0 | 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        major_id: editing?.major_id ?? (majors[0]?.id ?? 1),
        code: editing?.code ?? '',
        name: editing?.name ?? '',
        description: editing?.description ?? '',
        status: (editing?.status ?? 1) as 0 | 1,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editing, majors]);

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã chuyên ngành không được để trống';
    if (!form.name.trim()) e.name = 'Tên chuyên ngành không được để trống';
    if (!form.major_id) e.major_id = 'Vui lòng chọn ngành';
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
        message = `Mã chuyên ngành "${form.code}" đã tồn tại. Vui lòng sử dụng mã khác.`;
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
      title={editing ? 'Sửa chuyên ngành' : 'Thêm chuyên ngành'}
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
        <FormField label="Ngành" error={errors.major_id} required>
          <select
            value={form.major_id}
            onChange={(e) => setForm({ ...form, major_id: Number(e.target.value) })}
            className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} — {m.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Mã chuyên ngành" error={errors.code} required>
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="VD: IS, AI, CS"
          />
        </FormField>
        <FormField label="Tên chuyên ngành" error={errors.name} required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Information Systems"
          />
        </FormField>
        <FormField label="Mô tả">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40 resize-none"
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
    </Modal>
  );
}
