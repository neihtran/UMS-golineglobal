import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, CalendarOff, CheckCircle, XCircle, Send, Ban } from 'lucide-react';
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
  useLeaveRequests,
  useLeaveRequest,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useDeleteLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useCancelLeaveRequest,
  useSubmitLeaveRequest,
} from '@/hooks/useHrm';
import { useEmployeeProfiles, useLeaveTypes } from '@/hooks/useHrm';
import { formatDateVietnam, formatDateTimeVietnam, toDateInputValue } from '@/utils/formatters';
import type { LeaveRequest, LeaveRequestCreatePayload, LeaveRequestStatus } from '@/types/hrm.types';

const STATUS_OPTS: { value: LeaveRequestStatus; label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }[] = [
  { value: 'draft', label: 'Nháp', variant: 'neutral' },
  { value: 'pending', label: 'Chờ duyệt', variant: 'warning' },
  { value: 'approved', label: 'Đã duyệt', variant: 'success' },
  { value: 'rejected', label: 'Từ chối', variant: 'error' },
  { value: 'cancelled', label: 'Đã hủy', variant: 'info' as any },
];

const emptyForm = (): LeaveRequestCreatePayload & { file?: File | null } => ({
  employee_id: 0,
  leave_type_id: 0,
  from_date: '',
  to_date: '',
  total_days: null,
  reason: null,
  status: 'draft',
  note: null,
  file_path: null,
  file: null,
});

export function LeaveRequestSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'created_at',
    sort_direction: 'desc' as const,
    status: statusFilter ? (statusFilter as LeaveRequestStatus) : undefined,
  };

  const { data, isLoading, isFetching } = useLeaveRequests(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const { data: empData } = useEmployeeProfiles({ per_page: 100 });
  const employees = Array.isArray(empData?.data) ? empData.data : [];
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const { data: ltData } = useLeaveTypes({ per_page: 100, status: 1 });
  const leaveTypes = Array.isArray(ltData?.data) ? ltData.data : [];
  const leaveTypeMap = new Map(leaveTypes.map((lt) => [lt.id, lt]));

  const getEmployeeLabel = (id: number | null | undefined) => {
    if (!id) return '—';
    const e = employeeMap.get(id);
    return e ? `${e.full_name} (${e.employee_code})` : `#${id}`;
  };
  const getLeaveTypeLabel = (id: number | null | undefined) => {
    if (!id) return '—';
    const lt = leaveTypeMap.get(id);
    return lt ? `${lt.name} (${lt.code})` : `#${id}`;
  };
  const getApproverLabel = (id: number | null | undefined) => {
    if (!id) return '—';
    const e = employeeMap.get(id);
    return e ? e.full_name : `#${id}`;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveRequest | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<LeaveRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowAction, setWorkflowAction] = useState<'approve' | 'reject' | 'cancel' | 'submit' | null>(null);
  const [form, setForm] = useState<LeaveRequestCreatePayload & { file?: File | null }>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useLeaveRequest(detailId ?? undefined);
  const createMut = useCreateLeaveRequest();
  const updateMut = useUpdateLeaveRequest();
  const deleteMut = useDeleteLeaveRequest();
  const approveMut = useApproveLeaveRequest();
  const rejectMut = useRejectLeaveRequest();
  const cancelMut = useCancelLeaveRequest();
  const submitMut = useSubmitLeaveRequest();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: LeaveRequest) => {
    setEditing(item);
    setForm({
      employee_id: item.employee_id,
      leave_type_id: item.leave_type_id,
      from_date: item.from_date,
      to_date: item.to_date,
      total_days: item.total_days,
      reason: item.reason,
      status: item.status,
      note: item.note,
      file_path: item.file_path,
      file: null,
    });
    setErrors({}); setSubmitError(null); setModalOpen(true);
  };
  const openDetail = (item: LeaveRequest) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: LeaveRequest) => { setDeleting(item); setDeleteOpen(true); };

  const openWorkflow = (item: LeaveRequest, action: 'approve' | 'reject' | 'cancel' | 'submit') => {
    setDeleting(item);
    setWorkflowAction(action);
    setWorkflowOpen(true);
  };

  const filtered = search
    ? items.filter(it => {
        const name = it.employee?.full_name ?? employeeMap.get(it.employee_id)?.full_name ?? '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : items;

  const resetFilters = () => { setSearch(''); setStatusFilter(''); setPage(1); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.employee_id) e.employee_id = 'Vui lòng chọn nhân viên';
    if (!form.leave_type_id) e.leave_type_id = 'Vui lòng chọn loại nghỉ';
    const from = toDateInputValue(form.from_date);
    const to = toDateInputValue(form.to_date);
    if (!from) e.from_date = 'Vui lòng chọn từ ngày';
    if (!to) e.to_date = 'Vui lòng chọn đến ngày';
    if (from && to && from > to) e.to_date = 'Đến ngày phải sau từ ngày';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const { file, ...rest } = form;
      const payload = { ...rest, file: file || undefined };
      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload: rest })
        : await createMut.mutateAsync(payload);
      setModalOpen(false);
    } catch (err: any) { setSubmitError(err?.message || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await deleteMut.mutateAsync(deleting.id); setDeleteOpen(false); setDeleting(null); } catch (_) {}
  };

  const handleWorkflow = async () => {
    if (!deleting || !workflowAction) return;
    try {
      const id = deleting.id;
      if (workflowAction === 'approve') await approveMut.mutateAsync(id);
      else if (workflowAction === 'reject') await rejectMut.mutateAsync(id);
      else if (workflowAction === 'cancel') await cancelMut.mutateAsync(id);
      else if (workflowAction === 'submit') await submitMut.mutateAsync(id);
      setWorkflowOpen(false); setDeleting(null); setWorkflowAction(null);
    } catch (_) {}
  };

  const workflowPending = approveMut.isPending || rejectMut.isPending || cancelMut.isPending || submitMut.isPending;
  const workflowConfig = {
    approve: { title: 'Duyệt đơn nghỉ phép', desc: 'Xác nhận duyệt đơn nghỉ phép này?', variant: 'primary' as const, icon: <CheckCircle className="h-4 w-4 mr-1" />, text: 'Duyệt' },
    reject: { title: 'Từ chối đơn nghỉ phép', desc: 'Xác nhận từ chối đơn nghỉ phép này?', variant: 'danger' as const, icon: <XCircle className="h-4 w-4 mr-1" />, text: 'Từ chối' },
    cancel: { title: 'Hủy đơn nghỉ phép', desc: 'Xác nhận hủy đơn nghỉ phép này?', variant: 'danger' as const, icon: <Ban className="h-4 w-4 mr-1" />, text: 'Hủy đơn' },
    submit: { title: 'Gửi đơn nghỉ phép', desc: 'Gửi đơn lên cấp duyệt?', variant: 'primary' as const, icon: <Send className="h-4 w-4 mr-1" />, text: 'Gửi duyệt' },
  }[workflowAction || 'approve'];

  const statusBadge = (s: LeaveRequestStatus) => STATUS_OPTS.find(o => o.value === s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Tìm theo tên NV..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]">
            <option value="">Tất cả</option>
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {(search || statusFilter) && <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tạo đơn nghỉ</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân viên</TableHeadCell>
            <TableHeadCell>Loại nghỉ</TableHeadCell>
            <TableHeadCell>Từ ngày</TableHeadCell>
            <TableHeadCell>Đến ngày</TableHeadCell>
            <TableHeadCell>Số ngày</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-56">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có đơn nghỉ phép nào</TableCell></TableRow>
          ) : (
            filtered.map((item, i) => {
              const sb = statusBadge(item.status);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell className="font-medium">{item.employee?.full_name ? `${item.employee.full_name} (${item.employee.employee_code})` : getEmployeeLabel(item.employee_id)}</TableCell>
                  <TableCell>{item.leave_type?.name ? `${item.leave_type.name} (${item.leave_type.code})` : getLeaveTypeLabel(item.leave_type_id)}</TableCell>
                  <TableCell className="text-sm">{formatDateVietnam(item.from_date)}</TableCell>
                  <TableCell className="text-sm">{formatDateVietnam(item.to_date)}</TableCell>
                  <TableCell>{item.total_days ?? '—'}</TableCell>
                  <TableCell>{sb && <Badge variant={sb.variant} size="sm">{sb.label}</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết"><Eye className="h-4 w-4" /></Button>
                      {(item.status === 'draft' || item.status === 'pending') && (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Sửa"><Edit className="h-4 w-4" /></Button>
                      )}
                      {item.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => openWorkflow(item, 'submit')} title="Gửi duyệt" className="text-blue-600"><Send className="h-4 w-4" /></Button>
                      )}
                      {item.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openWorkflow(item, 'approve')} title="Duyệt" className="text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openWorkflow(item, 'reject')} title="Từ chối" className="text-red-600"><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
                      {(item.status === 'draft' || item.status === 'pending' || item.status === 'approved') && (
                        <Button variant="ghost" size="sm" onClick={() => openWorkflow(item, 'cancel')} title="Hủy đơn"><Ban className="h-4 w-4 text-orange-500" /></Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openDelete(item)} title="Xóa"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 15, 25, 50]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa đơn nghỉ phép' : 'Tạo đơn nghỉ phép'} size="lg" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nhân viên" error={errors.employee_id} required>
              <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">-- Chọn --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>)}
              </select>
            </FormField>
            <FormField label="Loại nghỉ" error={errors.leave_type_id} required>
              <select value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">-- Chọn --</option>
                {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Từ ngày" error={errors.from_date} required>
              <Input type="date" value={toDateInputValue(form.from_date)} onChange={(e) => setForm({ ...form, from_date: e.target.value })} />
            </FormField>
            <FormField label="Đến ngày" error={errors.to_date} required>
              <Input type="date" value={toDateInputValue(form.to_date)} onChange={(e) => setForm({ ...form, to_date: e.target.value })} />
            </FormField>
            <FormField label="Số ngày">
              <Input type="number" step="0.5" value={form.total_days ?? ''} onChange={(e) => setForm({ ...form, total_days: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
          </div>
          <FormField label="Lý do">
            <Input value={form.reason ?? ''} onChange={(e) => setForm({ ...form, reason: e.target.value || null })} placeholder="Lý do nghỉ phép" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Trạng thái">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeaveRequestStatus })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="File đính kèm (PDF)">
              <input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className="block w-full text-sm text-[rgb(var(--text-muted))] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgb(var(--bg-secondary))] file:text-[rgb(var(--text-primary))] hover:file:bg-[rgb(var(--bg-hover))]" />
              {editing?.file_path && !form.file && <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">Hiện có: {editing.file_path}</p>}
            </FormField>
          </div>
          <FormField label="Ghi chú">
            <Input value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value || null })} />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa" description={`Xóa đơn nghỉ phép #${deleting?.id}?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <ConfirmModal open={workflowOpen} onClose={() => { setWorkflowOpen(false); setWorkflowAction(null); setDeleting(null); }} onConfirm={handleWorkflow} title={workflowConfig.title} description={workflowConfig.desc} confirmText={workflowConfig.text} variant={workflowConfig.variant} loading={workflowPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết đơn nghỉ phép" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b"><CalendarOff className="h-5 w-5 text-[rgb(var(--primary))]" /><h3 className="text-lg font-bold">{detailData.data.employee?.full_name ?? getEmployeeLabel(detailData.data.employee_id)}</h3>{(() => { const sb = statusBadge(detailData.data.status); return sb ? <Badge variant={sb.variant} size="sm">{sb.label}</Badge> : null; })()}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại nghỉ</p><p className="font-medium">{detailData.data.leave_type?.name ?? getLeaveTypeLabel(detailData.data.leave_type_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số ngày</p><p className="font-medium">{detailData.data.total_days ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Từ ngày</p><p className="font-medium">{formatDateVietnam(detailData.data.from_date)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đến ngày</p><p className="font-medium">{formatDateVietnam(detailData.data.to_date)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Người duyệt</p><p className="font-medium">{detailData.data.approver?.full_name ?? getApproverLabel(detailData.data.approved_by)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày duyệt</p><p className="font-medium">{detailData.data.approved_at ? formatDateTimeVietnam(detailData.data.approved_at) : '—'}</p></div>
            </div>
            {detailData.data.reason && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Lý do</p><p className="font-medium">{detailData.data.reason}</p></div>}
            {detailData.data.note && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p><p className="font-medium">{detailData.data.note}</p></div>}
            {detailData.data.file_path && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">File đính kèm</p><a href={detailData.data.file_path} target="_blank" rel="noopener noreferrer" className="font-medium text-[rgb(var(--primary))] hover:underline">Xem file</a></div>}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              {(detailData.data.status === 'draft' || detailData.data.status === 'pending') && (
                <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>
    </div>
  );
}

export default LeaveRequestSheet;
