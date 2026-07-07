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
import { Button, Badge, Card, CardContent, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, TableEmpty } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTuitionList } from '@/hooks/useFin';
import { usePagination } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';

const STATUS_CONFIG = {
  paid: { variant: 'success' as const, label: 'Đã đóng' },
  unpaid: { variant: 'error' as const, label: 'Chưa đóng' },
  partial: { variant: 'warning' as const, label: 'Đóng một phần' },
  exempted: { variant: 'accent' as const, label: 'Miễn giảm' },
  deferred: { variant: 'neutral' as const, label: 'Gia hạn' },
};

const TABS = [
  { id: 'debt', label: 'Danh sách nợ' },
  { id: 'payment', label: 'Lịch sử thanh toán' },
  { id: 'config', label: 'Cấu hình học phí' },
  { id: 'scholarship', label: 'Miễn giảm' },
];

export default function HocPhiPage() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [tab, setTab] = useState('debt');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useTuitionList({
    search: search || undefined,
    status: statusFilter || undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const list = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const totalTuition = list.reduce((s: any, r: any) => s + (r.total ?? r.tuitionFee ?? 0), 0);
  const totalPaid = list.reduce((s: any, r: any) => s + (r.paid ?? 0), 0);
  const totalRemaining = list.reduce((s: any, r: any) => {
    const remaining = r.remaining != null ? r.remaining : ((r.total ?? 0) - (r.paid ?? 0));
    return s + remaining;
  }, 0);
  const unpaidCount = list.filter((r: any) => r.status === 'unpaid').length;

  const stats = [
    { label: 'Tổng phải thu', value: formatCurrency(totalTuition), icon: <DollarSign className="h-5 w-5" />, color: 'primary' as const },
    { label: 'Đã thu', value: formatCurrency(totalPaid), sub: `${totalPaid > 0 && totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0}%`, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' as const },
    { label: 'Còn nợ', value: formatCurrency(totalRemaining), sub: `${unpaidCount} SV`, icon: <AlertTriangle className="h-5 w-5" />, color: 'error' as const },
    { label: 'Chờ xác nhận', value: '—', sub: `${list.filter((r: any) => r.status === 'partial').length} bản ghi`, icon: <Clock className="h-5 w-5" />, color: 'warning' as const },
  ];

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
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{isLoading ? '—' : s.value}</p>
                {s.sub && <p className="text-xs text-[rgb(var(--success))]">{s.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert */}
      {unpaidCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.05)] px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-[rgb(var(--error))] shrink-0" />
          <p className="text-sm text-[rgb(var(--text-primary))]">
            <strong>{unpaidCount} sinh viên chưa đóng học phí</strong> — tổng nợ: <strong>{formatCurrency(totalRemaining)}</strong>.
          </p>
          <Button size="sm" variant="outline" className="ml-auto shrink-0">Gửi thêm</Button>
        </div>
      )}

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
              <option value="">Tất cả trạng thái</option>
              <option value="paid">Đã đóng</option>
              <option value="unpaid">Chưa đóng</option>
              <option value="partial">Đóng một phần</option>
              <option value="exempted">Miễn giảm</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <TableEmpty colSpan={9} message="Đang tải dữ liệu học phí..." />
          ) : list.length === 0 ? (
            <TableEmpty colSpan={9} message="Không có dữ liệu học phí" />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Sinh viên</TableHeadCell>
                  <TableHeadCell>Mã SV</TableHeadCell>
                  <TableHeadCell>Lớp</TableHeadCell>
                  <TableHeadCell className="text-right">Tổng phí</TableHeadCell>
                  <TableHeadCell className="text-right">Đã đóng</TableHeadCell>
                  <TableHeadCell className="text-right">Còn nợ</TableHeadCell>
                  <TableHeadCell className="text-right">Ngày đóng</TableHeadCell>
                  <TableHeadCell>Trạng thái</TableHeadCell>
                  <TableHeadCell></TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((record: any) => {
                  const sc = STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG] || { variant: 'neutral' as const, label: record.status };
                  const remaining = record.remaining ?? (record.total - record.paid);
                  return (
                    <TableRow key={record._id ?? record.id}>
                      <TableCell className="font-medium text-[rgb(var(--text-primary))]">{record.studentName ?? record.name ?? '—'}</TableCell>
                      <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{record.msv ?? record.studentId ?? '—'}</TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{record.class ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(record.total ?? record.tuitionFee ?? 0)}</TableCell>
                      <TableCell className="text-right font-mono text-[rgb(var(--success))]">{formatCurrency(record.paid ?? 0)}</TableCell>
                      <TableCell className={`text-right font-mono font-semibold ${remaining > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-secondary))]'}`}>{formatCurrency(remaining)}</TableCell>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      </Card>
    </div>
  );
}
