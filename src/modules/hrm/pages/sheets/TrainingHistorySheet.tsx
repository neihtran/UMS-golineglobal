import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, BookOpen } from 'lucide-react';
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
import { formatDate } from '@/utils/formatters';
import {
  useTrainingHistories,
  useTrainingHistory,
  useCreateTrainingHistory,
  useUpdateTrainingHistory,
  useDeleteTrainingHistory,
  useEmployeeProfiles,
} from '@/hooks/useHrm';
import type {
  TrainingHistory,
  TrainingHistoryCreatePayload,
  EmployeeProfile,
} from '@/types/hrm.types';

const emptyForm = (employeeId: number): TrainingHistoryCreatePayload => ({
  employee_id: employeeId,
  school: null,
  program: null,
  major: null,
  degree: null,
  country: null,
  start_date: null,
  end_date: null,
  result: null,
  file_path: null,
  note: null,
});

const RESULT_OPTIONS = [
  { value: 'excellent', label: 'Xuất sắc' },
  { value: 'good', label: 'Tốt' },
  { value: 'fair', label: 'Khá' },
  { value: 'average', label: 'Trung bình' },
  { value: 'pass', label: 'Đạt' },
  { value: 'fail', label: 'Không đạt' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'in_progress', label: 'Đang học' },
];

export function TrainingHistorySheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
  };

  const { data, isLoading, isFetching } = useTrainingHistories(params);
  const { data: employeesData } = useEmployeeProfiles({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingHistory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<TrainingHistory | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<TrainingHistoryCreatePayload>(emptyForm(0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useTrainingHistory(detailId ?? undefined);
  const createMut = useCreateTrainingHistory();
  const updateMut = useUpdateTrainingHistory();
  const deleteMut = useDeleteTrainingHistory();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getEmployeeName = (id: number) =>
    employees.find((e: EmployeeProfile) => e.id === id)?.full_name ?? `Nhân sự #${id}`;

  const getResultConfig = (result: string | null) => {
    const configs: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
      excellent: { variant: 'success', label: 'Xuất sắc' },
      good: { variant: 'success', label: 'Tốt' },
      fair: { variant: 'success', label: 'Khá' },
      average: { variant: 'warning', label: 'Trung bình' },
      pass: { variant: 'success', label: 'Đạt' },
      fail: { variant: 'error', label: 'Không đạt' },
      completed: { variant: 'success', label: 'Hoàn thành' },
      in_progress: { variant: 'warning', label: 'Đang học' },
    };
    return configs[result ?? ''] ?? { variant: 'neutral', label: result ?? '—' };
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(0));
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: TrainingHistory) => {
    setEditing(item);
    setForm({
      employee_id: item.employee_id,
      school: item.school,
      program: item.program,
      major: item.major,
      degree: item.degree,
      country: item.country,
      start_date: item.start_date,
      end_date: item.end_date,
      result: item.result,
      file_path: item.file_path,
      note: item.note,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: TrainingHistory) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: TrainingHistory) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setEmployeeFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.employee_id) e.employee_id = 'Vui lòng chọn nhân sự';
    if (!form.school?.trim()) e.school = 'Trường không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: TrainingHistoryCreatePayload = { ...form };
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

  const filteredItems = employeeFilter
    ? items.filter(item => item.employee_id === Number(employeeFilter))
    : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm trường, chương trình..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Nhân sự</label>
          <select
            value={employeeFilter}
            onChange={(e) => { setEmployeeFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px]"
          >
            <option value="">Tất cả nhân sự</option>
            {employees.map((e: EmployeeProfile) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
        </div>
        {(search || employeeFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm đào tạo
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Nhân sự</TableHeadCell>
            <TableHeadCell>Trường</TableHeadCell>
            <TableHeadCell>Chương trình</TableHeadCell>
            <TableHeadCell>Thời gian</TableHeadCell>
            <TableHeadCell>Kết quả</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có quá trình đào tạo nào
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item, i) => {
              const resultConfig = getResultConfig(item.result);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{getEmployeeName(item.employee_id)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      {item.school || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.program || '—'}</TableCell>
                  <TableCell className="text-sm tabular-nums">
{item.start_date && item.end_date
                    ? `${formatDate(item.start_date)} — ${formatDate(item.end_date)}`
                    : item.start_date ? formatDate(item.start_date) : item.end_date ? formatDate(item.end_date) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={resultConfig.variant} size="sm">{resultConfig.label}</Badge>
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
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={filteredItems.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa quá trình đào tạo' : 'Thêm quá trình đào tạo'}
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
          <FormField label="Nhân sự" error={errors.employee_id} required>
            <select
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn nhân sự --</option>
              {employees.map((e: EmployeeProfile) => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Trường" error={errors.school} required>
              <Input
                value={form.school ?? ''}
                onChange={(e) => setForm({ ...form, school: e.target.value || null })}
                placeholder="VD: ĐH Bách Khoa"
              />
            </FormField>
            <FormField label="Chương trình">
              <Input
                value={form.program ?? ''}
                onChange={(e) => setForm({ ...form, program: e.target.value || null })}
                placeholder="VD: Đào tạo giảng viên"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Chuyên ngành">
              <Input
                value={form.major ?? ''}
                onChange={(e) => setForm({ ...form, major: e.target.value || null })}
                placeholder="VD: Khoa học máy tính"
              />
            </FormField>
            <FormField label="Bằng cấp">
              <Input
                value={form.degree ?? ''}
                onChange={(e) => setForm({ ...form, degree: e.target.value || null })}
                placeholder="VD: Chứng chỉ nghiệp vụ"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Từ ngày">
              <Input
                type="date"
                value={form.start_date ?? ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Đến ngày">
              <Input
                type="date"
                value={form.end_date ?? ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value || null })}
              />
            </FormField>
            <FormField label="Kết quả">
              <select
                value={form.result ?? ''}
                onChange={(e) => setForm({ ...form, result: e.target.value || null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn --</option>
                {RESULT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Ghi chú">
            <Input
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value || null })}
              placeholder="Ghi chú thêm"
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa đào tạo"
        description={`Bạn có chắc muốn xóa quá trình đào tạo này?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết đào tạo" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <BookOpen className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">{detailData.data.school}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhân sự</p>
                <p className="font-medium">{getEmployeeName(detailData.data.employee_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chương trình</p>
                <p className="font-medium">{detailData.data.program || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Chuyên ngành</p>
                <p className="font-medium">{detailData.data.major || '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Kết quả</p>
                <Badge variant={getResultConfig(detailData.data.result).variant} size="sm">
                  {getResultConfig(detailData.data.result).label}
                </Badge>
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

export default TrainingHistorySheet;
