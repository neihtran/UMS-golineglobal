import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Search, RotateCcw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatScheduleChanges,
  useHqnhatScheduleChange,
  useCreateHqnhatScheduleChange,
  useUpdateHqnhatScheduleChange,
  useDeleteHqnhatScheduleChange,
  useHqnhatClassSchedules,
} from '@/hooks/useHqnhat';
import type {
  HqnhatScheduleChange,
  HqnhatScheduleChangeCreatePayload,
  HqnhatClassSchedule,
} from '@/types/hqnhat.types';
import { formatDate, formatDateTime } from '@/utils/formatters';

const STATUS_CONFIG: Record<number, { label: string; variant: 'warning' | 'success' | 'error' }> = {
  0: { label: 'Chờ duyệt', variant: 'warning' },
  1: { label: 'Đã duyệt', variant: 'success' },
  2: { label: 'Từ chối', variant: 'error' },
};

const emptyForm = (): HqnhatScheduleChangeCreatePayload => ({
  schedule_id: 0,
  new_room_id: undefined,
  new_lecturer_id: undefined,
  new_date: '',
  reason: '',
});

export function ScheduleChangeSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    status: statusFilter ? (Number(statusFilter) as 0 | 1 | 2) : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useHqnhatScheduleChanges(params);
  const { data: schedulesData } = useHqnhatClassSchedules({ per_page: 200 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const schedules = Array.isArray(schedulesData?.data) ? schedulesData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatScheduleChange | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatScheduleChange | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatScheduleChangeCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatScheduleChange(detailId ?? undefined);
  const createMut = useCreateHqnhatScheduleChange();
  const updateMut = useUpdateHqnhatScheduleChange();
  const deleteMut = useDeleteHqnhatScheduleChange();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getScheduleLabel = (id: number) => {
    const s = schedules.find((x: HqnhatClassSchedule) => x.id === id);
    if (!s) return `Buổi #${id}`;
    return `#${s.id} - LHP #${s.course_section_id} (Tiết ${s.lesson_from}-${s.lesson_to})`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatScheduleChange) => {
    setEditing(item);
    setForm({
      schedule_id: item.schedule_id,
      new_room_id: item.new_room_id ?? undefined,
      new_lecturer_id: item.new_lecturer_id ?? undefined,
      new_date: item.new_date ?? '',
      reason: item.reason ?? '',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: HqnhatScheduleChange) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: HqnhatScheduleChange) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleApprove = async (item: HqnhatScheduleChange) => {
    try {
      await updateMut.mutateAsync({ id: item.id, payload: { status: 1 } });
      refetch();
    } catch (_) {}
  };

  const handleReject = async (item: HqnhatScheduleChange) => {
    try {
      await updateMut.mutateAsync({ id: item.id, payload: { status: 2 } });
      refetch();
    } catch (_) {}
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.schedule_id || form.schedule_id === 0) e.schedule_id = 'Chọn buổi học';
    if (!form.new_room_id && !form.new_lecturer_id && !form.new_date) {
      e.new_room_id = 'Phải có ít nhất 1 thay đổi (phòng/giảng viên/ngày)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: HqnhatScheduleChangeCreatePayload = {
        schedule_id: Number(form.schedule_id),
        new_room_id: form.new_room_id ? Number(form.new_room_id) : undefined,
        new_lecturer_id: form.new_lecturer_id ? Number(form.new_lecturer_id) : undefined,
        new_date: form.new_date || undefined,
        reason: form.reason || undefined,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái duyệt</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả</option>
            <option value="0">Chờ duyệt</option>
            <option value="1">Đã duyệt</option>
            <option value="2">Từ chối</option>
          </select>
        </div>
        {statusFilter && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setStatusFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Tạo yêu cầu thay đổi
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Buổi học</TableHeadCell>
            <TableHeadCell>Phòng cũ → mới</TableHeadCell>
            <TableHeadCell>GV cũ → mới</TableHeadCell>
            <TableHeadCell>Ngày mới</TableHeadCell>
            <TableHeadCell>Lý do</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-48">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có yêu cầu thay đổi nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="text-sm">{getScheduleLabel(item.schedule_id)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.old_room_id !== null ? `#${item.old_room_id}` : '—'} → {item.new_room_id !== null ? `#${item.new_room_id}` : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.old_lecturer_id !== null ? `#${item.old_lecturer_id}` : '—'} → {item.new_lecturer_id !== null ? `#${item.new_lecturer_id}` : '—'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.old_date ? formatDate(item.old_date) : '—'} → {item.new_date ? formatDate(item.new_date) : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))] max-w-[12rem] truncate" title={item.reason ?? ''}>
                    {item.reason ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
                      {item.status === 0 && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(item)} title="Duyệt"><CheckCircle2 className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReject(item)} title="Từ chối"><XCircle className="h-4 w-4 text-red-500" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa yêu cầu thay đổi' : 'Tạo yêu cầu thay đổi lịch học'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              {editing ? 'Lưu thay đổi' : 'Tạo yêu cầu'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <FormField label="Buổi học" error={errors.schedule_id} required>
            <select value={form.schedule_id} onChange={(e) => setForm({ ...form, schedule_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn buổi học --</option>
              {schedules.map((s: HqnhatClassSchedule) => (
                <option key={s.id} value={s.id}>{getScheduleLabel(s.id)}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ID Phòng mới" error={errors.new_room_id}>
              <Input
                type="number"
                value={form.new_room_id ?? ''}
                onChange={(e) => setForm({ ...form, new_room_id: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Để trống nếu không đổi"
                min={1}
              />
            </FormField>
            <FormField label="ID Giảng viên mới">
              <Input
                type="number"
                value={form.new_lecturer_id ?? ''}
                onChange={(e) => setForm({ ...form, new_lecturer_id: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Để trống nếu không đổi"
                min={1}
              />
            </FormField>
          </div>
          <FormField label="Ngày mới">
            <Input
              type="date"
              value={form.new_date ?? ''}
              onChange={(e) => setForm({ ...form, new_date: e.target.value })}
            />
          </FormField>
          <FormField label="Lý do thay đổi">
            <textarea
              value={form.reason ?? ''}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              placeholder="VD: Giảng viên bận công tác đột xuất"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa yêu cầu"
        description={`Bạn có chắc muốn xóa yêu cầu thay đổi #${deleting?.id}?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Chi tiết yêu cầu thay đổi #${detailData?.data?.id ?? ''}`} size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1 col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Buổi học</p>
                <p className="text-sm font-medium">{getScheduleLabel(detailData.data.schedule_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Phòng</p>
                <p className="font-mono text-sm">{detailData.data.old_room_id !== null ? `#${detailData.data.old_room_id}` : '—'} → {detailData.data.new_room_id !== null ? `#${detailData.data.new_room_id}` : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Giảng viên</p>
                <p className="font-mono text-sm">{detailData.data.old_lecturer_id !== null ? `#${detailData.data.old_lecturer_id}` : '—'} → {detailData.data.new_lecturer_id !== null ? `#${detailData.data.new_lecturer_id}` : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày</p>
                <p className="text-sm">{detailData.data.old_date ? formatDate(detailData.data.old_date) : '—'} → {detailData.data.new_date ? formatDate(detailData.data.new_date) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
                <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant} dot>{STATUS_CONFIG[detailData.data.status]?.label}</Badge>
              </div>
              {detailData.data.reason && (
                <div className="space-y-1 col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Lý do</p>
                  <p className="text-sm">{detailData.data.reason}</p>
                </div>
              )}
              {detailData.data.created_at && (
                <div className="space-y-1 col-span-2 text-xs text-[rgb(var(--text-muted))]">
                  Tạo lúc: {formatDateTime(detailData.data.created_at)}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              {detailData.data.status === 0 && (
                <>
                  <Button variant="outline" onClick={() => { setDetailOpen(false); handleApprove(detailData.data); }} className="text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Duyệt
                  </Button>
                  <Button variant="outline" onClick={() => { setDetailOpen(false); handleReject(detailData.data); }} className="text-red-600">
                    <XCircle className="h-4 w-4 mr-1" /> Từ chối
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}
