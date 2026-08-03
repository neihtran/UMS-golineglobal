import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, PenLine } from 'lucide-react';
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
  useThesisSupervisions,
  useThesisSupervision,
  useCreateThesisSupervision,
  useUpdateThesisSupervision,
  useDeleteThesisSupervision,
  useEmployeeProfiles,
} from '@/hooks/useHrm';
import { useHqnhatAcademicTerms, useHqnhatStudents } from '@/hooks/useHqnhat';
import type {
  ThesisSupervision,
  ThesisSupervisionCreatePayload,
  EmployeeProfile,
} from '@/types/hrm.types';
import type { HqnhatAcademicTerm, HqnhatStudent } from '@/types/hqnhat.types';

const emptyForm = (): ThesisSupervisionCreatePayload => ({
  lecturer_id: 0,
  student_id: null,
  graduation_project_id: null,
  academic_term_id: null,
  role: null,
  status: 'assigned',
  note: null,
});

const STATUS_OPTIONS = [
  { value: 'assigned', label: 'Đã phân công' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Hủy' },
];

const ROLE_OPTIONS = [
  { value: 'main', label: 'Chính' },
  { value: 'co', label: 'Đồng hướng dẫn' },
];

export function ThesisSupervisionSheet() {
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

  const { data, isLoading, isFetching } = useThesisSupervisions(params);
  const { data: employeesData } = useEmployeeProfiles({ per_page: 100 });
  const { data: academicTermsData } = useHqnhatAcademicTerms({ per_page: 100 });
  const { data: studentsData } = useHqnhatStudents({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];
  const academicTerms = Array.isArray(academicTermsData?.data) ? academicTermsData.data : [];
  const students = Array.isArray(studentsData?.data) ? studentsData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ThesisSupervision | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ThesisSupervision | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<ThesisSupervisionCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useThesisSupervision(detailId ?? undefined);
  const createMut = useCreateThesisSupervision();
  const updateMut = useUpdateThesisSupervision();
  const deleteMut = useDeleteThesisSupervision();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getLecturerName = (id: number) =>
    employees.find((e: EmployeeProfile) => e.id === id)?.full_name ?? `GV #${id}`;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
      assigned: { variant: 'success', label: 'Đã phân công' },
      in_progress: { variant: 'warning', label: 'Đang thực hiện' },
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

  const openEdit = (item: ThesisSupervision) => {
    setEditing(item);
    setForm({
      lecturer_id: item.lecturer_id,
      student_id: item.student_id,
      graduation_project_id: item.graduation_project_id,
      academic_term_id: item.academic_term_id,
      role: item.role,
      status: item.status,
      note: item.note,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: ThesisSupervision) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: ThesisSupervision) => {
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
    if (!form.student_id) e.student_id = 'Vui lòng chọn sinh viên';
    if (!form.graduation_project_id) e.graduation_project_id = 'Vui lòng nhập mã đồ án';
    if (!form.academic_term_id) e.academic_term_id = 'Vui lòng chọn học kỳ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: ThesisSupervisionCreatePayload = { ...form };
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
          Thêm hướng dẫn
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>GV Hướng dẫn</TableHeadCell>
            <TableHeadCell>Sinh viên</TableHeadCell>
            <TableHeadCell>Đồ án</TableHeadCell>
            <TableHeadCell>Vai trò</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
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
                Chưa có hướng dẫn đồ án nào
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
                      <PenLine className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      {getLecturerName(item.lecturer_id)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {students.find((s: HqnhatStudent) => s.id === item.student_id)?.full_name || students.find((s: HqnhatStudent) => s.id === item.student_id)?.student_code || `SV #${item.student_id}`}
                  </TableCell>
                  <TableCell className="text-sm">{item.graduation_project?.title || `Đồ án #${item.graduation_project_id}` || '—'}</TableCell>
                  <TableCell className="text-sm">
                    {ROLE_OPTIONS.find(o => o.value === item.role)?.label || item.role || '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {academicTerms.find((t: HqnhatAcademicTerm) => t.id === item.academic_term_id)
                      ? `${academicTerms.find((t: HqnhatAcademicTerm) => t.id === item.academic_term_id)?.code} (${academicTerms.find((t: HqnhatAcademicTerm) => t.id === item.academic_term_id)?.academic_year})`
                      : `HK #${item.academic_term_id}`}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa hướng dẫn ĐA' : 'Thêm hướng dẫn ĐA'}
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
          <FormField label="GV Hướng dẫn" error={errors.lecturer_id} required>
            <select
              value={form.lecturer_id}
              onChange={(e) => setForm({ ...form, lecturer_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn giảng viên --</option>
              {employees.map((e: EmployeeProfile) => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>
              ))}
            </select>
          </FormField>
          <FormField label="Sinh viên" error={errors.student_id} required>
            <select
              value={form.student_id ?? ''}
              onChange={(e) => setForm({ ...form, student_id: e.target.value ? Number(e.target.value) : null })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value="">-- Chọn sinh viên --</option>
              {students.map((s: HqnhatStudent) => (
                <option key={s.id} value={s.id}>{s.student_code} - {s.full_name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Mã đồ án/KL/LV" error={errors.graduation_project_id} required>
            <Input
              type="number"
              value={form.graduation_project_id ?? ''}
              onChange={(e) => setForm({ ...form, graduation_project_id: e.target.value ? Number(e.target.value) : null })}
              placeholder="Nhập ID đồ án"
            />
          </FormField>
          <FormField label="Học kỳ/Năm học" error={errors.academic_term_id} required>
            <select
              value={form.academic_term_id ?? ''}
              onChange={(e) => setForm({ ...form, academic_term_id: e.target.value ? Number(e.target.value) : null })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value="">-- Chọn học kỳ --</option>
              {academicTerms.map((term: HqnhatAcademicTerm) => (
                <option key={term.code} value={term.id}>{term.code} ({term.academic_year})</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vai trò">
              <select
                value={form.role ?? ''}
                onChange={(e) => setForm({ ...form, role: e.target.value || null })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                <option value="">-- Chọn --</option>
                {ROLE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {STATUS_OPTIONS.map(o => (
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
        title="Xác nhận xóa"
        description={`Bạn có chắc muốn xóa hướng dẫn này?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết hướng dẫn ĐA" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <PenLine className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">Hướng dẫn đồ án</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">GV Hướng dẫn</p>
                <p className="font-medium">{getLecturerName(detailData.data.lecturer_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Vai trò</p>
                <p className="font-medium">
                  {ROLE_OPTIONS.find(o => o.value === detailData.data.role)?.label || '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trạng thái</p>
                <Badge variant={getStatusConfig(detailData.data.status).variant} size="sm">
                  {getStatusConfig(detailData.data.status).label}
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

export default ThesisSupervisionSheet;
