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
import { usePagination } from '@/hooks';

const AUDIT_LOGS = [
  { id: 'al001', timestamp: '2026-06-26 10:42:15', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', action: 'login', module: 'IAM', description: 'Đăng nhập thành công', ip: '10.0.1.45', status: 'success' },
  { id: 'al002', timestamp: '2026-06-26 10:38:22', user: 'Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', role: 'giang-vien', action: 'login', module: 'IAM', description: 'Đăng nhập thành công', ip: '10.0.2.18', status: 'success' },
  { id: 'al003', timestamp: '2026-06-26 10:35:01', user: 'Lê Thị Bình', email: 'binh.le@truong.edu.vn', role: 'sinh-vien', action: 'login_failed', module: 'IAM', description: 'Đăng nhập thất bại — sai mật khẩu', ip: '113.23.45.67', status: 'warning' },
  { id: 'al004', timestamp: '2026-06-26 10:30:44', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', action: 'user_create', module: 'IAM', description: 'Tạo tài khoản mới: nam.pham@truong.edu.vn', ip: '10.0.1.45', status: 'success' },
  { id: 'al005', timestamp: '2026-06-26 10:28:10', user: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn', role: 'nhan-vien', action: 'document_approve', module: 'DMS', description: 'Phê duyệt văn bản QD-2026-045', ip: '10.0.3.22', status: 'success' },
  { id: 'al006', timestamp: '2026-06-26 10:22:33', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', action: 'role_assign', module: 'IAM', description: 'Gán vai trò "Trưởng khoa" cho ts.thao@truong.edu.vn', ip: '10.0.1.45', status: 'success' },
  { id: 'al007', timestamp: '2026-06-26 10:15:07', user: 'Trần Minh Đức', email: 'minh.duc@truong.edu.vn', role: 'giang-vien', action: 'logout', module: 'IAM', description: 'Đăng xuất', ip: '10.0.2.31', status: 'success' },
  { id: 'al008', timestamp: '2026-06-26 10:12:55', user: 'Lê Thị Bình', email: 'binh.le@truong.edu.vn', role: 'sinh-vien', action: 'account_locked', module: 'IAM', description: 'Tài khoản bị khóa tự động sau 5 lần đăng nhập thất bại', ip: '113.23.45.67', status: 'error' },
  { id: 'al009', timestamp: '2026-06-26 10:05:18', user: 'Bùi Minh Tuấn', email: 'tuan.bui@truong.edu.vn', role: 'nhan-vien', action: 'exam_create', module: 'EXAM', description: 'Tạo ca thi mới: THI-2026-006', ip: '10.0.3.55', status: 'success' },
  { id: 'al010', timestamp: '2026-06-26 09:58:42', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', action: 'permission_grant', module: 'IAM', description: 'Cấp quyền viet-chuc:create cho vai trò "Nhân viên"', ip: '10.0.1.45', status: 'success' },
  { id: 'al011', timestamp: '2026-06-26 09:50:11', user: 'Phạm Hoàng Nam', email: 'nam.pham@truong.edu.vn', role: 'sinh-vien', action: 'course_register', module: 'SIS', description: 'Đăng ký học phần HK2/2025-2026 (7 môn)', ip: '118.71.22.33', status: 'success' },
  { id: 'al012', timestamp: '2026-06-26 09:45:30', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', action: 'config_change', module: 'IAM', description: 'Thay đổi cấu hình MFA: bật bắt buộc MFA toàn hệ thống', ip: '10.0.1.45', status: 'warning' },
  { id: 'al013', timestamp: '2026-06-30 07:15:00', user: 'PGS.TS. Hoàng Văn Minh', email: 'hieu-truong@truong.edu.vn', role: 'hieu-truong', action: 'login', module: 'IAM', description: 'Đăng nhập thành công', ip: '10.0.1.1', status: 'success' },
  { id: 'al014', timestamp: '2026-06-29 16:30:00', user: 'TS. Lê Thị Lan', email: 'pho-hieu-truong@truong.edu.vn', role: 'pho-hieu-truong', action: 'document_sign', module: 'DMS', description: 'Ký duyệt văn bản QD-2026-050', ip: '10.0.1.2', status: 'success' },
  { id: 'al015', timestamp: '2026-06-30 07:50:00', user: 'TS. Nguyễn Văn Khoa', email: 'truong-khoa-cntt@truong.edu.vn', role: 'truong-khoa', action: 'logout', module: 'IAM', description: 'Đăng xuất', ip: '10.0.2.50', status: 'success' },
];

const ACTION_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string; icon: React.ReactNode; color: string }> = {
  login: { variant: 'info', label: 'Đăng nhập', icon: <LogIn className="h-3.5 w-3.5" />, color: '#2563EB' },
  logout: { variant: 'neutral', label: 'Đăng xuất', icon: <LogOut className="h-3.5 w-3.5" />, color: '#94A3B8' },
  login_failed: { variant: 'error', label: 'Đăng nhập thất bại', icon: <AlertTriangle className="h-3.5 w-3.5" />, color: '#DC2626' },
  account_locked: { variant: 'error', label: 'Tài khoản bị khóa', icon: <Lock className="h-3.5 w-3.5" />, color: '#DC2626' },
  user_create: { variant: 'success', label: 'Tạo tài khoản', icon: <UserPlus className="h-3.5 w-3.5" />, color: '#16A34A' },
  user_delete: { variant: 'error', label: 'Xóa tài khoản', icon: <Trash2 className="h-3.5 w-3.5" />, color: '#DC2626' },
  role_assign: { variant: 'success', label: 'Gán vai trò', icon: <Shield className="h-3.5 w-3.5" />, color: '#16A34A' },
  permission_grant: { variant: 'success', label: 'Cấp quyền', icon: <Shield className="h-3.5 w-3.5" />, color: '#16A34A' },
  config_change: { variant: 'warning', label: 'Thay đổi cấu hình', icon: <Settings className="h-3.5 w-3.5" />, color: '#D97706' },
  document_approve: { variant: 'success', label: 'Phê duyệt văn bản', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: '#16A34A' },
  course_register: { variant: 'info', label: 'Đăng ký học phần', icon: <Edit3 className="h-3.5 w-3.5" />, color: '#2563EB' },
  exam_create: { variant: 'success', label: 'Tạo ca thi', icon: <Edit3 className="h-3.5 w-3.5" />, color: '#16A34A' },
};

const MODULES = ['Tất cả', 'IAM', 'DMS', 'EXAM', 'SIS', 'HRM', 'FIN'];
const ACTIONS = ['Tất cả', 'Đăng nhập', 'Đăng xuất', 'Tạo tài khoản', 'Gán vai trò', 'Cấp quyền', 'Phê duyệt'];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị',
  'giang-vien': 'Giảng viên',
  'sinh-vien': 'Sinh viên',
  'nhan-vien': 'Nhân viên',
  'hieu-truong': 'Hiệu trưởng',
  'pho-hieu-truong': 'Phó Hiệu trưởng',
  'truong-khoa': 'Trưởng khoa',
};

const ROLE_BADGE_VARIANT = (role: string): 'primary' | 'accent' | 'info' | 'neutral' | 'warning' | 'success' => {
  if (role === 'admin') return 'primary';
  if (role === 'giang-vien') return 'accent';
  if (role === 'sinh-vien') return 'info';
  if (role === 'hieu-truong') return 'warning';
  if (role === 'pho-hieu-truong') return 'success';
  if (role === 'truong-khoa') return 'neutral';
  return 'neutral';
};

export default function AuditLogList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('Tất cả');
  const [action, setAction] = useState('Tất cả');

  const filtered = AUDIT_LOGS.filter((log) => {
    const matchSearch = !search || log.user.toLowerCase().includes(search.toLowerCase()) || log.email.toLowerCase().includes(search.toLowerCase()) || log.description.toLowerCase().includes(search.toLowerCase());
    const matchModule = module === 'Tất cả' || log.module === module;
    const matchAction = action === 'Tất cả' || log.action.includes(action.toLowerCase().replace(/\s/g, '_'));
    return matchSearch && matchModule && matchAction;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const todayCount = AUDIT_LOGS.filter(l => l.timestamp.startsWith('2026-06-26')).length;
  const failedCount = AUDIT_LOGS.filter(l => l.status === 'error').length;

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
        {[
          { label: 'Tổng sự kiện', value: AUDIT_LOGS.length, color: 'primary', icon: <Shield className="h-5 w-5" /> },
          { label: 'Hôm nay', value: todayCount, color: 'info', icon: <LogIn className="h-5 w-5" /> },
          { label: 'Cảnh báo', value: failedCount, color: 'error', icon: <AlertTriangle className="h-5 w-5" /> },
          { label: 'Thành công', value: AUDIT_LOGS.length - failedCount, color: 'success', icon: <CheckCircle2 className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 hover-lift">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
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
          {ACTIONS.map(a => <option key={a}>{a}</option>)}
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
          {paged.length === 0 ? (
            <TableEmpty colSpan={7} message="Không tìm thấy nhật ký nào" />
          ) : (
            paged.map((log) => {
              const ac = ACTION_CONFIG[log.action] || ACTION_CONFIG.login;
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))] whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{log.user}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{log.email}</p>
                  </TableCell>
                  <TableCell><Badge variant={ROLE_BADGE_VARIANT(log.role)} size="sm">{ROLE_LABELS[log.role] ?? log.role}</Badge></TableCell>
                  <TableCell><Badge variant="neutral" size="sm">{log.module}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={ac.variant} size="sm">{ac.label}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-[rgb(var(--text-secondary))] truncate">{log.description}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-muted))]">{log.ip}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[15, 30, 50, 100]}
      />
    </div>
  );
}
