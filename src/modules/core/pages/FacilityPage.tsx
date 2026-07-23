import { useState } from 'react';
import { Building, Layers, DoorOpen, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  FloorSheet,
  RoomTypeSheet,
  RoomSheet,
} from './sheets';

type TabType =
  | 'tang'
  | 'loai-phong'
  | 'phong';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'tang', label: 'Tầng', icon: <Layers className="h-4 w-4" /> },
  { id: 'loai-phong', label: 'Loại phòng', icon: <DoorOpen className="h-4 w-4" /> },
  { id: 'phong', label: 'Phòng', icon: <MapPin className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'tang': <FloorSheet />,
  'loai-phong': <RoomTypeSheet />,
  'phong': <RoomSheet />,
};

export default function FacilityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tang');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cơ sở vật chất"
        description="Quản lý tầng, loại phòng và phòng học trong các tòa nhà"
        breadcrumbs={[
          { label: 'CORE', href: '/core' },
          { label: 'Cơ sở vật chất' },
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
