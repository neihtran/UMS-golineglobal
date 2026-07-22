import { useState } from 'react';
import { ClipboardList, UserCheck, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  AdmissionBatchSheet,
  AdmissionStudentSheet,
  HqnhatStudentSheet,
} from './sheets';

type TabType =
  | 'dot-tuyen-sinh'
  | 'thi-sinh-trung-tuyen'
  | 'sinh-vien';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'dot-tuyen-sinh', label: 'Đợt tuyển sinh', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'thi-sinh-trung-tuyen', label: 'Thí sinh trúng tuyển', icon: <UserCheck className="h-4 w-4" /> },
  { id: 'sinh-vien', label: 'Sinh viên', icon: <UserPlus className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'dot-tuyen-sinh': <AdmissionBatchSheet />,
  'thi-sinh-trung-tuyen': <AdmissionStudentSheet />,
  'sinh-vien': <HqnhatStudentSheet />,
};

export default function StudentAdmissionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dot-tuyen-sinh');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sinh viên & Tuyển sinh"
        description="Quản lý đợt tuyển sinh, thí sinh trúng tuyển và sinh viên"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Sinh viên & Tuyển sinh' },
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
