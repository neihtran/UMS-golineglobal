import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, usePartyMemberList } from '@/hooks';
import type { PartyMemberFilters } from '@/services/pms.service';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error' | 'info'; label: string }> = {
  probationary: { variant: 'warning', label: 'Dự bị' },
  official: { variant: 'success', label: 'Chính thức' },
  reserved: { variant: 'info', label: 'Bảo lưu' },
  suspended: { variant: 'error', label: 'Tạm đình chỉ' },
  expelled: { variant: 'neutral', label: 'Khai trừ' },
};

export default function PMSMemberListPage() {
  const navigate = useNavigate();
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const filters: PartyMemberFilters = useMemo(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
  }), [pagination.page, pagination.pageSize, debouncedSearch]);

  const { data, isLoading } = usePartyMemberList(filters);

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Đảng viên"
        description={`${total} đảng viên`}
        breadcrumbs={[{ label: 'PMS', href: '/pms' }, { label: 'Đảng viên' }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pms/dang-vien/tao')}>Thêm đảng viên</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên, số thẻ..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2"
          />
        </div>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {['Số thẻ', 'Họ tên', 'Ngày sinh', 'Chi bộ', 'Chức vụ', 'Ngày vào Đảng', 'Trạng thái', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                  Không tìm thấy đảng viên nào
                </td>
              </tr>
            ) : (
              items.map((m) => {
                const sc = STATUS_CONFIG[m.partyStatus] ?? { variant: 'neutral' as const, label: m.partyStatus };
                return (
                  <tr key={m._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{m.idCardNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)] text-xs font-bold text-[rgb(var(--error))]">
                          {(m.employeeName ?? m.employeeId).split(' ').slice(-2).map((n) => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{m.employeeName ?? m.employeeId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{m.branchName ?? m.branchId}</td>
                    <td className="px-4 py-3"><Badge variant="error" size="sm">{m.partyPosition ?? 'Đảng viên'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{m.joinDate ? new Date(m.joinDate).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="px-4 py-3"><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => navigate(`/pms/dang-vien/${m._id}`)}>Chi tiết</Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Simple pagination — reuse TablePagination via shared pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[rgb(var(--border))]">
        <p className="text-sm text-[rgb(var(--text-muted))]">
          Hiển thị {items.length > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}–{Math.min(pagination.page * pagination.pageSize, total)} trong tổng số {total}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPage(pagination.page - 1)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page * pagination.pageSize >= total}
            onClick={() => setPage(pagination.page + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
