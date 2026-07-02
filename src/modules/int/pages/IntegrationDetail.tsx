import { useState } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Plug } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const INTEGRATION = {
  id: 'int1',
  name: 'HEMIS - He thong thong tin quan ly giao duc',
  type: 'Government',
  direction: 'bidirectional' as const,
  status: 'active' as const,
  uptime: 99.8,
  lastSync: '2026-06-26 07:30:15',
  eventsToday: 1247,
  endpoint: 'https://hemis.moet.edu.vn/api/v1',
  description: 'Ket noi du lieu sinh vien, chuong trinh dao tao, van bang voi HEMIS quoc gia.',
};

const EVENTS = [
  { id: 'e1', message: 'Dong bo danh sach sinh vien moi: 45 ban ghi', timestamp: '2026-06-26 07:30:15', duration: 1200, status: 'success' as const },
  { id: 'e2', message: 'Cap nhat chuong trinh dao tao: 12 mon hoc', timestamp: '2026-06-26 07:00:00', duration: 800, status: 'success' as const },
  { id: 'e3', message: 'Canh bao: 3 sinh vien chua co ma dinh danh', timestamp: '2026-06-25 16:45:00', duration: null, status: 'warning' as const },
  { id: 'e4', message: 'Loi xac thuc OAuth2 - Token het han (401)', timestamp: '2026-06-25 14:20:00', duration: null, status: 'failure' as const },
  { id: 'e5', message: 'Lam moi Access Token thanh cong', timestamp: '2026-06-25 14:21:00', duration: 200, status: 'success' as const },
];

const EVENT_CONFIG: Record<string, { variant: 'success' | 'error' | 'warning'; label: string }> = {
  success: { variant: 'success', label: 'Thanh cong' },
  failure: { variant: 'error', label: 'Loi' },
  warning: { variant: 'warning', label: 'Canh bao' },
};

const DIR_CONFIG: Record<string, string> = {
  push: 'Day du lieu', pull: 'Nhan du lieu', bidirectional: 'Hai chieu',
};

export default function IntegrationDetail() {
  const intg = INTEGRATION;
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={intg.name}
        description={intg.type + ' / ' + DIR_CONFIG[intg.direction] + ' / Endpoint: ' + intg.endpoint}
        breadcrumbs={[
          { label: 'INT', href: '/int' },
          { label: 'Tich hop', href: '/int/tich-hop' },
          { label: intg.type },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => window.location.href = '/int/tich-hop'}>
              Quay lai
            </Button>
            <Button
              leftIcon={<RefreshCw className={'h-4 w-4' + (syncing ? ' animate-spin' : '')} />}
              onClick={handleSync}
            >
              Dong bo ngay
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Trang thai</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">Hoat dong</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <Plug className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Uptime</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">{intg.uptime}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Su kien hom nay</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">{intg.eventsToday.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Dong bo cuoi</p>
              <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">{intg.lastSync}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Mo ta ket noi</h3>
        </div>
        <CardContent className="pt-4">
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{intg.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="info">{DIR_CONFIG[intg.direction]}</Badge>
            <Badge variant="neutral">{intg.type}</Badge>
            <Badge variant="neutral">OAuth 2.0</Badge>
            <Badge variant="neutral">REST API</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nhat ky su kien</h3>
          <Badge variant="info" size="sm">{EVENTS.length} su kien gan nhat</Badge>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.4]">
          {EVENTS.map((ev) => {
            const ec = EVENT_CONFIG[ev.status];
            return (
              <div key={ev.id} className="flex items-start gap-4 px-5 py-4">
                <div className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--' + ec.variant + ')/0.1]'}>
                  {ev.status === 'success' && <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" />}
                  {ev.status === 'warning' && <AlertTriangle className="h-4 w-4 text-[rgb(var(--warning))]" />}
                  {ev.status === 'failure' && <XCircle className="h-4 w-4 text-[rgb(var(--error))]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[rgb(var(--text-primary))]">{ev.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--text-muted))]">
                    <span>{ev.timestamp}</span>
                    {ev.duration && <span> - Thoi gian: {ev.duration}ms</span>}
                  </div>
                </div>
                <Badge variant={ec.variant} size="sm">{ec.label}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
