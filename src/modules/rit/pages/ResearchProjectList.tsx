import { useState } from 'react';
import {
  Plus, Download, FlaskConical, Users,
  DollarSign, AlertTriangle, Clock,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const PROJECTS = [
  { id: 'p01', code: 'NCKH-2026-001', title: 'Nghiên cứu ứng dụng AI trong chẩn đoán hình ảnh y tế', leader: 'PGS.TS. Lý Văn Hùng', dept: 'Khoa CNTT', level: 'Cấp trường', field: 'Trí tuệ nhân tạo', budget: 300000000, duration: '18 tháng', startDate: '2026-01-15', status: 'active', members: 5, publications: 3, progress: 45 },
  { id: 'p02', code: 'NCKH-2026-002', title: 'Xây dựng nền tảng kinh tế số cho doanh nghiệp vừa và nhỏ tại Việt Nam', leader: 'PGS.TS. Hoàng Thị Lan', dept: 'Khoa Kinh tế', level: 'Cấp Bộ', field: 'Kinh tế số', budget: 850000000, duration: '24 tháng', startDate: '2026-02-01', status: 'active', members: 8, publications: 5, progress: 30 },
  { id: 'p03', code: 'NCKH-2026-003', title: 'Phát triển hệ thống gợi ý học tập cá nhân hóa cho sinh viên đại học', leader: 'TS. Thảo Nguyễn', dept: 'Khoa CNTT', level: 'Cấp trường', field: 'Giáo dục số', budget: 200000000, duration: '12 tháng', startDate: '2026-03-01', status: 'active', members: 4, publications: 2, progress: 60 },
  { id: 'p04', code: 'NCKH-2025-015', title: 'Đánh giá hiệu quả của phương pháp giảng dạy tiếng Anh giao tiếp qua công nghệ', leader: 'TS. Ngô Thanh Sơn', dept: 'Khoa Sư phạm', level: 'Cấp trường', field: 'Giáo dục ngôn ngữ', budget: 150000000, duration: '12 tháng', startDate: '2025-09-01', status: 'completed', members: 3, publications: 4, progress: 100 },
  { id: 'p05', code: 'NCKH-2025-008', title: 'Nghiên cứu thị trường trái phiếu xanh tại Việt Nam và các nước ASEAN', leader: 'TS. Bùi Đình Nam', dept: 'Khoa Kinh tế', level: 'Cấp Bộ', field: 'Tài chính', budget: 600000000, duration: '24 tháng', startDate: '2025-03-01', status: 'active', members: 6, publications: 7, progress: 72 },
  { id: 'p06', code: 'NCKH-2024-012', title: 'Ứng dụng công nghệ blockchain trong quản lý văn bằng điện tử', leader: 'GS.TS. Nguyễn Hoàng Long', dept: 'Khoa CNTT', level: 'Cấp Nhà nước', field: 'An toàn thông tin', budget: 1200000000, duration: '36 tháng', startDate: '2024-06-01', status: 'active', members: 10, publications: 12, progress: 85 },
  { id: 'p07', code: 'NCKH-2026-004', title: 'Điều tra và phân tích xu hướng du lịch sinh thái tại các vườn quốc gia Việt Nam', leader: 'ThS. Lê Văn Minh', dept: 'Khoa Kinh tế', level: 'Cấp trường', field: 'Du lịch bền vững', budget: 120000000, duration: '9 tháng', startDate: '2026-04-01', status: 'pending', members: 3, publications: 0, progress: 0 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Đang thực hiện' },
  completed: { variant: 'info', label: 'Hoàn thành' },
  pending: { variant: 'warning', label: 'Chờ phê duyệt' },
  cancelled: { variant: 'error', label: 'Đã hủy' },
};

const LEVEL_CONFIG: Record<string, { color: string }> = {
  'Cấp Nhà nước': { color: 'text-red-600' },
  'Cấp Bộ': { color: 'text-amber-600' },
  'Cấp trường': { color: 'text-blue-600' },
};

function fmtBudget(v: number) {
  return (v / 1000000).toFixed(0) + ' triệu';
}

export default function ResearchProjectList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('Tất cả');
  const [status, setStatus] = useState('all');

  const filtered = PROJECTS.filter((p) => {
    const match = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'Tất cả' || p.dept === dept;
    const matchStatus = status === 'all' || p.status === status;
    return match && matchDept && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Đề tài Nghiên cứu"
        description="RIT-01 — Quản lý đề tài NCKH từ đăng ký đến nghiệm thu và công bố"
        breadcrumbs={[{ label: 'RIT', href: '/rit' }, { label: 'Đề tài NCKH' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Đăng ký đề tài</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng đề tài', value: PROJECTS.length, icon: <FlaskConical className="h-5 w-5" />, color: 'primary' },
          { label: 'Đang thực hiện', value: PROJECTS.filter(p => p.status === 'active').length, icon: <Clock className="h-5 w-5" />, color: 'success' },
          { label: 'Chờ phê duyệt', value: PROJECTS.filter(p => p.status === 'pending').length, icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
          { label: 'Tổng kinh phí', value: fmtBudget(PROJECTS.reduce((s, p) => s + p.budget, 0)), icon: <DollarSign className="h-5 w-5" />, color: 'accent' },
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
        <Input placeholder="Tìm theo tên, mã đề tài..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          {['Tất cả', 'Khoa CNTT', 'Khoa Kinh tế', 'Khoa Sư phạm', 'Khoa Ngoại ngữ'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả</option>
          <option value="active">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="pending">Chờ phê duyệt</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Mã đề tài</TableHeadCell>
            <TableHeadCell>Tên đề tài</TableHeadCell>
            <TableHeadCell>Chủ nhiệm</TableHeadCell>
            <TableHeadCell>Cấp độ</TableHeadCell>
            <TableHeadCell>Kinh phí</TableHeadCell>
            <TableHeadCell>Thành viên</TableHeadCell>
            <TableHeadCell>Tiến độ</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message="Không tìm thấy đề tài nào" />
          ) : (
            paged.map((p) => {
              const sc = STATUS_CONFIG[p.status];
              const lc = LEVEL_CONFIG[p.level];
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{p.code}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="font-medium text-[rgb(var(--text-primary))] line-clamp-2">{p.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{p.field}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{p.leader}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{p.dept}</p>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold ${lc.color}`}>{p.level}</span>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{p.duration}</p>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-[rgb(var(--text-secondary))]">{fmtBudget(p.budget)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{p.members}</span>
                    </div>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{p.publications} bài báo</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                        <div className="h-full rounded-full bg-[rgb(var(--primary))] transition-all progress-fill" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">Xem</Button>
                      <Button variant="ghost" size="sm">Chi tiết</Button>
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
