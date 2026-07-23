import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import {
  Button,
  Input,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useSemesters,
  useSemester,
  useAcademicYears,
  useCreateSemester,
  useUpdateSemester,
  useDeleteSemester,
} from '@/hooks/useCore';
import type {
  Semester,
  SemesterCreatePayload,
} from '@/types/core.types';

// Helper: chuyển ISO date string sang YYYY-MM-DD cho input[type=date]
const toDateInputValue = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

// Helper: chuyển ISO date string sang DD/MM/YYYY cho hiển thị
const toDisplayDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const SEMESTER_OPTIONS = [
  { value: 1, label: 'Học kỳ 1' },
  { value: 2, label: 'Học kỳ 2' },
  { value: 3, label: 'Học kỳ hè' },
];

const emptyForm = (): SemesterCreatePayload => ({
  academic_year_id: 0,
  code: '',
  name: '',
  semester_no: 1,
  start_date: '',
  end_date: '',
  registration_start: '',
  registration_end: '',
});

export function SemesterSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    code: search || undefined,
    name: search || undefined,
    academic_year_id: academicYearFilter ? Number(academicYearFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useSemesters(params);
  const { data: academicYearData } = useAcademicYears({ per_page: 100 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const academicYears = academicYearData?.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Semester | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<SemesterCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useSemester(detailId ?? undefined);
  const createMut = useCreateSemester();
  const updateMut = useUpdateSemester();
  const deleteMut = useDeleteSemester();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getAcademicYearName = (ayId: number) => {
    const ay = academicYears.find(a => a.id === ayId);
    return ay?.name || `ID: ${ayId}`;
  };

  const getSemesterLabel = (semesterNo: number) => {
    const opt = SEMESTER_OPTIONS.find(o => o.value === semesterNo);
    return opt?.label || `Học kỳ ${semesterNo}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Semester) => {
    setEditing(item);
    setForm({
      academic_year_id: item.academic_year_id,
      code: item.code,
      name: item.name,
      semester_no: item.semester_no,
      start_date: toDateInputValue(item.start_date),
      end_date: toDateInputValue(item.end_date),
      registration_start: toDateInputValue(item.registration_start),
      registration_end: toDateInputValue(item.registration_end),
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: Semester) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: Semester) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.academic_year_id) e.academic_year_id = 'Vui lòng chọn năm học';
    if (!form.code.trim()) e.code = 'Mã học kỳ không được để trống';
    if (!form.name.trim()) e.name = 'Tên học kỳ không được để trống';
    if (!form.semester_no) e.semester_no = 'Vui lòng chọn số học kỳ';
    if (!form.start_date) e.start_date = 'Ngày bắt đầu không được để trống';
    if (!form.end_date) e.end_date = 'Ngày kết thúc không được để trống';
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
      return <TableSkeleton colSpan={8} rows={5} />;
    }
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy học kỳ nào
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
          <span className="font-mono font-medium">{item.code}</span>
        </TableCell>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>{getSemesterLabel(item.semester_no)}</TableCell>
        <TableCell>{getAcademicYearName(item.academic_year_id)}</TableCell>
        <TableCell>{toDisplayDate(item.start_date)}</TableCell>
        <TableCell>{toDisplayDate(item.end_date)}</TableCell>
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
        <Input
          placeholder="Tìm theo mã, tên học kỳ..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={academicYearFilter}
          onChange={e => { setAcademicYearFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
        >
          <option value="">Tất cả năm học</option>
          {academicYears.map(ay => (
            <option key={ay.id} value={ay.id}>{ay.name}</option>
          ))}
        </select>
        {(search || academicYearFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setSearch(''); setAcademicYearFilter(''); setPage(1); }}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm học kỳ
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Mã học kỳ</TableHeadCell>
            <TableHeadCell>Tên học kỳ</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
            <TableHeadCell>Năm học</TableHeadCell>
            <TableHeadCell>Ngày bắt đầu</TableHeadCell>
            <TableHeadCell>Ngày kết thúc</TableHeadCell>
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
        title={editing ? 'Sửa học kỳ' : 'Thêm học kỳ'}
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
          <FormField label="Năm học" error={errors.academic_year_id} required>
            <select
              value={form.academic_year_id}
              onChange={e => setForm({ ...form, academic_year_id: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={0}>-- Chọn năm học --</option>
              {academicYears.map(ay => (
                <option key={ay.id} value={ay.id}>{ay.name}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã học kỳ" error={errors.code} required>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: HK1_2026"
              />
            </FormField>
            <FormField label="Học kỳ" error={errors.semester_no} required>
              <select
                value={form.semester_no}
                onChange={e => setForm({ ...form, semester_no: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              >
                {SEMESTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Tên học kỳ" error={errors.name} required>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Học kỳ 1 năm học 2026-2027"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngày bắt đầu" error={errors.start_date} required>
              <Input
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                type="date"
              />
            </FormField>
            <FormField label="Ngày kết thúc" error={errors.end_date} required>
              <Input
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                type="date"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ngày bắt đầu đăng ký">
              <Input
                value={form.registration_start}
                onChange={e => setForm({ ...form, registration_start: e.target.value })}
                type="date"
              />
            </FormField>
            <FormField label="Ngày kết thúc đăng ký">
              <Input
                value={form.registration_end}
                onChange={e => setForm({ ...form, registration_end: e.target.value })}
                type="date"
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
        title="Xác nhận xóa học kỳ"
        description={`Bạn có chắc muốn xóa học kỳ "${deleting?.name}" không?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết học kỳ"
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
              <span className="text-sm font-medium">{getSemesterLabel(detailData.data.semester_no)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm học</p>
                <p className="font-medium">{getAcademicYearName(detailData.data.academic_year_id)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học kỳ</p>
                <p className="font-medium">{getSemesterLabel(detailData.data.semester_no)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày bắt đầu</p>
                <p className="font-medium">{toDisplayDate(detailData.data.start_date)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày kết thúc</p>
                <p className="font-medium">{toDisplayDate(detailData.data.end_date)}</p>
              </div>
              {detailData.data.registration_start && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đăng ký từ</p>
                  <p className="font-medium">{toDisplayDate(detailData.data.registration_start)}</p>
                </div>
              )}
              {detailData.data.registration_end && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đăng ký đến</p>
                  <p className="font-medium">{toDisplayDate(detailData.data.registration_end)}</p>
                </div>
              )}
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
