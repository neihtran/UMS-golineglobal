import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, Plus, Star, Edit2, Eye } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const COURSES = [
  { id: 'c1', code: 'CS101', name: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', dept: 'Khoa CNTT', semester: '2026-1', credits: 4, students: 312, enrolled: 298, completion: 78, rating: 4.8, status: 'published' },
  { id: 'c2', code: 'MATH201', name: 'Giải tích 2', instructor: 'PGS.TS. Lê Thị Lan', dept: 'Khoa CNTT', semester: '2026-1', credits: 4, students: 280, enrolled: 265, completion: 65, rating: 4.5, status: 'published' },
  { id: 'c3', code: 'ENG301', name: 'Tiếng Anh Học thuật', instructor: 'ThS. Trần Hoàng Nam', dept: 'Khoa Ngoại ngữ', semester: '2026-1', credits: 3, students: 245, enrolled: 240, completion: 72, rating: 4.6, status: 'published' },
  { id: 'c4', code: 'PHYS101', name: 'Vật lý Đại cương', instructor: 'TS. Bùi Minh Tuấn', dept: 'Khoa Khoa học', semester: '2026-1', credits: 4, students: 198, enrolled: 190, completion: 58, rating: 4.2, status: 'published' },
  { id: 'c5', code: 'CHEM101', name: 'Hóa học Đại cương', instructor: 'PGS.TS. Đặng Văn Minh', dept: 'Khoa Khoa học', semester: '2026-1', credits: 3, students: 165, enrolled: 160, completion: 81, rating: 4.7, status: 'published' },
  { id: 'c6', code: 'CS201', name: 'Cơ sở dữ liệu', instructor: 'TS. Hoàng Thu Lan', dept: 'Khoa CNTT', semester: '2026-2', credits: 3, students: 0, enrolled: 0, completion: 0, rating: 0, status: 'draft' },
];

const STATUS_CONFIG = {
  published: { variant: 'success' as const, label: 'Đã xuất bản' },
  draft: { variant: 'neutral' as const, label: 'Nháp' },
  archived: { variant: 'warning' as const, label: 'Lưu trữ' },
  closed: { variant: 'error' as const, label: 'Đã đóng' },
};

export default function CourseList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dept, setDept] = useState('Tất cả');

  const filtered = COURSES.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || c.status === status;
    const matchDept = dept === 'Tất cả' || c.dept === dept;
    return matchSearch && matchStatus && matchDept;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách khóa học"
        description={`${filtered.length} khóa học trong hệ thống`}
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Khóa học' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất Excel</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/lms/khoa-hoc/tao'}>Tạo khóa học</Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên hoặc mã khóa học..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-64"
          />
        </div>
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'Khoa CNTT', 'Khoa Ngoại ngữ', 'Khoa Khoa học', 'Khoa Kinh tế'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Nháp</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Khóa học</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Giảng viên</TableHeadCell>
            <TableHeadCell>Khoa</TableHeadCell>
            <TableHeadCell className="text-right">SV đăng ký</TableHeadCell>
            <TableHeadCell className="text-right">Hoàn thành</TableHeadCell>
            <TableHeadCell>Rating</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((course) => {
            const sc = STATUS_CONFIG[course.status as keyof typeof STATUS_CONFIG];
            return (
              <TableRow key={course.id}>
                <TableCell>
                  <Link to={`/lms/khoa-hoc/${course.id}`} className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                      {course.code.slice(0, 2)}
                    </div>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{course.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{course.code}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{course.instructor}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{course.dept}</TableCell>
                <TableCell numeric className="text-[rgb(var(--text-secondary))]">
                  {course.students > 0 ? `${course.enrolled}/${course.students}` : '—'}
                </TableCell>
                <TableCell numeric>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                      <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: `${course.completion}%` }} />
                    </div>
                    <span className="text-xs text-[rgb(var(--text-muted))] w-10 text-right">{course.completion}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {course.rating > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{course.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                  )}
                </TableCell>
                <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => window.location.href = `/lms/khoa-hoc/${course.id}`}>Xem</Button>
                    <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => window.location.href = `/lms/khoa-hoc/${course.id}/sua`}>Sửa</Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size: number) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
