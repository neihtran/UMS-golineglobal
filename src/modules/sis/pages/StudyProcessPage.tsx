import { useState } from 'react';
import { History, RefreshCw, GraduationCap, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  StatusHistorySheet,
  BaoLuuSheet,
  ThoiHocSheet,
  MajorChangeSheet,
  ClassChangeSheet,
} from './sheets';

type TabType =
  | 'lich-su-trang-thai'
  | 'bao-luu'
  | 'thoi-hoc'
  | 'chuyen-nganh'
  | 'chuyen-lop';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'lich-su-trang-thai', label: 'Lịch sử trạng thái', icon: <History className="h-4 w-4" /> },
  { id: 'bao-luu', label: 'Bảo lưu', icon: <RefreshCw className="h-4 w-4" /> },
  { id: 'thoi-hoc', label: 'Thôi học', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'chuyen-nganh', label: 'Chuyển ngành', icon: <Users className="h-4 w-4" /> },
  { id: 'chuyen-lop', label: 'Chuyển lớp', icon: <Users className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'lich-su-trang-thai': <StatusHistorySheet />,
  'bao-luu': <BaoLuuSheet />,
  'thoi-hoc': <ThoiHocSheet />,
  'chuyen-nganh': <MajorChangeSheet />,
  'chuyen-lop': <ClassChangeSheet />,
};

export default function StudyProcessPage() {
  const [activeTab, setActiveTab] = useState<TabType>('lich-su-trang-thai');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quá trình học tập"
        description="Quản lý lịch sử trạng thái, bảo lưu, thôi học, chuyển ngành, chuyển lớp"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Quá trình học tập' },
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
