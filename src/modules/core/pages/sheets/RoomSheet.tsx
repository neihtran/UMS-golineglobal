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
  useRooms,
  useRoom,
  useFloors,
  useRoomTypes,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from '@/hooks/useCore';
import type {
  Room,
  RoomCreatePayload,
} from '@/types/core.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'error' }> = {
  true: { label: 'Hoạt động', variant: 'success' },
  false: { label: 'Ngừng hoạt động', variant: 'error' },
};

const emptyForm = (): RoomCreatePayload => ({
  floor_id: 0,
  room_type_id: 0,
  code: '',
  name: '',
  capacity: undefined,
  area: undefined,
  description: '',
  is_active: true as any,
});

export function RoomSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
    floor_id: floorFilter ? Number(floorFilter) : undefined,
    room_type_id: roomTypeFilter ? Number(roomTypeFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useRooms(params);
  const { data: floorData } = useFloors({ per_page: 100 });
  const { data: roomTypeData } = useRoomTypes({ per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const floors = floorData?.data ?? [];
  const roomTypes = roomTypeData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Room | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<RoomCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useRoom(detailId ?? undefined);
  const createMut = useCreateRoom();
  const updateMut = useUpdateRoom();
  const deleteMut = useDeleteRoom();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getFloorName = (floorId: number) => {
    const floor = floors.find(f => f.id === floorId);
    return floor?.name || `ID: ${floorId}`;
  };

  const getRoomTypeName = (roomTypeId: number) => {
    const rt = roomTypes.find(r => r.id === roomTypeId);
    return rt?.name || `ID: ${roomTypeId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Room) => {
    setEditing(item);
    setForm({
      floor_id: item.floor_id,
      room_type_id: item.room_type_id,
      code: item.code,
      name: item.name,
      capacity: item.capacity ?? undefined,
      area: item.area ?? undefined,
      description: item.description ?? '',
      is_active: item.is_active === true || item.is_active === 'true' || item.is_active === '1',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Room) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Room) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.floor_id) e.floor_id = 'Vui lòng chọn tầng';
    if (!form.room_type_id) e.room_type_id = 'Vui lòng chọn loại phòng';
    if (!form.code.trim()) e.code = 'Mã phòng không được để trống';
    if (!form.name.trim()) e.name = 'Tên phòng không được để trống';
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
      return <TableSkeleton colSpan={9} rows={5} />;
    }
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy phòng nào
          </TableCell>
        </TableRow>
      );
    }
    return items.map((item, i) => {
      const isActive = item.is_active === true || item.is_active === 'true' || item.is_active === '1';
      const sc = isActive
        ? { label: 'Hoạt động', variant: 'success' as const }
        : { label: 'Ngừng hoạt động', variant: 'error' as const };
      return (
        <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
          <TableCell className="text-[rgb(var(--text-muted))] tabular-nums w-12">
            {(page - 1) * pageSize + i + 1}
          </TableCell>
          <TableCell>
            <span className="font-mono font-medium">{item.code}</span>
          </TableCell>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{getFloorName(item.floor_id)}</TableCell>
          <TableCell>{getRoomTypeName(item.room_type_id)}</TableCell>
          <TableCell>{item.capacity || '-'}</TableCell>
          <TableCell>{item.area ? `${item.area} m²` : '-'}</TableCell>
          <TableCell>
              <Badge variant={isActive ? 'success' : 'error'} dot>
                {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
              </Badge>
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
          placeholder="Tìm theo mã, tên phòng..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={floorFilter}
          onChange={e => { setFloorFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả tầng</option>
          {floors.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select
          value={roomTypeFilter}
          onChange={e => { setRoomTypeFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả loại phòng</option>
          {roomTypes.map(rt => (
            <option key={rt.id} value={rt.id}>{rt.name}</option>
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
        {(search || statusFilter || floorFilter || roomTypeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setFloorFilter(''); setRoomTypeFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm phòng
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã phòng</TableHeadCell>
            <TableHeadCell>Tên phòng</TableHeadCell>
            <TableHeadCell>Tầng</TableHeadCell>
            <TableHeadCell>Loại phòng</TableHeadCell>
            <TableHeadCell>Sức chứa</TableHeadCell>
            <TableHeadCell>Diện tích</TableHeadCell>
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
        title={editing ? 'Sửa phòng' : 'Thêm phòng'}
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
            <FormField label="Tầng" error={errors.floor_id} required>
              <select
                value={form.floor_id}
                onChange={e => setForm({ ...form, floor_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn tầng --</option>
                {floors.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Loại phòng" error={errors.room_type_id} required>
              <select
                value={form.room_type_id}
                onChange={e => setForm({ ...form, room_type_id: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={0}>-- Chọn loại phòng --</option>
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã phòng" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: 101A"
              />
            </FormField>
            <FormField label="Tên phòng" error={errors.name} required>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Phòng 101 tòa A"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Sức chứa">
              <Input
                value={form.capacity?.toString() || ''}
                onChange={e => setForm({ ...form, capacity: e.target.value ? Number(e.target.value) : undefined })}
                type="number"
                placeholder="VD: 50"
              />
            </FormField>
            <FormField label="Diện tích (m²)">
              <Input
                value={form.area?.toString() || ''}
                onChange={e => setForm({ ...form, area: e.target.value ? Number(e.target.value) : undefined })}
                type="number"
                step="0.1"
                placeholder="VD: 60.5"
              />
            </FormField>
          </div>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
              placeholder="Mô tả về phòng..."
            />
          </FormField>
          <FormField label="Trạng thái">
            <select
              value={form.is_active ? 'true' : 'false'}
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
        title="Xác nhận xóa phòng"
        description={`Bạn có chắc muốn xóa phòng "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết phòng"
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
              {(() => {
                const isActiveDetail = detailData.data.is_active === true || detailData.data.is_active === 'true' || detailData.data.is_active === '1';
                return (
                  <Badge variant={isActiveDetail ? 'success' : 'error'} dot>
                    {isActiveDetail ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                );
              })()}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tầng</p>
                <p className="font-medium">{getFloorName(detailData.data.floor_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại phòng</p>
                <p className="font-medium">{getRoomTypeName(detailData.data.room_type_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Sức chứa</p>
                <p className="font-medium">{detailData.data.capacity || '-'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Diện tích</p>
                <p className="font-medium">{detailData.data.area ? `${detailData.data.area} m²` : '-'}</p>
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
