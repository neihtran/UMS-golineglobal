import { useState } from 'react';
import {
  Clock,
  CalendarDays,
  ClipboardCheck,
  History,
  CalendarOff,
  FileText,
  Timer,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  WorkScheduleSheet,
  EmployeeScheduleSheet,
  AttendanceSheet,
  AttendanceLogSheet,
  LeaveTypeSheet,
  LeaveRequestSheet,
  OvertimeRequestSheet,
} from './sheets';

type TabType =
  | 'ca-lam-viec'
  | 'lich-lam-viec'
  | 'cham-cong'
  | 'check-in-out'
  | 'nghi-phep'
  | 'don-nghi-phep'
  | 'dang-ky-ot';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'ca-lam-viec', label: 'Ca làm việc', icon: <Clock className="h-4 w-4" /> },
  { id: 'lich-lam-viec', label: 'Lịch làm việc', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 'cham-cong', label: 'Chấm công', icon: <ClipboardCheck className="h-4 w-4" /> },
  { id: 'check-in-out', label: 'Check in/out', icon: <History className="h-4 w-4" /> },
  { id: 'nghi-phep', label: 'Nghỉ phép', icon: <FileText className="h-4 w-4" /> },
  { id: 'don-nghi-phep', label: 'Đơn nghỉ phép', icon: <CalendarOff className="h-4 w-4" /> },
  { id: 'dang-ky-ot', label: 'Đăng ký OT', icon: <Timer className="h-4 w-4" /> },
];

const CONTENT: Record<TabType, React.ReactNode> = {
  'ca-lam-viec': <WorkScheduleSheet />,
  'lich-lam-viec': <EmployeeScheduleSheet />,
  'cham-cong': <AttendanceSheet />,
  'check-in-out': <AttendanceLogSheet />,
  'nghi-phep': <LeaveTypeSheet />,
  'don-nghi-phep': <LeaveRequestSheet />,
  'dang-ky-ot': <OvertimeRequestSheet />,
};

export default function AttendanceWorkPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ca-lam-viec');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chấm công & Nghỉ phép"
        description="Quản lý ca làm việc, lịch làm việc, chấm công, check in/out, nghỉ phép, đơn nghỉ phép, đăng ký OT"
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: 'Chấm công & Nghỉ phép' },
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
