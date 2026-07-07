import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit3, Copy, Share2, Star, Filter,
  BarChart3, TrendingUp, PieChart, FileText,
} from 'lucide-react';
import {
  Button, Input, Badge, Card, CardContent, Select,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TableEmpty, TablePagination,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useReportList } from '@/hooks/useBi';
import type { Report } from '@/services/bi.service';

const CATEGORIES = ['Tất cả', 'Tuyển sinh', 'Học vụ', 'Đào tạo', 'Tài chính', 'Cơ sở'];
const TYPES: Record<string, { icon: any; label: string }> = {
  bar: { icon: <BarChart3 className="h-3.5 w-3.5" />, label: 'Biểu đồ cột' },
  line: { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Biểu đồ đường' },
  pie: { icon: <PieChart className="h-3.5 w-3.5" />, label: 'Biểu đồ tròn' },
  table: { icon: <FileText className="h-3.5 w-3.5" />, label: 'Bảng số liệu' },
};

export default function BaoCaoList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [type, setType] = useState('Tất cả');

  const { data: reportsResult, isLoading } = useReportList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
  });

  const reports: Report[] = (reportsResult as any)?.data ?? [];
  const total = (reportsResult as any)?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thiết kế Báo cáo"
        description="Tạo và quản lý báo cáo phân tích dữ liệu theo nhu cầu"
        breadcrumbs={[{ label: 'BI' }, { label: 'Thiết kế báo cáo' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>Lọc</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/bi/bao-cao/tao')}>Tạo báo cáo mới</Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input placeholder="Tìm theo tên báo cáo..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} options={CATEGORIES.map(c => ({ value: c, label: c }))} className="w-44" />
            <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} options={[
              { value: 'Tất cả', label: 'Tất cả loại' }, { value: 'bar', label: 'Biểu đồ cột' }, { value: 'line', label: 'Biểu đồ đường' }, { value: 'pie', label: 'Biểu đồ tròn' }, { value: 'table', label: 'Bảng số liệu' }
            ]} className="w-40" />
          </div>

          {isLoading ? (
            <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Đang tải báo cáo...</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell></TableHeadCell>
                  <TableHeadCell>Tên báo cáo</TableHeadCell>
                  <TableHeadCell>Danh mục</TableHeadCell>
                  <TableHeadCell>Loại</TableHeadCell>
                  <TableHeadCell>Người tạo</TableHeadCell>
                  <TableHeadCell>Lần chạy cuối</TableHeadCell>
                  <TableHeadCell>Lượt xem</TableHeadCell>
                  <TableHeadCell></TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableEmpty colSpan={8} message="Chưa có báo cáo" />
                ) : (
                  reports.map((r) => (
                    <TableRow key={r._id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell>
                        <button className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))]">
                          <Star className={`h-4 w-4 ${r.favoriteCount > 0 ? 'fill-current' : ''}`} />
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{r.name || r.title}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">Tạo {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="neutral" size="sm">{r.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))]">
                          {TYPES[r.chartType || 'table']?.icon}
                          {TYPES[r.chartType || 'table']?.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{r.createdByName}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{r.lastRunAt ? new Date(r.lastRunAt).toLocaleDateString('vi-VN') : '—'}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{r.runCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="Xem" onClick={() => navigate(`/bi/bao-cao/${r._id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => navigate(`/bi/bao-cao/tao?id=${r._id}`)}><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" title="Sao chép"><Copy className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" title="Chia sẻ"><Share2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {!isLoading && (
            <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
