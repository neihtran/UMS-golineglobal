import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  Download,
  GraduationCap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Badge,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';

const DEPT_BARS = [
  { name: 'CNTT', count: 1240 }, { name: 'Kinh tế', count: 980 },
  { name: 'Luật', count: 720 }, { name: 'Ngoại ngữ', count: 860 },
  { name: 'Sư phạm', count: 650 }, { name: 'Y dược', count: 540 },
];

const ADMISSION_TREND = [
  { year: '2021', count: 720 }, { year: '2022', count: 810 },
  { year: '2023', count: 780 }, { year: '2024', count: 860 },
  { year: '2025', count: 920 }, { year: '2026', count: 420 },
];

const GRADE_DIST = [
  { nameKey: 'dashboard.gradeDistribution.excellent', value: 8.2, color: '#16A34A' },
  { nameKey: 'dashboard.gradeDistribution.good', value: 24.5, color: '#2D5D8A' },
  { nameKey: 'dashboard.gradeDistribution.average', value: 41.3, color: '#E8A020' },
  { nameKey: 'dashboard.gradeDistribution.fair', value: 22.1, color: '#94A3B8' },
  { nameKey: 'dashboard.gradeDistribution.poor', value: 3.9, color: '#DC2626' },
];

const PIE_COLORS = ['#16A34A', '#2D5D8A', '#E8A020', '#94A3B8', '#DC2626'];

const STATS = [
  { labelKey: 'dashboard.stats.totalStudents', value: '8,247', change: '+420', icon: <Users className="h-5 w-5" />, color: 'primary' },
  { labelKey: 'dashboard.stats.regular', value: '6,891', sub: '83.6%', icon: <GraduationCap className="h-5 w-5" />, color: 'success' },
  { labelKey: 'dashboard.stats.continuing', value: '1,356', sub: '16.4%', icon: <GraduationCap className="h-5 w-5" />, color: 'accent' },
  { labelKey: 'dashboard.stats.onTimeGraduation', value: '72.4%', change: '+2.1%', icon: <Award className="h-5 w-5" />, color: 'info' },
];

export default function SISDashboard() {
  const { t } = useTranslation('sis');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        breadcrumbs={[{ label: 'SIS' }]}
        actions={
          <>
            <Link to="/sis/sinh-vien"><Badge variant="info" dot>{STATS[0].value} {t('dashboard.studentsEnrolled')}</Badge></Link>
            <button className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-sm text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))] transition-colors">
              <Download className="h-3.5 w-3.5" /> {t('dashboard.report')}
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.labelKey)}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar: by department */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.studentsByDept')}</h3>
          </div>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_BARS} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
                <Bar dataKey="count" fill="rgb(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20}  animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line: admission trend */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.admissionTrend')}</h3>
          </div>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ADMISSION_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="rgb(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'rgb(var(--primary))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie: grade distribution */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.gradeDistribution')}</h3>
            <Badge variant="neutral">{t('dashboard.chart.avgGpa')}: 3.02/4.0</Badge>
          </div>
          <CardContent className="h-64 flex items-center gap-8">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart animationDuration={1500} animationEasing="ease-out">
                <Pie data={GRADE_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" animationDuration={1500} animationEasing="ease-out">
                  {GRADE_DIST.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {GRADE_DIST.map((d, i) => (
                <div key={d.nameKey} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-sm text-[rgb(var(--text-secondary))] w-28">{t(d.nameKey)}</span>
                  <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
