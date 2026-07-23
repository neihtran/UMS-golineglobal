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
  useFloors,
  useFloor,
  useBuildings,
  useCreateFloor,
  useUpdateFloor,
  useDeleteFloor,
} from '@/hooks/useCore';
import type {
  Floor,
  FloorCreatePayload,
} from '@/types/core.types';

const emptyForm = (): FloorCreatePayload => ({
  building_id: 0,
  floor_number: 1,
  name: '',
});

export function FloorSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    building_id: buildingFilter ? Number(buildingFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useFloors(params);
  const { data: buildingData } = useBuildings({ per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const buildings = buildingData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Floor | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Floor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<FloorCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useFloor(detailId ?? undefined);
  const createMut = useCreateFloor();
  const updateMut = useUpdateFloor();
  const deleteMut = useDeleteFloor();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getBuildingName = (buildingId: number) => {
    const building = buildings.find(b => b.id === buildingId);
    return building?.name || `ID: ${buildingId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Floor) => {
    setEditing(item);
    setForm({
      building_id: item.building_id,
      floor_number: item.floor_number,
      name: item.name,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Floor) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Floor) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.building_id) e.building_id = 'Vui lòng chọn tòa nhà';
    if (!form.floor_number || form.floor_number < 0) e.floor_number = 'Số tầng không hợp lệ';
    if (!form.name.trim()) e.name = 'Tên tầng không được để trống';
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
            Không tìm thấy tầng nào
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
          <span className="font-mono font-medium">Tầng {item.floor_number}</span>
        </TableCell>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>{getBuildingName(item.building_id)}</TableCell>
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
        <select
          value={buildingFilter}
          onChange={e => { setBuildingFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả tòa nhà</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        {buildingFilter && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setBuildingFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm tầng
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Tầng số</TableHeadCell>
            <TableHeadCell>Tên tầng</TableHeadCell>
            <TableHeadCell>Tòa nhà</TableHeadCell>
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
        title={editing ? 'Sửa tầng' : 'Thêm tầng'}
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
          <FormField label="Tòa nhà" error={errors.building_id} required>
            <select
              value={form.building_id}
              onChange={e => setForm({ ...form, building_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn tòa nhà --</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Số tầng" error={errors.floor_number} required>
              <Input
                value={form.floor_number}
                onChange={e => setForm({ ...form, floor_number: Number(e.target.value) })}
                type="number"
                placeholder="VD: 1"
              />
            </FormField>
            <FormField label="Tên tầng" error={errors.name} required>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Tầng 1"
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
        title="Xác nhận xóa tầng"
        description={`Bạn có chắc muốn xóa tầng "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết tầng"
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
                <p className="text-sm text-[rgb(var(--text-muted))]">Tầng {detailData.data.floor_number}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số tầng</p>
                <p className="font-medium">{detailData.data.floor_number}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tòa nhà</p>
                <p className="font-medium">{getBuildingName(detailData.data.building_id)}</p>
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
