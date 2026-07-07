import { useState } from 'react';
import {
  Monitor, LogOut, AlertTriangle, RefreshCw,
  CheckCircle2, Clock, Wifi, Globe, Smartphone,
} from 'lucide-react';
import {
  Button, Badge, Card, CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useSessionList, useRevokeSession, useRevokeAllSessions } from '@/hooks/useIam';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error'; label: string; icon: React.ReactNode }> = {
  active: { variant: 'success', label: 'Đang hoạt động', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  expired: { variant: 'neutral', label: 'Hết hạn', icon: <Clock className="h-3.5 w-3.5" /> },
  locked: { variant: 'error', label: 'Bị khóa', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

export default function SessionManagement() {
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useSessionList({ search: search || undefined });
  const revokeMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllSessions();

  const sessions = data?.data ?? [];
  const activeSessions = sessions.filter((s: any) => s.status === 'active');
  const activeCount = activeSessions.length;
  const uniqueUsers = new Set(activeSessions.map((s: any) => s.userEmail)).size;
  const mobileCount = activeSessions.filter((s: any) =>
    s.device?.includes('Mobile') || s.device?.includes('iPhone') || s.device?.includes('Android')
  ).length;
  const abnormalCount = activeSessions.filter((s: any) => s.location !== 'Hà Nội, VN').length;

  const handleRevoke = (id: string) => {
    revokeMutation.mutate(id);
  };

  const handleRevokeAll = () => {
    revokeAllMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản lý Phiên đăng nhập"
        description="IAM-01 — Giám sát tất cả phiên đang hoạt động, buộc đăng xuất từ xa"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Phiên đăng nhập' }]}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Làm mới
            </Button>
            <Button
              variant="danger"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={handleRevokeAll}
              disabled={revokeAllMutation.isPending}
              loading={revokeAllMutation.isPending}
            >
              Đăng xuất tất cả
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Phiên đang hoạt động', value: activeCount, sub: `${uniqueUsers} người dùng`, icon: <Wifi className="h-5 w-5" />, color: 'success' },
          { label: 'Đã hết hạn', value: sessions.filter((s: any) => s.status === 'expired').length, sub: 'Các phiên cũ', icon: <Clock className="h-5 w-5" />, color: 'neutral' },
          { label: 'Thiết bị di động', value: mobileCount, sub: 'Đang hoạt động', icon: <Smartphone className="h-5 w-5" />, color: 'info' },
          { label: 'Địa điểm khác VN', value: abnormalCount, sub: 'Cần xem xét', icon: <Globe className="h-5 w-5" />, color: 'warning' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{isLoading ? '—' : s.value}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sessions list */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phiên đăng nhập</h3>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, email, thiết bị..."
              className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-xs text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-56"
            />
            <Badge variant="success">{activeCount} phiên</Badge>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-[rgb(var(--text-muted))]">Đang tải...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-[rgb(var(--text-muted))]">Không có phiên đăng nhập nào</div>
        ) : (
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {sessions.map((session: any) => {
              const sc = STATUS_CONFIG[session.status] || STATUS_CONFIG.active;
              const isAbnormal = session.status === 'active' && session.location !== 'Hà Nội, VN';

              return (
                <div key={session._id ?? session.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors group">
                  {/* Device icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    session.device?.includes('Mobile') || session.device?.includes('iPhone')
                      ? 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]'
                      : 'bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]'
                  }`}>
                    <Monitor className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-[rgb(var(--text-primary))]">{session.userName ?? '—'}</span>
                      {session.isCurrent && (
                        <span className="rounded-full border border-[rgb(var(--success))] bg-[rgb(var(--success)/0.1)] px-2 py-0.5 text-[10px] font-bold text-[rgb(var(--success))]">
                          HIỆN TẠI
                        </span>
                      )}
                      {isAbnormal && (
                        <span className="rounded-full border border-[rgb(var(--warning))] bg-[rgb(var(--warning)/0.1)] px-2 py-0.5 text-[10px] font-bold text-[rgb(var(--warning))]">
                          BẤT THƯỜNG
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{session.userEmail ?? '—'}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--text-secondary))]">
                      <span className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />{session.device ?? '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />{session.location ?? '—'}
                      </span>
                      <span className="font-mono">{session.ip ?? '—'}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1.5 mb-1 justify-end">
                      {sc.icon}
                      <span className={`text-xs font-semibold ${session.status === 'active' ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--text-muted))]'}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">
                      Đăng nhập: {session.loginTime ? new Date(session.loginTime).toLocaleString('vi-VN') : '—'}
                    </p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">
                      Hoạt động: {session.lastActivity ? new Date(session.lastActivity).toLocaleString('vi-VN') : '—'}
                    </p>
                    {session.status === 'active' && !session.isCurrent && (
                      <button
                        onClick={() => handleRevoke(session._id ?? session.id)}
                        disabled={revokeMutation.isPending}
                        className="mt-2 rounded-lg border border-[rgb(var(--error))] bg-[rgb(var(--error)/0.05)] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--error))] transition-colors hover:bg-[rgb(var(--error)/0.1)] disabled:opacity-50"
                      >
                        Đăng xuất
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
