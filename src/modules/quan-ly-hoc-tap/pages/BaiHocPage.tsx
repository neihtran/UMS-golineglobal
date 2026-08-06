import { useState, useMemo } from 'react';
import { FolderTree, FileText, Layers } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { CourseModuleSheet } from './sheets/CourseModuleSheet';
import { LessonSheet } from './sheets/LessonSheet';
import { LessonContentSheet } from './sheets/LessonContentSheet';

type TabType = 'chuong-hoc' | 'bai-hoc' | 'noi-dung';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'chuong-hoc', label: 'Chương học', icon: <FolderTree className="h-4 w-4" /> },
  { id: 'bai-hoc', label: 'Bài học', icon: <Layers className="h-4 w-4" /> },
  { id: 'noi-dung', label: 'Nội dung bài học', icon: <FileText className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'chuong-hoc': <CourseModuleSheet />,
  'bai-hoc': <LessonSheet />,
  'noi-dung': <LessonContentSheet />,
};

export default function BaiHocPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chuong-hoc');

  const content = useMemo(() => TAB_CONTENT[activeTab], [activeTab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Bài học"
        breadcrumbs={[
          { label: 'Quản lý Học tập', href: '/quan-ly-hoc-tap' },
          { label: 'Quản lý Bài học' },
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
