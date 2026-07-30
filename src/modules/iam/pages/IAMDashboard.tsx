import { Users, ShieldCheck, ShieldAlert, KeyRound, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Badge,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useIamLoginLogs, useIamRoles, useIamUsers, useIamUserRoles } from '@/hooks/useIam';
import { formatDateTime } from '@/utils/formatters';

const PIE_COLORS = ['#059669', '#7C3AED', '#2563EB', '#1E3A5F', '#DC2626', '#D97706'];

const HUB_CARDS = [
  {
    title: 'Xác thực & Quản lý người dùng',
    description: 'Thông tin tài khoản, vai trò và quyền của người dùng trong hệ thống',
    to: '/iam/xac-thuc',
    icon: <Users className="h-5 w-5" />,
    color: 'primary',
  },
  {
    title: 'Vai trò & Phân quyền',
    description: 'Danh sách vai trò, quyền và liên kết vai trò với người dùng',
    to: '/iam/vai-tro-quyen',
    icon: <ShieldCheck className="h-5 w-5" />,
    color: 'accent',
  },
  {
    title: 'Audit Log',
    description: 'Lịch sử phiên đăng nhập và nhật ký thao tác của người dùng',
    to: '/iam/audit-log',
    icon: <LogIn className="h-5 w-5" />,
    color: 'info',
  },
];

export default function IAMDashboard() {
  // Lấy meta.total từ các API để đếm chính xác tổng số (không phụ thuộc page size)
  const usersQuery = useIamUsers({ per_page: 100, page: 1 });
  const rolesQuery = useIamRoles({ per_page: 100 });
  const loginLogsQuery = useIamLoginLogs({ per_page: 100 });

  const totalUsers = usersQuery.data?.meta?.total ?? 0;
  const allUsers = usersQuery.data?.data ?? [];

  // Compute status counts — API trả status là string: ACTIVE, LOCKED, SUSPENDED
  const activeUsers = allUsers.filter(u => u.status === 'ACTIVE').length;
  const lockedUsers = allUsers.filter(u => u.status === 'LOCKED').length;
  const suspendedUsers = allUsers.filter(u => u.status === 'SUSPENDED').length;

  const today = new Date().toDateString();
  const todayLogins = (loginLogsQuery.data?.data ?? []).filter(
    log => new Date(log.logged_in_at).toDateString() === today
  ).length;

  const roles = rolesQuery.data?.data ?? [];

  // Batch-fetch user roles để compute user_count cho mỗi role
  const allUserIds = allUsers.map(u => u.id);
  const rolesMap = useIamUserRoles(allUserIds);

  const getUserCount = (roleCode: string): number => {
    if (!roleCode) return 0;
    return allUsers.filter(u => {
      const detail = rolesMap.data.get(u.id);
      const roles: string[] = detail?.roles ?? u.roles ?? [];
      return roles.includes(roleCode);
    }).length;
  };

  const roleDist = roles.slice(0, 6).map((r, i) => ({
    name: r.name,
    value: getUserCount(r.code),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const statCards = [
    {
      label: 'Tổng số tài khoản',
      value: totalUsers.toLocaleString('vi-VN'),
      sub: usersQuery.isLoading ? 'Đang tải…' : '',
      icon: <Users className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: 'Tài khoản hoạt động',
      value: activeUsers.toLocaleString('vi-VN'),
      sub: totalUsers > 0 ? `${((activeUsers / totalUsers) * 100).toFixed(1)}%` : '',
      icon: <ShieldCheck className="h-5 w-5" />,
      color: 'success',
    },
    {
      label: 'Tài khoản bị khóa',
      value: lockedUsers.toLocaleString('vi-VN'),
      sub: '',
      icon: <KeyRound className="h-5 w-5" />,
      color: 'error',
    },
    {
      label: 'Tài khoản tạm ngừng',
      value: suspendedUsers.toLocaleString('vi-VN'),
      sub: '',
      icon: <ShieldAlert className="h-5 w-5" />,
      color: 'warning',
    },
    {
      label: 'Đăng nhập hôm nay',
      value: todayLogins.toLocaleString('vi-VN'),
      sub: loginLogsQuery.dataUpdatedAt ? `Cập nhật ${formatDateTime(new Date(loginLogsQuery.dataUpdatedAt).toISOString())}` : '',
      icon: <LogIn className="h-5 w-5" />,
      color: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="IAM – Quản trị Hệ thống"
        description="Quản lý tài khoản, vai trò, phân quyền và giám sát hệ thống"
        breadcrumbs={[{ label: 'IAM' }]}
        actions={
          <Badge variant="success" dot>
            {totalUsers > 0 ? `${activeUsers.toLocaleString('vi-VN')} tài khoản hoạt động` : 'Đang tải...'}
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                {s.sub && <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hub Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {HUB_CARDS.map((h) => (
          <Link
            key={h.to}
            to={h.to}
            className="group relative overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 transition-all hover:border-[rgb(var(--primary))] hover:shadow-md"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${h.color})/0.1)] text-[rgb(var(--${h.color}))]`}>
                {h.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors">
                  {h.title}
                </h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{h.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-end pt-2 border-t border-[rgb(var(--border)/0.5)]">
              <span className="text-xs text-[rgb(var(--primary))] font-medium">Truy cập →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Số quyền theo vai trò</h3>
          </div>
          <CardContent className="h-64">
            {rolesQuery.isLoading ? (
              <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Đang tải...</p>
            ) : roles.length === 0 ? (
              <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Chưa có vai trò nào.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roles.slice(0, 8).map(r => ({ name: r.code, count: r.permissions_count ?? 0 }))} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--border)/0.5)" />
                  <Bar dataKey="count" fill="rgb(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Số người dùng theo vai trò</h3>
            <Badge variant="neutral">{totalUsers.toLocaleString('vi-VN')} tài khoản</Badge>
          </div>
          <CardContent className="h-64 flex items-center gap-8">
            {rolesQuery.isLoading || roleDist.length === 0 ? (
              <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8 w-full">Đang tải...</p>
            ) : (
              <>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={roleDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {roleDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1 max-h-56 overflow-y-auto">
                  {roleDist.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-sm text-[rgb(var(--text-secondary))] flex-1 truncate">{d.name}</span>
                      <span className="text-sm font-bold text-[rgb(var(--text-primary))] tabular-nums">{d.value.toLocaleString('vi-VN')}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-[rgb(var(--text-muted))]">
        * Thống kê chỉ tính trên trang đầu tiên của mỗi API (per_page mặc định).
      </p>
    </div>
  );
}