import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useEnrollmentDetail } from '@/hooks/useSis';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Đang học' },
  completed: { variant: 'info', label: 'Hoàn thành' },
  failed: { variant: 'error', label: 'Rớt' },
  dropped: { variant: 'neutral', label: 'Thôi học' },
};

export default function EnrollmentDetail() {
  const { t } = useTranslation('sis');
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useEnrollmentDetail(id!);
  const item = (data as any)?.data ?? data;

  const sc = item ? (STATUS_CONFIG[item.status] ?? { variant: 'neutral' as const, label: (item.status as string) ?? '—' }) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('enrollment.detailTitle')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('enrollment.breadcrumb.list'), href: '/sis/enrollment' },
          { label: t('enrollment.breadcrumb.detail') },
        ]}
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[rgb(var(--primary))] border-t-transparent" />
            Đang tải...
          </div>
        </div>
      ) : !item ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-[rgb(var(--text-muted)]">
            Không tìm thấy thông tin đăng ký.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Student */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary)]">{t('enrollment.studentInfo')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {[
                { label: t('enrollment.studentName'), value: item.studentName || item.student?.name || '—' },
                { label: t('enrollment.studentCode'), value: item.studentCode || item.student?.code || '—' },
                { label: t('enrollment.email'), value: item.student?.email || '—' },
                { label: t('enrollment.department'), value: item.student?.departmentName || item.department || '—' },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <span className="text-xs text-[rgb(var(--text-muted)] w-28 shrink-0 mt-0.5">{f.label}</span>
                  <span className="text-sm font-medium text-[rgb(var(--text-primary)]">{f.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Subject */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary)]">{t('enrollment.subjectInfo')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {[
                { label: t('enrollment.subjectName'), value: item.subjectName || item.subject?.name || '—' },
                { label: t('enrollment.subjectCode'), value: item.subjectCode || item.subject?.code || '—' },
                { label: t('enrollment.credits'), value: item.subject?.credits ? `${item.subject.credits} TC` : '—' },
                { label: t('enrollment.semester'), value: item.semester || item.enrollmentYear || '—' },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <span className="text-xs text-[rgb(var(--text-muted)] w-28 shrink-0 mt-0.5">{f.label}</span>
                  <span className="text-sm font-medium text-[rgb(var(--text-primary)]">{f.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Score & status */}
          <Card className="lg:col-span-2">
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary)]">{t('enrollment.scoreInfo')}</h3>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: t('enrollment.score'), value: item.score != null ? `${item.score}/10` : '—', color: 'text-[rgb(var(--primary))]' },
                  { label: t('enrollment.labScore'), value: item.labScore != null ? `${item.labScore}/10` : '—', color: 'text-[rgb(var(--accent))]' },
                  { label: t('enrollment.finalScore'), value: item.finalScore != null ? `${item.finalScore}/10` : '—', color: 'text-[rgb(var(--warning))]' },
                  { label: t('enrollment.status'), value: sc?.label ?? '—', render: <Badge variant={sc?.variant ?? 'neutral'} dot>{sc?.label ?? '—'}</Badge> },
                ].map((f) => (
                  <div key={f.label} className="text-center">
                    <p className="text-xs text-[rgb(var(--text-muted)] mb-2">{f.label}</p>
                    {f.render ?? <p className={`text-2xl font-bold ${f.color}`}>{f.value}</p>}
                  </div>
                ))}
              </div>
              {item.notes && (
                <div className="mt-4 pt-4 border-t border-[rgb(var(--border)/0.4)]">
                  <p className="text-xs text-[rgb(var(--text-muted)] mb-1">{t('enrollment.notes')}</p>
                  <p className="text-sm text-[rgb(var(--text-secondary)]">{item.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
