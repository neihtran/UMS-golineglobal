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
  Card,
  CardContent,
  Select,
  DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import HocPhiDetailPage from './HocPhiDetailPage';

const PAYMENTS = [
  { id: 'th001', code: 'TH-2026-HK2-001', student: 'Nguyễn Văn An', class: 'K60-CNTT', semester: 'HK2-2025/2026', amount: '12,500,000', paid: '12,500,000', method: 'Chuyển khoản', date: '2026-06-20', status: 'paid', due: '2026-07-15' },
  { id: 'th002', code: 'TH-2026-HK2-002', student: 'Lê Thị Bình', class: 'K59-KT', semester: 'HK2-2025/2026', amount: '11,800,000', paid: '5,900,000', method: 'Tiền mặt', date: '2026-06-18', status: 'partial', due: '2026-07-15' },
  { id: 'th003', code: 'TH-2026-HK2-003', student: 'Trần Văn Cường', class: 'K60-Luat', semester: 'HK2-2025/2026', amount: '13,200,000', paid: '0', method: 'Chưa thanh toán', date: '—', status: 'pending', due: '2026-07-15' },
  { id: 'th004', code: 'TH-2026-HK2-004', student: 'Phạm Thu Dung', class: 'K60-NN', semester: 'HK2-2025/2026', amount: '12,500,000', paid: '12,500,000', method: 'VNPay', date: '2026-06-15', status: 'paid', due: '2026-07-15' },
  { id: 'th005', code: 'TH-2026-HK2-005', student: 'Hoàng Minh Tuấn', class: 'K61-CNTT', semester: 'HK2-2025/2026', amount: '12,500,000', paid: '9,375,000', method: 'Chuyển khoản', date: '2026-06-22', status: 'partial', due: '2026-07-15' },
  { id: 'th006', code: 'TH-2025-HK1-006', student: 'Vũ Thị Hoa', class: 'K59-YD', semester: 'HK1-2025/2026', amount: '11,000,000', paid: '11,000,000', method: 'Tiền mặt', date: '2026-01-10', status: 'paid', due: '2026-02-15' },
];

const SEMESTERS = ['Tất cả', 'HK2-2025/2026', 'HK1-2025/2026', 'HK2-2024/2025'];
const STATUSES: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  paid: { variant: 'success', label: 'Đã đóng' },
  partial: { variant: 'warning', label: 'Đóng một phần' },
  pending: { variant: 'error', label: 'Chưa đóng' },
  overdue: { variant: 'error', label: 'Quá hạn' },
  waived: { variant: 'neutral', label: 'Được miễn' },
};

export default function HocPhiList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedPayment = selectedId ? PAYMENTS.find((p) => p.id === selectedId) : null;

  const filtered = PAYMENTS.filter((p) => {
    const matchSearch = !search || p.student.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchSem = semester === 'Tất cả' || p.semester === semester;
    const matchStatus = status === 'Tất cả' || p.status === status;
    return matchSearch && matchSem && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const formatVND = (val: string) => val;

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
          { label: 'Tổng thu kỳ', value: '2.1 tỷ', change: '+12%', icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
          { label: 'Còn nợ', value: '245 triệu', sub: '23 sinh viên', icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
          { label: 'Miễn giảm', value: '85 triệu', sub: '12 sinh viên', icon: <FileText className="h-5 w-5" />, color: 'accent' },
          { label: 'Đã thu', value: '96.5%', sub: 'tỷ lệ thu', icon: <CheckCircle2 className="h-5 w-5" />, color: 'primary' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub ?? s.change}</p>
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
              <Input placeholder="Tìm theo tên SV hoặc mã phiếu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={semester} onChange={(e) => setSemester(e.target.value)} options={SEMESTERS.map(s => ({ value: s, label: s }))} className="w-44" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[
              { value: 'Tất cả', label: 'Tất cả' }, { value: 'paid', label: 'Đã đóng' }, { value: 'partial', label: 'Đóng một phần' }, { value: 'pending', label: 'Chưa đóng' }, { value: 'overdue', label: 'Quá hạn' }
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã phiếu</TableHeadCell>
                <TableHeadCell>Sinh viên</TableHeadCell>
                <TableHeadCell>Lớp</TableHeadCell>
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
              {paged.length === 0 ? (
                <TableEmpty colSpan={10} message="Không có dữ liệu" />
              ) : (
                paged.map((p) => {
                  const remaining = parseInt(p.amount.replace(/[.,]/g, '')) - parseInt(p.paid.replace(/[.,]/g, ''));
                  return (
                    <TableRow key={p.id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{p.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{p.student}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{p.date !== '—' ? `Ngày ${p.date}` : 'Chưa thanh toán'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.class}</TableCell>
                      <TableCell className="text-sm">{p.semester}</TableCell>
                      <TableCell className="text-sm font-medium">{formatVND(p.amount)}đ</TableCell>
                      <TableCell>
                        <span className="text-sm">{formatVND(p.paid)}đ</span>
                        {remaining > 0 && <p className="text-xs text-[rgb(var(--error))]">Còn nợ: {formatVND(remaining.toLocaleString())}đ</p>}
                      </TableCell>
                      <TableCell className="text-sm">{p.method}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{p.due}</TableCell>
                      <TableCell><Badge variant={STATUSES[p.status]?.variant ?? 'neutral'} size="sm">{STATUSES[p.status]?.label}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => openDetail(p.id)}>Chi tiết</Button></TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedPayment ? selectedPayment.student : ''}
        description={selectedPayment ? `${selectedPayment.code} · ${selectedPayment.semester}` : ''}
        size="fullscreen"
      >
        {selectedPayment ? <HocPhiDetailPage id={selectedPayment.id} /> : null}
      </DetailModal>
    </div>
  );
}
