import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, Award } from 'lucide-react';
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
  useDegrees,
  useDegree,
  useCreateDegree,
  useUpdateDegree,
  useDeleteDegree,
  useEmployeeProfiles,
} from '@/hooks/useHrm';
import type {
  Degree,
  DegreeCreatePayload,
  EmployeeProfile,
} from '@/types/hrm.types';

const emptyForm = (employeeId: number): DegreeCreatePayload => ({
  employee_id: employeeId,
  degree_name: '',
  major: null,
  school: null,
  country: null,
  graduation_year: null,
  classification: null,
  file_path: null,
  note: null,
});

export function DegreeSheet() {
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

  const { data, isLoading, isFetching } = useDegrees(params);
  const { data: employeesData } = useEmployeeProfiles({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Degree | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Degree | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<DegreeCreatePayload>(emptyForm(0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useDegree(detailId ?? undefined);
  const createMut = useCreateDegree();
  const updateMut = useUpdateDegree();
  const deleteMut = useDeleteDegree();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getEmployeeName = (id: number) =>
    employees.find((e: EmployeeProfile) => e.id === id)?.full_name ?? `Nhân sự #${id}`;

  const openCreate = (employeeId?: number) => {
    setEditing(null);
    setForm(emptyForm(employeeId || 0));
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Degree) => {
    setEditing(item);
    setForm({
      employee_id: item.employee_id,
      degree_name: item.degree_name,
      major: item.major,
      school: item.school,
      country: item.country,
      graduation_year: item.graduation_year,
      classification: item.classification,
      file_path: item.file_path,
      note: item.note,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Degree) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Degree) => {
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
    if (!form.degree_name.trim()) e.degree_name = 'Tên bằng cấp không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: DegreeCreatePayload = {
        employee_id: form.employee_id,
        degree_name: form.degree_name.trim(),
        major: form.major?.trim() || null,
        school: form.school?.trim() || null,
        country: form.country?.trim() || null,
        graduation_year: form.graduation_year || null,
        classification: form.classification?.trim() || null,
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
          placeholder="Tìm tên bằng cấp..."
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
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={() => openCreate()}>
          Thêm bằng cấp
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân sự</TableHeadCell>
            <TableHeadCell>Tên bằng cấp</TableHeadCell>
            <TableHeadCell>Chuyên ngành</TableHeadCell>
            <TableHeadCell>Trường</TableHeadCell>
            <TableHeadCell>Năm TN</TableHeadCell>
            <TableHeadCell>Xếp loại</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có bằng cấp nào
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
                    <Award className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    {item.degree_name}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{item.major || '—'}</TableCell>
                <TableCell className="text-sm">{item.school || '—'}</TableCell>
                <TableCell className="text-sm tabular-nums">{item.graduation_year || '—'}</TableCell>
                <TableCell className="text-sm">{item.classification || '—'}</TableCell>
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
        title={editing ? 'Sửa bằng cấp' : 'Thêm bằng cấp'}
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
          <FormField label="Tên bằng cấp" error={errors.degree_name} required>
            <Input
              value={form.degree_name}
              onChange={(e) => setForm({ ...form, degree_name: e.target.value })}
              placeholder="VD: Cử nhân Công nghệ thông tin"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Chuyên ngành">
              <Input
                value={form.major ?? ''}
                onChange={(e) => setForm({ ...form, major: e.target.value || null })}
                placeholder="VD: Khoa học máy tính"
              />
            </FormField>
            <FormField label="Trường">
              <Input
                value={form.school ?? ''}
                onChange={(e) => setForm({ ...form, school: e.target.value || null })}
                placeholder="VD: ĐH Bách Khoa"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Năm tốt nghiệp">
              <Input
                type="number"
                value={form.graduation_year ?? ''}
                onChange={(e) => setForm({ ...form, graduation_year: e.target.value ? Number(e.target.value) : null })}
                placeholder="2020"
              />
            </FormField>
            <FormField label="Xếp loại">
              <Input
                value={form.classification ?? ''}
                onChange={(e) => setForm({ ...form, classification: e.target.value || null })}
                placeholder="VD: Giỏi"
              />
            </FormField>
            <FormField label="Quốc gia">
              <Input
                value={form.country ?? ''}
                onChange={(e) => setForm({ ...form, country: e.target.value || null })}
                placeholder="Việt Nam"
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
        title="Xác nhận xóa bằng cấp"
        description={`Bạn có chắc muốn xóa bằng cấp "${deleting?.degree_name}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết bằng cấp" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Award className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.degree_name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhân sự</p>
                <p className="font-medium">{getEmployeeName(detailData.data.employee_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chuyên ngành</p>
                <p className="font-medium">{detailData.data.major || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trường</p>
                <p className="font-medium">{detailData.data.school || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm tốt nghiệp</p>
                <p className="font-medium">{detailData.data.graduation_year || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Xếp loại</p>
                <p className="font-medium">{detailData.data.classification || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Quốc gia</p>
                <p className="font-medium">{detailData.data.country || '—'}</p>
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

export default DegreeSheet;
