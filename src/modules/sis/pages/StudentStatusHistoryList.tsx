import { useState } from 'react';
import { Plus, RotateCcw, Search } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField, StudentPicker } from '@/components/forms';
import { ConfirmModal } from '@/components/ui';
import { usePagination } from '@/hooks';
import {
  useHqnhatStudentStatusHistories,
  useCreateHqnhatStudentStatusHistory,
  useHqnhatStudents,
  useHqnhatMajors,
  useHqnhatAcademicTerms,
  useUpdateHqnhatStudent,
} from '@/hooks/useHqnhat';
import type {
  HqnhatStudent,
  HqnhatStudentStatusHistory,
  HqnhatStudentStatusHistoryCreatePayload,
} from '@/types/hqnhat.types';

// Status labels
const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  1: { label: 'Đang học', variant: 'success' },
  2: { label: 'Bảo lưu', variant: 'warning' },
  3: { label: 'Thôi học', variant: 'error' },
  4: { label: 'Tốt nghiệp', variant: 'info' },
  5: { label: 'Chuyển ngành', variant: 'neutral' },
  6: { label: 'Chuyển lớp', variant: 'neutral' },
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
};

const emptyForm = (): HqnhatStudentStatusHistoryCreatePayload => ({
  student_id: 0,
  status: 1,
  effective_date: '',
  decision_no: '',
  decision_date: '',
  reason: '',
  note: '',
});

export default function StudentStatusHistoryList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    student_id: studentFilter ? Number(studentFilter) : undefined,
    status: statusFilter ? Number(statusFilter) as 1 | 2 | 3 | 4 | 5 | 6 : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useHqnhatStudentStatusHistories(params);
  const { data: studentData } = useHqnhatStudents({ per_page: 100 });
  const { data: majorData } = useHqnhatMajors({ per_page: 100, status: 1 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const students = Array.isArray(studentData?.data) ? studentData.data : [];
  const majors = Array.isArray(majorData?.data) ? majorData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<HqnhatStudentStatusHistoryCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDropdown, setStudentDropdown] = useState<HqnhatStudent[]>([]);

  const createMut = useCreateHqnhatStudentStatusHistory();
  const updateStudentMut = useUpdateHqnhatStudent();
  const isSubmitting = createMut.isPending;

  // Filter students for dropdown
  const filteredStudents = students.filter((s: HqnhatStudent) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return s.full_name.toLowerCase().includes(q) || s.student_code.toLowerCase().includes(q);
  });

  const getStudentName = (id: number | string) => {
    const numId = typeof id === 'string' ? Number(id) : id;
    const s = students.find((s: HqnhatStudent) => Number(s.id) === numId);
    return s ? `${s.student_code} — ${s.full_name}` : `SV #${id}`;
  };

  const getMajorName = (id: number) => {
    const m = majors.find((m: any) => m.id === id);
    return m?.name ?? `Ngành #${id}`;
  };

  const resetFilters = () => {
    setSearch('');
    setStudentFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.student_id || form.student_id === 0) e.student_id = 'Chọn sinh viên';
    if (!form.effective_date) e.effective_date = 'Chọn ngày hiệu lực';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const historyStatus = Number(form.status) as 1 | 2 | 3 | 4 | 5 | 6;
      await createMut.mutateAsync({
        ...form,
        student_id: Number(form.student_id),
        status: historyStatus,
      });

      // Cập nhật trạng thái sinh viên dựa trên status lịch sử
      // API yêu cầu đầy đủ fields: major_id, training_system_id, course_id, full_name, status
      const student = students.find(s => s.id === Number(form.student_id));
      if (student) {
        const STUDENT_STATUS_MAP: Record<number, number> = {
          // History Status -> Student Status
          1: 1,  // STUDYING -> 1 (STUDYING)
          2: 2,  // RESERVED -> 2 (RESERVED)
          3: 4,  // DROPPED -> 4 (DROPPED) - Student 4 = DROPPED
          4: 3,  // GRADUATED -> 3 (GRADUATED) - Student 3 = GRADUATED
          5: 5,  // TRANSFERRED_MAJOR -> 5 (TRANSFERRED)
          6: 1,  // TRANSFERRED_CLASS -> 1 (STUDYING - chuyển lớp vẫn đang học)
        };
        await updateStudentMut.mutateAsync({
          id: Number(form.student_id),
          payload: {
            major_id: student.major_id,
            training_system_id: student.training_system_id,
            course_id: student.course_id,
            full_name: student.full_name,
            status: STUDENT_STATUS_MAP[historyStatus] as 1 | 2 | 3 | 4 | 5
          }
        });
      }

      setModalOpen(false);
    } catch (err: any) {
      let message = 'Có lỗi xảy ra';
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
      setSubmitError(message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Mã SV, họ tên..."
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-10 pr-3 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="1">Đang học</option>
            <option value="2">Bảo lưu</option>
            <option value="3">Thôi học</option>
            <option value="4">Tốt nghiệp</option>
            <option value="5">Chuyển ngành</option>
            <option value="6">Chuyển lớp</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setForm(emptyForm()); setErrors({}); setSubmitError(null); setStudentSearch(''); setModalOpen(true); }}>
          Tạo mới
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã SV</TableHeadCell>
            <TableHeadCell>Họ tên</TableHeadCell>
            <TableHeadCell>Ngành</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Ngày hiệu lực</TableHeadCell>
            <TableHeadCell>Số QĐ</TableHeadCell>
            <TableHeadCell>Ngày QĐ</TableHeadCell>
            <TableHeadCell>Lý do</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={5} colSpan={9} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-[rgb(var(--text-muted))]">
                {search || statusFilter ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lịch sử trạng thái nào'}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item: HqnhatStudentStatusHistory, i) => {
              const numStudentId = typeof item.student_id === 'string' ? Number(item.student_id) : item.student_id;
              const student = students.find((s: HqnhatStudent) => Number(s.id) === numStudentId);
              return (
                <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student?.student_code ?? `SV #${item.student_id}`}</TableCell>
                  <TableCell className="font-medium">{student?.full_name ?? `Sinh viên #${item.student_id}`}</TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">
                    {student?.major_id ? getMajorName(student.major_id) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_CONFIG[item.status]?.variant ?? 'neutral'} dot size="sm">
                      {STATUS_CONFIG[item.status]?.label ?? `Trạng thái ${item.status}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(item.effective_date)}</TableCell>
                  <TableCell className="font-mono text-xs">{item.decision_no ?? '—'}</TableCell>
                  <TableCell className="text-sm">{formatDate(item.decision_date)}</TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))] max-w-[200px] truncate" title={item.reason ?? ''}>
                    {item.reason ?? '—'}
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
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tạo lịch sử trạng thái sinh viên"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>Tạo mới</Button>
          </>
        }
      >
        <div className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{submitError}</div>
          )}

          {/* Student selector with dropdown */}
          <FormField label="Sinh viên" error={errors.student_id} required>
            <StudentPicker
              value={form.student_id}
              onChange={(id) => setForm({ ...form, student_id: id })}
              error={errors.student_id}
              required
              onlyStudying={false}
            />
          </FormField>

          <FormField label="Trạng thái mới" error={errors.status} required>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value={1}>Đang học</option>
              <option value={2}>Bảo lưu</option>
              <option value={3}>Thôi học</option>
              <option value={4}>Tốt nghiệp</option>
              <option value={5}>Chuyển ngành</option>
              <option value={6}>Chuyển lớp</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngày hiệu lực" error={errors.effective_date} required>
              <input
                type="date"
                value={form.effective_date}
                onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
            <FormField label="Ngày quyết định">
              <input
                type="date"
                value={form.decision_date ?? ''}
                onChange={(e) => setForm({ ...form, decision_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
              />
            </FormField>
          </div>

          <FormField label="Số quyết định">
            <input
              type="text"
              value={form.decision_no ?? ''}
              onChange={(e) => setForm({ ...form, decision_no: e.target.value })}
              placeholder="VD: QD-123/2024"
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            />
          </FormField>

          <FormField label="Lý do">
            <textarea
              value={form.reason ?? ''}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Nhập lý do thay đổi trạng thái..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none"
            />
          </FormField>

          <FormField label="Ghi chú">
            <textarea
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Ghi chú thêm (nếu có)..."
              rows={2}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none"
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
