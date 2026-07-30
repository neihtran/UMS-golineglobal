import { useState } from 'react';
import { Lock, Unlock, KeyRound, UserCog, FileText, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  toast,
} from '@/components/ui';
import { AccountSheet } from './AccountSheet';
import {
  useActivateIamUser,
  useIamAuditLogs,
  useIamUser,
  useIamUserRoles,
  useIamRoles,
  useLockIamUser,
  useResetIamUserPassword,
  useSuspendIamUser,
} from '@/hooks/useIam';
import { formatDateTime } from '@/utils/formatters';
import type { User, UserStatusCode } from '@/types/iam.types';

interface AccountDetailSheetProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  ACTIVE: { variant: 'success', label: 'Hoạt động' },
  LOCKED: { variant: 'error', label: 'Bị khóa' },
  SUSPENDED: { variant: 'warning', label: 'Tạm ngừng' },
  '1': { variant: 'success', label: 'Hoạt động' },
  '0': { variant: 'error', label: 'Bị khóa' },
  '2': { variant: 'warning', label: 'Tạm ngừng' },
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  system: 'Tài khoản hệ thống',
  employee: 'Cán bộ',
  student: 'Sinh viên',
};

const ACTION_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  login: 'neutral',
  logout: 'neutral',
  lock: 'error',
  unlock: 'success',
  reset_password: 'warning',
  assign_role: 'warning',
  revoke_role: 'warning',
  restore: 'success',
  approve: 'success',
  reject: 'error',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Tạo',
  update: 'Cập nhật',
  delete: 'Xóa',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  lock: 'Khóa',
  unlock: 'Mở khóa',
  reset_password: 'Reset mật khẩu',
  assign_role: 'Gán vai trò',
  revoke_role: 'Thu hồi vai trò',
  restore: 'Khôi phục',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
};

export function AccountDetailSheet({ open, onClose, user }: AccountDetailSheetProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'roles' | 'history'>('info');

  const userId = user?.id;
  const detailQuery = useIamUser(open && userId != null ? userId : null);
  const live = detailQuery.data?.data ?? user;

  const rolesQuery = useIamRoles({ per_page: 100 }, { enabled: open && !!userId && activeTab === 'roles' });

  // Fetch user detail to get roles[] (the list endpoint doesn't return roles)
  const userRolesQuery = useIamUserRoles(userId != null ? [userId] : []);
  const liveRoles: string[] = userRolesQuery.data.get(userId ?? 0)?.roles ?? live?.roles ?? [];

  const resetMut = useResetIamUserPassword();
  const lockMut = useLockIamUser();
  const suspendMut = useSuspendIamUser();
  const activateMut = useActivateIamUser();

  const auditQuery = useIamAuditLogs({ user_id: userId ?? undefined, per_page: 20 }, { enabled: open && !!userId && activeTab === 'history' });

  const handleReset = async () => {
    if (!userId) return;
    try {
      await resetMut.mutateAsync(userId);
      toast.success('Đã gửi yêu cầu reset mật khẩu');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleToggleLock = async () => {
    if (!userId || !live) return;
    // Chỉ toggle giữa active (1) ↔ locked (0); suspended (2) không thuộc toggle này
    if (live.status === 'LOCKED') {
      await activateMut.mutateAsync(userId);
      toast.success('Đã mở khóa tài khoản');
    } else if (live.status === 'ACTIVE') {
      await lockMut.mutateAsync(userId);
      toast.success('Đã khóa tài khoản');
    } else {
      toast.warning('Tài khoản đang bị tạm ngừng. Vui lòng kích hoạt lại.');
    }
  };

  const handleSuspend = async () => {
    if (!userId) return;
    try {
      await suspendMut.mutateAsync(userId);
      toast.success('Đã tạm ngừng tài khoản');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!live) return null;

  const sc = STATUS_CONFIG[String(live.status)] || { variant: 'neutral' as const, label: String(live.status) };
  const fullName = live.profile?.full_name || live.username;
  const loading = resetMut.isPending || lockMut.isPending || suspendMut.isPending || activateMut.isPending || detailQuery.isFetching;

  const tabs = [
    { id: 'info' as const, label: 'Thông tin', icon: <UserCog className="h-4 w-4" /> },
    { id: 'roles' as const, label: 'Vai trò & quyền', icon: <FileText className="h-4 w-4" /> },
    { id: 'history' as const, label: 'Lịch sử', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <>
      <Sheet open={open} onClose={onClose}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader showClose onClose={onClose}>
            <SheetTitle>Chi tiết tài khoản</SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-lg font-bold text-[rgb(var(--primary))]">
              {fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || live.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{fullName}</h2>
                <Badge variant={sc.variant} dot>{sc.label}</Badge>
              </div>
              <p className="text-sm text-[rgb(var(--text-secondary))] mt-0.5">@{live.username}</p>
              <p className="text-sm text-[rgb(var(--text-muted))]">{live.email}</p>
            </div>
          </div>

          <div className="mt-6 border-b border-[rgb(var(--border))]">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                      : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-4 space-y-4">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Vai trò</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {live.roles?.length
                        ? live.roles.map(r => <Badge key={r} variant="primary">{r}</Badge>)
                        : <Badge variant="neutral">Chưa gán</Badge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Loại tài khoản</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-1">
                      {ACCOUNT_TYPE_LABELS[live.account_type ?? ''] ?? live.account_type ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đăng nhập cuối</p>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{formatDateTime(live.last_login_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Ngày tạo</p>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{formatDateTime(live.created_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={resetMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset mật khẩu
                  </Button>
                  {live.status === 'SUSPENDED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={activateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                      onClick={async () => {
                        if (!userId) return;
                        try {
                          await activateMut.mutateAsync(userId);
                          toast.success('Đã kích hoạt lại tài khoản');
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                      disabled={loading}
                    >
                      Kích hoạt lại
                    </Button>
                  ) : live.status === 'LOCKED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={lockMut.isPending || activateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                      onClick={handleToggleLock}
                      disabled={loading}
                    >
                      Mở khóa
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={lockMut.isPending || activateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        onClick={handleToggleLock}
                        disabled={loading}
                      >
                        Khóa tài khoản
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSuspend}
                        disabled={loading}
                      >
                        Tạm ngừng
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Vai trò hiện tại</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {liveRoles.length
                        ? liveRoles.map(r => <Badge key={r} variant="primary">{r}</Badge>)
                        : <Badge variant="neutral">Chưa gán</Badge>}
                    </div>
                  </div>

                <div>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
                    Tất cả vai trò hiện có trong hệ thống ({(rolesQuery.data?.data ?? []).length}):
                  </p>
                  <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeadCell>Mã</TableHeadCell>
                          <TableHeadCell>Tên vai trò</TableHeadCell>
                          <TableHeadCell>Trạng thái</TableHeadCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rolesQuery.isLoading && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-6 text-sm text-[rgb(var(--text-muted))]">
                              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                              Đang tải...
                            </TableCell>
                          </TableRow>
                        )}
                        {(rolesQuery.data?.data ?? []).map(r => {
                          const assigned = liveRoles.includes(r.code);
                          return (
                            <TableRow key={r.id} className={assigned ? 'bg-[rgb(var(--primary)/0.04)]' : ''}>
                              <TableCell>
                                <code className="text-xs font-mono bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">{r.code}</code>
                              </TableCell>
                              <TableCell className="text-sm">{r.name}</TableCell>
                              <TableCell>
                                {assigned ? (
                                  <Badge variant="success" size="sm" dot>Đã gán</Badge>
                                ) : (
                                  <Badge variant="neutral" size="sm">—</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
                    Dùng trang "Vai trò người dùng" để chỉnh sửa nhanh.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {auditQuery.isLoading && (
                  <p className="text-sm text-[rgb(var(--text-muted))]">
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    Đang tải lịch sử...
                  </p>
                )}
                {(auditQuery.data?.data ?? []).map(item => {
                  const variant = ACTION_VARIANT[item.action] || 'neutral';
                  return (
                    <div key={item.id} className="flex items-start gap-3 text-sm border-b border-[rgb(var(--border)/0.5)] pb-3">
                      <div className="h-2 w-2 rounded-full bg-[rgb(var(--primary))] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={variant} size="sm">{ACTION_LABELS[item.action] || item.action}</Badge>
                          <span className="text-[rgb(var(--text-primary))]">{item.module}</span>
                        </div>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{item.description}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">
                          {formatDateTime(item.created_at)} · IP {item.ip_address || '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!auditQuery.isLoading && (auditQuery.data?.data ?? []).length === 0 && (
                  <p className="text-sm text-[rgb(var(--text-muted))] text-center py-4">Chưa có hoạt động nào.</p>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AccountSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={live}
      />
    </>
  );
}

export default AccountDetailSheet;