import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Plus, Eye, Globe } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, Modal, Input, Select } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const PROJECTS = [
  { id: 'p1', code: 'NCKH-2026-001', title: 'Ứng dụng AI trong phát hiện gian lận thi cử', leader: 'PGS.TS. Nguyễn Hoàng Long', dept: 'Khoa CNTT', level: 'Cấp Bộ', budget: 850000000, status: 'active', progress: 65, deadline: '2026-12-31', field: 'AI & Giáo dục', members: 5 },
  { id: 'p2', code: 'NCKH-2026-002', title: 'Nghiên cứu năng lượng tái tạo cho vùng nông thôn', leader: 'TS. Bùi Minh Tuấn', dept: 'Khoa Khoa học', level: 'Cấp Bộ', budget: 1200000000, status: 'active', progress: 40, deadline: '2027-06-30', field: 'Năng lượng', members: 4 },
  { id: 'p3', code: 'NCKH-2026-007', title: 'Phát triển hệ thống học trực tuyến cho vùng sâu', leader: 'ThS. Lê Thị Lan', dept: 'Khoa Sư phạm', level: 'Cấp trường', budget: 320000000, status: 'active', progress: 80, deadline: '2026-09-30', field: 'Giáo dục', members: 3 },
  { id: 'p4', code: 'NCKH-2025-015', title: 'Khảo sát thị trường lao động cho sinh viên tốt nghiệp', leader: 'TS. Trần Hoàng Nam', dept: 'Khoa Kinh tế', level: 'Cấp trường', budget: 280000000, status: 'review', progress: 95, deadline: '2026-06-30', field: 'Kinh tế', members: 3 },
  { id: 'p5', code: 'NCKH-2024-008', title: 'NCKH vật liệu composite từ phụ phẩm nông nghiệp', leader: 'PGS.TS. Đặng Văn Minh', dept: 'Khoa Khoa học', level: 'Cấp Bộ', budget: 1800000000, status: 'done', progress: 100, deadline: '2025-12-31', field: 'Vật liệu', members: 6 },
  { id: 'p6', code: 'NCKH-2026-003', title: 'Phân tích dữ liệu lớn trong quản lý bệnh viện', leader: 'TS. Phạm Thị Hương', dept: 'Khoa CNTT', level: 'Cấp Bộ', budget: 920000000, status: 'active', progress: 55, deadline: '2026-10-31', field: 'Y tế', members: 4 },
  { id: 'p7', code: 'NCKH-2025-020', title: 'Ứng dụng IoT trong nông nghiệp thông minh', leader: 'ThS. Lê Văn Đức', dept: 'Khoa Khoa học', level: 'Cấp trường', budget: 450000000, status: 'review', progress: 88, deadline: '2026-07-15', field: 'IoT', members: 3 },
  { id: 'p8', code: 'NCKH-2026-011', title: 'Hợp tác quốc tế: Đổi mới giáo dục STEM', leader: 'PGS.TS. Nguyễn Thị Mai', dept: 'Khoa Sư phạm', level: 'Cấp trường', budget: 210000000, status: 'active', progress: 30, deadline: '2027-03-31', field: 'Giáo dục', members: 4 },
  { id: 'p9', code: 'NCKH-2025-009', title: 'Mô hình dự báo tài chính bằng Machine Learning', leader: 'TS. Trần Văn Kiên', dept: 'Khoa Kinh tế', level: 'Cấp Bộ', budget: 620000000, status: 'done', progress: 100, deadline: '2026-04-30', field: 'Tài chính', members: 3 },
  { id: 'p10', code: 'NCKH-2026-005', title: 'Nghiên cứu đa dạng sinh học rừng ngập mặn', leader: 'PGS.TS. Đặng Văn Minh', dept: 'Khoa Khoa học', level: 'Cấp trường', budget: 380000000, status: 'active', progress: 72, deadline: '2027-01-31', field: 'Môi trường', members: 5 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Đang thực hiện' },
  review: { variant: 'warning', label: 'Nghiệm thu' },
  done: { variant: 'info', label: 'Hoàn thành' },
};

const LEVEL_BADGE: Record<string, 'error' | 'warning' | 'neutral'> = {
  'Cấp Bộ': 'error',
  'Cấp trường': 'warning',
};

export default function ResearchList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('Tất cả');
  const [htqtModal, setHtqtModal] = useState(false);

  const filtered = PROJECTS.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchLevel = levelFilter === 'Tất cả' || p.level === levelFilter;
    return matchSearch && matchStatus && matchLevel;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const formatBudget = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách đề tài NCKH"
        description={`${filtered.length} đề tài nghiên cứu trong hệ thống`}
        breadcrumbs={[{ label: 'RIT', href: '/rit' }, { label: 'Đề tài NCKH' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất Excel</Button>
            <Button variant="outline" leftIcon={<Globe className="h-4 w-4" />} onClick={() => setHtqtModal(true)}>Tạo hoạt động HTQT</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/rit/de-tai/tao')}>Đăng ký đề tài mới</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên hoặc mã đề tài..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'Cấp Bộ', 'Cấp trường'].map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang thực hiện</option>
          <option value="review">Nghiệm thu</option>
          <option value="done">Hoàn thành</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Đề tài</TableHeadCell>
            <TableHeadCell>Mã</TableHeadCell>
            <TableHeadCell>Chủ nhiệm</TableHeadCell>
            <TableHeadCell>Khoa</TableHeadCell>
            <TableHeadCell>Lĩnh vực</TableHeadCell>
            <TableHeadCell>Cấp</TableHeadCell>
            <TableHeadCell>Kinh phí</TableHeadCell>
            <TableHeadCell>Tiến độ</TableHeadCell>
            <TableHeadCell>Hạn</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((p) => {
            const sc = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG];
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                      {p.code.slice(-3)}
                    </div>
                    <span className="font-medium text-[rgb(var(--text-primary))] max-w-[280px] truncate">{p.title}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{p.code}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.leader}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.dept}</TableCell>
                <TableCell><Badge variant="neutral" size="sm">{p.field}</Badge></TableCell>
                <TableCell><Badge variant={LEVEL_BADGE[p.level]} size="sm">{p.level}</Badge></TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{formatBudget(p.budget)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="h-1.5 w-14 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.progress === 100 ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--primary))]'}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-[rgb(var(--text-muted))] w-9 text-right">{p.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{p.deadline}</TableCell>
                <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/rit/hop-tac/${p.id}`)}>Xem</Button>
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

      {/* Modal: Tạo hoạt động HTQT */}
      <Modal open={htqtModal} onClose={() => setHtqtModal(false)} title="Tạo hoạt động hợp tác quốc tế" size="lg">
        <div className="space-y-4">
          <Input label="Tên hoạt động / sự kiện" placeholder="VD: Hội thảo AI quốc tế lần 3..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Đối tác quốc tế" placeholder="VD: Đại học Tokyo, MIT..." />
            <Select
              label="Quốc gia"
              options={[
                { value: 'jp', label: 'Nhật Bản' },
                { value: 'kr', label: 'Hàn Quốc' },
                { value: 'de', label: 'Đức' },
                { value: 'fr', label: 'Pháp' },
                { value: 'us', label: 'Mỹ' },
                { value: 'au', label: 'Úc' },
                { value: 'th', label: 'Thái Lan' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Loại hình"
              options={[
                { value: 'hoi-thao', label: 'Hội thảo quốc tế' },
                { value: 'trao-doi', label: 'Trao đổi sinh viên' },
                { value: 'nckh', label: 'Hợp tác nghiên cứu' },
                { value: 'dao-tao', label: 'Chương trình đào tạo' },
              ]}
            />
            <Input label="Lĩnh vực" placeholder="VD: CNTT, Kinh tế, STEM..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày bắt đầu" type="date" />
            <Input label="Ngày kết thúc" type="date" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Địa điểm" placeholder="VD: Tokyo, Nhật Bản" />
            <Input label="Người phụ trách" placeholder="Họ tên, chức danh" />
          </div>
          <Input label="Kinh phí (VND)" placeholder="VD: 200.000.000" />
          <Input label="Mô tả / Ghi chú" placeholder="Mô tả chi tiết nội dung hoạt động..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setHtqtModal(false)}>Hủy</Button>
            <Button onClick={() => setHtqtModal(false)}>Tạo hoạt động</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
