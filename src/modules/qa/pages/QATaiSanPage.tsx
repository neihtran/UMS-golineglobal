import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Monitor, Printer, Projector, Armchair, Truck,
  Search, Plus,
} from 'lucide-react';
import {
  Button, Input, Badge,
  Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
  Card, CardContent, TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useAssetList } from '@/hooks/useQa';
import type { QaAsset } from '@/services/qa.service';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'it': <Monitor className="h-4 w-4" />,
  'Thiết bị CNTT': <Monitor className="h-4 w-4" />,
  'av': <Projector className="h-4 w-4" />,
  'Thiết bị nghe nhìn': <Projector className="h-4 w-4" />,
  'furniture': <Armchair className="h-4 w-4" />,
  'Nội thất': <Armchair className="h-4 w-4" />,
  'vehicle': <Truck className="h-4 w-4" />,
  'Phương tiện': <Truck className="h-4 w-4" />,
  'specialized': <Printer className="h-4 w-4" />,
  'Thiết bị chuyên ngành': <Printer className="h-4 w-4" />,
};

const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export default function QATaiSanPage() {
  const { t } = useTranslation('qa');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: assetsResult, isLoading } = useAssetList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
  });

  const assets: QaAsset[] = ((assetsResult as any)?.data ?? []) as QaAsset[];
  const total = ((assetsResult as any)?.pagination?.total ?? 0) as number;

  const filtered = assets.filter((a) => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalValue = filtered.reduce((sum, a) => sum + (a.value || a.originalValue || 0), 0);
  const activeCount = filtered.filter((a) => a.status === 'active').length;
  const maintenanceCount = filtered.filter((a) => a.status === 'maintenance').length;

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
    active: { variant: 'success', label: t('asset.status.active') },
    maintenance: { variant: 'warning', label: t('asset.status.maintenance') },
    broken: { variant: 'error', label: t('asset.status.broken') },
    disposed: { variant: 'neutral', label: t('asset.status.disposed') },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('asset.title')}
        description={t('asset.description')}
        breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: t('asset.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>{t('filter.filter')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/qa/tai-san/tao')}>{t('asset.create')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('asset.statTotal'), value: total, color: 'primary' },
          { label: t('asset.statActive'), value: activeCount, color: 'success' },
          { label: t('asset.statMaintenance'), value: maintenanceCount, color: 'warning' },
          { label: t('asset.statValue'), value: fmt.format(totalValue), color: 'accent', isString: true },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('asset.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('filter.allStatus')}</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('asset.table.code')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.name')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.category')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.dept')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.quantity')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.value')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.depreciation')}</TableHeadCell>
            <TableHeadCell>{t('table.status')}</TableHeadCell>
            <TableHeadCell>{t('table.actions')}</TableHeadCell>
          </TableRow>
        </TableHead>
        {isLoading ? (
          <TableSkeleton rows={5} cols={9} />
        ) : (
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmpty colSpan={9} message={t('asset.empty')} />
            ) : filtered.map((a: QaAsset) => {
              const sc = STATUS_CONFIG[a.status] || { variant: 'neutral' as const, label: a.status };
              const icon = CATEGORY_ICONS[a.category || ''] ?? <Monitor className="h-4 w-4" />;
              return (
                <TableRow key={a._id}>
                  <TableCell className="text-[rgb(var(--text-muted))] font-mono text-xs">{a.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                        {icon}
                      </div>
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{a.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="neutral" size="sm">{a.category || '—'}</Badge></TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{a.department || '—'}</TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{a.quantity ?? 1} {a.unit || ''}</TableCell>
                  <TableCell className="text-sm font-medium text-[rgb(var(--text-primary))]">{fmt.format(a.value || a.originalValue || 0)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                        <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${a.depreciation || a.depreciationRate || 0}%` }} />
                      </div>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{a.depreciation || a.depreciationRate || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/qa/tai-san/${a._id}`)}>{t('table.detail')}</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        )}
      </Table>

      {!isLoading && (
        <TablePagination
          page={pagination.page} pageSize={pagination.pageSize} total={total}
          onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}
    </div>
  );
}
