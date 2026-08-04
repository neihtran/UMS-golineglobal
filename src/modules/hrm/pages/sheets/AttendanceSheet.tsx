import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, ClipboardCheck } from 'lucide-react';
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
  useAttendances,
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
  useEmployeeProfiles,
  useWorkSchedules,
} from '@/hooks/useHrm';
import type { Attendance, AttendanceCreatePayload, AttendanceStatus } from '@/types/hrm.types';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }[] = [
  { value: 'present', label: 'Có mặt', variant: 'success' },
  { value: 'absent', label: 'Vắng', variant: 'error' },
  { value: 'leave', label: 'Nghỉ phép', variant: 'warning' },
  { value: 'holiday', label: 'Ngày lễ', variant: 'info' as any },
  { value: 'remote', label: 'Làm từ xa', variant: 'neutral' },
];

const fmtTime = (t?: string | null) => {
  if (!t) return '—';
  if (t.includes('T')) {
    const hh = t.slice(11, 16);
    return hh || '—';
  }
  return t.slice(0, 5);
};

/** "YYYY-MM-DDTHH:mm:ss.000000Z" → "YYYY-MM-DD" */
const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  return d.slice(0, 10);
};

// Helpers: ghép date + time thành "YYYY-MM-DD HH:mm:ss" cho backend
// Backend expect datetime đầy đủ. UI chỉ chọn giờ (HH:mm), ghép với attendance_date.

/** Từ giờ "HH:mm" → "YYYY-MM-DD HH:mm:ss" (ghép với attendance_date) */
const combineDateTime = (date: string, hhmm: string) => {
  if (!hhmm) return null;
  return `${date} ${hhmm}:00`;
};

/** Tách phần "HH:mm" từ datetime đã lưu để default input time */
const timePartOf = (s?: string | null) => (s ? s.slice(11, 16) : '');

const emptyForm = (): AttendanceCreatePayload => ({
  employee_id: 0,
  attendance_date: new Date().toISOString().slice(0, 10),
  schedule_id: null,
  check_in: null,
  check_out: null,
  working_minutes: null,
  late_minutes: null,
  early_leave_minutes: null,
  overtime_minutes: null,
  attendance_status: 'present',
  remark: null,
});

export function AttendanceSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'attendance_date',
    sort_direction: 'desc' as const,
    attendance_status: statusFilter ? (statusFilter as AttendanceStatus) : undefined,
  };

  const { data, isLoading, isFetching } = useAttendances(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const { data: empData } = useEmployeeProfiles({ per_page: 100 });
  const employees = Array.isArray(empData?.data) ? empData.data : [];
  const { data: wsData } = useWorkSchedules({ per_page: 100, status: 1 });
  const workSchedules = Array.isArray(wsData?.data) ? wsData.data : [];
  const getScheduleName = (id: number | null) => {
    if (!id) return '—';
    const found = workSchedules.find(s => s.id === id);
    return found ? found.name : `#${id}`;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Attendance | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<AttendanceCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useAttendance(detailId ?? undefined);
  const createMut = useCreateAttendance();
  const updateMut = useUpdateAttendance();
  const deleteMut = useDeleteAttendance();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: Attendance) => {
    setEditing(item);
    setForm({
      employee_id: item.employee_id,
      attendance_date: fmtDate(item.attendance_date),
      schedule_id: item.schedule_id,
      check_in: item.check_in,
      check_out: item.check_out,
      working_minutes: item.working_minutes,
      late_minutes: item.late_minutes,
      early_leave_minutes: item.early_leave_minutes,
      overtime_minutes: item.overtime_minutes,
      attendance_status: item.attendance_status,
      remark: item.remark,
    });
    setErrors({}); setSubmitError(null); setModalOpen(true);
  };
  const openDetail = (item: Attendance) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: Attendance) => { setDeleting(item); setDeleteOpen(true); };

  const filtered = search
    ? items.filter(it => (it.employee?.full_name || '').toLowerCase().includes(search.toLowerCase()))
    : items;

  const resetFilters = () => { setSearch(''); setStatusFilter(''); setPage(1); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.employee_id) e.employee_id = 'Vui lòng chọn nhân viên';
    if (!form.attendance_date) e.attendance_date = 'Vui lòng chọn ngày';
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

  const statusBadge = (s: AttendanceStatus) => STATUS_OPTIONS.find(o => o.value === s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Tìm theo tên nhân viên..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]">
            <option value="">Tất cả</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {(search || statusFilter) && <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm chấm công</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân viên</TableHeadCell>
            <TableHeadCell>Ngày</TableHeadCell>
            <TableHeadCell>Ca</TableHeadCell>
            <TableHeadCell>Check-in</TableHeadCell>
            <TableHeadCell>Check-out</TableHeadCell>
            <TableHeadCell>Phút làm</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có bản ghi chấm công</TableCell></TableRow>
          ) : (
            filtered.map((item, i) => {
              const sb = statusBadge(item.attendance_status);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell className="font-medium">{item.employee?.full_name ?? `#${item.employee_id}`}</TableCell>
                  <TableCell>{fmtDate(item.attendance_date)}</TableCell>
                  <TableCell>{getScheduleName(item.schedule_id)}</TableCell>
                  <TableCell>{fmtTime(item.check_in)}</TableCell>
                  <TableCell>{fmtTime(item.check_out)}</TableCell>
                  <TableCell>{item.working_minutes ?? '—'}</TableCell>
                  <TableCell>{sb && <Badge variant={sb.variant} size="sm">{sb.label}</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Sửa"><Edit className="h-4 w-4" /></Button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa chấm công' : 'Thêm chấm công'} size="lg" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nhân viên" error={errors.employee_id} required>
              <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">-- Chọn --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>)}
              </select>
            </FormField>
            <FormField label="Ngày" error={errors.attendance_date} required>
              <Input type="date" value={form.attendance_date} onChange={(e) => setForm({ ...form, attendance_date: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Ca làm việc">
              <select value={form.schedule_id ?? ''} onChange={(e) => setForm({ ...form, schedule_id: e.target.value ? Number(e.target.value) : null })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="">-- Không --</option>
                {workSchedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormField>
            <FormField label="Check-in">
              <Input
                type="time"
                value={timePartOf(form.check_in)}
                onChange={(e) => setForm({ ...form, check_in: combineDateTime(form.attendance_date, e.target.value) })}
              />
            </FormField>
            <FormField label="Check-out">
              <Input
                type="time"
                value={timePartOf(form.check_out)}
                onChange={(e) => setForm({ ...form, check_out: combineDateTime(form.attendance_date, e.target.value) })}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <FormField label="Phút làm">
              <Input type="number" value={form.working_minutes ?? ''} onChange={(e) => setForm({ ...form, working_minutes: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Đi muộn (phút)">
              <Input type="number" value={form.late_minutes ?? ''} onChange={(e) => setForm({ ...form, late_minutes: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Về sớm (phút)">
              <Input type="number" value={form.early_leave_minutes ?? ''} onChange={(e) => setForm({ ...form, early_leave_minutes: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Tăng ca (phút)">
              <Input type="number" value={form.overtime_minutes ?? ''} onChange={(e) => setForm({ ...form, overtime_minutes: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
          </div>
          <FormField label="Trạng thái">
            <select value={form.attendance_status} onChange={(e) => setForm({ ...form, attendance_status: e.target.value as AttendanceStatus })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <FormField label="Ghi chú">
            <Input value={form.remark ?? ''} onChange={(e) => setForm({ ...form, remark: e.target.value || null })} />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa" description={`Xóa bản ghi chấm công ngày ${fmtDate(deleting?.attendance_date)}?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết chấm công" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b"><ClipboardCheck className="h-5 w-5 text-[rgb(var(--primary))]" /><h3 className="text-lg font-bold">{detailData.data.employee?.full_name ?? `NV #${detailData.data.employee_id}`}</h3></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày</p><p className="font-medium">{fmtDate(detailData.data.attendance_date)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ca</p><p className="font-medium">{getScheduleName(detailData.data.schedule_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Check-in</p><p className="font-medium">{fmtTime(detailData.data.check_in)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Check-out</p><p className="font-medium">{fmtTime(detailData.data.check_out)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Phút làm</p><p className="font-medium">{detailData.data.working_minutes ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trạng thái</p>{(() => { const sb = statusBadge(detailData.data.attendance_status); return sb ? <Badge variant={sb.variant} size="sm">{sb.label}</Badge> : null; })()}</div>
            </div>
            {detailData.data.remark && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p><p className="font-medium">{detailData.data.remark}</p></div>}
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

export default AttendanceSheet;
