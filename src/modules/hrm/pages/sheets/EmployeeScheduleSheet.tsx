import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, CalendarDays } from 'lucide-react';
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
  useEmployeeSchedules,
  useEmployeeSchedule,
  useCreateEmployeeSchedule,
  useUpdateEmployeeSchedule,
  useDeleteEmployeeSchedule,
  useEmployeeProfiles,
  useWorkSchedules,
} from '@/hooks/useHrm';
import { formatDateVietnam, toDateInputValue } from '@/utils/formatters';
import type { EmployeeSchedule, EmployeeScheduleCreatePayload } from '@/types/hrm.types';

const emptyForm = (): EmployeeScheduleCreatePayload => ({
  employee_id: 0,
  schedule_id: 0,
  working_date: '',
  note: null,
});

export function EmployeeScheduleSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'working_date',
    sort_direction: 'desc' as const,
  };

  const { data, isLoading, isFetching } = useEmployeeSchedules(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  // For select dropdowns
  const { data: empData } = useEmployeeProfiles({ per_page: 100 });
  const employees = Array.isArray(empData?.data) ? empData.data : [];
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const { data: wsData } = useWorkSchedules({ per_page: 100, status: 1 });
  const workSchedules = Array.isArray(wsData?.data) ? wsData.data : [];
  const scheduleMap = new Map(workSchedules.map((s) => [s.id, s]));

  const getEmployeeLabel = (id: number | null | undefined) => {
    if (!id) return '—';
    const e = employeeMap.get(id);
    return e ? `${e.full_name} (${e.employee_code})` : `#${id}`;
  };
  const getScheduleLabel = (id: number | null | undefined) => {
    if (!id) return '—';
    const s = scheduleMap.get(id);
    return s ? `${s.name} (${s.code})` : `#${id}`;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeSchedule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<EmployeeSchedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeScheduleCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useEmployeeSchedule(detailId ?? undefined);
  const createMut = useCreateEmployeeSchedule();
  const updateMut = useUpdateEmployeeSchedule();
  const deleteMut = useDeleteEmployeeSchedule();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setErrors({}); setSubmitError(null); setModalOpen(true); };
  const openEdit = (item: EmployeeSchedule) => {
    setEditing(item);
    setForm({ employee_id: item.employee_id, schedule_id: item.schedule_id, working_date: toDateInputValue(item.working_date), note: item.note });
    setErrors({}); setSubmitError(null); setModalOpen(true);
  };
  const openDetail = (item: EmployeeSchedule) => { setDetailId(item.id); setDetailOpen(true); };
  const openDelete = (item: EmployeeSchedule) => { setDeleting(item); setDeleteOpen(true); };

  const resetFilters = () => { setSearch(''); setPage(1); };

  const filtered = search
    ? items.filter(it => {
        const name = it.employee?.full_name ?? employeeMap.get(it.employee_id)?.full_name ?? '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : items;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.employee_id) e.employee_id = 'Vui lòng chọn nhân viên';
    if (!form.schedule_id) e.schedule_id = 'Vui lòng chọn ca';
    if (!form.working_date) e.working_date = 'Vui lòng chọn ngày';
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Tìm theo tên nhân viên..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="w-64" />
        {search && <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm lịch</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân viên</TableHeadCell>
            <TableHeadCell>Mã NV</TableHeadCell>
            <TableHeadCell>Ca làm việc</TableHeadCell>
            <TableHeadCell>Ngày làm</TableHeadCell>
            <TableHeadCell>Ghi chú</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">Chưa có lịch làm việc nào</TableCell></TableRow>
          ) : (
            filtered.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                <TableCell className="font-medium">{item.employee?.full_name ? `${item.employee.full_name} (${item.employee.employee_code})` : getEmployeeLabel(item.employee_id)}</TableCell>
                <TableCell className="font-mono text-sm">{item.employee?.employee_code ?? employeeMap.get(item.employee_id)?.employee_code ?? `#${item.employee_id}`}</TableCell>
                <TableCell>{item.schedule?.name ? `${item.schedule.name} (${item.schedule.code})` : getScheduleLabel(item.schedule_id)}</TableCell>
                <TableCell className="text-sm">{formatDateVietnam(item.working_date)}</TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-secondary))] max-w-xs truncate">{item.note || '—'}</TableCell>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa lịch làm việc' : 'Thêm lịch làm việc'} size="md" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <FormField label="Nhân viên" error={errors.employee_id} required>
            <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value="0">-- Chọn nhân viên --</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ca làm việc" error={errors.schedule_id} required>
              <select value={form.schedule_id} onChange={(e) => setForm({ ...form, schedule_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value="0">-- Chọn ca --</option>
                {workSchedules.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </FormField>
            <FormField label="Ngày làm" error={errors.working_date} required>
              <Input type="date" value={toDateInputValue(form.working_date)} onChange={(e) => setForm({ ...form, working_date: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Ghi chú">
            <Input value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value || null })} />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa" description={`Xóa lịch làm việc ngày ${formatDateVietnam(deleting?.working_date ?? '')}?`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết lịch làm việc" size="sm">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b"><CalendarDays className="h-5 w-5 text-[rgb(var(--primary))]" /><h3 className="text-lg font-bold">{detailData.data.employee?.full_name ?? getEmployeeLabel(detailData.data.employee_id)}</h3></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã NV</p><p className="font-mono font-medium">{detailData.data.employee?.employee_code ?? employeeMap.get(detailData.data.employee_id)?.employee_code ?? `#${detailData.data.employee_id}`}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ca làm việc</p><p className="font-medium">{detailData.data.schedule?.name ? `${detailData.data.schedule.name} (${detailData.data.schedule.code})` : getScheduleLabel(detailData.data.schedule_id)}</p></div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 col-span-2"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày làm</p><p className="font-medium">{formatDateVietnam(detailData.data.working_date)}</p></div>
            </div>
            {detailData.data.note && <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3"><p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p><p className="font-medium">{detailData.data.note}</p></div>}
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

export default EmployeeScheduleSheet;
