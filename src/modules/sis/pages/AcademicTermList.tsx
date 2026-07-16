import { PageHeader } from '@/components/layout';

export default function AcademicTermList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách học kỳ"
        description="Danh sách học kỳ trong hệ thống"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Học kỳ' },
        ]}
      />
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}