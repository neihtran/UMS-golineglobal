import { useState, useMemo } from 'react';
import { MessageSquare, MessagesSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  DiscussionTopicSheet,
  DiscussionPostSheet,
} from './sheets';

type TabType = 'chu-de' | 'bai-viet';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'chu-de', label: 'Chủ đề thảo luận', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'bai-viet', label: 'Bài viết & Phản hồi', icon: <MessagesSquare className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'chu-de': <DiscussionTopicSheet />,
  'bai-viet': <DiscussionPostSheet />,
};

export default function QuanLyThaoLuanPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chu-de');

  const content = useMemo(() => TAB_CONTENT[activeTab], [activeTab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Thảo luận"
        description="Quản lý chủ đề thảo luận, bài viết và phản hồi giữa giảng viên và sinh viên trong từng khóa học"
        breadcrumbs={[
          { label: 'Quản lý Học tập', href: '/quan-ly-hoc-tap' },
          { label: 'Quản lý Thảo luận' },
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
