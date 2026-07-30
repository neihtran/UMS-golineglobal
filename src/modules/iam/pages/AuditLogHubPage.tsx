import { useState } from 'react';
import { FileText, LogIn } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { AuditLogTabContent } from './AuditLogPage';
import { LoginLogTabContent } from './LoginLogPage';

type TabType = 'nhat-ky' | 'phien-dang-nhap';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'nhat-ky', label: 'Nhật ký thao tác', icon: <FileText className="h-4 w-4" /> },
  { id: 'phien-dang-nhap', label: 'Lịch sử phiên đăng nhập', icon: <LogIn className="h-4 w-4" /> },
];

export default function AuditLogHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('nhat-ky');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Theo dõi lịch sử thao tác và phiên đăng nhập của người dùng"
        breadcrumbs={[
          { label: 'IAM', href: '/iam' },
          { label: 'Quản trị Hệ thống' },
          { label: 'Audit Log' },
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

      {activeTab === 'nhat-ky' && <AuditLogTabContent />}
      {activeTab === 'phien-dang-nhap' && <LoginLogTabContent />}
    </div>
  );
}
