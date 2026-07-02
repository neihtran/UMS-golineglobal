import {
  BarChart3,
  Download,
  TrendingUp,
  Database,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const BI_STATS = [
  { label: 'Báo cáo đã tạo', value: '156', change: '+24', icon: <FileText className="h-5 w-5" />, color: 'primary' },
  { label: 'Nguồn dữ liệu', value: '38', sub: '14 kết nối live', icon: <Database className="h-5 w-5" />, color: 'info' },
  { label: 'Dashboard', value: '12', change: '+2', icon: <BarChart3 className="h-5 w-5" />, color: 'accent' },
  { label: 'Người dùng BI', value: '84', sub: 'GV: 42, CBQL: 42', icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
];

const ENROLLMENT_TREND = [
  { year: '2020', total: 7200, admitted: 6800, graduated: 6200 },
  { year: '2021', total: 7400, admitted: 7000, graduated: 6400 },
  { year: '2022', total: 7600, admitted: 7200, graduated: 6700 },
  { year: '2023', total: 7900, admitted: 7500, graduated: 6900 },
  { year: '2024', total: 8100, admitted: 7800, graduated: 7100 },
  { year: '2025', total: 8247, admitted: 7950, graduated: 7200 },
];

const FACULTY_PERF = [
  { name: 'CNTT', revenue: 4.2, students: 1240, research: 8, employment: 94 },
  { name: 'Kinh tế', revenue: 3.1, students: 980, research: 5, employment: 88 },
  { name: 'Y dược', revenue: 2.8, students: 540, research: 12, employment: 97 },
  { name: 'Ngoại ngữ', revenue: 2.2, students: 860, research: 3, employment: 91 },
  { name: 'Luật', revenue: 1.8, students: 720, research: 4, employment: 82 },
  { name: 'Sư phạm', revenue: 1.4, students: 650, research: 6, employment: 96 },
];

const REPORTS = [
  { id: 'r1', name: 'Báo cáo tuyển sinh 2026', type: 'Tuyển sinh', updated: '2026-06-20', frequency: 'Hàng tháng', format: 'PDF', views: 1240 },
  { id: 'r2', name: 'Dashboard tài chính Q2/2026', type: 'Tài chính', updated: '2026-06-18', frequency: 'Hàng quý', format: 'Live', views: 890 },
  { id: 'r3', name: 'Báo cáo đầu ra sinh viên', type: 'Đào tạo', updated: '2026-06-15', frequency: 'Hàng năm', format: 'PDF', views: 567 },
  { id: 'r4', name: 'Tỷ lệ thôi học theo ngành', type: 'Đào tạo', updated: '2026-06-10', frequency: 'Hàng kỳ', format: 'PDF', views: 430 },
];

export default function BIDashboard() {
  const { t } = useTranslation('bi');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'BI' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<RefreshCw className="h-4 w-4" />}>{t('refresh')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BI_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.label === 'Báo cáo đã tạo' ? 'dashboard.totalReports' : s.label === 'Nguồn dữ liệu' ? 'dashboard.dataSources' : s.label === 'Dashboard' ? 'dashboard.dashboards' : 'dashboard.biUsers')}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? t('dashboard.liveConnections') + ': 14'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enrollment trend */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.enrollmentTrend')}</h3>
        </div>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ENROLLMENT_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()} SV`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="total" stroke="rgb(var(--primary))" strokeWidth={2.5} name={t('dashboard.total')} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="admitted" stroke="rgb(var(--info))" strokeWidth={2} name={t('dashboard.admitted')} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="graduated" stroke="rgb(var(--success))" strokeWidth={2} name={t('dashboard.graduated')} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Faculty performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.facultyPerformance')}</h3>
          </div>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FACULTY_PERF} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v} tỷ đồng`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.revenue')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent reports */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.recentReports')}</h3>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {REPORTS.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                  <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="neutral" size="sm">{r.type}</Badge>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">{r.updated}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={r.format === 'Live' ? 'success' : 'neutral'} size="sm">{r.format}</Badge>
                  <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">{r.views} {t('dashboard.views')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
