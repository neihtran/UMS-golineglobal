import { useState } from 'react';
import {
  Globe,
  MapPin,
  Building,
  Home,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  CountrySheet,
  ProvinceSheet,
  DistrictSheet,
  WardSheet,
} from './sheets';

type TabType =
  | 'quoc-gia'
  | 'tinh-tp'
  | 'quan-huyen'
  | 'phuong-xa';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'quoc-gia', label: 'Quốc gia', icon: <Globe className="h-4 w-4" /> },
  { id: 'tinh-tp', label: 'Tỉnh & Thành phố TW', icon: <MapPin className="h-4 w-4" /> },
  { id: 'quan-huyen', label: 'Quận, Huyện, Thị xã', icon: <Building className="h-4 w-4" /> },
  { id: 'phuong-xa', label: 'Phường, Xã, Thôn', icon: <Home className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'quoc-gia': <CountrySheet />,
  'tinh-tp': <ProvinceSheet />,
  'quan-huyen': <DistrictSheet />,
  'phuong-xa': <WardSheet />,
};

export default function AdministrativeBoundaryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('quoc-gia');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Địa giới hành chính"
        description="Quản lý Quốc gia → Tỉnh & Thành phố Trung ương → Quận/Huyện/Thị xã → Phường/Xã/Thôn"
        breadcrumbs={[
          { label: 'CORE', href: '/core' },
          { label: 'Địa giới hành chính' },
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

      {TAB_CONTENT[activeTab]}
    </div>
  );
}
