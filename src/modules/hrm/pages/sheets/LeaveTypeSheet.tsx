import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, CalendarOff } from 'lucide-react';
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
  useLeaveTypes,
  useLeaveType,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from '@/hooks/useHrm';
import type { LeaveType, LeaveTypeCreatePayload } from '@/types/hrm.types';

const emptyForm = (): LeaveTypeCreatePayload => ({
  code: '',
  name: '',
  is_paid: true,
  max_days: null,
  description: null,
  status: 1,
});

export function LeaveTypeSheet() {
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

  const { data, isLoading, isFetching } = useLeaveTypes(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<LeaveType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<LeaveTypeCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useLeaveType(detailId ?? undefined);
  const createMut = useCreateLeaveType();
  const updateMut = useUpdateLeaveType();
  const deleteMut = useDeleteLeaveType();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: LeaveType) => {
    setEditing(item);
    setForm({ code: item.code, name: item.name, is_paid: item.is_paid, max_days: item.max_days, description: item.description, status: item.status });
    setErrors({}); setSubmitError(null); setModalOpen(true);
  };
  const openDetail = (item: LeaveType) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: LeaveType) => { setDeleting(item); setDeleteOpen(true); };

  const resetFilters = () => { setSearch(''); setStatusFilter(''); setPage(1); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã không được để trống';
    if (!form.name.trim()) e.name = 'Tên không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: LeaveTypeCreatePayload = {
        code: form.code.trim(),
        name: form.name.trim(),
        is_paid: form.is_paid ?? true,
        max_days: form.max_days ?? null,
        status: form.status ?? 1,
        description: form.description?.trim() || null,
      };
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload })
        : await createMut.mutateAsync(payload);
      setModalOpen(false);
    } catch (err: any) { setSubmitError(err?.message || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await deleteMut.mutateAsync(deleting.id); setDeleteOpen(false); setDeleting(null); } catch (_) {}
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Tìm theo mã, tên..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]">
            <option value="">Tất cả</option>
            <option value="1">Hoạt động</option>
            <option value="0">Ngừng</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm loại nghỉ</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Tên loại nghỉ</TableHeadCell>
            <TableHeadCell>Hưởng lương</TableHeadCell>
            <TableHeadCell>Số ngày tối đa</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : items.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có loại nghỉ nào</TableCell></TableRow>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                <TableCell className="font-mono font-medium">{item.code}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarOff className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_paid ? 'success' : 'neutral'} size="sm">{item.is_paid ? 'Có lương' : 'Không lương'}</Badge>
                </TableCell>
                <TableCell>{item.max_days ?? '—'}</TableCell>
                <TableCell><Badge variant={item.status === 1 ? 'success' : 'error'} size="sm">{item.status === 1 ? 'Hoạt động' : 'Ngừng'}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Sửa"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(item)} title="Xóa"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 15, 25, 50]} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa loại nghỉ' : 'Thêm loại nghỉ'}
        size="md"
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}
      >
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã" error={errors.code} required><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: PHEP_NAM, OM" /></FormField>
            <FormField label="Tên" error={errors.name} required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Nghỉ phép năm" /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Hưởng lương">
              <select value={form.is_paid ? 'true' : 'false'} onChange={(e) => setForm({ ...form, is_paid: e.target.value === 'true' })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="true">Có lương</option>
                <option value="false">Không lương</option>
              </select>
            </FormField>
            <FormField label="Số ngày tối đa">
              <Input type="number" value={form.max_days ?? ''} onChange={(e) => setForm({ ...form, max_days: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Trạng thái">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
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

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa" description={`Bạn có chắc muốn xóa loại nghỉ "${deleting?.name}"?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết loại nghỉ" size="sm">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b"><CalendarOff className="h-5 w-5 text-[rgb(var(--primary))]" /><h3 className="text-lg font-bold">{detailData.data.name}</h3><Badge variant="neutral" size="sm">{detailData.data.code}</Badge></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Hưởng lương</p><Badge variant={detailData.data.is_paid ? 'success' : 'neutral'} size="sm">{detailData.data.is_paid ? 'Có lương' : 'Không lương'}</Badge></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số ngày tối đa</p><p className="font-medium">{detailData.data.max_days ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trạng thái</p><Badge variant={detailData.data.status === 1 ? 'success' : 'error'} size="sm">{detailData.data.status === 1 ? 'Hoạt động' : 'Ngừng'}</Badge></div>
            </div>
            {detailData.data.description && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p><p className="font-medium">{detailData.data.description}</p></div>}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>
    </div>
  );
}

export default LeaveTypeSheet;
