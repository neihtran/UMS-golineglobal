import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Select, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const ASSIGNMENTS = [
  { id: 'a1', course: 'Nhập môn Lập trình Python', title: 'Bài tập Chương 3: Vòng lặp', due: '2026-06-30', status: 'in-progress', grade: '—', submitted: false },
  { id: 'a2', course: 'Giải tích 2', title: 'Bài tập Tích phân xác định', due: '2026-06-28', status: 'submitted', grade: '8.5', submitted: true },
  { id: 'a3', course: 'Tiếng Anh Học thuật', title: 'Essay: Technology in Education', due: '2026-07-05', status: 'pending', grade: '—', submitted: false },
  { id: 'a4', course: 'Vật lý Đại cương', title: 'Thí nghiệm Động học', due: '2026-06-25', status: 'overdue', grade: '—', submitted: false },
  { id: 'a5', course: 'Cấu trúc Dữ liệu', title: 'Lab: Danh sách liên kết', due: '2026-07-02', status: 'graded', grade: '9.0', submitted: true },
];

const STATUSES: Record<string, { variant: 'success' | 'warning' | 'info' | 'error' | 'neutral'; label: string }> = {
  pending: { variant: 'neutral', label: 'Chưa nộp' },
  'in-progress': { variant: 'info', label: 'Đang làm' },
  submitted: { variant: 'warning', label: 'Đã nộp' },
  graded: { variant: 'success', label: 'Đã chấm' },
  overdue: { variant: 'error', label: 'Quá hạn' },
};

export default function StudentAssignments() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [courseFilter, setCourseFilter] = useState('Tất cả');

  const courses = ['Tất cả', ...Array.from(new Set(ASSIGNMENTS.map(a => a.course)))];
  const statuses = ['Tất cả', 'Chưa nộp', 'Đang làm', 'Đã nộp', 'Đã chấm', 'Quá hạn'];

  const filtered = ASSIGNMENTS.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || a.status === statusFilter;
    const matchCourse = courseFilter === 'Tất cả' || a.course === courseFilter;
    return matchSearch && matchStatus && matchCourse;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const stats = [
    { label: 'Tổng bài tập', value: String(ASSIGNMENTS.length), icon: <FileText className="h-5 w-5" />, color: 'primary' },
    { label: 'Đã nộp', value: String(ASSIGNMENTS.filter(a => a.submitted).length), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { label: 'Quá hạn', value: String(ASSIGNMENTS.filter(a => a.status === 'overdue').length), icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
    { label: 'Đang làm', value: String(ASSIGNMENTS.filter(a => a.status === 'in-progress').length), icon: <Clock className="h-5 w-5" />, color: 'info' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bài tập của tôi"
        description="Theo dõi và nộp bài tập theo từng môn học"
        breadcrumbs={[{ label: 'LMS' }, { label: 'Bài tập' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input
                type="text"
                placeholder="Tìm theo tên bài tập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 pl-9 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none"
              />
            </div>
            <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} options={courses.map(c => ({ value: c, label: c }))} className="w-52" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statuses.map(s => ({ value: s, label: s }))} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Môn học</TableHeadCell>
                <TableHeadCell>Bài tập</TableHeadCell>
                <TableHeadCell>Hạn nộp</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell>Điểm</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmpty colSpan={6} message="Không có bài tập" />
              ) : (
                paged.map((a) => (
                  <TableRow key={a.id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-sm font-medium">{a.course}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{a.title}</p>
                    </TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{a.due}</TableCell>
                    <TableCell><Badge variant={STATUSES[a.status]?.variant ?? 'neutral'} size="sm">{STATUSES[a.status]?.label}</Badge></TableCell>
                    <TableCell className="text-sm font-bold">{a.grade}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" leftIcon={a.submitted ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />} onClick={() => navigate(a.submitted ? `/lms/bai-tap/${a.id}/xem-bai-nop/sub_${a.id}_001` : `/lms/bai-tap/${a.id}/lam-bai`)}>
                        {a.submitted ? 'Xem' : 'Làm bài'}
                      </Button>
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
