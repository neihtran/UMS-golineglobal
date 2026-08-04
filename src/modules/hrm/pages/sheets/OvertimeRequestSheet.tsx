import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, Timer, CheckCircle, XCircle, Send, Ban } from 'lucide-react';
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
  useOvertimeRequests,
  useOvertimeRequest,
  useCreateOvertimeRequest,
  useUpdateOvertimeRequest,
  useDeleteOvertimeRequest,
  useApproveOvertimeRequest,
  useRejectOvertimeRequest,
  useCancelOvertimeRequest,
  useSubmitOvertimeRequest,
  useEmployeeProfiles,
} from '@/hooks/useHrm';
import { formatDateTimeVietnam, formatTimeVietnam, formatDateVietnam, toDateInputValue } from '@/utils/formatters';
import type { OvertimeRequest, OvertimeRequestCreatePayload, OvertimeRequestStatus } from '@/types/hrm.types';

const STATUS_OPTS: { value: OvertimeRequestStatus; label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }[] = [
  { value: 'draft', label: 'Nháp', variant: 'neutral' },
  { value: 'pending', label: 'Chờ duyệt', variant: 'warning' },
  { value: 'approved', label: 'Đã duyệt', variant: 'success' },
  { value: 'rejected', label: 'Từ chối', variant: 'error' },
  { value: 'cancelled', label: 'Đã hủy', variant: 'info' as any },
];

/** Tách phần "HH:mm" từ datetime đã lưu để default input time */
const timePartOf = (s?: string | null) => (s ? s.slice(11, 16) : '');

/** Ghép overtime_date + time chọn được thành "YYYY-MM-DD HH:mm:ss" */
const combineDateTime = (date: string, hhmm: string) => {
  if (!hhmm) return '';
  return `${date} ${hhmm}:00`;
};

const today = () => { const d = new Date(); const pad = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const emptyForm = (): OvertimeRequestCreatePayload => ({
  employee_id: 0,
  overtime_date: today(),
  start_time: '',
  end_time: '',
  total_hours: null,
  reason: null,
  status: 'draft',
  note: null,
});

export function OvertimeRequestSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'overtime_date',
    sort_direction: 'desc' as const,
    status: statusFilter ? (statusFilter as OvertimeRequestStatus) : undefined,
  };

  const { data, isLoading, isFetching } = useOvertimeRequests(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const { data: empData } = useEmployeeProfiles({ per_page: 100 });
  const employees = Array.isArray(empData?.data) ? empData.data : [];

  const employeeMap = Object.fromEntries(employees.map(e => [e.id, e]));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OvertimeRequest | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<OvertimeRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowAction, setWorkflowAction] = useState<'approve' | 'reject' | 'cancel' | 'submit' | null>(null);
  const [form, setForm] = useState<OvertimeRequestCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useOvertimeRequest(detailId ?? undefined);
  const createMut = useCreateOvertimeRequest();
  const updateMut = useUpdateOvertimeRequest();
  const deleteMut = useDeleteOvertimeRequest();
  const approveMut = useApproveOvertimeRequest();
  const rejectMut = useRejectOvertimeRequest();
  const cancelMut = useCancelOvertimeRequest();
  const submitMut = useSubmitOvertimeRequest();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: OvertimeRequest) => {
    setEditing(item);
    setForm({
      employee_id: item.employee_id,
      overtime_date: toDateInputValue(item.overtime_date),
      start_time: item.start_time,
      end_time: item.end_time,
      total_hours: item.total_hours,
      reason: item.reason,
      status: item.status,
      note: item.note,
    });
    setErrors({}); setSubmitError(null); setModalOpen(true);
  };
  const openDetail = (item: OvertimeRequest) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: OvertimeRequest) => { setDeleting(item); setDeleteOpen(true); };

  const openWorkflow = (item: OvertimeRequest, action: 'approve' | 'reject' | 'cancel' | 'submit') => {
    setDeleting(item);
    setWorkflowAction(action);
    setWorkflowOpen(true);
  };

  const filtered = search
    ? items.filter(it => {
        const name = employeeMap[it.employee_id]?.full_name || '';
        const code = employeeMap[it.employee_id]?.employee_code || '';
        return name.toLowerCase().includes(search.toLowerCase()) || code.toLowerCase().includes(search.toLowerCase());
      })
    : items;

  const resetFilters = () => { setSearch(''); setStatusFilter(''); setPage(1); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.employee_id) e.employee_id = 'Vui lòng chọn nhân viên';
    if (!form.overtime_date) e.overtime_date = 'Vui lòng chọn ngày OT';
    if (!form.start_time) e.start_time = 'Vui lòng nhập giờ bắt đầu';
    if (!form.end_time) e.end_time = 'Vui lòng nhập giờ kết thúc';
    if (form.start_time && form.end_time && form.start_time >= form.end_time) e.end_time = 'Giờ kết thúc phải sau giờ bắt đầu';
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
    approve: { title: 'Duyệt đơn OT', desc: 'Xác nhận duyệt đơn đăng ký OT?', variant: 'primary' as const, icon: <CheckCircle className="h-4 w-4 mr-1" />, text: 'Duyệt' },
    reject: { title: 'Từ chối đơn OT', desc: 'Xác nhận từ chối đơn đăng ký OT?', variant: 'danger' as const, icon: <XCircle className="h-4 w-4 mr-1" />, text: 'Từ chối' },
    cancel: { title: 'Hủy đơn OT', desc: 'Xác nhận hủy đơn đăng ký OT?', variant: 'danger' as const, icon: <Ban className="h-4 w-4 mr-1" />, text: 'Hủy đơn' },
    submit: { title: 'Gửi đơn OT', desc: 'Gửi đơn OT lên cấp duyệt?', variant: 'primary' as const, icon: <Send className="h-4 w-4 mr-1" />, text: 'Gửi duyệt' },
  }[workflowAction || 'approve'];

  const statusBadge = (s: OvertimeRequestStatus) => STATUS_OPTS.find(o => o.value === s);

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
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tạo đơn OT</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân viên</TableHeadCell>
            <TableHeadCell>Ngày OT</TableHeadCell>
            <TableHeadCell>Từ</TableHeadCell>
            <TableHeadCell>Đến</TableHeadCell>
            <TableHeadCell>Số giờ</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-56">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có đơn OT nào</TableCell></TableRow>
          ) : (
            filtered.map((item, i) => {
              const sb = statusBadge(item.status);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell className="font-medium">{employeeMap[item.employee_id]?.full_name ?? `#${item.employee_id}`}</TableCell>
                  <TableCell>{formatDateVietnam(item.overtime_date)}</TableCell>
                  <TableCell className="text-sm">{formatTimeVietnam(item.start_time)}</TableCell>
                  <TableCell className="text-sm">{formatTimeVietnam(item.end_time)}</TableCell>
                  <TableCell>{item.total_hours ?? '—'}</TableCell>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa đơn OT' : 'Tạo đơn OT'} size="lg" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <FormField label="Nhân viên" error={errors.employee_id} required>
            <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="0">-- Chọn --</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Ngày OT" error={errors.overtime_date} required>
              <Input type="date" value={form.overtime_date} onChange={(e) => setForm({ ...form, overtime_date: e.target.value })} />
            </FormField>
            <FormField label="Bắt đầu" error={errors.start_time} required>
              <Input type="time" value={timePartOf(form.start_time)} onChange={(e) => setForm({ ...form, start_time: combineDateTime(form.overtime_date, e.target.value) })} />
            </FormField>
            <FormField label="Kết thúc" error={errors.end_time} required>
              <Input type="time" value={timePartOf(form.end_time)} onChange={(e) => setForm({ ...form, end_time: combineDateTime(form.overtime_date, e.target.value) })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tổng giờ">
              <Input type="number" step="0.5" value={form.total_hours ?? ''} onChange={(e) => setForm({ ...form, total_hours: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Trạng thái">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OvertimeRequestStatus })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Lý do OT">
            <Input value={form.reason ?? ''} onChange={(e) => setForm({ ...form, reason: e.target.value || null })} />
          </FormField>
          <FormField label="Ghi chú">
            <Input value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value || null })} />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa" description={`Xóa đơn OT #${deleting?.id}?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <ConfirmModal open={workflowOpen} onClose={() => { setWorkflowOpen(false); setWorkflowAction(null); setDeleting(null); }} onConfirm={handleWorkflow} title={workflowConfig.title} description={workflowConfig.desc} confirmText={workflowConfig.text} variant={workflowConfig.variant} loading={workflowPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết đơn OT" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b"><Timer className="h-5 w-5 text-[rgb(var(--primary))]" /><h3 className="text-lg font-bold">{employeeMap[detailData.data.employee_id]?.full_name ?? `NV #${detailData.data.employee_id}`}</h3>{(() => { const sb = statusBadge(detailData.data.status); return sb ? <Badge variant={sb.variant} size="sm">{sb.label}</Badge> : null; })()}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày OT</p><p className="font-medium">{formatDateVietnam(detailData.data.overtime_date)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tổng giờ</p><p className="font-medium">{detailData.data.total_hours ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Bắt đầu</p><p className="font-medium">{formatTimeVietnam(detailData.data.start_time)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Kết thúc</p><p className="font-medium">{formatTimeVietnam(detailData.data.end_time)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Người duyệt</p><p className="font-medium">{detailData.data.approver?.full_name ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày duyệt</p><p className="font-medium">{formatDateTimeVietnam(detailData.data.approved_at)}</p></div>
            </div>
            {detailData.data.reason && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Lý do</p><p className="font-medium">{detailData.data.reason}</p></div>}
            {detailData.data.note && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p><p className="font-medium">{detailData.data.note}</p></div>}
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

export default OvertimeRequestSheet;
