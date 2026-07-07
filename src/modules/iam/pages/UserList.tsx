import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Download, Upload, Lock, Unlock } from 'lucide-react';
import {
  Button,
  Input,
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
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useUserList, useLockUser, useUnlockUser } from '@/hooks/useIam';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị viên',
  HIEU_TRUONG: 'Hiệu trưởng',
  PHO_HIEU_TRUONG: 'Phó Hiệu trưởng',
  TRUONG_KHOA: 'Trưởng khoa',
  GIAO_VIEN: 'Giảng viên',
  NHAN_VIEN: 'Nhân viên',
  SINH_VIEN: 'Sinh viên',
};

const ROLE_VARIANT = (role: string): 'primary' | 'accent' | 'info' | 'neutral' | 'warning' | 'success' => {
  if (role === 'SUPER_ADMIN') return 'primary';
  if (role === 'GIAO_VIEN') return 'accent';
  if (role === 'SINH_VIEN') return 'info';
  if (role === 'HIEU_TRUONG') return 'warning';
  if (role === 'PHO_HIEU_TRUONG') return 'success';
  return 'neutral';
};

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Hoạt động' },
  locked: { variant: 'error' as const, label: 'Bị khóa' },
  pending: { variant: 'warning' as const, label: 'Chờ kích hoạt' },
  inactive: { variant: 'neutral' as const, label: 'Không hoạt động' },
};

export default function UserList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useUserList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();

  const records = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const handleToggleLock = (user: { id: string; status: string }) => {
    if (user.status === 'locked') {
      unlockMutation.mutate(user.id);
    } else {
      lockMutation.mutate(user.id);
    }
  };

  // Track which user is being toggled
  const pendingLock = lockMutation.variables;
  const pendingUnlock = unlockMutation.variables;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tài khoản"
        description={`${total} tài khoản trong hệ thống`}
        breadcrumbs={[
          { label: 'IAM', href: '/iam' },
          { label: 'Tài khoản' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>Import Excel</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất Excel</Button>
            <Link to="/iam/tai-khoan/tao">
              <Button leftIcon={<UserPlus className="h-4 w-4" />}>Tạo tài khoản</Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm tên hoặc email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-64"
        />
        <select
          title="Lọc theo vai trò"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="SUPER_ADMIN">Quản trị viên</option>
          <option value="HIEU_TRUONG">Hiệu trưởng</option>
          <option value="PHO_HIEU_TRUONG">Phó Hiệu trưởng</option>
          <option value="TRUONG_KHOA">Trưởng khoa</option>
          <option value="GIAO_VIEN">Giảng viên</option>
          <option value="NHAN_VIEN">Nhân viên</option>
          <option value="SINH_VIEN">Sinh viên</option>
        </select>
        <select
          title="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
          <option value="pending">Chờ kích hoạt</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Người dùng</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Vai trò</TableHeadCell>
            <TableHeadCell>Đơn vị</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Đăng nhập cuối</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmpty colSpan={7} message="Đang tải..." />
          ) : records.length === 0 ? (
            <TableEmpty colSpan={7} message="Không tìm thấy tài khoản nào" />
          ) : (
            records.map((u) => {
              const sc = STATUS_CONFIG[u.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.inactive;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link
                      to={`/iam/tai-khoan/${u.id}`}
                      className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {(u.displayName ?? u.email ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium">{u.displayName ?? u.email}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{u.email}</TableCell>
                  <TableCell><Badge variant={ROLE_VARIANT(u.role)}>{ROLE_LABELS[u.role] ?? u.role}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{u.unit ?? '—'}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] tabular-nums text-xs">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link to={`/iam/tai-khoan/${u.id}`}>
                        <Button variant="ghost" size="sm">Chi tiết</Button>
                      </Link>
                      <Button
                        variant="ghost" size="sm"
                        loading={pendingLock === u.id || pendingUnlock === u.id}
                        onClick={() => handleToggleLock(u)}
                      >
                        {u.status === 'locked' ? (
                          <span className="flex items-center gap-1"><Unlock className="h-3.5 w-3.5" />Mở khóa</span>
                        ) : (
                          <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" />Khóa</span>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
