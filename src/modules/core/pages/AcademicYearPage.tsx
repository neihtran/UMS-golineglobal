import { useState } from 'react';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  AcademicYearSheet,
  SemesterSheet,
} from './sheets';

type TabType =
  | 'nam-hoc'
  | 'hoc-ky';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'nam-hoc', label: 'Năm học', icon: <Calendar className="h-4 w-4" /> },
  { id: 'hoc-ky', label: 'Học kỳ', icon: <Clock className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'nam-hoc': <AcademicYearSheet />,
  'hoc-ky': <SemesterSheet />,
};

export default function AcademicYearPage() {
  const [activeTab, setActiveTab] = useState<TabType>('nam-hoc');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Niên khóa"
        description="Quản lý năm học và học kỳ trong hệ thống"
        breadcrumbs={[
          { label: 'CORE', href: '/core' },
          { label: 'Niên khóa' },
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
