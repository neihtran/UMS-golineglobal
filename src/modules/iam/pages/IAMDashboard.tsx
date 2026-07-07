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
  TableEmpty,
  TablePagination,
  Switch,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useIamDashboard } from '@/hooks/useIam';
import { useUserList, useLockUser, useUnlockUser } from '@/hooks/useIam';
import { usePagination } from '@/hooks';

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
  if (role === 'TRUONG_KHOA') return 'neutral';
  if (role === 'NHAN_VIEN') return 'neutral';
  return 'neutral';
};

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Hoạt động' },
  locked: { variant: 'error' as const, label: 'Bị khóa' },
  pending: { variant: 'warning' as const, label: 'Chờ kích hoạt' },
  inactive: { variant: 'neutral' as const, label: 'Không hoạt động' },
};

const AUDIT_STATUS_CONFIG = {
  success: { variant: 'success' as const, label: 'Thành công' },
  failure: { variant: 'error' as const, label: 'Thất bại' },
  warning: { variant: 'warning' as const, label: 'Cảnh báo' },
};

const AUDIT_ACTION_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  CREATE: { variant: 'success', label: 'Tạo mới' },
  UPDATE: { variant: 'info', label: 'Cập nhật' },
  DELETE: { variant: 'error', label: 'Xóa' },
  APPROVE: { variant: 'success', label: 'Phê duyệt' },
  ASSIGN_ROLE: { variant: 'warning', label: 'Phân quyền' },
  LOCK_ACCOUNT: { variant: 'error', label: 'Khóa tài khoản' },
  APPROVE_DOC: { variant: 'success', label: 'Duyệt văn bản' },
  APPROVE_PROJECT: { variant: 'success', label: 'Duyệt đề tài' },
  CREATE_TASK: { variant: 'info', label: 'Tạo công việc' },
  LOGIN: { variant: 'neutral', label: 'Đăng nhập' },
  ENABLE_MFA: { variant: 'success', label: 'Bật MFA' },
};

export default function IAMDashboard() {
  const { t } = useTranslation('iam');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [activeTab, setActiveTab] = useState<'accounts' | 'roles' | 'audit' | 'mfa'>('accounts');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const dashboardQuery = useIamDashboard();
  const { data: usersData, isLoading: usersLoading } = useUserList({
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

  const records = usersData?.data ?? [];
  const total = usersData?.pagination?.total ?? 0;

  const isLocking = (id: string) => lockMutation.variables === id && lockMutation.isPending;
  const isUnlocking = (id: string) => unlockMutation.variables === id && unlockMutation.isPending;

  const handleToggleLock = (user: { _id: string; status: string }) => {
    if (user.status === 'locked') {
      unlockMutation.mutate(user._id);
    } else {
      lockMutation.mutate(user._id);
    }
  };

  const stats = dashboardQuery.data?.data?.stats;
  const rolesData = dashboardQuery.data?.data?.roles ?? [];
  const recentAudit = dashboardQuery.data?.data?.recentAudit ?? [];

  const statCards = stats
    ? [
        { label: t('dashboard.totalAccounts', { defaultValue: 'Tổng tài khoản' }), value: stats.totalUsers.toLocaleString('vi-VN'), change: '+23', trend: 'up' as const, icon: <Shield className="h-5 w-5" />, color: 'primary' },
        { label: t('dashboard.activeAccounts', { defaultValue: 'Đang hoạt động' }), value: stats.activeUsers.toLocaleString('vi-VN'), sub: `${stats.activePercent}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
        { label: t('dashboard.lockedAccounts', { defaultValue: 'Bị khóa' }), value: String(stats.lockedUsers), icon: <Lock className="h-5 w-5" />, color: 'error' },
        { label: t('dashboard.loginsToday', { defaultValue: 'Đăng nhập hôm nay' }), value: String(stats.loginsToday), sub: '9:15 AM', icon: <LogIn className="h-5 w-5" />, color: 'info' },
      ]
    : [];

  const tabs = [
    { id: 'accounts', label: t('tabs.accounts', { defaultValue: 'Tài khoản' }) },
    { id: 'roles', label: t('tabs.roles', { defaultValue: 'Vai trò' }) },
    { id: 'audit', label: t('tabs.audit', { defaultValue: 'Nhật ký' }) },
    { id: 'mfa', label: t('tabs.mfa', { defaultValue: 'MFA' }) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title', { defaultValue: 'Quản trị Hệ thống' })}
        description={t('dashboard.description', { defaultValue: 'Quản lý người dùng, vai trò và phân quyền' })}
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
      {dashboardQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-11 w-11 rounded-lg bg-[rgb(var(--border))]" />
                  <div className="h-4 w-24 rounded bg-[rgb(var(--border))]" />
                  <div className="h-6 w-16 rounded bg-[rgb(var(--border))]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statCards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((s) => (
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
      ) : null}

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
                  {t('user.displayCount', { defaultValue: '{{count}} tài khoản', count: total })}
                </p>
                <div className="flex gap-2">
                  <input
                    type="search"
                    placeholder={t('user.searchPlaceholder')}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="h-8 w-64 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary-light))/0.3]"
                  />
                  <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-[rgb(var(--text-secondary))] focus:outline-none">
                    <option value="all">{t('user.filterAllRoles', { defaultValue: 'Tất cả vai trò' })}</option>
                    <option value="SUPER_ADMIN">Quản trị viên</option>
                    <option value="HIEU_TRUONG">Hiệu trưởng</option>
                    <option value="PHO_HIEU_TRUONG">Phó Hiệu trưởng</option>
                    <option value="TRUONG_KHOA">Trưởng khoa</option>
                    <option value="GIAO_VIEN">Giảng viên</option>
                    <option value="NHAN_VIEN">Nhân viên</option>
                    <option value="SINH_VIEN">Sinh viên</option>
                  </select>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm text-[rgb(var(--text-secondary))] focus:outline-none">
                    <option value="all">{t('user.filterAllStatus', { defaultValue: 'Tất cả trạng thái' })}</option>
                    <option value="active">{t('user.status.active')}</option>
                    <option value="locked">{t('user.status.inactive')}</option>
                    <option value="pending">{t('user.status.pending')}</option>
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
                  {usersLoading ? (
                    <TableEmpty colSpan={7} message={t('common:common.loading')} />
                  ) : records.length === 0 ? (
                    <TableEmpty colSpan={7} message={t('empty.noResults', { defaultValue: 'Không tìm thấy tài khoản nào' })} />
                  ) : (
                    records.map((u) => {
                      const sc = STATUS_CONFIG[u.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.inactive;
                      const fullName = u.displayName ?? u.email;
                      return (
                        <TableRow key={u._id}>
                          <TableCell>
                            <Link
                              to={`/iam/tai-khoan/${u._id}`}
                              className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                                {fullName.split(' ').slice(-2).map((n) => n[0]).join('')}
                              </div>
                              <span className="font-medium">{fullName}</span>
                            </Link>
                          </TableCell>
                          <TableCell className="text-[rgb(var(--text-secondary))]">{u.email}</TableCell>
                          <TableCell><Badge variant={ROLE_VARIANT(u.role)}>{ROLE_LABELS[u.role] ?? u.role}</Badge></TableCell>
                          <TableCell className="text-[rgb(var(--text-secondary))]">{u.unit ?? u.department?.name ?? '—'}</TableCell>
                          <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                          <TableCell className="text-[rgb(var(--text-secondary))] tabular-nums text-xs">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Link to={`/iam/tai-khoan/${u._id}`}>
                                <Button variant="ghost" size="sm">{t('user.edit')}</Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                loading={isLocking(u._id) || isUnlocking(u._id)}
                                onClick={() => handleToggleLock(u)}
                                className={u.status === 'locked' ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'}
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
                pageSizeOptions={[10, 25, 50]}
              />
            </div>
          )}

          {/* Tab: Vai trò */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('role.title')}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                    {t('role.roleCount', { count: String(rolesData.length), users: String(dashboardQuery.data?.data?.stats?.totalUsers ?? 0) })}
                  </p>
                </div>
                <Button variant="outline" size="sm">{t('role.phanQuyen')}</Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {rolesData.map((r) => (
                  <button
                    key={r.name}
                    className="group relative flex flex-col gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 text-left hover:border-[rgb(var(--primary-light))] hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: r.color }} />
                    <div className="flex items-start justify-between pl-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--bg-hover))]">
                        <div className="text-lg">{r.icon}</div>
                      </div>
                      <div className={`h-2.5 w-2.5 rounded-full ${r.active ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--border))]'}`} />
                    </div>
                    <div className="pl-3">
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors">{r.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{r.users.toLocaleString()} {t('role.users', { defaultValue: 'người dùng' })}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.perms.map((p: string) => (
                          <span key={p} className="inline-flex items-center rounded-md border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--text-secondary))]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-3">{t('role.matrix', { defaultValue: 'Ma trận phân quyền' })}</p>
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
                      {rolesData.slice(0, 6).map((r) => (
                        <tr key={r.name} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                          <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">{r.name}</td>
                          {r.matrix.map((v: boolean) => (
                            <td key={String(v)} className="px-3 py-2.5 text-center">
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
                  {t('auditLog.displayCount', { defaultValue: '{{count}} bản ghi', count: recentAudit.length })}
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
                    {dashboardQuery.isLoading ? (
                      <TableEmpty colSpan={7} message={t('common:common.loading')} />
                    ) : recentAudit.length === 0 ? (
                      <TableEmpty colSpan={7} message="Chưa có nhật ký nào" />
                    ) : (
                      recentAudit.map((log) => {
                        const ac = AUDIT_ACTION_CONFIG[log.action] ?? { variant: 'neutral' as const, label: log.action };
                        const sc = AUDIT_STATUS_CONFIG[log.status] ?? { variant: 'neutral' as const, label: log.status };
                        return (
                          <TableRow key={log._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[10px] font-semibold text-[rgb(var(--primary))]">
                                  {(log.userName ?? '?').split(' ').slice(-2).map((n) => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{log.userName}</p>
                                  <p className="text-xs text-[rgb(var(--text-muted))]">{log.userEmail}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={ac.variant}>{ac.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-[rgb(var(--text-primary))]">{log.resource ?? '—'}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-[rgb(var(--text-secondary))] truncate max-w-[180px]" title={log.details}>{log.details}</p>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-mono text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">
                                {log.ip}
                              </code>
                            </TableCell>
                            <TableCell>
                              <p className="text-xs text-[rgb(var(--text-muted))] tabular-nums">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : '—'}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={sc.variant} dot>{sc.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
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
