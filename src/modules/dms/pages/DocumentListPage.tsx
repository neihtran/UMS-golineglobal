import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Clock, CheckCircle2, PenLine, Send, Eye } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useTranslation } from 'react-i18next';

const DOCS = [
  { id: 'd1', title: 'Quy chế đào tạo năm học 2026-2027', type: 'quy-chế', status: 'approved', createdAt: '2026-06-10', author: 'PGS.TS. Lê Thị Lan', sigs: 2 },
  { id: 'd2', title: 'Kế hoạch tuyển sinh HK1 2026-2027', type: 'ke-hoach', status: 'pending', createdAt: '2026-06-15', author: 'ThS. Trần Hoàng Nam', sigs: 0 },
  { id: 'd3', title: 'Báo cáo tổng kết năm học 2025-2026', type: 'bao-cao', status: 'draft', createdAt: '2026-06-18', author: 'TS. Nguyễn Văn Minh', sigs: 0 },
  { id: 'd4', title: 'Quy định về đào tạo từ xa', type: 'quy-chế', status: 'signed', createdAt: '2026-06-01', author: 'PGS. Đặng Văn Minh', sigs: 3 },
  { id: 'd5', title: 'Kế hoạch chi tiêu Q3/2026', type: 'ke-hoach', status: 'pending', createdAt: '2026-06-20', author: 'TS. Bùi Minh Tuấn', sigs: 1 },
];

const TYPE_CONFIG: Record<string, { labelKey: string; color: string }> = {
  'quy-chế': { labelKey: 'docType.qc', color: 'primary' },
  'ke-hoach': { labelKey: 'soanthaoMoi.typeKh', color: 'info' },
  'bao-cao': { labelKey: 'docType.bc', color: 'accent' },
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error'; labelKey: string; icon: React.ReactNode }> = {
  draft: { variant: 'neutral', labelKey: 'status.draft', icon: <PenLine className="h-3.5 w-3.5" /> },
  pending: { variant: 'warning', labelKey: 'status.pending', icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { variant: 'success', labelKey: 'status.approved', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  signed: { variant: 'success', labelKey: 'status.signed', icon: <Send className="h-3.5 w-3.5" /> },
};

export default function DocumentListPage() {
  const { t } = useTranslation('dms');
  const navigate = useNavigate();
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const types = ['all', ...Array.from(new Set(DOCS.map((d) => d.type)))];
  const filtered = DOCS.filter((d) => {
    const match = !search || d.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    return match && matchType;
  });
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const tableHeaderKeys = [
    'common.title',
    'common.type',
    'common.status',
    'common.creator',
    'common.createdAt',
    'common.signNumber',
    'common.detail',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('document.list.title')}
        description={t('document.list.description', { count: DOCS.length })}
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
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
        >
          {types.map((t_type) => (
            <option key={t_type} value={t_type}>
              {t_type === 'all' ? t('common.allTypes') : TYPE_CONFIG[t_type]?.labelKey ?? t_type}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {tableHeaderKeys.map((h, idx) => (
                <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide ${idx === tableHeaderKeys.length - 1 ? 'w-20 text-center !tracking-normal !normal-case' : ''}`}>
                  {idx === tableHeaderKeys.length - 1 ? t('common.detail') : t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {paged.map((d) => {
              const sc = STATUS_CONFIG[d.status];
              return (
                <tr key={d.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{d.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={TYPE_CONFIG[d.type].color as any} size="sm">{TYPE_CONFIG[d.type].labelKey}</Badge></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs">
                      {sc.icon}
                      <Badge variant={sc.variant} size="sm">{sc.labelKey}</Badge>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{d.author}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{d.createdAt}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--primary))]">{d.sigs}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      title={t('action.view')}
                      onClick={() => navigate(`/dms/cho-ky/${d.id}`)}
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
    </div>
  );
}
