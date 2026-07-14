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
  DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import { useUserList, useLockUser, useUnlockUser } from '@/hooks/useIam';
import UserDetail from './UserDetail';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị cao cấp',
  ADMIN: 'Quản trị',
  HIEU_TRUONG: 'Hiệu trưởng',
  PHO_HIEU_TRUONG: 'Phó Hiệu trưởng',
  TRUONG_KHOA: 'Trưởng khoa',
  PHO_TRUONG_KHOA: 'Phó trưởng khoa',
  GIAO_VIEN: 'Giảng viên',
  CAN_BO_PHAN_CONG: 'Cán bộ phân công',
  CHUYEN_VIEN: 'Chuyên viên',
  NHAN_VIEN: 'Nhân viên',
  SINH_VIEN: 'Sinh viên',
  KHAI_THA: 'Khai thác',
};

const ROLE_VARIANT = (role: string): 'primary' | 'accent' | 'info' | 'neutral' | 'warning' | 'success' => {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return 'primary';
  if (role === 'HIEU_TRUONG' || role === 'PHO_HIEU_TRUONG') return 'warning';
  if (role === 'TRUONG_KHOA' || role === 'PHO_TRUONG_KHOA') return 'success';
  if (role === 'GIAO_VIEN') return 'accent';
  if (role === 'SINH_VIEN') return 'info';
  return 'neutral';
};

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Hoạt động' },
  locked: { variant: 'error' as const, label: 'Bị khóa' },
  inactive: { variant: 'neutral' as const, label: 'Không hoạt động' },
  pending: { variant: 'warning' as const, label: 'Chờ kích hoạt' },
};

export default function UserList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });

  // Fetch users from backend
  const { data, isLoading, isError } = useUserList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  });

  // Lock/Unlock mutations
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();

  const users = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleToggleLock = async (userId: string, currentStatus: string) => {
    if (currentStatus === 'locked') {
      await unlockMutation.mutateAsync(userId);
    } else {
      await lockMutation.mutateAsync({ id: userId, reason: 'Manual lock by admin' });
    }
  };

  const filtered = users;

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
            <Button as={Link} to="/iam/tao-tai-khoan" leftIcon={<UserPlus className="h-4 w-4" />}>
              Tạo tài khoản
            </Button>
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
          <option value="">Tất cả vai trò</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          title="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
          <option value="inactive">Không hoạt động</option>
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
          ) : isError ? (
            <TableEmpty colSpan={7} message="Không thể tải dữ liệu" />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={7} message="Không tìm thấy tài khoản nào" />
          ) : (
            filtered.map((u: any) => {
              const sc = STATUS_CONFIG[u.status as keyof typeof STATUS_CONFIG] || { variant: 'neutral' as const, label: u.status };
              return (
                <TableRow key={u._id}>
                  <TableCell>
                    <button
                      onClick={() => openDetail(u._id)}
                      className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors text-left w-full"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {(u.displayName || u.email).split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium">{u.displayName || u.email}</span>
                    </button>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANT(u.role)}>
                      {ROLE_LABELS[u.role] || u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {u.department?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot>{sc.label}</Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] tabular-nums text-xs">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(u._id)}>
                        Chi tiết
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={u.status === 'locked' ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        loading={lockMutation.isPending || unlockMutation.isPending}
                        onClick={() => handleToggleLock(u._id, u.status)}
                      >
                        {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
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
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Detail Modal */}
      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={users.find((u: any) => u._id === selectedId)?.displayName || ''}
        description={users.find((u: any) => u._id === selectedId)?.email}
        size="fullscreen"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={close}>Đóng</Button>
          </div>
        }
      >
        {selectedId ? <UserDetail id={selectedId} /> : null}
      </DetailModal>
    </div>
  );
}
