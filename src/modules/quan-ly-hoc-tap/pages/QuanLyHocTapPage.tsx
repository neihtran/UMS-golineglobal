import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { LearningCourseSheet, CourseMaterialSheet } from './sheets';

type TabType = 'khoa-hoc-lms' | 'hoc-lieu';

const TABS: { id: TabType; label: string; icon: React.ReactNode; path: string }[] = [
  { id: 'khoa-hoc-lms', label: 'Khóa học LMS', icon: <GraduationCap className="h-4 w-4" />, path: '/quan-ly-hoc-tap/khoa-hoc' },
  { id: 'hoc-lieu', label: 'Học liệu', icon: <BookOpen className="h-4 w-4" />, path: '/quan-ly-hoc-tap/hoc-lieu' },
];

function getTabFromPath(pathname: string): TabType {
  if (pathname.startsWith('/quan-ly-hoc-tap/hoc-lieu')) return 'hoc-lieu';
  return 'khoa-hoc-lms';
}

export default function QuanLyHocTapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = getTabFromPath(location.pathname);

  const handleChangeTab = (next: TabType) => {
    const target = TABS.find((t) => t.id === next);
    if (target) navigate(target.path, { replace: true });
  };

  // Render có điều kiện để chỉ mount đúng sheet tương ứng với tab đang hiển thị
  const content = useMemo(() => {
    switch (activeTab) {
      case 'hoc-lieu':
        return <CourseMaterialSheet />;
      case 'khoa-hoc-lms':
      default:
        return <LearningCourseSheet />;
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý khóa học"
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
              onClick={() => handleChangeTab(tab.id)}
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
