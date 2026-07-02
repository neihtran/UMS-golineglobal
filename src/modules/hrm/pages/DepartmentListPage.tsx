import { useState } from 'react';
import { Plus, Search, Users, Building2 } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const DEPARTMENTS = [
  { id: 'd1', code: 'P001', name: 'Phòng Công nghệ Thông tin', type: 'Phòng ban', head: 'TS. Nguyễn Văn Minh', staff: 12, status: 'active' },
  { id: 'd2', code: 'D002', name: 'Khoa Công nghệ Thông tin', type: 'Khoa', head: 'PGS.TS. Lê Thị Lan', staff: 45, status: 'active' },
  { id: 'd3', code: 'D003', name: 'Khoa Toán học', type: 'Khoa', head: 'TS. Bùi Minh Tuấn', staff: 28, status: 'active' },
  { id: 'd4', code: 'P004', name: 'Phòng Tổ chức Nhân sự', type: 'Phòng ban', head: 'ThS. Trần Hoàng Nam', staff: 8, status: 'active' },
  { id: 'd5', code: 'D005', name: 'Khoa Vật lý', type: 'Khoa', head: 'TS. Hoàng Thu Lan', staff: 22, status: 'active' },
  { id: 'd6', code: 'P006', name: 'Phòng Kế hoạch Tài chính', type: 'Phòng ban', head: 'PGS. Đặng Văn Minh', staff: 15, status: 'inactive' },
];

export default function DepartmentListPage() {
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const types = ['all', ...Array.from(new Set(DEPARTMENTS.map((d) => d.type)))];
  const filtered = DEPARTMENTS.filter((d) => {
    const match = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    return match && matchType;
  });
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách đơn vị"
        description={`${DEPARTMENTS.length} đơn vị trong hệ thống`}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: 'Đơn vị' }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Thêm đơn vị</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm đơn vị..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2">
          {types.map((t) => <option key={t} value={t}>{t === 'all' ? 'Tất cả loại' : t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {paged.map((d) => (
          <Card key={d.id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${d.type === 'Khoa' ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]' : 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'}`}>
                    {d.type === 'Khoa' ? <Users className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{d.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{d.code} · {d.type}</p>
                  </div>
                </div>
                <Badge variant={d.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                  {d.status === 'active' ? 'Hoạt động' : 'Tắt'}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--text-muted))]">Trưởng đơn vị</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{d.head}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--text-muted))]">Số CBNV</span>
                  <span className="font-bold text-[rgb(var(--primary))]">{d.staff} người</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
