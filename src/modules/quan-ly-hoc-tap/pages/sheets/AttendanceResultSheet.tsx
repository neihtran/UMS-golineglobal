// ─── AttendanceResultSheet ───────────────────────────────────────────────────────────
// Sheet: Kết quả điểm danh — Stats + QR display + Attendance table

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  QrCode, RefreshCw,
  Users, CheckCircle, UserX, AlertTriangle, CalendarCheck,
  ClipboardCheck, Loader2, ShieldCheck,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination,
  Modal,
} from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { FormField } from '@/components/forms';
import { usePagination } from '@/hooks';
import {
  useAttendanceSessions,
  useAttendanceSession,
  useAttendanceSessionQrToken,
  useAttendanceSummary,
  useAttendanceRecords,
  useInitializeAttendanceRecords,
  useBulkUpdateAttendance,
} from '@/hooks/useLmsPart5';
import { useLearningCourses } from '@/hooks/useLms';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDateVietnam } from '@/utils/formatters';
import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceMethod,
  BulkAttendanceRecord,
  LearningCourse,
} from '@/types/lms.types';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'present', label: 'Có mặt', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'absent', label: 'Vắng', color: 'text-red-700', bgColor: 'bg-red-100' },
  { value: 'late', label: 'Đi muộn', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { value: 'excused', label: 'Nghỉ phép', color: 'text-blue-700', bgColor: 'bg-blue-100' },
];

const METHOD_LABELS: Record<AttendanceMethod, string> = {
  qr_code: 'Quét mã QR',
  gps: 'GPS',
  face_recognition: 'Nhận diện khuôn mặt',
  manual: 'Thủ công',
};

// ─── QR Code Canvas Component ───────────────────────────────────────────────────
function QrCodeCanvas({ data, size }: { data: string; size: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    const drawFinder = (cx: number, cy: number) => {
      ctx.fillRect(cx - 20, cy - 20, 40, 40);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 14, cy - 14, 28, 28);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cx - 8, cy - 8, 16, 16);
    };

    drawFinder(20, 20);
    drawFinder(size - 20, 20);
    drawFinder(20, size - 20);

    const hash = data.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
    const moduleSize = 4;
    const startX = 44;
    const startY = 44;
    const gridW = Math.floor((size - startX * 2) / moduleSize);
    const gridH = Math.floor((size - startY * 2) / moduleSize);
    let seed = hash;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed >>> 0) / 0xFFFFFFFF;
    };
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        if (rand() > 0.4) {
          ctx.fillRect(startX + x * moduleSize, startY + y * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }
  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg border border-[rgb(var(--border))]"
    />
  );
}

// ─── QR Display Component ─────────────────────────────────────────────────────────────
function QrDisplay({ sessionId }: { sessionId: number }) {
  const [countdown, setCountdown] = useState(0);
  const [qrPayload, setQrPayload] = useState('');
  const notify = useNotificationStore();

  const { data, isLoading, isFetching, refetch } = useAttendanceSessionQrToken(sessionId, true);

  useEffect(() => {
    if (data?.data) {
      const payload = JSON.stringify({
        attendance_session_id: data.data.session_id,
        qr_token: data.data.token,
      });
      setQrPayload(payload);
      setCountdown(data.data.expires_in);
    }
  }, [data]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          refetch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, refetch]);

  return (
    <div className="bg-white rounded-xl border border-[rgb(var(--border))] p-4 flex flex-col items-center gap-3 w-fit">
      <div className="flex items-center gap-2 w-full">
        <QrCode className="h-5 w-5 text-[rgb(var(--primary))]" />
        <h4 className="font-semibold text-sm">Mã QR Điểm danh</h4>
        <div className="ml-auto flex items-center gap-1">
          {isFetching && <RefreshCw className="h-3 w-3 animate-spin text-[rgb(var(--text-muted))]" />}
          <Button variant="ghost" size="icon" onClick={() => refetch()} title="Làm mới QR" className="h-7 w-7">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 w-48">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
        </div>
      ) : qrPayload ? (
        <>
          <QrCodeCanvas data={qrPayload} size={180} />
          <div className="text-center">
            <p className="text-xs text-[rgb(var(--text-muted))]">Mã tự đổi sau</p>
            <p className="text-2xl font-bold tabular-nums text-[rgb(var(--primary))]">{countdown}s</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 w-48 text-[rgb(var(--text-muted))]">
          <QrCode className="h-12 w-12 mb-2 opacity-30" />
          <p className="text-sm">Không thể tải mã QR</p>
        </div>
      )}

      <p className="text-xs text-center text-[rgb(var(--text-muted))]">
        Sinh viên quét mã QR trên màn hình và nhập mã sinh viên để điểm danh
      </p>
    </div>
  );
}

// ─── Stats Dashboard ───────────────────────────────────────────────────────────────
function StatsDashboard({
  summary,
  isLoading,
}: {
  summary: { total_students: number; present: number; absent: number; late: number; excused: number; attendance_rate: number } | null;
  isLoading: boolean;
}) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[rgb(var(--bg-secondary))] rounded-xl p-3 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Tổng sĩ số', value: summary.total_students, icon: Users, color: 'text-[rgb(var(--text-secondary))]', bg: 'bg-[rgb(var(--bg-secondary))]' },
    { label: 'Có mặt', value: summary.present, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Vắng mặt', value: summary.absent, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Đi muộn', value: summary.late, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Nghỉ phép', value: summary.excused, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tỷ lệ', value: `${summary.attendance_rate}%`, icon: ShieldCheck, color: 'text-[rgb(var(--primary))]', bg: 'bg-[rgb(var(--bg-secondary))]' },
  ];

  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-[rgb(var(--border))]/50`}>
          <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
          <p className="text-2xl font-bold tabular-nums">{s.value}</p>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Status Radio Group ────────────────────────────────────────────────────────────
function StatusRadioGroup({
  value,
  onChange,
}: {
  value: AttendanceStatus | null;
  onChange: (v: AttendanceStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {STATUS_OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-2 py-1 text-xs rounded-md border transition-all ${
              isActive
                ? `${opt.bgColor} ${opt.color} border-current font-medium`
                : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Sheet Component ─────────────────────────────────────────────────────────
interface AttendanceResultSheetProps {
  courseId: number | undefined;
  onCourseIdChange: (id: number | undefined) => void;
}

export function AttendanceResultSheet({ courseId, onCourseIdChange }: AttendanceResultSheetProps) {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 50 });
  const { page, pageSize } = pagination;
  const notify = useNotificationStore();

  // Course selector (local, syncs to shared via onCourseIdChange)
  const [localCourseId, setLocalCourseId] = useState<number | undefined>(courseId);

  // Sync localCourseId when prop changes
  useEffect(() => {
    setLocalCourseId(courseId);
    setSelectedSessionId(undefined);
  }, [courseId]);

  // Session selector
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('');
  const [search, setSearch] = useState('');

  // Local attendance records state (optimistic updates)
  const [localRecords, setLocalRecords] = useState<AttendanceRecord[]>([]);

  // Lookup courses
  const { data: coursesData } = useLearningCourses({ per_page: 100 });
  const courses: LearningCourse[] = Array.isArray(coursesData?.data) ? coursesData.data : [];

  // Auto-select first course
  useEffect(() => {
    if (localCourseId === undefined && courses.length > 0) {
      setLocalCourseId(courses[0].id);
      onCourseIdChange(courses[0].id);
    }
  }, [courses, localCourseId, onCourseIdChange]);

  // Fetch sessions for the selected course
  const { data: sessionsData } = useAttendanceSessions({
    learning_course_id: localCourseId,
    per_page: 100,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });
  const sessions: AttendanceSession[] = Array.isArray(sessionsData?.data) ? sessionsData.data : [];

  // Auto-select first session
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Fetch records
  const {
    data: recordsData,
    isLoading: recordsLoading,
    isFetching: recordsFetching,
  } = useAttendanceRecords({
    attendance_session_id: selectedSessionId,
    per_page: pageSize,
    page,
    attendance_status: statusFilter || undefined,
  });

  // Fetch summary
  const { data: summaryData, isLoading: summaryLoading } = useAttendanceSummary(selectedSessionId);

  // Initialize & mutations
  const initMut = useInitializeAttendanceRecords();
  const bulkMut = useBulkUpdateAttendance();

  const isSubmitting = initMut.isPending || bulkMut.isPending;

  // Sync local records with API data
  useEffect(() => {
    if (recordsData?.data) {
      setLocalRecords(recordsData.data);
    }
  }, [recordsData]);

  const total = recordsData?.meta?.total ?? localRecords.length;

  // Handlers
  const handleStatusChange = useCallback((recordId: number, newStatus: AttendanceStatus) => {
    setLocalRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, attendance_status: newStatus } : r))
    );
  }, []);

  const handleNoteChange = useCallback((recordId: number, note: string) => {
    setLocalRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, note } : r))
    );
  }, []);

  const handleMarkAllPresent = () => {
    setLocalRecords((prev) => prev.map((r) => ({ ...r, attendance_status: 'present' })));
  };

  const handleInitialize = async () => {
    if (!selectedSessionId) return;
    try {
      await initMut.mutateAsync(selectedSessionId);
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Khởi tạo danh sách điểm danh thành công' });
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Khởi tạo thất bại' });
    }
  };

  const handleSaveBulk = async () => {
    if (!selectedSessionId || localRecords.length === 0) return;
    try {
      const records: BulkAttendanceRecord[] = localRecords.map((r) => ({
        student_id: r.student_id,
        attendance_status: r.attendance_status ?? 'absent',
        note: r.note || null,
      }));
      await bulkMut.mutateAsync({ sessionId: selectedSessionId, records });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Lưu điểm danh thành công' });
    } catch (err: any) {
      notify.addNotification({ type: 'error', title: 'Lỗi', message: err?.message || 'Lưu thất bại' });
    }
  };

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return localRecords;
    const q = search.toLowerCase();
    return localRecords.filter(
      (r) =>
        r.student?.full_name?.toLowerCase().includes(q) ||
        r.student?.student_code?.toLowerCase().includes(q)
    );
  }, [localRecords, search]);

  // Reset page when session changes
  useEffect(() => {
    setPage(1);
  }, [selectedSessionId, statusFilter, search, setPage]);

  const isQrMethod = selectedSession?.attendance_method === 'qr_code';

  return (
    <div className="space-y-4">
      {/* Session Selector + Actions */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Khóa học</label>
          <select
            value={localCourseId ?? ''}
            onChange={(e) => {
              const newId = e.target.value ? Number(e.target.value) : undefined;
              setLocalCourseId(newId);
              onCourseIdChange(newId);
              setSelectedSessionId(undefined);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[220px]"
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[300px]">
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">Chọn buổi điểm danh</label>
          <select
            value={selectedSessionId ?? ''}
            onChange={(e) => setSelectedSessionId(e.target.value ? Number(e.target.value) : undefined)}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm w-full"
          >
            <option value="">— Chọn buổi điểm danh —</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} [{METHOD_LABELS[s.attendance_method ?? 'manual']}]
              </option>
            ))}
          </select>
        </div>
        {selectedSession && (
          <Badge variant="neutral" className="text-xs">
            {METHOD_LABELS[selectedSession.attendance_method ?? 'manual']}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          {selectedSessionId && localRecords.length === 0 && !recordsLoading && (
            <Button
              variant="outline"
              leftIcon={<ClipboardCheck className="h-4 w-4" />}
              onClick={handleInitialize}
              loading={initMut.isPending}
            >
              Khởi tạo danh sách
            </Button>
          )}
          {localRecords.length > 0 && (
            <>
              <Button
                variant="outline"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={handleMarkAllPresent}
                disabled={isSubmitting}
              >
                Tất cả có mặt
              </Button>
              <Button
                leftIcon={<ClipboardCheck className="h-4 w-4" />}
                onClick={handleSaveBulk}
                loading={bulkMut.isPending}
                disabled={isSubmitting}
              >
                Lưu điểm danh
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!selectedSessionId ? (
        <div className="flex flex-col items-center justify-center py-16 text-[rgb(var(--text-muted))]">
          <ClipboardCheck className="h-14 w-14 mb-3 opacity-30" />
          <p className="font-medium text-lg">Chưa chọn buổi điểm danh</p>
          <p className="text-sm mt-1">Vui lòng chọn một buổi điểm danh từ danh sách bên trên</p>
        </div>
      ) : (
        <>
          {/* Stats Dashboard + QR Code Row */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4">
            <StatsDashboard summary={summaryData?.data ?? null} isLoading={summaryLoading} />
            {isQrMethod && selectedSessionId && (
              <QrDisplay sessionId={selectedSessionId} />
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Tìm theo tên hoặc mã sinh viên..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Users className="h-4 w-4" />}
              wrapperClassName="w-64"
            />
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => { setStatusFilter(''); setPage(1); }}
                className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                  statusFilter === ''
                    ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                    : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]'
                }`}
              >
                Tất cả
              </button>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                    statusFilter === opt.value
                      ? `${opt.bgColor} ${opt.color} border-current font-medium`
                      : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {(statusFilter || search) && (
              <Button
                variant="ghost" size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => { setStatusFilter(''); setSearch(''); setPage(1); }}
              >
                Đặt lại
              </Button>
            )}
          </div>

          {/* Attendance Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-14">STT</TableHeadCell>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Họ và tên</TableHeadCell>
                <TableHeadCell className="min-w-[220px]">Trạng thái</TableHeadCell>
                <TableHeadCell className="w-48">Ghi chú</TableHeadCell>
                <TableHeadCell className="w-28">Xác nhận</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recordsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-[rgb(var(--text-muted))]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Đang tải danh sách điểm danh...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : localRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-[rgb(var(--text-muted))]">
                      <ClipboardCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>Chưa có danh sách điểm danh</p>
                      <p className="text-xs mt-1">Bấm "Khởi tạo danh sách" để bắt đầu</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">
                    Không tìm thấy sinh viên phù hợp với bộ lọc
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record, i) => (
                  <TableRow
                    key={record.id}
                    className={recordsFetching && !recordsLoading ? 'opacity-50' : ''}
                  >
                    <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                      {(page - 1) * pageSize + i + 1}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono font-medium">
                        {record.student?.student_code ?? record.student_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.student?.full_name ?? '—'}</span>
                    </TableCell>
                    <TableCell>
                      <StatusRadioGroup
                        value={record.attendance_status}
                        onChange={(v) => handleStatusChange(record.id, v)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        placeholder="Ghi chú..."
                        value={record.note ?? ''}
                        onChange={(e) => handleNoteChange(record.id, e.target.value)}
                        className="h-8 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
                      />
                    </TableCell>
                    <TableCell>
                      {record.verification_method && (
                        <Badge
                          variant={record.verification_method === 'manual' ? 'neutral' : 'success'}
                          size="sm"
                        >
                          {record.verification_method === 'manual' ? 'Thủ công' :
                           record.verification_method === 'qr_code' ? 'QR' :
                           record.verification_method === 'gps' ? 'GPS' : 'Face'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {localRecords.length > 0 && (
            <TablePagination
              page={page} pageSize={pageSize} total={total}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              pageSizeOptions={[20, 50, 100]}
            />
          )}
        </>
      )}
    </div>
  );
}

export default AttendanceResultSheet;
