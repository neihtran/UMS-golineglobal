import { Award, Download, Plus } from 'lucide-react';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, DetailModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useNavigate } from 'react-router-dom';
import { useDetailModal } from '@/hooks/useDetailModal';
import CourseDetail from './CourseDetail';

const COURSES = [
  { id: 'dc1', code: 'DCE-ICT-01', name: 'Kỹ năng số cơ bản', category: 'CNTT', instructor: 'TS. Nguyễn Văn A', enrolled: 245, completed: 198, avgScore: 85, level: 'level1', status: 'active', duration: '6 tuần' },
  { id: 'dc2', code: 'DCE-EDU-01', name: 'Ứng dụng AI trong giảng dạy', category: 'AI & Giáo dục', instructor: 'PGS.TS. Trần Thị B', enrolled: 120, completed: 95, avgScore: 78, level: 'level3', status: 'active', duration: '8 tuần' },
  { id: 'dc3', code: 'DCE-DATA-01', name: 'Phân tích dữ liệu với Python', category: 'Khoa học dữ liệu', instructor: 'TS. Lê Văn C', enrolled: 180, completed: 150, avgScore: 82, level: 'level2', status: 'active', duration: '10 tuần' },
  { id: 'dc4', code: 'DCE-SOFT-01', name: 'Kỹ năng mềm cho nhà giáo dục', category: 'Kỹ năng mềm', instructor: 'ThS. Phạm Thị D', enrolled: 320, completed: 280, avgScore: 90, level: 'level1', status: 'active', duration: '4 tuần' },
  { id: 'dc5', code: 'DCE-CLOUD-01', name: 'Điện toán đám mây cơ bản', category: 'CNTT', instructor: 'TS. Hoàng Văn E', enrolled: 88, completed: 70, avgScore: 75, level: 'level3', status: 'draft', duration: '8 tuần' },
];

const LEVEL_CONFIG: Record<string, { label: string; variant: 'info' | 'warning' | 'accent' | 'primary' }> = {
  level1: { label: 'Cơ bản', variant: 'info' },
  level2: { label: 'Trung cấp', variant: 'warning' },
  level3: { label: 'Nâng cao', variant: 'accent' },
  level4: { label: 'Chuyên gia', variant: 'primary' },
};

export default function CourseCatalog() {
  const navigate = useNavigate();
  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedCourse = selectedId ? COURSES.find((c) => c.id === selectedId) : null;
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
            <Badge variant="success">{COURSES.length} khóa học</Badge>
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
          <TableBody>
            {COURSES.map((c) => {
              const lc = LEVEL_CONFIG[c.level];
              return (
                <TableRow key={c.id} className="hover:bg-[rgb(var(--bg-hover))] cursor-pointer" onClick={() => openDetail(c.id)}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{c.code}</TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{c.name}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.category}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.instructor}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.duration}</TableCell>
                  <TableCell><Badge variant={lc.variant} size="sm">{lc.label}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.enrolled}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.completed}</TableCell>
                  <TableCell className="font-semibold text-[rgb(var(--text-primary))]">{c.avgScore}%</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'active' ? 'success' : 'info'} dot size="sm">
                      {c.status === 'active' ? 'Đang mở' : 'Bản nháp'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedCourse ? selectedCourse.name : ''}
        description={selectedCourse ? `${selectedCourse.code} · ${selectedCourse.category} · ${selectedCourse.instructor}` : ''}
        size="fullscreen"
      >
        {selectedCourse ? <CourseDetail id={selectedCourse.id} /> : null}
      </DetailModal>
    </div>
  );
}
