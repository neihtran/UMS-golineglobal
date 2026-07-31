import { useState } from 'react';
import { ShieldCheck, Search, Loader2 } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import {
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
  Button,
} from '@/components/ui';
import { useIamRoles, useIamUsers, useIamUserRoles } from '@/hooks/useIam';
import { rolesApi } from '@/services/iamApi';
import { RoleDetailSheet } from './sheets/RoleDetailSheet';
import type { Role } from '@/types/iam.types';

// Trang "Phạm vi quyền" chỉ mang tính hiển thị thông tin phạm vi đã gán cho vai trò.
export function RoleScopeTabContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);

  const query = useIamRoles({
    per_page: pageSize,
    page,
    name: search.trim() || undefined,
  });

  const roles = query.data?.data ?? [];
  const meta = query.data?.meta;

  // Batch-fetch role details để lấy permissions_count từ permissions_grouped
  const roleDetailQueries = useQueries({
    queries: roles.map(r => ({
      queryKey: ['iam', 'role-detail', r.id] as const,
      queryFn: () => rolesApi.get(r.id).then(res => res.data.data),
      enabled: roles.length > 0,
      staleTime: 30_000,
    })),
  });

  const getPermissionsCount = (roleId: number): number | null => {
    const idx = roles.findIndex(r => r.id === roleId);
    if (idx < 0) return null;
    const q = roleDetailQueries[idx];
    if (!q?.data?.permissions_grouped) return null;
    return Object.values(q.data.permissions_grouped).flat().length;
  };

  // Batch-fetch users để compute user_count
  const allUsersQuery = useIamUsers({ per_page: 9999, page: 1 });
  const allUserIds = (allUsersQuery.data?.data ?? []).map(u => u.id);
  const rolesMap = useIamUserRoles(allUserIds);

  const getUserCount = (roleCode: string): number => {
    if (!roleCode) return 0;
    return (allUsersQuery.data?.data ?? []).filter(u => {
      const detail = rolesMap.data.get(u.id);
      const rls: string[] = detail?.roles ?? u.roles ?? [];
      return rls.includes(roleCode);
    }).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            type="search"
            placeholder="Tìm vai trò..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Vai trò</TableHeadCell>
              <TableHeadCell>Mô tả</TableHeadCell>
              <TableHeadCell>Số quyền</TableHeadCell>
              <TableHeadCell>Số người dùng</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
              <TableHeadCell>Thao tác</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Đang tải danh sách vai trò...
                </TableCell>
              </TableRow>
            )}
            {query.isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--error))]">
                  {(query.error as Error).message || 'Không thể tải dữ liệu.'}
                </TableCell>
              </TableRow>
            )}
            {!query.isLoading && !query.isError && roles.length === 0 && (
              <TableEmpty colSpan={6} message="Không tìm thấy vai trò nào" />
            )}
            {!query.isLoading && !query.isError && roles.map((r, idx) => {
              const variant = r.status === 1 ? 'success' : 'neutral';
              const label = r.status === 1 ? 'Hoạt động' : 'Không hoạt động';
              const permCount = getPermissionsCount(r.id);
              const isLoadingPerms = roleDetailQueries[idx]?.isLoading;

              return (
                <TableRow key={r.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                        <ShieldCheck className="h-4 w-4 text-[rgb(var(--primary))]" />
                      </div>
                      <div>
                        <p className="font-medium text-[rgb(var(--text-primary))]">{r.name}</p>
                        <code className="text-xs text-[rgb(var(--text-muted))]">{r.code}</code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))] max-w-xs truncate">
                    {r.description || '—'}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-[rgb(var(--text-secondary))]">
                    {isLoadingPerms ? (
                      <Loader2 className="inline h-3 w-3 animate-spin" />
                    ) : permCount != null ? (
                      permCount.toLocaleString('vi-VN')
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-[rgb(var(--text-secondary))]">
                    {getUserCount(r.code).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant} dot>{label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelected(r); setSheetOpen(true); }}
                    >
                      Xem quyền
                    </Button>
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
        total={meta?.total ?? roles.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25]}
      />

      <RoleDetailSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelected(null); }}
        role={selected}
      />
    </div>
  );
}

export default RoleScopeTabContent;
