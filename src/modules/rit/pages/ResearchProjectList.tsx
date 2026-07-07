import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, FlaskConical, Users,
  DollarSign, AlertTriangle, Clock,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, Card, CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useResearchProjectList } from '@/hooks/useRit';
import type { ResearchProject } from '@/services/rit.service';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  ongoing: { variant: 'success', label: 'Đang thực hiện' },
  completed: { variant: 'info', label: 'Hoàn thành' },
  proposal: { variant: 'warning', label: 'Chờ phê duyệt' },
  approved: { variant: 'warning', label: 'Đã duyệt' },
  suspended: { variant: 'error', label: 'Tạm dừng' },
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
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('Tất cả');
  const [status, setStatus] = useState('all');

  const { data: projectsResult, isLoading } = useResearchProjectList({
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const projects: ResearchProject[] = ((projectsResult as any)?.data ?? []) as ResearchProject[];
  const total = ((projectsResult as any)?.pagination?.total ?? 0) as number;

  const filtered = projects.filter((p) => {
    const match = !search || (p.title?.toLowerCase().includes(search.toLowerCase()) || false) || (p.code?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchDept = dept === 'Tất cả' || p.department === dept;
    const matchStatus = status === 'all' || p.status === status;
    return match && matchDept && matchStatus;
  });

  const activeCount = projects.filter(p => p.status === 'ongoing').length;
  const pendingCount = projects.filter(p => p.status === 'proposal' || p.status === 'approved').length;
  const totalBudget = projects.reduce((s, p) => s + (p.approvedBudget || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đề tài Nghiên cứu"
        description="RIT-01 — Quản lý đề tài NCKH từ đăng ký đến nghiệm thu và công bố"
        breadcrumbs={[{ label: 'RIT', href: '/rit' }, { label: 'Đề tài NCKH' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/rit/nckh/tao')}>Đăng ký đề tài</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng đề tài', value: total, icon: <FlaskConical className="h-5 w-5" />, color: 'primary' },
          { label: 'Đang thực hiện', value: activeCount, icon: <Clock className="h-5 w-5" />, color: 'success' },
          { label: 'Chờ phê duyệt', value: pendingCount, icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
          { label: 'Tổng kinh phí', value: fmtBudget(totalBudget), icon: <DollarSign className="h-5 w-5" />, color: 'accent' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
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
          <option value="proposal">Chờ phê duyệt</option>
        </select>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6"><p className="text-sm text-[rgb(var(--text-muted))]">Đang tải danh sách đề tài...</p></CardContent></Card>
      ) : (
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
            {filtered.length === 0 ? (
              <TableEmpty colSpan={9} message="Không tìm thấy đề tài nào" />
            ) : (
              filtered.map((p) => {
                const sc = STATUS_CONFIG[p.status] || { variant: 'neutral' as const, label: p.status };
                const lc = LEVEL_CONFIG[p.field] || { color: 'text-gray-600' };
                return (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{p.code}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="font-medium text-[rgb(var(--text-primary))] line-clamp-2">{p.title}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{p.field}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[rgb(var(--text-secondary))]">{p.leaderName}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{p.department}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold ${lc.color}`}>{p.projectType}</span>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{p.durationMonths ? `${p.durationMonths} tháng` : ''}</p>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[rgb(var(--text-secondary))]">{fmtBudget(p.approvedBudget || 0)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{p.memberIds?.length || 0}</span>
                      </div>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{p.reportCount || 0} báo cáo</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                          <div className="h-full rounded-full bg-[rgb(var(--primary))] transition-all" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">{p.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/rit/nckh/${p._id}`)}>Xem</Button>
                        <Button variant="ghost" size="sm">Chi tiết</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {!isLoading && (
        <TablePagination
          page={pagination.page} pageSize={pagination.pageSize} total={total}
          onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}
    </div>
  );
}
