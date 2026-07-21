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
  useHqnhatClassSchedules,
  useHqnhatClassSchedule,
  useCreateHqnhatClassSchedule,
  useUpdateHqnhatClassSchedule,
  useDeleteHqnhatClassSchedule,
  useHqnhatCourseSections,
} from '@/hooks/useHqnhat';
import type {
  HqnhatClassSchedule,
  HqnhatClassScheduleCreatePayload,
  HqnhatCourseSection,
} from '@/types/hqnhat.types';
import { formatDate } from '@/utils/formatters';

const DAY_OF_WEEK_CONFIG: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
};

const emptyForm = (): HqnhatClassScheduleCreatePayload => ({
  course_section_id: 0,
  lecturer_id: 0,
  room_id: 0,
  day_of_week: 1,
  lesson_from: 1,
  lesson_to: 3,
  start_date: '',
  end_date: '',
});

export function ClassScheduleSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { page, pageSize } = pagination;

  const [sectionFilter, setSectionFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    course_section_id: sectionFilter ? Number(sectionFilter) : undefined,
    day_of_week: dayFilter ? Number(dayFilter) : undefined,
  };

  const { data, isLoading, isFetching } = useHqnhatClassSchedules(params);
  const { data: sectionsData } = useHqnhatCourseSections({ per_page: 100, status: 1 });

  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;
  const sections = Array.isArray(sectionsData?.data) ? sectionsData.data : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatClassSchedule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<HqnhatClassSchedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<HqnhatClassScheduleCreatePayload>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useHqnhatClassSchedule(detailId ?? undefined);
  const createMut = useCreateHqnhatClassSchedule();
  const updateMut = useUpdateHqnhatClassSchedule();
  const deleteMut = useDeleteHqnhatClassSchedule();
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const getSectionCode = (id: number) =>
    sections.find((s: HqnhatCourseSection) => s.id === id)?.section_code ?? `LHP #${id}`;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: HqnhatClassSchedule) => {
    setEditing(item);
    setForm({
      course_section_id: item.course_section_id,
      lecturer_id: item.lecturer_id,
      room_id: item.room_id,
      day_of_week: item.day_of_week,
      lesson_from: item.lesson_from,
      lesson_to: item.lesson_to,
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
    });
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const openDetail = (item: HqnhatClassSchedule) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openDelete = (item: HqnhatClassSchedule) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSectionFilter('');
    setDayFilter('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.course_section_id || form.course_section_id === 0) e.course_section_id = 'Chọn lớp học phần';
    if (!form.lecturer_id || form.lecturer_id === 0) e.lecturer_id = 'Nhập ID giảng viên';
    if (!form.room_id || form.room_id === 0) e.room_id = 'Nhập ID phòng';
    if (!form.day_of_week || form.day_of_week < 1 || form.day_of_week > 7) e.day_of_week = 'Chọn thứ';
    if (!form.lesson_from || form.lesson_from < 1) e.lesson_from = 'Nhập tiết bắt đầu';
    if (!form.lesson_to || form.lesson_to < form.lesson_from) e.lesson_to = 'Tiết kết thúc phải ≥ tiết bắt đầu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    try {
      const payload: HqnhatClassScheduleCreatePayload = {
        ...form,
        course_section_id: Number(form.course_section_id),
        lecturer_id: Number(form.lecturer_id),
        room_id: Number(form.room_id),
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
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
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Lớp học phần</label>
          <select value={sectionFilter} onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[14rem]">
            <option value="">Tất cả lớp HP</option>
            {sections.map((s: HqnhatCourseSection) => <option key={s.id} value={s.id}>{s.section_code}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Thứ</label>
          <select value={dayFilter} onChange={(e) => { setDayFilter(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
            <option value="">Tất cả</option>
            {Object.entries(DAY_OF_WEEK_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        {(sectionFilter || dayFilter) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
        <Button className="ml-auto" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm buổi học
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Lớp học phần</TableHeadCell>
            <TableHeadCell>Thứ</TableHeadCell>
            <TableHeadCell>Tiết</TableHeadCell>
            <TableHeadCell>Phòng</TableHeadCell>
            <TableHeadCell>Giảng viên</TableHeadCell>
            <TableHeadCell>Thời gian</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                Chưa có buổi học nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => (
              <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell className="font-mono font-medium">{getSectionCode(item.course_section_id)}</TableCell>
                <TableCell>
                  <Badge variant="info" size="sm">{DAY_OF_WEEK_CONFIG[item.day_of_week] ?? `Thứ ${item.day_of_week}`}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">Tiết {item.lesson_from} - {item.lesson_to}</TableCell>
                <TableCell className="font-mono">#{item.room_id}</TableCell>
                <TableCell className="font-mono">#{item.lecturer_id}</TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-muted))]">
                  {item.start_date && item.end_date
                    ? `${formatDate(item.start_date)} → ${formatDate(item.end_date)}`
                    : '—'}
                </TableCell>
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
        title={editing ? 'Sửa buổi học' : 'Thêm buổi học'}
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
          <FormField label="Lớp học phần" error={errors.course_section_id} required>
            <select value={form.course_section_id} onChange={(e) => setForm({ ...form, course_section_id: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
              <option value={0}>-- Chọn lớp HP --</option>
              {sections.map((s: HqnhatCourseSection) => <option key={s.id} value={s.id}>{s.section_code}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ID Giảng viên" error={errors.lecturer_id} required>
              <Input
                type="number"
                value={form.lecturer_id}
                onChange={(e) => setForm({ ...form, lecturer_id: Number(e.target.value) })}
                min={1}
                placeholder="Nhập ID giảng viên"
              />
            </FormField>
            <FormField label="ID Phòng học" error={errors.room_id} required>
              <Input
                type="number"
                value={form.room_id}
                onChange={(e) => setForm({ ...form, room_id: Number(e.target.value) })}
                min={1}
                placeholder="Nhập ID phòng"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Thứ" error={errors.day_of_week} required>
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })} className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm">
                {Object.entries(DAY_OF_WEEK_CONFIG).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Tiết bắt đầu" error={errors.lesson_from} required>
              <Input
                type="number"
                value={form.lesson_from}
                onChange={(e) => setForm({ ...form, lesson_from: Number(e.target.value) })}
                min={1}
                max={15}
              />
            </FormField>
            <FormField label="Tiết kết thúc" error={errors.lesson_to} required>
              <Input
                type="number"
                value={form.lesson_to}
                onChange={(e) => setForm({ ...form, lesson_to: Number(e.target.value) })}
                min={1}
                max={15}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ngày bắt đầu">
              <Input
                type="date"
                value={form.start_date ?? ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </FormField>
            <FormField label="Ngày kết thúc">
              <Input
                type="date"
                value={form.end_date ?? ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa buổi học"
        description={`Bạn có chắc muốn xóa buổi học của lớp ${deleting ? getSectionCode(deleting.course_section_id) : ''}?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết buổi học" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" /></div>
        ) : detailData?.data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Lớp học phần</p>
                <p className="font-mono text-base font-semibold">{getSectionCode(detailData.data.course_section_id)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Thứ</p>
                <Badge variant="info" dot>{DAY_OF_WEEK_CONFIG[detailData.data.day_of_week]}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Tiết</p>
                <p className="tabular-nums text-sm">{detailData.data.lesson_from} - {detailData.data.lesson_to}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Phòng</p>
                <p className="font-mono text-sm">#{detailData.data.room_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Giảng viên</p>
                <p className="font-mono text-sm">#{detailData.data.lecturer_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Thời gian áp dụng</p>
                <p className="text-xs">{detailData.data.start_date && detailData.data.end_date ? `${formatDate(detailData.data.start_date)} → ${formatDate(detailData.data.end_date)}` : '—'}</p>
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
