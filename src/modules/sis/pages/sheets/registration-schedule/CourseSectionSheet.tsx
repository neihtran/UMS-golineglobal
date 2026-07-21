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
  useHqnhatCourseSections,
  useHqnhatCourseSection,
  useCreateHqnhatCourseSection,
  useUpdateHqnhatCourseSection,
  useDeleteHqnhatCourseSection,
  useHqnhatSubjects,
  useHqnhatAcademicTerms,
  useHqnhatCourseRegistrations,
} from '@/hooks/useHqnhat';
import type {
  HqnhatCourseSection,
  HqnhatCourseSectionCreatePayload,
  HqnhatSubject,
  HqnhatAcademicTerm,
  HqnhatCourseRegistration,
} from '@/types/hqnhat.types';
import { formatDateTime } from '@/utils/formatters';

const SECTION_TYPE_CONFIG: Record<number, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' }> = {
  1: { label: 'Lý thuyết', variant: 'info' },
  2: { label: 'Thực hành', variant: 'warning' },
  3: { label: 'Thí nghiệm', variant: 'success' },
  4: { label: 'Đồ án', variant: 'neutral' },
};

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  0: { label: 'Bản nháp', variant: 'neutral' },
  1: { label: 'Mở đăng ký', variant: 'success' },
  2: { label: 'Đóng đăng ký', variant: 'warning' },
  3: { label: 'Hủy', variant: 'error' },
};

const formatTermOption = (term: HqnhatAcademicTerm): string => {
  // Format: HK1 2024-2025 (từ code HK1_2024_2025)
  const code = term.code ?? '';
  const parts = code.split('_');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts.slice(1).join('-')}`;
  }
  return code || `Học kỳ #${term.id}`;
};

const emptyForm = (): HqnhatCourseSectionCreatePayload => ({
  subject_id: 0,
  academic_term_id: 0,
  section_code: '',
  section_type: 1,
  max_students: 50,
  current_students: 0,
  registration_start: '',
  registration_end: '',
  status: 1,
});

export function CourseSectionSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    section_code: search || undefined,
    subject_id: subjectFilter ? Number(subjectFilter) : undefined,
    academic_term_id: termFilter ? Number(termFilter) : undefined,
    section_type: typeFilter ? (Number(typeFilter) as 1 | 2 | 3 | 4) : undefined,
    status: statusFilter ? (Number(statusFilter) as 0 | 1 | 2 | 3) : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatCourseSections(params);
  const { data: subjectsData } = useHqnhatSubjects({ per_page: 100, status: 1 });
  const { data: termsData } = useHqnhatAcademicTerms({ per_page: 100, status: 1 });
  const { data: registrationsData } = useHqnhatCourseRegistrations({ per_page: 1000 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const subjects = Array.isArray(subjectsData?.data) ? subjectsData.data : [];
  const terms = Array.isArray(termsData?.data) ? termsData.data : [];
  const registrations = Array.isArray(registrationsData?.data) ? registrationsData.data : [];

  // Tính sĩ số thực tế từ registrations (vì backend không tự động tăng current_students)
  const getActualStudentCount = (sectionId: number): number => {
    return registrations.filter((r: HqnhatCourseRegistration) => r.course_section_id === sectionId && r.status === 1).length;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatCourseSection | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatCourseSection | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatCourseSectionCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatCourseSection(detailId ?? undefined);
  const createMut = useCreateHqnhatCourseSection();
  const updateMut = useUpdateHqnhatCourseSection();
  const deleteMut = useDeleteHqnhatCourseSection();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getSubjectName = (id: number) =>
    subjects.find((s: HqnhatSubject) => s.id === id)?.name ?? `Môn #${id}`;
  const getTermName = (id: number) => {
    const term = terms.find((t: HqnhatAcademicTerm) => t.id === id);
    if (!term) return `Học kỳ #${id}`;
    return formatTermOption(term);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatCourseSection) => {
    setEditing(item);
    setForm({
      subject_id: item.subject_id,
      academic_term_id: item.academic_term_id,
      section_code: item.section_code,
      section_type: item.section_type as 1 | 2 | 3 | 4,
      max_students: item.max_students,
      current_students: item.current_students,
      registration_start: item.registration_start ?? '',
      registration_end: item.registration_end ?? '',
      status: item.status as 0 | 1 | 2 | 3,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: HqnhatCourseSection) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: HqnhatCourseSection) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setSubjectFilter('');
    setTermFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.subject_id || form.subject_id === 0) e.subject_id = 'Chọn môn học';
    if (!form.academic_term_id || form.academic_term_id === 0) e.academic_term_id = 'Chọn học kỳ';
    if (!form.section_code?.trim()) e.section_code = 'Mã lớp học phần không được để trống';
    if (!form.max_students || form.max_students <= 0) e.max_students = 'Sĩ số tối đa phải > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: HqnhatCourseSectionCreatePayload = {
        ...form,
        subject_id: Number(form.subject_id),
        academic_term_id: Number(form.academic_term_id),
        max_students: Number(form.max_students),
        current_students: Number(form.current_students ?? 0),
        registration_start: form.registration_start || undefined,
        registration_end: form.registration_end || undefined,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm mã lớp học phần..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Môn học</label>
          <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả môn</option>
            {subjects.map((s: HqnhatSubject) => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Học kỳ</label>
          <select value={termFilter} onChange={(e) => { setTermFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả học kỳ</option>
            {terms.map((t: HqnhatAcademicTerm) => <option key={t.id} value={t.id}>{formatTermOption(t)}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Loại</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả loại</option>
            <option value="1">Lý thuyết</option>
            <option value="2">Thực hành</option>
            <option value="3">Thí nghiệm</option>
            <option value="4">Đồ án</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả</option>
            <option value="1">Mở đăng ký</option>
            <option value="2">Đóng đăng ký</option>
            <option value="3">Hủy</option>
            <option value="0">Bản nháp</option>
          </select>
        </div>
        {(search || subjectFilter || termFilter || typeFilter || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm lớp học phần
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã lớp HP</TableHeadCell>
            <TableHeadCell>Môn học</TableHeadCell>
            <TableHeadCell>Học kỳ</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Sĩ số</TableHeadCell>
            <TableHeadCell>Đăng ký</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có lớp học phần nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const tc = SECTION_TYPE_CONFIG[item.section_type] ?? SECTION_TYPE_CONFIG[1];
              const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono font-medium">{item.section_code}</TableCell>
                  <TableCell className="text-sm">{getSubjectName(item.subject_id)}</TableCell>
                  <TableCell className="text-sm">{getTermName(item.academic_term_id)}</TableCell>
                  <TableCell>
                    <Badge variant={tc.variant} size="sm">{tc.label}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {item.current_students ?? 0} / {item.max_students}
                  </TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))]">
                    {item.registration_start ? formatDateTime(item.registration_start) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa lớp học phần' : 'Thêm lớp học phần'}
        size="lg"
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
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Môn học" error={errors.subject_id} required>
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn môn --</option>
                {subjects.map((s: HqnhatSubject) => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </FormField>
            <FormField label="Học kỳ" error={errors.academic_term_id} required>
              <select value={form.academic_term_id} onChange={(e) => setForm({ ...form, academic_term_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>-- Chọn học kỳ --</option>
                {terms.map((t: HqnhatAcademicTerm) => <option key={t.id} value={t.id}>{formatTermOption(t)}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã lớp học phần" error={errors.section_code} required>
              <Input
                value={form.section_code}
                onChange={(e) => setForm({ ...form, section_code: e.target.value.toUpperCase() })}
                placeholder="VD: IT101-01"
              />
            </FormField>
            <FormField label="Loại lớp" required>
              <select value={form.section_type} onChange={(e) => setForm({ ...form, section_type: Number(e.target.value) as 1 | 2 | 3 | 4 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={1}>Lý thuyết</option>
                <option value={2}>Thực hành</option>
                <option value={3}>Thí nghiệm</option>
                <option value={4}>Đồ án</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sĩ số tối đa" error={errors.max_students} required>
              <Input
                type="number"
                value={form.max_students}
                onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })}
                min={1}
              />
            </FormField>
            <FormField label="Trạng thái">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 0 | 1 | 2 | 3 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                <option value={0}>Bản nháp</option>
                <option value={1}>Mở đăng ký</option>
                <option value={2}>Đóng đăng ký</option>
                <option value={3}>Hủy</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Bắt đầu đăng ký">
              <Input
                type="datetime-local"
                value={form.registration_start ? form.registration_start.slice(0, 16) : ''}
                onChange={(e) => setForm({ ...form, registration_start: e.target.value })}
              />
            </FormField>
            <FormField label="Kết thúc đăng ký">
              <Input
                type="datetime-local"
                value={form.registration_end ? form.registration_end.slice(0, 16) : ''}
                onChange={(e) => setForm({ ...form, registration_end: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa lớp học phần"
        description={`Bạn có chắc muốn xóa lớp học phần "${deleting?.section_code}"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết lớp học phần" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mã lớp</p>
                <p className="font-mono text-base font-semibold">{detailData.data.section_code}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p>
                <Badge variant={STATUS_CONFIG[detailData.data.status]?.variant} dot>
                  {STATUS_CONFIG[detailData.data.status]?.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Môn học</p>
                <p className="text-sm">{getSubjectName(detailData.data.subject_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Học kỳ</p>
                <p className="text-sm">{getTermName(detailData.data.academic_term_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Loại</p>
                <Badge variant={SECTION_TYPE_CONFIG[detailData.data.section_type]?.variant} size="sm">
                  {SECTION_TYPE_CONFIG[detailData.data.section_type]?.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Sĩ số</p>
                <p className="tabular-nums text-sm">{detailData.data.current_students ?? 0} / {detailData.data.max_students}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Bắt đầu ĐK</p>
                <p className="text-sm">{detailData.data.registration_start ? formatDateTime(detailData.data.registration_start) : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Kết thúc ĐK</p>
                <p className="text-sm">{detailData.data.registration_end ? formatDateTime(detailData.data.registration_end) : '—'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailData.data); }}>
                <Edit className="h-4 w-4 mr-1" /> Sửa
              </Button>
            </div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>
    </div>
  );
}
