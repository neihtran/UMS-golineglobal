import { PageHeader } from '@/components/layout';

export default function AdmissionBatchList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách đợt tuyển sinh"
        description="Danh sách đợt tuyển sinh trong hệ thống"
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Tuyển sinh' },
        ]}
      />
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}