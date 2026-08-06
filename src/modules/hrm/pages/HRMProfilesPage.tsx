import { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Users,
  Award,
  FileText,
  BookOpen,
  BriefcaseIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  PositionSheet,
  AcademicRankSheet,
  EmployeeProfileSheet,
  DegreeSheet,
  CertificateSheet,
  TrainingHistorySheet,
  WorkHistorySheet,
} from './sheets';

// Part 1: Danh mục & Hồ sơ nhân sự
type TabType =
  | 'chuc-vu'
  | 'hoc-ham-hoc-vi'
  | 'ho-so-nhan-su'
  | 'bang-cap'
  | 'chung-chi'
  | 'dao-tao-nhan-su'
  | 'qua-trinh-cong-tac';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'chuc-vu', label: 'Chức vụ', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'hoc-ham-hoc-vi', label: 'Học hàm/Học vị', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'ho-so-nhan-su', label: 'Hồ sơ nhân sự', icon: <Users className="h-4 w-4" /> },
  { id: 'bang-cap', label: 'Bằng cấp', icon: <Award className="h-4 w-4" /> },
  { id: 'chung-chi', label: 'Chứng chỉ CM', icon: <FileText className="h-4 w-4" /> },
  { id: 'dao-tao-nhan-su', label: 'Đào tạo nhân sự', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'qua-trinh-cong-tac', label: 'QT Công tác', icon: <BriefcaseIcon className="h-4 w-4" /> },
];

const CONTENT: Record<TabType, React.ReactNode> = {
  'chuc-vu': <PositionSheet />,
  'hoc-ham-hoc-vi': <AcademicRankSheet />,
  'ho-so-nhan-su': <EmployeeProfileSheet />,
  'bang-cap': <DegreeSheet />,
  'chung-chi': <CertificateSheet />,
  'dao-tao-nhan-su': <TrainingHistorySheet />,
  'qua-trinh-cong-tac': <WorkHistorySheet />,
};

export default function HRMProfilesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chuc-vu');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh mục & Hồ sơ nhân sự"
        description="Quản lý danh mục, chức vụ, học hàm/học vị, hồ sơ nhân sự, bằng cấp, chứng chỉ CM, đào tạo nhân sự, quá trình công tác"
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: 'Danh mục & Hồ sơ nhân sự' },
        ]}
      />

      {/* Tabs */}
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

      {/* Content */}
      {CONTENT[activeTab]}
    </div>
  );
}
