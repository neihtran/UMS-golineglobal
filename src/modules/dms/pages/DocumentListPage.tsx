import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Eye } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';
import { useDocumentList } from '@/hooks/useDms';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error'; labelKey: string }> = {
  draft: { variant: 'neutral', labelKey: 'dms:status.draft' },
  pending_review: { variant: 'warning', labelKey: 'dms:status.pending' },
  reviewing: { variant: 'warning', labelKey: 'dms:status.reviewing' },
  pending_approval: { variant: 'warning', labelKey: 'dms:status.pending_approval' },
  approved: { variant: 'success', labelKey: 'dms:status.approved' },
  rejected: { variant: 'error', labelKey: 'dms:status.rejected' },
  published: { variant: 'success', labelKey: 'dms:status.published' },
  archived: { variant: 'neutral', labelKey: 'dms:status.archived' },
};

export default function DocumentListPage() {
  const { t } = useTranslation('dms');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading } = useDocumentList({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize,
  });

  const list = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  if (isLoading && list.length === 0) {
    return <div className="flex items-center justify-center h-64"><p className="text-[rgb(var(--text-muted))]">Đang tải...</p></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('document.list.title')}
        description={`${total} văn bản trong hệ thống`}
        breadcrumbs={[{ label: 'DMS', href: '/dms' }, { label: t('document.list.breadcrumbList') }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/dms/soan-thao')}>{t('document.list.newDraft')}</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('document.list.searchPlaceholder')}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{t(cfg.labelKey)}</option>
          ))}
        </select>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">Không có văn bản nào</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {[t('common.title'), t('common.status'), t('common.creator'), t('common.createdAt'), t('common.detail')].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {list.map((d: any) => {
                const sc = STATUS_CONFIG[d.status] || { variant: 'neutral' as const, labelKey: `dms:status.${d.status}` };
                return (
                  <tr key={d._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{d.title}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{d.documentNumber || d._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sc.variant} size="sm">{t(sc.labelKey)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{d.issuer || d.createdByName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        title={t('action.view')}
                        onClick={() => navigate(`/dms/cho-ky/${d._id}`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--primary)/0.08)] hover:text-[rgb(var(--primary))] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
