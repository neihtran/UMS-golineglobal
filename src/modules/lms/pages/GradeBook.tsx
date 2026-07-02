import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COURSES = [
  { id: 'c1', code: 'INT2201', name: 'Cấu trúc dữ liệu', instructor: 'TS. Nguyễn Văn A', semester: 'HK2/2025-2026', credits: 4, students: 45, graded: 42, avgScore: 7.4 },
  { id: 'c2', code: 'INT3110', name: 'Cơ sở dữ liệu', instructor: 'PGS.TS. Trần Thị B', semester: 'HK2/2025-2026', credits: 4, students: 45, graded: 45, avgScore: 8.1 },
  { id: 'c3', code: 'INT1005', name: 'Nhập môn Tin học', instructor: 'TS. Lê Văn C', semester: 'HK2/2025-2026', credits: 3, students: 52, graded: 50, avgScore: 6.9 },
];

const GRADES = [
  { studentId: 'sv001', name: 'Nguyễn Văn An', theoryScore: 8.5, practiceScore: 9.0, finalScore: 8.2, avgScore: 8.5, grade: 'A', gpa: 3.7, rank: 1, status: 'graded' },
  { studentId: 'sv002', name: 'Trần Thị Bình', theoryScore: 7.0, practiceScore: 7.5, finalScore: 7.0, avgScore: 7.2, grade: 'B+', gpa: 3.5, rank: 2, status: 'graded' },
  { studentId: 'sv003', name: 'Lê Hoàng Cường', theoryScore: 6.0, practiceScore: 6.5, finalScore: 6.5, avgScore: 6.3, grade: 'C', gpa: 2.0, rank: 3, status: 'graded' },
  { studentId: 'sv004', name: 'Phạm Thị Dung', theoryScore: null, practiceScore: null, finalScore: null, avgScore: null, grade: null, gpa: null, rank: null, status: 'pending' },
  { studentId: 'sv005', name: 'Đặng Minh Tuấn', theoryScore: 9.0, practiceScore: 8.5, finalScore: 9.0, avgScore: 8.8, grade: 'A', gpa: 4.0, rank: 1, status: 'graded' },
];

const GRADE_COLORS: Record<string, string> = {
  'A': '#16A34A', 'A+': '#16A34A', 'B+': '#2D5D8A', 'B': '#2D5D8A', 'C+': '#E8A020', 'C': '#E8A020', 'D+': '#DC2626', 'D': '#DC2626', 'F': '#DC2626',
};

export default function LMSGradeBook() {
  const [selected, setSelected] = useState(COURSES[0]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điểm (LMS)"
        description="LMS-01 — Xem và xuất điểm học tập theo môn học"
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Bảng điểm' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất bảng điểm</Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-3">
          {COURSES.map((c) => (
            <Card
              key={c.id}
              className={`cursor-pointer transition-all ${selected.id === c.id ? 'border-[rgb(var(--primary))] ring-1 ring-[rgb(var(--primary)/0.2)]' : 'hover:border-[rgb(var(--border))]'}`}
              onClick={() => setSelected(c)}
            >
              <CardContent className="p-4">
                <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{c.code}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{c.name}</p>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{c.instructor}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{c.graded}/{c.students} đã chấm</span>
                  <span className="text-lg font-bold text-[rgb(var(--text-primary))]">{c.avgScore.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{selected.name}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))]">{selected.code} · {selected.semester} · {selected.credits} tín chỉ</p>
              </div>
              <Badge variant="success">{selected.avgScore.toFixed(1)} TB lớp</Badge>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>STT</TableHeadCell>
                  <TableHeadCell>Mã SV</TableHeadCell>
                  <TableHeadCell>Họ tên</TableHeadCell>
                  <TableHeadCell>Lý thuyết</TableHeadCell>
                  <TableHeadCell>Thực hành</TableHeadCell>
                  <TableHeadCell>Cuối kỳ</TableHeadCell>
                  <TableHeadCell>TB môn</TableHeadCell>
                  <TableHeadCell>Điểm chữ</TableHeadCell>
                  <TableHeadCell>Xếp hạng</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {GRADES.map((g, i) => (
                  <TableRow key={g.studentId}>
                    <TableCell className="text-[rgb(var(--text-muted))]">{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{g.studentId}</TableCell>
                    <TableCell className="font-medium text-[rgb(var(--text-primary))]">{g.name}</TableCell>
                    <TableCell className="text-center text-[rgb(var(--text-secondary))]">{g.theoryScore?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell className="text-center text-[rgb(var(--text-secondary))]">{g.practiceScore?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell className="text-center text-[rgb(var(--text-secondary))]">{g.finalScore?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{g.avgScore?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell className="text-center">
                      {g.grade ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: GRADE_COLORS[g.grade] }}>
                          {g.grade}
                        </span>
                      ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {g.rank ? (
                        <Badge variant={g.rank === 1 ? 'warning' : 'neutral'} size="sm">#{g.rank}</Badge>
                      ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
