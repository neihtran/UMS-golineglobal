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
  useMasterValues,
  useMasterValue,
  useMasterGroups,
  useCreateMasterValue,
  useUpdateMasterValue,
  useDeleteMasterValue,
} from '@/hooks/useCore';
import type {
  MasterValue,
  MasterValueCreatePayload,
} from '@/types/core.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'error' }> = {
  true: { label: 'Hoạt động', variant: 'success' },
  false: { label: 'Ngừng hoạt động', variant: 'error' },
};

const emptyForm = (): MasterValueCreatePayload => ({
  group_id: 0,
  code: '',
  name: '',
  value: '',
  description: '',
  sort_order: 0,
  is_default: false,
  is_active: true,
});

export function MasterValueSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
    group_id: groupFilter ? Number(groupFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useMasterValues(params);
  const { data: groupData } = useMasterGroups({ per_page: 100, is_active: true });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const groups = groupData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MasterValue | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<MasterValue | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<MasterValueCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useMasterValue(detailId ?? undefined);
  const createMut = useCreateMasterValue();
  const updateMut = useUpdateMasterValue();
  const deleteMut = useDeleteMasterValue();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getGroupName = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || `ID: ${groupId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: MasterValue) => {
    setEditing(item);
    setForm({
      group_id: item.group_id,
      code: item.code,
      name: item.name,
      value: item.value ?? '',
      description: item.description ?? '',
      sort_order: item.sort_order ?? 0,
      is_default: item.is_default,
      is_active: item.is_active,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: MasterValue) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: MasterValue) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.group_id) e.group_id = 'Vui lòng chọn nhóm danh mục';
    if (!form.code.trim()) e.code = 'Mã giá trị không được để trống';
    if (!form.name.trim()) e.name = 'Tên giá trị không được để trống';
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
            Không tìm thấy giá trị danh mục nào
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
          <TableCell className="text-[rgb(var(--text-secondary))]">{item.value || '-'}</TableCell>
          <TableCell>{getGroupName(item.group_id)}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Badge variant={sc.variant} dot>{sc.label}</Badge>
              {item.is_default && (
                <Badge variant="warning" className="text-xs">Mặc định</Badge>
              )}
            </div>
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
          placeholder="Tìm theo mã, tên giá trị..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={groupFilter}
          onChange={e => { setGroupFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả nhóm</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
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
        {(search || statusFilter || groupFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setStatusFilter(''); setGroupFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm giá trị
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Tên</TableHeadCell>
            <TableHeadCell>Giá trị</TableHeadCell>
            <TableHeadCell>Nhóm</TableHeadCell>
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
        title={editing ? 'Sửa giá trị danh mục' : 'Thêm giá trị danh mục'}
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
          <FormField label="Nhóm danh mục" error={errors.group_id} required>
            <select
              value={form.group_id}
              onChange={e => setForm({ ...form, group_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn nhóm --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã giá trị" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: ACTIVE"
              />
            </FormField>
            <FormField label="Thứ tự">
              <Input
                type="number"
                value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                placeholder="0"
              />
            </FormField>
          </div>
          <FormField label="Tên giá trị" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Hoạt động"
            />
          </FormField>
          <FormField label="Giá trị">
            <Input
              value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })}
              placeholder="VD: 1"
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
              placeholder="Mô tả về giá trị..."
            />
          </FormField>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={e => setForm({ ...form, is_default: e.target.checked })}
                className="w-4 h-4 rounded border-[rgb(var(--border))]"
              />
              <span className="text-sm">Giá trị mặc định</span>
            </label>
            <FormField label="Trạng thái" className="flex-1">
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
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa giá trị danh mục"
        description={`Bạn có chắc muốn xóa giá trị "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết giá trị danh mục"
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
              <div className="flex items-center gap-2">
                <Badge
                  variant={STATUS_CONFIG[String(detailData.data.is_active)]?.variant}
                  dot
                >
                  {STATUS_CONFIG[String(detailData.data.is_active)]?.label}
                </Badge>
                {detailData.data.is_default && (
                  <Badge variant="warning">Mặc định</Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhóm</p>
                <p className="font-medium">{getGroupName(detailData.data.group_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Giá trị</p>
                <p className="font-medium">{detailData.data.value || '-'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thứ tự</p>
                <p className="font-medium">{detailData.data.sort_order ?? '-'}</p>
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
