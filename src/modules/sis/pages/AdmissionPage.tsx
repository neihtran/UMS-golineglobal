import { useState } from 'react';
import { ClipboardList, UserCheck, UserPlus, History, RefreshCw, GraduationCap, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  AdmissionBatchSheet,
  AdmissionStudentSheet,
  HqnhatStudentSheet,
  BaoLuuSheet,
  ThoiHocSheet,
  MajorChangeSheet,
  ClassChangeSheet,
  StatusHistorySheet,
} from './sheets';

type TabType =
  | 'dot-tuyen-sinh'
  | 'thi-sinh-trung-tuyen'
  | 'sinh-vien'
  | 'lich-su-trang-thai'
  | 'bao-luu'
  | 'thoi-hoc'
  | 'chuyen-nganh'
  | 'chuyen-lop';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'dot-tuyen-sinh', label: 'Đợt tuyển sinh', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'thi-sinh-trung-tuyen', label: 'Thí sinh trúng tuyển', icon: <UserCheck className="h-4 w-4" /> },
  { id: 'sinh-vien', label: 'Sinh viên', icon: <UserPlus className="h-4 w-4" /> },
  { id: 'bao-luu', label: 'Bảo lưu', icon: <RefreshCw className="h-4 w-4" /> },
  { id: 'thoi-hoc', label: 'Thôi học', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'chuyen-nganh', label: 'Chuyển ngành', icon: <Users className="h-4 w-4" /> },
  { id: 'chuyen-lop', label: 'Chuyển lớp', icon: <Users className="h-4 w-4" /> },
  { id: 'lich-su-trang-thai', label: 'Lịch sử trạng thái', icon: <History className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'dot-tuyen-sinh': <AdmissionBatchSheet />,
  'thi-sinh-trung-tuyen': <AdmissionStudentSheet />,
  'sinh-vien': <HqnhatStudentSheet />,
  'bao-luu': <BaoLuuSheet />,
  'thoi-hoc': <ThoiHocSheet />,
  'chuyen-nganh': <MajorChangeSheet />,
  'chuyen-lop': <ClassChangeSheet />,
  'lich-su-trang-thai': <StatusHistorySheet />,
};

export default function AdmissionPage() {
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

      {/* Tab nav */}
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

      {/* Tab content */}
      {TAB_CONTENT[activeTab]}
    </div>
  );
}
