import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, Settings, History } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { cn } from '@/lib/utils';

const SUB_TABS = [
  { to: '/iam/xac-thuc/tai-khoan', label: 'Thông tin tài khoản', icon: Users },
  { to: '/iam/xac-thuc/thiet-lap', label: 'Thiết lập thông tin', icon: Settings },
  { to: '/iam/xac-thuc/phien', label: 'Lưu trữ mã xác thực', icon: History },
];

export default function AuthenticationPage() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xác thực & Quản lý người dùng"
        description="Quản lý tài khoản, thiết lập thông tin cá nhân và lịch sử xác thực"
        breadcrumbs={[
          { label: 'IAM', href: '/iam' },
          { label: 'Quản trị Hệ thống' },
          { label: 'Xác thực & Quản lý người dùng' },
        ]}
      />

      {/* Sub-navigation tabs */}
      <div className="border-b border-[rgb(var(--border))]">
        <div className="flex gap-1 -mb-px">
          {SUB_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.to
              || location.pathname.startsWith(tab.to + '/');
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                    : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:border-[rgb(var(--border))]'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <Outlet />
    </div>
  );
}