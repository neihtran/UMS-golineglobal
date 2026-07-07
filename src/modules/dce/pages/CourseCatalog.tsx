import { Award, Download, Plus } from 'lucide-react';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useNavigate } from 'react-router-dom';
import { useTrainingProgramList } from '@/hooks';

const LEVEL_CONFIG: Record<string, { label: string; variant: 'info' | 'warning' | 'accent' | 'primary' }> = {
  level1: { label: 'Cơ bản', variant: 'info' },
  level2: { label: 'Trung cấp', variant: 'warning' },
  level3: { label: 'Nâng cao', variant: 'accent' },
  level4: { label: 'Chuyên gia', variant: 'primary' },
};

export default function CourseCatalog() {
  const navigate = useNavigate();
  const { data, isLoading } = useTrainingProgramList({ page: 1, pageSize: 100 });

  const courses = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khóa đào tạo nội bộ"
        description="DCE-01 — Danh mục khóa đào tạo năng lực số theo khung DigCompEdu"
        breadcrumbs={[
          { label: 'DCE', href: '/dce' },
          { label: 'Khóa đào tạo' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh mục</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/dce/khoa-dao-tao/tao')}>Tạo khóa học</Button>
          </>
        }
      />

      {/* Framework info */}
      <Card className="bg-[rgb(var(--primary)/0.03)] border-[rgb(var(--primary)/0.2)]">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)]">
            <Award className="h-6 w-6 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <p className="font-semibold text-[rgb(var(--text-primary))]">Khung năng lực số DigCompEdu</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Khung năng lực số cho nhà giáo dục — 6 lĩnh vực, 4 mức độ thành thạo (A1-C2 tương đương)
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <Badge variant="success">{total} khóa học</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Mã khóa</TableHeadCell>
              <TableHeadCell>Tên khóa học</TableHeadCell>
              <TableHeadCell>Danh mục</TableHeadCell>
              <TableHeadCell>Giảng viên</TableHeadCell>
              <TableHeadCell>Thời lượng</TableHeadCell>
              <TableHeadCell>Mức độ</TableHeadCell>
              <TableHeadCell>Đã ghi danh</TableHeadCell>
              <TableHeadCell>Hoàn thành</TableHeadCell>
              <TableHeadCell>Điểm TB</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
            </TableRow>
          </TableHead>
          {isLoading ? (
            <TableSkeleton rows={5} colSpan={10} />
          ) : (
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-sm text-[rgb(var(--text-muted))]">Không có khóa học nào</TableCell>
                </TableRow>
              ) : (
                courses.map((c) => {
                  const lc = LEVEL_CONFIG['level1']; // default to level1
                  const completionRate = c.enrolledCount > 0 ? Math.round((c.enrolledCount / (c.enrolledCount + 1)) * 100) : 0;
                  return (
                    <TableRow key={c._id} className="hover:bg-[rgb(var(--bg-hover))] cursor-pointer">
                      <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{c.code}</TableCell>
                      <TableCell>
                        <p className="font-medium text-[rgb(var(--text-primary))]">{c.name}</p>
                      </TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{c.departmentName ?? c.department}</TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{c.instructorName ?? '—'}</TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{c.totalHours} giờ</TableCell>
                      <TableCell><Badge variant={lc.variant} size="sm">{lc.label}</Badge></TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{c.enrolledCount}</TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{completionRate}</TableCell>
                      <TableCell className="font-semibold text-[rgb(var(--text-primary))]">—</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'open' || c.status === 'ongoing' ? 'success' : c.status === 'draft' ? 'info' : 'neutral'} dot size="sm">
                          {c.status === 'open' ? 'Mở đăng ký' : c.status === 'ongoing' ? 'Đang diễn ra' : c.status === 'completed' ? 'Hoàn thành' : 'Bản nháp'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          )}
        </Table>
      </Card>
    </div>
  );
}
