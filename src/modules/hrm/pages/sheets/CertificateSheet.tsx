import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, FileText } from 'lucide-react';
import {
  Button,
  Input,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import { formatDate } from '@/utils/formatters';
import {
  useCertificates,
  useCertificate,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  useEmployeeProfiles,
} from '@/hooks/useHrm';
import type {
  Certificate,
  CertificateCreatePayload,
  EmployeeProfile,
} from '@/types/hrm.types';

const emptyForm = (employeeId: number): CertificateCreatePayload => ({
  employee_id: employeeId,
  certificate_name: '',
  organization: null,
  issue_date: null,
  expiry_date: null,
  certificate_no: null,
  file_path: null,
  note: null,
});

export function CertificateSheet() {
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

  const { data, isLoading, isFetching } = useCertificates(params);
  const { data: employeesData } = useEmployeeProfiles({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Certificate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<CertificateCreatePayload>(emptyForm(0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useCertificate(detailId ?? undefined);
  const createMut = useCreateCertificate();
  const updateMut = useUpdateCertificate();
  const deleteMut = useDeleteCertificate();
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

  const openEdit = (item: Certificate) => {
    setEditing(item);
    setForm({
      employee_id: item.employee_id,
      certificate_name: item.certificate_name,
      organization: item.organization,
      issue_date: item.issue_date,
      expiry_date: item.expiry_date,
      certificate_no: item.certificate_no,
      file_path: item.file_path,
      note: item.note,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Certificate) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Certificate) => {
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
    if (!form.certificate_name.trim()) e.certificate_name = 'Tên chứng chỉ không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: CertificateCreatePayload = {
        employee_id: form.employee_id,
        certificate_name: form.certificate_name.trim(),
        organization: form.organization?.trim() || null,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        certificate_no: form.certificate_no?.trim() || null,
        file_path: form.file_path?.trim() || null,
        note: form.note?.trim() || null,
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

  const filteredItems = employeeFilter
    ? items.filter(item => item.employee_id === Number(employeeFilter))
    : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm tên chứng chỉ..."
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
          Thêm chứng chỉ
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân sự</TableHeadCell>
            <TableHeadCell>Tên chứng chỉ</TableHeadCell>
            <TableHeadCell>Đơn vị cấp</TableHeadCell>
            <TableHeadCell>Ngày cấp</TableHeadCell>
            <TableHeadCell>Ngày hết hạn</TableHeadCell>
            <TableHeadCell>Số chứng chỉ</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có chứng chỉ nào
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
                    <FileText className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    {item.certificate_name}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{item.organization || '—'}</TableCell>
                <TableCell className="text-sm tabular-nums">{item.issue_date ? formatDate(item.issue_date) : '—'}</TableCell>
                <TableCell className="text-sm tabular-nums">{item.expiry_date ? formatDate(item.expiry_date) : '—'}</TableCell>
                <TableCell className="text-sm font-mono">{item.certificate_no || '—'}</TableCell>
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
        title={editing ? 'Sửa chứng chỉ' : 'Thêm chứng chỉ'}
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
          <FormField label="Tên chứng chỉ" error={errors.certificate_name} required>
            <Input
              value={form.certificate_name}
              onChange={(e) => setForm({ ...form, certificate_name: e.target.value })}
              placeholder="VD: Chứng chỉ IELTS"
            />
          </FormField>
          <FormField label="Đơn vị cấp">
            <Input
              value={form.organization ?? ''}
              onChange={(e) => setForm({ ...form, organization: e.target.value || null })}
              placeholder="VD: IDP Education"
            />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Ngày cấp">
              <Input
                type="date"
                value={form.issue_date ?? ''}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Ngày hết hạn">
              <Input
                type="date"
                value={form.expiry_date ?? ''}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Số chứng chỉ">
              <Input
                value={form.certificate_no ?? ''}
                onChange={(e) => setForm({ ...form, certificate_no: e.target.value || null })}
                placeholder="VD: IELTS-2024-001"
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
        title="Xác nhận xóa chứng chỉ"
        description={`Bạn có chắc muốn xóa "${deleting?.certificate_name}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết chứng chỉ" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.certificate_name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhân sự</p>
                <p className="font-medium">{getEmployeeName(detailData.data.employee_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đơn vị cấp</p>
                <p className="font-medium">{detailData.data.organization || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày cấp</p>
                <p className="font-medium">{detailData.data.issue_date || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày hết hạn</p>
                <p className="font-medium">{detailData.data.expiry_date || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số chứng chỉ</p>
                <p className="font-medium font-mono">{detailData.data.certificate_no || '—'}</p>
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

export default CertificateSheet;
