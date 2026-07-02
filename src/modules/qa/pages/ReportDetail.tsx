import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Edit3, Plus, FileSearch } from 'lucide-react';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const REPORTS = [
  { id: 'r01', code: 'AUN-2026-01', title: 'Báo cáo tự đánh giá theo chuẩn AUN-QA (Cấp chương trình)', program: 'Công nghệ thông tin', standard: '6 tiêu chuẩn', dept: 'Khoa CNTT', status: 'in_progress', dueDate: '2026-09-30', progress: 45, evidenceCount: 124, lastUpdate: '2026-06-25', assignedTo: 'PGS.TS. Lý Văn Hùng', description: 'Báo cáo đánh giá chương trình CNTT theo tiêu chuẩn AUN-QA, tập trung vào 6 tiêu chuẩn cốt lõi.' },
  { id: 'r02', code: 'AUN-2026-02', title: 'Báo cáo tự đánh giá theo chuẩn AUN-QA (Cấp chương trình)', program: 'Kinh tế', standard: '6 tiêu chuẩn', dept: 'Khoa Kinh tế', status: 'in_progress', dueDate: '2026-09-30', progress: 30, evidenceCount: 78, lastUpdate: '2026-06-20', assignedTo: 'PGS.TS. Hoàng Thị Lan', description: 'Báo cáo đánh giá chương trình Kinh tế theo AUN-QA.' },
  { id: 'r03', code: 'AUN-2025-01', title: 'Báo cáo tự đánh giá AUN-QA lần 2', program: 'Công nghệ thông tin', standard: '11 tiêu chuẩn', dept: 'Khoa CNTT', status: 'submitted', dueDate: '2025-12-15', progress: 100, evidenceCount: 312, lastUpdate: '2025-12-10', assignedTo: 'GS.TS. Nguyễn Hoàng Long', description: 'Báo cáo đánh giá toàn diện CTĐT CNTT theo 11 tiêu chuẩn AUN-QA.' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'info'; label: string }> = {
  submitted: { variant: 'success', label: 'Đã nộp' },
  in_progress: { variant: 'warning', label: 'Đang thực hiện' },
  not_started: { variant: 'neutral', label: 'Chưa bắt đầu' },
  external_assessed: { variant: 'info', label: 'Đã kiểm định ngoài' },
};

const EVIDENCE_ITEMS = [
  { id: 'e1', title: 'Syllabus CTĐT CNTT 2024', type: 'Tài liệu', uploadedBy: 'PGS.TS. Lý Văn Hùng', uploadDate: '2026-05-10', status: 'approved' },
  { id: 'e2', title: 'Kết quả khảo sát sinh viên 2025', type: 'Kết quả khảo sát', uploadedBy: 'TS. Thảo Nguyễn', uploadDate: '2026-04-22', status: 'approved' },
  { id: 'e3', title: 'Báo cáo giảng dạy HK1/2025-2026', type: 'Báo cáo', uploadedBy: 'GS.TS. Nguyễn Hoàng Long', uploadDate: '2026-03-15', status: 'review' },
  { id: 'e4', title: 'Danh sách giảng viên có bằng ThS/TS', type: 'Danh sách', uploadedBy: 'Chu Hanh', uploadDate: '2026-02-28', status: 'approved' },
  { id: 'e5', title: 'Biên bản họp Hội đồng kiểm định', type: 'Biên bản', uploadedBy: 'PGS.TS. Hoàng Thị Lan', uploadDate: '2026-06-01', status: 'pending' },
];

const EVIDENCE_STATUS = {
  approved: { variant: 'success' as const, label: 'Đã duyệt' },
  review: { variant: 'warning' as const, label: 'Đang xem xét' },
  pending: { variant: 'neutral' as const, label: 'Chưa duyệt' },
};

export default function ReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const report = REPORTS.find((r) => r.id === id);
  const sc = report ? STATUS_CONFIG[report.status] : null;
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold text-[rgb(var(--text-primary))]">Không tìm thấy báo cáo</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/qa/bao-cao')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${report.code} — Chi tiết`}
        description={report.title}
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Báo cáo chất lượng', href: '/qa/bao-cao' },
          { label: report.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button variant="outline" leftIcon={<Edit3 className="h-4 w-4" />}>Chỉnh sửa</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`/qa/bao-cao/${id}/minh-chung/tao`)}>Thêm minh chứng</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={sc?.variant} dot size="sm">{sc?.label}</Badge>
            <Badge variant="neutral" size="sm">{report.standard}</Badge>
            <Badge variant="accent" size="sm">{report.program}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Tiến độ', value: `${report.progress}%` },
              { label: 'Số minh chứng', value: report.evidenceCount.toString() },
              { label: 'Hạn nộp', value: report.dueDate },
              { label: 'Cập nhật cuối', value: report.lastUpdate },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{item.label}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{report.description}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-2">Danh sách minh chứng</p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Tên minh chứng</TableHeadCell>
                  <TableHeadCell>Loại</TableHeadCell>
                  <TableHeadCell>Người tải</TableHeadCell>
                  <TableHeadCell>Ngày tải</TableHeadCell>
                  <TableHeadCell>Trạng thái</TableHeadCell>
                  <TableHeadCell className="text-center">Thao tác</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {EVIDENCE_ITEMS.length === 0 ? (
                  <TableEmpty colSpan={6} message="Chưa có minh chứng" />
                ) : (
                  EVIDENCE_ITEMS.map((ev) => {
                    const esc = EVIDENCE_STATUS[ev.status as keyof typeof EVIDENCE_STATUS];
                    return (
                      <TableRow key={ev.id}>
                        <TableCell className="text-sm font-medium text-[rgb(var(--text-primary))]">{ev.title}</TableCell>
                        <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{ev.type}</TableCell>
                        <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{ev.uploadedBy}</TableCell>
                        <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{ev.uploadDate}</TableCell>
                        <TableCell><Badge variant={esc.variant} dot size="sm">{esc.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="sm" leftIcon={<FileSearch className="h-3.5 w-3.5" />}>Xem</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              page={pagination.page} pageSize={pagination.pageSize} total={EVIDENCE_ITEMS.length}
              onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/bao-cao')}>
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
