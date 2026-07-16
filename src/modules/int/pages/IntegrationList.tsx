import { PageHeader } from '@/components/layout';

export default function IntegrationList() {
  return (
    <div className="space-y-6">
      <PageHeader title="IntegrationList" description="Dang phat trien" breadcrumbs={[{ label: 'Home', href: '/' }]} />
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]"><p>Tinh nang dang phat trien</p></div>
    </div>
  );
}