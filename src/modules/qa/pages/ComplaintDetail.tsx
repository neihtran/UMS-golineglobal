import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COMPLAINTS = [
  { id: 'kn001', code: 'KN-2026-001', student: 'Nguyễn Văn An', class: 'K60-CNTT', category: 'Giảng dạy', content: 'Giảng viên đến lớp muộn, giảng chưa đúng chương trình', date: '2026-06-20', status: 'processing', priority: 'high', handler: 'Phòng Đào tạo', response: 'Đang xử lý', notes: 'Đã liên hệ giảng viên, yêu cầu báo cáo.' },
  { id: 'kn002', code: 'KN-2026-002', student: 'Lê Thị Bình', class: 'K59-KT', category: 'Học phí', content: 'Lỗi tính học phí học kỳ 1, bị tính trùng môn học', date: '2026-06-18', status: 'resolved', priority: 'medium', handler: 'Phòng Tài chính', response: 'Đã điều chỉnh, hoàn trả 2.5 triệu đồng', notes: 'Đã kiểm tra và điều chỉnh.' },
  { id: 'kn003', code: 'KN-2026-003', student: 'Trần Văn Cường', class: 'K60-Luat', category: 'Cơ sở vật chất', content: 'Phòng học thiếu bảng, máy chiếu không hoạt động', date: '2026-06-15', status: 'pending', priority: 'medium', handler: 'Phòng HCNS', response: 'Chưa phản hồi', notes: '' },
  { id: 'kn004', code: 'KN-2026-004', student: 'Phạm Thu Dung', class: 'K60-NN', category: 'Tuyển sinh', content: 'Thông tin tuyển sinh không đúng, gây hiểu lầm', date: '2026-06-12', status: 'resolved', priority: 'high', handler: 'Phòng Tuyển sinh', response: 'Đã cập nhật thông tin, gửi email xin lỗi', notes: 'Đã cập nhật website.' },
  { id: 'kn005', code: 'KN-2026-005', student: 'Hoàng Minh Tuấn', class: 'K61-CNTT', category: 'Ký túc xá', content: 'Wifi ký túc xá không hoạt động 3 ngày', date: '2026-06-10', status: 'processing', priority: 'low', handler: 'Phòng CNTT', response: 'Đang sửa chữa', notes: 'Đã gửi kỹ thuật viên xuống.' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info' | 'error'; label: string }> = {
  pending: { variant: 'info', label: 'Chờ xử lý' },
  processing: { variant: 'warning', label: 'Đang xử lý' },
  resolved: { variant: 'success', label: 'Đã giải quyết' },
  rejected: { variant: 'error', label: 'Từ chối' },
};

const PRIORITY_VARIANTS: Record<string, 'error' | 'warning' | 'info'> = {
  high: 'error', medium: 'warning', low: 'info',
};

export default function ComplaintDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const c = COMPLAINTS.find((x) => x.id === id);
  const sc = c ? STATUS_CONFIG[c.status] : null;

  if (!c) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold text-[rgb(var(--text-primary))]">Không tìm thấy khiếu nại</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/qa/khieu-nai')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${c.code} — Chi tiết`}
        description={c.content}
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Khiếu nại', href: '/qa/khieu-nai' },
          { label: c.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất hồ sơ</Button>
            <Button variant="outline" leftIcon={<CheckCircle2 className="h-4 w-4" />}>Tiếp nhận</Button>
            <Button variant="outline" leftIcon={<XCircle className="h-4 w-4" />}>Từ chối</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={PRIORITY_VARIANTS[c.priority] ?? 'info'}>{c.priority === 'high' ? 'Cao' : c.priority === 'medium' ? 'Trung bình' : 'Thấp'}</Badge>
            <Badge variant="neutral">{c.category}</Badge>
            <Badge variant={sc?.variant} dot>{sc?.label}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Người khiếu nại', value: c.student },
              { label: 'Lớp', value: c.class },
              { label: 'Ngày gửi', value: c.date },
              { label: 'Phụ trách', value: c.handler },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{item.label}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-1">Nội dung khiếu nại</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{c.content}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-1">Phản hồi hiện tại</p>
            <p className="text-sm text-[rgb(var(--text-primary))]">{c.response}</p>
          </div>

          {c.notes && (
            <div>
              <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-1">Ghi chú nội bộ</p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{c.notes}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-2">Lịch sử xử lý</p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Thời gian</TableHeadCell>
                  <TableHeadCell>Người xử lý</TableHeadCell>
                  <TableHeadCell>Hành động</TableHeadCell>
                  <TableHeadCell>Nội dung</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { time: '2026-06-20 09:15', user: 'Hệ thống', action: 'Tiếp nhận', content: 'Khiếu nại được tạo vào hệ thống' },
                  { time: '2026-06-20 10:30', user: 'Trần Thị Mai', action: 'Phân công', content: `Phân công cho ${c.handler}` },
                  ...(c.status !== 'pending' ? [{ time: '2026-06-21 14:00', user: c.handler, action: c.status === 'processing' ? 'Đang xử lý' : 'Đã giải quyết', content: c.response }] : []),
                ].map((h, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-[rgb(var(--text-muted))]">{h.time}</TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{h.user}</TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{h.action}</Badge></TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{h.content}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/khieu-nai')}>
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
