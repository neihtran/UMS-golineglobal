import { useState } from 'react';
import { Users, Briefcase, GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  MajorSheet,
  SpecializationSheet,
  TrainingSystemSheet,
  AcademicTermSheet,
  CourseSheet,
} from './sheets';

type TabType =
  | 'nganh-hoc'
  | 'chuyen-nganh'
  | 'he-dao-tao'
  | 'hoc-ky'
  | 'khoa-hoc';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'nganh-hoc', label: 'Ngành học', icon: <Users className="h-4 w-4" /> },
  { id: 'chuyen-nganh', label: 'Chuyên ngành', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'he-dao-tao', label: 'Hệ đào tạo', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'hoc-ky', label: 'Học kỳ', icon: <Calendar className="h-4 w-4" /> },
  { id: 'khoa-hoc', label: 'Khóa học', icon: <BookOpen className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'nganh-hoc': <MajorSheet />,
  'chuyen-nganh': <SpecializationSheet />,
  'he-dao-tao': <TrainingSystemSheet />,
  'hoc-ky': <AcademicTermSheet />,
  'khoa-hoc': <CourseSheet />,
};

export default function TrainingCatalogPage() {
  const [activeTab, setActiveTab] = useState<TabType>('nganh-hoc');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh mục đào tạo"
        description="Quản lý ngành học, chuyên ngành, hệ đào tạo, học kỳ và khóa học"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục đào tạo' },
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
