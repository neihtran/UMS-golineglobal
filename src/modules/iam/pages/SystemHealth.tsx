import {
  Activity, CheckCircle2, AlertTriangle, XCircle, Wifi, WifiOff,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SERVICES = [
  { id: 'svc01', name: 'IAM (Identity & Access)', status: 'healthy' as const, uptime: 99.98, latency: 42, version: 'v2.4.1', nextDeploy: '2026-07-01', incidents: 0 },
  { id: 'svc02', name: 'SIS (Student Info)', status: 'healthy' as const, uptime: 99.95, latency: 68, version: 'v3.1.0', nextDeploy: '2026-07-05', incidents: 0 },
  { id: 'svc03', name: 'LMS (Learning)', status: 'degraded' as const, uptime: 98.42, latency: 312, version: 'v2.8.3', nextDeploy: '2026-07-10', incidents: 1 },
  { id: 'svc04', name: 'EXAM (Examination)', status: 'healthy' as const, uptime: 99.87, latency: 55, version: 'v1.9.2', nextDeploy: '2026-07-03', incidents: 0 },
  { id: 'svc05', name: 'DMS (Documents)', status: 'healthy' as const, uptime: 99.72, latency: 88, version: 'v2.0.5', nextDeploy: '2026-07-08', incidents: 0 },
  { id: 'svc06', name: 'FIN (Finance)', status: 'healthy' as const, uptime: 99.99, latency: 31, version: 'v1.5.1', nextDeploy: '2026-07-15', incidents: 0 },
  { id: 'svc07', name: 'HRM (HR Management)', status: 'healthy' as const, uptime: 99.91, latency: 47, version: 'v2.2.0', nextDeploy: '2026-07-02', incidents: 0 },
  { id: 'svc08', name: 'OCR (Digitization)', status: 'degraded' as const, uptime: 94.15, latency: 1204, version: 'v1.1.0', nextDeploy: '2026-07-12', incidents: 2 },
  { id: 'svc09', name: 'WMS (Workflow)', status: 'healthy' as const, uptime: 99.65, latency: 74, version: 'v1.8.0', nextDeploy: '2026-07-07', incidents: 0 },
  { id: 'svc10', name: 'API Gateway', status: 'healthy' as const, uptime: 99.99, latency: 12, version: 'v3.0.0', nextDeploy: '2026-08-01', incidents: 0 },
  { id: 'svc11', name: 'Database Cluster', status: 'healthy' as const, uptime: 99.99, latency: 5, version: 'PostgreSQL 16', nextDeploy: '—', incidents: 0 },
  { id: 'svc12', name: 'Redis Cache', status: 'healthy' as const, uptime: 99.99, latency: 1, version: 'Redis 7.2', nextDeploy: '—', incidents: 0 },
];

const INFRASTRUCTURE = [
  { name: 'API Gateway', count: 3, healthy: 3, degraded: 0, down: 0 },
  { name: 'Application Servers', count: 5, healthy: 5, degraded: 0, down: 0 },
  { name: 'Load Balancers', count: 2, healthy: 2, degraded: 0, down: 0 },
  { name: 'Database Nodes', count: 4, healthy: 4, degraded: 0, down: 0 },
  { name: 'Cache Nodes', count: 2, healthy: 2, degraded: 0, down: 0 },
  { name: 'File Storage', count: 3, healthy: 2, degraded: 1, down: 0 },
  { name: 'OCR Workers', count: 8, healthy: 6, degraded: 2, down: 0 },
];

const INCIDENTS = [
  { id: 'inc01', service: 'OCR (Digitization)', type: 'performance', title: 'OCR xử lý chậm', startedAt: '2026-06-26 09:00', duration: '2 giờ 15 phút', status: 'active' as const },
  { id: 'inc02', service: 'OCR (Digitization)', type: 'availability', title: 'OCR queue overflow', startedAt: '2026-06-26 10:30', duration: '45 phút', status: 'resolved' as const },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string; icon: React.ReactNode }> = {
  healthy: { variant: 'success', label: 'Hoạt động tốt', icon: <CheckCircle2 className="h-4 w-4" /> },
  degraded: { variant: 'warning', label: 'Giảm hiệu suất', icon: <AlertTriangle className="h-4 w-4" /> },
  down: { variant: 'error', label: 'Ngừng hoạt động', icon: <XCircle className="h-4 w-4" /> },
};

export default function SystemHealth() {
  const healthy = SERVICES.filter(s => s.status === 'healthy').length;
  const degraded = SERVICES.filter(s => s.status === 'degraded').length;
  const down = 0;
  const overallUptime = (SERVICES.reduce((s, svc) => s + svc.uptime, 0) / SERVICES.length).toFixed(2);
  const avgLatency = Math.round(SERVICES.reduce((s, svc) => s + svc.latency, 0) / SERVICES.length);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Health Check Hệ thống"
        description="IAM-01 — Giám sát trạng thái tất cả dịch vụ, uptime, latency và incidents"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Health Check' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>Làm mới</Button>
            <Button variant="outline" leftIcon={<Activity className="h-4 w-4" />}>Chi tiết</Button>
          </>
        }
      />

      {/* Overall health */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: 'Trạng thái tổng thể', value: degraded + down === 0 ? 'Tất cả hệ thống hoạt động tốt' : `${degraded} giảm hiệu suất, ${down} ngừng`, icon: degraded + down === 0 ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />, color: degraded + down === 0 ? 'success' : 'warning' },
          { label: 'Dịch vụ hoạt động tốt', value: healthy, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: 'Dịch vụ giảm hiệu suất', value: degraded, icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
          { label: 'Uptime trung bình', value: `${overallUptime}%`, icon: <TrendingUp className="h-5 w-5" />, color: parseFloat(overallUptime) >= 99 ? 'success' : 'warning' },
          { label: 'Latency trung bình', value: `${avgLatency}ms`, icon: <Activity className="h-5 w-5" />, color: avgLatency < 200 ? 'success' : avgLatency < 500 ? 'warning' : 'error' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                  <p className={`text-xl font-bold text-[rgb(var(--text-primary))]`}>{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services grid */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Trạng thái dịch vụ</h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {SERVICES.map((svc) => {
            const sc = STATUS_CONFIG[svc.status];
            return (
              <div key={svc.id} className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                svc.status === 'healthy'
                  ? 'border-[rgb(var(--border))]'
                  : svc.status === 'degraded'
                    ? 'border-[rgb(var(--warning))] bg-[rgb(var(--warning)/0.03)]'
                    : 'border-[rgb(var(--error))] bg-[rgb(var(--error)/0.03)]'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {sc.icon}
                    <span className={`text-xs font-semibold ${
                      svc.status === 'healthy' ? 'text-[rgb(var(--success))]'
                        : svc.status === 'degraded' ? 'text-[rgb(var(--warning))]'
                          : 'text-[rgb(var(--error))]'
                    }`}>
                      {sc.label}
                    </span>
                  </div>
                  <Badge variant={sc.variant} size="sm">{svc.status === 'healthy' ? <Wifi className="h-3.5 w-3.5" /> : svc.status === 'degraded' ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}</Badge>
                </div>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-1">{svc.name}</p>
                <p className="text-xs text-[rgb(var(--text-muted))] font-mono mb-3">{svc.version}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Uptime', value: `${svc.uptime}%`, color: svc.uptime >= 99 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]' },
                    { label: 'Latency', value: `${svc.latency}ms`, color: svc.latency < 200 ? 'text-[rgb(var(--success))]' : svc.latency < 500 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--error))]' },
                    { label: 'Deploy', value: svc.nextDeploy === '—' ? '—' : svc.nextDeploy.slice(5), color: 'text-[rgb(var(--text-muted))]' },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Infrastructure + Incidents */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hạ tầng</h3>
          </div>
          <CardContent className="py-5 space-y-3">
            {INFRASTRUCTURE.map((infra) => (
              <div key={infra.name} className="flex items-center gap-4">
                <div className="w-36 shrink-0">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{infra.name}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{infra.count} node{infra.count > 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  {Array.from({ length: infra.healthy }).map((_, i) => (
                    <div key={`h${i}`} className="h-2 flex-1 rounded-full bg-[rgb(var(--success))]" title="Healthy" />
                  ))}
                  {Array.from({ length: infra.degraded }).map((_, i) => (
                    <div key={`d${i}`} className="h-2 flex-1 rounded-full bg-[rgb(var(--warning))]" title="Degraded" />
                  ))}
                  {Array.from({ length: infra.down }).map((_, i) => (
                    <div key={`dn${i}`} className="h-2 flex-1 rounded-full bg-[rgb(var(--error))]" title="Down" />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-[rgb(var(--text-muted))] shrink-0">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[rgb(var(--success))]" />{infra.healthy}
                  </span>
                  {infra.degraded > 0 && (
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[rgb(var(--warning))" />{infra.degraded}
                    </span>
                  )}
                  {infra.down > 0 && (
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[rgb(var(--error))" />{infra.down}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Incidents gần đây</h3>
          </div>
          <CardContent className="py-5 space-y-3">
            {INCIDENTS.map((inc) => (
              <div key={inc.id} className={`flex items-start gap-3 rounded-lg border p-3 ${
                inc.status === 'active'
                  ? 'border-[rgb(var(--error))] bg-[rgb(var(--error)/0.03)]'
                  : 'border-[rgb(var(--border))]'
              }`}>
                <div className={`mt-0.5 shrink-0 ${inc.status === 'active' ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}`}>
                  {inc.status === 'active' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-[rgb(var(--text-primary))]">{inc.title}</p>
                    <Badge variant={inc.status === 'active' ? 'error' : 'success'} size="sm">
                      {inc.status === 'active' ? 'Đang xử lý' : 'Đã giải quyết'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{inc.service}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                    Bắt đầu: {inc.startedAt} · Kéo dài: {inc.duration}
                  </p>
                </div>
              </div>
            ))}
            {INCIDENTS.length === 0 && (
              <p className="text-sm text-[rgb(var(--text-muted))] text-center py-4">Không có incident nào gần đây</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
