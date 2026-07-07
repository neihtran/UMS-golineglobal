import { useState } from 'react';
import {
  Search, Download, Plus, Globe, Users, CalendarDays,
  TrendingUp, Award,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
  Card,
  CardContent,
  Select,
  Modal,
  DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import NckhDetailPage from './NckhDetailPage';

const COUNTRIES = ['Tất cả', 'Nhật Bản', 'Hàn Quốc', 'Đức', 'Pháp', 'Mỹ', 'Úc', 'Thái Lan'];
const TYPES = ['Tất cả', 'Trao đổi sinh viên', 'Hợp tác nghiên cứu', 'Hội thảo quốc tế', 'Chương trình đào tạo', 'Dự án liên kết'];
const STATUSES = ['Tất cả', 'Đang hoạt động', 'Chuẩn bị', 'Đã kết thúc'];

const PARTNERS = [
  { id: 'p1', name: 'Đại học Tokyo', country: 'Nhật Bản', flag: '🇯🇵', type: 'Hợp tác nghiên cứu', startDate: '2024-03-15', endDate: '2027-03-14', status: 'active', leader: 'PGS.TS. Nguyễn Hoàng Long', participants: 12, budget: 850000000, field: 'CNTT & AI', moa: 'MOA-2024-001', progress: 65 },
  { id: 'p2', name: 'Đại học Quốc gia Seoul', country: 'Hàn Quốc', flag: '🇰🇷', type: 'Hợp tác nghiên cứu', startDate: '2025-01-10', endDate: '2028-01-09', status: 'active', leader: 'TS. Trần Thị Lan', participants: 8, budget: 1200000000, field: 'Kinh tế số', moa: 'MOA-2025-003', progress: 40 },
  { id: 'p3', name: 'TU9 Germany Alliance', country: 'Đức', flag: '🇩🇪', type: 'Chương trình đào tạo', startDate: '2023-09-01', endDate: '2026-08-31', status: 'active', leader: 'PGS.TS. Lê Văn Minh', participants: 24, budget: 2100000000, field: 'Kỹ thuật', moa: 'MOA-2023-007', progress: 78 },
  { id: 'p4', name: 'Sorbonne University', country: 'Pháp', flag: '🇫🇷', type: 'Trao đổi sinh viên', startDate: '2024-06-01', endDate: '2027-05-31', status: 'active', leader: 'TS. Hoàng Thu Hà', participants: 6, budget: 480000000, field: 'Ngôn ngữ', moa: 'MOA-2024-012', progress: 55 },
  { id: 'p5', name: 'MIT Open Learning', country: 'Mỹ', flag: '🇺🇸', type: 'Hội thảo quốc tế', startDate: '2026-02-01', endDate: '2026-11-30', status: 'active', leader: 'PGS.TS. Bùi Minh Tuấn', participants: 18, budget: 620000000, field: 'STEM', moa: 'MOA-2026-002', progress: 30 },
  { id: 'p6', name: 'University of Melbourne', country: 'Úc', flag: '🇦🇺', type: 'Dự án liên kết', startDate: '2025-07-01', endDate: '2028-06-30', status: 'active', leader: 'TS. Đặng Thị Mai', participants: 10, budget: 980000000, field: 'Nông nghiệp', moa: 'MOA-2025-009', progress: 25 },
  { id: 'p7', name: 'Chulalongkorn University', country: 'Thái Lan', flag: '🇹🇭', type: 'Hội thảo quốc tế', startDate: '2026-03-01', endDate: '2026-12-31', status: 'preparing', leader: 'ThS. Lê Hoàng Nam', participants: 15, budget: 350000000, field: 'Y tế', moa: 'MOA-2026-005', progress: 10 },
  { id: 'p8', name: 'Kyoto University', country: 'Nhật Bản', flag: '🇯🇵', type: 'Trao đổi sinh viên', startDate: '2022-04-01', endDate: '2026-03-31', status: 'ended', leader: 'TS. Phạm Văn Cường', participants: 20, budget: 750000000, field: 'Môi trường', moa: 'MOA-2022-004', progress: 100 },
];

const TYPE_CONFIG: Record<string, { variant: 'primary' | 'accent' | 'info' | 'warning' | 'neutral'; label: string }> = {
  'Hợp tác nghiên cứu': { variant: 'accent', label: 'Hợp tác NC' },
  'Chương trình đào tạo': { variant: 'primary', label: 'Đào tạo' },
  'Trao đổi sinh viên': { variant: 'info', label: 'Trao đổi SV' },
  'Hội thảo quốc tế': { variant: 'warning', label: 'Hội thảo' },
  'Dự án liên kết': { variant: 'neutral', label: 'Dự án liên kết' },
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  active: { variant: 'success', label: 'Đang hoạt động' },
  preparing: { variant: 'warning', label: 'Chuẩn bị' },
  ended: { variant: 'neutral', label: 'Đã kết thúc' },
};

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

const ACTIVE_PARTNERS = PARTNERS.filter(p => p.status !== 'ended').length;
const TOTAL_BUDGET = PARTNERS.reduce((s, p) => s + p.budget, 0);
const UPCOMING_EVENTS = [
  { date: '2026-07-15', event: 'Hội thảo AI quốc tế — ĐH Tokyo', location: 'Tokyo, Nhật Bản' },
  { date: '2026-08-22', event: 'Trao đổi sinh viên mùa thu — Sorbonne', location: 'Paris, Pháp' },
  { date: '2026-09-10', event: 'Hội nghị STEM quốc tế lần 5', location: 'Berlin, Đức' },
  { date: '2026-10-05', event: 'Giao lưu văn hóa KHU-UNIST', location: 'Ulsan, Hàn Quốc' },
];

export default function HopTacQuocTe() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('Tất cả');
  const [type, setType] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const [createModal, setCreateModal] = useState(false);

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedPartner = selectedId ? PARTNERS.find((p) => p.id === selectedId) : null;

  const filtered = PARTNERS.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.field.toLowerCase().includes(search.toLowerCase());
    const matchCountry = country === 'Tất cả' || p.country === country;
    const matchType = type === 'Tất cả' || p.type === type;
    const matchStatus = status === 'Tất cả' || (status === 'Đang hoạt động' && p.status === 'active') || (status === 'Chuẩn bị' && p.status === 'preparing') || (status === 'Đã kết thúc' && p.status === 'ended');
    return matchSearch && matchCountry && matchType && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">

      <PageHeader
        title="Hợp tác quốc tế"
        description={`${PARTNERS.length} đối tác từ ${new Set(PARTNERS.map(p => p.country)).size} quốc gia`}
        breadcrumbs={[{ label: 'RIT', href: '/rit' }, { label: 'Hợp tác quốc tế' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateModal(true)}>Tạo hợp tác mới</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đối tác quốc tế</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{PARTNERS.length}</p>
              <p className="text-xs text-[rgb(var(--success))]">{new Set(PARTNERS.map(p => p.country)).size} quốc gia</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đang hoạt động</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{ACTIVE_PARTNERS}</p>
              <p className="text-xs text-[rgb(var(--success))]">{Math.round(ACTIVE_PARTNERS / PARTNERS.length * 100)}% tổng</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Người tham gia</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{PARTNERS.reduce((s, p) => s + p.participants, 0)}</p>
              <p className="text-xs text-[rgb(var(--accent))]">giảng viên & sinh viên</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Tổng kinh phí</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">₫{(TOTAL_BUDGET / 1e9).toFixed(1)}T</p>
              <p className="text-xs text-[rgb(var(--info))]">cam kết HTQT</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>

        {/* Main table */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
                  <Input placeholder="Tìm đối tác, lĩnh vực..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
                </div>
                <Select value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} options={COUNTRIES.map(c => ({ value: c, label: c }))} className="w-40" />
                <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} options={TYPES.map(t => ({ value: t, label: t }))} className="w-52" />
                <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={STATUSES.map(s => ({ value: s, label: s }))} className="w-40" />
              </div>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeadCell>Đối tác</TableHeadCell>
                    <TableHeadCell>Quốc gia</TableHeadCell>
                    <TableHeadCell>Loại hình</TableHeadCell>
                    <TableHeadCell>Thời gian</TableHeadCell>
                    <TableHeadCell>Thành viên</TableHeadCell>
                    <TableHeadCell>Kinh phí</TableHeadCell>
                    <TableHeadCell>Tiến độ</TableHeadCell>
                    <TableHeadCell>Trạng thái</TableHeadCell>
                    <TableHeadCell></TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableEmpty colSpan={9} message="Không tìm thấy hợp tác nào" />
                  ) : (
                    paged.map((p) => {
                      const tc = TYPE_CONFIG[p.type];
                      const sc = STATUS_CONFIG[p.status];
                      return (
                        <TableRow key={p.id} className="hover:bg-[rgb(var(--bg-hover))]">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl" role="img" aria-label={p.country}>{p.flag}</span>
                              <div>
                                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{p.name}</p>
                                <p className="text-xs text-[rgb(var(--text-muted))]">{p.field}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{p.country}</TableCell>
                          <TableCell><Badge variant={tc.variant} size="sm">{tc.label}</Badge></TableCell>
                          <TableCell>
                            <p className="text-xs text-[rgb(var(--text-secondary))]">{p.startDate}</p>
                            <p className="text-xs text-[rgb(var(--text-muted))]">→ {p.endDate}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                              <span className="text-sm font-medium">{p.participants}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-[rgb(var(--error))]">{fmt(p.budget)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-end">
                              <div className="h-1.5 w-14 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[rgb(var(--primary))]"
                                  style={{ width: `${p.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-[rgb(var(--text-muted))] w-9 text-right">{p.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => openDetail(p.id)}>Chi tiết</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Upcoming events */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Sự kiện sắp tới</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              {UPCOMING_EVENTS.map((e, i) => (
                <div key={i} className="relative pl-4">
                  <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[rgb(var(--primary))]" />
                  {i < UPCOMING_EVENTS.length - 1 && <div className="absolute left-1 top-5 bottom-0 w-px bg-[rgb(var(--border))]" />}
                  <div>
                    <p className="text-xs font-medium text-[rgb(var(--text-primary))] leading-tight">{e.event}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">{e.date} · {e.location}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Partners by country */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[rgb(var(--info))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Theo quốc gia</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              {(() => {
                const byCountry = PARTNERS.reduce((acc, p) => { acc[p.country] = (acc[p.country] || 0) + 1; return acc; }, {} as Record<string, number>);
                return Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([c, count]) => (
                  <div key={c} className="flex items-center justify-between">
                    <span className="text-sm text-[rgb(var(--text-secondary))]">{c}</span>
                    <Badge variant="neutral" size="sm">{count}</Badge>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Chi tiết hợp tác */}
      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedPartner ? selectedPartner.name : ''}
        description={selectedPartner ? `${selectedPartner.country} · ${selectedPartner.field} · ${selectedPartner.moa}` : ''}
        size="fullscreen"
      >
        {selectedPartner ? <NckhDetailPage id={selectedPartner.id} /> : null}
      </DetailModal>

      {/* Modal: Tạo hợp tác mới */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tạo hợp tác quốc tế mới" size="lg">
        <div className="space-y-4">
          <Input label="Tên đối tác" placeholder="VD: Đại học Kyoto, TU Munich..." />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Quốc gia"
              options={[
                { value: 'jp', label: 'Nhật Bản 🇯🇵' },
                { value: 'kr', label: 'Hàn Quốc 🇰🇷' },
                { value: 'de', label: 'Đức 🇩🇪' },
                { value: 'fr', label: 'Pháp 🇫🇷' },
                { value: 'us', label: 'Mỹ 🇺🇸' },
                { value: 'au', label: 'Úc 🇦🇺' },
                { value: 'th', label: 'Thái Lan 🇹🇭' },
              ]}
            />
            <Select
              label="Loại hình hợp tác"
              options={[
                { value: 'nckh', label: 'Hợp tác nghiên cứu' },
                { value: 'dao-tao', label: 'Chương trình đào tạo' },
                { value: 'trao-doi', label: 'Trao đổi sinh viên' },
                { value: 'hoi-thao', label: 'Hội thảo quốc tế' },
                { value: 'du-an', label: 'Dự án liên kết' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lĩnh vực hợp tác" placeholder="VD: CNTT, Kinh tế, Y tế..." />
            <Input label="Số hiệu MOA/MOU" placeholder="VD: MOA-2026-xxx" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày bắt đầu" type="date" />
            <Input label="Ngày kết thúc" type="date" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kinh phí cam kết (VND)" placeholder="VD: 500.000.000" />
            <Input label="Số thành viên dự kiến" placeholder="VD: 10" />
          </div>
          <Input label="Người chủ trì" placeholder="Họ tên, chức danh" />
          <Input label="Mô tả / Ghi chú" placeholder="Mô tả chi tiết nội dung hợp tác..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Hủy</Button>
            <Button onClick={() => setCreateModal(false)}>Tạo hợp tác</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
