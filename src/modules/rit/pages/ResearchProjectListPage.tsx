import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, FileText } from 'lucide-react';
import { Button, Badge, DetailModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import { TablePagination } from '@/components/ui';
import ResearchDetail from './ResearchDetail';

const PROJECTS = [
  { id: 'p1', code: 'NCKH001', title: 'Nghiên cứu ứng dụng AI trong giáo dục', type: 'NCKH', field: 'CNTT', leader: 'TS. Nguyễn Văn Minh', members: 4, budget: 200000000, status: 'active', start: '2026-01-15', end: '2026-12-30' },
  { id: 'p2', code: 'HTQT001', title: 'Hợp tác với ĐH Tokyo về nghiên cứu Data Science', type: 'HTQT', field: 'Toán học', leader: 'PGS.TS. Lê Thị Lan', members: 6, budget: 350000000, status: 'active', start: '2026-02-01', end: '2027-01-31' },
  { id: 'p3', code: 'NCKH002', title: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh', type: 'NCKH', field: 'Điện tử', leader: 'TS. Bùi Minh Tuấn', members: 3, budget: 150000000, status: 'pending', start: '2026-07-01', end: '2027-06-30' },
  { id: 'p4', code: 'NCKH003', title: 'Mô hình dự báo thời tiết sử dụng Deep Learning', type: 'NCKH', field: 'Vật lý', leader: 'TS. Hoàng Thu Lan', members: 5, budget: 180000000, status: 'completed', start: '2025-06-01', end: '2026-05-31' },
];

const TYPE_CONFIG: Record<string, { variant: 'accent' | 'info'; label: string }> = {
  NCKH: { variant: 'accent', label: 'NCKH' },
  HTQT: { variant: 'info', label: 'HTQT' },
};
const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error'; label: string }> = {
  active: { variant: 'success', label: 'Đang thực hiện' },
  pending: { variant: 'warning', label: 'Chờ phê duyệt' },
  completed: { variant: 'neutral', label: 'Hoàn thành' },
};

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export default function ResearchProjectListPage() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedProject = selectedId ? PROJECTS.find((p) => p.id === selectedId) : null;

  const filtered = PROJECTS.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()),
  );
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đề tài NCKH & HTQT"
        description={`${PROJECTS.length} đề tài`}
        breadcrumbs={[{ label: 'RIT', href: '/rit' }, { label: 'Đề tài' }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/rit/de-tai/tao')}>Tạo đề tài</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm đề tài..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {['Mã', 'Tên đề tài', 'Loại', 'Lĩnh vực', 'Chủ nhiệm', 'TV', 'Kinh phí', 'Trạng thái', 'Thao tác'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {paged.map((p) => (
              <tr key={p.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer">
                <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{p.code}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-primary))] max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-3"><Badge variant={TYPE_CONFIG[p.type].variant} size="sm">{TYPE_CONFIG[p.type].label}</Badge></td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{p.field}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{p.leader}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{p.members}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--error))]">{fmt(p.budget)}</td>
                <td className="px-4 py-3"><Badge variant={STATUS_CONFIG[p.status].variant} dot size="sm">{STATUS_CONFIG[p.status].label}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => openDetail(p.id)}>Chi tiết</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        title={selectedProject ? selectedProject.title : ''}
        description={selectedProject ? `${selectedProject.code} · ${selectedProject.field} · ${selectedProject.leader}` : ''}
        size="fullscreen"
      >
        {selectedProject ? <ResearchDetail id={selectedProject.id} /> : null}
      </DetailModal>
    </div>
  );
}
