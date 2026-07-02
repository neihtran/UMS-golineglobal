import { useState } from 'react';
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const PROCTOR_ALERTS = [
  { student: 'Nguyễn Văn B', msv: 'SV-2022-0001', exam: 'CS101', action: 'Copy-paste bất thường (3 lần)', time: '09:42:15', severity: 'medium', browser: 'Chrome 125' },
  { student: 'Trần Thị C', msv: 'SV-2022-0002', exam: 'CS101', action: 'Mở tab mới 2 lần trong 15 phút', time: '09:15:33', severity: 'low', browser: 'Firefox 127' },
  { student: 'Lê Hoàng D', msv: 'SV-2023-0001', exam: 'MATH201', action: 'Phát hiện AI assistant đang chạy', time: '09:08:02', severity: 'high', browser: 'Chrome 125' },
  { student: 'Phạm Văn E', msv: 'SV-2021-0001', exam: 'ENG301', action: 'Tỷ lệ gõ bàn phím bất thường', time: '09:22:10', severity: 'low', browser: 'Safari 17' },
];

const ACTIVE_EXAMS = [
  { id: 'e1', code: 'CS101-2026-T4', name: 'Thi giữa kỳ — CS101 Nhập môn Lập trình', type: 'Giữa kỳ', duration: 90, start: '09:00', room: 'P.301-302', students: 78, submitted: 64, cheatingAlerts: 1, status: 'active' },
  { id: 'e2', code: 'MATH201-2026-T3', name: 'Thi giữa kỳ — MATH201 Giải tích 2', type: 'Giữa kỳ', duration: 120, start: '09:00', room: 'P.401-404', students: 145, submitted: 138, cheatingAlerts: 0, status: 'active' },
  { id: 'e3', code: 'ENG301-2026-T2', name: 'Bài kiểm tra — ENG301 Tiếng Anh Học thuật', type: '15 phút', duration: 15, start: '10:30', room: 'P.201', students: 62, submitted: 45, cheatingAlerts: 1, status: 'active' },
];

export default function ExamMonitor() {
  const { t } = useTranslation('exam');
  const [selectedExam, setSelectedExam] = useState<string | null>('e1');
  const exam = ACTIVE_EXAMS.find((e) => e.id === selectedExam) ?? ACTIVE_EXAMS[0];
  const alerts = PROCTOR_ALERTS.filter((a) => a.exam === selectedExam?.replace('e1', 'CS101'));

  const SEVERITY_CONFIG = {
    low: { color: 'info', label: t('examMonitor.severity.low'), bg: 'rgb(var(--info)/0.1)' },
    medium: { color: 'warning', label: t('examMonitor.severity.medium'), bg: 'rgb(var(--warning)/0.1)' },
    high: { color: 'error', label: t('examMonitor.severity.high'), bg: 'rgb(var(--error)/0.1)' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('examMonitor.title')}
        description={t('examMonitor.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard'), href: '/exam' }, { label: t('breadcrumb.examMonitor') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('examMonitor.exportReport')}</Button>
            <Button variant="outline" leftIcon={<XCircle className="h-4 w-4" />} className="text-[rgb(var(--error))]">{t('examMonitor.endAll')}</Button>
          </>
        }
      />

      {/* Live exam selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {ACTIVE_EXAMS.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedExam(e.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-all shrink-0 min-w-[200px] ${
              selectedExam === e.id
                ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)] shadow-sm'
                : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary-light))]'
            }`}
          >
            <div className={`h-2.5 w-2.5 rounded-full ${e.status === 'active' ? 'bg-[rgb(var(--error))] animate-pulse' : 'bg-[rgb(var(--border))]'}`} />
            <div>
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{e.code}</p>
              <p className="text-[10px] text-[rgb(var(--text-muted))]">{e.students} {t('dashboard.activeExam.students')} · {e.submitted} {t('dashboard.activeExam.submitted')}</p>
            </div>
            {e.cheatingAlerts > 0 && (
              <Badge variant="error" size="sm" className="ml-auto">{e.cheatingAlerts} {t('dashboard.activeExam.warning')}</Badge>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Proctor panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">{exam.name}</h3>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                    {exam.room} · {exam.start} · {exam.duration} {t('examSession.card.minutes')} · {exam.type}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[rgb(var(--success))]">{exam.submitted}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">/ {exam.students} {t('dashboard.activeExam.submitted')}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-[rgb(var(--success))] border-t-transparent animate-spin" />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 py-3 border-b border-[rgb(var(--border)/0.6)]">
              <div className="h-2 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgb(var(--success))] transition-all"
                  style={{ width: `${(exam.submitted / exam.students) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[rgb(var(--text-muted))]">
                <span>{Math.round((exam.submitted / exam.students) * 100)}% {t('examMonitor.progress.completed')}</span>
                <span>{(exam.students - exam.submitted)} {t('examMonitor.progress.notSubmitted')}</span>
              </div>
            </div>

            {/* Alerts */}
            <div className="divide-y divide-[rgb(var(--border)/0.5)]">
              <div className="px-5 py-3 bg-[rgb(var(--error)/0.05)]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[rgb(var(--error))]" />
                  <h4 className="font-semibold text-[rgb(var(--text-primary))]">
                    {t('examMonitor.aiAlert.title')} {t('examMonitor.aiAlert.count', { count: alerts.length })}
                  </h4>
                </div>
              </div>

              {alerts.map((alert) => {
                const sc = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG];
                return (
                  <div key={alert.student + alert.time} className="flex items-start gap-4 px-5 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: sc.bg, color: `rgb(var(--${sc.color}))` }}>
                      ⚠
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{alert.student}</p>
                        <span className="font-mono text-[10px] text-[rgb(var(--text-muted))]">{alert.msv}</span>
                        <Badge variant={sc.color as 'info' | 'warning' | 'error'} size="sm">{sc.label}</Badge>
                      </div>
                      <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">{alert.action}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[rgb(var(--text-muted))]">
                        <span>🕐 {alert.time}</span>
                        <span>🌐 {alert.browser}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm">{t('examMonitor.actions.record')}</Button>
                      <Button size="sm">{t('examMonitor.actions.process')}</Button>
                    </div>
                  </div>
                );
              })}

              {alerts.length === 0 && (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="h-10 w-10 text-[rgb(var(--success))] mb-2" />
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{t('examMonitor.noAlert.message')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('examMonitor.progress.title')}</h4>
            </div>
            <CardContent className="space-y-3 pt-3">
              {[
                { label: t('examMonitor.progress.total'), value: exam.students, color: 'primary' },
                { label: t('examMonitor.progress.submitted'), value: exam.submitted, color: 'success' },
                { label: t('examMonitor.progress.ongoing'), value: exam.students - exam.submitted, color: 'warning' },
                { label: t('examMonitor.progress.timeoutNotSubmitted'), value: 0, color: 'error' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-[rgb(var(--text-secondary))]">{label}</span>
                  <span className="text-lg font-bold text-[rgb(var(--${color}))]" style={{ color: `rgb(var(--${color}))` }}>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('examMonitor.warnings.title')}</h4>
            </div>
            <CardContent className="space-y-2 pt-3">
              {[
                { label: t('examMonitor.warnings.cheatingHigh'), value: 1, color: 'error' },
                { label: t('examMonitor.warnings.abnormalMedium'), value: 1, color: 'warning' },
                { label: t('examMonitor.warnings.suspectLow'), value: 2, color: 'info' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-[rgb(var(--text-secondary))]">{label}</span>
                  <Badge variant={color as 'error' | 'warning' | 'info'} size="sm">{value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
