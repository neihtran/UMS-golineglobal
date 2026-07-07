import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Plus, BarChart3 } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, DetailModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import CompetencyDetail from './CompetencyDetail';

const STANDARDS = [
  { id: 's1', code: 'CDIO-1.1', name: 'Thiết kế hệ thống phần mềm', dept: 'Khoa CNTT', level: 'Cấp 4', target: 3.8, avgScore: 3.72, n: 124, lastAssess: '2026-05-15', status: 'active' },
  { id: 's2', code: 'CDIO-2.1', name: 'Kỹ năng giao tiếp và làm việc nhóm', dept: 'Khoa Sư phạm', level: 'Cấp 3', target: 3.5, avgScore: 3.38, n: 98, lastAssess: '2026-05-20', status: 'active' },
  { id: 's3', code: 'CDIO-3.1', name: 'Tư duy phản biện và giải quyết vấn đề', dept: 'Khoa CNTT', level: 'Cấp 4', target: 3.6, avgScore: 3.25, n: 110, lastAssess: '2026-06-01', status: 'review' },
  { id: 's4', code: 'CDIO-3.2', name: 'Sử dụng ngoại ngữ chuyên ngành', dept: 'Khoa Ngoại ngữ', level: 'Cấp 3', target: 3.5, avgScore: 2.91, n: 86, lastAssess: '2026-04-10', status: 'warning' },
  { id: 's5', code: 'CDIO-4.1', name: 'Ứng dụng CNTT trong chuyên môn', dept: 'Khoa CNTT', level: 'Cấp 4', target: 4.0, avgScore: 3.60, n: 140, lastAssess: '2026-05-28', status: 'active' },
  { id: 's6', code: 'CDIO-2.2', name: 'Kỹ năng nghiên cứu khoa học', dept: 'Khoa Khoa học', level: 'Cấp 3', target: 3.2, avgScore: 2.75, n: 65, lastAssess: '2026-03-22', status: 'warning' },
  { id: 's7', code: 'CDIO-1.2', name: 'Phân tích và thiết kế cơ sở dữ liệu', dept: 'Khoa CNTT', level: 'Cấp 4', target: 3.7, avgScore: 3.65, n: 132, lastAssess: '2026-06-05', status: 'active' },
  { id: 's8', code: 'CDIO-4.2', name: 'Kỹ năng thuyết trình và truyền thông', dept: 'Khoa Kinh tế', level: 'Cấp 3', target: 3.4, avgScore: 3.41, n: 88, lastAssess: '2026-04-30', status: 'active' },
  { id: 's9', code: 'CDIO-1.3', name: 'Kiến thức nền tảng toán học', dept: 'Khoa CNTT', level: 'Cấp 3', target: 3.3, avgScore: 3.18, n: 95, lastAssess: '2026-05-10', status: 'active' },
  { id: 's10', code: 'CDIO-3.3', name: 'Kỹ năng quản lý dự án', dept: 'Khoa Kinh tế', level: 'Cấp 4', target: 3.6, avgScore: 3.22, n: 72, lastAssess: '2026-02-28', status: 'review' },
];

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Đạt chuẩn' },
  review: { variant: 'warning' as const, label: 'Đang xem xét' },
  warning: { variant: 'error' as const, label: 'Chưa đạt' },
};

const LEVEL_COLOR: Record<string, string> = {
  'Cấp 1': 'text-[rgb(var(--error))]',
  'Cấp 2': 'text-[rgb(var(--warning))]',
  'Cấp 3': 'text-[rgb(var(--info))]',
  'Cấp 4': 'text-[rgb(var(--success))]',
};

export default function CompetencyList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('all');

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedStandard = selectedId ? STANDARDS.find((s) => s.id === selectedId) : null;

  const filtered = STANDARDS.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'Tất cả' || s.dept === deptFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách chuẩn đầu ra"
        description={`${filtered.length} chuẩn đầu ra / năng lực trong hệ thống`}
        breadcrumbs={[{ label: 'DCE', href: '/dce' }, { label: 'Chuẩn đầu ra' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/dce/chuan-dau-ra/tao')}>Thêm chuẩn đầu ra</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên hoặc mã chuẩn..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'Khoa CNTT', 'Khoa Sư phạm', 'Khoa Ngoại ngữ', 'Khoa Khoa học', 'Khoa Kinh tế'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đạt chuẩn</option>
          <option value="review">Đang xem xét</option>
          <option value="warning">Chưa đạt</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Chuẩn đầu ra</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Khoa</TableHeadCell>
            <TableHeadCell>Cấp độ</TableHeadCell>
            <TableHeadCell className="text-right">Mục tiêu</TableHeadCell>
            <TableHeadCell className="text-right">Điểm TB</TableHeadCell>
            <TableHeadCell className="text-right">Mẫu số</TableHeadCell>
            <TableHeadCell>Đánh giá gần</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((s) => {
            const sc = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG];
            const diffColor = s.avgScore >= s.target ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]';
            return (
              <TableRow key={s.id}>
                <TableCell>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{s.name}</span>
                </TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{s.dept}</TableCell>
                <TableCell><span className={`text-xs font-semibold ${LEVEL_COLOR[s.level]}`}>{s.level}</span></TableCell>
                <TableCell numeric className="text-[rgb(var(--text-secondary))]">{s.target.toFixed(1)}</TableCell>
                <TableCell numeric>
                  <span className={`font-semibold ${diffColor}`}>{s.avgScore.toFixed(2)}</span>
                </TableCell>
                <TableCell numeric className="text-[rgb(var(--text-secondary))]">{s.n}</TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{s.lastAssess}</TableCell>
                <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<BarChart3 className="h-3.5 w-3.5" />} onClick={() => openDetail(s.id)}>Chi tiết</Button>
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
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedStandard ? selectedStandard.name : ''}
        description={selectedStandard ? `${selectedStandard.code} · ${selectedStandard.dept} · ${selectedStandard.level}` : ''}
        size="fullscreen"
      >
        {selectedStandard ? <CompetencyDetail id={selectedStandard.id} /> : null}
      </DetailModal>
    </div>
  );
}
