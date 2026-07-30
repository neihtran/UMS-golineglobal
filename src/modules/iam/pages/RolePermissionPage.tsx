import { useState } from 'react';
import {
  Shield, KeyRound, Users, ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { RoleTabContent } from './RoleListPage';
import { PermissionTabContent } from './PermissionListPage';
import { UserRoleTabContent } from './UserRolePage';
import { RoleScopeTabContent } from './RoleScopePage';

type TabType = 'vai-tro' | 'cac-quyen' | 'vai-tro-nguoi-dung' | 'pham-vi';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'vai-tro', label: 'Các vai trò', icon: <Shield className="h-4 w-4" /> },
  { id: 'cac-quyen', label: 'Các quyền', icon: <KeyRound className="h-4 w-4" /> },
  { id: 'vai-tro-nguoi-dung', label: 'Vai trò người dùng', icon: <Users className="h-4 w-4" /> },
  { id: 'pham-vi', label: 'Phạm vi quyền', icon: <ShieldCheck className="h-4 w-4" /> },
];

export default function RolePermissionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('vai-tro');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vai trò & Phân quyền"
        description="Quản lý vai trò, quyền và liên kết vai trò với người dùng"
        breadcrumbs={[
          { label: 'IAM', href: '/iam' },
          { label: 'Quản trị Hệ thống' },
          { label: 'Vai trò & Phân quyền' },
        ]}
      />

      <div className="border-b border-[rgb(var(--border))]">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                  : 'border-transparent text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'vai-tro' && <RoleTabContent />}
      {activeTab === 'cac-quyen' && <PermissionTabContent />}
      {activeTab === 'vai-tro-nguoi-dung' && <UserRoleTabContent />}
      {activeTab === 'pham-vi' && <RoleScopeTabContent />}
    </div>
  );
}