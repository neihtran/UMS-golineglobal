import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
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

const BLOCKS = ['Tất cả', 'Khu A', 'Khu B', 'Khu C'];
const ISSUE_TYPES = ['Tất cả', 'Hạ tầng', 'Điện nước', 'Vệ sinh', 'An ninh', 'Khác'];
const SEVERITIES = ['Tất cả', 'Bình thường', 'Nghiêm trọng', 'Khẩn cấp'];

const INCIDENTS = [
  { id: 'SC001', room: 'A201', block: 'Khu A', reporter: 'Lê Văn Cường', studentId: 'SV20230005', type: 'Điện nước', severity: 'Nghiêm trọng', description: 'Bóng đèn hỏng, ổ cắm lỏng, rò rỉ nước ở vòi rửa', reportedAt: '2026-06-23 08:30', status: 'pending' },
  { id: 'SC002', room: 'B201', block: 'Khu B', reporter: 'Đặng Thị Hà', studentId: 'SV20240004', type: 'Hạ tầng', severity: 'Bình thường', description: 'Cửa sổ không đóng được, bản lề lỏng', reportedAt: '2026-06-24 10:15', status: 'pending' },
  { id: 'SC003', room: 'C301', block: 'Khu C', reporter: 'Hoàng Minh Tuấn', studentId: 'SV20230008', type: 'Điện nước', severity: 'Khẩn cấp', description: 'Mất điện toàn phòng, cầu dao nhảy liên tục', reportedAt: '2026-06-25 22:05', status: 'processing' },
  { id: 'SC004', room: 'A102', block: 'Khu A', reporter: 'Nguyễn Văn An', studentId: 'SV20240001', type: 'Vệ sinh', severity: 'Bình thường', description: 'Khu vực hành lang tầng 1 cần dọn dẹp', reportedAt: '2026-06-20 14:00', status: 'resolved' },
  { id: 'SC005', room: 'B102', block: 'Khu B', reporter: 'Phạm Thu Dung', studentId: 'SV20240003', type: 'An ninh', severity: 'Nghiêm trọng', description: 'Phát hiện người lạ vào khu nữ giờ ngủ', reportedAt: '2026-06-22 02:30', status: 'resolved' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string; icon: React.ReactNode }> = {
  pending: { variant: 'warning', label: 'Chờ xử lý', icon: <Clock className="h-3.5 w-3.5" /> },
  processing: { variant: 'info', label: 'Đang xử lý', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  resolved: { variant: 'success', label: 'Đã xử lý', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected: { variant: 'neutral', label: 'Từ chối', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const SEVERITY_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  'Bình thường': { variant: 'success', label: 'Bình thường' },
  'Nghiêm trọng': { variant: 'warning', label: 'Nghiêm trọng' },
  'Khẩn cấp': { variant: 'error', label: 'Khẩn cấp' },
};

export default function SuCoKTX() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [block, setBlock] = useState('Tất cả');
  const [issueType, setIssueType] = useState('Tất cả');
  const [sev, setSev] = useState('Tất cả');
  const [detailModal, setDetailModal] = useState<typeof INCIDENTS[0] | null>(null);
  const [processModal, setProcessModal] = useState<typeof INCIDENTS[0] | null>(null);
  const [reportModal, setReportModal] = useState(false);

  const filtered = INCIDENTS.filter((i) => {
    const matchSearch = !search || i.reporter.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    const matchBlock = block === 'Tất cả' || i.block === block;
    const matchType = issueType === 'Tất cả' || i.type === issueType;
    const matchSev = sev === 'Tất cả' || i.severity === sev;
    return matchSearch && matchBlock && matchType && matchSev;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const pending = INCIDENTS.filter(i => i.status === 'pending').length;
  const processing = INCIDENTS.filter(i => i.status === 'processing').length;
  const resolved = INCIDENTS.filter(i => i.status === 'resolved').length;
  const urgent = INCIDENTS.filter(i => i.severity === 'Khẩn cấp').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sự cố KTX"
        description="Tiếp nhận và xử lý sự cố trong ký túc xá"
        breadcrumbs={[{ label: 'KTX' }, { label: 'Sự cố' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<AlertTriangle className="h-4 w-4" />}>Báo cáo tổng hợp</Button>
            <Button leftIcon={<AlertTriangle className="h-4 w-4" />} onClick={() => setReportModal(true)}>Tiếp nhận sự cố</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Chờ xử lý</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đang xử lý</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{processing}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đã xử lý</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{resolved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Khẩn cấp</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{urgent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input placeholder="Tìm tên SV hoặc mã sự cố..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={block} onChange={(e) => { setBlock(e.target.value); setPage(1); }} options={BLOCKS.map(b => ({ value: b, label: b }))} className="w-36" />
            <Select value={issueType} onChange={(e) => { setIssueType(e.target.value); setPage(1); }} options={ISSUE_TYPES.map(t => ({ value: t, label: t }))} className="w-40" />
            <Select value={sev} onChange={(e) => { setSev(e.target.value); setPage(1); }} options={SEVERITIES.map(s => ({ value: s, label: s }))} className="w-40" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã</TableHeadCell>
                <TableHeadCell>Phòng</TableHeadCell>
                <TableHeadCell>Người báo cáo</TableHeadCell>
                <TableHeadCell>Loại</TableHeadCell>
                <TableHeadCell>Mức độ</TableHeadCell>
                <TableHeadCell>Ngày báo</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmpty colSpan={8} message="Không tìm thấy sự cố nào" />
              ) : (
                paged.map((i) => {
                  const sc = STATUS_CONFIG[i.status];
                  const svc = SEVERITY_CONFIG[i.severity];
                  return (
                    <TableRow key={i.id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell className="text-xs font-mono font-bold text-[rgb(var(--text-primary))]">{i.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{i.room}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{i.block}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{i.reporter}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{i.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{i.type}</TableCell>
                      <TableCell><Badge variant={svc.variant} size="sm">{i.severity}</Badge></TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{i.reportedAt}</TableCell>
                      <TableCell>
                        <Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setDetailModal(i)}>Chi tiết</Button>
                          {i.status !== 'resolved' && (
                            <Button variant="ghost" size="sm" onClick={() => setProcessModal(i)}>Xử lý</Button>
                          )}
                        </div>
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

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Chi tiết sự cố" size="lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[rgb(var(--warning)/0.05)] border border-[rgb(var(--warning)/0.2)]">
              <AlertTriangle className="h-5 w-5 text-[rgb(var(--warning))] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">Phòng {detailModal.room} — {detailModal.block}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))] mt-0.5">{detailModal.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Mã sự cố</p>
                <p className="font-mono font-bold">{detailModal.id}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Loại</p>
                <p className="font-medium">{detailModal.type}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Người báo cáo</p>
                <p className="font-medium">{detailModal.reporter}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Mã SV</p>
                <p className="font-mono">{detailModal.studentId}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Mức độ</p>
                <Badge variant={SEVERITY_CONFIG[detailModal.severity].variant} size="sm">{detailModal.severity}</Badge>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Trạng thái</p>
                <Badge variant={STATUS_CONFIG[detailModal.status].variant} size="sm">{STATUS_CONFIG[detailModal.status].label}</Badge>
              </div>
              <div>
                <p className="text-[rgb(var(--text-muted))] text-xs">Ngày báo cáo</p>
                <p>{detailModal.reportedAt}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDetailModal(null)}>Đóng</Button>
              {detailModal.status !== 'resolved' && (
                <Button onClick={() => { setDetailModal(null); setProcessModal(detailModal); }}>Xử lý ngay</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Process Modal */}
      <Modal open={!!processModal} onClose={() => setProcessModal(null)} title="Xử lý sự cố" size="md">
        {processModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] text-sm">
              <p className="font-medium">{processModal.description}</p>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Phòng {processModal.room} · {processModal.block} · {processModal.reportedAt}</p>
            </div>
            <Select
              label="Trạng thái xử lý"
              options={[
                { value: 'processing', label: 'Đang xử lý' },
                { value: 'resolved', label: 'Đã xử lý xong' },
                { value: 'rejected', label: 'Từ chối (không hợp lệ)' },
              ]}
            />
            <Input label="Phương án xử lý" placeholder="Mô tả cách xử lý đã thực hiện..." />
            <Input label="Ngày hoàn thành (dự kiến)" type="date" />
            <Input label="Ghi chú" placeholder="Ghi chú thêm nếu có..." />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setProcessModal(null)}>Hủy</Button>
              <Button onClick={() => setProcessModal(null)}>Cập nhật</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Tiếp nhận sự cố mới */}
      <Modal open={reportModal} onClose={() => setReportModal(false)} title="Tiếp nhận sự cố KTX" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phòng" placeholder="VD: A201" />
            <Select
              label="Khu"
              options={[
                { value: 'Khu A', label: 'Khu A' },
                { value: 'Khu B', label: 'Khu B' },
                { value: 'Khu C', label: 'Khu C' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mã sinh viên báo cáo" placeholder="SV2024xxx" />
            <Input label="Tên người báo cáo" placeholder="Họ và tên" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Loại sự cố"
              options={[
                { value: 'dien-nuoc', label: 'Điện nước' },
                { value: 'ha-tang', label: 'Hạ tầng' },
                { value: 've-sinh', label: 'Vệ sinh' },
                { value: 'an-ninh', label: 'An ninh' },
                { value: 'khac', label: 'Khác' },
              ]}
            />
            <Select
              label="Mức độ nghiêm trọng"
              options={[
                { value: 'binh-thuong', label: 'Bình thường' },
                { value: 'nghiem-trong', label: 'Nghiêm trọng' },
                { value: 'khan-cap', label: 'Khẩn cấp' },
              ]}
            />
          </div>
          <Input label="Mô tả sự cố" placeholder="Chi tiết sự cố, vị trí, thời gian phát hiện..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReportModal(false)}>Hủy</Button>
            <Button onClick={() => setReportModal(false)}>Tiếp nhận sự cố</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
