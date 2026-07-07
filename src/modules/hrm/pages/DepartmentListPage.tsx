import { useState } from 'react';
import { Plus, Search, Users, Building2 } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useDepartmentList } from '@/hooks/useHrm';

const TYPE_LABEL: Record<string, string> = {
  faculty: 'Khoa',
  department: 'Phòng ban',
  center: 'Trung tâm',
  office: 'Văn phòng',
  institute: 'Viện',
};

export default function DepartmentListPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useDepartmentList({
    page: 1,
    pageSize: 100,
    search: search || undefined,
    type: typeFilter || undefined,
  });

  const departments = (data?.data ?? []) as any[];
  const total = departments.length;

  const uniqueTypes = [...new Set(departments.map((d) => d.type).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách đơn vị"
        description={`${total} đơn vị trong hệ thống`}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: 'Đơn vị' }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Thêm đơn vị</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm đơn vị..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2">
          <option value="">Tất cả loại</option>
          {uniqueTypes.map((t) => <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>)}
        </select>
      </div>

      {isLoading && departments.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 animate-pulse">
                <div className="h-10 bg-[rgb(var(--border))] rounded mb-3" />
                <div className="h-4 bg-[rgb(var(--border))] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[rgb(var(--border))] rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">Chưa có đơn vị nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => (
            <Card key={d._id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${d.type === 'faculty' ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]' : 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'}`}>
                      {d.type === 'faculty' ? <Users className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{d.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{d.code} · {TYPE_LABEL[d.type] ?? d.type}</p>
                    </div>
                  </div>
                  <Badge variant={d.isActive !== false ? 'success' : 'neutral'} dot size="sm">
                    {d.isActive !== false ? 'Hoạt động' : 'Tắt'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {d.email && (
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--text-muted))]">Email</span>
                      <span className="font-medium text-[rgb(var(--text-primary))]">{d.email}</span>
                    </div>
                  )}
                  {d.phone && (
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--text-muted))]">Điện thoại</span>
                      <span className="font-medium text-[rgb(var(--text-primary))]">{d.phone}</span>
                    </div>
                  )}
                  {!d.email && !d.phone && (
                    <p className="text-xs text-[rgb(var(--text-muted))] italic">Chưa có thông tin liên hệ</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
