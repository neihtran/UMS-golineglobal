// ─── QuanLyDiemDanhPage ───────────────────────────────────────────────────────────────
// Page: Quản lý Điểm danh — tabs: Buổi điểm danh | Kết quả điểm danh

import { lazy, Suspense, useState } from 'react';
import { ClipboardCheck, ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/layout';

// Lazy load sheets
const AttendanceSessionSheet = lazy(
  () => import('./sheets/AttendanceSessionSheet')
);
const AttendanceResultSheet = lazy(
  () => import('./sheets/AttendanceResultSheet')
);

type TabId = 'buoi-diem-danh' | 'ket-qua';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'buoi-diem-danh', label: 'Buổi điểm danh', icon: <ClipboardCheck className="h-4 w-4" /> },
  { id: 'ket-qua', label: 'Kết quả điểm danh', icon: <ListChecks className="h-4 w-4" /> },
];

export default function QuanLyDiemDanhPage() {
  const [activeTab, setActiveTab] = useState<TabId>('buoi-diem-danh');
  // Shared courseId — cả 2 tabs cùng dùng 1 course
  const [sharedCourseId, setSharedCourseId] = useState<number | undefined>(undefined);

  return (
    <div className="space-y-0">
      {/* Page header */}
      <PageHeader
        title="Quản lý Điểm danh"
        description="Tạo và quản lý các buổi điểm danh, theo dõi kết quả điểm danh sinh viên"
        breadcrumbs={[
          { label: 'Quản lý Học tập', href: '/quan-ly-hoc-tap' },
          { label: 'Quản lý Điểm danh' },
        ]}
      />

      {/* Tab navigation */}
      <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <nav className="flex gap-1 px-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                  : 'border-transparent text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--border))]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content — shared courseId ensures both tabs see the same course */}
      <div className="p-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-[rgb(var(--text-muted))]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[rgb(var(--primary))] border-t-transparent" />
                <span>Đang tải...</span>
              </div>
            </div>
          }
        >
          {activeTab === 'buoi-diem-danh' ? (
            <AttendanceSessionSheet
              courseId={sharedCourseId}
              onCourseIdChange={setSharedCourseId}
            />
          ) : (
            <AttendanceResultSheet
              courseId={sharedCourseId}
              onCourseIdChange={setSharedCourseId}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
