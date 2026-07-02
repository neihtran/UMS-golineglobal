import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const REVIEW_TITLES: Record<string, string> = {
  r1: 'Kiểm định chương trình CNTT',
  r2: 'Đánh giá nội bộ hệ thống quản lý',
  r3: 'Kiểm định chương trình Kế toán',
  r4: 'Cập nhật hồ sơ kiểm định Vật lý',
};

const EVIDENCE_ITEMS = [
  { id: 'ev1', title: 'Syllabus CTĐT CNTT 2024', type: 'Tài liệu', uploadedBy: 'PGS.TS. Lý Văn Hùng', uploadDate: '2026-05-10', status: 'approved', size: '2.4 MB' },
  { id: 'ev2', title: 'Kết quả khảo sát sinh viên 2025', type: 'Kết quả khảo sát', uploadedBy: 'TS. Thảo Nguyễn', uploadDate: '2026-04-22', status: 'approved', size: '1.8 MB' },
  { id: 'ev3', title: 'Báo cáo giảng dạy HK1/2025-2026', type: 'Báo cáo', uploadedBy: 'GS.TS. Nguyễn Hoàng Long', uploadDate: '2026-03-15', status: 'review', size: '5.1 MB' },
  { id: 'ev4', title: 'Mẫu đánh giá môn học AUN', type: 'Biểu mẫu', uploadedBy: 'TS. Trần Thị Mai Lan', uploadDate: '2026-01-20', status: 'approved', size: '0.8 MB' },
  { id: 'ev5', title: 'Biên bản họp Hội đồng kiểm định', type: 'Biên bản', uploadedBy: 'PGS.TS. Hoàng Thị Lan', uploadDate: '2026-06-01', status: 'pending', size: '1.1 MB' },
];

const EVIDENCE_STATUS = {
  approved: { variant: 'success' as const, label: 'Đã duyệt' },
  review: { variant: 'warning' as const, label: 'Đang xem xét' },
  pending: { variant: 'neutral' as const, label: 'Chưa duyệt' },
};

export default function ReviewEvidence() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const reviewTitle = REVIEW_TITLES[id ?? ''] ?? 'Kiểm định';
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Minh chứng — ${reviewTitle}`}
        description={`QA-02 — Danh sách minh chứng kiểm định chất lượng`}
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Kiểm định chất lượng', href: '/qa/kiem-dinh' },
          { label: 'Minh chứng' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/qa/kiem-dinh/${id}`)}>
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tên minh chứng</TableHeadCell>
                <TableHeadCell>Loại</TableHeadCell>
                <TableHeadCell>Người tải</TableHeadCell>
                <TableHeadCell>Ngày tải</TableHeadCell>
                <TableHeadCell>Dung lượng</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-center">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {EVIDENCE_ITEMS.length === 0 ? (
                <TableEmpty colSpan={7} message="Chưa có minh chứng nào" />
              ) : (
                EVIDENCE_ITEMS.map((ev) => {
                  const esc = EVIDENCE_STATUS[ev.status as keyof typeof EVIDENCE_STATUS];
                  return (
                    <TableRow key={ev.id}>
                      <TableCell className="text-sm font-medium text-[rgb(var(--text-primary))]">{ev.title}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{ev.type}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{ev.uploadedBy}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{ev.uploadDate}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{ev.size}</TableCell>
                      <TableCell><Badge variant={esc.variant} dot size="sm">{esc.label}</Badge></TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="sm">Xem</Button>
                          <Button variant="ghost" size="sm">Tải về</Button>
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

          <div className="flex justify-end mt-4">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`/qa/kiem-dinh/${id}/minh-chung/tao`)}>
              Thêm minh chứng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
