import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import {
  Button,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatAcademicWarnings,
  useHqnhatAcademicWarning,
  useCreateHqnhatAcademicWarning,
  useUpdateHqnhatAcademicWarning,
  useDeleteHqnhatAcademicWarning,
  useHqnhatStudents,
  useHqnhatAcademicTerms,
} from '@/hooks/useHqnhat';
import type {
  HqnhatAcademicWarning,
  HqnhatAcademicWarningCreatePayload,
  HqnhatStudent,
  HqnhatAcademicTerm,
} from '@/types/hqnhat.types';

const WARNING_TYPE: Record<number, { label: string; variant: 'info' | 'warning' | 'error' }> = {
  1: { label: 'Điểm thấp', variant: 'info' },
  2: { label: 'Học phần rớt', variant: 'warning' },
  3: { label: 'Thiếu tín chỉ', variant: 'warning' },
  4: { label: 'Cảnh báo học vụ', variant: 'error' },
};

const WARNING_LEVEL: Record<number, { label: string; variant: 'info' | 'warning' | 'error' }> = {
  1: { label: 'Nhẹ', variant: 'info' },
  2: { label: 'Trung bình', variant: 'warning' },
  3: { label: 'Nghiêm trọng', variant: 'error' },
};

const emptyForm = (): HqnhatAcademicWarningCreatePayload => ({
  student_id: 0,
  academic_term_id: 0,
  warning_type: 1,
  warning_level: 1,
  description: '',
});

export function AcademicWarningSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');

  // API params - đơn giản
  const apiParams: Record<string, unknown> = {
    page,
    per_page: pageSize,
  };
  if (typeFilter) apiParams.warning_type = Number(typeFilter);
  if (studentFilter) apiParams.student_id = Number(studentFilter);
  if (termFilter) apiParams.academic_term_id = Number(termFilter);

  const { data, isLoading, isFetching, refetch } = useHqnhatAcademicWarnings(apiParams);
  
  // Fetch tất cả students để hiển thị tên
  const { data: allStudentsData, isLoading: allStudentsLoading } = useHqnhatStudents({ per_page: 100 });
  const { data: termsData } = useHqnhatAcademicTerms({ per_page: 100 });

  const allStudents = (allStudentsData?.data as HqnhatStudent[] | undefined) ?? [];
  const terms = (termsData?.data as HqnhatAcademicTerm[] | undefined) ?? [];

  const items = (data?.data as HqnhatAcademicWarning[] | undefined) ?? [];
  const total = data?.meta?.total ?? items.length;

  // Client-side filter status
  const filteredItems = statusFilter
    ? items.filter(item => {
        const isResolved = item.resolved_at !== null;
        return statusFilter === 'resolved' ? isResolved : !isResolved;
      })
    : items;

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatAcademicWarning | null>(null);
  const [formData, setFormData] = useState<HqnhatAcademicWarningCreatePayload>(emptyForm());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatAcademicWarning | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatAcademicWarning(detailId ?? undefined);
  const createMut = useCreateHqnhatAcademicWarning();
  const updateMut = useUpdateHqnhatAcademicWarning();
  const deleteMut = useDeleteHqnhatAcademicWarning();

  const getStudentName = (id: number): string => {
    const s = allStudents.find(x => x.id === id);
    return s ? `${s.student_code} — ${s.full_name}` : `SV #${id}`;
  };

  const getTermName = (id: number): string => {
    const t = terms.find(x => x.id === id);
    return t ? t.code || `HK #${id}` : `HK #${id}`;
  };

  const openDetail = (item: HqnhatAcademicWarning) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (item: HqnhatAcademicWarning) => {
    setEditing(item);
    setFormData({
      student_id: item.student_id,
      academic_term_id: item.academic_term_id,
      warning_type: item.warning_type,
      warning_level: item.warning_level,
      description: item.description ?? '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: formData });
      } else {
        await createMut.mutateAsync(formData);
      }
      setFormOpen(false);
      setEditing(null);
      setFormData(emptyForm());
      refetch();
    } catch { /* silent */ }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting.id);
      setDeleteOpen(false);
      setDeleting(null);
      refetch();
    } catch { /* silent */ }
  };

  const resetFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setTermFilter('');
    setStudentFilter('');
    setPage(1);
  };

  const hasFilters = typeFilter || statusFilter || termFilter || studentFilter;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Student filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Sinh viên</label>
          <select
            value={studentFilter}
            onChange={(e) => { setStudentFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả SV</option>
            {allStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.student_code} — {s.full_name}</option>
            ))}
          </select>
        </div>

        {/* Term filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Học kỳ</label>
          <select
            value={termFilter}
            onChange={(e) => { setTermFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả HK</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>{t.code}</option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Loại cảnh báo</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="1">Điểm thấp</option>
            <option value="2">Học phần rớt</option>
            <option value="3">Thiếu tín chỉ</option>
            <option value="4">Cảnh báo học vụ</option>
          </select>
        </div>

        {/* Status filter - client-side */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="active">Đang xử lý</option>
            <option value="resolved">Đã xử lý</option>
          </select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}

        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Tạo cảnh báo
        </Button>
      </div>

      {allStudentsLoading && (
        <div className="text-xs text-[rgb(var(--text-muted))]">Đang tải thông tin sinh viên...</div>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Sinh viên</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
            <TableHeadCell className="text-center">Loại</TableHeadCell>
            <TableHeadCell className="text-center">Mức</TableHeadCell>
            <TableHeadCell>Mô tả</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có cảnh báo học vụ nào
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item, i) => {
              const wType = WARNING_TYPE[item.warning_type] ?? { label: '—', variant: 'neutral' as const };
              const wLevel = WARNING_LEVEL[item.warning_level] ?? { label: '—', variant: 'neutral' as const };
              const isResolved = item.resolved_at !== null;
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{getStudentName(item.student_id)}</TableCell>
                  <TableCell>{getTermName(item.academic_term_id)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={wType.variant} size="sm" dot>{wType.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={wLevel.variant} size="sm">{wLevel.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{item.description || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={isResolved ? 'success' : 'warning'} size="sm" dot>
                      {isResolved ? 'Đã xử lý' : 'Đang xử lý'}
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
                      <Button variant="ghost" size="sm" onClick={() => { setDeleting(item); setDeleteOpen(true); }} title="Xóa">
                        <Trash2 className="h-4 w-4 text-red-400" />
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
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết cảnh báo học vụ" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Sinh viên</p>
                <p className="text-base font-semibold">{getStudentName(detailData.data.student_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Học kỳ</p>
                <p className="text-base font-semibold">{getTermName(detailData.data.academic_term_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Loại cảnh báo</p>
                <p className="text-base font-semibold">{WARNING_TYPE[detailData.data.warning_type]?.label ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mức độ</p>
                <p className="text-base font-semibold">{WARNING_LEVEL[detailData.data.warning_level]?.label ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
                <p className="text-base font-semibold">{detailData.data.resolved_at ? 'Đã xử lý' : 'Đang xử lý'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày xử lý</p>
                <p className="text-base font-semibold">
                  {detailData.data.resolved_at ? new Date(detailData.data.resolved_at).toLocaleDateString('vi-VN') : '—'}
                </p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mô tả</p>
                <p className="text-base">{detailData.data.description || '—'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Sửa cảnh báo học vụ' : 'Tạo cảnh báo học vụ'} size="md">
        <div className="space-y-4">
          <FormField label="Sinh viên">
            <select
              value={formData.student_id}
              onChange={(e) => setFormData((p) => ({ ...p, student_id: Number(e.target.value) }))}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm"
            >
              <option value={0}>Chọn sinh viên</option>
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.student_code} — {s.full_name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Học kỳ">
            <select
              value={formData.academic_term_id}
              onChange={(e) => setFormData((p) => ({ ...p, academic_term_id: Number(e.target.value) }))}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm"
            >
              <option value={0}>Chọn học kỳ</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>{t.code}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Loại cảnh báo">
            <select
              value={formData.warning_type}
              onChange={(e) => setFormData((p) => ({ ...p, warning_type: Number(e.target.value) as 1 | 2 | 3 | 4 }))}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm"
            >
              <option value={1}>Điểm thấp</option>
              <option value={2}>Học phần rớt</option>
              <option value={3}>Thiếu tín chỉ</option>
              <option value={4}>Cảnh báo học vụ</option>
            </select>
          </FormField>
          <FormField label="Mức độ">
            <select
              value={formData.warning_level}
              onChange={(e) => setFormData((p) => ({ ...p, warning_level: Number(e.target.value) }))}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm"
            >
              <option value={1}>Nhẹ</option>
              <option value={2}>Trung bình</option>
              <option value={3}>Nghiêm trọng</option>
            </select>
          </FormField>
          <FormField label="Mô tả">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 py-2 text-sm resize-none"
              placeholder="Nhập mô tả cảnh báo"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} loading={createMut.isPending || updateMut.isPending} disabled={!formData.student_id || !formData.academic_term_id}>
              {editing ? 'Lưu' : 'Tạo'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleting(null); }}
        onConfirm={handleDelete}
        title="Xóa cảnh báo học vụ"
        message={`Bạn có chắc muốn xóa cảnh báo của sinh viên "${deleting ? getStudentName(deleting.student_id) : ''}" không?`}
        confirmLabel="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
