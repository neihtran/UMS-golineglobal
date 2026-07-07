import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Monitor,
  Printer,
  Projector,
  Armchair,
  Truck,
  Search,
  Plus,
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
  DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import QATaiSanDetail from './QATaiSanDetail';

const ASSETS = [
  { id: 'ts001', code: 'TS-IT-001', name: 'Máy tính Dell OptiPlex 7090', category: 'Thiết bị CNTT', dept: 'Phòng CNTT', quantity: 25, unit: 'bộ', value: 750000000, status: 'active', depreciation: 45, location: 'Tòa A, Tầng 3', supplier: 'Công ty TNHH Viễn Thông ABC' },
  { id: 'ts002', code: 'TS-IT-002', name: 'Máy in laser HP LaserJet Pro', category: 'Thiết bị CNTT', dept: 'Khoa CNTT', quantity: 8, unit: 'máy', value: 120000000, status: 'active', depreciation: 30, location: 'Tòa B, Tầng 2', supplier: 'Công ty TNHH Thiết bị VN' },
  { id: 'ts003', code: 'TS-DA-001', name: 'Máy chiếu Sony VPL-PHZ10', category: 'Thiết bị nghe nhìn', dept: 'Khoa Kinh tế', quantity: 15, unit: 'máy', value: 450000000, status: 'maintenance', depreciation: 20, location: 'Hội trường lớn', supplier: 'Công ty TNHH AV Việt Nam' },
  { id: 'ts004', code: 'TS-NN-001', name: 'Ghế văn phòng Ergonomic Pro', category: 'Nội thất', dept: 'Khoa Ngoại ngữ', quantity: 120, unit: 'cái', value: 360000000, status: 'active', depreciation: 60, location: 'Tòa C, Tầng 1', supplier: 'Nội thất Đại Phát' },
  { id: 'ts005', code: 'TS-CN-001', name: 'Máy CNC mini Roland MODELA', category: 'Thiết bị chuyên ngành', dept: 'Khoa Cơ khí', quantity: 3, unit: 'máy', value: 900000000, status: 'broken', depreciation: 15, location: 'Xưởng thực hành', supplier: 'CNC Vietnam JSC' },
  { id: 'ts006', code: 'TS-PT-001', name: 'Xe ô tô Toyota Innova G', category: 'Phương tiện', dept: 'Phòng Hành chính', quantity: 2, unit: 'chiếc', value: 1400000000, status: 'active', depreciation: 50, location: 'Bãi xe tầng 1', supplier: 'Toyota Đà Nẵng' },
  { id: 'ts007', code: 'TS-IT-003', name: 'Máy chủ Dell PowerEdge R750', category: 'Thiết bị CNTT', dept: 'Phòng CNTT', quantity: 4, unit: 'máy', value: 1600000000, status: 'active', depreciation: 25, location: 'Phòng server Tòa A', supplier: 'Dell Việt Nam' },
  { id: 'ts008', code: 'TS-DA-002', name: 'Hệ thống âm thanh hội trường', category: 'Thiết bị nghe nhìn', dept: 'Phòng Hành chính', quantity: 1, unit: 'hệ thống', value: 650000000, status: 'maintenance', depreciation: 10, location: 'Hội trường A', supplier: 'Audio Visual JSC' },
  { id: 'ts009', code: 'TS-NN-002', name: 'Bàn họp dài 4m', category: 'Nội thất', dept: 'Ban Giám hiệu', quantity: 6, unit: 'bộ', value: 180000000, status: 'disposed', depreciation: 80, location: 'Tòa B, Tầng 5', supplier: 'Nội thất Đại Phát' },
  { id: 'ts010', code: 'TS-CN-002', name: 'Máy hàn laser fiber 1kW', category: 'Thiết bị chuyên ngành', dept: 'Khoa Cơ khí', quantity: 2, unit: 'máy', value: 2200000000, status: 'active', depreciation: 5, location: 'Xưởng thực hành', supplier: 'LaserTech Asia' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Thiết bị CNTT': <Monitor className="h-4 w-4" />,
  'Thiết bị nghe nhìn': <Projector className="h-4 w-4" />,
  'Nội thất': <Armchair className="h-4 w-4" />,
  'Phương tiện': <Truck className="h-4 w-4" />,
  'Thiết bị chuyên ngành': <Printer className="h-4 w-4" />,
};

const DEPT_FILTERS_KEYS = ['all', 'phong-cnt', 'khoa-cnt', 'khoa-kt', 'khoa-nn', 'khoa-ck', 'phong-hc', 'ban-gh'];
const DEPT_VALUES: Record<string, string> = {
  'phong-cnt': 'Phòng CNTT',
  'khoa-cnt': 'Khoa CNTT',
  'khoa-kt': 'Khoa Kinh tế',
  'khoa-nn': 'Khoa Ngoại ngữ',
  'khoa-ck': 'Khoa Cơ khí',
  'phong-hc': 'Phòng Hành chính',
  'ban-gh': 'Ban Giám hiệu',
};

const CATEGORY_FILTERS_KEYS = ['all', 'it', 'av', 'furniture', 'vehicle', 'specialized'];
const CATEGORY_VALUES: Record<string, string> = {
  'it': 'Thiết bị CNTT',
  'av': 'Thiết bị nghe nhìn',
  'furniture': 'Nội thất',
  'vehicle': 'Phương tiện',
  'specialized': 'Thiết bị chuyên ngành',
};

const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export default function QATaiSanPage() {
  const { t } = useTranslation('qa');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });

  const selectedAsset = selectedId ? ASSETS.find((a) => a.id === selectedId) : null;

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
    active: { variant: 'success', label: t('asset.status.active') },
    maintenance: { variant: 'warning', label: t('asset.status.maintenance') },
    broken: { variant: 'error', label: t('asset.status.broken') },
    disposed: { variant: 'neutral', label: t('asset.status.disposed') },
  };

  const filtered = ASSETS.filter((a) => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || a.dept === DEPT_VALUES[filterDept];
    const matchCat = filterCategory === 'all' || a.category === CATEGORY_VALUES[filterCategory];
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchDept && matchCat && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const totalValue = filtered.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('asset.title')}
        description={t('asset.description')}
        breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: t('asset.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>{t('filter.filter')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/qa/tai-san/tao')}>{t('asset.create')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('asset.statTotal'), value: ASSETS.length, color: 'primary' },
          { label: t('asset.statActive'), value: ASSETS.filter(a => a.status === 'active').length, color: 'success' },
          { label: t('asset.statMaintenance'), value: ASSETS.filter(a => a.status === 'maintenance').length, color: 'warning' },
          { label: t('asset.statValue'), value: fmt.format(totalValue), color: 'accent', isString: true },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('asset.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
        />
        <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          {DEPT_FILTERS_KEYS.map((k) => (
            <option key={k} value={k}>{k === 'all' ? t('filter.all') : DEPT_VALUES[k]}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          {CATEGORY_FILTERS_KEYS.map((k) => (
            <option key={k} value={k}>{k === 'all' ? t('filter.all') : CATEGORY_VALUES[k]}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('filter.allStatus')}</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('asset.table.code')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.name')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.category')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.dept')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.quantity')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.value')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.depreciation')}</TableHeadCell>
            <TableHeadCell>{t('table.status')}</TableHeadCell>
            <TableHeadCell>{t('asset.table.location')}</TableHeadCell>
            <TableHeadCell>{t('table.actions')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message={t('asset.empty')} />
          ) : paged.map((a) => {
            const sc = STATUS_CONFIG[a.status];
            const icon = CATEGORY_ICONS[a.category];
            return (
              <TableRow key={a.id}>
                <TableCell className="text-[rgb(var(--text-muted))] font-mono text-xs">{a.code}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                      {icon ?? <Monitor className="h-4 w-4" />}
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{a.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">{a.category}</Badge>
                </TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{a.dept}</TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{a.quantity} {a.unit}</TableCell>
                <TableCell className="text-sm font-medium text-[rgb(var(--text-primary))]">{fmt.format(a.value)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                      <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${a.depreciation}%` }} />
                    </div>
                    <span className="text-xs text-[rgb(var(--text-muted))]">{a.depreciation}%</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-muted))] max-w-[120px] truncate">{a.location}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openDetail(a.id)}>{t('table.detail')}</Button>
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

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedAsset ? `${selectedAsset.code} — Chi tiết tài sản` : ''}
        description={selectedAsset ? selectedAsset.name : ''}
        size="fullscreen"
      >
        {selectedId ? <QATaiSanDetail id={selectedId} /> : null}
      </DetailModal>
    </div>
  );
}
