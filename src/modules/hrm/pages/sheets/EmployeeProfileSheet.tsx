import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, Users, Download } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
  toast,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useEmployeeProfiles,
  useEmployeeProfile,
  useCreateEmployeeProfile,
  useUpdateEmployeeProfile,
  useDeleteEmployeeProfile,
  usePositions,
  useAcademicRanks,
} from '@/hooks/useHrm';
import { useDepartments } from '@/hooks/useCore';
import type {
  EmployeeProfile,
  EmployeeProfileCreatePayload,
  Position,
  AcademicRank,
} from '@/types/hrm.types';
import type { Department } from '@/types/core.types';

const emptyForm = (): EmployeeProfileCreatePayload => ({
  employee_code: '',
  full_name: '',
  employee_type: '',
  employment_type: '',
  gender: 1,
  department_id: null,
  position_id: null,
  academic_rank_id: null,
  join_date: null,
  official_date: null,
  contract_start: null,
  contract_end: null,
  status: 'active',
  phone: null,
  personal_email: null,
  work_email: null,
  birthday: null,
  marital_status: null,
  nationality: null,
  ethnicity: null,
  religion: null,
  identity_no: null,
  identity_issue_date: null,
  identity_issue_place: null,
  tax_code: null,
  social_insurance_no: null,
  address: null,
  note: null,
});

const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'lecturer', label: 'Giảng viên' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'manager', label: 'Cán bộ quản lý' },
  { value: 'researcher', label: 'Nghiên cứu viên' },
  { value: 'visiting_lecturer', label: 'Giảng viên thỉnh giảng' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Toàn thời gian' },
  { value: 'part_time', label: 'Bán thời gian' },
  { value: 'contract', label: 'Hợp đồng' },
];

const GENDER_OPTIONS = [
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
  { value: 3, label: 'Khác' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang công tác' },
  { value: 'inactive', label: 'Ngừng công tác' },
  { value: 'suspended', label: 'Tạm ngưng' },
  { value: 'resigned', label: 'Đã nghỉ việc' },
  { value: 'retired', label: 'Đã nghỉ hưu' },
];

export function EmployeeProfileSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    full_name: search || undefined,
    employee_code: search || undefined,
    status: statusFilter || undefined,
    employee_type: typeFilter || undefined,
  };

  const { data, isLoading, isFetching } = useEmployeeProfiles(params);
  const { data: positionsData } = usePositions({ per_page: 100 });
  const { data: academicRanksData } = useAcademicRanks({ per_page: 100 });
  const { data: departmentsData } = useDepartments({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const positions = Array.isArray(positionsData?.data) ? positionsData.data : [];
  const academicRanks = Array.isArray(academicRanksData?.data) ? academicRanksData.data : [];
  const departments = Array.isArray(departmentsData?.data) ? departmentsData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<EmployeeProfile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeProfileCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useEmployeeProfile(detailId ?? undefined);
  const createMut = useCreateEmployeeProfile();
  const updateMut = useUpdateEmployeeProfile();
  const deleteMut = useDeleteEmployeeProfile();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getPositionName = (id: number | null) =>
    positions.find((p: Position) => p.id === id)?.name ?? '—';

  const getAcademicRankName = (id: number | null) =>
    academicRanks.find((a: AcademicRank) => a.id === id)?.name ?? '—';

  const getDepartmentName = (id: number | null) =>
    departments.find((d: Department) => d.id === id)?.name ?? '—';

  const getEmployeeTypeLabel = (type: string) =>
    EMPLOYEE_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
      active: { variant: 'success', label: 'Đang công tác' },
      inactive: { variant: 'error', label: 'Ngừng công tác' },
      suspended: { variant: 'warning', label: 'Tạm ngưng' },
      resigned: { variant: 'error', label: 'Đã nghỉ việc' },
      retired: { variant: 'neutral', label: 'Đã nghỉ hưu' },
    };
    return configs[status] ?? { variant: 'neutral', label: status };
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: EmployeeProfile) => {
    setEditing(item);
    setForm({
      employee_code: item.employee_code,
      full_name: item.full_name,
      employee_type: item.employee_type,
      employment_type: item.employment_type,
      gender: item.gender,
      department_id: item.department_id,
      position_id: item.position_id,
      academic_rank_id: item.academic_rank_id,
      join_date: item.join_date,
      official_date: item.official_date,
      contract_start: item.contract_start,
      contract_end: item.contract_end,
      status: item.status,
      phone: item.phone,
      personal_email: item.personal_email,
      work_email: item.work_email,
      birthday: item.birthday,
      marital_status: item.marital_status,
      nationality: item.nationality,
      ethnicity: item.ethnicity,
      religion: item.religion,
      identity_no: item.identity_no,
      identity_issue_date: item.identity_issue_date,
      identity_issue_place: item.identity_issue_place,
      tax_code: item.tax_code,
      social_insurance_no: item.social_insurance_no,
      address: item.address,
      note: item.note,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: EmployeeProfile) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: EmployeeProfile) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.employee_code.trim()) e.employee_code = 'Mã nhân sự không được để trống';
    if (!form.full_name.trim()) e.full_name = 'Họ tên không được để trống';
    if (!form.employee_type) e.employee_type = 'Loại nhân sự không được để trống';
    if (!form.employment_type) e.employment_type = 'Loại hình làm việc không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: EmployeeProfileCreatePayload = { ...form };
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

  const handleExport = () => {
    if (!items.length) {
      toast.warning('Không có dữ liệu để xuất');
      return;
    }
    const headers = ['Mã', 'Họ tên', 'Loại', 'Đơn vị', 'Chức vụ', 'Học hàm', 'Trạng thái'];
    const rows = items.map(item => [
      item.employee_code,
      item.full_name,
      getEmployeeTypeLabel(item.employee_type),
      getDepartmentName(item.department_id),
      getPositionName(item.position_id),
      getAcademicRankName(item.academic_rank_id),
      getStatusConfig(item.status).label,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ho-so-nhan-su-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${items.length} bản ghi`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm mã, tên nhân sự..."
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
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[160px]"
          >
            <option value="">Tất cả</option>
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Loại</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[160px]"
          >
            <option value="">Tất cả</option>
            {EMPLOYEE_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {(search || statusFilter || typeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
            Xuất
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm nhân sự
          </Button>
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Họ tên</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Đơn vị</TableHeadCell>
            <TableHeadCell>Chức vụ</TableHeadCell>
            <TableHeadCell>Học hàm</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có hồ sơ nhân sự nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const statusConfig = getStatusConfig(item.status);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono font-medium">{item.employee_code}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      {item.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{getEmployeeTypeLabel(item.employee_type)}</TableCell>
                  <TableCell className="text-sm">{getDepartmentName(item.department_id)}</TableCell>
                  <TableCell className="text-sm">{getPositionName(item.position_id)}</TableCell>
                  <TableCell className="text-sm">{getAcademicRankName(item.academic_rank_id)}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
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
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa hồ sơ nhân sự' : 'Thêm hồ sơ nhân sự'}
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
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã nhân sự" error={errors.employee_code} required>
              <Input
                value={form.employee_code}
                onChange={(e) => setForm({ ...form, employee_code: e.target.value })}
                placeholder="VD: NV001"
              />
            </FormField>
            <FormField label="Họ tên" error={errors.full_name} required>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Họ và tên"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Loại nhân sự" error={errors.employee_type} required>
              <select
                value={form.employee_type}
                onChange={(e) => setForm({ ...form, employee_type: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn --</option>
                {EMPLOYEE_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Loại hình làm việc" error={errors.employment_type} required>
              <select
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn --</option>
                {EMPLOYMENT_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Giới tính" required>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {GENDER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Đơn vị">
              <select
                value={form.department_id ?? ''}
                onChange={(e) => setForm({ ...form, department_id: e.target.value ? Number(e.target.value) : null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn --</option>
                {departments.map((d: Department) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Chức vụ">
              <select
                value={form.position_id ?? ''}
                onChange={(e) => setForm({ ...form, position_id: e.target.value ? Number(e.target.value) : null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn --</option>
                {positions.map((p: Position) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Học hàm/Học vị">
              <select
                value={form.academic_rank_id ?? ''}
                onChange={(e) => setForm({ ...form, academic_rank_id: e.target.value ? Number(e.target.value) : null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn --</option>
                {academicRanks.map((a: AcademicRank) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Ngày vào làm">
              <Input
                type="date"
                value={form.join_date ?? ''}
                onChange={(e) => setForm({ ...form, join_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Ngày chính thức">
              <Input
                type="date"
                value={form.official_date ?? ''}
                onChange={(e) => setForm({ ...form, official_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số điện thoại">
              <Input
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
                placeholder="0912345678"
              />
            </FormField>
            <FormField label="Email cá nhân">
              <Input
                type="email"
                value={form.personal_email ?? ''}
                onChange={(e) => setForm({ ...form, personal_email: e.target.value || null })}
                placeholder="email@gmail.com"
              />
            </FormField>
          </div>
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
        title="Xác nhận xóa hồ sơ"
        description={`Bạn có chắc muốn xóa hồ sơ "${deleting?.full_name}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết hồ sơ nhân sự" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Users className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.full_name}</h3>
              <Badge variant="neutral" size="sm">{detailData.data.employee_code}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại nhân sự</p>
                <p className="font-medium">{getEmployeeTypeLabel(detailData.data.employee_type)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại hình</p>
                <p className="font-medium">
                  {EMPLOYMENT_TYPE_OPTIONS.find(o => o.value === detailData.data.employment_type)?.label ?? '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trạng thái</p>
                <Badge variant={getStatusConfig(detailData.data.status).variant} size="sm">
                  {getStatusConfig(detailData.data.status).label}
                </Badge>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đơn vị</p>
                <p className="font-medium">{getDepartmentName(detailData.data.department_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chức vụ</p>
                <p className="font-medium">{getPositionName(detailData.data.position_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học hàm/Học vị</p>
                <p className="font-medium">{getAcademicRankName(detailData.data.academic_rank_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Điện thoại</p>
                <p className="font-medium">{detailData.data.phone ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Email cá nhân</p>
                <p className="font-medium">{detailData.data.personal_email ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Email công việc</p>
                <p className="font-medium">{detailData.data.work_email ?? '—'}</p>
              </div>
            </div>
            {detailData.data.note && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p>
                <p className="font-medium">{detailData.data.note}</p>
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

export default EmployeeProfileSheet;
