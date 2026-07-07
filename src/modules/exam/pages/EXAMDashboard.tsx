import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

// ─── Mock ────────────────────────────────────────────────────────────────────

const EXAM_STATS = [
  { label: 'Tổng kỳ thi', value: '42', change: '+8 HK mới', icon: <CheckCircle2 className="h-5 w-5" />, color: 'primary' },
  { label: 'Đang diễn ra', value: '3', sub: '⚠️ giám sát live', icon: <Clock className="h-5 w-5" />, color: 'warning' },
  { label: 'Đã hoàn thành', value: '31', change: '+5 tuần này', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
  { label: 'Tỷ lệ đạt', value: '84.2%', change: '+1.3%', icon: <TrendingUp className="h-5 w-5" />, color: 'info' },
];

const ACTIVE_EXAMS = [
  { id: 'e1', code: 'CS101-2026-T4', name: 'Thi giữa kỳ — CS101 Nhập môn Lập trình', type: 'Giữa kỳ', duration: 90, start: '09:00', room: 'P.301', students: 78, submitted: 64, cheating: 0 },
  { id: 'e2', code: 'MATH201-2026-T3', name: 'Thi giữa kỳ — MATH201 Giải tích 2', type: 'Giữa kỳ', duration: 120, start: '09:00', room: 'P.401-402', students: 145, submitted: 138, cheating: 0 },
  { id: 'e3', code: 'ENG301-2026-T2', name: 'Bài kiểm tra — ENG301 Tiếng Anh Học thuật', type: '15 phút', duration: 15, start: '10:30', room: 'P.201', students: 62, submitted: 45, cheating: 1 },
];

const GRADE_DIST = [
  { grade: 'A', count: 142, color: 'rgb(var(--success))' },
  { grade: 'B+', count: 218, color: 'rgb(var(--primary))' },
  { grade: 'B', count: 310, color: 'rgb(var(--info))' },
  { grade: 'C+', count: 245, color: 'rgb(var(--accent))' },
  { grade: 'C', count: 178, color: 'rgb(var(--warning))' },
  { grade: 'D', count: 89, color: 'rgb(var(--error))' },
  { grade: 'F', count: 48, color: 'rgb(var(--border))' },
];

const CHEATING_ALERTS = [
  { student: 'Nguyễn Văn B', exam: 'ENG301', action: 'Thao tác copy-paste bất thường', time: '10:42', severity: 'medium' },
  { student: 'Trần Thị C', exam: 'CS101', action: 'Mở tab mới trong khi thi', time: '09:15', severity: 'low' },
];

const SCORE_TREND = [
  { exam: 'CS101', avg: 7.2 }, { exam: 'MATH201', avg: 6.8 },
  { exam: 'ENG301', avg: 7.8 }, { exam: 'PHYS101', avg: 6.4 },
  { exam: 'CHEM101', avg: 7.1 }, { exam: 'BIO101', avg: 7.5 },
];

export default function EXAMDashboard() {
  const { t } = useTranslation('exam');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('common.exportReport')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('dashboard.createNew')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {EXAM_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active exams */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[rgb(var(--error))] animate-pulse" />
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.activeExam.title')}</h3>
            <Badge variant="error">{ACTIVE_EXAMS.length}</Badge>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
            {t('common.monitorAll')}
          </Button>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.5)]">
          {ACTIVE_EXAMS.map((exam) => (
            <div key={exam.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning">{exam.type}</Badge>
                    <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{exam.code}</span>
                  </div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{exam.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                    <span>📍 {exam.room}</span>
                    <span>🕐 {exam.start} · {exam.duration} {t('dashboard.activeExam.duration')}</span>
                    <span>👥 {exam.students} {t('dashboard.activeExam.students')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-[rgb(var(--text-primary))]">
                    {exam.submitted}<span className="text-sm font-normal text-[rgb(var(--text-muted))]">/{exam.students}</span>
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.activeExam.submitted')}</p>
                  <div className="mt-2 h-2 w-24 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[rgb(var(--success))]"
                      style={{ width: `${(exam.submitted / exam.students) * 100}%` }}
                    />
                  </div>
                  {exam.cheating > 0 && (
                    <Badge variant="error" size="sm" className="mt-2">
                      {exam.cheating} {t('dashboard.activeExam.warning')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cheating alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[rgb(var(--warning))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.cheatingAlert.title')}</h3>
            </div>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {CHEATING_ALERTS.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  alert.severity === 'medium' ? 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]' : 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]'
                }`}>
                  ⚠
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{alert.student} · {alert.exam}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{alert.action}</p>
                </div>
                <span className="text-xs text-[rgb(var(--text-muted))] shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Grade distribution */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.gradeDist.title')}</h3>
          </div>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRADE_DIST} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <XAxis dataKey="grade" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v} ${t('dashboard.tooltip.student')}`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {GRADE_DIST.map((entry, i) => (
                    <Bar key={i} dataKey="count" fill={entry.color}  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Score trend */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.scoreTrend.title')}</h3>
        </div>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SCORE_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <XAxis dataKey="exam" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis domain={[5, 9]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `${t('examMonitor.progress.submitted')}: ${v.toFixed(1)}`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="avg" stroke="rgb(var(--primary))" strokeWidth={2.5} dot={{ r: 5, fill: 'rgb(var(--primary))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
