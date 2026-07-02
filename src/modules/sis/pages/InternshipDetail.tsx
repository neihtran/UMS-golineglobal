import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit2, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const INTERNSHIP = {
  id: 'it001',
  studentCode: 'SV2022001',
  studentName: 'Nguyễn Thị Lan Anh',
  class: 'CNTT-K24',
  major: 'CNTT',
  dept: 'Khoa CNTT',
  company: 'FPT Software Đà Nẵng',
  position: 'Thực tập sinh Backend',
  location: 'Đà Nẵng',
  startDate: '2026-06-01',
  endDate: '2026-08-31',
  supervisor: 'Nguyễn Văn Minh',
  supervisorPhone: '0901234567',
  supervisorEmail: 'minh.nv@fpt.com.vn',
  status: 'in_progress',
  progress: 45,
  reportSubmitted: false,
  grade: null,
  tasks: [
    { id: 't1', title: 'Tìm hiểu kiến trúc hệ thống', status: 'completed', deadline: '2026-06-07' },
    { id: 't2', title: 'Setup môi trường phát triển', status: 'completed', deadline: '2026-06-14' },
    { id: 't3', title: 'Phát triển module API REST', status: 'in_progress', deadline: '2026-07-15' },
    { id: 't4', title: 'Viết tài liệu kỹ thuật', status: 'pending', deadline: '2026-08-01' },
    { id: 't5', title: 'Triển khai CI/CD pipeline', status: 'pending', deadline: '2026-08-20' },
  ],
  reports: [
    { id: 'r1', title: 'Báo cáo tuần 1–4', date: '2026-06-30', status: 'submitted' },
    { id: 'r2', title: 'Báo cáo tuần 5–8', date: null, status: 'pending' },
  ],
  evaluations: [
    { date: '2026-06-30', type: 'Đánh giá giữa kỳ', score: 7.5, note: 'Hoàn thành tốt các công việc được giao, có tinh thần trách nhiệm cao.' },
  ],
};

export default function InternshipDetail() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();

  const i = INTERNSHIP;

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error' | 'info'; labelKey: string }> = {
    registered: { variant: 'info', labelKey: 'internship.status.registered' },
    in_progress: { variant: 'warning', labelKey: 'internship.status.in_progress' },
    pending_report: { variant: 'neutral', labelKey: 'internship.status.pending_report' },
    completed: { variant: 'success', labelKey: 'internship.status.completed' },
    rejected: { variant: 'error', labelKey: 'internship.status.rejected' },
  };

  const sc = STATUS_CONFIG[i.status];

  const TASK_STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; labelKey: string }> = {
    completed: { variant: 'success', labelKey: 'internship.detail.task.completed' },
    in_progress: { variant: 'warning', labelKey: 'internship.detail.task.inProgress' },
    pending: { variant: 'neutral', labelKey: 'internship.detail.task.pending' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${i.studentCode} — ${t('internship.detail.student')}`}
        description={i.studentName}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('internship.breadcrumb.tn'), href: '/sis/thuc-tap' },
          { label: i.studentCode },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('internship.detail.export')}</Button>
            <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate('/sis/thuc-tap')}>{t('internship.detail.edit')}</Button>
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/thuc-tap')}>{t('internship.detail.back')}</Button>
          </>
        }
      />

      {/* Student + Company Info */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold uppercase text-[rgb(var(--text-muted))]">{t('internship.detail.student')}</p>
            {[
              { labelKey: 'internship.detail.fields.hoTen', value: i.studentName },
              { labelKey: 'internship.detail.fields.maSinhVien', value: i.studentCode },
              { labelKey: 'internship.detail.fields.lopNganh', value: `${i.class} — ${i.major}` },
              { labelKey: 'internship.detail.fields.khoa', value: i.dept },
            ].map((item) => (
              <div key={item.labelKey}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{t(item.labelKey)}</p>
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold uppercase text-[rgb(var(--text-muted))]">{t('internship.detail.company')}</p>
            {[
              { labelKey: 'internship.detail.fields.congTy', value: i.company },
              { labelKey: 'internship.detail.fields.viTri', value: i.position },
              { labelKey: 'internship.detail.fields.diaDiem', value: i.location },
              { labelKey: 'internship.detail.fields.thoiGian', value: `${i.startDate} → ${i.endDate}` },
            ].map((item) => (
              <div key={item.labelKey}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{t(item.labelKey)}</p>
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Progress + Supervisor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge>
              <Badge variant="neutral" size="sm">{i.major}</Badge>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{t('internship.detail.progress')}</p>
              <p className="text-3xl font-bold text-[rgb(var(--primary))]">{i.progress}%</p>
              <div className="mt-2 h-3 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div className="h-full rounded-full bg-[rgb(var(--primary))] transition-all" style={{ width: `${i.progress}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t border-[rgb(var(--border)/0.4)] space-y-1">
              <div>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{t('internship.detail.supervisor')}</p>
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{i.supervisor}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{t('internship.detail.phone')}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{i.supervisorPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-3 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('internship.detail.tasks')}</h3>
          </div>
          <CardContent className="p-5 space-y-3">
            {i.tasks.map((task) => {
              const tc = TASK_STATUS_CONFIG[task.status];
              return (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border)/0.3)] last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${task.status === 'completed' ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--text-muted))]'}`} />
                    <span className={`text-sm ${task.status === 'completed' ? 'text-[rgb(var(--text-secondary))] line-through' : 'text-[rgb(var(--text-primary))] font-medium'}`}>{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{t('internship.detail.task.deadline')}: {task.deadline}</span>
                    <Badge variant={tc.variant} size="sm">{t(tc.labelKey)}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Reports + Evaluation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="px-5 pt-5 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('internship.detail.reports')}</h3>
            <Button variant="outline" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>{t('internship.detail.submitReport')}</Button>
          </div>
          <CardContent className="p-5 space-y-3">
            {i.reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border)/0.3)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{r.title}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{r.date ?? t('internship.detail.report.notSubmitted')}</p>
                </div>
                <Badge variant={r.status === 'submitted' ? 'success' : 'neutral'} size="sm">
                  {r.status === 'submitted' ? t('internship.detail.report.submitted') : t('internship.detail.report.pending')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-3 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('internship.detail.evaluation')}</h3>
          </div>
          <CardContent className="p-5 space-y-3">
            {i.evaluations.map((ev, idx) => (
              <div key={idx} className="py-2 border-b border-[rgb(var(--border)/0.3)] last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{ev.type}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{ev.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[rgb(var(--success))]">{ev.score.toFixed(1)}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">/10 {t('internship.detail.evaluationNote.score')}</p>
                  </div>
                </div>
                <p className="text-sm text-[rgb(var(--text-secondary))] italic">{ev.note}</p>
              </div>
            ))}
            {i.evaluations.length === 0 && (
              <p className="text-sm text-[rgb(var(--text-muted))] text-center py-4">{t('internship.detail.noEvaluation')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
