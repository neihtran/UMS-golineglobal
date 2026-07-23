import { useState } from 'react';
import { List, Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { MasterGroupSheet } from './sheets/MasterGroupSheet';
import { MasterValueSheet } from './sheets/MasterValueSheet';

type Tab = 'nhom-danh-muc' | 'gia-tri-danh-muc';

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('nhom-danh-muc');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh mục dùng chung"
        description="Quản lý nhóm và giá trị danh mục hệ thống"
        breadcrumbs={[
          { label: 'CORE', href: '/core/co-cau' },
          { label: 'Danh mục dùng chung' },
        ]}
      />

      {/* Tabs */}
      <div className="border-b border-[rgb(var(--border))]">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('nhom-danh-muc')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'nhom-danh-muc'
                ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Nhóm danh mục
            </div>
          </button>
          <button
            onClick={() => setActiveTab('gia-tri-danh-muc')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'gia-tri-danh-muc'
                ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
            }`}
          >
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Giá trị danh mục
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'nhom-danh-muc' && <MasterGroupSheet />}
        {activeTab === 'gia-tri-danh-muc' && <MasterValueSheet />}
      </div>
    </div>
  );
}
