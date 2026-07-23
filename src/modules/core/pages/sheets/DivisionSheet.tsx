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
  useDivisions,
  useDivision,
  useCampuses,
  useCreateDivision,
  useUpdateDivision,
  useDeleteDivision,
} from '@/hooks/useCore';
import type {
  Division,
  DivisionCreatePayload,
} from '@/types/core.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'error' }> = {
  true: { label: 'Hoạt động', variant: 'success' },
  false: { label: 'Ngừng hoạt động', variant: 'error' },
};

const emptyForm = (): DivisionCreatePayload => ({
  campus_id: 0,
  code: '',
  name: '',
  description: '',
  is_active: true,
});

export function DivisionSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
    campus_id: campusFilter ? Number(campusFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useDivisions(params);
  const { data: campusData } = useCampuses({ per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const campuses = campusData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Division | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Division | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<DivisionCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useDivision(detailId ?? undefined);
  const createMut = useCreateDivision();
  const updateMut = useUpdateDivision();
  const deleteMut = useDeleteDivision();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getCampusName = (campusId: number) => {
    const campus = campuses.find(c => c.id === campusId);
    return campus?.name || `ID: ${campusId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Division) => {
    setEditing(item);
    setForm({
      campus_id: item.campus_id,
      code: item.code,
      name: item.name,
      description: item.description ?? '',
      is_active: item.is_active,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Division) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Division) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.campus_id) e.campus_id = 'Vui lòng chọn cơ sở';
    if (!form.code.trim()) e.code = 'Mã phòng ban không được để trống';
    if (!form.name.trim()) e.name = 'Tên phòng ban không được để trống';
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên phòng ban..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={campusFilter}
          onChange={e => { setCampusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả cơ sở</option>
          {campuses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
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
        {(search || statusFilter || campusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setCampusFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm phòng ban
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã phòng ban</TableHeadCell>
            <TableHeadCell>Tên phòng ban</TableHeadCell>
            <TableHeadCell>Cơ sở</TableHeadCell>
            <TableHeadCell>Mô tả</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Không tìm thấy phòng ban nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
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
                  <TableCell>{getCampusName(item.campus_id)}</TableCell>
                  <TableCell>{item.description || '-'}</TableCell>
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
            })
          )}
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
        title={editing ? 'Sửa phòng ban' : 'Thêm phòng ban'}
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
          <FormField label="Cơ sở" error={errors.campus_id} required>
            <select
              value={form.campus_id}
              onChange={e => setForm({ ...form, campus_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn cơ sở --</option>
              {campuses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã phòng ban" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: HC"
              />
            </FormField>
          </div>
          <FormField label="Tên phòng ban" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Phòng Hành chính"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
              placeholder="Mô tả về phòng ban..."
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
        title="Xác nhận xóa phòng ban"
        description={`Bạn có chắc muốn xóa phòng ban "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết phòng ban"
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
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Cơ sở</p>
                <p className="font-medium">{getCampusName(detailData.data.campus_id)}</p>
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
