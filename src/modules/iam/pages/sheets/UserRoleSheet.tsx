import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Badge,
  Checkbox,
  toast,
} from '@/components/ui';
import { useAssignIamUserRoles, useIamUser } from '@/hooks/useIam';
import { rolesApi } from '@/services/iamApi';
import { iamKeys } from '@/hooks/useIam';
import type { Role, User } from '@/types/iam.types';

interface UserRoleSheetProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  roles: Role[];
}

export function UserRoleSheet({ open, onClose, user, roles }: UserRoleSheetProps) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const assignMut = useAssignIamUserRoles();

  // Fetch full user detail to get the actual roles[] (list endpoint doesn't include roles)
  const userDetailQuery = useIamUser(open && user?.id ? user.id : null);

  // Reset selectedCodes when switching to a different user, or when sheet closes
  useEffect(() => {
    setSelectedCodes([]);
  }, [user?.id, open]);

  // Sync selectedCodes when user detail loads
  useEffect(() => {
    if (userDetailQuery.data?.data?.roles) {
      setSelectedCodes(userDetailQuery.data.data.roles);
    }
  }, [userDetailQuery.data]);

  // Fetch detail cho từng role song song để lấy permissions_count
  // (API list /roles không trả field này)
  const roleDetailQueries = useQueries({
    queries: roles.map(role => ({
      queryKey: iamKeys.roles.detail(role.id),
      queryFn: () => rolesApi.get(role.id).then(r => r.data),
      enabled: open,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const getPermissionCount = (roleId: number): number | undefined => {
    const idx = roles.findIndex(r => r.id === roleId);
    if (idx === -1) return undefined;
    const detail = roleDetailQueries[idx]?.data?.data;
    return (detail as any)?.permissions_count ?? roles[idx].permissions_count;
  };

  const toggleRole = (code: string) => {
    setSelectedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    try {
      await assignMut.mutateAsync({
        id: user.id,
        payload: { roles: selectedCodes },
      });
      toast.success('Đã cập nhật vai trò cho người dùng');
      onClose();
    } catch (e) {
      toast.error((e as Error).message || 'Cập nhật thất bại');
    }
  };

  const fullName = user?.profile?.full_name || user?.username;
  const loading = userDetailQuery.isLoading || assignMut.isPending;

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader showClose onClose={onClose}>
          <SheetTitle>
            {user ? `Gán vai trò cho ${fullName}` : 'Gán vai trò'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4 px-1">
          {user && (
            <div className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-sm font-bold text-[rgb(var(--primary))]">
                {(fullName ?? user.username).split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || user.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[rgb(var(--text-primary))]">{fullName}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">@{user.username}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))] mb-3">Chọn vai trò</p>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {roles.length === 0 && !loading && (
                <p className="text-sm text-[rgb(var(--text-muted))] text-center py-4">Chưa có vai trò nào.</p>
              )}
              {loading && roles.length === 0 && (
                <p className="text-sm text-[rgb(var(--text-muted))] text-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-1" /> Đang tải...
                </p>
              )}
              {roles.map(role => {
                const selected = selectedCodes.includes(role.code);
                const count = getPermissionCount(role.id);
                return (
                  <label
                    key={role.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selected
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]'
                        : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary-light))]'
                    }`}
                  >
                    <Checkbox
                      checked={selected}
                      onChange={() => toggleRole(role.code)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{role.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] truncate">{role.description || role.code}</p>
                    </div>
                    <Badge variant={selected ? 'success' : 'neutral'} size="sm">
                      {count !== undefined ? `${count} quyền` : '—'}
                    </Badge>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedCodes.length > 0 && (
            <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3">
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Vai trò đã chọn ({selectedCodes.length}):</p>
              <div className="flex flex-wrap gap-1">
                {selectedCodes.map(code => (
                  <Badge key={code} variant="primary" size="sm">{code}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !user?.id}
              leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default UserRoleSheet;