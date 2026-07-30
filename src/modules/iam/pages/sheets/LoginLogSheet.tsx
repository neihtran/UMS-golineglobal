import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Badge,
} from '@/components/ui';
import { formatDateTime } from '@/utils/formatters';
import type { LoginLog } from '@/types/iam.types';

interface LoginLogSheetProps {
  open: boolean;
  onClose: () => void;
  log?: LoginLog | null;
}

const LOGIN_METHOD_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'neutral'; label: string }> = {
  password: { variant: 'info', label: 'Mật khẩu' },
  sso: { variant: 'success', label: 'SSO' },
  oauth: { variant: 'warning', label: 'OAuth' },
  mfa: { variant: 'success', label: 'MFA' },
  webauthn: { variant: 'success', label: 'WebAuthn' },
  magic_link: { variant: 'info', label: 'Magic link' },
};

export function LoginLogSheet({ open, onClose, log }: LoginLogSheetProps) {
  if (!log) return null;

  const mc = LOGIN_METHOD_CONFIG[log.login_method as string] || { variant: 'info' as const, label: log.login_method };
  const isActive = !log.logged_out_at;
  const userLabel = log.user_id != null ? `User #${log.user_id}` : 'Hệ thống';

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader showClose onClose={onClose}>
          <SheetTitle>Chi tiết phiên đăng nhập</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={mc.variant}>{mc.label}</Badge>
            {isActive ? (
              <Badge variant="success" dot>Đang hoạt động</Badge>
            ) : (
              <Badge variant="neutral">Đã đăng xuất</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-sm font-bold text-[rgb(var(--primary))]">
              {userLabel.slice(-2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{userLabel}</p>
              <p className="text-sm text-[rgb(var(--text-muted))]">Mã phiên: #{log.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[rgb(var(--border))] p-4">
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-1">Đăng nhập</p>
              <p className="font-medium text-[rgb(var(--text-primary))]">{formatDateTime(log.logged_in_at)}</p>
            </div>
            <div className="rounded-lg border border-[rgb(var(--border))] p-4">
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-1">Đăng xuất</p>
              <p className="font-medium text-[rgb(var(--text-primary))]">
                {log.logged_out_at
                  ? formatDateTime(log.logged_out_at)
                  : <span className="text-[rgb(var(--success))]">Đang hoạt động</span>}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[rgb(var(--border))] p-4 space-y-3">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Thông tin mạng</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Địa chỉ IP</p>
                <code className="text-sm font-mono text-[rgb(var(--text-primary))]">{log.ip_address || '—'}</code>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Phương thức</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{mc.label}</p>
              </div>
              {log.user_agent && (
                <div className="col-span-2">
                  <p className="text-xs text-[rgb(var(--text-muted))]">User Agent</p>
                  <p className="text-xs text-[rgb(var(--text-secondary))] break-all">{log.user_agent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default LoginLogSheet;