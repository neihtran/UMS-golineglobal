import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useEnrollmentList } from '@/hooks/useSis';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Đang học' },
  completed: { variant: 'info', label: 'Hoàn thành' },
  failed: { variant: 'error', label: 'Rớt' },
  dropped: { variant: 'neutral', label: 'Thôi học' },
};

export default function EnrollmentListPage() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useEnrollmentList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search,
    status: statusFilter || undefined,
  });
  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('enrollment.title')}
        description={t('enrollment.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('enrollment.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('enrollment.export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('enrollment.add')}</Button>
          </>
        }
      />

      <Card>
        <div className="p-5 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <label className="text-xs text-[rgb(var(--text-muted)] mb-1 block">{t('enrollment.search')}</label>
            <input
              type="text"
              placeholder={t('enrollment.searchPlaceholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
            />
          </div>
          <div>
            <label className="text-xs text-[rgb(var(--text-muted)] mb-1 block">{t('enrollment.status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
            >
              <option value="">{t('enrollment.allStatus')}</option>
              <option value="active">{STATUS_CONFIG.active.label}</option>
              <option value="completed">{STATUS_CONFIG.completed.label}</option>
              <option value="failed">{STATUS_CONFIG.failed.label}</option>
              <option value="dropped">{STATUS_CONFIG.dropped.label}</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>STT</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.student')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.subject')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.semester')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.score')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.status')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.actions')}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? null : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-sm text-[rgb(var(--text-muted)]">{t('enrollment.noData')}</TableCell>
              </TableRow>
            ) : items.map((item: any, i: number) => {
              const sc = STATUS_CONFIG[item.status] ?? { variant: 'neutral' as const, label: item.status };
              return (
                <TableRow key={item._id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary)]">{item.studentName || item.student?.name || '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted)]">{item.studentCode || item.student?.code || '—'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[rgb(var(--text-primary)]">{item.subjectName || item.subject?.name || '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted)]">{item.subjectCode || item.subject?.code || '—'}</p>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary)]">{item.semester || item.enrollmentYear || '—'}</TableCell>
                  <TableCell className="text-sm font-semibold text-[rgb(var(--text-primary)]">
                    {item.score != null ? `${item.score}/10` : '—'}
                  </TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => navigate(`/sis/enrollment/${item._id}`)}>
                      {t('enrollment.chiTiet')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Card>
    </div>
  );
}
