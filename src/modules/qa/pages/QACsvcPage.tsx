import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  LayoutGrid,
  Users,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Search,
  Plus,
  MapPin,
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
  TablePagination,
  TableEmpty,
  Card,
  CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

type Facility = {
  id: string;
  code: string;
  name: string;
  type: string;
  capacity: number;
  currentUsage: number;
  floor: string;
  building: string;
  area: number;
  equipment: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  condition: 'good' | 'fair' | 'needs_repair';
  lastInspected: string;
};

const FACILITIES: Facility[] = [
  { id: 'f001', code: 'CSVC-A101', name: 'Phòng học A1-01', type: 'Phòng học', capacity: 60, currentUsage: 58, floor: 'Tầng 1', building: 'Tòa A', area: 90, equipment: 12, status: 'occupied', condition: 'good', lastInspected: '2026-05-10' },
  { id: 'f002', code: 'CSVC-A102', name: 'Phòng học A1-02', type: 'Phòng học', capacity: 45, currentUsage: 0, floor: 'Tầng 1', building: 'Tòa A', area: 70, equipment: 10, status: 'available', condition: 'good', lastInspected: '2026-05-10' },
  { id: 'f003', code: 'CSVC-A201', name: 'Lab Tin học A2-01', type: 'Phòng máy', capacity: 40, currentUsage: 40, floor: 'Tầng 2', building: 'Tòa A', area: 80, equipment: 42, status: 'occupied', condition: 'good', lastInspected: '2026-04-20' },
  { id: 'f004', code: 'CSVC-A202', name: 'Lab Tin học A2-02', type: 'Phòng máy', capacity: 35, currentUsage: 28, floor: 'Tầng 2', building: 'Tòa A', area: 75, equipment: 38, status: 'occupied', condition: 'fair', lastInspected: '2026-03-15' },
  { id: 'f005', code: 'CSVC-B101', name: 'Hội trường B1', type: 'Hội trường', capacity: 300, currentUsage: 250, floor: 'Tầng 1', building: 'Tòa B', area: 450, equipment: 25, status: 'occupied', condition: 'good', lastInspected: '2026-05-25' },
  { id: 'f006', code: 'CSVC-B102', name: 'Phòng họp B1-02', type: 'Phòng họp', capacity: 20, currentUsage: 0, floor: 'Tầng 1', building: 'Tòa B', area: 40, equipment: 8, status: 'available', condition: 'good', lastInspected: '2026-05-10' },
  { id: 'f007', code: 'CSVC-C101', name: 'Xưởng thực hành Cơ khí', type: 'Xưởng thực hành', capacity: 30, currentUsage: 22, floor: 'Tầng 1', building: 'Tòa C', area: 200, equipment: 18, status: 'occupied', condition: 'needs_repair', lastInspected: '2026-02-28' },
  { id: 'f008', code: 'CSVC-C201', name: 'Phòng Lab Ngoại ngữ C2-01', type: 'Phòng nghe nhìn', capacity: 50, currentUsage: 48, floor: 'Tầng 2', building: 'Tòa C', area: 85, equipment: 55, status: 'occupied', condition: 'good', lastInspected: '2026-05-05' },
  { id: 'f009', code: 'CSVC-C202', name: 'Thư viện Tòa C', type: 'Thư viện', capacity: 200, currentUsage: 85, floor: 'Tầng 2', building: 'Tòa C', area: 380, equipment: 6, status: 'occupied', condition: 'good', lastInspected: '2026-05-15' },
  { id: 'f010', code: 'CSVC-D101', name: 'Sân thể thao đa năng', type: 'Sân thể thao', capacity: 100, currentUsage: 0, floor: 'Sân ngoài', building: 'Khu D', area: 1200, equipment: 15, status: 'reserved', condition: 'fair', lastInspected: '2026-04-01' },
  { id: 'f011', code: 'CSVC-D102', name: 'Phòng gym sinh viên', type: 'Phòng gym', capacity: 50, currentUsage: 35, floor: 'Tầng 1', building: 'Khu D', area: 150, equipment: 20, status: 'occupied', condition: 'good', lastInspected: '2026-05-20' },
  { id: 'f012', code: 'CSVC-A103', name: 'Phòng học A1-03', type: 'Phòng học', capacity: 50, currentUsage: 0, floor: 'Tầng 1', building: 'Tòa A', area: 75, equipment: 10, status: 'maintenance', condition: 'needs_repair', lastInspected: '2026-01-10' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'accent'; label: string; icon: React.ReactNode }> = {
  available: { variant: 'success', label: 'Trống', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  occupied: { variant: 'warning', label: 'Đang sử dụng', icon: <Users className="h-3.5 w-3.5" /> },
  maintenance: { variant: 'accent', label: 'Bảo trì', icon: <Wrench className="h-3.5 w-3.5" /> },
  reserved: { variant: 'neutral', label: 'Đặt trước', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
};

const CONDITION_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  good: { variant: 'success', label: 'Tốt' },
  fair: { variant: 'warning', label: 'Khá' },
  needs_repair: { variant: 'error', label: 'Cần sửa chữa' },
};

const TYPE_CONFIG: Record<string, string> = {
  'Phòng học': 'bg-blue-100 text-blue-700',
  'Phòng máy': 'bg-purple-100 text-purple-700',
  'Hội trường': 'bg-amber-100 text-amber-700',
  'Phòng họp': 'bg-teal-100 text-teal-700',
  'Xưởng thực hành': 'bg-orange-100 text-orange-700',
  'Phòng nghe nhìn': 'bg-pink-100 text-pink-700',
  'Thư viện': 'bg-green-100 text-green-700',
  'Sân thể thao': 'bg-lime-100 text-lime-700',
  'Phòng gym': 'bg-rose-100 text-rose-700',
};

export default function QACsvcPage() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  const [filterBuilding, setFilterBuilding] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const types = ['Tất cả', ...Array.from(new Set(FACILITIES.map(f => f.type)))];
  const buildings = ['Tất cả', ...Array.from(new Set(FACILITIES.map(f => f.building)))].sort();

  const filtered = FACILITIES.filter((f) => {
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'Tất cả' || f.type === filterType;
    const matchBuilding = filterBuilding === 'Tất cả' || f.building === filterBuilding;
    const matchStatus = filterStatus === 'Tất cả' || f.status === filterStatus;
    return matchSearch && matchType && matchBuilding && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const totalArea = filtered.reduce((s, f) => s + f.area, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản lý Cơ sở Vật chất"
        description="QA-03 — Quản lý phòng học, trang thiết bị, công suất sử dụng và bảo trì"
        breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: 'CSVC' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>Bộ lọc</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/qa/csvc/tao')}>Thêm phòng</Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Tổng cơ sở', value: FACILITIES.length, icon: <Building className="h-5 w-5" />, color: 'primary' },
          { label: 'Đang sử dụng', value: FACILITIES.filter(f => f.status === 'occupied').length, icon: <Users className="h-5 w-5" />, color: 'warning' },
          { label: 'Cần bảo trì', value: FACILITIES.filter(f => f.condition === 'needs_repair').length, icon: <AlertCircle className="h-5 w-5" />, color: 'error' },
          { label: 'Tổng diện tích', value: `${totalArea.toLocaleString('vi-VN')} m²`, icon: <MapPin className="h-5 w-5" />, color: 'accent' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
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

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo mã, tên phòng..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
        />
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterBuilding} onChange={(e) => { setFilterBuilding(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          {buildings.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          {['Tất cả', 'available', 'occupied', 'maintenance', 'reserved'].map(s => (
            <option key={s} value={s}>
              {s === 'Tất cả' ? 'Tất cả trạng thái' : STATUS_CONFIG[s]?.label ?? s}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Mã CSVC</TableHeadCell>
            <TableHeadCell>Tên phòng</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Tòa / Tầng</TableHeadCell>
            <TableHeadCell>Công suất</TableHeadCell>
            <TableHeadCell>Diện tích</TableHeadCell>
            <TableHeadCell>Tình trạng</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Kiểm tra gần nhất</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message="Không tìm thấy phòng nào" />
          ) : paged.map((f) => {
            const sc = STATUS_CONFIG[f.status];
            const cc = CONDITION_CONFIG[f.condition];
            const typeClass = TYPE_CONFIG[f.type] ?? 'bg-slate-100 text-slate-700';
            const occupancy = Math.round((f.currentUsage / f.capacity) * 100);
            return (
              <TableRow key={f.id}>
                <TableCell className="text-[rgb(var(--text-muted))] font-mono text-xs">{f.code}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                      <Building className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{f.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${typeClass}`}>{f.type}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{f.building}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{f.floor}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${occupancy}%`,
                            background: occupancy > 90 ? 'rgb(var(--error))' : occupancy > 70 ? 'rgb(var(--warning))' : 'rgb(var(--primary))',
                          }}
                        />
                      </div>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{occupancy}%</span>
                    </div>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{f.currentUsage}/{f.capacity} người</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{f.area} m²</TableCell>
                <TableCell><Badge variant={cc.variant} size="sm">{cc.label}</Badge></TableCell>
                <TableCell>
                  <Badge variant={sc.variant} size="sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                    {sc.icon}{sc.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-muted))]">{f.lastInspected}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/qa/csvc/${f.id}`)}>Chi tiết</Button>
                </TableCell>
              </TableRow>
            );
          })}
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
