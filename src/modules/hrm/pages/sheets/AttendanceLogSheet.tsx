import { useState } from 'react';
import { Plus, Search, Eye, RotateCcw, History, LogIn, LogOut } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { usePagination } from '@/hooks';
import {
  useAttendanceLogs,
  useAttendanceLog,
  useCreateAttendanceLog,
  useEmployeeProfiles,
  useAttendances,
} from '@/hooks/useHrm';
import { formatDateTimeVietnam } from '@/utils/formatters';
import type { AttendanceLog, AttendanceLogCreatePayload, AttendanceLogAction, AttendanceLogDeviceType } from '@/types/hrm.types';

const ACTION_OPTS: { value: AttendanceLogAction; label: string; icon: React.ReactNode; variant: 'success' | 'warning' }[] = [
  { value: 'check_in', label: 'Check-in', icon: <LogIn className="h-3 w-3" />, variant: 'success' },
  { value: 'check_out', label: 'Check-out', icon: <LogOut className="h-3 w-3" />, variant: 'warning' },
];

const DEVICE_OPTS: { value: AttendanceLogDeviceType; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'face', label: 'Nhận diện khuôn mặt' },
  { value: 'fingerprint', label: 'Vân tay' },
  { value: 'card', label: 'Thẻ từ' },
];

const emptyForm = (): AttendanceLogCreatePayload => ({
  attendance_id: 0,
  employee_id: 0,
  device_id: '',
  action: 'check_in',
  device_type: 'web',
  device_name: null,
  ip_address: null,
  latitude: null,
  longitude: null,
  photo_path: null,
});

export function AttendanceLogSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'created_at',
    sort_direction: 'desc' as const,
    action: actionFilter ? (actionFilter as AttendanceLogAction) : undefined,
  };

  const { data, isLoading, isFetching } = useAttendanceLogs(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const { data: empData } = useEmployeeProfiles({ per_page: 100 });
  const employees = Array.isArray(empData?.data) ? empData.data : [];
  const { data: attData } = useAttendances({ per_page: 100 });
  const attendances = Array.isArray(attData?.data) ? attData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<AttendanceLogCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useAttendanceLog(detailId ?? undefined);
  const createMut = useCreateAttendanceLog();
  const isSubmitting = createMut.isPending;

  const openCreate = () => { setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openDetail = (item: AttendanceLog) => { setDetailId(item.id); setDetailOpen(true); };

  const filtered = search
    ? items.filter(it => (it.employee?.full_name || '').toLowerCase().includes(search.toLowerCase()) || (it.device_id || '').toLowerCase().includes(search.toLowerCase()))
    : items;

  const resetFilters = () => { setSearch(''); setActionFilter(''); setPage(1); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.attendance_id) e.attendance_id = 'Vui lòng chọn bản ghi chấm công';
    if (!form.employee_id) e.employee_id = 'Vui lòng chọn nhân viên';
    if (!form.device_id.trim()) e.device_id = 'Mã thiết bị không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      await createMut.mutateAsync({ ...form, device_id: form.device_id.trim() });
      setModalOpen(false);
    } catch (err: any) { setSubmitError(err?.message || 'Có lỗi xảy ra'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Tìm theo tên NV, mã thiết bị..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Hành động</label>
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]">
            <option value="">Tất cả</option>
            {ACTION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {(search || actionFilter) && <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Ghi nhận check-in/out</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân viên</TableHeadCell>
            <TableHeadCell>Hành động</TableHeadCell>
            <TableHeadCell>Thiết bị</TableHeadCell>
            <TableHeadCell>Mã thiết bị</TableHeadCell>
            <TableHeadCell>Địa chỉ IP</TableHeadCell>
            <TableHeadCell>Thời gian</TableHeadCell>
            <TableHeadCell className="text-right w-20">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có log nào</TableCell></TableRow>
          ) : (
            filtered.map((item, i) => {
              const ao = ACTION_OPTS.find(o => o.value === item.action);
              const dev = DEVICE_OPTS.find(d => d.value === item.device_type);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell className="font-medium">{item.employee?.full_name ?? `#${item.employee_id}`}</TableCell>
                  <TableCell>{ao && <Badge variant={ao.variant} size="sm" dot>{ao.label}</Badge>}</TableCell>
                  <TableCell>{dev?.label ?? item.device_type}</TableCell>
                  <TableCell className="font-mono text-sm">{item.device_id}</TableCell>
                  <TableCell className="font-mono text-xs">{item.ip_address ?? '—'}</TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))]">{formatDateTimeVietnam(item.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Chi tiết"><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 15, 25, 50]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ghi nhận Check-in / Check-out" size="md" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>Ghi nhận</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Bản ghi chấm công" error={errors.attendance_id} required>
              <select value={form.attendance_id} onChange={(e) => setForm({ ...form, attendance_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">-- Chọn --</option>
                {attendances.map(a => <option key={a.id} value={a.id}>{formatDateTimeVietnam(a.attendance_date)} – {a.employee?.full_name ?? `#${a.employee_id}`}</option>)}
              </select>
            </FormField>
            <FormField label="Nhân viên" error={errors.employee_id} required>
              <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">-- Chọn --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hành động" required>
              <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value as AttendanceLogAction })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                {ACTION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Loại thiết bị">
              <select value={form.device_type} onChange={(e) => setForm({ ...form, device_type: e.target.value as AttendanceLogDeviceType })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                {DEVICE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã thiết bị" error={errors.device_id} required>
              <Input value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} placeholder="VD: WEB-001, MOBILE-A12" />
            </FormField>
            <FormField label="Tên thiết bị">
              <Input value={form.device_name ?? ''} onChange={(e) => setForm({ ...form, device_name: e.target.value || null })} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="IP">
              <Input value={form.ip_address ?? ''} onChange={(e) => setForm({ ...form, ip_address: e.target.value || null })} placeholder="192.168..." />
            </FormField>
            <FormField label="Vĩ độ">
              <Input type="number" step="0.0001" value={form.latitude ?? ''} onChange={(e) => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
            <FormField label="Kinh độ">
              <Input type="number" step="0.0001" value={form.longitude ?? ''} onChange={(e) => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : null })} />
            </FormField>
          </div>
          <FormField label="Đường dẫn ảnh (URL)">
            <Input value={form.photo_path ?? ''} onChange={(e) => setForm({ ...form, photo_path: e.target.value || null })} />
          </FormField>
        </div>
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết log" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b"><History className="h-5 w-5 text-[rgb(var(--primary))]" /><h3 className="text-lg font-bold">{detailData.data.employee?.full_name ?? `NV #${detailData.data.employee_id}`}</h3>{(() => { const ao = ACTION_OPTS.find(o => o.value === detailData.data.action); return ao ? <Badge variant={ao.variant} size="sm">{ao.label}</Badge> : null; })()}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thiết bị</p><p className="font-medium">{DEVICE_OPTS.find(d => d.value === detailData.data.device_type)?.label}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã thiết bị</p><p className="font-mono font-medium">{detailData.data.device_id}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">IP</p><p className="font-mono text-sm">{detailData.data.ip_address ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tên thiết bị</p><p className="font-medium">{detailData.data.device_name ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Vĩ độ / Kinh độ</p><p className="font-medium">{detailData.data.latitude ?? '—'}, {detailData.data.longitude ?? '—'}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thời gian</p><p className="font-medium text-xs">{formatDateTimeVietnam(detailData.data.created_at)}</p></div>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>
    </div>
  );
}

export default AttendanceLogSheet;
