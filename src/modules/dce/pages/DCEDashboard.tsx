import {
  GraduationCap,
  Download,
  Plus,
  Award,
  Target,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, Legend } from 'recharts';

const DCE_STATS = [
  { label: 'Chuẩn đầu ra', value: '248', change: '+18', icon: <Target className="h-5 w-5" />, color: 'primary' },
  { label: 'Đạt chuẩn', value: '72.4%', change: '+3.1%', icon: <Award className="h-5 w-5" />, color: 'success' },
  { label: 'Sinh viên đánh giá', value: '3,241', sub: 'HK 2/2025-2026', icon: <GraduationCap className="h-5 w-5" />, color: 'accent' },
  { label: 'Chỉ số năng lực TB', value: '3.42/5', sub: '↑ 0.18', icon: <TrendingUp className="h-5 w-5" />, color: 'info' },
];

const COMPETENCY_FRAMEWORK = [
  { competency: 'Chuyên môn', score: 3.8, benchmark: 3.5 },
  { competency: 'Ngoại ngữ', score: 2.9, benchmark: 3.2 },
  { competency: 'CNTT', score: 3.6, benchmark: 3.0 },
  { competency: 'Kỹ năng mềm', score: 3.2, benchmark: 3.0 },
  { competency: 'Nghiên cứu', score: 2.7, benchmark: 2.8 },
  { competency: 'Giao tiếp', score: 3.4, benchmark: 3.2 },
];

const PROGRAM_ASSESSMENT = [
  { program: 'CNTT', level4: 78, level3: 65, level2: 42, level1: 8 },
  { program: 'Kinh tế', level4: 65, level3: 58, level2: 48, level1: 12 },
  { program: 'Y dược', level4: 88, level3: 72, level2: 35, level1: 5 },
  { program: 'Sư phạm', level4: 72, level3: 68, level2: 52, level1: 10 },
  { program: 'Luật', level4: 55, level3: 60, level2: 55, level1: 15 },
];

const RADAR_DATA = COMPETENCY_FRAMEWORK.map((c) => ({
  subject: c.competency,
  score: c.score,
  benchmark: c.benchmark,
}));

export default function DCEDashboard() {
  const { t } = useTranslation('dce');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'DCE' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('addCompetency')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DCE_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.label === 'Chuẩn đầu ra' ? 'dashboard.totalCompetencies' : s.label === 'Đạt chuẩn' ? 'dashboard.competencyAchieved' : s.label === 'Sinh viên đánh giá' ? 'dashboard.studentsEvaluated' : 'dashboard.avgCompetencyScore')}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? t('dashboard.currentSemester')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar: competency radar */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.competencyRadar')}</h3>
          </div>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgb(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} />
                <Radar name={t('dashboard.avgScore')} dataKey="score" stroke="rgb(var(--primary))" fill="rgb(var(--primary))" fillOpacity={0.2} />
                <Radar name={t('dashboard.benchmark')} dataKey="benchmark" stroke="rgb(var(--accent))" fill="rgb(var(--accent))" fillOpacity={0.1} strokeDasharray="4 4" />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)}/5`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-5 pb-4 flex gap-4 justify-center">
            {[{ label: t('dashboard.avgScore'), color: 'rgb(var(--primary))' }, { label: t('dashboard.benchmark'), color: 'rgb(var(--accent))', dashed: true }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full`} style={{ background: l.color }} />
                <span className="text-xs text-[rgb(var(--text-secondary))]">{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Program assessment */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.assessmentByProgram')}</h3>
          </div>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROGRAM_ASSESSMENT} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <XAxis dataKey="program" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="level4" stackId="a" fill="rgb(var(--success))" name={t('dashboard.level4')}  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />
                <Bar dataKey="level3" stackId="a" fill="rgb(var(--primary))" name={t('dashboard.level3')}  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />
                <Bar dataKey="level2" stackId="a" fill="rgb(var(--warning))" name={t('dashboard.level2')}  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />
                <Bar dataKey="level1" stackId="a" fill="rgb(var(--border))" name={t('dashboard.level1')} radius={[0, 0, 0, 0]}  animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary table */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('competency.title')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {[
                  t('competency.linhVuc'),
                  t('dashboard.avgScore'),
                  t('dashboard.benchmark'),
                  t('dashboard.level4'),
                  t('dashboard.level3'),
                  ''
                ].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {[
                { dept: 'Khoa Y dược', score: 3.82, benchmark: 3.5, diff: 0.32, rank: 1 },
                { dept: 'Khoa CNTT', score: 3.65, benchmark: 3.2, diff: 0.45, rank: 2 },
                { dept: 'Khoa Sư phạm', score: 3.48, benchmark: 3.3, diff: 0.18, rank: 3 },
                { dept: 'Khoa Kinh tế', score: 3.32, benchmark: 3.1, diff: 0.22, rank: 4 },
                { dept: 'Khoa Luật', score: 3.18, benchmark: 3.0, diff: 0.18, rank: 5 },
              ].map((row) => (
                <tr key={row.dept} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">{row.dept}</td>
                  <td className="px-4 py-2.5 font-semibold text-[rgb(var(--text-primary))]">{row.score.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{row.benchmark.toFixed(2)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold ${row.diff >= 0 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'}`}>
                      {row.diff >= 0 ? '+' : ''}{row.diff.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5"><Badge variant={row.rank === 1 ? 'success' : 'neutral'} size="sm">#{row.rank}</Badge></td>
                  <td className="px-4 py-2.5">
                    <Button variant="ghost" size="sm" leftIcon={<BarChart3 className="h-3.5 w-3.5"  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />}>{t('competency.thaoTac')}</Button>
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
