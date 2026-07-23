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
  useBuildings,
  useBuilding,
  useCampuses,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
} from '@/hooks/useCore';
import type {
  Building,
  BuildingCreatePayload,
} from '@/types/core.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'error' }> = {
  true: { label: 'Hoạt động', variant: 'success' },
  false: { label: 'Ngừng hoạt động', variant: 'error' },
};

const emptyForm = (): BuildingCreatePayload => ({
  campus_id: 0,
  code: '',
  name: '',
  address: '',
  total_floor: undefined,
  is_active: true,
});

export function BuildingSheet() {
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
    address: search || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
    campus_id: campusFilter ? Number(campusFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useBuildings(params);
  const { data: campusData } = useCampuses({ per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const campuses = campusData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Building | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<BuildingCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useBuilding(detailId ?? undefined);
  const createMut = useCreateBuilding();
  const updateMut = useUpdateBuilding();
  const deleteMut = useDeleteBuilding();
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

  const openEdit = (item: Building) => {
    setEditing(item);
    setForm({
      campus_id: item.campus_id,
      code: item.code ?? '',
      name: item.name,
      address: item.address ?? '',
      total_floor: item.total_floor ?? undefined,
      is_active: item.is_active,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Building) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Building) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.campus_id) e.campus_id = 'Vui lòng chọn cơ sở';
    if (!form.name.trim()) e.name = 'Tên tòa nhà không được để trống';
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
          placeholder="Tìm theo mã, tên, địa chỉ..."
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
          Thêm tòa nhà
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã tòa nhà</TableHeadCell>
            <TableHeadCell>Tên tòa nhà</TableHeadCell>
            <TableHeadCell>Cơ sở</TableHeadCell>
            <TableHeadCell>Địa chỉ</TableHeadCell>
            <TableHeadCell>Số tầng</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Không tìm thấy tòa nhà nào
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
                    <span className="font-mono font-medium">{item.code || '-'}</span>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{getCampusName(item.campus_id)}</TableCell>
                  <TableCell>{item.address || '-'}</TableCell>
                  <TableCell>{item.total_floor || '-'}</TableCell>
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
        title={editing ? 'Sửa tòa nhà' : 'Thêm tòa nhà'}
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
            <FormField label="Mã tòa nhà">
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: A"
              />
            </FormField>
            <FormField label="Số tầng">
              <Input
                value={form.total_floor?.toString() || ''}
                onChange={e => setForm({ ...form, total_floor: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="VD: 5"
                type="number"
              />
            </FormField>
          </div>
          <FormField label="Tên tòa nhà" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Tòa nhà A"
            />
          </FormField>
          <FormField label="Địa chỉ">
            <Input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="VD: 123 Đường ABC, TP.HCM"
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
        title="Xác nhận xóa tòa nhà"
        description={`Bạn có chắc muốn xóa tòa nhà "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết tòa nhà"
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
                <p className="text-sm text-[rgb(var(--text-muted))] font-mono">Mã: {detailData.data.code || '-'}</p>
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
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số tầng</p>
                <p className="font-medium">{detailData.data.total_floor || '-'}</p>
              </div>
            </div>
            {detailData.data.address && (
              <div>
                <p className="text-sm font-medium mb-2">Địa chỉ</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{detailData.data.address}</p>
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
