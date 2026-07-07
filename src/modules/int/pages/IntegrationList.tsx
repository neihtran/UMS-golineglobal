import { useState } from 'react';
import { Search, Plus, RefreshCw, Globe, Eye } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, useIntegrationList } from '@/hooks';

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'info' | 'warning' | 'success'> = {
  erp: 'primary', lms: 'accent', email: 'info', portal: 'warning',
  exam: 'primary', library: 'accent', government: 'info', ktx: 'warning', fin: 'success',
};

const DIR_TOOLTIP: Record<string, string> = {
  bidirectional: 'Hai chiều',
  pull: 'Pull',
  push: 'Push',
};

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Hoạt động' },
  warning: { variant: 'warning' as const, label: 'Cảnh báo' },
  inactive: { variant: 'neutral' as const, label: 'Tắt' },
};

export default function IntegrationList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useIntegrationList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    type: typeFilter !== 'Tất cả' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const integrations = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tích hợp"
        description={`${total} kết nối tích hợp trong hệ thống`}
        breadcrumbs={[{ label: 'INT', href: '/int' }, { label: 'Tích hợp' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>Sync all</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Thêm tích hợp</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên tích hợp..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'ERP', 'LMS', 'Email', 'Portal', 'Exam', 'Library', 'Government', 'KTX', 'FIN'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="warning">Cảnh báo</option>
          <option value="inactive">Tắt</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Tích hợp</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Hướng</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Uptime</TableHeadCell>
            <TableHeadCell>Sync gần</TableHeadCell>
            <TableHeadCell className="text-right">Sự kiện/hôm</TableHeadCell>
            <TableHeadCell>Retries</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        {isLoading ? (
          <TableSkeleton rows={pagination.pageSize} colSpan={9} />
        ) : (
          <TableBody>
            {integrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-sm text-[rgb(var(--text-muted))]">Không tìm thấy tích hợp nào</TableCell>
              </TableRow>
            ) : (
              integrations.map((i) => {
                const sc = STATUS_CONFIG[i.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
                return (
                  <TableRow key={i._id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                          <Globe className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{i.name}</p>
                          <p className="text-[10px] text-[rgb(var(--text-muted))] max-w-[250px] truncate">{i.description ?? '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={TYPE_BADGE[i.type] || 'neutral'} size="sm">{i.type.toUpperCase()}</Badge></TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-bold text-[rgb(var(--text-secondary))]" title={DIR_TOOLTIP[i.authMethod] ?? ''}>
                        {i.authMethod === 'oauth2' || i.authMethod === 'jwt' ? '↔' : i.authMethod === 'api_key' ? '→' : '←'}
                      </span>
                    </TableCell>
                    <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {i.config?.uptime ? `${i.config.uptime}%` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-[rgb(var(--text-secondary))]">
                      {i.lastSyncAt ? new Date(i.lastSyncAt).toLocaleString('vi-VN') : '—'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-[rgb(var(--text-secondary))]">
                      {(i.config?.eventsToday as number)?.toLocaleString() ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-xs font-semibold ${((i.config?.retries as number) ?? 0) > 5 ? 'text-[rgb(var(--error))]' : ((i.config?.retries as number) ?? 0) > 0 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--text-muted))]'}`}>
                        {(i.config?.retries as number) ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>Log</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        )}
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
