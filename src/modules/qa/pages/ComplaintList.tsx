import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Download, Plus } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
  Card,
  CardContent,
  Select,
  TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, useComplaintList } from '@/hooks';
import type { ComplaintFilters } from '@/services/qa.service';

const CATEGORIES_KEYS = ['all', 'academic', 'administrative', 'facility', 'service', 'other'];

export default function ComplaintList() {
  const { t } = useTranslation('qa');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');

  const debouncedSearch = useDebounce(search, 400);

  const filters: ComplaintFilters = useMemo(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    type: category !== 'all' ? category : undefined,
    priority: priority !== 'all' ? priority : undefined,
    status: status !== 'all' ? status : undefined,
  }), [pagination.page, pagination.pageSize, debouncedSearch, category, priority, status]);

  const { data, isLoading } = useComplaintList(filters);

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const CATEGORIES = [t('filter.all'), t('complaint.cat.teaching'), t('complaint.cat.tuition'), t('complaint.cat.facility'), t('complaint.cat.admission'), t('complaint.cat.dormitory'), t('complaint.cat.other')];
  const PRIORITIES = [t('filter.all'), t('priority.high'), t('priority.medium'), t('priority.low')];

  const PRIORITY_VARIANTS: Record<string, 'error' | 'warning' | 'info'> = {
    high: 'error',
    urgent: 'error',
    normal: 'warning',
    medium: 'warning',
    low: 'info',
  };

  const STATUSES: Record<string, { variant: 'success' | 'warning' | 'info' | 'error'; label: string }> = {
    received: { variant: 'info', label: t('complaint.status.pending') },
    investigating: { variant: 'warning', label: t('complaint.status.processing') },
    pending_response: { variant: 'warning', label: t('complaint.status.processing') },
    resolved: { variant: 'success', label: t('complaint.status.resolved') },
    closed: { variant: 'success', label: t('complaint.status.resolved') },
    escalated: { variant: 'error', label: t('complaint.status.rejected') },
  };

  const CATEGORY_LABELS: Record<string, string> = {
    academic: t('complaint.cat.teaching'),
    administrative: t('complaint.cat.tuition'),
    facility: t('complaint.cat.facility'),
    service: t('complaint.cat.admission'),
    other: t('complaint.cat.other'),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('complaint.title')}
        description={t('complaint.description')}
        breadcrumbs={[{ label: 'QA' }, { label: t('complaint.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('complaint.create')}</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input
                placeholder={t('complaint.searchPlaceholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              options={CATEGORIES_KEYS.map((k, i) => ({ value: k, label: CATEGORIES[i] }))}
              className="w-44"
            />
            <Select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              options={['all', 'high', 'urgent', 'normal', 'low'].map((k, i) => ({ value: k, label: PRIORITIES[Math.min(i, 3)] }))}
              className="w-36"
            />
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              options={[
                { value: 'all', label: t('filter.all') },
                { value: 'received', label: t('complaint.status.pending') },
                { value: 'investigating', label: t('complaint.status.processing') },
                { value: 'pending_response', label: t('complaint.status.processing') },
                { value: 'resolved', label: t('complaint.status.resolved') },
                { value: 'escalated', label: t('complaint.status.rejected') },
              ]}
              className="w-36"
            />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>{t('table.code')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.complainant')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.category')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.content')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.priority')}</TableHeadCell>
                <TableHeadCell>{t('table.date')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.handler')}</TableHeadCell>
                <TableHeadCell>{t('table.status')}</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableSkeleton colSpan={9} />
            ) : items.length === 0 ? (
              <TableEmpty colSpan={9} message={t('complaint.empty')} />
            ) : (
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c._id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{c._id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.complainantName ?? c.complainantId}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{c.departmentName ?? c.department}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{CATEGORY_LABELS[c.type] ?? c.type}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-[rgb(var(--text-secondary))]">{c.description}</TableCell>
                    <TableCell><Badge variant={PRIORITY_VARIANTS[c.priority] ?? 'info'} size="sm">{t(`priority.${c.priority}`)}</Badge></TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—'}</TableCell>
                    <TableCell className="text-sm">{c.assignedToName ?? c.assignedTo ?? '—'}</TableCell>
                    <TableCell><Badge variant={STATUSES[c.status]?.variant ?? 'neutral'} size="sm">{STATUSES[c.status]?.label ?? c.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => navigate(`/qa/khieu-nai/${c._id}`)}>{t('table.detail')}</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
