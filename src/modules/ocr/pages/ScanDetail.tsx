import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, CheckCircle2, Edit, Download, FileText, Clock } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ALL_DOCS: Record<string, {
  name: string; type: string; pages: number; size: string;
  uploadedAt: string; processedAt: string; status: string;
  accuracy: number; reviewer: string; reviewedAt: string;
  source: string; docType: string; fields: { field: string; value: string; confidence: number }[];
}> = {
  d1: {
    name: 'Hồ sơ tuyển dụng 2026-001', type: 'Hồ sơ nhân sự', pages: 8, size: '4.2 MB',
    uploadedAt: '2026-06-20 08:15:00', processedAt: '2026-06-20 08:17:32',
    status: 'done', accuracy: 98.2, reviewer: 'Admin Hệ thống', reviewedAt: '2026-06-20 10:00:00',
    source: 'HRM', docType: 'PDF',
    fields: [
      { field: 'Họ và tên', value: 'Trần Văn B', confidence: 99.1 },
      { field: 'Ngày sinh', value: '20/05/1992', confidence: 98.7 },
      { field: 'Số CCCD', value: '001234567891', confidence: 99.5 },
      { field: 'Trình độ', value: 'Thạc sĩ CNTT', confidence: 97.0 },
      { field: 'Vị trí ứng tuyển', value: 'Chuyên viên phát triển phần mềm', confidence: 96.2 },
      { field: 'Kinh nghiệm', value: '5 năm', confidence: 95.0 },
    ],
  },
  d2: {
    name: 'Hợp đồng lao động HLĐ-2026-042', type: 'Hợp đồng', pages: 3, size: '1.8 MB',
    uploadedAt: '2026-06-20 14:30:00', processedAt: '2026-06-20 14:32:15',
    status: 'done', accuracy: 99.5, reviewer: 'Nguyễn Văn Admin', reviewedAt: '2026-06-21 09:00:00',
    source: 'HRM', docType: 'PDF',
    fields: [
      { field: 'Họ và tên', value: 'Nguyễn Văn A', confidence: 99.2 },
      { field: 'Ngày sinh', value: '15/03/1990', confidence: 98.5 },
      { field: 'Số CCCD', value: '001234567890', confidence: 99.8 },
      { field: 'Ngày ký hợp đồng', value: '01/01/2026', confidence: 97.0 },
      { field: 'Loại hợp đồng', value: 'Hợp đồng không xác định thời hạn', confidence: 95.0 },
      { field: 'Lương thỏa thuận', value: '15.000.000 đ/tháng', confidence: 94.0 },
      { field: 'Đơn vị', value: 'Khoa Công nghệ thông tin', confidence: 96.5 },
    ],
  },
  d3: {
    name: 'Bằng tốt nghiệp SV-2020-001', type: 'Bằng cấp', pages: 2, size: '2.1 MB',
    uploadedAt: '2026-06-19 09:00:00', processedAt: '2026-06-19 09:02:45',
    status: 'done', accuracy: 97.8, reviewer: 'Admin Hệ thống', reviewedAt: '2026-06-19 11:00:00',
    source: 'SIS', docType: 'JPG',
    fields: [
      { field: 'Họ và tên', value: 'Phạm Thị C', confidence: 99.0 },
      { field: 'Ngày sinh', value: '10/08/1998', confidence: 98.2 },
      { field: 'Số hiệu bằng', value: 'KT-2020-00123', confidence: 99.8 },
      { field: 'Loại bằng', value: 'Cử nhân', confidence: 98.5 },
      { field: 'Ngành', value: 'Công nghệ thông tin', confidence: 97.0 },
      { field: 'Xếp loại', value: 'Giỏi', confidence: 96.0 },
    ],
  },
  d4: {
    name: 'Sổ điểm K60-CNTT', type: 'Sổ điểm', pages: 120, size: '45.6 MB',
    uploadedAt: '2026-06-18 07:00:00', processedAt: '2026-06-18 07:45:00',
    status: 'review', accuracy: 84.2, reviewer: '—', reviewedAt: '—',
    source: 'SIS', docType: 'PDF',
    fields: [
      { field: 'Lớp', value: 'K60-CNTT', confidence: 98.0 },
      { field: 'Số sinh viên', value: '45 người', confidence: 97.5 },
      { field: 'Số môn học', value: '12 môn', confidence: 95.0 },
      { field: 'Ghi chú', value: 'Cần rà soát tay 15 trường dữ liệu', confidence: 84.2 },
    ],
  },
};

export default function ScanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = ALL_DOCS[id ?? 'd1'] ?? ALL_DOCS['d1'];
  const s = doc;

  const statusBadge = s.status === 'done'
    ? { variant: 'success' as const, label: 'Hoàn thành' }
    : s.status === 'review'
    ? { variant: 'warning' as const, label: 'Cần rà soát' }
    : s.status === 'processing'
    ? { variant: 'neutral' as const, label: 'Đang xử lý' }
    : { variant: 'error' as const, label: 'Lỗi' };

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.name}
        description={`${s.docType} · ${s.pages} trang · ${s.size} · Nguồn: ${s.source}`}
        breadcrumbs={[
          { label: 'OCR', href: '/ocr' },
          { label: 'Tài liệu số hóa', href: '/ocr/danh-sach' },
          { label: s.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/ocr/danh-sach')}>
              Quay lại
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Tải file gốc</Button>
            {s.status !== 'processing' && (
              <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>Chỉnh sửa dữ liệu</Button>
            )}
            {s.status === 'review' && (
              <Button size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />}>Xác nhận & Lưu</Button>
            )}
          </div>
        }
      />

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {s.status === 'done' ? (
          <Card className="bg-[rgb(var(--success)/0.05)] border-[rgb(var(--success)/0.2)]">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-[rgb(var(--success))] mx-auto" />
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mt-2">Đã xử lý thành công</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">OCR hoàn tất lúc {s.processedAt}</p>
            </CardContent>
          </Card>
        ) : s.status === 'processing' ? (
          <Card className="bg-[rgb(var(--primary)/0.05)] border-[rgb(var(--primary)/0.2)]">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-[rgb(var(--primary))] mx-auto animate-pulse" />
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mt-2">Đang xử lý OCR</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">Vui lòng chờ trong giây lát...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[rgb(var(--warning)/0.05)] border-[rgb(var(--warning)/0.2)]">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-[rgb(var(--warning))] mx-auto" />
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mt-2">Cần rà soát thủ công</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.pages} trang — độ chính xác {s.accuracy}%</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Độ chính xác OCR</p>
            <p className={`text-3xl font-black mt-2 ${s.accuracy >= 97 ? 'text-[rgb(var(--success))]' : s.accuracy >= 90 ? 'text-[rgb(var(--info))]' : 'text-[rgb(var(--warning))]'}`}>
              {s.accuracy > 0 ? `${s.accuracy}%` : '—'}
            </p>
            <p className="text-xs text-[rgb(var(--text-muted))]">{s.fields.length} trường trích xuất</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Trạng thái</p>
            <div className="mt-2"><Badge variant={statusBadge.variant} dot>{statusBadge.label}</Badge></div>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Người duyệt: {s.reviewer}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Extracted data */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Dữ liệu trích xuất</h3>
              <Badge variant="neutral">{s.fields.length} trường</Badge>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {s.fields.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1">
                    <p className="text-sm text-[rgb(var(--text-secondary))]">{d.field}</p>
                    <p className="text-base font-semibold text-[rgb(var(--text-primary))]">{d.value}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <Badge
                      variant={d.confidence >= 98 ? 'success' : d.confidence >= 95 ? 'info' : 'warning'}
                      size="sm"
                    >
                      {d.confidence}%
                    </Badge>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">Độ chính xác</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Document info */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin tài liệu</h3>
            </div>
            <CardContent className="space-y-3 pt-4">
              {[
                { label: 'Tên file', value: s.name },
                { label: 'Loại tài liệu', value: s.type },
                { label: 'Nguồn', value: s.source },
                { label: 'Định dạng', value: s.docType },
                { label: 'Số trang', value: `${s.pages} trang` },
                { label: 'Dung lượng', value: s.size },
                { label: 'Ngày tải lên', value: s.uploadedAt },
                { label: 'Ngày xử lý', value: s.processedAt },
              ].map(({ label, value }) => (
                <div key={label} className="border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                  <p className="text-[10px] uppercase tracking-wide text-[rgb(var(--text-muted))]">{label}</p>
                  <p className="text-sm text-[rgb(var(--text-primary))] mt-0.5">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 space-y-2">
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>Xem file gốc</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Xuất dữ liệu (JSON)</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>Chỉnh sửa dữ liệu</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

