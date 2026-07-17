import { useState, useEffect } from 'react';
import { Plus, Search, RotateCcw, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import {
  Button,
  Input,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  ConfirmModal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import {
  useHqnhatSubjectConditions,
  useHqnhatSubjects,
  useCreateHqnhatSubjectCondition,
  useUpdateHqnhatSubjectCondition,
  useDeleteHqnhatSubjectCondition,
} from '@/hooks/useHqnhat';
import type { HqnhatSubjectCondition, HqnhatSubjectConditionCreatePayload, HqnhatSubject } from '@/types/hqnhat.types';

export default function SubjectConditionList() {
  const { pagination, setPage, setPageSize } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<HqnhatSubjectCondition | null>(null);
  const [deleting, setDeleting] = useState<HqnhatSubjectCondition | null>(null);
  const [viewing, setViewing] = useState<HqnhatSubjectCondition | null>(null);

  const { data, isLoading, isError, error, refetch } = useHqnhatSubjectConditions({
    page: pagination.page,
    per_page: pagination.pageSize,
    sort_by: 'id',
    sort_direction: 'desc',
    subject_id: subjectId ? Number(subjectId) : undefined,
  });

  const { data: subjectsData } = useHqnhatSubjects({ per_page: 1000 });

  const createMut = useCreateHqnhatSubjectCondition();
  const updateMut = useUpdateHqnhatSubjectCondition();
  const deleteMut = useDeleteHqnhatSubjectCondition();

  const conditions = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const subjects = subjectsData?.data ?? [];

  const getSubjectName = (id: number) => {
    const s = subjects.find((x: HqnhatSubject) => x.id === id);
    return s ? `${s.code} — ${s.name}` : `Môn #${id}`;
  };

  const resetFilters = () => {
    setSearch('');
    setSubjectId('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormModalOpen(true);
  };

  const filtered = conditions;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách điều kiện học phần"
        description={`${total} điều kiện trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Điều kiện học phần' },
        ]}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm điều kiện
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px]"
        >
          <option value="">Tất cả môn học</option>
          {subjects.map((s: HqnhatSubject) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>
        <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
          Đặt lại
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-16">STT</TableHeadCell>
            <TableHeadCell>Môn học</TableHeadCell>
            <TableHeadCell>Điểm TB tối thiểu</TableHeadCell>
            <TableHeadCell>Tín chỉ tích lũy tối thiểu</TableHeadCell>
            <TableHeadCell>Số môn thi trượt tối đa</TableHeadCell>
            <TableHeadCell>Ghi chú</TableHeadCell>
            <TableHeadCell className="w-40 text-right">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : isError ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                <div className="space-y-2">
                  <p className="text-red-500">{(error as Error)?.message || 'Lỗi không xác định'}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Thử lại
                  </Button>
                </div>
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                <BookOpen className="mx-auto h-12 w-12 mb-3 text-[rgb(var(--text-muted))]" />
                <p>Không có điều kiện học phần nào</p>
              </td>
            </tr>
          ) : (
            filtered.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(pagination.page - 1) * pagination.pageSize + i + 1}
                </TableCell>
                <TableCell className="font-medium">{getSubjectName(item.subject_id)}</TableCell>
                <TableCell className="tabular-nums">{item.min_gpa.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">{item.min_completed_credit}</TableCell>
                <TableCell className="tabular-nums">{item.max_failed_subject}</TableCell>
                <TableCell className="max-w-xs truncate text-[rgb(var(--text-secondary))]">
                  {item.note || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewing(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setFormModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(item)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {meta && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      )}

      {/* Detail modal */}
      <SubjectConditionDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        condition={viewing}
        getSubjectName={getSubjectName}
      />

      {/* Create / Edit modal */}
      <SubjectConditionFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editing={editing}
        subjects={subjects}
        onSubmit={async (payload) => {
          try {
            if (editing) {
              await updateMut.mutateAsync({ id: editing.id, payload });
            } else {
              await createMut.mutateAsync(payload);
            }
            setFormModalOpen(false);
          } catch (err) {
            console.error('Submit error:', err);
            throw err;
          }
        }}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteMut.mutate(deleting.id);
            setDeleting(null);
          }
        }}
        title="Xác nhận xóa điều kiện học phần"
        description={`Bạn có chắc chắn muốn xóa điều kiện cho môn "${deleting ? getSubjectName(deleting.subject_id) : ''}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa điều kiện"
        loading={deleteMut.isPending}
        variant="danger"
      />
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────
function SubjectConditionDetailModal({
  open,
  onClose,
  condition,
  getSubjectName,
}: {
  open: boolean;
  onClose: () => void;
  condition: HqnhatSubjectCondition | null;
  getSubjectName: (id: number) => string;
}) {
  if (!condition) return null;

  return (
    <Modal open={open} onClose={onClose} title="Chi tiết điều kiện học phần" size="lg">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">ID</p>
          <p className="font-mono text-sm">{condition.id}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Môn học</p>
          <p className="text-base font-semibold">{getSubjectName(condition.subject_id)}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Điểm TB tối thiểu</p>
            <p className="text-sm font-medium">{condition.min_gpa.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Tín chỉ tích lũy tối thiểu</p>
            <p className="text-sm font-medium">{condition.min_completed_credit}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Số môn thi trượt tối đa</p>
            <p className="text-sm font-medium">{condition.max_failed_subject}</p>
          </div>
        </div>
        {condition.note && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">Ghi chú</p>
            <div className="rounded-lg bg-[rgb(var(--bg-secondary))] p-4">
              <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">{condition.note}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[rgb(var(--border))]">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
}

// ─── Form modal ───────────────────────────────────────────────────────────
function SubjectConditionFormModal({
  open,
  onClose,
  editing,
  subjects,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editing: HqnhatSubjectCondition | null;
  subjects: HqnhatSubject[];
  onSubmit: (payload: HqnhatSubjectConditionCreatePayload) => Promise<unknown>;
}) {
  const [form, setForm] = useState({
    subject_id: 0,
    min_gpa: 2.0,
    min_completed_credit: 0,
    max_failed_subject: 0,
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        subject_id: editing?.subject_id ?? 0,
        min_gpa: editing?.min_gpa ?? 2.0,
        min_completed_credit: editing?.min_completed_credit ?? 0,
        max_failed_subject: editing?.max_failed_subject ?? 0,
        note: editing?.note ?? '',
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editing]);

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!form.subject_id) e.subject_id = 'Vui lòng chọn môn học';
    if (form.min_gpa < 0 || form.min_gpa > 4) e.min_gpa = 'Điểm GPA phải từ 0 đến 4';
    if (form.min_completed_credit < 0) e.min_completed_credit = 'Số tín chỉ không được âm';
    if (form.max_failed_subject < 0) e.max_failed_subject = 'Số môn trượt không được âm';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      let message = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Sửa điều kiện học phần' : 'Thêm điều kiện học phần'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
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
        <FormField label="Môn học" error={errors.subject_id} required>
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: Number(e.target.value) })}
            className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value={0}>— Chọn môn học —</option>
            {subjects.map((s: HqnhatSubject) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Điểm TB tối thiểu" error={errors.min_gpa}>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={form.min_gpa}
              onChange={(e) => setForm({ ...form, min_gpa: parseFloat(e.target.value) || 0 })}
            />
          </FormField>
          <FormField label="Tín chỉ tích lũy tối thiểu" error={errors.min_completed_credit}>
            <Input
              type="number"
              min="0"
              value={form.min_completed_credit}
              onChange={(e) => setForm({ ...form, min_completed_credit: Number(e.target.value) || 0 })}
            />
          </FormField>
          <FormField label="Số môn trượt tối đa" error={errors.max_failed_subject}>
            <Input
              type="number"
              min="0"
              value={form.max_failed_subject}
              onChange={(e) => setForm({ ...form, max_failed_subject: Number(e.target.value) || 0 })}
            />
          </FormField>
        </div>
        <FormField label="Ghi chú" error={errors.note}>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3}
            placeholder="VD: Yêu cầu bắt buộc đối với môn học chuyên ngành"
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40 resize-none"
          />
        </FormField>
      </div>
    </Modal>
  );
}
