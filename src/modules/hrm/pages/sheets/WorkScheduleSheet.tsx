import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, Clock } from 'lucide-react';
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
  useWorkSchedules,
  useWorkSchedule,
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
  useDeleteWorkSchedule,
} from '@/hooks/useHrm';
import type { WorkSchedule, WorkScheduleCreatePayload } from '@/types/hrm.types';

const emptyForm = (): WorkScheduleCreatePayload => ({
  code: '',
  name: '',
  start_time: null,
  end_time: null,
  break_start: null,
  break_end: null,
  working_hours: null,
  late_after: null,
  early_leave_before: null,
  status: 1,
  description: null,
});

const fmtTime = (t?: string | null) => (t ? t.slice(0, 5) : '—');

export function WorkScheduleSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'asc' as const,
    name: search || undefined,
    code: search || undefined,
    status: statusFilter ? Number(statusFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useWorkSchedules(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkSchedule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<WorkSchedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<WorkScheduleCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useWorkSchedule(detailId ?? undefined);
  const createMut = useCreateWorkSchedule();
  const updateMut = useUpdateWorkSchedule();
  const deleteMut = useDeleteWorkSchedule();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: WorkSchedule) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      start_time: item.start_time,
      end_time: item.end_time,
      break_start: item.break_start,
      break_end: item.break_end,
      working_hours: item.working_hours,
      late_after: item.late_after,
      early_leave_before: item.early_leave_before,
      status: item.status,
      description: item.description,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: WorkSchedule) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: WorkSchedule) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã ca không được để trống';
    if (!form.name.trim()) e.name = 'Tên ca không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: WorkScheduleCreatePayload = {
        code: form.code.trim(),
        name: form.name.trim(),
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        break_start: form.break_start || null,
        break_end: form.break_end || null,
        working_hours: form.working_hours ?? null,
        late_after: form.late_after ?? null,
        early_leave_before: form.early_leave_before ?? null,
        status: form.status ?? 1,
        description: form.description?.trim() || null,
      };
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload })
        : await createMut.mutateAsync(payload);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên ca..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]"
          >
            <option value="">Tất cả</option>
            <option value="1">Hoạt động</option>
            <option value="0">Ngừng</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm ca làm việc
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã ca</TableHeadCell>
            <TableHeadCell>Tên ca</TableHeadCell>
            <TableHeadCell>Bắt đầu</TableHeadCell>
            <TableHeadCell>Kết thúc</TableHeadCell>
            <TableHeadCell>Giờ làm</TableHeadCell>
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
                Chưa có ca làm việc nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="font-mono font-medium">{item.code}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>{fmtTime(item.start_time)}</TableCell>
                <TableCell>{fmtTime(item.end_time)}</TableCell>
                <TableCell>{item.working_hours ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 1 ? 'success' : 'error'} size="sm">
                    {item.status === 1 ? 'Hoạt động' : 'Ngừng'}
                  </Badge>
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
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa ca làm việc' : 'Thêm ca làm việc'}
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã ca" error={errors.code} required>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: HC, AC" />
            </FormField>
            <FormField label="Tên ca" error={errors.name} required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Hành chính" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Giờ bắt đầu">
              <Input type="time" value={(form.start_time as string)?.slice(0, 5) ?? ''} onChange={(e) => setForm({ ...form, start_time: e.target.value || null })} />
            </FormField>
            <FormField label="Giờ kết thúc">
              <Input type="time" value={(form.end_time as string)?.slice(0, 5) ?? ''} onChange={(e) => setForm({ ...form, end_time: e.target.value || null })} />
            </FormField>
            <FormField label="Nghỉ giữa ca (từ)">
              <Input type="time" value={(form.break_start as string)?.slice(0, 5) ?? ''} onChange={(e) => setForm({ ...form, break_start: e.target.value || null })} />
            </FormField>
            <FormField label="Nghỉ giữa ca (đến)">
              <Input type="time" value={(form.break_end as string)?.slice(0, 5) ?? ''} onChange={(e) => setForm({ ...form, break_end: e.target.value || null })} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Tổng giờ làm">
              <Input type="number" step="0.5" value={form.working_hours ?? ''} onChange={(e) => setForm({ ...form, working_hours: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Đi muộn sau (phút)">
              <Input type="number" value={form.late_after ?? ''} onChange={(e) => setForm({ ...form, late_after: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Về sớm trước (phút)">
              <Input type="number" value={form.early_leave_before ?? ''} onChange={(e) => setForm({ ...form, early_leave_before: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Ngừng</option>
              </select>
            </FormField>
          </div>
          <FormField label="Mô tả">
            <Input value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value || null })} />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa ca làm việc"
        description={`Bạn có chắc muốn xóa ca "${deleting?.name}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết ca làm việc" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Clock className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.name}</h3>
              <Badge variant="neutral" size="sm">{detailData.data.code}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ bắt đầu</p>
                <p className="font-medium">{fmtTime(detailData.data.start_time)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giờ kết thúc</p>
                <p className="font-medium">{fmtTime(detailData.data.end_time)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nghỉ giữa ca</p>
                <p className="font-medium">{fmtTime(detailData.data.break_start)} – {fmtTime(detailData.data.break_end)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tổng giờ làm</p>
                <p className="font-medium">{detailData.data.working_hours ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trạng thái</p>
                <Badge variant={detailData.data.status === 1 ? 'success' : 'error'} size="sm">
                  {detailData.data.status === 1 ? 'Hoạt động' : 'Ngừng'}
                </Badge>
              </div>
            </div>
            {detailData.data.description && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
                <p className="font-medium">{detailData.data.description}</p>
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

export default WorkScheduleSheet;
