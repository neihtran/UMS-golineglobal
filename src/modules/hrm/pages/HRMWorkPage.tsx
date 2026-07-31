import { useState } from 'react';
import {
  Presentation,
  GraduationCap as GraduationCapIcon,
  ClipboardCheck,
  PenLine,
  Monitor,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  TeachingAssignmentSheet,
  AdvisorAssignmentSheet,
  InternshipSupervisionSheet,
  ThesisSupervisionSheet,
  ExamInvigilationSheet,
  ExamMarkingSheet,
} from './sheets';

type TabType =
  | 'phan-cong-giang-day'
  | 'co-van-hoc-tap'
  | 'huong-dan-thuc-tap'
  | 'huong-dan-do-an'
  | 'coi-thi'
  | 'cham-thi';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'phan-cong-giang-day', label: 'Phân công GD', icon: <Presentation className="h-4 w-4" /> },
  { id: 'co-van-hoc-tap', label: 'Cố vấn HT', icon: <GraduationCapIcon className="h-4 w-4" /> },
  { id: 'huong-dan-thuc-tap', label: 'Hướng dẫn TT', icon: <ClipboardCheck className="h-4 w-4" /> },
  { id: 'huong-dan-do-an', label: 'Hướng dẫn ĐA/KL/LV', icon: <PenLine className="h-4 w-4" /> },
  { id: 'coi-thi', label: 'Coi thi', icon: <Monitor className="h-4 w-4" /> },
  { id: 'cham-thi', label: 'Chấm thi', icon: <FileCheck className="h-4 w-4" /> },
];

const CONTENT: Record<TabType, React.ReactNode> = {
  'phan-cong-giang-day': <TeachingAssignmentSheet />,
  'co-van-hoc-tap': <AdvisorAssignmentSheet />,
  'huong-dan-thuc-tap': <InternshipSupervisionSheet />,
  'huong-dan-do-an': <ThesisSupervisionSheet />,
  'coi-thi': <ExamInvigilationSheet />,
  'cham-thi': <ExamMarkingSheet />,
};

export default function HRMWorkPage() {
  const [activeTab, setActiveTab] = useState<TabType>('phan-cong-giang-day');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý công việc"
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: 'Quản lý công việc' },
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
