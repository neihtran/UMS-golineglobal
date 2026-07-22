import { useState } from 'react';
import { BookOpen, Calendar, History, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  CourseSectionSheet,
  ClassScheduleSheet,
  ScheduleChangeSheet,
  CourseRegistrationSheet,
} from './sheets';

type TabType =
  | 'lop-hoc-phan'
  | 'thoi-khoa-bieu'
  | 'danh-sach-dang-ky'
  | 'lich-su-thay-doi';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'lop-hoc-phan', label: 'Lớp học phần', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'thoi-khoa-bieu', label: 'Thời khóa biểu', icon: <Calendar className="h-4 w-4" /> },
  { id: 'danh-sach-dang-ky', label: 'Danh sách đăng ký', icon: <UserPlus className="h-4 w-4" /> },
  { id: 'lich-su-thay-doi', label: 'Lịch sử thay đổi', icon: <History className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'lop-hoc-phan': <CourseSectionSheet />,
  'thoi-khoa-bieu': <ClassScheduleSheet />,
  'danh-sach-dang-ky': <CourseRegistrationSheet />,
  'lich-su-thay-doi': <ScheduleChangeSheet />,
};

export default function RegistrationSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>('lop-hoc-phan');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng ký học phần & Thời khóa biểu"
        description="Quản lý lớp học phần, thời khóa biểu, danh sách đăng ký và lịch sử thay đổi"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Đăng ký HP & TKB' },
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
