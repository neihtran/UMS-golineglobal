import { useState } from 'react';
import { Plus, Search, CheckCircle2, Clock, AlertTriangle, FileText, Edit2, Eye, Download } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableEmpty,
  DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import AssignmentView from './AssignmentView';

const ASSIGNMENTS = [
  { id: 'a1', courseCode: 'CS101', course: 'Nhập môn Lập trình Python', title: 'Bài tập tuần 3 — Vòng lặp', type: 'individual', instructor: 'TS. Nguyễn Văn Minh', due: '2026-06-30', maxScore: 10, submitted: 245, graded: 240, status: 'open', studentCount: 298 },
  { id: 'a2', courseCode: 'MATH201', course: 'Giải tích 2', title: 'Bài tập Tích phân xác định', type: 'individual', instructor: 'PGS.TS. Lê Thị Lan', due: '2026-06-28', maxScore: 10, submitted: 268, graded: 260, status: 'closed', studentCount: 265 },
  { id: 'a3', courseCode: 'CS101', course: 'Nhập môn Lập trình Python', title: 'Dự án nhóm — Xây dựng ứng dụng Todo', type: 'group', instructor: 'TS. Nguyễn Văn Minh', due: '2026-07-05', maxScore: 30, submitted: 72, graded: 0, status: 'open', studentCount: 298 },
  { id: 'a4', courseCode: 'ENG301', course: 'Tiếng Anh Học thuật', title: 'Essay: Technology in Education', type: 'individual', instructor: 'ThS. Trần Hoàng Nam', due: '2026-07-05', maxScore: 15, submitted: 198, graded: 0, status: 'open', studentCount: 240 },
  { id: 'a5', courseCode: 'PHYS101', course: 'Vật lý Đại cương', title: 'Thí nghiệm Động học', type: 'group', instructor: 'TS. Bùi Minh Tuấn', due: '2026-06-25', maxScore: 20, submitted: 190, graded: 185, status: 'closed', studentCount: 198 },
  { id: 'a6', courseCode: 'CHEM101', course: 'Hóa học Đại cương', title: 'Bài tập tuần 6 — Liên kết hóa học', type: 'individual', instructor: 'PGS.TS. Đặng Văn Minh', due: '2026-07-02', maxScore: 10, submitted: 155, graded: 0, status: 'open', studentCount: 165 },
  { id: 'a7', courseCode: 'CS201', course: 'Cấu trúc Dữ liệu', title: 'Lab: Danh sách liên kết', type: 'group', instructor: 'TS. Hoàng Thu Lan', due: '2026-07-10', maxScore: 25, submitted: 0, graded: 0, status: 'draft', studentCount: 95 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  open: { variant: 'success', label: 'Đang mở' },
  closed: { variant: 'neutral', label: 'Đã đóng' },
  draft: { variant: 'warning', label: 'Nháp' },
};

export default function LMSAssignmentList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('Tất cả');
  const [status, setStatus] = useState('all');

  const { selectedId, openDetail, close } = useDetailModal<string>({ size: 'fullscreen' });
  const selectedAssignment = selectedId ? ASSIGNMENTS.find((a) => a.id === selectedId) : null;

  const courses = ['Tất cả', ...Array.from(new Set(ASSIGNMENTS.map((a) => a.course)))];
  const statuses = ['all', 'open', 'closed', 'draft'];
  const statusLabels = { all: 'Tất cả', open: 'Đang mở', closed: 'Đã đóng', draft: 'Nháp' };

  const filtered = ASSIGNMENTS.filter((a) => {
    const match = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchCourse = course === 'Tất cả' || a.course === course;
    const matchStatus = status === 'all' || a.status === status;
    return match && matchCourse && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const stats = [
    { label: 'Tổng bài tập', value: ASSIGNMENTS.length, icon: <FileText className="h-5 w-5" />, color: 'primary' },
    { label: 'Đang mở', value: ASSIGNMENTS.filter((a) => a.status === 'open').length, icon: <Clock className="h-5 w-5" />, color: 'success' },
    { label: 'Đã đóng', value: ASSIGNMENTS.filter((a) => a.status === 'closed').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'neutral' },
    { label: 'Quá hạn chưa chấm', value: ASSIGNMENTS.filter((a) => a.status === 'closed' && a.submitted > a.graded).length, icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bài tập sinh viên"
        description={`${filtered.length} bài tập trên ${courses.length - 1} khóa học`}
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Bài tập sinh viên' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/lms/bai-tap/tao'}>Tạo bài tập mới</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm bài tập, mã khóa..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-64"
          />
        </div>
        <select value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {courses.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {statuses.map((s) => <option key={s} value={s}>{statusLabels[s as keyof typeof statusLabels]}</option>)}
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Mã KH</TableHeadCell>
            <TableHeadCell>Tên bài tập</TableHeadCell>
            <TableHeadCell>Giảng viên</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell className="text-right">Nộp / Tổng</TableHeadCell>
            <TableHeadCell className="text-right">Đã chấm</TableHeadCell>
            <TableHeadCell className="text-right">Điểm TB</TableHeadCell>
            <TableHeadCell>Hạn nộp</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message="Không tìm thấy bài tập nào" />
          ) : (
            paged.map((a) => {
              const sc = STATUS_CONFIG[a.status];
              const submitRate = a.studentCount > 0 ? Math.round((a.submitted / a.studentCount) * 100) : 0;
              const avgScore = a.graded > 0 ? (Math.random() * 3 + 6.5).toFixed(1) : '—';
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                      {a.courseCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))] max-w-xs truncate">{a.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{a.course}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.instructor}</TableCell>
                  <TableCell>
                    <Badge variant={a.type === 'group' ? 'accent' : 'neutral'} size="sm">
                      {a.type === 'group' ? 'Nhóm' : 'Cá nhân'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-[rgb(var(--text-primary))]">{a.submitted}</span>
                    <span className="text-[rgb(var(--text-muted))]">/{a.studentCount}</span>
                    <div className="h-1 w-12 rounded-full bg-[rgb(var(--border))] overflow-hidden ml-auto mt-1">
                      <div
                        className="h-full rounded-full bg-[rgb(var(--primary))]"
                        style={{ width: `${submitRate}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${a.graded < a.submitted ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--success))]'}`}>
                      {a.graded}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[rgb(var(--text-primary))]">{avgScore}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.due}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => openDetail(a.id)}>Xem</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                        onClick={() => window.location.href = `/lms/bai-tap/${a.id}/cham`}>Chấm</Button>
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

      {/* Detail Modal */}
      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedAssignment ? selectedAssignment.title : ''}
        description={selectedAssignment ? `${selectedAssignment.courseCode} · ${selectedAssignment.course}` : ''}
        size="fullscreen"
      >
        {selectedAssignment ? (
          <AssignmentView id={selectedAssignment.id} />
        ) : null}
      </DetailModal>
    </div>
  );
}
