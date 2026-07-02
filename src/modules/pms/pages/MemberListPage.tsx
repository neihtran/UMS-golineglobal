import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const MEMBERS = [
  { id: 'm1', idCard: '025086001234', name: 'Nguyễn Văn Minh', birth: '1975-03-15', unit: 'Chi bộ Khoa CNTT', role: ' Bí thư', joinDate: '2005-06-01', status: 'active' },
  { id: 'm2', idCard: '025086001235', name: 'Lê Thị Lan', birth: '1978-07-20', unit: 'Chi bộ Phòng HC', role: 'Đảng viên', joinDate: '2008-03-15', status: 'active' },
  { id: 'm3', idCard: '025086001236', name: 'Trần Hoàng Nam', birth: '1980-01-10', unit: 'Chi bộ Khoa CNTT', role: 'Phó Bí thư', joinDate: '2006-09-01', status: 'active' },
  { id: 'm4', idCard: '025086001237', name: 'Bùi Minh Tuấn', birth: '1982-05-25', unit: 'Chi bộ Khoa Toán', role: 'Đảng viên', joinDate: '2010-07-01', status: 'active' },
  { id: 'm5', idCard: '025086001238', name: 'Đặng Văn Minh', birth: '1970-11-08', unit: 'Chi bộ Phòng HC', role: 'Đảng viên', joinDate: '2003-05-01', status: 'inactive' },
];

export default function PMSMemberListPage() {
  const navigate = useNavigate();
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');

  const filtered = MEMBERS.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.idCard.includes(search),
  );
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Đảng viên"
        description={`${MEMBERS.length} đảng viên`}
        breadcrumbs={[{ label: 'PMS', href: '/pms' }, { label: 'Đảng viên' }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pms/dang-vien/tao')}>Thêm đảng viên</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên, số thẻ..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {['Số thẻ', 'Họ tên', 'Ngày sinh', 'Chi bộ', 'Chức vụ', 'Ngày vàin Đảng', 'Trạng thái', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {paged.map((m) => (
              <tr key={m.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{m.idCard}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)] text-xs font-bold text-[rgb(var(--error))]">
                      {m.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{m.birth}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{m.unit}</td>
                <td className="px-4 py-3"><Badge variant="error" size="sm">{m.role}</Badge></td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{m.joinDate}</td>
                <td className="px-4 py-3"><Badge variant={m.status === 'active' ? 'success' : 'neutral'} dot size="sm">{m.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}</Badge></td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => navigate(`/pms/dang-vien/${m.id}`)}>Chi tiết</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
