import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RotateCcw, Search } from 'lucide-react';
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
  useHqnhatStudents,
  useCreateHqnhatStudent,
  useUpdateHqnhatStudent,
  useDeleteHqnhatStudent,
  useHqnhatTrainingSystems,
  useHqnhatCourses,
  useHqnhatMajors,
  useHqnhatAdmissionStudents,
  useHqnhatStudentStatusHistories,
  useCreateHqnhatStudentStatusHistory,
  useHqnhatStudentReservations,
  useCreateHqnhatStudentReservation,
  useHqnhatStudentDropouts,
  useCreateHqnhatStudentDropout,
  useHqnhatStudentMajorChanges,
  useCreateHqnhatStudentMajorChange,
  useHqnhatStudentClassChanges,
  useCreateHqnhatStudentClassChange,
  useHqnhatAcademicTerms,
} from '@/hooks/useHqnhat';
import type {
  HqnhatStudent,
  HqnhatStudentCreatePayload,
  HqnhatAcademicTerm,
} from '@/types/hqnhat.types';

const GENDER_CONFIG: Record<number, { label: string; variant: 'info' | 'warning' | 'neutral' }> = {
  1: { label: 'Nam', variant: 'info' },
  2: { label: 'Nữ', variant: 'warning' },
  3: { label: 'Khác', variant: 'neutral' },
};

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  1: { label: 'Đang học', variant: 'success' },
  2: { label: 'Bảo lưu', variant: 'warning' },
  3: { label: 'Đã tốt nghiệp', variant: 'info' },
  4: { label: 'Thôi học', variant: 'error' },
  5: { label: 'Chuyển ngành', variant: 'neutral' },
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
};

const emptyForm = (): HqnhatStudentCreatePayload => ({
  major_id: 0,
  training_system_id: 0,
  course_id: 0,
  full_name: '',
  student_code: '',
  user_id: undefined,
  admission_student_id: undefined,
  class_id: undefined,
  specialization_id: undefined,
  enrollment_date: '',
  gender: undefined,
  date_of_birth: '',
  citizen_id: '',
  phone: '',
  email: '',
  address: '',
  avatar: '',
  status: 1,
});

const normalizeDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.split('T')[0] ?? '';
  return d.toISOString().split('T')[0];
};

export function HqnhatStudentSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    student_code: search || undefined,
    full_name: search || undefined,
    major_id: majorFilter ? Number(majorFilter) : undefined,
    course_id: courseFilter ? Number(courseFilter) : undefined,
    status: statusFilter ? Number(statusFilter) as 1 | 2 | 3 | 4 | 5 : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useHqnhatStudents(params);
  const { data: majorData } = useHqnhatMajors({ per_page: 100, status: 1 });
  const { data: tsData } = useHqnhatTrainingSystems({ per_page: 100, status: 1 });
  const { data: courseData } = useHqnhatCourses({ per_page: 100, status: 1 });
  const { data: admissionData } = useHqnhatAdmissionStudents({ per_page: 100 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const majors = Array.isArray(majorData?.data) ? majorData.data : [];
  const trainingSystems = Array.isArray(tsData?.data) ? tsData.data : [];
  const courses = Array.isArray(courseData?.data) ? courseData.data : [];
  const admissionStudents = Array.isArray(admissionData?.data) ? admissionData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatStudent | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatStudent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HqnhatStudent | null>(null);
  const [form, setForm] = useState<HqnhatStudentCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusChangeType, setStatusChangeType] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<number | null>(null);
  const [statusForm, setStatusForm] = useState<Record<string, string>>({});
  const [statusErrors, setStatusErrors] = useState<Record<string, string>>({});
  const [statusSubmitError, setStatusSubmitError] = useState<string | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const { data: academicTermsData } = useHqnhatAcademicTerms({ per_page: 100, status: 1 });
  const academicTerms: HqnhatAcademicTerm[] = Array.isArray(academicTermsData?.data) ? academicTermsData.data : [];

  const createStatusHistoryMut = useCreateHqnhatStudentStatusHistory();
  const createReservationMut = useCreateHqnhatStudentReservation();
  const createDropoutMut = useCreateHqnhatStudentDropout();
  const createMajorChangeMut = useCreateHqnhatStudentMajorChange();
  const createClassChangeMut = useCreateHqnhatStudentClassChange();

  const createMut = useCreateHqnhatStudent();
  const updateMut = useUpdateHqnhatStudent();
  const deleteMut = useDeleteHqnhatStudent();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getMajorName = (id: number) => majors.find(m => m.id === id)?.name ?? `Ngành #${id}`;
  const getTSName = (id: number) => trainingSystems.find(t => t.id === id)?.name ?? `Hệ #${id}`;
  const getCourseName = (id: number) => courses.find(c => c.id === id)?.name ?? `Khóa #${id}`;
  const getAdmissionStudentName = (id: number | null) => {
    if (!id) return '—';
    const found = admissionStudents.find(a => a.id === id);
    return found ? `${found.candidate_code} - ${found.full_name}` : `TS #${id}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatStudent) => {
    setEditing(item);
    setForm({
      major_id: item.major_id,
      training_system_id: item.training_system_id,
      course_id: item.course_id,
      full_name: item.full_name,
      student_code: item.student_code,
      user_id: item.user_id ?? undefined,
      admission_student_id: item.admission_student_id ?? undefined,
      class_id: item.class_id ?? undefined,
      specialization_id: item.specialization_id ?? undefined,
      enrollment_date: normalizeDate(item.enrollment_date),
      gender: item.gender ?? undefined,
      date_of_birth: normalizeDate(item.date_of_birth),
      citizen_id: item.citizen_id ?? '',
      phone: item.phone ?? '',
      email: item.email ?? '',
      address: item.address ?? '',
      avatar: item.avatar ?? '',
      status: item.status as 1 | 2 | 3 | 4 | 5,
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: HqnhatStudent) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const openDelete = (item: HqnhatStudent) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setMajorFilter('');
    setCourseFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.major_id || form.major_id === 0) e.major_id = 'Chọn ngành học';
    if (!form.training_system_id || form.training_system_id === 0) e.training_system_id = 'Chọn hệ đào tạo';
    if (!form.course_id || form.course_id === 0) e.course_id = 'Chọn khóa học';
    if (!form.full_name?.trim()) e.full_name = 'Họ tên không được để trống';
    if (!form.student_code?.trim()) e.student_code = 'Mã sinh viên không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const { student_code, status, ...restPayload } = form;
      const payload: HqnhatStudentCreatePayload = {
        ...restPayload,
        major_id: Number(form.major_id),
        training_system_id: Number(form.training_system_id),
        course_id: Number(form.course_id),
        class_id: form.class_id ? Number(form.class_id) : undefined,
        specialization_id: form.specialization_id ? Number(form.specialization_id) : undefined,
      };

      if (editing && editing.status !== form.status) {
        const STUDENT_TO_HISTORY: Record<number, number> = {
          // Student Status -> History Status
          1: 1, // STUDYING -> STUDYING
          2: 2, // RESERVED -> RESERVED
          3: 4, // GRADUATED -> GRADUATED (History 4 = GRADUATED)
          4: 3, // DROPPED -> DROPPED (History 3 = DROPPED)
          5: 5, // TRANSFERRED -> TRANSFERRED_MAJOR
        };
        const historiesStatus = STUDENT_TO_HISTORY[form.status] ?? form.status;
        setPendingStatus(form.status);
        setStatusChangeType(historiesStatus);
        setStatusForm({
          effective_date: new Date().toISOString().split('T')[0],
          decision_no: '',
          decision_date: '',
          reason: '',
        });
        setStatusErrors({});
        setStatusSubmitError(null);
        setStatusModalOpen(true);
        (window as any).__pendingStudentPayload = payload;
        return;
      }

      editing
        ? await updateMut.mutateAsync({ id: editing.id, payload })
        : await createMut.mutateAsync(form);
      setModalOpen(false);
    } catch (err: any) {
      let message = 'Có lỗi xảy ra';
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
      setSubmitError(message);
    }
  };

  const handleStatusSubmit = async () => {
    if (!editing || !pendingStatus) return;
    const pendingPayload = (window as any).__pendingStudentPayload;
    if (!pendingPayload) { setStatusSubmitError('Không tìm thấy dữ liệu sinh viên'); return; }

    const errs: Record<string, string> = {};
    if (statusChangeType === 2) {
      if (!statusForm.from_date) errs.from_date = 'Chọn ngày bắt đầu bảo lưu';
      if (!statusForm.to_date) errs.to_date = 'Chọn ngày kết thúc bảo lưu';
    } else if (statusChangeType === 3) {
      if (!statusForm.dropout_date) errs.dropout_date = 'Chọn ngày thôi học';
    } else if (statusChangeType === 4) {
      if (!statusForm.effective_date) errs.effective_date = 'Chọn ngày tốt nghiệp';
    } else if (statusChangeType === 5) {
      if (!statusForm.to_major_id) errs.to_major_id = 'Chọn ngành chuyển đến';
      if (!statusForm.effective_date) errs.effective_date = 'Chọn ngày hiệu lực';
    } else if (statusChangeType === 6) {
      if (!statusForm.to_class_id) errs.to_class_id = 'Nhập ID lớp chuyển đến';
      if (!statusForm.effective_date) errs.effective_date = 'Chọn ngày hiệu lực';
    }
    if (Object.keys(errs).length > 0) { setStatusErrors(errs); return; }

    setStatusSubmitting(true);
    setStatusSubmitError(null);
    try {
      const studentId = editing!.id;
      const commonPayload = { student_id: studentId, decision_no: statusForm.decision_no || undefined, decision_date: statusForm.decision_date || undefined, reason: statusForm.reason || undefined };

      if (statusChangeType === 2) {
        await createReservationMut.mutateAsync({ ...commonPayload, from_date: statusForm.from_date, to_date: statusForm.to_date, semester_from_id: statusForm.semester_from_id ? Number(statusForm.semester_from_id) : undefined, semester_to_id: statusForm.semester_to_id ? Number(statusForm.semester_to_id) : undefined });
        await createStatusHistoryMut.mutateAsync({ ...commonPayload, status: 2, effective_date: statusForm.from_date || new Date().toISOString().split('T')[0] });
      } else if (statusChangeType === 3) {
        await createDropoutMut.mutateAsync({ ...commonPayload, dropout_date: statusForm.dropout_date });
        await createStatusHistoryMut.mutateAsync({ ...commonPayload, status: 3, effective_date: statusForm.dropout_date });
      } else if (statusChangeType === 4) {
        await createStatusHistoryMut.mutateAsync({ ...commonPayload, status: 4, effective_date: statusForm.effective_date });
      } else if (statusChangeType === 5) {
        await createMajorChangeMut.mutateAsync({ ...commonPayload, from_major_id: editing!.major_id, to_major_id: Number(statusForm.to_major_id), effective_date: statusForm.effective_date });
        await createStatusHistoryMut.mutateAsync({ ...commonPayload, status: 5, effective_date: statusForm.effective_date });
      } else if (statusChangeType === 6) {
        await createClassChangeMut.mutateAsync({ ...commonPayload, from_class_id: editing!.class_id ?? undefined, to_class_id: Number(statusForm.to_class_id), effective_date: statusForm.effective_date });
        await createStatusHistoryMut.mutateAsync({ ...commonPayload, status: 6, effective_date: statusForm.effective_date });
      }

      // Cập nhật trạng thái sinh viên
      // Sử dụng pendingPayload (đã có đầy đủ fields) và cập nhật status
      const STUDENT_STATUS_MAP: Record<number, number> = {
        // History Status -> Student Status
        1: 1,  // STUDYING -> 1 (STUDYING)
        2: 2,  // RESERVED -> 2 (RESERVED)
        3: 4,  // DROPPED -> 4 (DROPPED) - API Student entity có 4 = DROPPED
        4: 3,  // GRADUATED -> 3 (GRADUATED) - API Student entity có 3 = GRADUATED
        5: 5,  // TRANSFERRED_MAJOR -> 5 (TRANSFERRED)
        6: 1,  // TRANSFERRED_CLASS -> 1 (STUDYING - chuyển lớp vẫn đang học)
      };
      const newStudentStatus = STUDENT_STATUS_MAP[statusChangeType] ?? pendingStatus;
      // API yêu cầu: major_id, training_system_id, course_id, full_name, status
      await updateMut.mutateAsync({
        id: studentId,
        payload: {
          ...pendingPayload,
          status: newStudentStatus as 1 | 2 | 3 | 4 | 5
        }
      });

      (window as any).__pendingStudentPayload = null;
      setStatusModalOpen(false);
      setModalOpen(false);
    } catch (err: any) {
      let message = 'Có lỗi xảy ra';
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
      setStatusSubmitError(message);
    } finally {
      setStatusSubmitting(false);
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
        <div className="w-72">
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Mã SV, họ tên..." className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-10 pr-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Ngành học</label>
          <select value={majorFilter} onChange={(e) => { setMajorFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả ngành</option>
            {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả khóa</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả</option>
            <option value="1">Đang học</option>
            <option value="2">Bảo lưu</option>
            <option value="3">Đã tốt nghiệp</option>
            <option value="4">Thôi học</option>
            <option value="5">Chuyển ngành</option>
          </select>
        </div>
        {(search || majorFilter || courseFilter || statusFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>Đặt lại</Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Thêm sinh viên</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã SV</TableHeadCell>
            <TableHeadCell>Họ tên</TableHeadCell>
            <TableHeadCell>Giới tính</TableHeadCell>
            <TableHeadCell>Ngành</TableHeadCell>
            <TableHeadCell>Khóa</TableHeadCell>
            <TableHeadCell>Hệ</TableHeadCell>
            <TableHeadCell>Ngày nhập học</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={10} rows={5} />
          ) : items.length === 0 ? (
            <TableRow><TableCell colSpan={10} className="text-center py-10 text-[rgb(var(--text-muted))]">Chưa có sinh viên nào</TableCell></TableRow>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                <TableCell className="font-mono text-sm">{item.student_code}</TableCell>
                <TableCell className="font-medium">{item.full_name}</TableCell>
                <TableCell><Badge variant={GENDER_CONFIG[item.gender ?? 0]?.variant ?? 'neutral'} size="sm">{GENDER_CONFIG[item.gender ?? 0]?.label ?? '—'}</Badge></TableCell>
                <TableCell className="text-sm">{getMajorName(item.major_id)}</TableCell>
                <TableCell className="text-sm">{getCourseName(item.course_id)}</TableCell>
                <TableCell className="text-sm">{getTSName(item.training_system_id)}</TableCell>
                <TableCell className="text-sm">{formatDate(item.enrollment_date)}</TableCell>
                <TableCell><Badge variant={STATUS_CONFIG[item.status]?.variant ?? 'neutral'} dot size="sm">{STATUS_CONFIG[item.status]?.label ?? '—'}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} pageSizeOptions={[10, 25, 50, 100]} />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa sinh viên' : 'Thêm sinh viên'} size="lg" footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={handleSubmit} loading={isSubmitting}>{editing ? 'Lưu thay đổi' : 'Tạo mới'}</Button></>}>
        <div className="space-y-4">
          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã sinh viên" error={errors.student_code} required><input type="text" value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value.toUpperCase() })} placeholder="VD: SV2024001" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
            <FormField label="Họ tên" error={errors.full_name} required><input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="VD: Nguyễn Văn A" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Giới tính"><select value={form.gender ?? ''} onChange={(e) => setForm({ ...form, gender: e.target.value ? Number(e.target.value) as 1 | 2 | 3 : undefined })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value="">-- Chọn --</option><option value={1}>Nam</option><option value={2}>Nữ</option><option value={3}>Khác</option></select></FormField>
            <FormField label="Ngày sinh"><input type="date" value={form.date_of_birth ?? ''} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số CCCD"><input type="text" value={form.citizen_id ?? ''} onChange={(e) => setForm({ ...form, citizen_id: e.target.value })} placeholder="VD: 001205000001" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
            <FormField label="Điện thoại"><input type="text" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="VD: 0901234567" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email"><input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="VD: email@example.com" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
            <FormField label="Địa chỉ"><input type="text" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="VD: 123 ABC, TP.HCM" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngành học" error={errors.major_id} required><select value={form.major_id} onChange={(e) => setForm({ ...form, major_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value={0}>-- Chọn ngành --</option>{majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></FormField>
            <FormField label="Hệ đào tạo" error={errors.training_system_id} required><select value={form.training_system_id} onChange={(e) => setForm({ ...form, training_system_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value={0}>-- Chọn hệ --</option>{trainingSystems.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Khóa học" error={errors.course_id} required><select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value={0}>-- Chọn khóa --</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormField>
            <FormField label="Thí sinh trúng tuyển (liên kết)"><select value={form.admission_student_id ?? ''} onChange={(e) => setForm({ ...form, admission_student_id: e.target.value ? Number(e.target.value) : undefined })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value="">-- Không liên kết --</option>{admissionStudents.map(a => <option key={a.id} value={a.id}>{a.candidate_code} - {a.full_name}</option>)}</select></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngày nhập học"><input type="date" value={form.enrollment_date ?? ''} onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField>
            <FormField label="Trạng thái"><select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value={1}>Đang học</option><option value={2}>Bảo lưu</option><option value={3}>Đã tốt nghiệp</option><option value={4}>Nghỉ học</option><option value={5}>Chuyển ngành</option></select></FormField>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xóa sinh viên" description={`Bạn có chắc muốn xóa sinh viên "${deleting?.full_name}" (mã ${deleting?.student_code})? Hành động này không thể hoàn tác.`} confirmText="Xóa" variant="danger" loading={deleteMut.isPending} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết sinh viên" size="lg">
        {detailItem ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2 space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Họ tên</p><p className="text-base font-semibold">{detailItem.full_name}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Mã sinh viên</p><p className="font-mono text-sm font-semibold">{detailItem.student_code}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Trạng thái</p><Badge variant={STATUS_CONFIG[detailItem.status]?.variant ?? 'neutral'} dot>{STATUS_CONFIG[detailItem.status]?.label ?? '—'}</Badge></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Giới tính</p><p className="text-sm">{GENDER_CONFIG[detailItem.gender ?? 0]?.label ?? '—'}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày sinh</p><p className="text-sm">{formatDate(detailItem.date_of_birth)}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Số CCCD</p><p className="font-mono text-sm">{detailItem.citizen_id ?? '—'}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điện thoại</p><p className="text-sm">{detailItem.phone ?? '—'}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Email</p><p className="text-sm">{detailItem.email ?? '—'}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Địa chỉ</p><p className="text-sm">{detailItem.address ?? '—'}</p></div>
              <div className="col-span-2 space-y-1 border-t border-[rgb(var(--border))] pt-4 mt-2"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Thông tin học tập</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngành</p><p className="text-sm font-medium">{getMajorName(detailItem.major_id)}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Hệ đào tạo</p><p className="text-sm">{getTSName(detailItem.training_system_id)}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Khóa học</p><p className="text-sm">{getCourseName(detailItem.course_id)}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ngày nhập học</p><p className="text-sm">{formatDate(detailItem.enrollment_date)}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Thí sinh TS</p><p className="text-sm">{getAdmissionStudentName(detailItem.admission_student_id)}</p></div>
              <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID</p><p className="font-mono text-sm">#{detailItem.id}</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button><Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}><Edit className="h-4 w-4 mr-1" /> Sửa</Button></div>
          </div>
        ) : <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>}
      </Modal>

      {/* Status Change Modal */}
      <Modal open={statusModalOpen} onClose={() => { setStatusModalOpen(false); (window as any).__pendingStudentPayload = null; }} title="Xác nhận thay đổi trạng thái sinh viên" size="lg" footer={<><Button variant="outline" onClick={() => { setStatusModalOpen(false); (window as any).__pendingStudentPayload = null; }}>Hủy</Button><Button onClick={handleStatusSubmit} loading={statusSubmitting}>Xác nhận</Button></>}>
        <div className="space-y-4">
          {statusSubmitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{statusSubmitError}</div>}
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200"><p className="text-sm font-medium text-blue-800">Sinh viên: <span className="font-semibold">{editing?.full_name}</span> ({editing?.student_code})</p><p className="text-sm text-blue-700 mt-1">Trạng thái mới: <span className="font-semibold">{STATUS_CONFIG[pendingStatus ?? 0]?.label ?? '—'}</span></p></div>
          {statusChangeType === 2 && (<div className="space-y-4"><p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Vui lòng nhập thông tin bảo lưu:</p><div className="grid grid-cols-2 gap-4"><FormField label="Từ ngày" error={statusErrors.from_date} required><input type="date" value={statusForm.from_date ?? ''} onChange={(e) => setStatusForm({ ...statusForm, from_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField><FormField label="Đến ngày" error={statusErrors.to_date} required><input type="date" value={statusForm.to_date ?? ''} onChange={(e) => setStatusForm({ ...statusForm, to_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField></div><div className="grid grid-cols-2 gap-4"><FormField label="Học kỳ bắt đầu"><select value={statusForm.semester_from_id ?? ''} onChange={(e) => setStatusForm({ ...statusForm, semester_from_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value="">-- Chọn HK --</option>{academicTerms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></FormField><FormField label="Học kỳ kết thúc"><select value={statusForm.semester_to_id ?? ''} onChange={(e) => setStatusForm({ ...statusForm, semester_to_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value="">-- Chọn HK --</option>{academicTerms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></FormField></div></div>)}
          {statusChangeType === 3 && (<div className="space-y-4"><p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Vui lòng nhập thông tin thôi học:</p><FormField label="Ngày thôi học" error={statusErrors.dropout_date} required><input type="date" value={statusForm.dropout_date ?? ''} onChange={(e) => setStatusForm({ ...statusForm, dropout_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField></div>)}
          {statusChangeType === 4 && (<div className="space-y-4"><p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Vui lòng nhập thông tin tốt nghiệp:</p><FormField label="Ngày tốt nghiệp" error={statusErrors.effective_date} required><input type="date" value={statusForm.effective_date ?? ''} onChange={(e) => setStatusForm({ ...statusForm, effective_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField></div>)}
          {statusChangeType === 5 && (<div className="space-y-4"><p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Vui lòng nhập thông tin chuyển ngành:</p><FormField label="Ngành chuyển đến" error={statusErrors.to_major_id} required><select value={statusForm.to_major_id ?? ''} onChange={(e) => setStatusForm({ ...statusForm, to_major_id: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"><option value="">-- Chọn ngành --</option>{majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></FormField><FormField label="Ngày hiệu lực" error={statusErrors.effective_date} required><input type="date" value={statusForm.effective_date ?? ''} onChange={(e) => setStatusForm({ ...statusForm, effective_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField></div>)}
          {statusChangeType === 6 && (<div className="space-y-4"><p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Vui lòng nhập thông tin chuyển lớp:</p><FormField label="Lớp chuyển đến (ID)" error={statusErrors.to_class_id} required><input type="number" value={statusForm.to_class_id ?? ''} onChange={(e) => setStatusForm({ ...statusForm, to_class_id: e.target.value })} placeholder="Nhập ID lớp mới" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField><FormField label="Ngày hiệu lực" error={statusErrors.effective_date} required><input type="date" value={statusForm.effective_date ?? ''} onChange={(e) => setStatusForm({ ...statusForm, effective_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField></div>)}
          <div className="grid grid-cols-2 gap-4"><FormField label="Số quyết định"><input type="text" value={statusForm.decision_no ?? ''} onChange={(e) => setStatusForm({ ...statusForm, decision_no: e.target.value })} placeholder="VD: QD-125/2024" className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField><FormField label="Ngày quyết định"><input type="date" value={statusForm.decision_date ?? ''} onChange={(e) => setStatusForm({ ...statusForm, decision_date: e.target.value })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm" /></FormField></div>
          <FormField label="Lý do / Ghi chú"><textarea value={statusForm.reason ?? ''} onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })} placeholder="Nhập lý do thay đổi trạng thái..." rows={3} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none" /></FormField>
        </div>
      </Modal>
    </div>
  );
}
