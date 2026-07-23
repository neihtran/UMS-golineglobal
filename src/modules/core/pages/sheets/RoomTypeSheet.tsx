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
  useRoomTypes,
  useRoomType,
  useCreateRoomType,
  useUpdateRoomType,
  useDeleteRoomType,
} from '@/hooks/useCore';
import type {
  RoomType,
  RoomTypeCreatePayload,
} from '@/types/core.types';

const emptyForm = (): RoomTypeCreatePayload => ({
  code: '',
  name: '',
  description: '',
});

export function RoomTypeSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
  };

  const { data, isLoading, isFetching } = useRoomTypes(params);
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<RoomType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<RoomTypeCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useRoomType(detailId ?? undefined);
  const createMut = useCreateRoomType();
  const updateMut = useUpdateRoomType();
  const deleteMut = useDeleteRoomType();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: RoomType) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      description: item.description ?? '',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: RoomType) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: RoomType) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã loại phòng không được để trống';
    if (!form.name.trim()) e.name = 'Tên loại phòng không được để trống';
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
      return <TableSkeleton colSpan={5} rows={5} />;
    }
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy loại phòng nào
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
        <TableCell>{item.description || '-'}</TableCell>
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
          placeholder="Tìm theo mã, tên loại phòng..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        {search && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm loại phòng
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã loại phòng</TableHeadCell>
            <TableHeadCell>Tên loại phòng</TableHeadCell>
            <TableHeadCell>Mô tả</TableHeadCell>
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
        title={editing ? 'Sửa loại phòng' : 'Thêm loại phòng'}
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
            <FormField label="Mã loại phòng" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: LT"
              />
            </FormField>
          </div>
          <FormField label="Tên loại phòng" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Phòng học lý thuyết"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
              placeholder="Mô tả về loại phòng..."
            />
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa loại phòng"
        description={`Bạn có chắc muốn xóa loại phòng "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết loại phòng"
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
