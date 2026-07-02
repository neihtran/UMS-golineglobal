import { useState } from 'react';
import { Download, Search, Plus, FileText, Database, Eye } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const REPORTS = [
  { id: 'r1', name: 'Báo cáo tuyển sinh 2026', type: 'Tuyển sinh', updated: '2026-06-20', frequency: 'Hàng tháng', format: 'PDF', views: 1240, dataSource: 'SIS + FIN', author: 'Phòng Đào tạo' },
  { id: 'r2', name: 'Dashboard tài chính Q2/2026', type: 'Tài chính', updated: '2026-06-18', frequency: 'Hàng quý', format: 'Live', views: 890, dataSource: 'FIN', author: 'Phòng Kế toán' },
  { id: 'r3', name: 'Báo cáo đầu ra sinh viên', type: 'Đào tạo', updated: '2026-06-15', frequency: 'Hàng năm', format: 'PDF', views: 567, dataSource: 'DCE + SIS', author: 'Phòng Đảm bảo CL' },
  { id: 'r4', name: 'Tỷ lệ thôi học theo ngành', type: 'Đào tạo', updated: '2026-06-10', frequency: 'Hàng kỳ', format: 'PDF', views: 430, dataSource: 'SIS', author: 'Phòng Đào tạo' },
  { id: 'r5', name: 'Báo cáo NCKH năm học 2025-2026', type: 'Nghiên cứu', updated: '2026-06-08', frequency: 'Hàng năm', format: 'PDF', views: 320, dataSource: 'RIT', author: 'Phòng KHCN' },
  { id: 'r6', name: 'Phân tích tuyển dụng & lương', type: 'Nhân sự', updated: '2026-06-05', frequency: 'Hàng quý', format: 'Live', views: 560, dataSource: 'HRM + FIN', author: 'Phòng Nhân sự' },
  { id: 'r7', name: 'Tình hình KTX học kỳ 2/2025-2026', type: 'Vận hành', updated: '2026-06-01', frequency: 'Hàng kỳ', format: 'PDF', views: 210, dataSource: 'KTX', author: 'Phòng Hành chính' },
  { id: 'r8', name: 'Kết quả thi trực tuyến học kỳ', type: 'Đào tạo', updated: '2026-05-28', frequency: 'Hàng kỳ', format: 'PDF', views: 780, dataSource: 'EXAM + SIS', author: 'Phòng Đào tạo' },
  { id: 'r9', name: 'Phân tích hoạt động văn bản', type: 'Văn phòng', updated: '2026-05-20', frequency: 'Hàng quý', format: 'PDF', views: 180, dataSource: 'DMS', author: 'Văn phòng' },
  { id: 'r10', name: 'Tổng hợp số liệu thư viện', type: 'Thư viện', updated: '2026-05-15', frequency: 'Hàng tháng', format: 'Live', views: 95, dataSource: 'LIB', author: 'Phòng Thư viện' },
  { id: 'r11', name: 'Báo cáo chất lượng giảng dạy', type: 'Chất lượng', updated: '2026-05-10', frequency: 'Hàng năm', format: 'PDF', views: 650, dataSource: 'QA + LMS', author: 'Phòng Đảm bảo CL' },
  { id: 'r12', name: 'Tổng hợp tích hợp hệ thống', type: 'Hệ thống', updated: '2026-06-22', frequency: 'Hàng tuần', format: 'Live', views: 45, dataSource: 'INT', author: 'Phòng CNTT' },
];

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'info' | 'warning' | 'success' | 'neutral'> = {
  'Tuyển sinh': 'primary', 'Tài chính': 'success', 'Đào tạo': 'accent', 'Nghiên cứu': 'info',
  'Nhân sự': 'warning', 'Vận hành': 'neutral', 'Văn phòng': 'neutral', 'Thư viện': 'info',
  'Chất lượng': 'accent', 'Hệ thống': 'primary',
};

const FORMAT_BADGE: Record<string, 'success' | 'neutral' | 'info'> = {
  'Live': 'success',
  'PDF': 'neutral',
  'Excel': 'info',
};

export default function ReportList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [formatFilter, setFormatFilter] = useState('Tất cả');

  const filtered = REPORTS.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'Tất cả' || r.type === typeFilter;
    const matchFormat = formatFilter === 'Tất cả' || r.format === formatFilter;
    return matchSearch && matchType && matchFormat;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách báo cáo"
        description={`${filtered.length} báo cáo / nguồn dữ liệu trong hệ thống`}
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
          {['Tất cả', 'Tuyển sinh', 'Tài chính', 'Đào tạo', 'Nghiên cứu', 'Nhân sự', 'Vận hành', 'Văn phòng', 'Thư viện', 'Chất lượng', 'Hệ thống'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={formatFilter} onChange={(e) => { setFormatFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'PDF', 'Live', 'Excel'].map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Báo cáo</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Nguồn dữ liệu</TableHeadCell>
            <TableHeadCell>Tần suất</TableHeadCell>
            <TableHeadCell>Định dạng</TableHeadCell>
            <TableHeadCell>Người tạo</TableHeadCell>
            <TableHeadCell className="text-right">Lượt xem</TableHeadCell>
            <TableHeadCell>Cập nhật</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                    <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                  </div>
                  <span className="text-sm font-medium text-[rgb(var(--text-primary))] max-w-[240px] truncate">{r.name}</span>
                </div>
              </TableCell>
              <TableCell><Badge variant={TYPE_BADGE[r.type] || 'neutral'} size="sm">{r.type}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))]">
                  <Database className="h-3 w-3 text-[rgb(var(--text-muted))]" />
                  <span>{r.dataSource}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{r.frequency}</TableCell>
              <TableCell><Badge variant={FORMAT_BADGE[r.format] || 'neutral'} size="sm">{r.format}</Badge></TableCell>
              <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{r.author}</TableCell>
              <TableCell numeric className="text-xs text-[rgb(var(--text-secondary))]">{r.views.toLocaleString()}</TableCell>
              <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{r.updated}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>Xem</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
