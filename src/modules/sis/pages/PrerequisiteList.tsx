import { PageHeader } from '@/components/layout';

export default function PrerequisiteList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách môn tiên quyết"
        description="Danh sách môn tiên quyết trong hệ thống"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Môn tiên quyết' },
        ]}
      />
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}