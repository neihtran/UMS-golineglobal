import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw, Globe, Eye } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, DetailModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import IntegrationDetail from './IntegrationDetail';

const INTEGRATIONS = [
  { id: 'i1', name: 'HEMIS API', type: 'ERP', direction: 'bidirectional', status: 'active', uptime: 99.8, lastSync: '5 phút trước', eventsToday: 1240, desc: 'Đồng bộ dữ liệu sinh viên, nhân sự, đào tạo', retries: 0 },
  { id: 'i2', name: 'Học trực tuyến LMS', type: 'LMS', direction: 'pull', status: 'active', uptime: 99.2, lastSync: '2 phút trước', eventsToday: 480, desc: 'Nhận kết quả học tập, điểm thi, tiến độ', retries: 0 },
  { id: 'i3', name: 'Email University', type: 'Email', direction: 'push', status: 'active', uptime: 100, lastSync: '1 phút trước', eventsToday: 124, desc: 'Gửi thông báo, nhắc nhở, newsletter', retries: 0 },
  { id: 'i4', name: 'Cổng thông tin PORTAL', type: 'Portal', direction: 'bidirectional', status: 'active', uptime: 99.5, lastSync: '3 phút trước', eventsToday: 85, desc: 'Hiển thị tin tức, thông báo, dữ liệu công khai', retries: 0 },
  { id: 'i5', name: 'Thi trực tuyến EXAM', type: 'Exam', direction: 'pull', status: 'active', uptime: 98.7, lastSync: '10 phút trước', eventsToday: 62, desc: 'Lấy danh sách thi, gửi kết quả thi', retries: 2 },
  { id: 'i6', name: 'Thư viện số LIB', type: 'Library', direction: 'pull', status: 'warning', uptime: 95.2, lastSync: '1 giờ trước', eventsToday: 28, desc: 'Tra cứu tài liệu, lịch sử mượn trả', retries: 8 },
  { id: 'i7', name: 'API Tuyển sinh Bộ', type: 'Government', direction: 'push', status: 'active', uptime: 100, lastSync: '30 phút trước', eventsToday: 3, desc: 'Gửi dữ liệu tuyển sinh lên hệ thống Bộ GD&ĐT', retries: 0 },
  { id: 'i8', name: 'Hệ thống KTX', type: 'KTX', direction: 'bidirectional', status: 'warning', uptime: 94.1, lastSync: '2 giờ trước', eventsToday: 15, desc: 'Đồng bộ danh sách sinh viên ở KTX', retries: 5 },
  { id: 'i9', name: 'Chatbot hỗ trợ SV', type: 'LMS', direction: 'pull', status: 'active', uptime: 99.9, lastSync: '30 giây trước', eventsToday: 340, desc: 'Tự động trả lời thắc mắc sinh viên 24/7', retries: 0 },
  { id: 'i10', name: 'Hệ thống hóa đơn điện tử', type: 'FIN', direction: 'push', status: 'active', uptime: 99.4, lastSync: '15 phút trước', eventsToday: 56, desc: 'Gửi hóa đơn điện tử qua VNPT/eSMS', retries: 1 },
];

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'info' | 'warning' | 'success'> = {
  ERP: 'primary', LMS: 'accent', Email: 'info', Portal: 'warning',
  Exam: 'primary', Library: 'accent', Government: 'info', KTX: 'warning', FIN: 'success',
};

const DIR_LABEL: Record<string, string> = {
  bidirectional: '↔',
  pull: '←',
  push: '→',
};

const DIR_TOOLTIP: Record<string, string> = {
  bidirectional: 'Hai chiều',
  pull: 'Pull',
  push: 'Push',
};

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Hoạt động' },
  warning: { variant: 'warning' as const, label: 'Cảnh báo' },
  inactive: { variant: 'neutral' as const, label: 'Tắt' },
};

export default function IntegrationList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('all');
  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });

  const selectedIntegration = selectedId ? INTEGRATIONS.find((i) => i.id === selectedId) : null;

  const filtered = INTEGRATIONS.filter((i) => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'Tất cả' || i.type === typeFilter;
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tích hợp"
        description={`${filtered.length} kết nối tích hợp trong hệ thống`}
        breadcrumbs={[{ label: 'INT', href: '/int' }, { label: 'Tích hợp' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>Sync all</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Thêm tích hợp</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên tích hợp..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'ERP', 'LMS', 'Email', 'Portal', 'Exam', 'Library', 'Government', 'KTX', 'FIN'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="warning">Cảnh báo</option>
          <option value="inactive">Tắt</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Tích hợp</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Hướng</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right">Uptime</TableHeadCell>
            <TableHeadCell>Sync gần</TableHeadCell>
            <TableHeadCell className="text-right">Sự kiện/hôm</TableHeadCell>
            <TableHeadCell>Retries</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((i) => {
            const sc = STATUS_CONFIG[i.status as keyof typeof STATUS_CONFIG];
            return (
              <TableRow key={i.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                      <Globe className="h-4 w-4 text-[rgb(var(--primary))]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{i.name}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))] max-w-[250px] truncate">{i.desc}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant={TYPE_BADGE[i.type] || 'neutral'} size="sm">{i.type}</Badge></TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-bold text-[rgb(var(--text-secondary))]" title={DIR_TOOLTIP[i.direction]}>
                    {DIR_LABEL[i.direction]}
                  </span>
                </TableCell>
                <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {i.uptime}%
                </TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{i.lastSync}</TableCell>
                <TableCell className="text-right text-xs text-[rgb(var(--text-secondary))]">{i.eventsToday.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className={`text-xs font-semibold ${i.retries > 5 ? 'text-[rgb(var(--error))]' : i.retries > 0 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--text-muted))]'}`}>
                    {i.retries}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(i.id)}>Chi tiết</Button>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate('/int/nhat-ky')}>Log</Button>
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
        title={selectedIntegration ? selectedIntegration.name : ''}
        description={selectedIntegration ? selectedIntegration.desc : ''}
        size="fullscreen"
      >
        {selectedId ? <IntegrationDetail id={selectedId} /> : null}
      </DetailModal>
    </div>
  );
}
