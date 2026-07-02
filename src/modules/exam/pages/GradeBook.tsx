import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const GRADEBOOKS = [
  { id: 'gb1', courseId: 'INT2201', courseName: 'Cấu trúc dữ liệu', class: 'CNTT-K60A', semester: 'HK2/2025-2026', instructor: 'TS. Nguyễn Văn A', students: 45, graded: 42, avgScore: 7.4, status: 'grading' },
  { id: 'gb2', courseId: 'INT3110', courseName: 'Cơ sở dữ liệu', class: 'CNTT-K60A', semester: 'HK2/2025-2026', instructor: 'PGS.TS. Trần Thị B', students: 45, graded: 45, avgScore: 8.1, status: 'completed' },
  { id: 'gb3', courseId: 'INT1005', courseName: 'Nhập môn Tin học', class: 'CNTT-K61A', semester: 'HK2/2025-2026', instructor: 'TS. Lê Văn C', students: 52, graded: 50, avgScore: 6.9, status: 'grading' },
  { id: 'gb4', courseId: 'KT1001', courseName: 'Kinh tế vi mô', class: 'KT-K60A', semester: 'HK2/2025-2026', instructor: 'ThS. Phạm Thị D', students: 38, graded: 38, avgScore: 7.8, status: 'completed' },
  { id: 'gb5', courseId: 'KT2001', courseName: 'Kinh tế vĩ mô', class: 'KT-K60A', semester: 'HK2/2025-2026', instructor: 'TS. Hoàng Văn E', students: 38, graded: 0, avgScore: 0, status: 'pending' },
];

const GRADES = [
  { studentId: 'sv001', name: 'Nguyễn Văn An', theoryScore: 8.5, practiceScore: 9.0, finalScore: 8.2, avgScore: 8.5, grade: 'A', gpa: 3.7, status: 'graded' },
  { studentId: 'sv002', name: 'Trần Thị Bình', theoryScore: 7.0, practiceScore: 7.5, finalScore: 7.0, avgScore: 7.2, grade: 'B+', gpa: 3.5, status: 'graded' },
  { studentId: 'sv003', name: 'Lê Hoàng Cường', theoryScore: 6.0, practiceScore: 6.5, finalScore: 6.5, avgScore: 6.3, grade: 'C', gpa: 2.0, status: 'graded' },
  { studentId: 'sv004', name: 'Phạm Thị Dung', theoryScore: null, practiceScore: null, finalScore: null, avgScore: null, grade: null, gpa: null, status: 'pending' },
  { studentId: 'sv005', name: 'Đặng Minh Tuấn', theoryScore: 9.0, practiceScore: 8.5, finalScore: 9.0, avgScore: 8.8, grade: 'A', gpa: 4.0, status: 'graded' },
];

const GRADE_COLORS: Record<string, string> = {
  'A': '#16A34A', 'A+': '#16A34A', 'B+': '#2D5D8A', 'B': '#2D5D8A',
  'C+': '#E8A020', 'C': '#E8A020', 'D+': '#DC2626', 'D': '#DC2626', 'F': '#DC2626',
};

export default function GradeBook() {
  const { t } = useTranslation('exam');
  const [selectedGB, setSelectedGB] = useState(GRADEBOOKS[0]);

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
    completed: { variant: 'success', label: t('gradebook.status.completed') },
    grading: { variant: 'warning', label: t('gradebook.status.grading') },
    pending: { variant: 'info', label: t('gradebook.status.pending') },
  };

  const GRADE_STATUS_CONFIG: Record<string, { variant: 'success' | 'warning'; label: string }> = {
    graded: { variant: 'success', label: t('gradebook.status.graded') },
    pending: { variant: 'warning', label: t('gradebook.status.waiting') },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('gradebook.title')}
        description={t('gradebook.description')}
        breadcrumbs={[
          { label: t('breadcrumb.dashboard'), href: '/exam' },
          { label: t('breadcrumb.gradebook') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('gradebook.exportExcel')}</Button>
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>{t('gradebook.printGrade')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Course list */}
        <div className="space-y-3">
          {GRADEBOOKS.map((gb) => {
            const sc = STATUS_CONFIG[gb.status];
            return (
              <Card
                key={gb.id}
                className={`cursor-pointer transition-all ${selectedGB.id === gb.id ? 'border-[rgb(var(--primary))] ring-1 ring-[rgb(var(--primary)/0.2)]' : 'hover:border-[rgb(var(--border))]'}`}
                onClick={() => setSelectedGB(gb)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{gb.courseId}</p>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{gb.courseName}</p>
                    </div>
                    <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-[rgb(var(--text-muted))]">
                      <div>{gb.class}</div>
                      <div>{t('gradebook.courseList.gradedOf', { graded: gb.graded, total: gb.students })}</div>
                    </div>
                    {gb.avgScore > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{gb.avgScore.toFixed(1)}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{t('gradebook.classAvg')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Grade table */}
        <div className="lg:col-span-3">
          <Card>
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{selectedGB.courseName}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))]">{selectedGB.class} · {selectedGB.semester} · {selectedGB.instructor}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{selectedGB.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('gradebook.avgClass')}</p>
                </div>
              </div>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>{t('common.stt')}</TableHeadCell>
                  <TableHeadCell>{t('gradebook.table.studentId')}</TableHeadCell>
                  <TableHeadCell>{t('gradebook.table.fullName')}</TableHeadCell>
                  <TableHeadCell>{t('gradebook.table.theory')}</TableHeadCell>
                  <TableHeadCell>{t('gradebook.table.practice')}</TableHeadCell>
                  <TableHeadCell>{t('gradebook.table.final')}</TableHeadCell>
                  <TableHeadCell>{t('gradebook.table.avgScore')}</TableHeadCell>
                  <TableHeadCell>{t('gradebook.table.letterGrade')}</TableHeadCell>
                  <TableHeadCell>{t('common.trangThai')}</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {GRADES.map((g, i) => {
                  const gsc = GRADE_STATUS_CONFIG[g.status];
                  return (
                    <TableRow key={g.studentId}>
                      <TableCell className="text-[rgb(var(--text-muted))]">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{g.studentId}</TableCell>
                      <TableCell className="font-medium text-[rgb(var(--text-primary))]">{g.name}</TableCell>
                      <TableCell className="text-center text-[rgb(var(--text-secondary))]">{g.theoryScore?.toFixed(1) ?? '—'}</TableCell>
                      <TableCell className="text-center text-[rgb(var(--text-secondary))]">{g.practiceScore?.toFixed(1) ?? '—'}</TableCell>
                      <TableCell className="text-center text-[rgb(var(--text-secondary))]">{g.finalScore?.toFixed(1) ?? '—'}</TableCell>
                      <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">
                        {g.avgScore?.toFixed(1) ?? '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {g.grade ? (
                          <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: GRADE_COLORS[g.grade] || '#94A3B8' }}
                          >
                            {g.grade}
                          </span>
                        ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={gsc.variant} dot size="sm">{gsc.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
