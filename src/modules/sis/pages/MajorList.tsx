import { useState, useEffect } from 'react';
import { Plus, Search, RotateCcw, Edit, Trash2, Eye, BookOpen, Calendar, Clock } from 'lucide-react';
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
  useHqnhatMajors,
  useCreateHqnhatMajor,
  useUpdateHqnhatMajor,
  useDeleteHqnhatMajor,
} from '@/hooks/useHqnhat';
import type { HqnhatMajor, HqnhatMajorCreatePayload } from '@/types/hqnhat.types';

const DEGREE_LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả bậc đào tạo' },
  { value: '1', label: 'Đại học' },
  { value: '2', label: 'Thạc sĩ' },
  { value: '3', label: 'Tiến sĩ' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '1', label: 'Đang hoạt động' },
  { value: '0', label: 'Ngừng hoạt động' },
];

function getDegreeLabel(level: number): string {
  if (level === 1) return 'Đại học';
  if (level === 2) return 'Thạc sĩ';
  if (level === 3) return 'Tiến sĩ';
  return `Bậc ${level}`;
}

export default function MajorList() {
  const { pagination, setPage, setPageSize } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  const [search, setSearch] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [status, setStatus] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatMajor | null>(null);
  const [deleting, setDeleting] = useState<HqnhatMajor | null>(null);
  const [viewing, setViewing] = useState<HqnhatMajor | null>(null);

  const { data, isLoading, isError, error, refetch } = useHqnhatMajors({
    page: pagination.page,
    per_page: pagination.pageSize,
    sort_by: 'id',
    sort_direction: 'desc',
    name: search || undefined,
    degree_level: degreeLevel ? Number(degreeLevel) : undefined,
    status: status === '' ? undefined : (Number(status) as 0 | 1),
  });

  const createMut = useCreateHqnhatMajor();
  const updateMut = useUpdateHqnhatMajor();
  const deleteMut = useDeleteHqnhatMajor();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;

  const resetFilters = () => {
    setSearch('');
    setDegreeLevel('');
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
        title="Danh sách ngành học"
        description={`${total} ngành học trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Ngành học' },
        ]}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm ngành học
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên ngành..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={degreeLevel}
          onChange={(e) => {
            setDegreeLevel(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          {DEGREE_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
            <TableHeadCell>Mã ngành</TableHeadCell>
            <TableHeadCell>Tên ngành</TableHeadCell>
            <TableHeadCell>Bậc đào tạo</TableHeadCell>
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
            <tr>
              <td colSpan={7} className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                <BookOpen className="mx-auto h-12 w-12 mb-3 text-[rgb(var(--text-muted))]" />
                <p>Không có ngành học nào</p>
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
                <TableCell>{getDegreeLabel(item.degree_level)}</TableCell>
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
      <MajorDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        major={viewing}
      />

      {/* Create / Edit modal */}
      <MajorFormModal
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
        title="Xác nhận xóa ngành học"
        description={`Bạn có chắc chắn muốn xóa ngành "${deleting?.name}" (mã ${deleting?.code})? Hành động này không thể hoàn tác.`}
        confirmText="Xóa ngành học"
        loading={deleteMut.isPending}
        variant="danger"
      />
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────
function MajorDetailModal({
  open,
  onClose,
  major,
}: {
  open: boolean;
  onClose: () => void;
  major: HqnhatMajor | null;
}) {
  if (!major) return null;

  const statusCfg = major.status === 1
    ? { variant: 'success' as const, label: 'Đang hoạt động' }
    : { variant: 'neutral' as const, label: 'Ngừng hoạt động' };

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
    <Modal open={open} onClose={onClose} title="Chi tiết ngành học" size="lg">
      <div className="space-y-5">
        {/* Main info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID</p>
            <p className="font-mono text-sm">{major.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mã ngành</p>
            <p className="font-mono text-sm">{major.code}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Tên ngành</p>
            <p className="text-base font-semibold">{major.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Bậc đào tạo</p>
            <p className="text-sm font-medium">{getDegreeLabel(major.degree_level)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Khoa/Viện</p>
            <p className="font-mono text-sm">{major.department_id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
            <Badge variant={statusCfg.variant} dot>{statusCfg.label}</Badge>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mô tả</p>
          <div className="rounded-lg bg-[rgb(var(--bg-secondary))] p-4">
            <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
              {major.description || 'Chưa có mô tả'}
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
                <p className="text-sm">{formatDate(major.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-[rgb(var(--text-muted))]" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Cập nhật lần cuối</p>
                <p className="text-sm">{formatDate(major.updated_at)}</p>
              </div>
            </div>
            {major.deleted_at && (
              <div className="col-span-2 flex items-start gap-2 text-red-500">
                <Trash2 className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide">Đã xóa</p>
                  <p className="text-sm">{formatDate(major.deleted_at)}</p>
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
function MajorFormModal({
  open,
  onClose,
  editing,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editing: HqnhatMajor | null;
  onSubmit: (payload: HqnhatMajorCreatePayload) => Promise<unknown>;
}) {
  const [form, setForm] = useState({
    department_id: 1,
    code: '',
    name: '',
    description: '',
    degree_level: 1,
    status: 1 as 0 | 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        department_id: editing?.department_id ?? 1,
        code: editing?.code ?? '',
        name: editing?.name ?? '',
        description: editing?.description ?? '',
        degree_level: editing?.degree_level ?? 1,
        status: (editing?.status ?? 1) as 0 | 1,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editing]);

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã ngành không được để trống';
    if (!form.name.trim()) e.name = 'Tên ngành không được để trống';
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
      // Gợi ý khi trùng mã
      if (message.includes('unique') || message.includes('duplicate') || message.includes('trùng')) {
        message = `Mã ngành "${form.code}" đã tồn tại. Vui lòng sử dụng mã khác.`;
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
      title={editing ? 'Sửa ngành học' : 'Thêm ngành học'}
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
        <FormField label="Mã ngành" error={errors.code} required>
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="VD: SE, IS, AI"
          />
        </FormField>
        <FormField label="Tên ngành" error={errors.name} required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Software Engineering"
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
        <div className="grid grid-cols-2 gap-3">
          <FormField label="ID Khoa/Viện">
            <Input
              type="number"
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Bậc đào tạo">
            <select
              value={form.degree_level}
              onChange={(e) => setForm({ ...form, degree_level: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={1}>Đại học</option>
              <option value={2}>Thạc sĩ</option>
              <option value={3}>Tiến sĩ</option>
            </select>
          </FormField>
        </div>
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
