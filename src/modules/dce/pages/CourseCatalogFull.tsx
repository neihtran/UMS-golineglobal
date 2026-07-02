import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, BookOpen, Users,
  CheckCircle2, TrendingUp,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const COURSES = [
  { id: 'c01', code: 'DCE-2026-001', title: 'Nền tảng An toàn thông tin cho người bắt đầu', domain: 'CNTT', level: 'Sơ cấp', format: 'E-learning', duration: '20 tiếng', students: 156, completionRate: 72, status: 'published', instructor: 'GS.TS. Nguyễn Hoàng Long' },
  { id: 'c02', code: 'DCE-2026-002', title: 'Phát triển ứng dụng web với React', domain: 'CNTT', level: 'Trung cấp', format: 'E-learning', duration: '30 tiếng', students: 98, completionRate: 65, status: 'published', instructor: 'TS. Thảo Nguyễn' },
  { id: 'c03', code: 'DCE-2026-003', title: 'Tiếng Anh giao tiếp học thuật (IELTS 6.5+)', domain: 'Ngoại ngữ', level: 'Trung cấp', format: 'Hybrid', duration: '45 tiếng', students: 203, completionRate: 80, status: 'published', instructor: 'TS. Ngô Thanh Sơn' },
  { id: 'c04', code: 'DCE-2026-004', title: 'Kỹ năng mềm cho nhà nghiên cứu', domain: 'Nghiên cứu', level: 'Cao cấp', format: 'Workshop', duration: '16 tiếng', students: 45, completionRate: 95, status: 'published', instructor: 'PGS.TS. Lý Văn Hùng' },
  { id: 'c05', code: 'DCE-2025-008', title: 'Phân tích dữ liệu với Python', domain: 'CNTT', level: 'Trung cấp', format: 'E-learning', duration: '25 tiếng', students: 78, completionRate: 58, status: 'published', instructor: 'TS. Trần Thị Mai Lan' },
  { id: 'c06', code: 'DCE-2026-005', title: 'Marketing số cho doanh nghiệp SME', domain: 'Kinh doanh', level: 'Sơ cấp', format: 'E-learning', duration: '18 tiếng', students: 134, completionRate: 0, status: 'draft', instructor: 'TS. Bùi Đình Nam' },
];

const DOMAIN_COLORS: Record<string, string> = {
  'CNTT': '#2563EB',
  'Ngoại ngữ': '#7C3AED',
  'Nghiên cứu': '#059669',
  'Kinh doanh': '#D97706',
};

const LEVEL_CONFIG: Record<string, { variant: 'success' | 'info' | 'warning'; label: string }> = {
  'Sơ cấp': { variant: 'success', label: 'Sơ cấp' },
  'Trung cấp': { variant: 'info', label: 'Trung cấp' },
  'Cao cấp': { variant: 'warning', label: 'Cao cấp' },
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'neutral' | 'warning'; label: string }> = {
  published: { variant: 'success', label: 'Đã phát hành' },
  draft: { variant: 'neutral', label: 'Nháp' },
  archived: { variant: 'warning', label: 'Lưu trữ' },
};

export default function DCECourseCatalog() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('Tất cả');
  const [status, setStatus] = useState('all');

  const filtered = COURSES.filter((c) => {
    const match = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domain === 'Tất cả' || c.domain === domain;
    const matchStatus = status === 'all' || c.status === status;
    return match && matchDomain && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Danh mục Khóa học Nội bộ"
        description="DCE-01 — DigCompEdu, khóa đào tạo nội bộ, lộ trình năng lực số cho CBVC"
        breadcrumbs={[{ label: 'DCE', href: '/dce' }, { label: 'Khóa đào tạo' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh mục</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Tạo khóa học mới</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng khóa học', value: COURSES.length, icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
          { label: 'Đã phát hành', value: COURSES.filter(c => c.status === 'published').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: 'Đang theo học', value: COURSES.reduce((s, c) => s + c.students, 0), icon: <Users className="h-5 w-5" />, color: 'info' },
          { label: 'TB tiến độ', value: Math.round(COURSES.filter(c => c.status === 'published').reduce((s, c) => s + c.completionRate, 0) / COURSES.filter(c => c.status === 'published').length) + '%', icon: <TrendingUp className="h-5 w-5" />, color: 'accent' },
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
        <Input placeholder="Tìm theo tên, mã khóa..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={domain} onChange={(e) => { setDomain(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          {['Tất cả', 'CNTT', 'Ngoại ngữ', 'Nghiên cứu', 'Kinh doanh'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả</option>
          <option value="published">Đã phát hành</option>
          <option value="draft">Nháp</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Mã KH</TableHeadCell>
            <TableHeadCell>Tên khóa học</TableHeadCell>
            <TableHeadCell>Giảng viên</TableHeadCell>
            <TableHeadCell>Lĩnh vực</TableHeadCell>
            <TableHeadCell>Cấp độ</TableHeadCell>
            <TableHeadCell>Hình thức</TableHeadCell>
            <TableHeadCell className="text-center">HV</TableHeadCell>
            <TableHeadCell>Tiến độ</TableHeadCell>
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
              const lc = LEVEL_CONFIG[c.level];
              const domainColor = DOMAIN_COLORS[c.domain];
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{c.code}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="font-medium text-[rgb(var(--text-primary))] line-clamp-1">{c.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{c.duration}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.instructor}</TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm" style={{ borderLeftColor: domainColor, borderLeftWidth: 3 }}>
                      {c.domain}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant={lc.variant} size="sm">{lc.label}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.format}</TableCell>
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
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dce/khoa-dao-tao/${c.id}`)}>Xem</Button>
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
