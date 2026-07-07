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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useExamList, useExamSessionList, useExamResultList } from '@/hooks/useExam';

const GRADE_BUCKETS: { grade: string; color: string; min: number; max: number }[] = [
  { grade: 'A', color: 'rgb(var(--success))', min: 8.5, max: 10 },
  { grade: 'B+', color: 'rgb(var(--primary))', min: 8.0, max: 8.4 },
  { grade: 'B', color: 'rgb(var(--info))', min: 7.0, max: 7.9 },
  { grade: 'C+', color: 'rgb(var(--accent))', min: 6.5, max: 6.9 },
  { grade: 'C', color: 'rgb(var(--warning))', min: 5.5, max: 6.4 },
  { grade: 'D', color: 'rgb(var(--error))', min: 4.0, max: 5.4 },
  { grade: 'F', color: 'rgb(var(--border))', min: 0, max: 3.9 },
];

export default function EXAMDashboard() {
  const { t } = useTranslation('exam');

  const { data: examsResp } = useExamList({ page: 1, pageSize: 100 });
  const { data: sessionsResp } = useExamSessionList({ status: 'in_progress', page: 1, pageSize: 10 });
  const { data: sessionsAllResp } = useExamSessionList({ page: 1, pageSize: 200 });
  const { data: resultsResp } = useExamResultList({ page: 1, pageSize: 500 });

  const exams = (examsResp?.data ?? []) as any[];
  const activeSessions = (sessionsResp?.data ?? []) as any[];
  const allSessions = (sessionsAllResp?.data ?? []) as any[];
  const results = (resultsResp?.data ?? []) as any[];

  const totalExams = examsResp?.pagination?.total ?? exams.length;
  const completedExams = exams.filter((e: any) => e.status === 'completed').length;
  const ongoingExams = exams.filter((e: any) => e.status === 'ongoing' || e.status === 'published').length;
  const passingResults = results.filter((r: any) => r.percentage >= 50).length;
  const passRate = results.length > 0 ? Math.round((passingResults / results.length) * 1000) / 10 : 0;

  const EXAM_STATS = [
    { label: t('dashboard.stats.totalExam'), value: totalExams.toString(), change: t('dashboard.stats.newSemester'), icon: <CheckCircle2 className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.stats.ongoing'), value: ongoingExams.toString(), sub: t('dashboard.stats.ongoingSub'), icon: <Clock className="h-5 w-5" />, color: 'warning' },
    { label: t('dashboard.stats.completed'), value: completedExams.toString(), change: t('dashboard.stats.completedThisWeek'), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { label: t('dashboard.stats.passRate'), value: `${passRate}%`, change: passRate >= 80 ? '+' + (passRate - 80).toFixed(1) + '%' : '', icon: <TrendingUp className="h-5 w-5" />, color: 'info' },
  ];

  const cheatingSessions = allSessions.filter((s: any) => Array.isArray(s.cheatingFlags) && s.cheatingFlags.length > 0);
  const CHEATING_ALERTS = cheatingSessions.slice(0, 5).map((s: any) => ({
    student: s.studentName ?? s.studentCode ?? '—',
    exam: s.examTitle ?? '—',
    action: s.cheatingFlags.join(', '),
    time: s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—',
    severity: s.cheatingFlags.length > 1 ? 'medium' : 'low',
  }));

  const GRADE_DIST = GRADE_BUCKETS.map((b) => ({
    grade: b.grade,
    color: b.color,
    count: results.filter((r: any) => {
      const pct = r.percentage ?? 0;
      return pct >= b.min && pct <= b.max;
    }).length,
  }));

  const examScores = new Map<string, { total: number; count: number }>();
  for (const r of results) {
    const key = r.examTitle ?? r.examId ?? '—';
    if (!examScores.has(key)) examScores.set(key, { total: 0, count: 0 });
    const bucket = examScores.get(key)!;
    bucket.total += r.score ?? 0;
    bucket.count += 1;
  }
  const SCORE_TREND = Array.from(examScores.entries())
    .slice(0, 6)
    .map(([exam, { total, count }]) => ({ exam: exam.length > 8 ? exam.slice(0, 8) + '…' : exam, avg: count > 0 ? Math.round((total / count) * 10) / 10 : 0 }));

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
            <Badge variant="error">{activeSessions.length}</Badge>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
            {t('common.monitorAll')}
          </Button>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.5)]">
          {activeSessions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">—</p>
          ) : (
            activeSessions.map((exam: any) => {
              const cheatingCount = Array.isArray(exam.cheatingFlags) ? exam.cheatingFlags.length : 0;
              const submitted = exam.status === 'submitted' || exam.status === 'graded' ? 1 : 0;
              const total = 1;
              return (
                <div key={exam._id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning">{exam.examTitle ?? '—'}</Badge>
                        <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{exam._id?.slice(-6) ?? '—'}</span>
                      </div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{exam.studentName ?? exam.studentCode ?? '—'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                        <span>📍 {exam.room ?? '—'}</span>
                        <span>🕐 {exam.duration ?? '—'} {t('dashboard.activeExam.duration')}</span>
                        <span>👥 {t('dashboard.activeExam.students')}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-[rgb(var(--text-primary))]">
                        {submitted}<span className="text-sm font-normal text-[rgb(var(--text-muted))]">/{total}</span>
                      </p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.activeExam.submitted')}</p>
                      <div className="mt-2 h-2 w-24 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[rgb(var(--success))]"
                          style={{ width: `${(submitted / total) * 100}%` }}
                        />
                      </div>
                      {cheatingCount > 0 && (
                        <Badge variant="error" size="sm" className="mt-2">
                          {cheatingCount} {t('dashboard.activeExam.warning')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
            {CHEATING_ALERTS.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">—</p>
            ) : (
              CHEATING_ALERTS.map((alert, i) => (
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
              ))
            )}
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
                    <Bar key={i} dataKey="count" fill={entry.color} />
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
          {SCORE_TREND.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">—</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SCORE_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="exam" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[5, 9]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${t('examMonitor.progress.submitted')}: ${v.toFixed(1)}`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" stroke="rgb(var(--primary))" strokeWidth={2.5} dot={{ r: 5, fill: 'rgb(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}