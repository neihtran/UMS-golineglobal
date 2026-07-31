import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, BriefcaseIcon } from 'lucide-react';
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
import { formatDate } from '@/utils/formatters';
import {
  useWorkHistories,
  useWorkHistory,
  useCreateWorkHistory,
  useUpdateWorkHistory,
  useDeleteWorkHistory,
  useEmployeeProfiles,
} from '@/hooks/useHrm';
import type {
  WorkHistory,
  WorkHistoryCreatePayload,
  EmployeeProfile,
} from '@/types/hrm.types';

const emptyForm = (employeeId: number): WorkHistoryCreatePayload => ({
  employee_id: employeeId,
  organization: null,
  department: null,
  position: null,
  start_date: null,
  end_date: null,
  job_description: null,
  reason_leave: null,
  note: null,
});

export function WorkHistorySheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
  };

  const { data, isLoading, isFetching } = useWorkHistories(params);
  const { data: employeesData } = useEmployeeProfiles({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkHistory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<WorkHistory | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<WorkHistoryCreatePayload>(emptyForm(0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useWorkHistory(detailId ?? undefined);
  const createMut = useCreateWorkHistory();
  const updateMut = useUpdateWorkHistory();
  const deleteMut = useDeleteWorkHistory();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getEmployeeName = (id: number) =>
    employees.find((e: EmployeeProfile) => e.id === id)?.full_name ?? `Nhân sự #${id}`;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(0));
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: WorkHistory) => {
    setEditing(item);
    setForm({
      employee_id: item.employee_id,
      organization: item.organization,
      department: item.department,
      position: item.position,
      start_date: item.start_date,
      end_date: item.end_date,
      job_description: item.job_description,
      reason_leave: item.reason_leave,
      note: item.note,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: WorkHistory) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: WorkHistory) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setEmployeeFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.employee_id) e.employee_id = 'Vui lòng chọn nhân sự';
    if (!form.organization?.trim()) e.organization = 'Đơn vị không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: WorkHistoryCreatePayload = { ...form };
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

  const filteredItems = employeeFilter
    ? items.filter(item => item.employee_id === Number(employeeFilter))
    : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm đơn vị, chức vụ..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Nhân sự</label>
          <select
            value={employeeFilter}
            onChange={(e) => { setEmployeeFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px]"
          >
            <option value="">Tất cả nhân sự</option>
            {employees.map((e: EmployeeProfile) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
        </div>
        {(search || employeeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm quá trình
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân sự</TableHeadCell>
            <TableHeadCell>Đơn vị</TableHeadCell>
            <TableHeadCell>Phòng ban</TableHeadCell>
            <TableHeadCell>Chức vụ</TableHeadCell>
            <TableHeadCell>Thời gian</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có quá trình công tác nào
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="font-medium text-sm">{getEmployeeName(item.employee_id)}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    {item.organization || '—'}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{item.department || '—'}</TableCell>
                <TableCell className="text-sm">{item.position || '—'}</TableCell>
                <TableCell className="text-sm tabular-nums">
                  {item.start_date && item.end_date
                    ? `${formatDate(item.start_date)} — ${formatDate(item.end_date)}`
                    : item.start_date ? formatDate(item.start_date) : item.end_date ? formatDate(item.end_date) : '—'}
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
        total={filteredItems.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa quá trình công tác' : 'Thêm quá trình công tác'}
        size="md"
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
          <FormField label="Nhân sự" error={errors.employee_id} required>
            <select
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn nhân sự --</option>
              {employees.map((e: EmployeeProfile) => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Đơn vị" error={errors.organization} required>
              <Input
                value={form.organization ?? ''}
                onChange={(e) => setForm({ ...form, organization: e.target.value || null })}
                placeholder="VD: Công ty ABC"
              />
            </FormField>
            <FormField label="Phòng ban">
              <Input
                value={form.department ?? ''}
                onChange={(e) => setForm({ ...form, department: e.target.value || null })}
                placeholder="VD: Phòng Kỹ thuật"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Chức vụ">
              <Input
                value={form.position ?? ''}
                onChange={(e) => setForm({ ...form, position: e.target.value || null })}
                placeholder="VD: Kỹ sư phần mềm"
              />
            </FormField>
            <FormField label="Lý do nghỉ">
              <Input
                value={form.reason_leave ?? ''}
                onChange={(e) => setForm({ ...form, reason_leave: e.target.value || null })}
                placeholder="VD: Chuyển công tác"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Từ ngày">
              <Input
                type="date"
                value={form.start_date ?? ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Đến ngày">
              <Input
                type="date"
                value={form.end_date ?? ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value || null })}
              />
            </FormField>
          </div>
          <FormField label="Mô tả công việc">
            <Input
              value={form.job_description ?? ''}
              onChange={(e) => setForm({ ...form, job_description: e.target.value || null })}
              placeholder="Mô tả công việc đã làm"
            />
          </FormField>
          <FormField label="Ghi chú">
            <Input
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value || null })}
              placeholder="Ghi chú thêm"
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa quá trình"
        description={`Bạn có chắc muốn xóa quá trình công tác này?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết quá trình công tác" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <BriefcaseIcon className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.organization}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhân sự</p>
                <p className="font-medium">{getEmployeeName(detailData.data.employee_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Phòng ban</p>
                <p className="font-medium">{detailData.data.department || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chức vụ</p>
                <p className="font-medium">{detailData.data.position || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thời gian</p>
                <p className="font-medium">
                  {detailData.data.start_date && detailData.data.end_date
                    ? `${detailData.data.start_date} — ${detailData.data.end_date}`
                    : detailData.data.start_date || detailData.data.end_date || '—'}
                </p>
              </div>
            </div>
            {detailData.data.job_description && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả công việc</p>
                <p className="font-medium">{detailData.data.job_description}</p>
              </div>
            )}
            {detailData.data.reason_leave && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Lý do nghỉ</p>
                <p className="font-medium">{detailData.data.reason_leave}</p>
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

export default WorkHistorySheet;
