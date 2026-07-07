import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Plus,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
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
  TableSkeleton,
  Card,
  CardContent,
  Select,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce } from '@/hooks';
import { useTuitionList } from '@/hooks/useFin';
import type { Tuition } from '@/services/fin.service';

const STATUSES: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  paid: { variant: 'success', label: 'Đã đóng' },
  partial: { variant: 'warning', label: 'Đóng một phần' },
  unpaid: { variant: 'error', label: 'Chưa đóng' },
  overdue: { variant: 'error', label: 'Quá hạn' },
  waived: { variant: 'neutral', label: 'Được miễn' },
};

export default function HocPhiList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [status, setStatus] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch || undefined,
    semester: semester || undefined,
    status: status || undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };

  const { data, isLoading } = useTuitionList(filters);

  const items = (data?.data ?? []) as Tuition[];
  const total = data?.pagination?.total ?? 0;

  const paged = items.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const allItems = (data?.data ?? []) as Tuition[];
  const totalCollected = allItems.reduce((s, i) => s + (i.paidAmount ?? i.amountPaid ?? 0), 0);
  const totalOwed = allItems.reduce((s, i) => s + Math.max(0, (i.amount ?? i.totalAmount ?? 0) - (i.paidAmount ?? i.amountPaid ?? 0)), 0);
  const unpaidCount = allItems.filter((i) => i.status === 'unpaid' || i.status === 'overdue').length;
  const waivedAmount = allItems.filter((i) => i.status === 'waived').reduce((s, i) => s + (i.amount ?? 0), 0);
  const collectRate = total > 0 ? ((totalCollected / allItems.reduce((s, i) => s + (i.amount ?? 0), 0)) * 100).toFixed(1) : '0';

  const uniqueSemesters = [...new Set(allItems.map((i) => i.semester).filter(Boolean))].sort();

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Học phí"
        description="Theo dõi thu học phí, công nợ, miễn giảm"
        breadcrumbs={[{ label: 'FIN' }, { label: 'Học phí' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/fin/hoc-phi/tao')}>Tạo phiếu thu</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: 'Tổng thu kỳ', value: formatVND(totalCollected), sub: `+${collectRate}% tổng`, icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
          { label: 'Còn nợ', value: formatVND(totalOwed), sub: `${unpaidCount} sinh viên`, icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
          { label: 'Miễn giảm', value: formatVND(waivedAmount), sub: `${allItems.filter(i => i.status === 'waived').length} sinh viên`, icon: <FileText className="h-5 w-5" />, color: 'accent' },
          { label: 'Đã thu', value: `${collectRate}%`, sub: 'tỷ lệ thu', icon: <CheckCircle2 className="h-5 w-5" />, color: 'primary' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub ?? ''}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input placeholder="Tìm theo tên SV hoặc mã phiếu..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={semester} onChange={(e) => { setSemester(e.target.value); setPage(1); }} options={[{ value: '', label: 'Tất cả' }, ...uniqueSemesters.map(s => ({ value: s, label: s }))]} className="w-44" />
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={[
              { value: 'Tất cả', label: 'Tất cả' }, { value: 'paid', label: 'Đã đóng' }, { value: 'partial', label: 'Đóng một phần' }, { value: 'unpaid', label: 'Chưa đóng' }, { value: 'overdue', label: 'Quá hạn' }
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã phiếu</TableHeadCell>
                <TableHeadCell>Sinh viên</TableHeadCell>
                <TableHeadCell>Học kỳ</TableHeadCell>
                <TableHeadCell>Tổng nợ</TableHeadCell>
                <TableHeadCell>Đã đóng</TableHeadCell>
                <TableHeadCell>Phương thức</TableHeadCell>
                <TableHeadCell>Hạn đóng</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={pagination.pageSize} colSpan={9} />
              ) : paged.length === 0 ? (
                <TableEmpty colSpan={9} message="Không có dữ liệu" />
              ) : (
                paged.map((p) => {
                  const remaining = p.amount - p.paidAmount;
                  const displayCode = `TH-${p.semester}-${p.studentId.slice(-4)}`;
                  return (
                    <TableRow key={p._id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{displayCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{p.studentName ?? p.studentId}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">
                            {p.paidAt ? `Ngày ${new Date(p.paidAt).toLocaleDateString('vi-VN')}` : 'Chưa thanh toán'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.semester}</TableCell>
                      <TableCell className="text-sm font-medium">{formatVND(p.amount)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{formatVND(p.paidAmount)}</span>
                        {remaining > 0 && (
                          <p className="text-xs text-[rgb(var(--error))]">
                            Còn nợ: {formatVND(remaining)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{p.paymentMethod ?? '—'}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUSES[p.status]?.variant ?? 'neutral'} size="sm">
                          {STATUSES[p.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/fin/hoc-phi/${p._id}`)}>
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
