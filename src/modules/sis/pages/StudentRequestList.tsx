import { useMemo, useState } from 'react';
import { Plus, Eye, Pencil, Check, X, Clock } from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import { useRole } from '@/hooks/usePermission';
import { ROLES } from '@/constants/modules';

type RequestType = 'reservation' | 'dropout' | 'major' | 'class';

interface StudentRequest {
  _id: string;
  type: RequestType;
  student: { name: string; code: string };
  status: 'pending' | 'approved' | 'cancelled';
  reason?: string;
  createdAt: string;
  details: Record<string, any>;
}

const TYPE_LABELS: Record<RequestType, string> = {
  reservation: 'Bảo lưu',
  dropout: 'Thôi học',
  major: 'Chuyển ngành',
  class: 'Chuyển lớp',
};

const TYPE_COLORS: Record<RequestType, string> = {
  reservation: 'info',
  dropout: 'error',
  major: 'warning',
  class: 'success',
};

export default function StudentRequestList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });
  const canApprove = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA]);

  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Mock data
  const mockData: StudentRequest[] = [
    { _id: '1', type: 'reservation', student: { name: 'Nguyễn Văn A', code: 'SV001' }, status: 'pending', reason: 'Có việc gia đình', createdAt: '2026-07-10', details: { fromDate: '01/08/2026', toDate: '01/01/2027' } },
    { _id: '2', type: 'dropout', student: { name: 'Trần Thị B', code: 'SV002' }, status: 'pending', reason: 'Chuyển trường', createdAt: '2026-07-08', details: { dropoutType: 'voluntary' } },
    { _id: '3', type: 'major', student: { name: 'Lê Văn C', code: 'SV003' }, status: 'approved', reason: 'Phù hợp với năng lực', createdAt: '2026-07-05', details: { fromMajor: 'CNTT', toMajor: 'KTPM' } },
    { _id: '4', type: 'class', student: { name: 'Phạm Thị D', code: 'SV004' }, status: 'pending', reason: 'Gần nhà', createdAt: '2026-07-12', details: { fromClass: 'CNTT-K14', toClass: 'CNTT-K14B' } },
    { _id: '5', type: 'reservation', student: { name: 'Hoàng Văn E', code: 'SV005' }, status: 'cancelled', reason: 'Hủy yêu cầu', createdAt: '2026-07-01', details: { fromDate: '01/09/2026', toDate: '01/03/2027' } },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockData.filter((r) => {
      const matchType = !typeFilter || r.type === typeFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchSearch =
        !q ||
        r.student.name.toLowerCase().includes(q) ||
        r.student.code.toLowerCase().includes(q);
      return matchType && matchStatus && matchSearch;
    });
  }, [mockData, typeFilter, statusFilter, search]);

  const paged = useMemo(
    () => filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize),
    [filtered, pagination]
  );

  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
    pending: { variant: 'warning', label: 'Chờ duyệt' },
    approved: { variant: 'success', label: 'Đã duyệt' },
    cancelled: { variant: 'neutral', label: 'Đã hủy' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yêu cầu Sinh viên"
        description={`${filtered.length} yêu cầu`}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Quản lý SV' }, { label: 'Yêu cầu' }]}
        actions={
          canApprove && (
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Tạo yêu cầu
            </Button>
          )
        }
      />

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Tìm kiếm
            </label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tên, mã sinh viên..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Loại yêu cầu
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="reservation">Bảo lưu</option>
              <option value="dropout">Thôi học</option>
              <option value="major">Chuyển ngành</option>
              <option value="class">Chuyển lớp</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải yêu cầu..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<Clock className="h-12 w-12" />}
              title="Chưa có yêu cầu nào"
              description="Danh sách yêu cầu bảo lưu, thôi học, chuyển ngành, chuyển lớp sẽ hiển thị ở đây."
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Sinh viên</TableHeadCell>
                <TableHeadCell>Loại</TableHeadCell>
                <TableHeadCell>Lý do</TableHeadCell>
                <TableHeadCell>Ngày tạo</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((r, i) => {
                const sc = statusConfig[r.status];
                return (
                  <TableRow key={r._id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                      {(pagination.page - 1) * pagination.pageSize + i + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.student.name}
                      <span className="ml-2 text-xs text-[rgb(var(--text-muted))]">{r.student.code}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={TYPE_COLORS[r.type] as any} size="sm">
                        {TYPE_LABELS[r.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))] max-w-[200px] truncate">
                      {r.reason || '—'}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} dot size="sm">
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                        </Button>
                        {canApprove && r.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Check className="h-4 w-4 text-[rgb(var(--success))]" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <X className="h-4 w-4 text-[rgb(var(--error))]" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {paged.length > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
        />
      )}
    </div>
  );
}
