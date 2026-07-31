import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, GraduationCap } from 'lucide-react';
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
  useAcademicRanks,
  useAcademicRank,
  useCreateAcademicRank,
  useUpdateAcademicRank,
  useDeleteAcademicRank,
} from '@/hooks/useHrm';
import type {
  AcademicRank,
  AcademicRankCreatePayload,
} from '@/types/hrm.types';

const emptyForm = (): AcademicRankCreatePayload => ({
  code: '',
  name: '',
  description: null,
  sort_order: 0,
  status: 1,
});

export function AcademicRankSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'sort_order',
    sort_direction: 'asc' as const,
    name: search || undefined,
    code: search || undefined,
    status: statusFilter ? Number(statusFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useAcademicRanks(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicRank | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<AcademicRank | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<AcademicRankCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useAcademicRank(detailId ?? undefined);
  const createMut = useCreateAcademicRank();
  const updateMut = useUpdateAcademicRank();
  const deleteMut = useDeleteAcademicRank();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: AcademicRank) => {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      description: item.description,
      sort_order: item.sort_order,
      status: item.status,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: AcademicRank) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: AcademicRank) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã học hàm/học vị không được để trống';
    if (!form.name.trim()) e.name = 'Tên học hàm/học vị không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: AcademicRankCreatePayload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        sort_order: form.sort_order || 0,
        status: form.status ?? 1,
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

  const getStatusVariant = (status: number) =>
    status === 1 ? 'success' : 'error';

  const getStatusLabel = (status: number) =>
    status === 1 ? 'Hoạt động' : 'Ngừng';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên học hàm/học vị..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]"
          >
            <option value="">Tất cả</option>
            <option value="1">Hoạt động</option>
            <option value="0">Ngừng</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm học hàm/học vị
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Tên học hàm/học vị</TableHeadCell>
            <TableHeadCell>Mô tả</TableHeadCell>
            <TableHeadCell>Thứ tự</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có học hàm/học vị nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="font-mono font-medium">{item.code}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-secondary))] max-w-xs truncate">
                  {item.description || '—'}
                </TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-muted))]">{item.sort_order}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)} size="sm">
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
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
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa học hàm/học vị' : 'Thêm học hàm/học vị'}
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
          <FormField label="Mã học hàm/học vị" error={errors.code} required>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="VD: GS, PGS, ThS, TS"
            />
          </FormField>
          <FormField label="Tên học hàm/học vị" error={errors.name} required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Giáo sư, Thạc sĩ"
            />
          </FormField>
          <FormField label="Mô tả">
            <Input
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              placeholder="Mô tả học hàm/học vị"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Thứ tự">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Ngừng</option>
              </select>
            </FormField>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa học hàm/học vị"
        description={`Bạn có chắc muốn xóa "${deleting?.name}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết học hàm/học vị" size="sm">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <GraduationCap className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.name}</h3>
              <Badge variant="neutral" size="sm">{detailData.data.code}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã</p>
                <p className="font-medium font-mono">{detailData.data.code}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thứ tự</p>
                <p className="font-medium">{detailData.data.sort_order}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trạng thái</p>
                <Badge variant={getStatusVariant(detailData.data.status)} size="sm">
                  {getStatusLabel(detailData.data.status)}
                </Badge>
              </div>
            </div>
            {detailData.data.description && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
                <p className="font-medium">{detailData.data.description}</p>
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

export default AcademicRankSheet;
