import { useState, useMemo } from 'react';
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
  useCampuses,
  useCampus,
  useOrganizations,
  useCreateCampus,
  useUpdateCampus,
  useDeleteCampus,
} from '@/hooks/useCore';
import type {
  Campus,
  CampusCreatePayload,
} from '@/types/core.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'error' }> = {
  true: { label: 'Hoạt động', variant: 'success' },
  false: { label: 'Ngừng hoạt động', variant: 'error' },
};

const emptyForm = (): CampusCreatePayload => ({
  organization_id: 0,
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  latitude: undefined,
  longitude: undefined,
  is_active: true,
});

export function CampusSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
    organization_id: orgFilter ? Number(orgFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useCampuses(params);
  const { data: orgData } = useOrganizations({ per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const organizations = orgData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Campus | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<CampusCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useCampus(detailId ?? undefined);
  const createMut = useCreateCampus();
  const updateMut = useUpdateCampus();
  const deleteMut = useDeleteCampus();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Campus) => {
    setEditing(item);
    setForm({
      organization_id: item.organization_id,
      code: item.code,
      name: item.name,
      phone: item.phone ?? '',
      email: item.email ?? '',
      address: item.address ?? '',
      latitude: item.latitude ?? undefined,
      longitude: item.longitude ?? undefined,
      is_active: item.is_active,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Campus) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Campus) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const getOrgName = (orgId: number) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || `ID: ${orgId}`;
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.organization_id) e.organization_id = 'Vui lòng chọn tổ chức';
    if (!form.code.trim()) e.code = 'Mã cơ sở không được để trống';
    if (!form.name.trim()) e.name = 'Tên cơ sở không được để trống';
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
          placeholder="Tìm theo mã, tên cơ sở..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={orgFilter}
          onChange={e => { setOrgFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả tổ chức</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
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
        {(search || statusFilter || orgFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setOrgFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm cơ sở
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã cơ sở</TableHeadCell>
            <TableHeadCell>Tên cơ sở</TableHeadCell>
            <TableHeadCell>Tổ chức</TableHeadCell>
            <TableHeadCell>Địa chỉ</TableHeadCell>
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
                Không tìm thấy cơ sở nào
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
                  <TableCell>{getOrgName(item.organization_id)}</TableCell>
                  <TableCell>{item.address || '-'}</TableCell>
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
        title={editing ? 'Sửa cơ sở' : 'Thêm cơ sở'}
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
          <FormField label="Tổ chức" error={errors.organization_id} required>
            <select
              value={form.organization_id}
              onChange={e => setForm({ ...form, organization_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn tổ chức --</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã cơ sở" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: CS1"
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="contact@example.com"
                type="email"
              />
            </FormField>
          </div>
          <FormField label="Tên cơ sở" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Cơ sở chính"
            />
          </FormField>
          <FormField label="Số điện thoại">
            <Input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="0123456789"
            />
          </FormField>
          <FormField label="Địa chỉ">
            <Input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="123 Đường ABC, TP.HCM"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vĩ độ">
              <Input
                value={form.latitude?.toString() || ''}
                onChange={e => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="10.762622"
                type="number"
                step="any"
              />
            </FormField>
            <FormField label="Kinh độ">
              <Input
                value={form.longitude?.toString() || ''}
                onChange={e => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="106.660172"
                type="number"
                step="any"
              />
            </FormField>
          </div>
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
        title="Xác nhận xóa cơ sở"
        description={`Bạn có chắc muốn xóa cơ sở "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết cơ sở"
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
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tổ chức</p>
                <p className="font-medium">{getOrgName(detailData.data.organization_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Email</p>
                <p className="font-medium">{detailData.data.email || '-'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số điện thoại</p>
                <p className="font-medium">{detailData.data.phone || '-'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tọa độ</p>
                <p className="font-medium">
                  {detailData.data.latitude && detailData.data.longitude
                    ? `${detailData.data.latitude}, ${detailData.data.longitude}`
                    : '-'}
                </p>
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
