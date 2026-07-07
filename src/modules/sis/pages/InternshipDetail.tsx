import { useState } from 'react';
import { FileText, Briefcase, Clock, Star, Building2, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useInternshipDetail, useInternshipList } from '@/hooks/useSis';

export default function InternshipDetail() {
  const { t } = useTranslation('sis');
  const { data: listData } = useInternshipList({ pageSize: 100 });
  const internships = listData?.data ?? [];
  const [selected, setSelected] = useState(internships[0]?._id ?? '');

  const { data: detail, isLoading } = useInternshipDetail(selected);
  const item = (detail as any)?.data ?? detail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('internship.title')}
        description={t('internship.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('internship.breadcrumb.list'), href: '/sis/internship' },
          { label: t('internship.breadcrumb.detail') },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: intern list */}
        <Card className="lg:col-span-1">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary)]">{t('internship.studentList')}</h3>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.4)] max-h-[calc(100vh-260px)] overflow-y-auto">
            {internships.length === 0 ? (
              <p className="p-5 text-sm text-[rgb(var(--text-muted)] text-center">Chưa có thực tập sinh</p>
            ) : internships.map((it: any) => (
              <button
                key={it._id}
                onClick={() => setSelected(it._id)}
                className={`w-full text-left px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors ${selected === it._id ? 'bg-[rgb(var(--primary)/0.06)]' : ''}`}
              >
                <p className="text-sm font-medium text-[rgb(var(--text-primary)]">{it.studentName || it.student?.name || '—'}</p>
                <p className="text-xs text-[rgb(var(--text-muted)] mt-0.5">
                  {it.company || '—'} · {it.status === 'approved' ? 'Đã duyệt' : it.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Right: detail */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[rgb(var(--primary))] border-t-transparent" />
                Đang tải...
              </div>
            </div>
          ) : !item ? (
            <Card>
              <CardContent className="flex h-48 items-center justify-center">
                <p className="text-sm text-[rgb(var(--text-muted)]">Chọn một thực tập sinh để xem chi tiết</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Student info */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-lg font-bold">
                      {(item.studentName || item.student?.name || '?').split(' ').slice(-2).map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[rgb(var(--text-primary)]">{item.studentName || item.student?.name || '—'}</h2>
                      <p className="text-sm text-[rgb(var(--text-muted)]">{item.studentCode || item.student?.code || '—'}</p>
                      <Badge
                        variant={item.status === 'approved' ? 'success' : item.status === 'pending' ? 'warning' : 'error'}
                        size="sm"
                        className="mt-1"
                        dot
                      >
                        {item.status === 'approved' ? 'Đã duyệt' : item.status === 'pending' ? 'Chờ duyệt' : item.status === 'rejected' ? 'Từ chối' : item.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: t('internship.studentId'), value: item.studentCode || item.student?.code || '—', icon: <BookOpen className="h-4 w-4" /> },
                      { label: t('internship.company'), value: item.company || '—', icon: <Building2 className="h-4 w-4" /> },
                      { label: t('internship.position'), value: item.position || '—', icon: <Briefcase className="h-4 w-4" /> },
                      { label: t('internship.duration'), value: item.duration ? `${item.duration} tuần` : '—', icon: <Clock className="h-4 w-4" /> },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center gap-2.5">
                        <span className="text-[rgb(var(--text-muted)]">{f.icon}</span>
                        <div>
                          <p className="text-xs text-[rgb(var(--text-muted)]">{f.label}</p>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary)]">{f.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Report & evaluation */}
              <Card>
                <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                  <h3 className="font-semibold text-[rgb(var(--text-primary)]">{t('internship.report')}</h3>
                </div>
                <CardContent className="p-5 space-y-4">
                  {[
                    { label: t('internship.reportTitle'), value: item.reportTitle || '—', icon: <FileText className="h-4 w-4" /> },
                    { label: t('internship.supervisor'), value: item.supervisor || '—', icon: <Star className="h-4 w-4" /> },
                    { label: t('internship.grade'), value: item.grade ? `${item.grade}/10` : '—', icon: <Star className="h-4 w-4" /> },
                    { label: t('internship.startDate'), value: item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '—', icon: <Clock className="h-4 w-4" /> },
                    { label: t('internship.endDate'), value: item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '—', icon: <Clock className="h-4 w-4" /> },
                  ].map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5">
                      <span className="mt-0.5 text-[rgb(var(--text-muted)]">{f.icon}</span>
                      <div>
                        <p className="text-xs text-[rgb(var(--text-muted)]">{f.label}</p>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary)]">{f.value}</p>
                      </div>
                    </div>
                  ))}
                  {item.description && (
                    <div className="border-t border-[rgb(var(--border)/0.4)] pt-3">
                      <p className="text-xs text-[rgb(var(--text-muted)] mb-1">{t('internship.description')}</p>
                      <p className="text-sm text-[rgb(var(--text-secondary)]">{item.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
