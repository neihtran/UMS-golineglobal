import { useState } from 'react';
import { Search, Download, ReceiptText, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const SEMESTERS = ['HK1 2025-2026', 'HK2 2025-2026', 'HK1 2026-2027'];
const BLOCKS = ['Tất cả', 'Khu A', 'Khu B', 'Khu C'];

const PAYMENTS = [
  { id: 'p1', studentId: 'SV20240001', name: 'Nguyễn Văn An', room: 'A101', block: 'Khu A', semester: 'HK1 2026-2027', amount: '1.200.000', dueDate: '2026-09-15', paidDate: '2026-09-05', status: 'paid', method: 'Chuyển khoản' },
  { id: 'p2', studentId: 'SV20240002', name: 'Trần Thị Bình', room: 'B101', block: 'Khu B', semester: 'HK1 2026-2027', amount: '1.200.000', dueDate: '2026-09-15', paidDate: '2026-09-10', status: 'paid', method: 'Tiền mặt' },
  { id: 'p3', studentId: 'SV20230005', name: 'Lê Văn Cường', room: 'A201', block: 'Khu A', semester: 'HK1 2026-2027', amount: '1.000.000', dueDate: '2026-09-15', paidDate: '', status: 'overdue', method: '' },
  { id: 'p4', studentId: 'SV20240003', name: 'Phạm Thu Dung', room: 'B102', block: 'Khu B', semester: 'HK1 2026-2027', amount: '1.200.000', dueDate: '2026-09-15', paidDate: '2026-09-12', status: 'paid', method: 'Chuyển khoản' },
  { id: 'p5', studentId: 'SV20240004', name: 'Đặng Thị Hà', room: 'B201', block: 'Khu B', semester: 'HK1 2026-2027', amount: '1.200.000', dueDate: '2026-09-15', paidDate: '', status: 'pending', method: '' },
  { id: 'p6', studentId: 'SV20230008', name: 'Hoàng Minh Tuấn', room: 'C301', block: 'Khu C', semester: 'HK1 2026-2027', amount: '1.000.000', dueDate: '2026-09-15', paidDate: '2026-09-01', status: 'paid', method: 'Chuyển khoản' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  paid: { variant: 'success', label: 'Đã nộp' },
  pending: { variant: 'warning', label: 'Chưa nộp' },
  overdue: { variant: 'error', label: 'Quá hạn' },
};

export default function ThuPhiKTX() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [block, setBlock] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const [semester, setSemester] = useState(SEMESTERS[2]);
  const [payModal, setPayModal] = useState<typeof PAYMENTS[0] | null>(null);
  const [recordModal, setRecordModal] = useState(false);

  const filtered = PAYMENTS.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.studentId.toLowerCase().includes(search.toLowerCase());
    const matchBlock = block === 'Tất cả' || p.block === block;
    const matchStatus = status === 'Tất cả' || p.status === status;
    const matchSemester = p.semester === semester;
    return matchSearch && matchBlock && matchStatus && matchSemester;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const totalAmount = PAYMENTS.filter(p => p.semester === semester).reduce((sum, p) => sum + parseInt(p.amount.replace(/\./g, '')), 0);
  const paidCount = PAYMENTS.filter(p => p.semester === semester && p.status === 'paid').length;
  const overdueCount = PAYMENTS.filter(p => p.semester === semester && p.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thu phí KTX"
        description={`Thu phí KTX học kỳ ${semester}`}
        breadcrumbs={[{ label: 'KTX' }, { label: 'Thu phí' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<ReceiptText className="h-4 w-4" />} onClick={() => setRecordModal(true)}>Ghi nhận thu</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Tổng thu</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                {new Intl.NumberFormat('vi-VN').format(totalAmount)} đ
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đã thu</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{paidCount} lượt</p>
              <p className="text-xs text-[rgb(var(--success))]">{Math.round(paidCount / PAYMENTS.filter(p => p.semester === semester).length * 100)}% đạt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Quá hạn</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{overdueCount} SV</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Chưa thu</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                {PAYMENTS.filter(p => p.semester === semester && p.status !== 'paid').length} SV
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Select
              value={semester}
              onChange={(e) => { setSemester(e.target.value); setPage(1); }}
              options={SEMESTERS.map(s => ({ value: s, label: s }))}
              className="w-52"
              label="Học kỳ"
            />
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input placeholder="Tìm tên hoặc mã SV..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={block} onChange={(e) => setBlock(e.target.value)} options={BLOCKS.map(b => ({ value: b, label: b }))} className="w-36" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[
              { value: 'Tất cả', label: 'Tất cả' },
              { value: 'paid', label: 'Đã nộp' },
              { value: 'pending', label: 'Chưa nộp' },
              { value: 'overdue', label: 'Quá hạn' },
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Họ tên</TableHeadCell>
                <TableHeadCell>Phòng</TableHeadCell>
                <TableHeadCell>Khu</TableHeadCell>
                <TableHeadCell>Số tiền</TableHeadCell>
                <TableHeadCell>Hạn nộp</TableHeadCell>
                <TableHeadCell>Ngày nộp</TableHeadCell>
                <TableHeadCell>Cách thức</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmpty colSpan={10} message="Không tìm thấy bản ghi nào" />
              ) : (
                paged.map((p) => {
                  const sc = STATUS_CONFIG[p.status];
                  return (
                    <TableRow key={p.id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{p.studentId}</TableCell>
                      <TableCell className="text-sm font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.room}</TableCell>
                      <TableCell className="text-sm">{p.block}</TableCell>
                      <TableCell className="text-sm font-medium text-[rgb(var(--text-primary))]">
                        {new Intl.NumberFormat('vi-VN').format(parseInt(p.amount.replace(/\./g, '')))} đ
                      </TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{p.dueDate}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{p.paidDate || '—'}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{p.method || '—'}</TableCell>
                      <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                      <TableCell>
                        {p.status !== 'paid' && (
                          <Button variant="ghost" size="sm" onClick={() => setPayModal(p)}>Thu tiền</Button>
                        )}
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

      {/* Modal: Ghi nhận thu (tổng hợp) */}
      <Modal open={recordModal} onClose={() => setRecordModal(false)} title="Ghi nhận thu phí KTX" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Học kỳ"
              options={SEMESTERS.map(s => ({ value: s, label: s }))}
            />
            <Select
              label="Khu"
              options={BLOCKS.map(b => ({ value: b === 'Tất cả' ? '' : b, label: b }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mã sinh viên" placeholder="Để trống = tất cả SV" />
            <Input label="Số tiền thu" placeholder="VD: 1.200.000" />
          </div>
          <hr className="border-[rgb(var(--border))]" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày thu" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            <Select
              label="Cách thức thanh toán"
              options={[
                { value: 'chuyen-khoan', label: 'Chuyển khoản' },
                { value: 'tien-mat', label: 'Tiền mặt' },
                { value: 'vi-dien-tu', label: 'Ví điện tử' },
              ]}
            />
          </div>
          <Input label="Mã phiếu thu" placeholder="Hệ thống tự sinh hoặc nhập thủ công" />
          <Input label="Ghi chú" placeholder="Ghi chú thu phí..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRecordModal(false)}>Hủy</Button>
            <Button onClick={() => setRecordModal(false)}>Ghi nhận</Button>
          </div>
        </div>
      </Modal>

      {/* Pay Modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Thu phí KTX từ sinh viên" size="md">
        {payModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Sinh viên</p>
                <p className="font-medium">{payModal.name}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Mã SV</p>
                <p className="font-mono">{payModal.studentId}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Phòng</p>
                <p className="font-medium">{payModal.room} — {payModal.block}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Số tiền</p>
                <p className="font-bold text-[rgb(var(--primary))]">
                  {new Intl.NumberFormat('vi-VN').format(parseInt(payModal.amount.replace(/\./g, '')))} đ
                </p>
              </div>
            </div>
            <hr className="border-[rgb(var(--border))]" />
            <div className="space-y-3">
              <Input label="Ngày nộp" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              <Select
                label="Cách thức thanh toán"
                options={[
                  { value: 'chuyen-khoan', label: 'Chuyển khoản' },
                  { value: 'tien-mat', label: 'Tiền mặt' },
                  { value: 'vi-dien-tu', label: 'Ví điện tử' },
                ]}
              />
              <Input label="Ghi chú" placeholder="Ví dụ: Nộp muộn, miễn giảm..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPayModal(null)}>Hủy</Button>
              <Button onClick={() => setPayModal(null)}>Xác nhận thu</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
