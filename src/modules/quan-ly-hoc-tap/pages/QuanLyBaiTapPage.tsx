import { useState, useMemo } from 'react';
import { ClipboardList, BookOpen, Star } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  AssignmentSheet,
  AssignmentSubmissionSheet,
  AssignmentGradeSheet,
} from './sheets';

type TabType = 'bai-tap-da-giao' | 'bai-tap-da-nop' | 'diem-nhan-xet';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'bai-tap-da-giao', label: 'Bài tập đã giao', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'bai-tap-da-nop', label: 'Bài tập đã nộp', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'diem-nhan-xet', label: 'Điểm & Nhận xét', icon: <Star className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'bai-tap-da-giao': <AssignmentSheet />,
  'bai-tap-da-nop': <AssignmentSubmissionSheet />,
  'diem-nhan-xet': <AssignmentGradeSheet />,
};

export default function QuanLyBaiTapPage() {
  const [activeTab, setActiveTab] = useState<TabType>('bai-tap-da-giao');

  const content = useMemo(() => TAB_CONTENT[activeTab], [activeTab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý bài tập"
        description="Quản lý bài tập đã giao, theo dõi bài nộp và chấm điểm cho sinh viên"
        breadcrumbs={[
          { label: 'Quản lý Học tập', href: '/quan-ly-hoc-tap' },
          { label: 'Quản lý bài tập' },
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
