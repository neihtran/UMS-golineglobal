import { PageHeader } from '@/components/layout';

export default function ScheduleList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách lịch học"
        description="Danh sách lịch học trong hệ thống"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Lịch học' },
        ]}
      />
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}