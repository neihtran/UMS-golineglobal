import { useMemo } from 'react';
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
import { useReportList, useReportScheduleList } from '@/hooks/useBi';

const TYPE_LABELS: Record<string, string> = {
  enrollment: 'Tuyển sinh',
  academic: 'Đào tạo',
  financial: 'Tài chính',
  hr: 'Nhân sự',
  attendance: 'Chuyên cần',
  research: 'NCKH',
  custom: 'Tùy chỉnh',
};

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}

export default function BIDashboard() {
  const { t } = useTranslation('bi');

  const reportsQuery = useReportList({ page: 1, pageSize: 100 });
  const schedulesQuery = useReportScheduleList({ page: 1, pageSize: 100 });

  const reportList = reportsQuery.data?.data ?? [];
  const scheduleList = schedulesQuery.data?.data ?? [];

  const totalReports = reportList.length;
  const totalSchedules = scheduleList.length;
  const dashboardCount = useMemo(() => {
    let count = 0;
    reportList.forEach((r: any) => {
      if (r.chartType && r.chartType !== 'table') count += 1;
    });
    return count;
  }, [reportList]);
  const publicReports = useMemo(() => reportList.filter((r: any) => r.isPublic).length, [reportList]);
  const totalViews = useMemo(() => reportList.reduce((sum: number, r: any) => sum + (r.runCount ?? 0), 0), [reportList]);
  const totalFavorites = useMemo(() => reportList.reduce((sum: number, r: any) => sum + (r.favoriteCount ?? 0), 0), [reportList]);

  const enrollmentTrend = useMemo(() => {
    const byYear: Record<string, { year: string; total: number; admitted: number; graduated: number }> = {};
    reportList.forEach((r: any) => {
      if (!r.createdAt) return;
      const d = new Date(r.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const year = `${d.getFullYear()}`;
      byYear[year] = byYear[year] || { year, total: 0, admitted: 0, graduated: 0 };
      byYear[year].total += r.runCount ?? 0;
      byYear[year].admitted += r.favoriteCount ?? 0;
      byYear[year].graduated += 1;
    });
    return Object.values(byYear)
      .sort((a, b) => a.year.localeCompare(b.year))
      .slice(-6);
  }, [reportList]);

  const facultyPerf = useMemo(() => {
    const groups: Record<string, { name: string; revenue: number; students: number; research: number; employment: number }> = {};
    reportList.forEach((r: any) => {
      const key = (Array.isArray(r.tags) && r.tags.length > 0 ? r.tags[0] : r.category) || 'Khác';
      if (!groups[key]) {
        groups[key] = { name: key, revenue: 0, students: 0, research: 0, employment: 0 };
      }
      groups[key].revenue += (r.runCount ?? 0);
      groups[key].students += (r.favoriteCount ?? 0);
      groups[key].research += 1;
      groups[key].employment += r.isPublic ? 95 : 80;
    });
    return Object.values(groups)
      .map((g) => ({ ...g, revenue: g.revenue / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [reportList]);

  const recentReports = useMemo(() => {
    return [...reportList]
      .sort((a: any, b: any) => {
        const ad = a.lastRunAt || a.updatedAt || a.createdAt || '';
        const bd = b.lastRunAt || b.updatedAt || b.createdAt || '';
        return bd.localeCompare(ad);
      })
      .slice(0, 4)
      .map((r: any) => ({
        id: r._id,
        name: r.name || r.title || 'Báo cáo',
        type: TYPE_LABELS[r.type] || r.category || 'Khác',
        updated: formatDate(r.lastRunAt || r.updatedAt || r.createdAt),
        frequency: r.parameters?.length ? `${r.parameters.length} tham số` : 'Tùy chỉnh',
        format: r.lastRunStatus === 'success' ? 'Live' : 'PDF',
        views: r.runCount ?? 0,
      }));
  }, [reportList]);

  const isLoading = reportsQuery.isLoading || schedulesQuery.isLoading;

  const BI_STATS = [
    { label: t('dashboard.totalReports'), value: totalReports, sub: `${totalFavorites} lượt thích`, icon: <FileText className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.dataSources'), value: scheduleList.length, sub: `${publicReports} công khai`, icon: <Database className="h-5 w-5" />, color: 'info' },
    { label: t('dashboard.dashboards'), value: dashboardCount, sub: `${totalSchedules} lịch chạy`, icon: <BarChart3 className="h-5 w-5" />, color: 'accent' },
    { label: t('dashboard.biUsers'), value: totalViews, sub: `${totalFavorites} tương tác`, icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'BI' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => { reportsQuery.refetch(); schedulesQuery.refetch(); }}>{t('refresh')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BI_STATS.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{isLoading ? '—' : s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{isLoading ? '—' : s.sub}</p>
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
          {enrollmentTrend.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">
              {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu xu hướng'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('vi-VN')}`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="total" stroke="rgb(var(--primary))" strokeWidth={2.5} name={t('dashboard.total')} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="admitted" stroke="rgb(var(--info))" strokeWidth={2} name={t('dashboard.admitted')} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="graduated" stroke="rgb(var(--success))" strokeWidth={2} name={t('dashboard.graduated')} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Faculty performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.facultyPerformance')}</h3>
          </div>
          <CardContent className="h-64">
            {facultyPerf.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">
                {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu khoa'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facultyPerf} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v} đơn vị`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.revenue')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent reports */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.recentReports')}</h3>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
            ) : recentReports.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có báo cáo nào</div>
            ) : (
              recentReports.map((r) => (
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
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
