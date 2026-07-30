import { useState } from 'react';
import { ShieldCheck, Edit, Trash2, Users, Loader2 } from 'lucide-react';
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
  TableEmpty,
  TablePagination,
  toast,
} from '@/components/ui';
import { useDeleteIamRole, useIamRole, useIamUsers, useIamUserRoles } from '@/hooks/useIam';
import { RoleSheet } from './RoleSheet';
import { formatDateTime } from '@/utils/formatters';
import type { Role, User } from '@/types/iam.types';

interface RoleDetailSheetProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}

const STATUS_CONFIG: Record<number, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  1: { variant: 'success', label: 'Hoạt động' },
  0: { variant: 'neutral', label: 'Không hoạt động' },
};

export function RoleDetailSheet({ open, onClose, role }: RoleDetailSheetProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'info' | 'permissions' | 'users'>('info');
  const [usersPage, setUsersPage] = useState(1);
  const usersPageSize = 10;

  const id = role?.id;
  const detailQuery = useIamRole(open && id != null ? id : null);
  const live = detailQuery.data?.data ?? role;
  const deleteMut = useDeleteIamRole();

  // Safe accessors — guard against undefined live (must be before usersWithThisRole)
  const liveName = live?.name ?? '';
  const liveCode = live?.code ?? '';
  const liveDesc = live?.description ?? '';
  const liveStatus = live?.status ?? 1;
  const liveIsSystem = live?.is_system ?? false;
  const liveCreatedAt = live?.created_at;
  const liveId = live?.id;

  // Batch-fetch user details to get roles[] for filtering (avoids N+1)
  const allUsersQuery = useIamUsers({ per_page: 100, page: 1 }, { enabled: open && !!id });
  const allUserIds = (allUsersQuery.data?.data ?? []).map(u => u.id);
  const rolesMap = useIamUserRoles(allUserIds);

  // Filter: user has this role code (compare with batch-fetched detail data)
  const usersWithThisRole = liveCode
    ? (allUsersQuery.data?.data ?? []).filter(u => {
        const detail = rolesMap.data.get(u.id);
        return (detail?.roles ?? u.roles ?? []).includes(liveCode);
      })
    : [];

  const tabs = [
    { id: 'info' as const, label: 'Thông tin vai trò' },
    { id: 'permissions' as const, label: 'Danh sách quyền' },
    { id: 'users' as const, label: 'Người dùng' },
  ];

  const handleDelete = async () => {
    if (!live?.id) return;
    if (!window.confirm(`Xóa vai trò "${live.name}"?`)) return;
    try {
      await deleteMut.mutateAsync(live.id);
      toast.success('Đã xóa vai trò');
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const detail = detailQuery.data?.data as
    | (Role & { permissions_grouped?: Record<string, Array<{ id: number; code: string; name: string; module: string }>> })
    | undefined;
  const grouped = detail?.permissions_grouped ?? {};
  const flatPerms: Array<{ id: number; code: string; name: string; module: string }> = Object.entries(grouped).flatMap(
    ([moduleKey, perms]) =>
      (perms as Array<{ id: number; code: string; name: string; module?: string }>).map(p => ({
        ...p,
        module: p.module || moduleKey,
      }))
  );

  // Filter users có role này (client-side filter vì API không hỗ trợ filter theo role)
  const allUsers = allUsersQuery.data?.data ?? [];
  const paginatedUsers = usersWithThisRole.slice(
    (usersPage - 1) * usersPageSize,
    usersPage * usersPageSize
  );

  return (
    <>
      <Sheet open={open} onClose={onClose} hideCloseButton>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader showClose onClose={onClose}>
            <SheetTitle>Chi tiết vai trò</SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)]">
              <ShieldCheck className="h-7 w-7 text-[rgb(var(--primary))]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{liveName}</h2>
                <Badge variant={liveStatus === 1 ? 'success' : 'neutral'} dot>
                  {liveStatus === 1 ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
                {liveIsSystem && <Badge variant="warning" size="sm">Hệ thống</Badge>}
              </div>
              <p className="text-sm text-[rgb(var(--text-secondary))] mt-0.5">{liveDesc || '—'}</p>
            </div>
          </div>

          <div className="mt-6 border-b border-[rgb(var(--border))]">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    viewTab === tab.id
                      ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                      : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-4 space-y-4">
            {viewTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Mã vai trò</p>
                    <code className="text-sm font-mono bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded mt-1 inline-block">
                      {liveCode}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Ngày tạo</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-1">{formatDateTime(liveCreatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Số quyền</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-1">{flatPerms.length} quyền</p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Số người dùng</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-1">
                      {usersWithThisRole.length > 0 ? `${usersWithThisRole.length.toLocaleString()} người` : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="h-4 w-4" />}
                    onClick={() => setEditOpen(true)}
                    disabled={liveIsSystem}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[rgb(var(--error))]"
                    leftIcon={deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    onClick={handleDelete}
                    disabled={liveIsSystem || deleteMut.isPending}
                  >
                    Xóa vai trò
                  </Button>
                </div>
              </div>
            )}

            {viewTab === 'permissions' && (
              <div>
                <p className="text-sm text-[rgb(var(--text-secondary))] mb-3">
                  Danh sách quyền được gán cho vai trò <strong>{liveName}</strong>
                </p>
                <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeadCell>Mã quyền</TableHeadCell>
                        <TableHeadCell>Tên quyền</TableHeadCell>
                        <TableHeadCell>Module</TableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flatPerms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-sm text-[rgb(var(--text-muted))] py-6">
                            Chưa có quyền nào được gán.
                          </TableCell>
                        </TableRow>
                      ) : (
                        flatPerms.map(p => (
                          <TableRow key={p.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                            <TableCell>
                              <code className="text-xs font-mono bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">
                                {p.code}
                              </code>
                            </TableCell>
                            <TableCell className="text-sm text-[rgb(var(--text-primary))]">{p.name}</TableCell>
                            <TableCell>
                              <Badge variant="neutral" size="sm">{p.module}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {viewTab === 'users' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {allUsersQuery.isLoading ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
                      </span>
                    ) : (
                      <>{usersWithThisRole.length.toLocaleString()} người dùng có vai trò <strong>{liveName}</strong></>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeadCell>Người dùng</TableHeadCell>
                        <TableHeadCell>Email</TableHeadCell>
                        <TableHeadCell>Trạng thái</TableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allUsersQuery.isLoading && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin inline" />
                          </TableCell>
                        </TableRow>
                      )}
                      {!allUsersQuery.isLoading && paginatedUsers.length === 0 && (
                        <TableEmpty colSpan={3} message="Không có người dùng nào có vai trò này." />
                      )}
                      {!allUsersQuery.isLoading && paginatedUsers.map(u => {
                        const fullName = u.profile?.full_name || u.username;
                        const sc = STATUS_CONFIG[u.status] || { variant: 'neutral', label: String(u.status) };
                        return (
                          <TableRow key={u.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                                  {fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{fullName}</p>
                                  <p className="text-xs text-[rgb(var(--text-muted))]">@{u.username}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{u.email}</TableCell>
                            <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {usersWithThisRole.length > usersPageSize && (
                  <TablePagination
                    page={usersPage}
                    pageSize={usersPageSize}
                    total={usersWithThisRole.length}
                    onPageChange={setUsersPage}
                    pageSizeOptions={[10]}
                  />
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* RoleSheet for editing — open={editOpen} so it renders independently */}
      <RoleSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        role={live}
      />
    </>
  );
}

export default RoleDetailSheet;