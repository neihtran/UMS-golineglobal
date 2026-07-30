import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Badge,
} from '@/components/ui';
import { useIamAuditLog } from '@/hooks/useIam';
import { formatDateTime } from '@/utils/formatters';
import type { AuditLog } from '@/types/iam.types';

interface AuditLogSheetProps {
  open: boolean;
  onClose: () => void;
  log?: AuditLog | null;
}

// API trả action ở dạng lowercase.
const ACTION_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  restore: 'success',
  login: 'neutral',
  logout: 'neutral',
  lock: 'error',
  unlock: 'success',
  reset_password: 'warning',
  assign_role: 'warning',
  revoke_role: 'warning',
  export: 'info',
  import: 'info',
  approve: 'success',
  reject: 'error',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  restore: 'Khôi phục',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  lock: 'Khóa',
  unlock: 'Mở khóa',
  reset_password: 'Reset mật khẩu',
  assign_role: 'Gán vai trò',
  revoke_role: 'Thu hồi vai trò',
  export: 'Xuất dữ liệu',
  import: 'Nhập dữ liệu',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
};

function hasValues(v: unknown): boolean {
  if (!v) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

export function AuditLogSheet({ open, onClose, log }: AuditLogSheetProps) {
  const id = log?.id;
  const detailQuery = useIamAuditLog(open && id != null ? id : null);
  const live = detailQuery.data?.data ?? log;

  if (!live) return null;

  const variant = ACTION_VARIANT[live.action] || 'neutral';
  const actionLabel = ACTION_LABELS[live.action] || live.action;

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader showClose onClose={onClose}>
          <SheetTitle>Chi tiết nhật ký</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={variant}>{actionLabel}</Badge>
            <Badge variant="neutral">{live.module}</Badge>
          </div>

          <div className="rounded-lg border border-[rgb(var(--border))] p-4">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Người thực hiện</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {live.user_id != null ? `User #${live.user_id}` : 'Hệ thống'}
            </p>
          </div>

          <div className="rounded-lg border border-[rgb(var(--border))] p-4">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Mô tả</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{live.description || '—'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[rgb(var(--border))] p-4">
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-1">Đối tượng</p>
              <p className="font-medium text-[rgb(var(--text-primary))]">{live.resource_type || '—'}</p>
              {live.resource_id != null && (
                <p className="text-xs text-[rgb(var(--text-secondary))]">ID: {live.resource_id}</p>
              )}
            </div>
            <div className="rounded-lg border border-[rgb(var(--border))] p-4">
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-1">Thời gian</p>
              <p className="font-medium text-[rgb(var(--text-primary))]">{formatDateTime(live.created_at)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-[rgb(var(--border))] p-4 space-y-3">
            <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Thông tin mạng</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Địa chỉ IP</p>
                <code className="text-sm font-mono text-[rgb(var(--text-primary))]">{live.ip_address || '—'}</code>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">User Agent</p>
                <p className="text-xs text-[rgb(var(--text-secondary))] break-all">{live.user_agent || '—'}</p>
              </div>
            </div>
          </div>

          {(hasValues(live.old_values) || hasValues(live.new_values)) && (
            <div className="grid grid-cols-2 gap-4">
              {hasValues(live.old_values) && (
                <div className="rounded-lg border border-[rgb(var(--border))] p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Giá trị cũ</p>
                  <pre className="text-xs font-mono text-[rgb(var(--text-secondary))] whitespace-pre-wrap bg-[rgb(var(--bg-base))] p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(live.old_values, null, 2)}
                  </pre>
                </div>
              )}
              {hasValues(live.new_values) && (
                <div className="rounded-lg border border-[rgb(var(--border))] p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Giá trị mới</p>
                  <pre className="text-xs font-mono text-[rgb(var(--text-secondary))] whitespace-pre-wrap bg-[rgb(var(--bg-base))] p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(live.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AuditLogSheet;