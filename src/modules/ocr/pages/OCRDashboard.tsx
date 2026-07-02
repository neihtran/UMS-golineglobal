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

const DOCUMENTS = [
  { id: 'd1', name: 'Hồ sơ tuyển dụng 2026-001', type: 'Hồ sơ nhân sự', pages: 8, processed: '2026-06-20', status: 'done', accuracy: 98.2, docType: 'PDF', size: '4.2 MB' },
  { id: 'd2', name: 'Hợp đồng lao động HLĐ-2026-042', type: 'Hợp đồng', pages: 3, processed: '2026-06-20', status: 'done', accuracy: 99.5, docType: 'PDF', size: '1.8 MB' },
  { id: 'd3', name: 'Bằng tốt nghiệp SV-2020-001', type: 'Bằng cấp', pages: 2, processed: '2026-06-19', status: 'done', accuracy: 97.8, docType: 'JPG', size: '2.1 MB' },
  { id: 'd4', name: 'Sổ điểm K60-CNTT', type: 'Sổ điểm', pages: 120, processed: '2026-06-18', status: 'review', accuracy: 84.2, docType: 'PDF', size: '45.6 MB' },
  { id: 'd5', name: 'Báo cáo NCKH 2025', type: 'Báo cáo', pages: 45, processed: '2026-06-17', status: 'done', accuracy: 96.1, docType: 'PDF', size: '18.3 MB' },
  { id: 'd6', name: 'Hồ sơ tuyển sinh K62', type: 'Tuyển sinh', pages: 240, processed: '2026-06-16', status: 'processing', accuracy: 0, docType: 'ZIP', size: '120 MB' },
];

export default function OCRDashboard() {
  const { t } = useTranslation('ocr');
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'review'>('all');

  const OCR_STATS = [
    { label: t('dashboard.totalScanned'), value: '12,847', change: t('dashboard.newScanned', {count:'1,240'}), icon: <ScanSearch className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.success'), value: '11,920', sub: t('dashboard.accuracy', {percent:'92.8'}), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { label: t('dashboard.needsReview'), value: '927', sub: t('dashboard.needsHumanReview', {percent:'7.2'}), icon: <Clock className="h-5 w-5" />, color: 'warning' },
    { label: t('dashboard.ocrErrors'), value: '0', sub: '0%', icon: <AlertCircle className="h-5 w-5" />, color: 'info' },
  ];

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error'; label: string }> = {
    done: { variant: 'success', label: t('scanList.status.completed') },
    review: { variant: 'warning', label: t('scanList.status.review') },
    processing: { variant: 'neutral', label: t('scanList.status.processing') },
    failed: { variant: 'error', label: t('scanList.status.failed') },
  };

  const filtered = filter === 'review'
    ? DOCUMENTS.filter((d) => d.status === 'review')
    : DOCUMENTS;

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
        {OCR_STATS.map((s) => (
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
                const sc = STATUS_CONFIG[doc.status];
                return (
                  <tr key={doc.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                          <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </div>
                        <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{doc.type}</Badge></td>
                    <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))] tabular-nums">{doc.pages}</td>
                    <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{doc.processed}</td>
                    <td className="px-4 py-2.5">
                      {doc.accuracy > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                            <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: `${doc.accuracy}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${
                            doc.accuracy >= 97 ? 'text-[rgb(var(--success))]' : doc.accuracy >= 90 ? 'text-[rgb(var(--info))]' : 'text-[rgb(var(--warning))]'
                          }`}>
                            {doc.accuracy}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{doc.size}</td>
                    <td className="px-4 py-2.5"><Badge variant={sc.variant} size="sm">{sc.label}</Badge></td>
                    <td className="px-4 py-2.5">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/ocr/tai-lieu/${doc.id}`)}>{t('scanList.view')}</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
