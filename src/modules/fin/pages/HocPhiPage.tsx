import { useState } from 'react';
import {
  DollarSign,
  Download,
  Upload,
  Search,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, TableHeadCell, TableCell, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { formatCurrency } from '@/utils/formatters';

const TUITION_RECORDS = [
  { id: 't1', studentId: 'sv001', name: 'Nguyễn Văn An', msv: 'SV-2022-0001', class: 'CNTT-K60A', semester: '2026-1', tuition: 12000000, other: 800000, total: 12800000, paid: 12800000, remaining: 0, status: 'paid', dueDate: '2026-03-15', paidAt: '2026-02-28', method: 'Bank transfer' },
  { id: 't2', studentId: 'sv002', name: 'Trần Thị Bình', msv: 'SV-2022-0002', class: 'KT-K60A', semester: '2026-1', tuition: 10000000, other: 600000, total: 10600000, paid: 0, remaining: 10600000, status: 'unpaid', dueDate: '2026-03-15', paidAt: null, method: null },
  { id: 't3', studentId: 'sv003', name: 'Lê Hoàng Nam', msv: 'SV-2023-0001', class: 'CNTT-K61A', semester: '2026-1', tuition: 12000000, other: 800000, total: 12800000, paid: 6400000, remaining: 6400000, status: 'partial', dueDate: '2026-03-15', paidAt: '2026-03-01', method: 'Bank transfer' },
  { id: 't4', studentId: 'sv004', name: 'Phạm Thu Lan', msv: 'SV-2021-0001', class: 'LUAT-K59', semester: '2026-1', tuition: 10000000, other: 500000, total: 10500000, paid: 10500000, remaining: 0, status: 'paid', dueDate: '2026-03-15', paidAt: '2026-02-20', method: 'Scholarship' },
  { id: 't5', studentId: 'sv005', name: 'Bùi Đình Sơn', msv: 'SV-2022-0003', class: 'NN-K60A', semester: '2026-1', tuition: 9000000, other: 600000, total: 9600000, paid: 0, remaining: 9600000, status: 'unpaid', dueDate: '2026-03-15', paidAt: null, method: null },
  { id: 't6', studentId: 'sv006', name: 'Đặng Minh Tuấn', msv: 'SV-2020-0001', class: 'CNTT-K58A', semester: '2026-1', tuition: 12000000, other: 800000, total: 12800000, paid: 12800000, remaining: 0, status: 'paid', dueDate: '2026-03-15', paidAt: '2026-01-15', method: 'Bank transfer' },
  { id: 't7', studentId: 'sv007', name: 'Vũ Thị Hương', msv: 'SV-2023-0002', class: 'SP-K61A', semester: '2026-1', tuition: 8000000, other: 500000, total: 8500000, paid: 0, remaining: 8500000, status: 'unpaid', dueDate: '2026-03-15', paidAt: null, method: null },
  { id: 't8', studentId: 'sv008', name: 'Hoàng Phương Linh', msv: 'SV-2022-0004', class: 'CNTT-K60B', semester: '2026-1', tuition: 12000000, other: 800000, total: 12800000, paid: 12800000, remaining: 0, status: 'paid', dueDate: '2026-03-15', paidAt: '2026-03-10', method: 'Bank transfer' },
];

const STATS = [
  { label: 'Tổng phải thu HK2/2026', value: '14.6 tỷ', icon: <DollarSign className="h-5 w-5" />, color: 'primary' },
  { label: 'Đã thu', value: '11.8 tỷ', sub: '80.8%', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
  { label: 'Còn nợ', value: '2.8 tỷ', sub: '234 SV', icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
  { label: 'Chờ xác nhận', value: '~100 tr', sub: '15 bản ghi', icon: <Clock className="h-5 w-5" />, color: 'warning' },
];

const STATUS_CONFIG = {
  paid: { variant: 'success' as const, label: 'Đã đóng' },
  unpaid: { variant: 'error' as const, label: 'Chưa đóng' },
  partial: { variant: 'warning' as const, label: 'Đóng một phần' },
  exempted: { variant: 'accent' as const, label: 'Miễn giảm' },
  deferred: { variant: 'neutral' as const, label: 'Gia hạn' },
};

const TABS = [
  { id: 'debt', label: 'Danh sách nợ (234)' },
  { id: 'payment', label: 'Lịch sử thanh toán' },
  { id: 'config', label: 'Cấu hình học phí' },
  { id: 'scholarship', label: 'Miễn giảm' },
];

export default function HocPhiPage() {
  const [tab, setTab] = useState('debt');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = TUITION_RECORDS.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.msv.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Học phí"
        description="FIN-01 · Thu học phí, quản lý nợ, cấu hình phí, miễn giảm"
        breadcrumbs={[{ label: 'FIN', href: '/fin' }, { label: 'Học phí' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách nợ</Button>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>Import thanh toán</Button>
            <Button leftIcon={<Send className="h-4 w-4" />}>Gửi nhắc nhở hàng loạt</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub ?? ''}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert */}
      <div className="flex items-center gap-3 rounded-lg border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.05)] px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-[rgb(var(--error))] shrink-0" />
        <p className="text-sm text-[rgb(var(--text-primary))]">
          <strong>234 sinh viên chưa đóng học phí kỳ 2/2026</strong> — tổng nợ: <strong>~2.8 tỷ đồng</strong>. Đã gửi 180/234 tin nhắn nhắc nợ.
        </p>
        <Button size="sm" variant="outline" className="ml-auto shrink-0">Gửi thêm</Button>
      </div>

      {/* Tabs + filters */}
      <Card>
        <div className="border-b border-[rgb(var(--border)/0.6)]">
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    tab === t.id
                      ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                      : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm tên hoặc mã SV..."
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã đóng</option>
              <option value="unpaid">Chưa đóng</option>
              <option value="partial">Đóng một phần</option>
              <option value="exempted">Miễn giảm</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  <TableHeadCell>Sinh viên</TableHeadCell>
                  <TableHeadCell>Mã SV</TableHeadCell>
                  <TableHeadCell>Lớp</TableHeadCell>
                  <TableHeadCell className="text-right">Tổng phí</TableHeadCell>
                  <TableHeadCell className="text-right">Đã đóng</TableHeadCell>
                  <TableHeadCell className="text-right">Còn nợ</TableHeadCell>
                  <TableHeadCell className="text-right">Ngày đóng</TableHeadCell>
                  <TableHeadCell>Trạng thái</TableHeadCell>
                  <TableHeadCell></TableHeadCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {paged.map((record) => {
                  const sc = STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG];
                  const isOverdue = record.status !== 'paid' && record.dueDate < '2026-06-25';
                  return (
                    <tr key={record.id} className={`hover:bg-[rgb(var(--bg-hover))] ${isOverdue && record.status !== 'paid' ? 'bg-[rgb(var(--error)/0.02)]' : ''}`}>
                      <TableCell className="font-medium text-[rgb(var(--text-primary))]">{record.name}</TableCell>
                      <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{record.msv}</TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{record.class}</TableCell>
                      <TableCell numeric className="font-mono">{formatCurrency(record.total)}</TableCell>
                      <TableCell numeric className="font-mono text-[rgb(var(--success))]">{formatCurrency(record.paid)}</TableCell>
                      <TableCell numeric className={`font-mono font-semibold ${record.remaining > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-secondary))]'}`}>
                        {formatCurrency(record.remaining)}
                      </TableCell>
                      <TableCell className="text-[rgb(var(--text-muted))] text-xs">{record.paidAt ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={sc.variant} dot={record.status !== 'paid'}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>Chi tiết</Button>
                          {record.status !== 'paid' && (
                            <Button variant="ghost" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>Nhắc nợ</Button>
                          )}
                        </div>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      </Card>
    </div>
  );
}
