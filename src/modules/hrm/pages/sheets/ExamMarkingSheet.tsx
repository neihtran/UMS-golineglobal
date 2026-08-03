import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, FileCheck } from 'lucide-react';
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
  useExamMarkings,
  useExamMarking,
  useCreateExamMarking,
  useUpdateExamMarking,
  useDeleteExamMarking,
  useEmployeeProfiles,
} from '@/hooks/useHrm';
import { formatDateTimeVietnam } from '@/utils/formatters';
import type {
  ExamMarking,
  ExamMarkingCreatePayload,
  EmployeeProfile,
} from '@/types/hrm.types';

const emptyForm = (): ExamMarkingCreatePayload => ({
  lecturer_id: 0,
  exam_schedule_id: 0,
  number_of_scripts: 0,
  deadline: '',
  status: 'assigned',
  note: null,
});

const STATUS_OPTIONS = [
  { value: 'assigned', label: 'Đã phân công' },
  { value: 'in_progress', label: 'Đang chấm' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Hủy' },
];

export function ExamMarkingSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [lecturerFilter, setLecturerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isFetching } = useExamMarkings(params);
  const { data: employeesData } = useEmployeeProfiles({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExamMarking | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ExamMarking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<ExamMarkingCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useExamMarking(detailId ?? undefined);
  const createMut = useCreateExamMarking();
  const updateMut = useUpdateExamMarking();
  const deleteMut = useDeleteExamMarking();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getLecturerName = (id: number) =>
    employees.find((e: EmployeeProfile) => e.id === id)?.full_name ?? `GV #${id}`;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
      assigned: { variant: 'success', label: 'Đã phân công' },
      in_progress: { variant: 'warning', label: 'Đang chấm' },
      completed: { variant: 'success', label: 'Hoàn thành' },
      cancelled: { variant: 'neutral', label: 'Hủy' },
    };
    return configs[status] ?? { variant: 'neutral', label: status };
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: ExamMarking) => {
    setEditing(item);
    setForm({
      lecturer_id: item.lecturer_id,
      exam_schedule_id: item.exam_schedule_id,
      number_of_scripts: item.number_of_scripts,
      deadline: toLocalInput(item.deadline),
      status: item.status,
      note: item.note,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: ExamMarking) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: ExamMarking) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setLecturerFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.lecturer_id) e.lecturer_id = 'Vui lòng chọn giảng viên';
    if (!form.exam_schedule_id) e.exam_schedule_id = 'Vui lòng nhập mã lịch thi';
    if (!form.number_of_scripts || form.number_of_scripts < 1) e.number_of_scripts = 'Số bài phải lớn hơn 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toBackendDateTime = (local: string | undefined | null): string | undefined => {
    if (!local) return undefined;
    const d = new Date(local);
    if (isNaN(d.getTime())) return undefined;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  };

  const toLocalInput = (backend: string | undefined | null): string => {
    if (!backend) return '';
    const s = backend.replace(' ', 'T');
    return s.length >= 16 ? s.substring(0, 16) : s;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: ExamMarkingCreatePayload = {
        ...form,
        deadline: toBackendDateTime(form.deadline),
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

  const filteredItems = lecturerFilter
    ? items.filter(item => item.lecturer_id === Number(lecturerFilter))
    : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Giảng viên</label>
          <select
            value={lecturerFilter}
            onChange={(e) => { setLecturerFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[180px]"
          >
            <option value="">Tất cả</option>
            {employees.map((e: EmployeeProfile) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[140px]"
          >
            <option value="">Tất cả</option>
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {(search || lecturerFilter || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm phân công
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Giảng viên</TableHeadCell>
            <TableHeadCell>Lịch thi</TableHeadCell>
            <TableHeadCell>Số bài thi</TableHeadCell>
            <TableHeadCell>Deadline</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có phân công chấm thi nào
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item, i) => {
              const statusConfig = getStatusConfig(item.status);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      {getLecturerName(item.lecturer_id)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.exam_schedule?.code || `Lịch thi #${item.exam_schedule_id}` || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    {item.number_of_scripts || 0} bài
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTimeVietnam(item.deadline)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
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

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa phân công chấm thi' : 'Thêm phân công chấm thi'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              {editing ? 'Lưu' : 'Thêm'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="Giảng viên" required error={errors.lecturer_id}>
            <select
              value={form.lecturer_id}
              onChange={(e) => setForm(f => ({ ...f, lecturer_id: Number(e.target.value) }))}
              className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm"
            >
              <option value={0}>Chọn giảng viên</option>
              {employees.map((e: EmployeeProfile) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Lịch thi" required error={errors.exam_schedule_id}>
            <Input
              type="number"
              placeholder="Nhập ID lịch thi"
              value={form.exam_schedule_id || ''}
              onChange={(e) => setForm(f => ({ ...f, exam_schedule_id: Number(e.target.value) }))}
            />
          </FormField>

          <FormField label="Số bài thi">
            <Input
              type="number"
              placeholder="Nhập số bài thi"
              value={form.number_of_scripts || 0}
              onChange={(e) => setForm(f => ({ ...f, number_of_scripts: Number(e.target.value) }))}
            />
          </FormField>

          <FormField label="Deadline chấm thi">
            <Input
              type="datetime-local"
              value={form.deadline || ''}
              onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
            />
          </FormField>

          <FormField label="Trạng thái">
            <select
              value={form.status || 'assigned'}
              onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Ghi chú">
            <textarea
              value={form.note || ''}
              onChange={(e) => setForm(f => ({ ...f, note: e.target.value || null }))}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 py-2 text-sm resize-none"
              placeholder="Nhập ghi chú..."
            />
          </FormField>

          {submitError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {submitError}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa phân công chấm thi"
        description={`Bạn có chắc muốn xóa phân công chấm thi của "${getLecturerName(deleting?.lecturer_id ?? 0)}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết phân công chấm thi"
        size="lg"
      >
        {detailLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-[rgb(var(--bg-card))] rounded animate-pulse" />
            ))}
          </div>
        ) : detailData?.data ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Giảng viên</p>
                <p className="font-medium">{getLecturerName(detailData.data.lecturer_id)}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Lịch thi</p>
                <p className="font-medium">{detailData.data.exam_schedule?.code || `#${detailData.data.exam_schedule_id}`}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Số bài thi</p>
                <p className="font-medium">{detailData.data.number_of_scripts} bài</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Trạng thái</p>
                <Badge variant={getStatusConfig(detailData.data.status).variant} size="sm">
                  {getStatusConfig(detailData.data.status).label}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Deadline</p>
                <p className="font-medium">{formatDateTimeVietnam(detailData.data.deadline)}</p>
              </div>
            </div>
            {detailData.data.note && (
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Ghi chú</p>
                <p className="font-medium">{detailData.data.note}</p>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
