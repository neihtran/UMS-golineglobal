import { useState } from 'react';
import { Plus, Play, Pause, BookOpen, Users, Clock, CheckCircle2 } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const COURSES = [
  { id: 'c01', code: 'INT1005', name: 'Nhập môn Tin học', instructor: 'Nguyễn Hoàng Long', dept: 'Khoa CNTT', students: 156, completionRate: 78, lessons: 24, duration: '45 tiếng', status: 'published', lastUpdate: '2026-06-20' },
  { id: 'c02', code: 'INT2201', name: 'Cấu trúc dữ liệu và Giải thuật', instructor: 'Trần Thị Mai Lan', dept: 'Khoa CNTT', students: 98, completionRate: 62, lessons: 32, duration: '60 tiếng', status: 'published', lastUpdate: '2026-06-18' },
  { id: 'c03', code: 'INT3110', name: 'Cơ sở dữ liệu', instructor: 'Lê Văn Minh', dept: 'Khoa CNTT', students: 112, completionRate: 45, lessons: 28, duration: '52 tiếng', status: 'published', lastUpdate: '2026-06-15' },
  { id: 'c04', code: 'INT3201', name: 'Mạng máy tính', instructor: 'Phạm Thu Hà', dept: 'Khoa CNTT', students: 87, completionRate: 0, lessons: 20, duration: '38 tiếng', status: 'draft', lastUpdate: '2026-06-01' },
  { id: 'c05', code: 'KT1001', name: 'Kinh tế vi mô', instructor: 'Bùi Đình Nam', dept: 'Khoa Kinh tế', students: 203, completionRate: 91, lessons: 18, duration: '36 tiếng', status: 'published', lastUpdate: '2026-06-22' },
  { id: 'c06', code: 'KT2002', name: 'Kinh tế vĩ mô', instructor: 'Hoàng Thị Lan', dept: 'Khoa Kinh tế', students: 198, completionRate: 83, lessons: 18, duration: '36 tiếng', status: 'published', lastUpdate: '2026-06-19' },
  { id: 'c07', code: 'NN1001', name: 'Tiếng Anh A1', instructor: 'Ngô Thanh Sơn', dept: 'Khoa Ngoại ngữ', students: 280, completionRate: 65, lessons: 40, duration: '75 tiếng', status: 'published', lastUpdate: '2026-06-10' },
  { id: 'c08', code: 'INT4001', name: 'Đồ án tốt nghiệp', instructor: 'Lý Văn Hùng', dept: 'Khoa CNTT', students: 42, completionRate: 20, lessons: 1, duration: 'Tự chọn', status: 'published', lastUpdate: '2026-06-05' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'neutral' | 'warning'; label: string }> = {
  published: { variant: 'success', label: 'Đang mở' },
  draft: { variant: 'neutral', label: 'Nháp' },
  archived: { variant: 'warning', label: 'Lưu trữ' },
};

export default function CourseContent() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('Tất cả');
  const [status, setStatus] = useState('all');

  const filtered = COURSES.filter((c) => {
    const match = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'Tất cả' || c.dept === dept;
    const matchStatus = status === 'all' || c.status === status;
    return match && matchDept && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Nội dung Khóa học"
        description="LMS-01 — Quản lý nội dung học liệu số SCORM/xAPI theo từng khóa học"
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Nội dung khóa học' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<BookOpen className="h-4 w-4" />} onClick={() => window.location.href = '/lms/thu-vien-hoc-lieu'}>Thư viện học liệu</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/lms/khoa-hoc/tao'}>Tạo khóa học mới</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng khóa học', value: 8, icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
          { label: 'Đang hoạt động', value: 7, icon: <Play className="h-5 w-5" />, color: 'success' },
          { label: 'Tổng học viên', value: '1.176', icon: <Users className="h-5 w-5" />, color: 'info' },
          { label: 'TB tiến độ', value: '58%', icon: <CheckCircle2 className="h-5 w-5" />, color: 'accent' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 hover-lift">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên, mã khóa học..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          {['Tất cả', 'Khoa CNTT', 'Khoa Kinh tế', 'Khoa Ngoại ngữ'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả</option>
          <option value="published">Đang mở</option>
          <option value="draft">Nháp</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Mã KH</TableHeadCell>
            <TableHeadCell>Tên khóa học</TableHeadCell>
            <TableHeadCell>Giảng viên</TableHeadCell>
            <TableHeadCell>Khoa</TableHeadCell>
            <TableHeadCell className="text-center">Học viên</TableHeadCell>
            <TableHeadCell>Tiến độ</TableHeadCell>
            <TableHeadCell>Bài học</TableHeadCell>
            <TableHeadCell>Thời lượng</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message="Không tìm thấy khóa học nào" />
          ) : (
            paged.map((c) => {
              const sc = STATUS_CONFIG[c.status];
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{c.code}</TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{c.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">Cập nhật: {c.lastUpdate}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.instructor}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.dept}</TableCell>
                  <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{c.students}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                        <div
                          className="h-full rounded-full bg-[rgb(var(--primary))] transition-all progress-fill"
                          style={{ width: `${c.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">{c.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[rgb(var(--text-secondary))]">
                      <BookOpen className="h-3.5 w-3.5" />
                      {c.lessons}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[rgb(var(--text-secondary))]">
                      <Clock className="h-3.5 w-3.5" />
                      {c.duration}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">Xem</Button>
                      {c.status === 'published' ? (
                        <Button variant="ghost" size="sm" leftIcon={<Pause className="h-3.5 w-3.5" />}>Tạm dừng</Button>
                      ) : (
                        <Button variant="ghost" size="sm" leftIcon={<Play className="h-3.5 w-3.5" />}>Mở</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
