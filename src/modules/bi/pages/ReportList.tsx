import { useState, useMemo } from 'react';
import { Download, Search, Plus, FileText, Database, Eye } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, TableEmpty, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, useReportList } from '@/hooks';
import type { ReportFilters } from '@/services/bi.service';

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'info' | 'warning' | 'success' | 'neutral'> = {
  enrollment: 'primary',
  academic: 'accent',
  financial: 'success',
  hr: 'warning',
  attendance: 'info',
  research: 'info',
  custom: 'neutral',
};

const TYPE_LABELS: Record<string, string> = {
  enrollment: 'Tuyển sinh',
  academic: 'Đào tạo',
  financial: 'Tài chính',
  hr: 'Nhân sự',
  attendance: 'Chấm công',
  research: 'Nghiên cứu',
  custom: 'Tùy chỉnh',
};

const FORMAT_BADGE: Record<string, 'success' | 'neutral' | 'info'> = {
  table: 'success',
  bar: 'neutral',
  line: 'neutral',
  pie: 'info',
  area: 'neutral',
  scatter: 'neutral',
  mixed: 'neutral',
};

export default function ReportList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 400);

  const filters: ReportFilters = useMemo(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  }), [pagination.page, pagination.pageSize, debouncedSearch, typeFilter]);

  const { data, isLoading } = useReportList(filters);

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách báo cáo"
        description={`${total} báo cáo / nguồn dữ liệu trong hệ thống`}
        breadcrumbs={[{ label: 'BI', href: '/bi' }, { label: 'Báo cáo' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất tất cả</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Tạo báo cáo mới</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên hoặc người tạo..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả loại</option>
          <option value="enrollment">Tuyển sinh</option>
          <option value="academic">Đào tạo</option>
          <option value="financial">Tài chính</option>
          <option value="hr">Nhân sự</option>
          <option value="attendance">Chấm công</option>
          <option value="research">Nghiên cứu</option>
          <option value="custom">Tùy chỉnh</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Báo cáo</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Nguồn dữ liệu</TableHeadCell>
            <TableHeadCell>Biểu đồ</TableHeadCell>
            <TableHeadCell>Người tạo</TableHeadCell>
            <TableHeadCell className="text-right">Lượt chạy</TableHeadCell>
            <TableHeadCell>Cập nhật</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        {isLoading ? (
          <TableSkeleton colSpan={8} />
        ) : items.length === 0 ? (
          <TableEmpty colSpan={8} message="Không tìm thấy báo cáo nào" />
        ) : (
          <TableBody>
            {items.map((r) => (
              <TableRow key={r._id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                      <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))] max-w-[240px] truncate">{r.title || r.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant={TYPE_BADGE[r.type] || 'neutral'} size="sm">{TYPE_LABELS[r.type] ?? r.type}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))]">
                    <Database className="h-3 w-3 text-[rgb(var(--text-muted))]" />
                    <span>{r.dataSource}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant={FORMAT_BADGE[r.chartType ?? 'table'] ?? 'neutral'} size="sm">{r.chartType ?? 'Bảng'}</Badge></TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{r.createdByName ?? r.createdBy}</TableCell>
                <TableCell numeric className="text-xs text-[rgb(var(--text-secondary))]">{r.runCount.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{r.lastRunAt ? new Date(r.lastRunAt).toLocaleDateString('vi-VN') : '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>Xem</Button>
                  </div>
                </TableCell>
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
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
