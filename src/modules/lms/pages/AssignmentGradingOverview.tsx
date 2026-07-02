import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const ASSIGNMENT = {
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
};

const ALL_SUBMISSIONS = [
  { id: 's1', studentId: 'SV001', studentName: 'Nguyễn Văn An', class: 'CNTT-2026.1', submittedAt: '2026-06-29 14:22', score: 8.5, feedback: 'Bài làm tốt, thiếu comment', status: 'graded' },
  { id: 's2', studentId: 'SV002', studentName: 'Trần Thị Bình', class: 'CNTT-2026.1', submittedAt: '2026-06-29 16:05', score: 9.0, feedback: 'Xuất sắc', status: 'graded' },
  { id: 's3', studentId: 'SV003', studentName: 'Lê Minh Cường', class: 'CNTT-2026.1', submittedAt: '2026-06-30 08:45', score: 7.5, feedback: 'Cần cải thiện phần đệ quy', status: 'graded' },
  { id: 's4', studentId: 'SV004', studentName: 'Phạm Thu Dung', class: 'CNTT-2026.2', submittedAt: '2026-06-30 11:30', score: null, feedback: '', status: 'submitted' },
  { id: 's5', studentId: 'SV005', studentName: 'Hoàng Văn E', class: 'CNTT-2026.2', submittedAt: '2026-06-30 22:10', score: null, feedback: '', status: 'submitted' },
  { id: 's6', studentId: 'SV006', studentName: 'Vũ Thị F', class: 'CNTT-2026.1', submittedAt: '—', score: null, feedback: '', status: 'missing' },
  { id: 's7', studentId: 'SV007', studentName: 'Đặng Văn G', class: 'CNTT-2026.1', submittedAt: '2026-06-28 09:15', score: 8.0, feedback: 'Tốt', status: 'graded' },
  { id: 's8', studentId: 'SV008', studentName: 'Bùi Thị H', class: 'CNTT-2026.1', submittedAt: '2026-06-29 20:00', score: 10, feedback: 'Hoàn hảo', status: 'graded' },
  { id: 's9', studentId: 'SV009', studentName: 'Ngô Văn I', class: 'CNTT-2026.2', submittedAt: '2026-06-30 18:30', score: null, feedback: '', status: 'submitted' },
  { id: 's10', studentId: 'SV010', studentName: 'Lý Thị K', class: 'CNTT-2026.1', submittedAt: '2026-07-01 08:00', score: null, feedback: '', status: 'submitted' },
  { id: 's11', studentId: 'SV011', studentName: 'Trịnh Văn L', class: 'CNTT-2026.2', submittedAt: '—', score: null, feedback: '', status: 'missing' },
  { id: 's12', studentId: 'SV012', studentName: 'Phan Thị M', class: 'CNTT-2026.1', submittedAt: '2026-06-28 14:00', score: 6.5, feedback: 'Sai ở câu 2', status: 'graded' },
];

const STATUS_CONFIG = {
  graded: { color: 'success', label: 'Đã chấm', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  submitted: { color: 'warning', label: 'Chưa chấm', icon: <Clock className="h-3.5 w-3.5" /> },
  missing: { color: 'error', label: 'Chưa nộp', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const CRITERIA = [
  { id: 'c1', label: 'Câu 1 — Vòng lặp for', max: 2 },
  { id: 'c2', label: 'Câu 2 — Vòng lặp while', max: 2 },
  { id: 'c3', label: 'Câu 3 — Hàm đệ quy', max: 3 },
  { id: 'c4', label: 'Câu 4 — Tối ưu code', max: 2 },
  { id: 'c5', label: 'Câu 5 — Comment & giải thích', max: 1 },
];

export default function AssignmentGradingOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSubmission, setActiveSubmission] = useState<typeof ALL_SUBMISSIONS[0] | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [saved, setSaved] = useState(false);

  const statuses = ['all', 'graded', 'submitted', 'missing'];

  const filtered = ALL_SUBMISSIONS.filter((s) => {
    const match = !search || s.studentName.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return match && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
  const totalScore = Object.values(scores).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const gradedCount = ALL_SUBMISSIONS.filter((s) => s.status === 'graded').length;
  const avgScore = ALL_SUBMISSIONS.filter((s) => s.status === 'graded').reduce((a, b) => a + (b.score || 0), 0) / gradedCount;

  const openGrading = (sub: typeof ALL_SUBMISSIONS[0]) => {
    setActiveSubmission(sub);
    setScores({});
    setFeedback('');
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  const handleScore = (cId: string, value: string) => {
    setScores((prev) => ({ ...prev, [cId]: value }));
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chấm bài: ${ASSIGNMENT.title}`}
        description={`${ASSIGNMENT.courseCode} · ${ASSIGNMENT.courseName}`}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Bài tập SV', href: '/lms/bai-tap-sinh-vien' },
          { label: ASSIGNMENT.title },
          { label: 'Chấm bài' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách điểm</Button>
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/lms/bai-tap/${id}`)}>Quay lại</Button>
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Đã nộp', value: `${ASSIGNMENT.submitted}/${ASSIGNMENT.studentCount}`, color: 'primary' },
          { label: 'Đã chấm', value: gradedCount, color: 'success' },
          { label: 'Chưa chấm', value: ASSIGNMENT.submitted - gradedCount, color: 'warning' },
          { label: 'Điểm TB', value: gradedCount > 0 ? avgScore.toFixed(1) : '—', color: 'info' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.color === 'primary' && <Clock className="h-5 w-5" />}
              {s.color === 'success' && <CheckCircle2 className="h-5 w-5" />}
              {s.color === 'warning' && <AlertTriangle className="h-5 w-5" />}
              {s.color === 'info' && <Eye className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: activeSubmission ? '1fr 420px' : '1fr' }}>
        {/* Left: Submissions list */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm tên, mã SV..."
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 pl-9 pr-3 text-sm w-56 focus:outline-none focus:ring-2"
              />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2">
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'Tất cả' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {['Mã SV', 'Họ tên', 'Lớp', 'Thời gian nộp', 'Trạng thái', 'Điểm', 'Thao tác'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {paged.map((s) => {
                  const sc = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG];
                  const isActive = activeSubmission?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors cursor-pointer ${isActive ? 'bg-[rgb(var(--primary)/0.06)]' : 'hover:bg-[rgb(var(--bg-hover))]'}`}
                      onClick={() => openGrading(s)}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{s.studentId}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{s.studentName}</td>
                      <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{s.class}</td>
                      <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{s.submittedAt}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[rgb(var(--${sc.color})/0.1)] text-[rgb(var(--${sc.color}))]`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.score !== null ? (
                          <span className={`text-sm font-bold ${
                            s.score >= 8 ? 'text-[rgb(var(--success))]' : s.score >= 6 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--error))]'
                          }`}>{s.score}/{ASSIGNMENT.maxScore}</span>
                        ) : (
                          <span className="text-sm text-[rgb(var(--text-muted))]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="sm"
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                            onClick={(e) => { e.stopPropagation(); navigate(`/lms/bai-tap/${id}/cham/${s.id}`); }}
                          >Xem</Button>
                          {s.status !== 'missing' && (
                            <Button
                              variant={s.status === 'graded' ? 'outline' : 'primary'}
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); openGrading(s); }}
                            >
                              {s.status === 'graded' ? 'Sửa' : 'Chấm'}
                            </Button>
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

        {/* Right: Grading panel */}
        {activeSubmission && (
          <div className="space-y-4">
            {/* Student summary */}
            <Card className="border-[rgb(var(--primary)/0.3)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-sm font-bold text-[rgb(var(--primary))]">
                    {activeSubmission.studentName.split(' ').slice(-2).map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--text-primary))]">{activeSubmission.studentName}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{activeSubmission.studentId} · {activeSubmission.class}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">Nộp lúc: {activeSubmission.submittedAt}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-3 border-t border-[rgb(var(--border)/0.4)]">
                  <p className="text-xs text-[rgb(var(--text-muted))] mr-2">Tổng điểm:</p>
                  <p className="text-3xl font-bold text-[rgb(var(--primary))]">{totalScore}</p>
                  <p className="text-lg text-[rgb(var(--text-muted))]">/{ASSIGNMENT.maxScore}</p>
                </div>
              </CardContent>
            </Card>

            {/* Criteria */}
            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Tiêu chí chấm điểm</h3>
              </div>
              <CardContent className="p-4 space-y-3">
                {CRITERIA.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[rgb(var(--text-secondary))] leading-tight">{c.label}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">0–{c.max} điểm</p>
                    </div>
                    <input
                      type="number" min={0} max={c.max} step={0.5}
                      value={scores[c.id] || ''}
                      onChange={(e) => handleScore(c.id, e.target.value)}
                      placeholder="0"
                      className="w-16 h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-center font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Nhận xét</h3>
              </div>
              <CardContent className="p-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập nhận xét cho sinh viên..."
                  rows={3}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
                />
                {saved && (
                  <p className="text-xs text-[rgb(var(--success))] mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Đã lưu
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="sm" leftIcon={<Save className="h-3.5 w-3.5" />} onClick={handleSave}>
                Lưu tạm
              </Button>
              <Button className="flex-1" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={() => setActiveSubmission(null)}>
                Trả bài
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
