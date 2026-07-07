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
import { useExamList } from '@/hooks/useExam';
import { usePagination } from '@/hooks';

const SEVERITY_CONFIG = {
  low: { color: 'info', labelKey: 'examMonitor.severity.low', bg: 'rgb(var(--info)/0.1)' },
  medium: { color: 'warning', labelKey: 'examMonitor.severity.medium', bg: 'rgb(var(--warning)/0.1)' },
  high: { color: 'error', labelKey: 'examMonitor.severity.high', bg: 'rgb(var(--error)/0.1)' },
};

const EXAM_TYPE_LABEL: Record<string, string> = {
  final: 'Kết thúc HP',
  midterm: 'Giữa kỳ',
  mid_semester: '15 phút',
  semester: 'Học kỳ',
};

const COLOR_CLASS: Record<string, string> = {
  primary: 'text-[rgb(var(--primary))]',
  success: 'text-[rgb(var(--success))]',
  warning: 'text-[rgb(var(--warning))]',
  error: 'text-[rgb(var(--error))]',
  info: 'text-[rgb(var(--info))]',
  neutral: 'text-[rgb(var(--text-muted))]',
};

export default function ExamMonitor() {
  const { t } = useTranslation('exam');
  const { pagination } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useExamList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: 'active',
  });

  const exams: any[] = data?.data ?? [];
  const selectedExam = selectedId ? exams.find((e) => e._id === selectedId) ?? exams[0] : exams[0];

  const mockAlerts = selectedExam
    ? [
        { id: `alert-${selectedExam._id}-1`, student: 'Nguyễn Văn B', msv: 'SV-2022-0001', exam: selectedExam.code, action: 'Copy-paste bất thường (3 lần)', time: new Date().toLocaleTimeString('vi-VN'), severity: 'medium', browser: 'Chrome 125' },
        { id: `alert-${selectedExam._id}-2`, student: 'Trần Thị C', msv: 'SV-2022-0002', exam: selectedExam.code, action: 'Mở tab mới 2 lần trong 15 phút', time: new Date().toLocaleTimeString('vi-VN'), severity: 'low', browser: 'Firefox 127' },
      ]
    : [];

  const alerts = selectedExam ? mockAlerts.filter((a) => a.exam === selectedExam.code) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('examMonitor.title')}
        description={t('examMonitor.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard', { defaultValue: 'Dashboard' }), href: '/exam' }, { label: t('breadcrumb.examMonitor', { defaultValue: 'Giám sát thi' })}]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('examMonitor.exportReport')}</Button>
            <Button variant="outline" leftIcon={<XCircle className="h-4 w-4" />} className="text-[rgb(var(--error))]">{t('examMonitor.endAll')}</Button>
          </>
        }
      />

      {/* Live exam selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {isLoading ? (
          <p className="text-sm text-[rgb(var(--text-muted))] py-4">{t('common:common.loading')}</p>
        ) : exams.length === 0 ? (
          <p className="text-sm text-[rgb(var(--text-muted))] py-4">Không có ca thi đang diễn ra</p>
        ) : (
          exams.map((e) => {
            const isSelected = e._id === selectedId;
            return (
              <button
                key={e._id}
                onClick={() => setSelectedId(e._id)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-all shrink-0 min-w-[200px] ${
                  isSelected
                    ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)] shadow-sm'
                    : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary-light))]'
                }`}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${e.status === 'active' ? 'bg-[rgb(var(--success))] animate-pulse' : 'bg-[rgb(var(--border))]'}`} />
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{e.code}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{e.students ?? 0} SV · {e.submitted ?? 0} {t('dashboard.activeExam.submitted', { defaultValue: 'đã nộp' })}</p>
                </div>
                {(e.cheatingAlerts ?? 0) > 0 && (
                  <Badge variant="error" size="sm" className="ml-auto">{e.cheatingAlerts} {t('dashboard.activeExam.warning', { defaultValue: 'cảnh báo' })}</Badge>
                )}
              </button>
            );
          })
        )}
      </div>

      {selectedExam && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Proctor panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">{selectedExam.code} — {selectedExam.title}</h3>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                    {selectedExam.room ?? '—'} · {selectedExam.duration} phút · {EXAM_TYPE_LABEL[selectedExam.examType] ?? selectedExam.examType}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[rgb(var(--success))]">{selectedExam.submitted ?? 0}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">/ {selectedExam.students ?? 0} {t('dashboard.activeExam.submitted', { defaultValue: 'đã nộp' })}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-[rgb(var(--success))] border-t-transparent animate-spin" />
                </div>
              </div>

              <div className="px-5 py-3 border-b border-[rgb(var(--border)/0.6)]">
                <div className="h-2 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[rgb(var(--success))] transition-all"
                    style={{ width: `${((selectedExam.submitted ?? 0) / Math.max(selectedExam.students ?? 1, 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-[rgb(var(--text-muted))]">
                  <span>{Math.round(((selectedExam.submitted ?? 0) / Math.max(selectedExam.students ?? 1, 1)) * 100)}% {t('examMonitor.progress.completed', { defaultValue: 'hoàn thành' })}</span>
                  <span>{(selectedExam.students ?? 0) - (selectedExam.submitted ?? 0)} {t('examMonitor.progress.notSubmitted', { defaultValue: 'chưa nộp' })}</span>
                </div>
              </div>

              <div className="divide-y divide-[rgb(var(--border)/0.5)]">
                <div className="px-5 py-3 bg-[rgb(var(--error)/0.05)]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[rgb(var(--error))]" />
                    <h4 className="font-semibold text-[rgb(var(--text-primary))]">
                      {t('examMonitor.aiAlert.title', { defaultValue: 'Cảnh báo AI' })} {alerts.length}
                    </h4>
                  </div>
                </div>

                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircle2 className="h-10 w-10 text-[rgb(var(--success))] mb-2" />
                    <p className="text-sm text-[rgb(var(--text-secondary))]">{t('examMonitor.noAlert.message', { defaultValue: 'Không có cảnh báo nào' })}</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const sc = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG];
                    return (
                      <div key={alert.id} className="flex items-start gap-4 px-5 py-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: sc.bg, color: `rgb(var(--${sc.color}))` }}>
                          ⚠
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{alert.student}</p>
                            <span className="font-mono text-[10px] text-[rgb(var(--text-muted))]">{alert.msv}</span>
                            <Badge variant={sc.color as 'info' | 'warning' | 'error'} size="sm">{t(sc.labelKey)}</Badge>
                          </div>
                          <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">{alert.action}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-[rgb(var(--text-muted))]">
                            <span>🕐 {alert.time}</span>
                            <span>🌐 {alert.browser}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="sm">{t('examMonitor.actions.record', { defaultValue: 'Ghi nhận' })}</Button>
                          <Button size="sm">{t('examMonitor.actions.process', { defaultValue: 'Xử lý' })}</Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4">
            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('examMonitor.progress.title', { defaultValue: 'Tiến độ' })}</h4>
              </div>
              <CardContent className="space-y-3 pt-3">
                {[
                  { label: 'Tổng số', value: selectedExam.students ?? 0, colorName: 'primary' },
                  { label: 'Đã nộp', value: selectedExam.submitted ?? 0, colorName: 'success' },
                  { label: 'Đang làm', value: (selectedExam.students ?? 0) - (selectedExam.submitted ?? 0), colorName: 'warning' },
                  { label: 'Quá hạn', value: 0, colorName: 'error' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--text-secondary))]">{row.label}</span>
                    <span className={`text-lg font-bold ${COLOR_CLASS[row.colorName] ?? ''}`}>{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('examMonitor.warnings.title', { defaultValue: 'Cảnh báo' })}</h4>
              </div>
              <CardContent className="space-y-2 pt-3">
                {[
                  { label: t('examMonitor.warnings.cheatingHigh', { defaultValue: 'Gian lận (cao)' }), value: alerts.filter((a) => a.severity === 'high').length, colorName: 'error' },
                  { label: t('examMonitor.warnings.abnormalMedium', { defaultValue: 'Bất thường (TB)' }), value: alerts.filter((a) => a.severity === 'medium').length, colorName: 'warning' },
                  { label: t('examMonitor.warnings.suspectLow', { defaultValue: 'Nghi ngờ (thấp)' }), value: alerts.filter((a) => a.severity === 'low').length, colorName: 'info' },
                ].map(({ label, value, colorName }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-[rgb(var(--text-secondary))]">{label}</span>
                    <Badge variant={colorName as 'error' | 'warning' | 'info'} size="sm">{value}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
