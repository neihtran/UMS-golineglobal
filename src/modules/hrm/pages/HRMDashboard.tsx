import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Download,
  Upload,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const DEPT_BARS = [
  { name: 'CNTT', count: 42 },
  { name: 'Kinh te', count: 38 },
  { name: 'Luat', count: 29 },
  { name: 'Ngoai ngu', count: 35 },
  { name: 'Khoa hoc', count: 24 },
  { name: 'Su pham', count: 31 },
  { name: 'Y duoc', count: 27 },
];

const EDUCATION_PIE = [
  { name: 'Tien si', value: 38, color: '#1E3A5F' },
  { name: 'Thac si', value: 49, color: '#2D5D8A' },
  { name: 'Dai hoc', value: 13, color: '#94A3B8' },
];

const MONTHLY_TREND = [
  { month: 'T7', count: 448 }, { month: 'T8', count: 450 },
  { month: 'T9', count: 452 }, { month: 'T10', count: 451 },
  { month: 'T11', count: 453 }, { month: 'T12', count: 455 },
  { month: 'T1', count: 454 }, { month: 'T2', count: 456 },
];

const PIE_COLORS = ['#1E3A5F', '#2D5D8A', '#94A3B8'];

export default function HRMDashboard() {
  const { t } = useTranslation('hrm');
  const deptTotal = DEPT_BARS.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        breadcrumbs={[{ label: 'HRM' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>{t('importExcel')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'dashboard.stats.total', value: '456', change: '+8', sub: null, icon: <Users className="h-5 w-5" />, color: 'primary' },
          { label: 'dashboard.stats.permanent', value: '312', sub: '68.4%', icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
          { label: 'dashboard.stats.visiting', value: '144', sub: '31.6%', icon: <Users className="h-5 w-5" />, color: 'accent' },
          { label: 'dashboard.stats.trial', value: '8', sub: t('dashboard.stats.trialNote'), icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.label)}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub ?? `+ ${s.change} ${t('dashboard.stats.totalChange')}`}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {[
          { type: 'warning', icon: '!', textKey: 'dashboard.alerts.contractsExpiring', count: 3, actionKey: 'dashboard.alerts.viewList', route: '/hrm/hop-dong' },
          { type: 'info', icon: 'i', textKey: 'dashboard.alerts.retiringSoon', count: 5, actionKey: 'dashboard.alerts.view', route: '/hrm/bo-nhiem' },
          { type: 'error', icon: 'X', textKey: 'dashboard.alerts.pendingAppointments', count: 2, actionKey: 'dashboard.alerts.approveNow', route: '/hrm/bo-nhiem' },
        ].map((alert, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
              alert.type === 'warning' ? 'border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.05)]' :
              alert.type === 'error' ? 'border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.05)]' :
              'border-[rgb(var(--info)/0.3)] bg-[rgb(var(--info)/0.05)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{alert.icon}</span>
              <span className="text-sm text-[rgb(var(--text-primary))]">
                {alert.count} {t(alert.textKey)}
              </span>
            </div>
            <Link to={alert.route} className="text-xs font-semibold text-[rgb(var(--primary))] hover:underline ml-4 shrink-0">
              {t(alert.actionKey)}
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.staffByDept')}</h3>
              <Badge variant="neutral">{deptTotal} {t('dashboard.chart.total')}</Badge>
            </div>
          </div>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_BARS} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
                <Bar dataKey="count" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40}  animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.educationLevel')}</h3>
          </div>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart animationDuration={1500} animationEasing="ease-out">
                <Pie
                  data={EDUCATION_PIE} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value"
                 animationDuration={1500} animationEasing="ease-out">
                  {EDUCATION_PIE.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`}
                  contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs mt-2">
              {EDUCATION_PIE.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-[rgb(var(--text-secondary))]">{d.name} {d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.monthlyTrend')}</h3>
            <Badge variant="info">{t('dashboard.chart.last12months')}</Badge>
          </div>
        </div>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} domain={[440, 460]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
              <Line type="monotone" dataKey="count" stroke="rgb(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'rgb(var(--primary))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.recruitmentRate')}</h3>
            <Badge variant="success">{t('dashboard.chart.year')}</Badge>
          </div>
        </div>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { month: 'T1', applied: 45, interviewed: 32, hired: 8 },
              { month: 'T2', applied: 52, interviewed: 38, hired: 5 },
              { month: 'T3', applied: 38, interviewed: 25, hired: 3 },
              { month: 'T4', applied: 61, interviewed: 44, hired: 10 },
              { month: 'T5', applied: 47, interviewed: 33, hired: 7 },
              { month: 'T6', applied: 78, interviewed: 52, hired: 12 },
            ]} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
              <Line type="monotone" dataKey="applied" name={t('dashboard.chart.applied')} stroke="rgb(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'rgb(var(--primary))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="interviewed" name={t('dashboard.chart.interviewed')} stroke="rgb(var(--accent))" strokeWidth={2} dot={{ r: 3, fill: 'rgb(var(--accent))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="hired" name={t('dashboard.chart.hired')} stroke="rgb(var(--success))" strokeWidth={2} dot={{ r: 3, fill: 'rgb(var(--success))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}