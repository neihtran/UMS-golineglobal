import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Copy,
  Share2,
  Star,
  Filter,
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  Select,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const REPORTS = [
  { id: 'r1', name: 'Báo cáo Tuyển sinh theo khu vực', category: 'Tuyển sinh', type: 'bar', createdBy: 'Nguyễn Văn A', createdAt: '2026-06-20', lastRun: '2026-06-24', views: 45, starred: true },
  { id: 'r2', name: 'Thống kê Điểm thi theo khoa', category: 'Học vụ', type: 'line', createdBy: 'Trần Thị B', createdAt: '2026-06-15', lastRun: '2026-06-23', views: 32, starred: false },
  { id: 'r3', name: 'Tỷ lệ Đậu/Rớt theo ngành', category: 'Học vụ', type: 'pie', createdBy: 'Lê Văn C', createdAt: '2026-06-10', lastRun: '2026-06-22', views: 28, starred: true },
  { id: 'r4', name: 'Xu hướng Đăng ký học phần', category: 'Đào tạo', type: 'line', createdBy: 'Phạm Thu D', createdAt: '2026-06-05', lastRun: '2026-06-21', views: 19, starred: false },
  { id: 'r5', name: 'Phân bố Học lực theo lớp', category: 'Học vụ', type: 'bar', createdBy: 'Hoàng Văn E', createdAt: '2026-05-28', lastRun: '2026-06-20', views: 15, starred: false },
  { id: 'r6', name: 'Thống kê Thời khóa biểu', category: 'Đào tạo', type: 'table', createdBy: 'Đặng Thị F', createdAt: '2026-05-20', lastRun: '2026-06-19', views: 22, starred: true },
];

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

  const filtered = REPORTS.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Tất cả' || r.category === category;
    const matchType = type === 'Tất cả' || r.type === type;
    return matchSearch && matchCat && matchType;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

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
              <Input placeholder="Tìm theo tên báo cáo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES.map(c => ({ value: c, label: c }))} className="w-44" />
            <Select value={type} onChange={(e) => setType(e.target.value)} options={[
              { value: 'Tất cả', label: 'Tất cả loại' }, { value: 'bar', label: 'Biểu đồ cột' }, { value: 'line', label: 'Biểu đồ đường' }, { value: 'pie', label: 'Biểu đồ tròn' }, { value: 'table', label: 'Bảng số liệu' }
            ]} className="w-40" />
          </div>

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
              {paged.length === 0 ? (
                <TableEmpty colSpan={8} message="Chưa có báo cáo" />
              ) : (
                paged.map((r) => (
                  <TableRow key={r.id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell>
                      <button className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))]">
                        {r.starred ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{r.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">Tạo {r.createdAt}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{r.category}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))]">
                        {TYPES[r.type]?.icon}
                        {TYPES[r.type]?.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.createdBy}</TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{r.lastRun}</TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{r.views}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="Xem"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" title="Chỉnh sửa"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" title="Sao chép"><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" title="Chia sẻ"><Share2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </div>
  );
}
