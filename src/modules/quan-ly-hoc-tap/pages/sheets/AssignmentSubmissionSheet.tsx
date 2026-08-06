import { useState, useEffect, useMemo } from 'react';
import {
  Search, RotateCcw, Eye, FileText, Link2, Type,
  Download, Clock, AlertCircle, CheckCircle, Edit3,
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

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string; icon: React.ReactNode }> = {
  submitted: { variant: 'info', label: 'Đã nộp', icon: <Clock className="h-3 w-3" /> },
  late: { variant: 'warning', label: 'Nộp trễ', icon: <AlertCircle className="h-3 w-3" /> },
  returned: { variant: 'neutral', label: 'Trả lại', icon: <Edit3 className="h-3 w-3" /> },
  graded: { variant: 'success', label: 'Đã chấm', icon: <CheckCircle className="h-3 w-3" /> },
};

export function AssignmentSubmissionSheet() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const { page, pageSize } = pagination;

  // Filters
  const [assignmentId, setAssignmentId] = useState<number | undefined>(undefined);
  const [studentName, setStudentName] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | ''>('');
  const [latestOnly, setLatestOnly] = useState(false);

  // Load assignments list for dropdown
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
    status: statusFilter || undefined,
    latest_only: latestOnly ? 1 : undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  }), [page, pageSize, assignmentId, studentName, statusFilter, latestOnly]);

  const { data, isLoading, isFetching } = useAssignmentSubmissions(params);
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? items.length;

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const { data: detailData, isLoading: detailLoading } = useAssignmentSubmission(detailId ?? undefined);

  const openDetail = (item: AssignmentSubmission) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const resetFilters = () => {
    setStudentName('');
    setStatusFilter('');
    setLatestOnly(false);
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
              <option key={a.id} value={a.id}>{a.title}</option>
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
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as SubmissionStatus | ''); setPage(1); }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 h-10 px-3">
          <input
            type="checkbox"
            checked={latestOnly}
            onChange={(e) => { setLatestOnly(e.target.checked); setPage(1); }}
            className="h-4 w-4 rounded border-[rgb(var(--border))]"
          />
          <span className="text-sm">Chỉ lần nộp cuối</span>
        </label>
        {(studentName || statusFilter || latestOnly) && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Đặt lại
          </Button>
        )}
      </div>

      {!assignmentId ? (
        <div className="flex flex-col items-center justify-center py-12 text-[rgb(var(--text-muted))]">
          <FileText className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">Vui lòng chọn bài tập để xem danh sách bài nộp</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-14">STT</TableHeadCell>
                <TableHeadCell>Sinh viên</TableHeadCell>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Loại nộp</TableHeadCell>
                <TableHeadCell>Lần nộp</TableHeadCell>
                <TableHeadCell>Thời gian nộp</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right w-32">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton colSpan={8} rows={5} />
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                    Chưa có bài nộp nào
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
                        <Badge variant="neutral" size="sm">
                          {SUBMISSION_TYPE_LABEL[item.submission_type ?? ''] ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {item.attempt_number}
                      </TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-muted))]">
                        {item.submitted_at ? formatDateVietnam(item.submitted_at) : '—'}
                      </TableCell>
                      <TableCell>
                        {sb && (
                          <Badge variant={sb.variant} size="sm" className="gap-1">
                            {sb.icon}
                            {sb.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(item)} title="Xem chi tiết">
                            <Eye className="h-4 w-4" />
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

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết bài nộp" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            {/* Student info */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="flex-1">
                <p className="font-bold text-lg">{detailData.data.student?.full_name ?? `SV #${detailData.data.student_id}`}</p>
                <p className="text-sm text-[rgb(var(--text-muted))]">{detailData.data.student?.student_code ?? ''}</p>
              </div>
              {statusBadge(detailData.data.status) && (
                <Badge variant={statusBadge(detailData.data.status)!.variant} size="sm" className="gap-1">
                  {statusBadge(detailData.data.status)!.icon}
                  {statusBadge(detailData.data.status)!.label}
                </Badge>
              )}
            </div>

            {/* Submission info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Loại nộp</p>
                <p className="font-medium">{SUBMISSION_TYPE_LABEL[detailData.data.submission_type ?? ''] ?? '—'}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Lần nộp</p>
                <p className="font-medium font-mono">#{detailData.data.attempt_number}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Thời gian nộp</p>
                <p className="font-medium">{formatDateVietnam(detailData.data.submitted_at)}</p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Điểm</p>
                <p className="font-medium font-mono">
                  {detailData.data.score != null
                    ? `${detailData.data.score} / ${detailData.data.assignment?.max_score ?? '?'}`
                    : '—'}
                </p>
              </div>
            </div>

            {/* Content */}
            {detailData.data.submission_type === 'text' && detailData.data.content && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1"><Type className="h-3 w-3" /> Nội dung bài nộp</p>
                <div className="mt-2 p-3 bg-[rgb(var(--bg-card))] rounded border border-[rgb(var(--border))] whitespace-pre-wrap text-sm">
                  {detailData.data.content}
                </div>
              </div>
            )}

            {detailData.data.submission_type === 'url' && detailData.data.content && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1"><Link2 className="h-3 w-3" /> URL bài nộp</p>
                <a
                  href={detailData.data.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-[rgb(var(--primary))] hover:underline break-all"
                >
                  {detailData.data.content}
                </a>
              </div>
            )}

            {detailData.data.submission_type === 'file' && detailData.data.file_path && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1 inline-flex items-center gap-1"><FileText className="h-3 w-3" /> File đính kèm</p>
                <p className="mt-1 text-sm font-medium">{detailData.data.file_path.split('/').pop()}</p>
              </div>
            )}

            {/* Feedback */}
            {detailData.data.feedback && (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhận xét của giảng viên</p>
                <p className="text-sm whitespace-pre-wrap">{detailData.data.feedback}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">Không tìm thấy dữ liệu</p>
        )}
      </Modal>
    </div>
  );
}

export default AssignmentSubmissionSheet;
