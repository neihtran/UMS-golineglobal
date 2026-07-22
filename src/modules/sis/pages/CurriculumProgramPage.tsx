import { useState } from 'react';
import { BookOpen, BookMarked, Library, GitBranch, ShieldCheck, Layers } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  CurriculumSheet,
  CurriculumSubjectSheet,
  SubjectSheet,
  SubjectPrerequisiteSheet,
  SubjectConditionSheet,
  SubjectTypeSheet,
} from './sheets';

type TabType =
  | 'ctdt'
  | 'mon-trong-ctdt'
  | 'mon-hoc'
  | 'loai-mon-hoc'
  | 'tien-quyet'
  | 'dieu-kien-dang-ky';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'ctdt', label: 'CTĐT', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'mon-trong-ctdt', label: 'Môn trong CTĐT', icon: <Library className="h-4 w-4" /> },
  { id: 'mon-hoc', label: 'Môn học', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'loai-mon-hoc', label: 'Loại môn học', icon: <Layers className="h-4 w-4" /> },
  { id: 'tien-quyet', label: 'Tiên quyết', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'dieu-kien-dang-ky', label: 'Điều kiện đăng ký', icon: <ShieldCheck className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'ctdt': <CurriculumSheet />,
  'mon-trong-ctdt': <CurriculumSubjectSheet />,
  'mon-hoc': <SubjectSheet />,
  'loai-mon-hoc': <SubjectTypeSheet />,
  'tien-quyet': <SubjectPrerequisiteSheet />,
  'dieu-kien-dang-ky': <SubjectConditionSheet />,
};

export default function CurriculumProgramPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ctdt');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chương trình đào tạo & Học phần"
        description="Quản lý CTĐT, môn trong CTĐT, môn học, tiên quyết và điều kiện đăng ký"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'CTĐT & Học phần' },
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
