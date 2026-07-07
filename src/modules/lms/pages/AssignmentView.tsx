import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, FileText, Users, CheckCircle2, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';

const ASSIGNMENTS_MAP: Record<string, {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  type: 'individual' | 'group';
  instructor: string;
  due: string;
  maxScore: number;
  status: 'open' | 'closed' | 'draft';
  instructions: string;
  submitted: number;
  studentCount: number;
  graded: number;
}> = {
  a1: {
    id: 'a1',
    courseCode: 'CS101',
    courseName: 'Nhập môn Lập trình Python',
    title: 'Bài tập tuần 3 — Vòng lặp',
    type: 'individual',
    instructor: 'TS. Nguyễn Văn Minh',
    due: '2026-06-30T23:59:00',
    maxScore: 10,
    status: 'open',
    instructions: 'Sinh viên hoàn thành các bài tập về vòng lặp for, while và đệ quy. Nộp file .py qua hệ thống.',
    submitted: 245,
    studentCount: 298,
    graded: 240,
  },
  a2: {
    id: 'a2',
    courseCode: 'MATH201',
    courseName: 'Giải tích 2',
    title: 'Bài tập Tích phân xác định',
    type: 'individual',
    instructor: 'PGS.TS. Lê Thị Lan',
    due: '2026-06-28T23:59:00',
    maxScore: 10,
    status: 'closed',
    instructions: 'Sinh viên giải các bài tập về tích phân xác định và ứng dụng.',
    submitted: 268,
    studentCount: 265,
    graded: 260,
  },
  a3: {
    id: 'a3',
    courseCode: 'CS101',
    courseName: 'Nhập môn Lập trình Python',
    title: 'Dự án nhóm — Xây dựng ứng dụng Todo',
    type: 'group',
    instructor: 'TS. Nguyễn Văn Minh',
    due: '2026-07-05T23:59:00',
    maxScore: 30,
    status: 'open',
    instructions: 'Sinh viên làm việc theo nhóm để xây dựng một ứng dụng Todo hoàn chỉnh với React + Tailwind.',
    submitted: 72,
    studentCount: 298,
    graded: 0,
  },
};

type SubmissionStatus = 'graded' | 'submitted' | 'missing';

const SUBMISSIONS: { id: string; studentId: string; studentName: string; submittedAt: string; status: SubmissionStatus; score: number | null; feedback: string }[] = [
  { id: 's1', studentId: 'SV001', studentName: 'Nguyễn Văn An', submittedAt: '2026-06-29 14:22', status: 'graded', score: 8.5, feedback: 'Bài làm tốt, thiếu comment' },
  { id: 's2', studentId: 'SV002', studentName: 'Trần Thị Bình', submittedAt: '2026-06-29 16:05', status: 'graded', score: 9.0, feedback: 'Xuất sắc' },
  { id: 's3', studentId: 'SV003', studentName: 'Lê Minh Cường', submittedAt: '2026-06-30 08:45', status: 'graded', score: 7.5, feedback: 'Cần cải thiện phần đệ quy' },
  { id: 's4', studentId: 'SV004', studentName: 'Phạm Thu Dung', submittedAt: '2026-06-30 11:30', status: 'submitted', score: null, feedback: '' },
  { id: 's5', studentId: 'SV005', studentName: 'Hoàng Văn E', submittedAt: '2026-06-30 22:10', status: 'submitted', score: null, feedback: '' },
  { id: 's6', studentId: 'SV006', studentName: 'Vũ Thị F', submittedAt: '—', status: 'missing', score: null, feedback: '' },
  { id: 's7', studentId: 'SV007', studentName: 'Đặng Văn G', submittedAt: '2026-06-28 09:15', status: 'graded', score: 8.0, feedback: 'Tốt' },
  { id: 's8', studentId: 'SV008', studentName: 'Bùi Thị H', submittedAt: '2026-06-29 20:00', status: 'graded', score: 10, feedback: 'Hoàn hảo' },
];

const STATUS_CONFIG = {
  graded: { variant: 'success' as const, label: 'Đã chấm', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  submitted: { variant: 'warning' as const, label: 'Chưa chấm', icon: <Clock className="h-3.5 w-3.5" /> },
  missing: { variant: 'error' as const, label: 'Chưa nộp', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

interface AssignmentViewProps {
  id?: string;
}

export default function AssignmentView({ id }: AssignmentViewProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const ASSIGNMENT = ASSIGNMENTS_MAP[actualId] ?? ASSIGNMENTS_MAP['a1'];
  const [tab, setTab] = useState<'info' | 'submissions'>('info');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = SUBMISSIONS.filter((s) => {
    const match = !search || s.studentName.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return match && matchStatus;
  });

  const submitRate = Math.round((ASSIGNMENT.submitted / ASSIGNMENT.studentCount) * 100);
  const gradeRate = ASSIGNMENT.submitted > 0 ? Math.round((ASSIGNMENT.graded / ASSIGNMENT.submitted) * 100) : 0;
  const gradedSubmissions = SUBMISSIONS.filter(s => s.status === 'graded');
  const avgScore = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((a, b) => a + (b.score || 0), 0) / gradedSubmissions.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Assignment info card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge variant={ASSIGNMENT.status === 'open' ? 'success' : 'neutral'} dot>
                  {ASSIGNMENT.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                </Badge>
                <Badge variant={ASSIGNMENT.type === 'group' ? 'accent' : 'neutral'}>
                  {ASSIGNMENT.type === 'group' ? 'Nhóm' : 'Cá nhân'}
                </Badge>
                <span className="text-xs text-[rgb(var(--text-muted))]">📅 Hạn: {new Date(ASSIGNMENT.due).toLocaleString('vi-VN')}</span>
                <span className="text-xs text-[rgb(var(--text-muted))]">📝 {ASSIGNMENT.maxScore} điểm</span>
              </div>
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{ASSIGNMENT.instructions}</p>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-2">GV: {ASSIGNMENT.instructor}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-right shrink-0">
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{ASSIGNMENT.submitted}/{ASSIGNMENT.studentCount}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Đã nộp ({submitRate}%)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{ASSIGNMENT.graded}/{ASSIGNMENT.submitted}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Đã chấm ({gradeRate}%)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--success))]">{avgScore.toFixed(1)}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Điểm TB</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{ASSIGNMENT.maxScore}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Điểm tối đa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[rgb(var(--border)/0.6)]">
        {[
          { id: 'info', label: 'Thông tin' },
          { id: 'submissions', label: `Danh sách nộp (${ASSIGNMENT.submitted})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'info' | 'submissions')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin bài tập</h3>
            </div>
            <CardContent className="space-y-3 p-5">
              {[
                { label: 'Khóa học', value: ASSIGNMENT.courseName },
                { label: 'Mã khóa', value: ASSIGNMENT.courseCode },
                { label: 'Giảng viên', value: ASSIGNMENT.instructor },
                { label: 'Loại', value: ASSIGNMENT.type === 'group' ? 'Bài tập nhóm' : 'Bài tập cá nhân' },
                { label: 'Điểm tối đa', value: `${ASSIGNMENT.maxScore} điểm` },
                { label: 'Hạn nộp', value: new Date(ASSIGNMENT.due).toLocaleString('vi-VN') },
                { label: 'Số sinh viên', value: `${ASSIGNMENT.studentCount} SV` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-b border-[rgb(var(--border)/0.4)] pb-2.5 last:border-0 last:pb-0">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thống kê nộp bài</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {[
                { label: 'Tổng sinh viên', value: ASSIGNMENT.studentCount, color: 'primary', icon: <Users className="h-5 w-5" /> },
                { label: 'Đã nộp', value: ASSIGNMENT.submitted, color: 'success', icon: <FileText className="h-5 w-5" /> },
                { label: 'Đã chấm', value: ASSIGNMENT.graded, color: 'info', icon: <CheckCircle2 className="h-5 w-5" /> },
                { label: 'Chưa nộp', value: ASSIGNMENT.studentCount - ASSIGNMENT.submitted, color: 'error', icon: <AlertTriangle className="h-5 w-5" /> },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${color})/0.1)] text-[rgb(var(--${color}))]`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
                    <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{value} SV</p>
                  </div>
                  <div className="h-2 w-20 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[rgb(var(--${color}))]"
                      style={{ width: `${(value / ASSIGNMENT.studentCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submissions tab */}
      {tab === 'submissions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên, mã SV..."
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-56"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2">
              <option value="all">Tất cả trạng thái</option>
              <option value="graded">Đã chấm</option>
              <option value="submitted">Chưa chấm</option>
              <option value="missing">Chưa nộp</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {['Mã SV', 'Họ tên', 'Thời gian nộp', 'Trạng thái', 'Điểm', 'Thao tác'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {filtered.map((s) => {
                  const sc = STATUS_CONFIG[s.status];
                  return (
                    <tr key={s.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{s.studentId}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{s.studentName}</td>
                      <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{s.submittedAt}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === 'graded' ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]' :
                          s.status === 'submitted' ? 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]' :
                          'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]'
                        }`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.score !== null ? (
                          <span className={`text-sm font-bold ${
                            s.score >= 8 ? 'text-[rgb(var(--success))]' :
                            s.score >= 6 ? 'text-[rgb(var(--warning))]' :
                            'text-[rgb(var(--error))]'
                          }`}>{s.score}/10</span>
                        ) : (
                          <span className="text-sm text-[rgb(var(--text-muted))]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}
                            onClick={() => window.location.href = `/lms/bai-tap/${id}/xem/${s.id}`}>Xem</Button>
                          {s.status !== 'missing' && (
                            <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                              onClick={() => window.location.href = `/lms/bai-tap/${id}/cham`}>Chấm</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
