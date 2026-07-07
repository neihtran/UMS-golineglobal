import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Upload, Eye, FileText } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, useOcrJobList } from '@/hooks';

const ACCURACY_COLOR = (acc: number) =>
  acc >= 97 ? 'success' : acc >= 90 ? 'info' : acc >= 80 ? 'warning' : 'error';

const STATUS_CONFIG = {
  completed: { variant: 'success' as const, label: 'Hoàn thành' },
  review: { variant: 'warning' as const, label: 'Cần rà soát' },
  processing: { variant: 'neutral' as const, label: 'Đang xử lý' },
  queued: { variant: 'neutral' as const, label: 'Đang chờ' },
  failed: { variant: 'error' as const, label: 'Lỗi' },
};

const SOURCE_COLORS: Record<string, string> = {
  HRM: 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]',
  SIS: 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]',
  RIT: 'bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]',
  DMS: 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]',
  FIN: 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]',
  LMS: 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]',
};

export default function ScanList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('Tất cả');

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useOcrJobList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    source: sourceFilter !== 'Tất cả' ? sourceFilter.toLowerCase() as 'upload' | 'scan' | 'url' : undefined,
  });

  const jobs = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tài liệu số hóa"
        description={`${total} tài liệu đã xử lý OCR trong hệ thống`}
        breadcrumbs={[{ label: 'OCR', href: '/ocr' }, { label: 'Tài liệu số hóa' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất dữ liệu</Button>
            <Button leftIcon={<Upload className="h-4 w-4" />}>Tải lên tài liệu</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên hoặc loại tài liệu..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'HRM', 'SIS', 'RIT', 'DMS', 'FIN', 'LMS'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Hoàn thành</option>
          <option value="review">Cần rà soát</option>
          <option value="processing">Đang xử lý</option>
          <option value="queued">Đang chờ</option>
          <option value="failed">Lỗi</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Tài liệu</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Nguồn</TableHeadCell>
            <TableHeadCell className="text-right">Trang</TableHeadCell>
            <TableHeadCell>Định dạng</TableHeadCell>
            <TableHeadCell>Kích thước</TableHeadCell>
            <TableHeadCell>Ngày xử lý</TableHeadCell>
            <TableHeadCell>Độ chính xác</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        {isLoading ? (
          <TableSkeleton rows={pagination.pageSize} colSpan={10} />
        ) : (
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-sm text-[rgb(var(--text-muted))]">Không tìm thấy tài liệu nào</TableCell>
              </TableRow>
            ) : (
              jobs.map((doc) => {
                const sc = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.queued;
                const confidence = doc.confidence ?? 0;
                return (
                  <TableRow key={doc._id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                          <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </div>
                        <span className="text-sm font-medium text-[rgb(var(--text-primary))] max-w-[220px] truncate">{doc.fileName ?? doc._id}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{doc.category ?? '—'}</Badge></TableCell>
                    <TableCell>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${SOURCE_COLORS[(doc.source ?? '').toUpperCase()] || 'bg-[rgb(var(--border))] text-[rgb(var(--text-secondary))]'}`}>
                        {doc.source?.toUpperCase() ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell numeric className="text-[rgb(var(--text-secondary))] tabular-nums">
                      {doc.processingTimeMs ? Math.round(doc.processingTimeMs / 1000) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-[rgb(var(--text-secondary))] font-mono">{doc.outputFormat ?? '—'}</TableCell>
                    <TableCell className="text-xs text-[rgb(var(--text-secondary))]">
                      {doc.processingTimeMs ? `${(doc.processingTimeMs / 1000).toFixed(1)}s` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-[rgb(var(--text-secondary))]">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </TableCell>
                    <TableCell>
                      {confidence > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                            <div className={`h-full rounded-full bg-[rgb(var(--${ACCURACY_COLOR(confidence)}))]`} style={{ width: `${confidence}%` }} />
                          </div>
                          <span className={`text-xs font-semibold text-[rgb(var(--${ACCURACY_COLOR(confidence)}))]`}>
                            {confidence.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                      )}
                    </TableCell>
                    <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/ocr/tai-lieu/${doc._id}`)}>Xem</Button>
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
