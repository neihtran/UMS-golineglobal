import { useState } from 'react';
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Select, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useDocumentList } from '@/hooks/useDms';
import { usePagination } from '@/hooks';
import { useTranslation } from 'react-i18next';

const STATUSES: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; labelKey: string }> = {
  pending: { variant: 'warning', labelKey: 'status.pendingApprove' },
  approved: { variant: 'success', labelKey: 'status.approved' },
  rejected: { variant: 'error', labelKey: 'status.rejected' },
  published: { variant: 'info', labelKey: 'status.published' },
};

const STATS_CONFIG = [
  { key: 'statsPending', icon: <Clock className="h-5 w-5" />, color: 'warning' },
  { key: 'statsUrgent', icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
  { key: 'statsApprovedToday', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
  { key: 'statsRejectedWeek', icon: <XCircle className="h-5 w-5" />, color: 'neutral' },
] as const;

const TABLE_HEADERS = [
  'table.maVb',
  'common.title',
  'common.type',
  'common.dept',
  'common.creator',
  'table.han',
  'common.status',
  'common.action',
] as const;

const STATUS_SELECT_OPTIONS = [
  { value: 'all', labelKey: 'approval.filterAll' },
  { value: 'pending', labelKey: 'approval.filterPending' },
  { value: 'approved', labelKey: 'approval.filterApproved' },
  { value: 'rejected', labelKey: 'approval.filterRejected' },
  { value: 'published', labelKey: 'approval.filterPublished' },
] as const;

export default function ApprovalList() {
  const { t } = useTranslation('dms');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Tất cả');
  const [status, setStatus] = useState('pending');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const { data, isLoading } = useDocumentList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    urgency: urgentOnly ? 'urgent' : undefined,
    status: status !== 'all' ? status : undefined,
  });

  const list = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const statValues = [
    String(list.filter((d: any) => d.status === 'pending').length),
    String(list.filter((d: any) => d.urgency === 'urgent' && d.status === 'pending').length),
    '2',
    '1',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('approval.title')}
        description={t('approval.description')}
        breadcrumbs={[{ label: 'DMS' }, { label: t('approval.breadcrumb') }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('approval.exportList')}</Button>
            <Button leftIcon={<Filter className="h-4 w-4" />}>{t('approval.advancedFilter')}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS_CONFIG.map((s, i) => (
          <Card key={s.key}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t(`approval.${s.key}`)}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{isLoading ? '—' : statValues[i]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input
                type="text"
                placeholder={t('approval.searchPlaceholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 pl-9 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none"
              />
            </div>
            <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} options={[
              { value: 'Tất cả', label: t('approval.filterTypeAll') },
              { value: 'Quyết định', label: 'Quyết định' },
              { value: 'Thông báo', label: 'Thông báo' },
              { value: 'Kế hoạch', label: 'Kế hoạch' },
              { value: 'Báo cáo', label: 'Báo cáo' },
              { value: 'Hướng dẫn', label: 'Hướng dẫn' },
            ]} className="w-40" />
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={
              STATUS_SELECT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.value === 'all' ? t('approval.filterAll') : t(opt.labelKey) }))
            } className="w-36" />
            <Button
              variant={urgentOnly ? 'primary' : 'outline'}
              size="sm"
              onClick={() => { setUrgentOnly(!urgentOnly); setPage(1); }}
              leftIcon={<AlertTriangle className="h-4 w-4" />}
            >
              {t('approval.urgentOnly')}
            </Button>
          </div>

          {isLoading ? (
            <TableEmpty colSpan={8} message={t('common:common.loading')} />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {TABLE_HEADERS.map((h, i) => (
                    <TableHeadCell key={h}>{i === TABLE_HEADERS.length - 1 ? '' : t(h)}</TableHeadCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableEmpty colSpan={8} message={t('empty.noResults')} />
                ) : (
                  list.map((d: any) => {
                    const sc = STATUSES[d.status] ?? { variant: 'neutral' as const, labelKey: `status.${d.status}` };
                    return (
                      <TableRow key={d._id ?? d.id} className={`hover:bg-[rgb(var(--bg-hover))] ${d.urgency === 'urgent' && d.status === 'pending' ? 'bg-[rgb(var(--error)/0.03)]' : ''}`}>
                        <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{d.code ?? '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {d.urgency === 'urgent' && <AlertTriangle className="h-4 w-4 text-[rgb(var(--error))]" />}
                            <p className={`text-sm font-medium ${d.urgency === 'urgent' ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-primary))]'}`}>{d.title ?? d.name ?? '—'}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="neutral" size="sm">{d.type ?? d.category ?? '—'}</Badge></TableCell>
                        <TableCell className="text-sm">{d.department?.name ?? d.createdBy ?? '—'}</TableCell>
                        <TableCell className="text-sm">{d.createdByName ?? d.creator ?? '—'}</TableCell>
                        <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{d.deadline ?? d.dueDate ?? '—'}</TableCell>
                        <TableCell><Badge variant={sc.variant} size="sm">{t(sc.labelKey, { defaultValue: d.status })}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>{t('approval.view')}</Button>
                            {d.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />}>{t('approval.approve')}</Button>
                                <Button variant="ghost" size="sm" leftIcon={<XCircle className="h-4 w-4" />}>{t('approval.reject')}</Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </CardContent>
      </Card>
    </div>
  );
}
