import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanSearch,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useOcrJobList } from '@/hooks/useOcr';
import type { OCRJob } from '@/services/ocr.service';

export default function OCRDashboard() {
  const { t } = useTranslation('ocr');
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'review'>('all');

  const jobsQuery = useOcrJobList({ page: 1, pageSize: 50 });

  const jobs: OCRJob[] = jobsQuery.data?.data ?? [];
  const totalJobs = jobsQuery.data?.pagination?.total ?? jobs.length;
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const processingJobs = jobs.filter((j) => j.status === 'processing' || j.status === 'queued');
  const failedJobs = jobs.filter((j) => j.status === 'failed');
  const avgConfidence = completedJobs.length > 0
    ? completedJobs.reduce((s, j) => s + (j.confidence ?? 0), 0) / completedJobs.length
    : 0;

  const stats = [
    {
      label: t('dashboard.totalScanned'),
      value: totalJobs.toLocaleString('vi-VN'),
      change: t('dashboard.newScanned', { count: processingJobs.length }),
      icon: <ScanSearch className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: t('dashboard.success'),
      value: completedJobs.length.toLocaleString('vi-VN'),
      sub: t('dashboard.accuracy', { percent: avgConfidence.toFixed(1) }),
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'success',
    },
    {
      label: t('dashboard.needsReview'),
      value: processingJobs.length.toLocaleString('vi-VN'),
      sub: t('dashboard.needsHumanReview', { percent: totalJobs > 0 ? ((processingJobs.length / totalJobs) * 100).toFixed(1) : '0' }),
      icon: <Clock className="h-5 w-5" />,
      color: 'warning',
    },
    {
      label: t('dashboard.ocrErrors'),
      value: failedJobs.length.toLocaleString('vi-VN'),
      sub: totalJobs > 0 ? `${((failedJobs.length / totalJobs) * 100).toFixed(1)}%` : '0%',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'info',
    },
  ];

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error'; label: string }> = {
    done: { variant: 'success', label: t('scanList.status.completed') },
    completed: { variant: 'success', label: t('scanList.status.completed') },
    review: { variant: 'warning', label: t('scanList.status.review') },
    processing: { variant: 'neutral', label: t('scanList.status.processing') },
    queued: { variant: 'neutral', label: t('scanList.status.processing') },
    failed: { variant: 'error', label: t('scanList.status.failed') },
    cancelled: { variant: 'error', label: t('scanList.status.failed') },
  };

  const visibleJobs = jobs.slice(0, 10);
  const filtered = filter === 'review'
    ? visibleJobs.filter((j) => j.status === 'queued' || j.status === 'processing')
    : visibleJobs;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'OCR' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Upload className="h-4 w-4" />}>{t('upload')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                  {jobsQuery.isLoading ? '…' : s.value}
                </p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document list */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('scanList.documentsScanned')}</h3>
          <div className="flex gap-2">
            {(['all', 'review'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))]'
                }`}
              >
                {f === 'all' ? t('scanList.all') : t('scanList.needsReview')}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {jobsQuery.isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có tài liệu nào</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {[t('table.document'), t('table.type'), t('table.pages'), t('table.processedDate'), t('table.accuracy'), t('table.size'), t('table.status'), ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {filtered.map((doc) => {
                  const sc = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.processing;
                  const accuracy = doc.confidence ?? 0;
                  return (
                    <tr key={doc._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                            <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                          </div>
                          <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{doc.fileName ?? doc._id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{doc.category ?? doc.source}</Badge></td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))] tabular-nums">—</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-2.5">
                        {accuracy > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                              <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: `${accuracy}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${
                              accuracy >= 97 ? 'text-[rgb(var(--success))]' : accuracy >= 90 ? 'text-[rgb(var(--info))]' : 'text-[rgb(var(--warning))]'
                            }`}>
                              {accuracy.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">—</td>
                      <td className="px-4 py-2.5"><Badge variant={sc.variant} size="sm">{sc.label}</Badge></td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/ocr/tai-lieu/${doc._id}`)}>{t('scanList.view')}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}