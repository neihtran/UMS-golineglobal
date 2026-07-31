import { useState, useEffect } from 'react';
import { Shield, Plus, Download, Loader2 } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  TablePagination,
  toast,
} from '@/components/ui';
import { useIamRoles, useIamUsers, useIamUserRoles } from '@/hooks/useIam';
import { RoleSheet } from './sheets/RoleSheet';
import { RoleDetailSheet } from './sheets/RoleDetailSheet';
import type { Role } from '@/types/iam.types';
import type { RoleDetail } from '@/types/iam.types';
import { rolesApi } from '@/services/iamApi';
import { useQueries } from '@tanstack/react-query';

// Một số module phổ biến làm hint hiển thị khi không chọn role.
const SAMPLE_MODULES = ['users', 'roles', 'system', 'students', 'courses', 'academic_terms'];

const ROLE_TONE: Record<string, 'primary' | 'info' | 'accent' | 'neutral'> = {
  admin: 'primary',
  super_admin: 'primary',
  student: 'info',
  sinh_vien: 'info',
  lecturer: 'accent',
  giao_vien: 'accent',
};

export function RoleTabContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = useIamRoles({
    per_page: pageSize,
    page,
    name: search.trim() || undefined,
  });

  const roles = query.data?.data ?? [];
  const meta = query.data?.meta;

  // DEBUG: log response để xác nhận shape thực tế
  useEffect(() => {
    if (query.data) {
      console.log('[iam][roles] list response:', query.data);
      if (roles.length > 0) {
        console.log('[iam][roles] first role keys:', Object.keys(roles[0]));
        console.log('[iam][roles] first role:', roles[0]);
      }
    }
  }, [query.data]);

  // Batch-fetch details for displayed roles to get permissions_count
  const detailQueries = useQueries({
    queries: roles.map(r => ({
      queryKey: ['iam-role-detail', r.id] as const,
      queryFn: () => rolesApi.get(r.id).then(res => res.data.data as RoleDetail),
      enabled: roles.length > 0,
    })),
  });

  const getPermissionsCount = (roleId: number): number => {
    const q = detailQueries.find(d => d.data?.id === roleId);
    if (!q?.data) return 0;
    const grouped = (q.data as RoleDetail).permissions_grouped;
    if (!grouped) return 0;
    return Object.values(grouped).flat().length;
  };

  // DEBUG: log response của role detail để xem có users_count không
  useEffect(() => {
    detailQueries.forEach((q, i) => {
      if (q.data) {
        const detail = q.data as any;
        console.log(`[iam][role-detail #${detail.id}] keys:`, Object.keys(detail));
        console.log(`[iam][role-detail #${detail.id}]:`, detail);
      }
    });
  }, [detailQueries.map(q => q.data?.id).join(',')]);

  // Batch-fetch ALL users (no pagination) để compute user_count mà không cần gọi API riêng
  const allUsersQuery = useIamUsers({ per_page: 9999, page: 1 });
  const allUserIds = (allUsersQuery.data?.data ?? []).map(u => u.id);
  const rolesMap = useIamUserRoles(allUserIds);

  // DEBUG: log user count + sample user
  useEffect(() => {
    if (allUsersQuery.data) {
      console.log('[iam][users] total:', allUsersQuery.data.meta?.total);
      console.log('[iam][users] loaded:', allUsersQuery.data.data.length);
      if (allUsersQuery.data.data.length > 0) {
        console.log('[iam][users] sample:', allUsersQuery.data.data[0]);
      }
    }
  }, [allUsersQuery.data]);

  // Compute user_count cho mỗi role.
  // Ưu tiên: 1) field `users_count`/`user_count`/`users` trong detail hoặc list role
  //          2) client-side count từ danh sách users
  const getUserCount = (roleIdOrCode: number | string, code?: string): number => {
    // 1) Thử lấy từ role list response (nếu backend trả)
    const roleFromList = roles.find(r => r.id === roleIdOrCode || r.code === roleIdOrCode);
    const listCount = (roleFromList as any)?.users_count
      ?? (roleFromList as any)?.user_count;
    if (typeof listCount === 'number' && listCount > 0) return listCount;

    // 2) Thử lấy từ role detail queries (nếu backend trả)
    const detailQ = detailQueries.find(d => (d.data as any)?.id === roleIdOrCode);
    const detailCount = (detailQ?.data as any)?.users_count
      ?? (detailQ?.data as any)?.user_count;
    if (typeof detailCount === 'number' && detailCount > 0) return detailCount;

    // 3) Fallback: client-side count
    const roleCode = code ?? roleFromList?.code;
    if (!roleCode) return 0;
    return (allUsersQuery.data?.data ?? []).filter(u => {
      const detail = rolesMap.data.get(u.id);
      const roles: string[] = detail?.roles ?? u.roles ?? [];
      return roles.includes(roleCode);
    }).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Tìm vai trò (theo mã hoặc tên)..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="max-w-sm flex-1"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => {
              const rls = roles;
              if (!rls.length) { toast.warning('Không có dữ liệu để xuất.'); return; }
              const headers = ['Mã vai trò', 'Tên vai trò', 'Mô tả', 'Số quyền', 'Số người dùng', 'Trạng thái'];
              const rows = rls.map(r => [
                r.code, r.name, r.description ?? '',
                r.permissions_count ?? 0, r.user_count ?? 0,
                r.status === 1 ? 'Hoạt động' : 'Không hoạt động',
              ]);
              const csv = [headers, ...rows].map(r => r.map(c => `"${String(c)}"`).join(',')).join('\n');
              const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `danh-sach-vai-tro-${Date.now()}.csv`;
              a.click(); URL.revokeObjectURL(url);
              toast.success(`Đã xuất ${rls.length} vai trò.`);
            }}
          >
            Xuất ma trận
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setSheetOpen(true)}>
            Tạo vai trò mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-2">
            {query.isLoading && (
              <div className="text-center py-6 text-[rgb(var(--text-muted))] text-sm">
                <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                Đang tải vai trò...
              </div>
            )}
            {query.isError && (
              <div className="text-center py-6 text-[rgb(var(--error))] text-sm">
                {(query.error as Error).message || 'Không thể tải vai trò.'}
              </div>
            )}
            {!query.isLoading && !query.isError && roles.length === 0 && (
              <div className="text-center py-6 text-[rgb(var(--text-muted))] text-sm">
                Không tìm thấy vai trò nào.
              </div>
            )}
            {!query.isLoading && !query.isError && roles.map((r) => {
              const tone = ROLE_TONE[r.code] ?? 'neutral';
              return (
                <div
                  key={r.id}
                  onClick={() => { setSelectedRole(r); setDetailOpen(true); }}
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedRole?.id === r.id
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] shadow-sm'
                      : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--primary-light))]'
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    tone === 'primary' ? 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]' :
                    tone === 'info' ? 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]' :
                    tone === 'accent' ? 'bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]' :
                    'bg-[rgb(var(--border))] text-[rgb(var(--text-secondary))]'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[rgb(var(--text-primary))] truncate">{r.name}</p>
                      <Badge variant={r.status === 1 ? 'success' : 'neutral'} dot size="sm">
                        {r.status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                      <code>{r.code}</code>
                      {' · '}{getUserCount(r.id, r.code).toLocaleString('vi-VN')} người dùng
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[rgb(var(--text-muted))] tabular-nums">
                      {getPermissionsCount(r.id).toLocaleString('vi-VN')} quyền
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={meta?.total ?? roles.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            pageSizeOptions={[5, 10]}
          />
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Ma trận phân quyền</h3>
          </div>

          {selectedRole ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{selectedRole.name}</Badge>
                <code className="text-xs text-[rgb(var(--text-muted))]">{selectedRole.code}</code>
              </div>
              {selectedRole.description && (
                <p className="text-xs text-[rgb(var(--text-muted))]">{selectedRole.description}</p>
              )}
              <p className="text-xs text-[rgb(var(--text-muted))] pt-2">
                Mở chi tiết vai trò để xem đầy đủ ma trận phân quyền.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-[rgb(var(--text-muted))]">
                Chọn một vai trò bên trái để xem chi tiết phân quyền.
              </p>
              <div className="border border-[rgb(var(--border))] rounded-lg divide-y divide-[rgb(var(--border))] overflow-hidden">
                {SAMPLE_MODULES.map((mod) => (
                  <div key={mod} className="flex items-center justify-between p-2.5 text-xs">
                    <span className="font-medium text-[rgb(var(--text-secondary))]">{mod}</span>
                    <span className="text-[rgb(var(--text-muted))] tabular-nums">— quyền</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RoleSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <RoleDetailSheet
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        role={selectedRole}
      />
    </div>
  );
}

export default RoleTabContent;