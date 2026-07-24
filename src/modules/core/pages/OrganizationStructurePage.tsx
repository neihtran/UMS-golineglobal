import { useState } from 'react';
import {
  Building2,
  School,
  BookOpen,
  Users,
  Briefcase,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  OrganizationSheet,
  CampusSheet,
  FacultySheet,
  DepartmentSheet,
  DivisionSheet,
  BuildingSheet,
} from './sheets';

type TabType =
  | 'to-chuc'
  | 'co-so'
  | 'khoa'
  | 'bo-mon'
  | 'phong-ban'
  | 'toa-nha';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'to-chuc', label: 'Thông tin tổ chức', icon: <Building2 className="h-4 w-4" /> },
  { id: 'co-so', label: 'Cơ sở đào tạo', icon: <School className="h-4 w-4" /> },
  { id: 'khoa', label: 'Khoa trực thuộc', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'bo-mon', label: 'Bộ môn trực thuộc', icon: <Users className="h-4 w-4" /> },
  { id: 'phong-ban', label: 'Phòng, Ban & Chức năng', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'toa-nha', label: 'Tòa nhà trực thuộc', icon: <Building2 className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'to-chuc': <OrganizationSheet />,
  'co-so': <CampusSheet />,
  'khoa': <FacultySheet />,
  'bo-mon': <DepartmentSheet />,
  'phong-ban': <DivisionSheet />,
  'toa-nha': <BuildingSheet />,
};

export default function OrganizationStructurePage() {
  const [activeTab, setActiveTab] = useState<TabType>('to-chuc');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cơ cấu tổ chức"
        description="Quản lý thông tin tổ chức, cơ sở đào tạo, khoa, bộ môn, phòng ban và tòa nhà"
        breadcrumbs={[
          { label: 'CORE', href: '/core' },
          { label: 'Cơ cấu tổ chức' },
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
