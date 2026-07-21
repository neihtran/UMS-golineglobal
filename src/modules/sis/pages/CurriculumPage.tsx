import { useState } from 'react';
import { BookOpen, Users, Calendar, Briefcase, GraduationCap, BookMarked, Library, GitBranch, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  AcademicTermSheet,
  CourseSheet,
  MajorSheet,
  TrainingSystemSheet,
  SpecializationSheet,
  SubjectSheet,
  CurriculumSheet,
  CurriculumSubjectSheet,
  SubjectPrerequisiteSheet,
  SubjectConditionSheet,
} from './sheets';

type TabType =
  | 'ctdt'
  | 'nganh'
  | 'he'
  | 'chuyen-nganh'
  | 'hoc-ky'
  | 'khoa-hoc'
  | 'mon-hoc'
  | 'mon-trong-ctdt'
  | 'tien-quyet'
  | 'dieu-kien-dang-ky';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'ctdt', label: 'CTĐT', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'nganh', label: 'Ngành học', icon: <Users className="h-4 w-4" /> },
  { id: 'he', label: 'Hệ đào tạo', icon: <Calendar className="h-4 w-4" /> },
  { id: 'chuyen-nganh', label: 'Chuyên ngành', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'hoc-ky', label: 'Học kỳ', icon: <Calendar className="h-4 w-4" /> },
  { id: 'khoa-hoc', label: 'Khóa học', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'mon-hoc', label: 'Môn học', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'mon-trong-ctdt', label: 'Môn trong CTĐT', icon: <Library className="h-4 w-4" /> },
  { id: 'tien-quyet', label: 'Tiên quyết', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'dieu-kien-dang-ky', label: 'Điều kiện đăng ký', icon: <ShieldCheck className="h-4 w-4" /> },
];

const TAB_CONTENT: Record<TabType, React.ReactNode> = {
  'ctdt': <CurriculumSheet />,
  'nganh': <MajorSheet />,
  'he': <TrainingSystemSheet />,
  'chuyen-nganh': <SpecializationSheet />,
  'hoc-ky': <AcademicTermSheet />,
  'khoa-hoc': <CourseSheet />,
  'mon-hoc': <SubjectSheet />,
  'mon-trong-ctdt': <CurriculumSubjectSheet />,
  'tien-quyet': <SubjectPrerequisiteSheet />,
  'dieu-kien-dang-ky': <SubjectConditionSheet />,
};

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ctdt');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hệ thống đào tạo & Danh mục"
        description="Quản lý CTĐT, ngành học, hệ đào tạo, chuyên ngành, học kỳ, khóa học, môn học và tiên quyết"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Hệ thống đào tạo' },
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

      {/* Tab content — each sheet manages its own state + API calls */}
      {TAB_CONTENT[activeTab]}
    </div>
  );
}
