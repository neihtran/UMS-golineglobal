import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, FileText,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, useResearchProjectList } from '@/hooks';
import { useDepartmentList } from '@/hooks/useHrm';
import type { ResearchProjectFilters } from '@/services/rit.service';

const TYPE_CONFIG: Record<string, { variant: 'primary' | 'accent'; label: string }> = {
  fundamental: { variant: 'primary', label: 'Cơ bản' },
  applied: { variant: 'accent', label: 'Ứng dụng' },
  development: { variant: 'accent', label: 'Phát triển' },
  policy: { variant: 'accent', label: 'Chính sách' },
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral' | 'error'; label: string }> = {
  proposal: { variant: 'info', label: 'Đề xuất' },
  approved: { variant: 'success', label: 'Đã phê duyệt' },
  ongoing: { variant: 'warning', label: 'Đang thực hiện' },
  suspended: { variant: 'error', label: 'Tạm dừng' },
  completed: { variant: 'success', label: 'Hoàn thành' },
  cancelled: { variant: 'neutral', label: 'Đã hủy' },
};

export default function MemberList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [type, setType] = useState('all');

  const debouncedSearch = useDebounce(search, 400);

  const { data: deptData } = useDepartmentList({ pageSize: 100 });
  const departments = deptData?.data ?? [];
  const filters: ResearchProjectFilters = useMemo(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    department: dept !== 'all' ? dept : undefined,
    projectType: type !== 'all' ? type : undefined,
  }), [pagination.page, pagination.pageSize, debouncedSearch, dept, type]);

  const { data, isLoading } = useResearchProjectList(filters);

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Danh sách Đề tài NCKH"
        description="RIT-01 — Quản lý đề tài nghiên cứu khoa học"
        breadcrumbs={[{ label: 'RIT', href: '/rit' }, { label: 'Đề tài NCKH' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/rit/de-tai/tao')}>Thêm đề tài</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm tên đề tài, lĩnh vực..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả khoa</option>
          {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả loại</option>
          <option value="fundamental">Cơ bản</option>
          <option value="applied">Ứng dụng</option>
          <option value="development">Phát triển</option>
          <option value="policy">Chính sách</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Đề tài</TableHeadCell>
            <TableHeadCell>Mã đề tài</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Khoa / Đơn vị</TableHeadCell>
            <TableHeadCell>Lĩnh vực</TableHeadCell>
            <TableHeadCell className="text-center">Trưởng nhóm</TableHeadCell>
            <TableHeadCell className="text-center">Tiến độ</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        {isLoading ? (
          <TableSkeleton colSpan={9} />
        ) : items.length === 0 ? (
          <TableEmpty colSpan={9} message="Không tìm thấy đề tài nào" />
        ) : (
          <TableBody>
            {items.map((p) => {
              const tc = TYPE_CONFIG[p.projectType] ?? { variant: 'accent' as const, label: p.projectType };
              const sc = STATUS_CONFIG[p.status] ?? { variant: 'neutral' as const, label: p.status };
              return (
                <TableRow key={p._id}>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))] max-w-[280px] truncate">{p.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">Bắt đầu: {p.startDate ? new Date(p.startDate).toLocaleDateString('vi-VN') : '—'}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{p.code}</TableCell>
                  <TableCell><Badge variant={tc.variant} size="sm">{tc.label}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{p.departmentName ?? p.department}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{p.field}</TableCell>
                  <TableCell className="text-center text-[rgb(var(--text-secondary))]">{p.leaderName ?? p.leaderId}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                        <div className="h-full bg-[rgb(var(--primary))] rounded-full transition-all" style={{ width: `${p.progress ?? 0}%` }} />
                      </div>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{p.progress ?? 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => navigate(`/rit/de-tai/${p._id}`)}>Chi tiết</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        )}
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={total}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
