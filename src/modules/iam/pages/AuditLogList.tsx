import { useState } from 'react';
import {
  Download, Filter, Shield, LogIn, LogOut, Edit3,
  Trash2, Lock, AlertTriangle, CheckCircle2, UserPlus, Settings,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useAuditLogList } from '@/hooks/useIam';
import { usePagination } from '@/hooks';

const ACTION_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string; icon: React.ReactNode }> = {
  login: { variant: 'info', label: 'Đăng nhập', icon: <LogIn className="h-3.5 w-3.5" /> },
  logout: { variant: 'neutral', label: 'Đăng xuất', icon: <LogOut className="h-3.5 w-3.5" /> },
  login_failed: { variant: 'error', label: 'Đăng nhập thất bại', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  account_locked: { variant: 'error', label: 'Tài khoản bị khóa', icon: <Lock className="h-3.5 w-3.5" /> },
  user_create: { variant: 'success', label: 'Tạo tài khoản', icon: <UserPlus className="h-3.5 w-3.5" /> },
  user_delete: { variant: 'error', label: 'Xóa tài khoản', icon: <Trash2 className="h-3.5 w-3.5" /> },
  role_assign: { variant: 'success', label: 'Gán vai trò', icon: <Shield className="h-3.5 w-3.5" /> },
  permission_grant: { variant: 'success', label: 'Cấp quyền', icon: <Shield className="h-3.5 w-3.5" /> },
  config_change: { variant: 'warning', label: 'Thay đổi cấu hình', icon: <Settings className="h-3.5 w-3.5" /> },
  document_approve: { variant: 'success', label: 'Phê duyệt văn bản', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  course_register: { variant: 'info', label: 'Đăng ký học phần', icon: <Edit3 className="h-3.5 w-3.5" /> },
  exam_create: { variant: 'success', label: 'Tạo ca thi', icon: <Edit3 className="h-3.5 w-3.5" /> },
  document_sign: { variant: 'success', label: 'Ký văn bản', icon: <Edit3 className="h-3.5 w-3.5" /> },
};

const MODULES = ['Tất cả', 'IAM', 'DMS', 'EXAM', 'SIS', 'HRM', 'FIN'];
const ACTION_OPTIONS = ['Tất cả', 'Đăng nhập', 'Đăng xuất', 'Tạo tài khoản', 'Gán vai trò', 'Cấp quyền', 'Phê duyệt'];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị viên',
  HIEU_TRUONG: 'Hiệu trưởng',
  PHO_HIEU_TRUONG: 'Phó Hiệu trưởng',
  TRUONG_KHOA: 'Trưởng khoa',
  GIAO_VIEN: 'Giảng viên',
  NHAN_VIEN: 'Nhân viên',
  SINH_VIEN: 'Sinh viên',
};

const ROLE_BADGE_VARIANT = (role: string): 'primary' | 'accent' | 'info' | 'neutral' | 'warning' | 'success' => {
  if (role === 'SUPER_ADMIN') return 'primary';
  if (role === 'GIAO_VIEN') return 'accent';
  if (role === 'SINH_VIEN') return 'info';
  if (role === 'HIEU_TRUONG') return 'warning';
  if (role === 'PHO_HIEU_TRUONG') return 'success';
  if (role === 'TRUONG_KHOA') return 'neutral';
  if (role === 'NHAN_VIEN') return 'neutral';
  return 'neutral';
};

export default function AuditLogList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('Tất cả');
  const [action, setAction] = useState('Tất cả');

  const { data, isLoading } = useAuditLogList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    module: module !== 'Tất cả' ? module : undefined,
    action: action !== 'Tất cả' ? action.toLowerCase().replace(/\s/g, '_') : undefined,
  });

  const logs = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const failedCount = logs.filter((l: any) => l.status === 'failure' || l.status === 'error').length;

  const stats = [
    { label: 'Tổng sự kiện', value: total, color: 'primary', icon: <Shield className="h-5 w-5" /> },
    { label: 'Hôm nay', value: logs.filter((l: any) => l.timestamp?.startsWith(new Date().toISOString().split('T')[0])).length, color: 'info', icon: <LogIn className="h-5 w-5" /> },
    { label: 'Cảnh báo', value: failedCount, color: 'error', icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Thành công', value: total - failedCount, color: 'success', icon: <CheckCircle2 className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Audit Log"
        description="IAM-01 — Nhật ký hoạt động toàn hệ thống, ghi nhận mọi thao tác của người dùng"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Audit Log' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất CSV</Button>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>Bộ lọc nâng cao</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 hover-lift">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{isLoading ? '—' : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên, email, mô tả..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <select title="Lọc theo module" value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          {MODULES.map(m => <option key={m}>{m}</option>)}
        </select>
        <select title="Lọc theo hành động" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          {ACTION_OPTIONS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Thời gian</TableHeadCell>
            <TableHeadCell>Người dùng</TableHeadCell>
            <TableHeadCell>Vai trò</TableHeadCell>
            <TableHeadCell>Module</TableHeadCell>
            <TableHeadCell>Hành động</TableHeadCell>
            <TableHeadCell>Mô tả</TableHeadCell>
            <TableHeadCell>IP</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmpty colSpan={7} message="Đang tải nhật ký..." />
          ) : logs.length === 0 ? (
            <TableEmpty colSpan={7} message="Không tìm thấy nhật ký nào" />
          ) : (
            logs.map((log: any) => {
              const ac = ACTION_CONFIG[log.action] || ACTION_CONFIG.login;
              return (
                <TableRow key={log._id ?? log.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))] whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{log.userName ?? log.userName ?? '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{log.userEmail ?? log.email ?? '—'}</p>
                  </TableCell>
                  <TableCell><Badge variant={ROLE_BADGE_VARIANT(log.userRole ?? log.role)} size="sm">{ROLE_LABELS[log.userRole ?? log.role] ?? log.userRole ?? '—'}</Badge></TableCell>
                  <TableCell><Badge variant="neutral" size="sm">{log.module ?? '—'}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={ac.variant as any} size="sm">{ac.label}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-[rgb(var(--text-secondary))] truncate">{log.description ?? log.details ?? '—'}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-muted))]">{log.ip ?? '—'}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={total}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[15, 30, 50, 100]}
      />
    </div>
  );
}
