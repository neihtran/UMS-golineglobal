import { useState, useMemo } from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { LearningCourseSheet, CourseMaterialSheet } from './sheets';

type TabType = 'khoa-hoc-lms' | 'hoc-lieu';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'khoa-hoc-lms', label: 'Khóa học LMS', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'hoc-lieu', label: 'Học liệu', icon: <BookOpen className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'khoa-hoc-lms': <LearningCourseSheet />,
  'hoc-lieu': <CourseMaterialSheet />,
};

export default function QuanLyHocTapPage() {
  const [activeTab, setActiveTab] = useState<TabType>('khoa-hoc-lms');

  const content = useMemo(() => TAB_CONTENT[activeTab], [activeTab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý khóa học"
        description="Quản lý thông tin khóa học & toàn bộ học liệu được sử dụng trên hệ thống LMS"
        breadcrumbs={[
          { label: 'Quản lý Học tập', href: '/quan-ly-hoc-tap' },
          { label: 'Quản lý khóa học' },
        ]}
      />

      <div className="border-b border-[rgb(var(--border))]">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
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

      {content}
    </div>
  );
}
