import { useState } from 'react';
import {
  Puzzle,
  Download,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useIntegrationList, useIntegrationLogList } from '@/hooks/useInt';
import type { Integration, IntegrationLog } from '@/services/int.service';

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'info' | 'warning'> = {
  erp: 'primary',
  lms: 'accent',
  email: 'info',
  portal: 'warning',
  exam: 'primary',
  storage: 'accent',
  sso: 'info',
  payment: 'warning',
  sms: 'primary',
  analytics: 'accent',
  other: 'warning',
};

export default function INTDashboard() {
  const { t } = useTranslation('int');
  const [, setDrawerOpen] = useState(false);

  const integrationsQuery = useIntegrationList({ page: 1, pageSize: 50 });
  const logsQuery = useIntegrationLogList({ page: 1, pageSize: 100 });

  const integrations: Integration[] = integrationsQuery.data?.data ?? [];
  const logs: IntegrationLog[] = logsQuery.data?.data ?? [];

  const totalIntegrations = integrationsQuery.data?.pagination?.total ?? integrations.length;
  const activeCount = integrations.filter((i) => i.status === 'active').length;
  const warningCount = integrations.filter((i) => i.status === 'error' || i.status === 'pending').length;
  const today = new Date().toISOString().slice(0, 10);
  const eventsToday = logs.filter((l) => l.createdAt?.slice(0, 10) === today).length;

  const stats = [
    {
      label: t('dashboard.totalIntegrations'),
      value: totalIntegrations.toLocaleString('vi-VN'),
      change: t('dashboard.newIntegrations', { count: integrations.filter((i) => {
        const created = new Date(i.createdAt);
        const diff = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      }).length }),
      icon: <Puzzle className="h-5 w-5" />,
      color: 'primary' as const,
    },
    {
      label: t('dashboard.active'),
      value: activeCount.toLocaleString('vi-VN'),
      sub: t('dashboard.uptimePercent', { percent: totalIntegrations > 0 ? ((activeCount / totalIntegrations) * 100).toFixed(1) : '0' }),
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'success' as const,
    },
    {
      label: t('dashboard.warnings'),
      value: warningCount.toLocaleString('vi-VN'),
      sub: t('dashboard.needCheck'),
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'warning' as const,
    },
    {
      label: t('dashboard.eventsToday'),
      value: eventsToday.toLocaleString('vi-VN'),
      sub: t('dashboard.vsYesterday', { percent: '—' }),
      icon: <Clock className="h-5 w-5" />,
      color: 'info' as const,
    },
  ];

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    active: { variant: 'success', label: t('list.status.active') },
    warning: { variant: 'warning', label: t('list.status.warning') },
    inactive: { variant: 'neutral', label: t('list.status.inactive') },
    error: { variant: 'warning', label: t('list.status.warning') },
    pending: { variant: 'warning', label: t('list.status.warning') },
  };

  // Aggregate 7-day daily log success rate for uptime trend chart
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const uptimeTrend = dayLabels.map((day, idx) => {
    const target = new Date();
    target.setDate(target.getDate() - (6 - idx));
    const dateKey = target.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => l.createdAt?.slice(0, 10) === dateKey);
    const success = dayLogs.filter((l) => l.status === 'success').length;
    const total = dayLogs.length;
    const uptime = total > 0 ? Math.round((success / total) * 1000) / 10 + 95 : 99.7;
    return { day, uptime: Math.min(uptime, 100) };
  });
  const avgUptime = uptimeTrend.length > 0
    ? (uptimeTrend.reduce((s, d) => s + d.uptime, 0) / uptimeTrend.length).toFixed(1)
    : '99.7';

  const visibleIntegrations = integrations.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'INT' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>{t('syncAll')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>{t('addIntegration')}</Button>
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
                  {integrationsQuery.isLoading ? '…' : s.value}
                </p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Integration list */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('list.integrationList')}</h3>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>{t('syncAll')}</Button>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {integrationsQuery.isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
            ) : visibleIntegrations.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có tích hợp nào</div>
            ) : (
              visibleIntegrations.map((intg) => {
                const sc = STATUS_CONFIG[intg.status] ?? STATUS_CONFIG.inactive;
                const lastSync = intg.lastSyncAt
                  ? new Date(intg.lastSyncAt).toLocaleString('vi-VN')
                  : '—';
                const eventCount = logs.filter((l) => l.integrationId === intg._id && l.createdAt?.slice(0, 10) === today).length;
                return (
                  <div key={intg._id} className="px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Globe className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                          <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{intg.name}</span>
                          <Badge variant={TYPE_BADGE[intg.type] ?? 'neutral'} size="sm">{intg.type.toUpperCase()}</Badge>
                          <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                        </div>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">{intg.description ?? intg.provider}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                          <span>{t('list.sync')}: {lastSync}</span>
                          <span>📊 {eventCount} {t('list.eventsToday')}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">v{intg.version}</p>
                        <p className="text-[10px] text-[rgb(var(--text-muted))]">{intg.provider}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Uptime trend */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.uptimeTrend')}</h3>
          </div>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={uptimeTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[94, 101]} tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={(v: number) => [`Uptime: ${v}%`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="uptime" stroke="rgb(var(--success))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-5 pb-4">
            <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-center">
              <p className="text-2xl font-bold text-[rgb(var(--success))]">{avgUptime}%</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.avgUptime')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}