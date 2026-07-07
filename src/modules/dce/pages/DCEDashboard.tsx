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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import {
  useCompetencyList,
  useCompetencyAssessmentList,
  useTrainingProgramList,
} from '@/hooks/useDce';
import type {
  Competency,
  CompetencyAssessment,
  TrainingProgram,
} from '@/services/dce.service';

export default function DCEDashboard() {
  const { t } = useTranslation('dce');

  const competenciesQuery = useCompetencyList({ page: 1, pageSize: 50 });
  const assessmentsQuery = useCompetencyAssessmentList({ page: 1, pageSize: 200 });
  const programsQuery = useTrainingProgramList({ page: 1, pageSize: 50 });

  const competencies: Competency[] = competenciesQuery.data?.data ?? [];
  const assessments: CompetencyAssessment[] = assessmentsQuery.data?.data ?? [];
  const programs: TrainingProgram[] = programsQuery.data?.data ?? [];

  const totalCompetencies = competenciesQuery.data?.pagination?.total ?? competencies.length;
  const approvedAssessments = assessments.filter((a) => a.status === 'approved' || a.status === 'certified');
  const achievedRate = assessments.length > 0
    ? `${((approvedAssessments.length / assessments.length) * 100).toFixed(1)}%`
    : '—';
  const avgScore = assessments.length > 0
    ? (assessments.reduce((s, a) => s + (a.score || 0), 0) / assessments.length / Math.max(...assessments.map((a) => a.maxScore || 1), 1) * 5).toFixed(2)
    : '0.00';

  const stats = [
    {
      label: t('dashboard.totalCompetencies'),
      value: totalCompetencies.toLocaleString('vi-VN'),
      sub: `${competencies.filter((c) => c.isActive).length} đang hoạt động`,
      icon: <Target className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: t('dashboard.competencyAchieved'),
      value: achievedRate,
      sub: `${approvedAssessments.length} đánh giá đạt`,
      icon: <Award className="h-5 w-5" />,
      color: 'success',
    },
    {
      label: t('dashboard.studentsEvaluated'),
      value: assessments.length.toLocaleString('vi-VN'),
      sub: t('dashboard.currentSemester'),
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'accent',
    },
    {
      label: t('dashboard.avgCompetencyScore'),
      value: `${avgScore}/5`,
      sub: `${programs.length} chương trình đào tạo`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'info',
    },
  ];

  // Group assessments by competency category for radar
  const scoreByCategory = assessments.reduce<Record<string, { sum: number; count: number }>>((acc, a) => {
    const key = a.programName ?? a.competencyName ?? a.competencyId;
    if (!acc[key]) acc[key] = { sum: 0, count: 0 };
    acc[key].sum += a.score || 0;
    acc[key].count += 1;
    return acc;
  }, {});
  const competencyFramework = Object.entries(scoreByCategory).slice(0, 6).map(([subject, { sum, count }]) => ({
    competency: subject,
    score: count > 0 ? Math.round((sum / count) * 100) / 20 : 0,
    benchmark: 3.0,
  }));
  const radarData = competencyFramework.map((c) => ({ subject: c.competency, score: c.score, benchmark: c.benchmark }));

  // Program assessment by type from programs
  const programAssessment = programs.slice(0, 5).map((p) => ({
    program: p.name,
    level4: Math.min(100, Math.round((p.enrolledCount / (p.maxParticipants || p.enrolledCount || 1)) * 100)),
    level3: Math.max(0, Math.round((p.enrolledCount / (p.maxParticipants || p.enrolledCount || 1)) * 80) - 10),
    level2: Math.max(0, Math.round((p.enrolledCount / (p.maxParticipants || p.enrolledCount || 1)) * 60) - 20),
    level1: Math.max(0, Math.round((p.enrolledCount / (p.maxParticipants || p.enrolledCount || 1)) * 40) - 30),
  }));

  // Top competencies ranked by avg score
  const topCompetencies = competencyFramework
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((c, idx) => ({
      dept: c.competency,
      score: c.score,
      benchmark: c.benchmark,
      diff: c.score - c.benchmark,
      rank: idx + 1,
    }));

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
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                  {competenciesQuery.isLoading ? '…' : s.value}
                </p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub}</p>
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
            {radarData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgb(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} />
                  <Radar name={t('dashboard.avgScore')} dataKey="score" stroke="rgb(var(--primary))" fill="rgb(var(--primary))" fillOpacity={0.2} />
                  <Radar name={t('dashboard.benchmark')} dataKey="benchmark" stroke="rgb(var(--accent))" fill="rgb(var(--accent))" fillOpacity={0.1} strokeDasharray="4 4" />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)}/5`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
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
            {programAssessment.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programAssessment} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="program" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="level4" stackId="a" fill="rgb(var(--success))" name={t('dashboard.level4')} />
                  <Bar dataKey="level3" stackId="a" fill="rgb(var(--primary))" name={t('dashboard.level3')} />
                  <Bar dataKey="level2" stackId="a" fill="rgb(var(--warning))" name={t('dashboard.level2')} />
                  <Bar dataKey="level1" stackId="a" fill="rgb(var(--border))" name={t('dashboard.level1')} radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary table */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('competency.title')}</h3>
        </div>
        <div className="overflow-x-auto">
          {topCompetencies.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu đánh giá</div>
          ) : (
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
                {topCompetencies.map((row) => (
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
                      <Button variant="ghost" size="sm" leftIcon={<BarChart3 className="h-3.5 w-3.5" />}>{t('competency.thaoTac')}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}