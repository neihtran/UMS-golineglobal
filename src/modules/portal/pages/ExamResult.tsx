import { useTranslation } from 'react-i18next';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const EXAM_RESULTS = [
  { courseId: 'INT2201', courseName: 'Cấu trúc dữ liệu', semester: 'HK2/2025-2026', theoryScore: 8.5, practiceScore: 9.0, finalScore: 8.2, avgScore: 8.5, grade: 'A', credits: 4, gpa: 4.0 },
  { courseId: 'INT3110', courseName: 'Cơ sở dữ liệu', semester: 'HK2/2025-2026', theoryScore: 7.0, practiceScore: 7.5, finalScore: 7.0, avgScore: 7.2, grade: 'B+', credits: 4, gpa: 3.5 },
  { courseId: 'KT1001', courseName: 'Kinh tế vi mô', semester: 'HK2/2025-2026', theoryScore: 6.5, practiceScore: null, finalScore: 6.5, avgScore: 6.5, grade: 'C+', credits: 3, gpa: 2.5 },
  { courseId: 'NN1001', courseName: 'Tiếng Anh B1', semester: 'HK2/2025-2026', theoryScore: 8.0, practiceScore: 8.5, finalScore: 8.0, avgScore: 8.2, grade: 'A', credits: 3, gpa: 4.0 },
  { courseId: 'MA1001', courseName: 'Giải tích 1', semester: 'HK2/2025-2026', theoryScore: 7.5, practiceScore: null, finalScore: 7.5, avgScore: 7.5, grade: 'B+', credits: 4, gpa: 3.5 },
];

const GRADE_COLORS: Record<string, string> = {
  'A': '#16A34A', 'A+': '#16A34A', 'B+': '#2D5D8A', 'B': '#2D5D8A', 'C+': '#E8A020', 'C': '#E8A020', 'D+': '#DC2626', 'D': '#DC2626', 'F': '#DC2626',
};

const CURRENT_GPA = 7.82;
const TOTAL_CREDITS = 65;
const GPA_MAX = 4.0;

export default function ExamResult() {
  const { t } = useTranslation('portal');
  const avgGPA = (EXAM_RESULTS.reduce((a, b) => a + b.gpa * b.credits, 0) / EXAM_RESULTS.reduce((a, b) => a + b.credits, 0)).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('examResult.title')}
        description={t('examResult.description')}
        breadcrumbs={[
          { label: 'PORTAL', href: '/portal' },
          { label: t('examResult.breadcrumb') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('examResult.exportTranscript')}</Button>
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>{t('examResult.printTranscript')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <CardContent className="p-6">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t('examResult.currentGPA')}</p>
            <p className="text-4xl font-black text-[rgb(var(--text-primary))] mt-2">{CURRENT_GPA.toFixed(2)}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">/ {GPA_MAX.toFixed(1)} {t('examResult.maxGPA')}</p>
            <div className="w-full h-2 rounded-full bg-[rgb(var(--bg-base))] mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: `${(CURRENT_GPA / GPA_MAX) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t('examResult.totalCredits')}</p>
            <p className="text-4xl font-black text-[rgb(var(--text-primary))] mt-2">{TOTAL_CREDITS}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('examResult.requiredCredits')}</p>
            <div className="w-full h-2 rounded-full bg-[rgb(var(--bg-base))] mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${(TOTAL_CREDITS / 120) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t('examResult.thisSemester')}</p>
            <p className="text-4xl font-black text-[rgb(var(--text-primary))] mt-2">{avgGPA}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('examResult.semesterAvg')}</p>
            <div className="w-full h-2 rounded-full bg-[rgb(var(--bg-base))] mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-[rgb(var(--info))]" style={{ width: `${(Number(avgGPA) / GPA_MAX) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('examResult.resultDetail')} — {t('examResult.semester2')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {[t('examResult.table.courseCode'), t('examResult.table.courseName'), t('examResult.table.credits'), t('examResult.table.theory'), t('examResult.table.practice'), t('examResult.table.finalExam'), t('examResult.table.avgScore'), t('examResult.table.letterGrade'), t('examResult.table.gpaScore')].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {EXAM_RESULTS.map((r) => (
                <tr key={r.courseId} className="hover:bg-[rgb(var(--bg-hover))]">
                  <td className="px-4 py-3 font-mono text-xs text-[rgb(var(--text-secondary))]">{r.courseId}</td>
                  <td className="px-4 py-3 font-medium text-[rgb(var(--text-primary))]">{r.courseName}</td>
                  <td className="px-4 py-3 text-center text-[rgb(var(--text-secondary))]">{r.credits}</td>
                  <td className="px-4 py-3 text-center text-[rgb(var(--text-secondary))]">{r.theoryScore?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-[rgb(var(--text-secondary))]">{r.practiceScore?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-[rgb(var(--text-secondary))]">{r.finalScore?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-center font-bold text-[rgb(var(--text-primary))]">{r.avgScore.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: GRADE_COLORS[r.grade] }}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[rgb(var(--text-secondary))]">{r.gpa.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
