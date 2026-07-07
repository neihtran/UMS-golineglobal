import { useState, useMemo } from 'react';
import { Plus, Eye, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, useExamSessionList } from '@/hooks';
import type { ExamSessionFilters } from '@/services/exam.service';

export default function ExamMonitorList() {
  const { t } = useTranslation('exam');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const debouncedSearch = useDebounce(search, 400);

  const filters: ExamSessionFilters = useMemo(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    status: status !== 'all' ? status : undefined,
  }), [pagination.page, pagination.pageSize, debouncedSearch, status]);

  const { data, isLoading } = useExamSessionList(filters);

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'info' | 'neutral' | 'error'; label: string }> = {
    registered: { variant: 'info', label: t('examMonitorList.status.scheduled') },
    in_progress: { variant: 'success', label: t('examMonitorList.status.active') },
    submitted: { variant: 'neutral', label: t('examMonitorList.status.completed') },
    graded: { variant: 'neutral', label: t('examMonitorList.status.completed') },
    cancelled: { variant: 'error', label: t('examMonitorList.status.cancelled') },
    no_show: { variant: 'error', label: 'Vắng thi' },
  };

  const activeCount = items.filter(m => m.status === 'in_progress').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('examMonitorList.title')}
        description={t('examMonitorList.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard'), href: '/exam' }, { label: t('breadcrumb.examMonitorList') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<BarChart3 className="h-4 w-4" />}>{t('examMonitorList.report')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('examMonitorList.createSession')}</Button>
          </>
        }
      />

      {/* Live status banner */}
      {activeCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--success)/0.15)]">
            <div className="h-3 w-3 rounded-full bg-[rgb(var(--success))] animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-[rgb(var(--success))]">{t('examMonitorList.liveBanner.count', { count: activeCount })}</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{t('examMonitorList.liveBanner.realtime')}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('common.all')}</option>
          <option value="in_progress">{t('examMonitorList.status.active')}</option>
          <option value="registered">{t('examMonitorList.status.scheduled')}</option>
          <option value="submitted">{t('examMonitorList.status.completed')}</option>
          <option value="graded">{t('examMonitorList.status.completed')}</option>
          <option value="cancelled">{t('examMonitorList.status.cancelled')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('examMonitorList.table.examCode')}</TableHeadCell>
            <TableHeadCell>{t('examMonitorList.table.examName')}</TableHeadCell>
            <TableHeadCell>{t('examMonitorList.table.roomTime')}</TableHeadCell>
            <TableHeadCell>{t('examMonitorList.table.supervisor')}</TableHeadCell>
            <TableHeadCell className="text-center">Ghế</TableHeadCell>
            <TableHeadCell className="text-center">Bắt đầu</TableHeadCell>
            <TableHeadCell className="text-center">Kết thúc</TableHeadCell>
            <TableHeadCell className="text-center">Gian lận</TableHeadCell>
            <TableHeadCell>{t('common.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('common.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        {isLoading ? (
          <TableSkeleton colSpan={10} />
        ) : items.length === 0 ? (
          <TableEmpty colSpan={10} message={t('questionBankFull.empty.title')} />
        ) : (
          <TableBody>
            {items.map((m) => {
              const sc = STATUS_CONFIG[m.status];
              return (
                <TableRow key={m._id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{m.examTitle ? m.examTitle.slice(0, 12).toUpperCase() : m.examId.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{m.examTitle ?? m.examId}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{m.studentName ?? m.studentId} · {m.duration ? `${m.duration} phút` : '—'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{m.room ?? '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{m.seatNumber ? `Ghế ${m.seatNumber}` : '—'}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.invigilatorName ?? m.invigilatorId ?? '—'}</TableCell>
                  <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{m.seatNumber ?? '—'}</TableCell>
                  <TableCell className="text-center text-[rgb(var(--text-secondary))]">{m.startTime ? new Date(m.startTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</TableCell>
                  <TableCell className="text-center text-[rgb(var(--text-secondary))]">{m.endTime ? new Date(m.endTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</TableCell>
                  <TableCell className="text-center">
                    {m.cheatingFlags.length > 0 ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)] text-xs font-bold text-[rgb(var(--error))]">{m.cheatingFlags.length}</span>
                    ) : <span className="text-[rgb(var(--text-muted))]">0</span>}
                  </TableCell>
                  <TableCell><Badge variant={sc?.variant ?? 'neutral'} dot size="sm">{sc?.label ?? m.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                      {m.status === 'in_progress' ? t('common.monitor') : t('common.view')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        )}
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={total}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
