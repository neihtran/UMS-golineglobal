import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
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
  useDepartments,
  useDepartment,
  useFaculties,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useCore';
import type {
  Department,
  DepartmentCreatePayload,
} from '@/types/core.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'error' }> = {
  true: { label: 'Hoạt động', variant: 'success' },
  false: { label: 'Ngừng hoạt động', variant: 'error' },
};

const emptyForm = (): DepartmentCreatePayload => ({
  faculty_id: 0,
  code: '',
  name: '',
  description: '',
  established_date: '',
  is_active: true,
});

// Helper: chuyển ISO date string sang YYYY-MM-DD cho input[type=date]
const toDateInputValue = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

// Helper: chuyển ISO date string sang DD/MM/YYYY cho hiển thị
const toDisplayDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function DepartmentSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
    faculty_id: facultyFilter ? Number(facultyFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useDepartments(params);
  const { data: facultyData } = useFaculties({ per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const faculties = facultyData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<DepartmentCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useDepartment(detailId ?? undefined);
  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();
  const deleteMut = useDeleteDepartment();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getFacultyName = (facultyId: number) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty?.name || `ID: ${facultyId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Department) => {
    setEditing(item);
    setForm({
      faculty_id: item.faculty_id,
      code: item.code,
      name: item.name,
      description: item.description ?? '',
      established_date: toDateInputValue(item.established_date),
      is_active: item.is_active,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Department) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Department) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.faculty_id) e.faculty_id = 'Vui lòng chọn khoa';
    if (!form.code.trim()) e.code = 'Mã bộ môn không được để trống';
    if (!form.name.trim()) e.name = 'Tên bộ môn không được để trống';
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
    } catch (err: any) {
      setSubmitError(err.message || 'Có lỗi xảy ra');
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

  const renderTableRows = () => {
    if (isLoading) {
      return <TableSkeleton colSpan={7} rows={5} />;
    }
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy bộ môn nào
          </TableCell>
        </TableRow>
      );
    }
    return items.map((item, i) => {
      const sc = STATUS_CONFIG[String(item.is_active)] ?? STATUS_CONFIG['false'];
      return (
        <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
          <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">
            {(page - 1) * pageSize + i + 1}
          </TableCell>
          <TableCell>
            <span className="font-mono font-medium">{item.code}</span>
          </TableCell>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{getFacultyName(item.faculty_id)}</TableCell>
          <TableCell>{toDisplayDate(item.established_date)}</TableCell>
          <TableCell>
            <Badge variant={sc.variant} dot>{sc.label}</Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openDelete(item)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên bộ môn..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={facultyFilter}
          onChange={e => { setFacultyFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả khoa</option>
          {faculties.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
        </select>
        {(search || statusFilter || facultyFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setFacultyFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm bộ môn
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã bộ môn</TableHeadCell>
            <TableHeadCell>Tên bộ môn</TableHeadCell>
            <TableHeadCell>Khoa</TableHeadCell>
            <TableHeadCell>Ngày thành lập</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderTableRows()}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa bộ môn' : 'Thêm bộ môn'}
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
          <FormField label="Khoa" error={errors.faculty_id} required>
            <select
              value={form.faculty_id}
              onChange={e => setForm({ ...form, faculty_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn khoa --</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã bộ môn" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: CNPM"
              />
            </FormField>
            <FormField label="Ngày thành lập">
              <Input
                value={form.established_date}
                onChange={e => setForm({ ...form, established_date: e.target.value })}
                type="date"
              />
            </FormField>
          </div>
          <FormField label="Tên bộ môn" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Công nghệ phần mềm"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
              placeholder="Mô tả về bộ môn..."
            />
          </FormField>
          <FormField label="Trạng thái">
            <select
              value={String(form.is_active)}
              onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng hoạt động</option>
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bộ môn"
        description={`Bạn có chắc muốn xóa bộ môn "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết bộ môn"
        size="md"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{detailData.data.name}</h3>
                <p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {detailData.data.code}</p>
              </div>
              <Badge
                variant={STATUS_CONFIG[String(detailData.data.is_active)]?.variant}
                dot
              >
                {STATUS_CONFIG[String(detailData.data.is_active)]?.label}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Khoa</p>
                <p className="font-medium">{getFacultyName(detailData.data.faculty_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày thành lập</p>
                <p className="font-medium">{toDisplayDate(detailData.data.established_date)}</p>
              </div>
            </div>
            {detailData.data.description && (
              <div>
                <p className="text-sm font-medium mb-2">Mô tả</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{detailData.data.description}</p>
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
