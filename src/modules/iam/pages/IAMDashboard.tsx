import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  Download,
  TrendingUp,
  Shield,
  Lock,
  LogIn,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  Switch,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

// ─── Mock data ────────────────────────────────────────────────────────────────

const USERS = [
  { id: 'u001', name: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', unit: 'Phòng CNTT', status: 'active', lastLogin: '2026-06-25 09:15' },
  { id: 'u002', name: 'Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', role: 'giang-vien', unit: 'Khoa CNTT', status: 'active', lastLogin: '2026-06-25 08:30' },
  { id: 'u003', name: 'Nguyễn Văn An', email: 'an.nguyen@truong.edu.vn', role: 'sinh-vien', unit: 'K60 – CNTT', status: 'active', lastLogin: '2026-06-24 22:10' },
  { id: 'u004', name: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn', role: 'nhan-vien', unit: 'Phòng Tổ chức', status: 'active', lastLogin: '2026-06-25 07:45' },
  { id: 'u005', name: 'Lê Thị Bình', email: 'binh.le@truong.edu.vn', role: 'sinh-vien', unit: 'K59 – Kinh tế', status: 'locked', lastLogin: '2026-06-20 14:00' },
  { id: 'u006', name: 'Trần Minh Đức', email: 'minh.duc@truong.edu.vn', role: 'giang-vien', unit: 'Khoa Kinh tế', status: 'active', lastLogin: '2026-06-24 16:20' },
  { id: 'u007', name: 'Phạm Hoàng Nam', email: 'nam.pham@truong.edu.vn', role: 'sinh-vien', unit: 'K60 – Luật', status: 'pending', lastLogin: '—' },
  { id: 'u011', name: 'PGS.TS. Hoàng Văn Minh', email: 'hieu-truong@truong.edu.vn', role: 'hieu-truong', unit: 'Ban Giám hiệu', status: 'active', lastLogin: '2026-06-30 07:30' },
  { id: 'u012', name: 'TS. Lê Thị Lan', email: 'pho-hieu-truong@truong.edu.vn', role: 'pho-hieu-truong', unit: 'Ban Giám hiệu', status: 'active', lastLogin: '2026-06-29 17:00' },
  { id: 'u013', name: 'TS. Nguyễn Văn Khoa', email: 'truong-khoa-cntt@truong.edu.vn', role: 'truong-khoa', unit: 'Khoa CNTT', status: 'active', lastLogin: '2026-06-30 08:15' },
];


const ROLE_VARIANT = (role: string): 'primary' | 'accent' | 'info' | 'neutral' | 'warning' | 'success' => {
  if (role === 'admin') return 'primary';
  if (role === 'giang-vien') return 'accent';
  if (role === 'sinh-vien') return 'info';
  if (role === 'hieu-truong') return 'warning';
  if (role === 'pho-hieu-truong') return 'success';
  if (role === 'truong-khoa') return 'neutral';
  return 'neutral';
};

const ROLES_DATA = [
  { name: 'Quản trị viên', users: 3, color: '#1E3A5F', icon: '🛡', active: true, perms: ['Toàn quyền'], matrix: [true, true, true, true, true, true] },
  { name: 'Hiệu trưởng', users: 1, color: '#1E3A5F', icon: '👤', active: true, perms: ['BGH'], matrix: [true, false, false, false, true, true] },
  { name: 'Trưởng khoa', users: 12, color: '#2563EB', icon: '📚', active: true, perms: ['Khoa'], matrix: [true, true, true, false, false, true] },
  { name: 'Giảng viên', users: 312, color: '#7C3AED', icon: '🎓', active: true, perms: ['Đào tạo'], matrix: [true, true, true, false, false, true] },
  { name: 'Sinh viên', users: 7240, color: '#059669', icon: '📖', active: true, perms: ['Học tập'], matrix: [true, false, false, false, false, false] },
  { name: 'Nhân viên HC', users: 89, color: '#6B7280', icon: '💼', active: true, perms: ['Hành chính'], matrix: [true, true, true, false, true, true] },
  { name: 'Kế toán', users: 8, color: '#D97706', icon: '💰', active: true, perms: ['Tài chính'], matrix: [true, true, true, false, true, true] },
  { name: 'Khai thác', users: 24, color: '#0891B2', icon: '🔍', active: false, perms: ['Tra cứu'], matrix: [true, false, false, false, false, false] },
];

const AUDIT_LOGS = [
  { id: 'log001', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', action: 'Tạo mới', resource: 'Tài khoản', target: 'pham.nguyen@truong.edu.vn', ip: '192.168.1.45', time: '2026-06-27 09:41', status: 'success' },
  { id: 'log002', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', action: 'Phân quyền', resource: 'Vai trò', target: 'Vai trò "Trưởng khoa"', ip: '192.168.1.45', time: '2026-06-27 09:38', status: 'success' },
  { id: 'log003', user: 'Th.S. Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', action: 'Cập nhật', resource: 'Hồ sơ SV', target: 'Bùi Minh Tuấn – K60CNTT', ip: '10.0.2.15', time: '2026-06-27 09:22', status: 'success' },
  { id: 'log004', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', action: 'Khóa tài khoản', resource: 'Tài khoản', target: 'binh.le@truong.edu.vn', ip: '192.168.1.45', time: '2026-06-27 08:55', status: 'success' },
  { id: 'log005', user: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn', action: 'Duyệt văn bản', resource: 'Văn bản điện tử', target: 'QĐ-2026-041', ip: '192.168.1.12', time: '2026-06-27 08:30', status: 'success' },
  { id: 'log006', user: 'Th.S. Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', action: 'Cập nhật', resource: 'Khóa học', target: 'CS101 – Nhập môn CNTT', ip: '10.0.2.15', time: '2026-06-27 08:15', status: 'success' },
  { id: 'log007', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', action: 'Đăng nhập', resource: 'Hệ thống', target: '—', ip: '192.168.1.45', time: '2026-06-27 08:00', status: 'success' },
  { id: 'log008', user: 'PGS.TS. Hoàng Văn Khoa', email: 'truongkhoa@truong.edu.vn', action: 'Duyệt đề tài', resource: 'NCKH', target: 'Đề tài NCKH-2026-005', ip: '10.0.3.22', time: '2026-06-26 17:45', status: 'success' },
  { id: 'log009', user: 'ThS. Trần Văn Chuyên', email: 'chuyenvien@truong.edu.vn', action: 'Tạo công việc', resource: 'Công việc', target: 'Tổng hợp báo cáo Q2/2026', ip: '192.168.1.88', time: '2026-06-26 16:20', status: 'success' },
  { id: 'log010', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', action: 'Xóa', resource: 'Tài khoản', target: 'hung.vo@truong.edu.vn', ip: '192.168.1.45', time: '2026-06-26 15:10', status: 'failure' },
  { id: 'log011', user: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn', action: 'Cập nhật', resource: 'Hồ sơ viên chức', target: 'Lê Thị Hương – P.Tổ chức', ip: '192.168.1.12', time: '2026-06-26 14:05', status: 'success' },
  { id: 'log012', user: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', action: 'Bật MFA', resource: 'Bảo mật', target: 'admin@truong.edu.vn', ip: '192.168.1.45', time: '2026-06-26 11:30', status: 'success' },
];

export default function IAMDashboard() {
  const { t } = useTranslation('iam');
  const [activeTab, setActiveTab] = useState<'accounts' | 'roles' | 'audit' | 'mfa'>('accounts');

  const STAT_CARDS = [
    { label: t('dashboard.totalAccounts'), value: '1,247', change: '+23', trend: 'up', icon: <Shield className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.activeAccounts'), value: '1,190', sub: t('dashboard.activePercent', { percent: '95.4' }), icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
    { label: t('dashboard.lockedAccounts'), value: '12', change: t('dashboard.newLocked', { count: '3' }), icon: <Lock className="h-5 w-5" />, color: 'error' },
    { label: t('dashboard.loginsToday'), value: '387', sub: t('dashboard.peakTime', { time: '9:15 AM' }), icon: <LogIn className="h-5 w-5" />, color: 'info' },
  ];

  const ROLE_LABELS: Record<string, string> = {
    admin: t('user.role.admin'),
    'giang-vien': t('user.role.giang-vien'),
    'sinh-vien': t('user.role.sinh-vien'),
    'nhan-vien': t('user.role.nhan-vien'),
    'hieu-truong': t('user.role.hieu-truong'),
    'pho-hieu-truong': t('user.role.pho-hieu-truong'),
    'truong-khoa': t('user.role.truong-khoa'),
  };

  const STATUS_CONFIG = {
    active: { variant: 'success' as const, label: t('user.status.active') },
    locked: { variant: 'error' as const, label: t('user.status.inactive') },
    pending: { variant: 'warning' as const, label: t('user.status.pending') },
  };

  const AUDIT_STATUS_CONFIG = {
    success: { variant: 'success' as const, label: t('auditLog.status.success') },
    failure: { variant: 'error' as const, label: t('auditLog.status.failure') },
  };

  const AUDIT_ACTION_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
    'Tạo mới': { variant: 'success', label: t('auditLog.action.CREATE') },
    'Cập nhật': { variant: 'info', label: t('auditLog.action.UPDATE') },
    'Xóa': { variant: 'error', label: t('auditLog.action.DELETE') },
    'Phân quyền': { variant: 'warning', label: t('auditLog.action.ASSIGN_ROLE') },
    'Khóa tài khoản': { variant: 'error', label: t('auditLog.action.LOCK_ACCOUNT') },
    'Duyệt văn bản': { variant: 'success', label: t('auditLog.action.APPROVE_DOC') },
    'Duyệt đề tài': { variant: 'success', label: t('auditLog.action.APPROVE_PROJECT') },
    'Tạo công việc': { variant: 'info', label: t('auditLog.action.CREATE_TASK') },
    'Đăng nhập': { variant: 'neutral', label: t('auditLog.action.LOGIN') },
    'Bật MFA': { variant: 'success', label: t('auditLog.action.ENABLE_MFA') },
  };

  const tabs = [
    { id: 'accounts', label: t('tabs.accounts') },
    { id: 'roles', label: t('tabs.roles') },
    { id: 'audit', label: t('tabs.audit') },
    { id: 'mfa', label: t('tabs.mfa') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        breadcrumbs={[{ label: 'IAM' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              {t('export')}
            </Button>
            <Link to="/iam/tai-khoan/tao">
              <Button leftIcon={<UserPlus className="h-4 w-4" />}>
                {t('addUser')}
              </Button>
            </Link>
          </>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">
                  {s.change ?? s.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-[rgb(var(--border)/0.6)] px-5">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                    : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Tab: Tài khoản */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  {t('user.displayCount', { count: USERS.length })}
                </p>
                <div className="flex gap-2">
                  <input
                    type="search"
                    placeholder={t('user.searchPlaceholder')}
                    className="h-8 w-64 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary-light))/0.3]"
                  />
                  <select title={t('user.filterByRole')} className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-[rgb(var(--text-secondary))] focus:outline-none">
                    <option>{t('user.filterAllRoles')}</option>
                    <option>{t('user.role.admin')}</option>
                    <option>{t('user.role.hieu-truong')}</option>
                    <option>{t('user.role.pho-hieu-truong')}</option>
                    <option>{t('user.role.truong-khoa')}</option>
                    <option>{t('user.role.giang-vien')}</option>
                    <option>{t('user.role.sinh-vien')}</option>
                    <option>{t('user.role.nhan-vien')}</option>
                  </select>
                  <select title={t('user.filterByStatus')} className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-[rgb(var(--text-secondary))] focus:outline-none">
                    <option>{t('user.filterAllStatus')}</option>
                    <option>{t('user.status.active')}</option>
                    <option>{t('user.status.inactive')}</option>
                    <option>{t('user.status.pending')}</option>
                  </select>
                </div>
              </div>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeadCell>{t('user.nguoiDung')}</TableHeadCell>
                    <TableHeadCell>{t('user.email')}</TableHeadCell>
                    <TableHeadCell>{t('user.vaiTro')}</TableHeadCell>
                    <TableHeadCell>{t('user.donVi')}</TableHeadCell>
                    <TableHeadCell>{t('user.trangThai')}</TableHeadCell>
                    <TableHeadCell>{t('user.dangNhapCuoi')}</TableHeadCell>
                    <TableHeadCell>{t('user.thaoTac')}</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {USERS.map((u) => {
                    const sc = STATUS_CONFIG[u.status as keyof typeof STATUS_CONFIG];
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <Link
                            to={`/iam/tai-khoan/${u.id}`}
                            className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                              {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-[rgb(var(--text-secondary))]">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={ROLE_VARIANT(u.role)}>{ROLE_LABELS[u.role]}</Badge>
                        </TableCell>
                        <TableCell className="text-[rgb(var(--text-secondary))]">{u.unit}</TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} dot>{sc.label}</Badge>
                        </TableCell>
                        <TableCell className="text-[rgb(var(--text-secondary))] tabular-nums text-xs">{u.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link to={`/iam/tai-khoan/${u.id}`}>
                              <Button variant="ghost" size="sm">{t('user.edit')}</Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-[rgb(var(--error))]">
                              {u.status === 'locked' ? t('user.unlock') : t('user.lock')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Tab: Vai trò */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('role.title')}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('role.roleCount', { count: '8', users: '3.420' })}</p>
                </div>
                <Button variant="outline" size="sm">{t('role.phanQuyen')}</Button>
              </div>
              {/* 8 role cards grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {ROLES_DATA.map((r) => (
                  <button
                    key={r.name}
                    className="group relative flex flex-col gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 text-left hover:border-[rgb(var(--primary-light))] hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Left color bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[var(--bar-color)]"
                      style={{ '--bar-color': r.color } as React.CSSProperties}
                    />
                    <div className="flex items-start justify-between pl-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--bg-hover))]">
                        <div className="text-lg">{r.icon}</div>
                      </div>
                      <div className={`h-2.5 w-2.5 rounded-full ${r.active ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--border))]'}`} />
                    </div>
                    <div className="pl-3">
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors">{r.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{r.users.toLocaleString()} {t('role.users')}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.perms.map((p) => (
                          <span key={p} className="inline-flex items-center rounded-md border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--text-secondary))]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {/* Role matrix */}
              <div>
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-3">{t('role.matrix')}</p>
                <div className="overflow-x-auto rounded-xl border border-[rgb(var(--border))]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-hover))]">
                        <th className="px-4 py-2.5 text-left font-semibold text-[rgb(var(--text-secondary))]">{t('role.tenVaiTro')}</th>
                        {[t('role.permissionLabels.doc'), t('role.permissionLabels.create'), t('role.permissionLabels.edit'), t('role.permissionLabels.delete'), t('role.permissionLabels.approve'), t('role.permissionLabels.export')].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-center font-semibold text-[rgb(var(--text-secondary))]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--border))]">
                      {ROLES_DATA.slice(0, 6).map((r) => (
                        <tr key={r.name} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                          <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">{r.name}</td>
                          {r.matrix.map((v, i) => (
                            <td key={i} className="px-3 py-2.5 text-center">
                              {v ? (
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[rgb(var(--success)/0.1)]">
                                  <svg className="h-2.5 w-2.5 text-[rgb(var(--success))]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </span>
                              ) : (
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[rgb(var(--border))]">
                                  <svg className="h-2 w-2 text-[rgb(var(--text-muted))]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Audit Log */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  {t('auditLog.displayCount', { count: AUDIT_LOGS.length })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <select title="Lọc theo thao tác" className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-[rgb(var(--text-secondary))] focus:outline-none">
                    <option>Tất cả thao tác</option>
                    <option>Tạo mới</option>
                    <option>Cập nhật</option>
                    <option>Xóa</option>
                    <option>Đăng nhập</option>
                    <option>Phân quyền</option>
                    <option>Duyệt văn bản</option>
                  </select>
                  <select title="Lọc theo thời gian" className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-[rgb(var(--text-secondary))] focus:outline-none">
                    <option>Tất cả thời gian</option>
                    <option>Hôm nay</option>
                    <option>7 ngày gần đây</option>
                    <option>30 ngày gần đây</option>
                  </select>
                  <select title="Lọc theo trạng thái" className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-[rgb(var(--text-secondary))] focus:outline-none">
                    <option>Tất cả trạng thái</option>
                    <option>Thành công</option>
                    <option>Thất bại</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>{t('auditLog.nguoiThucHien')}</TableHeadCell>
                      <TableHeadCell>{t('auditLog.thaoTac')}</TableHeadCell>
                      <TableHeadCell>{t('auditLog.doiTuong')}</TableHeadCell>
                      <TableHeadCell>{t('auditLog.chiTiet')}</TableHeadCell>
                      <TableHeadCell>{t('auditLog.ip')}</TableHeadCell>
                      <TableHeadCell>{t('auditLog.thoiGian')}</TableHeadCell>
                      <TableHeadCell>{t('auditLog.trangThai')}</TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {AUDIT_LOGS.map((log) => {
                      const ac = AUDIT_ACTION_CONFIG[log.action] ?? { variant: 'neutral' as const, label: log.action };
                      const sc = AUDIT_STATUS_CONFIG[log.status as keyof typeof AUDIT_STATUS_CONFIG];
                      return (
                        <TableRow key={log.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[10px] font-semibold text-[rgb(var(--primary))]">
                                {log.user.split(' ').slice(-2).map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{log.user}</p>
                                <p className="text-xs text-[rgb(var(--text-muted))]">{log.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ac.variant}>{ac.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-[rgb(var(--text-primary))]">{log.resource}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-[rgb(var(--text-secondary))] truncate max-w-[180px]" title={log.target}>{log.target}</p>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs font-mono text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">
                              {log.ip}
                            </code>
                          </TableCell>
                          <TableCell>
                            <p className="text-xs text-[rgb(var(--text-muted))] tabular-nums">{log.time}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant} dot>{sc.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tab: MFA Config */}
          {activeTab === 'mfa' && (
            <div className="space-y-4 py-4">
              {[
                { label: t('mfaConfig.requireMFA'), desc: t('mfaConfig.requireMFADesc'), enabled: true },
                { label: t('mfaConfig.mfaByRole'), desc: t('mfaConfig.mfaByRoleDesc'), enabled: false },
                { label: t('mfaConfig.autoLogout'), desc: t('mfaConfig.autoLogoutDesc'), enabled: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.label}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{item.desc}</p>
                  </div>
                  <Switch
                    checked={item.enabled}
                    onChange={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
