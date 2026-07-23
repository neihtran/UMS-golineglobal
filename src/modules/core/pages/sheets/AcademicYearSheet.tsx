import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
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
import {
  useAcademicYears,
  useAcademicYear,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
} from '@/hooks/useCore';
import type {
  AcademicYear,
  AcademicYearCreatePayload,
} from '@/types/core.types';

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

const emptyForm = (): AcademicYearCreatePayload => ({
  code: '',
  name: '',
  start_date: '',
  end_date: '',
  is_current: false,
});

export function AcademicYearSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [currentFilter, setCurrentFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    is_current: currentFilter ? currentFilter === 'true' : undefined,
  };

  const { data, isLoading, isFetching } = useAcademicYears(params);
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<AcademicYear | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<AcademicYearCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useAcademicYear(detailId ?? undefined);
  const createMut = useCreateAcademicYear();
  const updateMut = useUpdateAcademicYear();
  const deleteMut = useDeleteAcademicYear();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: AcademicYear) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      start_date: toDateInputValue(item.start_date),
      end_date: toDateInputValue(item.end_date),
      is_current: item.is_current,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: AcademicYear) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: AcademicYear) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã năm học không được để trống';
    if (!form.name.trim()) e.name = 'Tên năm học không được để trống';
    if (!form.start_date) e.start_date = 'Ngày bắt đầu không được để trống';
    if (!form.end_date) e.end_date = 'Ngày kết thúc không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: form });
      } else {
        await createMut.mutateAsync(form);
      }
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
    } catch (_) { /* ignore */ }
  };

  const renderTableRows = () => {
    if (isLoading) {
      return <TableSkeleton colSpan={7} rows={5} />;
    }
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy năm học nào
          </TableCell>
        </TableRow>
      );
    }
    return items.map((item, i) => (
      <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
        <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">
          {(page - 1) * pageSize + i + 1}
        </TableCell>
        <TableCell>
          <span className="font-mono font-medium">{item.code}</span>
        </TableCell>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>{toDisplayDate(item.start_date)}</TableCell>
        <TableCell>{toDisplayDate(item.end_date)}</TableCell>
        <TableCell>
          {item.is_current ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Hiện tại</span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Không</span>
          )}
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
    ));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên năm học..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={currentFilter}
          onChange={e => { setCurrentFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="true">Năm học hiện tại</option>
          <option value="false">Năm học khác</option>
        </select>
        {(search || currentFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setCurrentFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm năm học
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã năm học</TableHeadCell>
            <TableHeadCell>Tên năm học</TableHeadCell>
            <TableHeadCell>Ngày bắt đầu</TableHeadCell>
            <TableHeadCell>Ngày kết thúc</TableHeadCell>
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
        title={editing ? 'Sửa năm học' : 'Thêm năm học'}
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã năm học" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: AY2627"
              />
            </FormField>
            <FormField label="Năm học hiện tại">
              <select
                value={String(form.is_current)}
                onChange={e => setForm({ ...form, is_current: e.target.value === 'true' })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="false">Không</option>
                <option value="true">Có</option>
              </select>
            </FormField>
          </div>
          <FormField label="Tên năm học" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Năm học 2026-2027"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngày bắt đầu" error={errors.start_date} required>
              <Input
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                type="date"
              />
            </FormField>
            <FormField label="Ngày kết thúc" error={errors.end_date} required>
              <Input
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                type="date"
              />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa năm học"
        description={`Bạn có chắc muốn xóa năm học "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết năm học"
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
              {detailData.data.is_current ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Hiện tại</span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày bắt đầu</p>
                <p className="font-medium">{toDisplayDate(detailData.data.start_date)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày kết thúc</p>
                <p className="font-medium">{toDisplayDate(detailData.data.end_date)}</p>
              </div>
            </div>
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
