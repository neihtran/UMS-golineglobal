import { useState } from 'react';
import {
  Monitor, LogOut, AlertTriangle, RefreshCw,
  CheckCircle2, Clock, Wifi, Globe, Smartphone,
} from 'lucide-react';
import {
  Button, Badge, Card, CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SESSIONS = [
  { id: 's01', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', device: 'Chrome on Windows', os: 'Windows 11', ip: '10.0.1.45', location: 'Hà Nội, VN', browser: 'Chrome 126', lastActivity: '2026-06-26 11:30:15', loginTime: '2026-06-26 08:15:00', status: 'active', current: true },
  { id: 's02', user: 'Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', role: 'giang-vien', device: 'Safari on macOS', os: 'macOS Sonoma', ip: '10.0.2.18', location: 'Hà Nội, VN', browser: 'Safari 17', lastActivity: '2026-06-26 11:28:44', loginTime: '2026-06-26 09:00:22', status: 'active', current: false },
  { id: 's03', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', device: 'Firefox on Windows', os: 'Windows 10', ip: '203.162.45.67', location: 'Hồ Chí Minh, VN', browser: 'Firefox 127', lastActivity: '2026-06-25 22:10:33', loginTime: '2026-06-25 22:10:00', status: 'active', current: false },
  { id: 's04', user: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn', role: 'nhan-vien', device: 'Edge on Windows', os: 'Windows 10', ip: '10.0.3.22', location: 'Hà Nội, VN', browser: 'Edge 125', lastActivity: '2026-06-26 10:55:02', loginTime: '2026-06-26 07:45:18', status: 'active', current: false },
  { id: 's05', user: 'Lê Thị Bình', email: 'binh.le@truong.edu.vn', role: 'sinh-vien', device: 'Chrome on Android', os: 'Android 14', ip: '113.23.45.67', location: 'Hải Phòng, VN', browser: 'Chrome Mobile 126', lastActivity: '2026-06-20 14:00:00', loginTime: '2026-06-20 13:55:00', status: 'expired', current: false },
  { id: 's06', user: 'Trần Minh Đức', email: 'minh.duc@truong.edu.vn', role: 'giang-vien', device: 'Chrome on iPhone', os: 'iOS 17', ip: '118.71.22.33', location: 'Đà Nẵng, VN', browser: 'Safari Mobile 17', lastActivity: '2026-06-24 16:20:00', loginTime: '2026-06-24 16:15:00', status: 'expired', current: false },
  { id: 's07', user: 'Phạm Hoàng Nam', email: 'nam.pham@truong.edu.vn', role: 'sinh-vien', device: 'Chrome on Windows', os: 'Windows 11', ip: '14.162.78.90', location: 'Cần Thơ, VN', browser: 'Chrome 126', lastActivity: '2026-06-26 09:10:22', loginTime: '2026-06-26 09:05:00', status: 'active', current: false },
  { id: 's08', user: 'Bùi Minh Tuấn', email: 'tuan.bui@truong.edu.vn', role: 'nhan-vien', device: 'Chrome on Windows', os: 'Windows 10', ip: '10.0.3.55', location: 'Hà Nội, VN', browser: 'Chrome 126', lastActivity: '2026-06-26 11:15:00', loginTime: '2026-06-26 08:00:00', status: 'active', current: false },
  { id: 's09', user: 'PGS.TS. Hoàng Văn Minh', email: 'hieu-truong@truong.edu.vn', role: 'hieu-truong', device: 'Safari on iPad', os: 'iPadOS 18', ip: '10.0.1.1', location: 'Hà Nội, VN', browser: 'Safari 18', lastActivity: '2026-06-30 07:30:00', loginTime: '2026-06-30 07:00:00', status: 'active', current: true },
  { id: 's10', user: 'TS. Lê Thị Lan', email: 'pho-hieu-truong@truong.edu.vn', role: 'pho-hieu-truong', device: 'Chrome on Windows', os: 'Windows 11', ip: '10.0.1.2', location: 'Hà Nội, VN', browser: 'Chrome 126', lastActivity: '2026-06-29 16:45:00', loginTime: '2026-06-29 08:30:00', status: 'active', current: false },
  { id: 's11', user: 'TS. Nguyễn Văn Khoa', email: 'truong-khoa-cntt@truong.edu.vn', role: 'truong-khoa', device: 'Chrome on macOS', os: 'macOS Sonoma', ip: '10.0.2.50', location: 'Hà Nội, VN', browser: 'Chrome 126', lastActivity: '2026-06-30 08:10:00', loginTime: '2026-06-30 07:45:00', status: 'active', current: true },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error'; label: string; icon: React.ReactNode }> = {
  active: { variant: 'success', label: 'Đang hoạt động', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  expired: { variant: 'neutral', label: 'Hết hạn', icon: <Clock className="h-3.5 w-3.5" /> },
  locked: { variant: 'error', label: 'Bị khóa', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

export default function SessionManagement() {
  const [sessions, setSessions] = useState(SESSIONS);

  const handleForceLogout = (id: string) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'expired' } : s));
  };

  const activeCount = sessions.filter(s => s.status === 'active').length;
  const uniqueUsers = new Set(sessions.filter(s => s.status === 'active').map(s => s.email)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản lý Phiên đăng nhập"
        description="IAM-01 — Giám sát tất cả phiên đang hoạt động, buộc đăng xuất từ xa"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Phiên đăng nhập' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>Làm mới</Button>
            <Button variant="danger" leftIcon={<LogOut className="h-4 w-4" />}>Đăng xuất tất cả</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Phiên đang hoạt động', value: activeCount, sub: `${uniqueUsers} người dùng`, icon: <Wifi className="h-5 w-5" />, color: 'success' },
          { label: 'Đã hết hạn', value: sessions.filter(s => s.status === 'expired').length, sub: 'Các phiên cũ', icon: <Clock className="h-5 w-5" />, color: 'neutral' },
          { label: 'Thiết bị di động', value: sessions.filter(s => s.device.includes('Mobile') || s.device.includes('iPhone') || s.device.includes('Android')).length, sub: 'Đang hoạt động', icon: <Smartphone className="h-5 w-5" />, color: 'info' },
          { label: 'Địa điểm khác VN', value: sessions.filter(s => s.status === 'active' && s.location !== 'Hà Nội, VN').length, sub: 'Cần xem xét', icon: <Globe className="h-5 w-5" />, color: 'warning' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sessions list */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phiên đăng nhập đang hoạt động</h3>
          <Badge variant="success">{activeCount} phiên</Badge>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.5)]">
          {sessions.map((session) => {
            const sc = STATUS_CONFIG[session.status];
            const isAbnormal = session.status === 'active' && session.location !== 'Hà Nội, VN';

            return (
              <div key={session.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors group">
                {/* Device icon */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  session.device.includes('Mobile') || session.device.includes('iPhone')
                    ? 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]'
                    : 'bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]'
                }`}>
                  <Monitor className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-[rgb(var(--text-primary))]">{session.user}</span>
                    {session.current && (
                      <span className="rounded-full border border-[rgb(var(--success))] bg-[rgb(var(--success)/0.1)] px-2 py-0.5 text-[10px] font-bold text-[rgb(var(--success))]">
                        HIỆN TẠI
                      </span>
                    )}
                    {isAbnormal && (
                      <span className="rounded-full border border-[rgb(var(--warning))] bg-[rgb(var(--warning)/0.1)] px-2 py-0.5 text-[10px] font-bold text-[rgb(var(--warning))]">
                        ⚠️ BẤT THƯỜNG
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{session.email}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--text-secondary))]">
                    <span className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />{session.device}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />{session.location}
                    </span>
                    <span className="font-mono">{session.ip}</span>
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
                    Đăng nhập: {session.loginTime}
                  </p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">
                    Hoạt động: {session.lastActivity}
                  </p>
                  {session.status === 'active' && !session.current && (
                    <button
                      onClick={() => handleForceLogout(session.id)}
                      className="mt-2 rounded-lg border border-[rgb(var(--error))] bg-[rgb(var(--error)/0.05)] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--error))] transition-colors hover:bg-[rgb(var(--error)/0.1)]"
                    >
                      Đăng xuất
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
