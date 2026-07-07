import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
  TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useVienChucStats } from '@/hooks/useHrm';
import { apiClient } from '@/lib/apiClient';

const PIE_COLORS = ['#1E3A5F', '#2D5D8A', '#94A3B8'];

export default function HRMDashboard() {
  const { t } = useTranslation('hrm');
  const { data: stats, isLoading } = useVienChucStats();

  const { data: trendData } = useQuery({
    queryKey: ['hrm', 'stats', 'monthly-trend'],
    queryFn: () => apiClient.get('/hrm/stats/monthly-trend').then((r: any) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const total = stats?.total ?? 0;
  const active = stats?.byStatus?.active ?? 0;
  const trial = stats?.byStatus?.trial ?? 0;
  const inactive = stats?.byStatus?.inactive ?? 0;
  const permanent = active + inactive;
  const visiting = stats?.byContractType?.filter((c: any) => c.type === 'Thỉnh giảng').reduce((s: number, c: any) => s + c.count, 0) ?? 0;

  const deptData = (stats?.byDepartment ?? []).slice(0, 7).map((d: any) => ({
    name: d.name.length > 10 ? d.name.slice(0, 10) + '…' : d.name,
    fullName: d.name,
    count: d.count,
  }));
  const deptTotal = deptData.reduce((a, b) => a + b.count, 0);

  const contractData = stats?.byContractType ?? [];
  const totalContract = contractData.reduce((a: number, c: any) => a + c.count, 0);
  const eduData = contractData.map((c: any, i: number) => ({
    name: c.type === 'Cơ hữu' ? 'Cơ hữu' : c.type === 'Thỉnh giảng' ? 'Thỉnh giảng' : 'Thử việc',
    value: totalContract > 0 ? Math.round((c.count / totalContract) * 100) : 0,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const trend = (trendData ?? []).map((d: any) => ({
    month: d.month?.slice(5) ?? d.month,
    count: d.count,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} breadcrumbs={[{ label: 'HRM' }]} />
        <TableSkeleton rows={4} />
      </div>
    );
  }

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
          { label: 'dashboard.stats.total', value: String(total), change: '', sub: null, icon: <Users className="h-5 w-5" />, color: 'primary' },
          { label: 'dashboard.stats.permanent', value: String(permanent), sub: total > 0 ? `${Math.round((permanent / total) * 100)}%` : '0%', icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
          { label: 'dashboard.stats.visiting', value: String(visiting), sub: total > 0 ? `${Math.round((visiting / total) * 100)}%` : '0%', icon: <Users className="h-5 w-5" />, color: 'accent' },
          { label: 'dashboard.stats.trial', value: String(trial), sub: t('dashboard.stats.trialNote'), icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.label)}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub ?? (s.change ? `+ ${s.change} ${t('dashboard.stats.totalChange')}` : '')}</p>
              </div>
            </CardContent>
          </Card>
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
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }} formatter={(v: any, _: any, i: any) => [`${v} VC`, (i.payload as any).fullName]} />
                  <Bar dataKey="count" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.educationLevel')}</h3>
          </div>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            {eduData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={eduData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {eduData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs mt-2">
                  {eduData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-[rgb(var(--text-secondary))]">{d.name} {d.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu</div>
            )}
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
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="rgb(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'rgb(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
