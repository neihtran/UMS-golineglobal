import { useState } from 'react';
import { UserPlus, Download, Upload, Lock, Unlock, Search, Loader2, PlayCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
  toast,
} from '@/components/ui';
import { useIamUsers, useIamUserRoles, iamKeys } from '@/hooks/useIam';
import { usersApi } from '@/services/iamApi';
import { AccountSheet } from './sheets/AccountSheet';
import { AccountDetailSheet } from './sheets/AccountDetailSheet';
import { formatDateTime } from '@/utils/formatters';
import type { User } from '@/types/iam.types';

// API trả status là string: "ACTIVE", "LOCKED", "SUSPENDED".
// Một số response có thể trả status dạng số (legacy).
// Luồng: ACTIVE → [Khóa] → LOCKED | [Tạm ngừng] → SUSPENDED
// Mở khóa/kích hoạt lại: SUSPENDED/LOCKED → [Kích hoạt] → ACTIVE
const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  ACTIVE: { variant: 'success', label: 'Hoạt động' },
  LOCKED: { variant: 'error', label: 'Bị khóa' },
  SUSPENDED: { variant: 'warning', label: 'Tạm ngừng' },
  '1': { variant: 'success', label: 'Hoạt động' },
  '0': { variant: 'error', label: 'Bị khóa' },
  '2': { variant: 'warning', label: 'Tạm ngừng' },
  '3': { variant: 'warning', label: 'Tạm ngừng' },
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  system: 'Hệ thống',
  employee: 'Cán bộ',
  student: 'Sinh viên',
};

// Normalize status từ cả string enum và số legacy sang string enum thống nhất.
const normalizeStatus = (s: unknown): 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'UNKNOWN' => {
  if (s === 'ACTIVE' || s === 1 || s === '1') return 'ACTIVE';
  if (s === 'LOCKED' || s === 0 || s === '0') return 'LOCKED';
  if (s === 'SUSPENDED' || s === 2 || s === '2' || s === 3 || s === '3') return 'SUSPENDED';
  return 'UNKNOWN';
};

// Map status filter string → số (backend expects numeric values)
const STATUS_FILTER_MAP: Record<string, number> = {
  ACTIVE: 1,
  LOCKED: 0,
  SUSPENDED: 2,
};

export function AccountTabContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const qc = useQueryClient();

  // Backend expects numeric status filter: 1=ACTIVE, 0=LOCKED, 2=SUSPENDED
  const usersQuery = useIamUsers({
    per_page: pageSize,
    page,
    username: search.trim() || undefined,
    status: statusFilter === '' ? undefined : (STATUS_FILTER_MAP[statusFilter] ?? statusFilter),
    account_type: accountTypeFilter || undefined,
  });

  const actionLoading = false;

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  // Batch-fetch user detail để lấy roles[] cho mỗi user trong trang hiện tại
  const userIds = users.map(u => u.id);
  const rolesMap = useIamUserRoles(userIds);

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setSheetOpen(true);
  };

  // Helper: build exact queryKey matching useIamUsers
  const userQueryKey = iamKeys.users.list({
    per_page: pageSize,
    page,
    username: search.trim() || undefined,
    status: statusFilter === '' ? undefined : (STATUS_FILTER_MAP[statusFilter] ?? statusFilter),
    account_type: accountTypeFilter || undefined,
  });

  // Khóa: ACTIVE → LOCKED (gọi API trực tiếp, không qua hook có auto-invalidate)
  const handleLock = async (u: User, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      qc.setQueriesData({ queryKey: userQueryKey }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = (old as { data?: User[] }).data;
        if (!data) return old;
        return { ...old, data: data.map(item => item.id === u.id ? { ...item, status: 'LOCKED' as const } : item) };
      });
      toast.success(`Đã khóa tài khoản ${u.username}`);
      await usersApi.lock(u.id);
    } catch (err) {
      toast.error((err as Error).message || 'Khóa tài khoản thất bại');
      await qc.invalidateQueries({ queryKey: userQueryKey });
    }
  };

  // Tạm ngừng: ACTIVE → SUSPENDED
  const handleSuspend = async (u: User, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      qc.setQueriesData({ queryKey: userQueryKey }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = (old as { data?: User[] }).data;
        if (!data) return old;
        return { ...old, data: data.map(item => item.id === u.id ? { ...item, status: 'SUSPENDED' as const } : item) };
      });
      toast.success(`Đã tạm ngừng tài khoản ${u.username}`);
      await usersApi.suspend(u.id);
    } catch (err) {
      toast.error((err as Error).message || 'Tạm ngừng tài khoản thất bại');
      await qc.invalidateQueries({ queryKey: userQueryKey });
    }
  };

  // Kích hoạt lại: SUSPENDED/LOCKED → ACTIVE
  const handleActivate = async (u: User, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      qc.setQueriesData({ queryKey: userQueryKey }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = (old as { data?: User[] }).data;
        if (!data) return old;
        return { ...old, data: data.map(item => item.id === u.id ? { ...item, status: 'ACTIVE' as const } : item) };
      });
      toast.success(`Đã kích hoạt lại tài khoản ${u.username}`);
      await usersApi.activate(u.id);
    } catch (err) {
      toast.error((err as Error).message || 'Kích hoạt lại tài khoản thất bại');
      await qc.invalidateQueries({ queryKey: userQueryKey });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="search"
              placeholder="Tìm tên, tài khoản, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            />
          </div>
          <select
            title="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Bị khóa</option>
            <option value="SUSPENDED">Tạm ngừng</option>
          </select>
          <select
            title="Lọc theo loại tài khoản"
            value={accountTypeFilter}
            onChange={(e) => { setAccountTypeFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
          >
            <option value="">Tất cả loại</option>
            <option value="system">Hệ thống</option>
            <option value="employee">Cán bộ</option>
            <option value="student">Sinh viên</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => toast.info('Tính năng Import đang được phát triển.')}
          >
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => {
              if (!users.length) { toast.warning('Không có dữ liệu để xuất.'); return; }
              const statusLabel = (s: unknown) =>
                s === 'ACTIVE' || s === 1 ? 'Hoạt động' :
                s === 'LOCKED' || s === 0 ? 'Bị khóa' :
                s === 'SUSPENDED' || s === 2 || s === 3 ? 'Tạm ngừng' : '—';
              const headers = ['ID', 'Tên đăng nhập', 'Email', 'Loại TK', 'Trạng thái', 'Đăng nhập cuối'];
              const rows = users.map(u => [
                u.id, u.username, u.email,
                u.account_type ?? '', statusLabel(u.status),
                u.last_login_at ?? '',
              ]);
              const csv = [headers, ...rows].map(r => r.map(c => `"${String(c)}"`).join(',')).join('\n');
              const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `danh-sach-tai-khoan-${Date.now()}.csv`;
              a.click(); URL.revokeObjectURL(url);
              toast.success(`Đã xuất ${users.length} tài khoản.`);
            }}
          >
            Xuất Excel
          </Button>
          <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={handleCreate}>
            Tạo tài khoản
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Người dùng</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Loại TK</TableHeadCell>
              <TableHeadCell>Vai trò</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
              <TableHeadCell>Đăng nhập cuối</TableHeadCell>
              <TableHeadCell>Thao tác</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Đang tải danh sách tài khoản...
                </TableCell>
              </TableRow>
            )}
            {usersQuery.isError && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--error))]">
                  {(usersQuery.error as Error).message || 'Không thể tải danh sách tài khoản.'}
                </TableCell>
              </TableRow>
            )}
            {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
              <TableEmpty colSpan={7} message="Không tìm thấy tài khoản nào" />
            )}
            {!usersQuery.isLoading && !usersQuery.isError && users.map((u) => {
              const sc = STATUS_CONFIG[String(u.status)] || { variant: 'neutral' as const, label: `Không rõ (${String(u.status)})` };
              const fullName = u.profile?.full_name || u.username;
              const initials = fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
              const accountTypeLabel = ACCOUNT_TYPE_LABELS[u.account_type ?? ''] ?? u.account_type ?? '—';
              const normStatus = normalizeStatus(u.status);
              // Get roles from batch-fetched detail (falls back to list response)
              const userDetail = rolesMap.data.get(u.id);
              const roles = userDetail?.roles ?? u.roles ?? [];

              return (
                <TableRow key={u.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <TableCell>
                    <button
                      onClick={() => handleOpenDetail(u)}
                      className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors text-left w-full"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {initials || (u.username || '').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[rgb(var(--text-primary))]">{fullName}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">@{u.username}</p>
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">{accountTypeLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {roles.length > 0 ? (
                        roles.map(r => <Badge key={r} variant="primary" size="sm">{r}</Badge>)
                      ) : (
                        <Badge variant="neutral" size="sm">Chưa gán</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot>{sc.label}</Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] tabular-nums text-xs">
                    {formatDateTime(u.last_login_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(u)}>
                        Chi tiết
                      </Button>
                      {normStatus === 'ACTIVE' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[rgb(var(--error))]"
                            onClick={(e) => handleLock(u, e)}
                            disabled={actionLoading}
                            leftIcon={<Lock className="h-3.5 w-3.5" />}
                          >
                            Khóa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[rgb(var(--warning))]"
                            onClick={(e) => handleSuspend(u, e)}
                            disabled={actionLoading}
                            leftIcon={<Lock className="h-3.5 w-3.5" />}
                          >
                            Tạm ngừng
                          </Button>
                        </>
                      )}
                      {normStatus === 'LOCKED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[rgb(var(--success))]"
                          onClick={(e) => handleActivate(u, e)}
                          disabled={actionLoading}
                          leftIcon={<Unlock className="h-3.5 w-3.5" />}
                        >
                          Mở khóa
                        </Button>
                      )}
                      {normStatus === 'SUSPENDED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[rgb(var(--success))]"
                          onClick={(e) => handleActivate(u, e)}
                          disabled={actionLoading}
                          leftIcon={<PlayCircle className="h-3.5 w-3.5" />}
                        >
                          Kích hoạt lại
                        </Button>
                      )}
                      {normStatus === 'UNKNOWN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[rgb(var(--success))]"
                          title="Thử kích hoạt lại (trạng thái không hợp lệ)"
                          onClick={(e) => handleActivate(u, e)}
                          disabled={actionLoading}
                          leftIcon={<Unlock className="h-3.5 w-3.5" />}
                        >
                          Kích hoạt lại
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={meta?.total ?? users.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      <AccountSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        user={selectedUser}
      />
      <AccountDetailSheet
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}

export default AccountTabContent;
