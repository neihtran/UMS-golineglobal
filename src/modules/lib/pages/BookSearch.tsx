import { useState } from 'react';
import {
  BookOpen,
  Search,
  Download,
  Star,
  BookMarked,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Select, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const BOOKS = [
  { id: 'b1', title: 'Nhập môn Lập trình Python', author: 'Nguyễn Văn A', isbn: '978-604-1234-01-1', category: 'Công nghệ', shelf: 'A-01-01', status: 'available', borrowed: 0, total: 5 },
  { id: 'b2', title: 'Cấu trúc Dữ liệu & Giải thuật', author: 'Trần Thị B', isbn: '978-604-1234-02-8', category: 'Công nghệ', shelf: 'A-02-03', status: 'borrowed', borrowed: 4, total: 5 },
  { id: 'b3', title: 'Giải tích 2', author: 'Lê Văn C', isbn: '978-604-1234-03-5', category: 'Toán học', shelf: 'B-01-01', status: 'available', borrowed: 2, total: 8 },
  { id: 'b4', title: 'Tiếng Anh Học thuật', author: 'Phạm Thu D', isbn: '978-604-1234-04-2', category: 'Ngoại ngữ', shelf: 'C-01-01', status: 'available', borrowed: 1, total: 10 },
  { id: 'b5', title: 'Vật lý Đại cương', author: 'Hoàng Văn E', isbn: '978-604-1234-05-9', category: 'Khoa học', shelf: 'D-01-01', status: 'reserved', borrowed: 3, total: 6 },
  { id: 'b6', title: 'Triết học Mác-Lênin', author: 'Đặng Thị F', isbn: '978-604-1234-06-6', category: 'Chính trị', shelf: 'E-01-01', status: 'available', borrowed: 0, total: 15 },
];

const CATEGORIES = ['Tất cả', 'Công nghệ', 'Toán học', 'Ngoại ngữ', 'Khoa học', 'Chính trị'];
const STATUSES: Record<string, { variant: 'success' | 'warning' | 'info'; label: string }> = {
  available: { variant: 'success', label: 'Có sẵn' },
  borrowed: { variant: 'warning', label: 'Đang mượn' },
  reserved: { variant: 'info', label: 'Đã đặt trước' },
};

export default function BookSearch() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');

  const filtered = BOOKS.filter((b) => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Tất cả' || b.category === category;
    const matchStatus = status === 'Tất cả' || b.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tìm kiếm Tài liệu"
        description="Tìm kiếm sách, tài liệu trong thư viện"
        breadcrumbs={[{ label: 'LIB' }, { label: 'Tìm kiếm' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Star className="h-4 w-4" />}>Đã lưu</Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input
                type="text"
                placeholder="Tìm theo tên sách, tác giả, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 pl-9 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none"
              />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES.map(c => ({ value: c, label: c }))} className="w-40" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[
              { value: 'Tất cả', label: 'Tất cả' }, { value: 'available', label: 'Có sẵn' }, { value: 'borrowed', label: 'Đang mượn' }, { value: 'reserved', label: 'Đã đặt trước' }
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tên sách</TableHeadCell>
                <TableHeadCell>Tác giả</TableHeadCell>
                <TableHeadCell>Danh mục</TableHeadCell>
                <TableHeadCell>Kệ sách</TableHeadCell>
                <TableHeadCell>Tình trạng</TableHeadCell>
                <TableHeadCell>Còn lại</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmpty colSpan={7} message="Không tìm thấy tài liệu" />
              ) : (
                paged.map((b) => (
                  <TableRow key={b.id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[rgb(var(--primary))]" />
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{b.title}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">ISBN: {b.isbn}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{b.author}</TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{b.category}</Badge></TableCell>
                    <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{b.shelf}</TableCell>
                    <TableCell><Badge variant={STATUSES[b.status]?.variant ?? 'neutral'} size="sm">{STATUSES[b.status]?.label}</Badge></TableCell>
                    <TableCell className="text-sm">{b.total - b.borrowed}/{b.total}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" leftIcon={<BookMarked className="h-4 w-4" />}>Đặt mượn</Button>
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
