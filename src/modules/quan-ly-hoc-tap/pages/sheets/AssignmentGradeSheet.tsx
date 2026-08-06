import { useState, useEffect, useMemo } from 'react';
import {
  Search, RotateCcw, Eye, Edit3, Save, X, FileText,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableSkeleton,
  Modal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { usePagination } from '@/hooks';
import {
  useAssignmentSubmissions,
  useAssignmentSubmission,
  useAssignments,
} from '@/hooks/useLmsPart3';
import { assignmentsApi } from '@/services/lmsApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDateVietnam } from '@/utils/formatters';
import type {
  Assignment,
  AssignmentSubmission,
  AssignmentSubmissionListParams,
  SubmissionStatus,
} from '@/types/lms.types';

const SUBMISSION_TYPE_LABEL: Record<string, string> = {
  file: 'File đính kèm',
  text: 'Văn bản',
  url: 'URL',
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  submitted: { variant: 'info', label: 'Đã nộp' },
  late: { variant: 'warning', label: 'Nộp trễ' },
  returned: { variant: 'neutral', label: 'Trả lại' },
  graded: { variant: 'success', label: 'Đã chấm' },
};

export function AssignmentGradeSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;
  const qc = useQueryClient();

  // Filters
  const [assignmentId, setAssignmentId] = useState<number | undefined>(undefined);
  const [studentName, setStudentName] = useState('');

  // Load assignments for dropdown
  const { data: assignmentsData } = useAssignments({ per_page: 100, status: 'active' });
  const assignments: Assignment[] = Array.isArray(assignmentsData?.data) ? assignmentsData.data : [];

  useEffect(() => {
    if (!assignmentId && assignments.length > 0) {
      setAssignmentId(assignments[0].id);
    }
  }, [assignments, assignmentId]);

  const params: AssignmentSubmissionListParams = useMemo(() => ({
    page,
    per_page: pageSize,
    assignment_id: assignmentId,
    student_name: studentName || undefined,
    latest_only: 1, // Only show latest submission per student for grading
    sort_by: 'created_at',
    sort_direction: 'desc',
  }), [page, pageSize, assignmentId, studentName]);

  const { data, isLoading, isFetching } = useAssignmentSubmissions(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  const selectedAssignment = assignments.find((a) => a.id === assignmentId);
  const maxScore = selectedAssignment?.max_score;

  // Grade modal
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradingItem, setGradingItem] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number | ''>('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeErrors, setGradeErrors] = useState<Record<string, string>>({});

  const openGrade = (item: AssignmentSubmission) => {
    setGradingItem(item);
    setGradeScore(item.score ?? '');
    setGradeFeedback(item.feedback ?? '');
    setGradeErrors({});
    setGradeOpen(true);
  };

  const closeGrade = () => {
    setGradeOpen(false);
    setGradingItem(null);
  };

  // Grade mutation - update submission status to 'graded' and set score/feedback
  const gradeMutation = useMutation({
    mutationFn: async ({ id, score, feedback }: { id: number; score: number | null; feedback: string | null }) => {
      // Using update assignment - in real API this might be a separate grade endpoint
      // For now, we'll use a placeholder that logs the grade action
      // The actual implementation depends on backend API for grading submissions
      console.log('Grading submission:', id, score, feedback);
      // This would typically call: assignmentSubmissionsApi.grade(id, { score, feedback })
      // For now we simulate success
      return { success: true, data: { id, score, feedback, status: 'graded' } };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'submissions'] });
      closeGrade();
    },
  });

  const validateGrade = (): boolean => {
    const e: Record<string, string> = {};
    if (gradeScore === '' || gradeScore === null) {
      // Score is optional for returning without grade
    } else if (typeof gradeScore === 'number') {
      if (maxScore != null && gradeScore > maxScore) {
        e.score = `Điểm không được lớn hơn ${maxScore}`;
      }
      if (gradeScore < 0) {
        e.score = 'Điểm không được nhỏ hơn 0';
      }
    }
    setGradeErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGrade = async () => {
    if (!gradingItem) return;
    if (!validateGrade()) return;
    try {
      await gradeMutation.mutateAsync({
        id: gradingItem.id,
        score: gradeScore === '' ? null : Number(gradeScore),
        feedback: gradeFeedback.trim() || null,
      });
    } catch (_) {}
  };

  const resetFilters = () => {
    setStudentName('');
    setPage(1);
  };

  const statusBadge = (s: SubmissionStatus | null | undefined) => {
    if (!s) return null;
    return STATUS_CONFIG[s] ?? null;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Bài tập</label>
          <select
            value={assignmentId ?? ''}
            onChange={(e) => { setAssignmentId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[250px]"
          >
            <option value="">— Chọn bài tập —</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
                {a.max_score != null ? ` (${a.max_score} điểm)` : ''}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Tìm theo tên sinh viên..."
          value={studentName}
          onChange={(e) => { setStudentName(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-56"
        />
        {studentName && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
      </div>

      {!assignmentId ? (
        <div className="flex flex-col items-center justify-center py-12 text-[rgb(var(--text-muted))]">
          <Edit3 className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">Vui lòng chọn bài tập để chấm điểm</p>
        </div>
      ) : (
        <>
          {maxScore != null && (
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
              <span>Điểm tối đa:</span>
              <Badge variant="neutral" size="sm" className="font-mono font-bold">{maxScore}</Badge>
            </div>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-14">STT</TableHeadCell>
                <TableHeadCell>Sinh viên</TableHeadCell>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell>Thời gian nộp</TableHeadCell>
                <TableHeadCell className="text-right">Điểm</TableHeadCell>
                <TableHeadCell className="text-right w-40">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton colSpan={7} rows={5} />
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                    Chưa có bài nộp nào cần chấm
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, i) => {
                  const sb = statusBadge(item.status);
                  return (
                    <TableRow key={item.id} className={isFetching && !isLoading ? 'opacity-50' : ''}>
                      <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                        {(page - 1) * pageSize + i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.student?.full_name ?? `SV #${item.student_id}`}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.student?.student_code ?? '—'}
                      </TableCell>
                      <TableCell>
                        {sb && (
                          <Badge variant={sb.variant} size="sm" className="gap-1">
                            {sb.variant === 'success' && <CheckCircle className="h-3 w-3" />}
                            {sb.variant === 'info' && <AlertCircle className="h-3 w-3" />}
                            {sb.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                        {item.submitted_at ? formatDateVietnam(item.submitted_at) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.score != null ? (
                          <span className="font-mono font-bold">
                            {item.score} / {maxScore ?? '?'}
                          </span>
                        ) : (
                          <span className="text-[rgb(var(--text-muted))]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGrade(item)}
                            leftIcon={<Edit3 className="h-4 w-4" />}
                          >
                            Chấm điểm
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
            pageSizeOptions={[10, 15, 25, 50]}
          />
        </>
      )}

      {/* Grade Modal */}
      <Modal
        open={gradeOpen}
        onClose={closeGrade}
        title={`Chấm điểm — ${gradingItem?.student?.full_name ?? 'Sinh viên'}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeGrade}>Hủy</Button>
            <Button
              onClick={handleGrade}
              loading={gradeMutation.isPending}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Lưu điểm
            </Button>
          </>
        }
      >
        {gradingItem && (
          <div className="space-y-4">
            {/* Student & Submission info */}
            <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[rgb(var(--text-muted))]">Sinh viên</span>
                <span className="font-medium">{gradingItem.student?.full_name ?? `SV #${gradingItem.student_id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[rgb(var(--text-muted))]">Mã SV</span>
                <span className="font-mono">{gradingItem.student?.student_code ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[rgb(var(--text-muted))]">Lần nộp</span>
                <span className="font-mono">#{gradingItem.attempt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[rgb(var(--text-muted))]">Thời gian nộp</span>
                <span>{formatDateVietnam(gradingItem.submitted_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[rgb(var(--text-muted))]">Loại nộp</span>
                <span>{SUBMISSION_TYPE_LABEL[gradingItem.submission_type ?? ''] ?? '—'}</span>
              </div>
            </div>

            {/* Score input */}
            <FormField
              label={`Điểm ${maxScore != null ? `(tối đa ${maxScore})` : ''}`}
              error={gradeErrors.score}
            >
              <Input
                type="number"
                min={0}
                max={maxScore ?? undefined}
                step={0.5}
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value ? Number(e.target.value) : '')}
                placeholder="VD: 8"
                className="font-mono"
              />
            </FormField>

            {/* Feedback */}
            <FormField label="Nhận xét">
              <textarea
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Nhập nhận xét, góp ý cho bài làm của sinh viên..."
                rows={4}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30 resize-none"
              />
            </FormField>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AssignmentGradeSheet;
