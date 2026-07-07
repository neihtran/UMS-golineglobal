import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import {
  ArrowLeft,
  Award,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const SEMESTERS = [
  {
    id: 'hk2-2526',
    name: 'Học kỳ 2, 2025–2026',
    gpa: 3.42,
    credits: 18,
    status: 'Đang học',
    subjects: [
      { code: 'CS101', name: 'Nhập môn Lập trình Python', credits: 3, score: 8.5, grade: 'A', status: 'Đạt' },
      { code: 'MATH201', name: 'Giải tích 2', credits: 3, score: 7.8, grade: 'B+', status: 'Đạt' },
      { code: 'ENG301', name: 'Tiếng Anh Học thuật', credits: 2, score: 9.0, grade: 'A+', status: 'Đạt' },
      { code: 'PHYS101', name: 'Vật lý Đại cương', credits: 3, score: 6.5, grade: 'C+', status: 'Đạt' },
      { code: 'PHIL101', name: 'Triết học Mác-Lênin', credits: 2, score: 8.0, grade: 'B+', status: 'Đạt' },
      { code: 'PE101', name: 'Giáo dục Thể chất 2', credits: 1, score: 9.5, grade: 'A+', status: 'Đạt' },
    ],
  },
  {
    id: 'hk1-2526',
    name: 'Học kỳ 1, 2025–2026',
    gpa: 3.28,
    credits: 20,
    status: 'Hoàn thành',
    subjects: [
      { code: 'CS102', name: 'Cấu trúc Dữ liệu & Giải thuật', credits: 3, score: 8.0, grade: 'B+', status: 'Đạt' },
      { code: 'MATH101', name: 'Giải tích 1', credits: 3, score: 7.0, grade: 'B', status: 'Đạt' },
      { code: 'ENG201', name: 'Tiếng Anh Chuyên ngành', credits: 2, score: 7.5, grade: 'B+', status: 'Đạt' },
      { code: 'PHYS102', name: 'Cơ học', credits: 3, score: 6.5, grade: 'C+', status: 'Đạt' },
      { code: 'PM101', name: 'Phương pháp Luận nghiên cứu KH', credits: 2, score: 8.5, grade: 'A', status: 'Đạt' },
    ],
  },
];

const GPA_TREND = [
  { hk: 'HK1/24', gpa: 3.15 },
  { hk: 'HK2/24', gpa: 3.22 },
  { hk: 'HK1/25', gpa: 3.28 },
  { hk: 'HK2/25', gpa: 3.42 },
];

const GRADE_COLORS: Record<string, string> = {
  'A+': 'success',
  'A': 'success',
  'B+': 'primary',
  'B': 'primary',
  'C+': 'warning',
  'C': 'warning',
  'D+': 'error',
  'D': 'error',
  'F': 'error',
};

export default function StudentGrades() {
  const { t } = useTranslation('portal');
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0].id);
  const semester = SEMESTERS.find((s) => s.id === selectedSemester) ?? SEMESTERS[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('grades.title')}
        description={t('grades.description')}
        breadcrumbs={[
          { label: 'PORTAL', href: '/portal' },
          { label: t('grades.breadcrumb') },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/portal">{t('profile.backToHome')}</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('grades.gpaCumulative'), value: semester.gpa.toFixed(2), sub: '/4.0', icon: <Award className="h-5 w-5" />, color: 'primary' },
          { label: t('grades.creditsCumulative'), value: '62', sub: t('grades.creditsNeeded'), icon: <BookOpen className="h-5 w-5" />, color: 'success' },
          { label: t('grades.prevGPA'), value: '3.28', sub: '+0.14 ' + t('grades.improved'), icon: <TrendingUp className="h-5 w-5" />, color: 'accent' },
          { label: t('grades.ranking'), value: 'Khá', sub: t('grades.topPercent'), icon: <GraduationCap className="h-5 w-5" />, color: 'info' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                  {s.value} <span className="text-sm text-[rgb(var(--text-muted))]">{s.sub}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('grades.creditProgress')}</h3>
        </div>
        <CardContent className="pt-4">
          <div className="flex items-center gap-6 mb-3">
            <div className="flex-1">
              <div className="h-4 rounded-full bg-[rgb(var(--border))] overflow-hidden flex">
                <div className="h-full bg-[rgb(var(--primary))] transition-all" style={{ width: `${(62 / 120) * 100}%` }} />
                <div className="h-full bg-[rgb(var(--accent))] transition-all" style={{ width: `${(18 / 120) * 100}%` }} />
              </div>
            </div>
            <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
              62 / 120 {t('grades.creditsShort')}
            </span>
          </div>
          <div className="flex gap-6">
            {[
              { label: 'Đã tích lũy', value: 62, color: 'primary' },
              { label: 'Đang học HK này', value: 18, color: 'accent' },
              { label: 'Còn lại', value: 40, color: 'text-muted' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${s.color === 'text-muted' ? 'bg-[rgb(var(--text-muted))]' : `bg-[rgb(var(--${s.color}))]`}`} />
                <span className="text-xs text-[rgb(var(--text-secondary))]">{s.label}: {s.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('grades.gpaTrend')}</h3>
        </div>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={GPA_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <XAxis dataKey="hk" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis domain={[2.5, 4.0]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
              <Line type="monotone" dataKey="gpa" stroke="rgb(var(--primary))" strokeWidth={2.5} dot={{ r: 5, fill: 'rgb(var(--primary))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('grades.scoreTable')}</h3>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-sm text-[rgb(var(--text-primary))] focus:outline-none"
            >
              {SEMESTERS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {[t('grades.table.courseCode'), t('grades.table.courseName'), t('grades.table.credits'), t('grades.table.processScore'), t('grades.table.finalScore'), t('grades.table.subjectScore'), t('grades.table.letterGrade'), t('grades.table.result')].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {semester.subjects.map((sub) => (
                <tr key={sub.code} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-[rgb(var(--primary))]">{sub.code}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-[rgb(var(--text-primary))]">{sub.name}</td>
                  <td className="px-4 py-2.5 text-center text-[rgb(var(--text-secondary))]">{sub.credits}</td>
                  <td className="px-4 py-2.5 text-center text-[rgb(var(--text-secondary))]">{(sub.score - 1 + Math.random()).toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-center text-[rgb(var(--text-secondary))]">{sub.score.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-[rgb(var(--text-primary))]">{sub.score.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant={GRADE_COLORS[sub.grade] as any}>{sub.grade}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant="success" size="sm">{t('grades.grade.passed')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
