import { useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
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
} from '@/components/ui';
import { useIamRoles, useIamUsers } from '@/hooks/useIam';
import { usersApi } from '@/services/iamApi';
import { UserRoleSheet } from './sheets/UserRoleSheet';
import type { User, UserStatusCode } from '@/types/iam.types';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  ACTIVE: { variant: 'success', label: 'Hoạt động' },
  LOCKED: { variant: 'error', label: 'Bị khóa' },
  SUSPENDED: { variant: 'warning', label: 'Tạm ngừng' },
};

function UserRoleRow({
  user,
  detail,
  onAssign,
}: {
  user: User;
  detail?: { roles?: string[]; profile?: { full_name?: string | null } | null };
  onAssign: (u: User) => void;
}) {
  const roles = detail?.roles ?? [];
  const fullName = detail?.profile?.full_name || user.username;
  const sc = STATUS_CONFIG[String(user.status)] || { variant: 'neutral' as const, label: String(user.status) };

  return (
    <TableRow className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
            {fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[rgb(var(--text-primary))]">{fullName}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">@{user.username}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-[rgb(var(--text-secondary))] text-sm">{user.email}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {roles.length ? (
            roles.map(r => <Badge key={r} variant="primary" size="sm">{r}</Badge>)
          ) : (
            <Badge variant="neutral" size="sm">Chưa gán</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={sc.variant} dot>{sc.label}</Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={() => onAssign(user)}>
          Gán vai trò
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function UserRoleTabContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  const usersQuery = useIamUsers({
    per_page: pageSize,
    page,
    search: search.trim() || undefined,
  });
  const rolesQuery = useIamRoles({ per_page: 100 });

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;
  const roles = rolesQuery.data?.data ?? [];

  // Batch-fetch user details để lấy roles (tránh N+1 query)
  // Query keys phải khớp với iamKeys trong useIam.ts
  const detailQueries = useQueries({
    queries: users.map(user => ({
      queryKey: ['iam', 'users', 'detail', user.id] as const,
      queryFn: () => usersApi.get(user.id),
      enabled: usersQuery.isSuccess,
      staleTime: 30_000,
    })),
  });

  const detailsMap = new Map(
    users.map((u, i) => [u.id, detailQueries[i]?.data?.data])
  );

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
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setSheetOpen(true)}>
          Gán vai trò
        </Button>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Người dùng</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Vai trò đã gán</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
              <TableHeadCell>Thao tác</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-[rgb(var(--text-muted))]">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Đang tải danh sách...
                </TableCell>
              </TableRow>
            )}
            {usersQuery.isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-[rgb(var(--error))]">
                  {(usersQuery.error as Error).message || 'Không thể tải dữ liệu.'}
                </TableCell>
              </TableRow>
            )}
            {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
              <TableEmpty colSpan={5} message="Không tìm thấy người dùng nào" />
            )}
            {!usersQuery.isLoading && !usersQuery.isError && users.map(u => (
              <UserRoleRow
                key={u.id}
                user={u}
                detail={detailsMap.get(u.id)}
                onAssign={(usr) => { setSelected(usr); setSheetOpen(true); }}
              />
            ))}
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

      <UserRoleSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        user={selected}
        roles={roles}
      />
    </div>
  );
}

export default UserRoleTabContent;