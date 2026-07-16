import { PageHeader } from '@/components/layout';

export default function SubjectTypeList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách loại môn học"
        description="Danh sách loại môn học trong hệ thống"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Loại môn học' },
        ]}
      />
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}