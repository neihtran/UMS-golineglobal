import { PageHeader } from '@/components/layout';

export default function StudentRequestList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách yêu cầu sinh viên"
        description="Danh sách yêu cầu sinh viên trong hệ thống"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Yêu cầu SV' },
        ]}
      />
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}