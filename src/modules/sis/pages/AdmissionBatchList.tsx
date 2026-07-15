import { useMemo, useState } from 'react';
import { Plus, Eye, Pencil, Calendar } from 'lucide-react';
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

interface Batch {
  _id: string;
  code: string;
  name: string;
  year: number;
  admissionType: string;
  startDate?: string;
  endDate?: string;
  status: string;
  totalCandidates: number;
  totalEnrolled: number;
  isActive: boolean;
}

const ADMISSION_TYPE_LABELS: Record<string, string> = {
  regular: 'Chính quy',
  transfer: 'Chuyển ngành',
  second_degree: 'Văn bằng 2',
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'info'; label: string }> = {
  draft: { variant: 'neutral', label: 'Nháp' },
  open: { variant: 'success', label: 'Mở đăng ký' },
  closed: { variant: 'warning', label: 'Đã đóng' },
  enrolled: { variant: 'info', label: 'Hoàn tất' },
};

export default function AdmissionBatchList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });
  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);

  const [yearFilter, setYearFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Mock data
  const mockData: Batch[] = [
    { _id: '1', code: 'TS2026-1', name: 'Tuyển sinh đại học chính quy 2026', year: 2026, admissionType: 'regular', startDate: '2026-03-01', endDate: '2026-05-31', status: 'enrolled', totalCandidates: 5000, totalEnrolled: 3200, isActive: true },
    { _id: '2', code: 'TS2026-2', name: 'Tuyển sinh Văn bằng 2 2026', year: 2026, admissionType: 'second_degree', startDate: '2026-04-01', endDate: '2026-06-30', status: 'closed', totalCandidates: 500, totalEnrolled: 320, isActive: true },
    { _id: '3', code: 'TS2025-1', name: 'Tuyển sinh đại học chính quy 2025', year: 2025, admissionType: 'regular', startDate: '2025-03-01', endDate: '2025-05-31', status: 'enrolled', totalCandidates: 4800, totalEnrolled: 3000, isActive: true },
    { _id: '4', code: 'TS2026-3', name: 'Tuyển sinh chuyển ngành 2026', year: 2026, admissionType: 'transfer', status: 'open', totalCandidates: 200, totalEnrolled: 0, isActive: true },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockData.filter((b) => {
      const matchYear = !yearFilter || b.year === Number(yearFilter);
      const matchType = !typeFilter || b.admissionType === typeFilter;
      const matchStatus = !statusFilter || b.status === statusFilter;
      const matchSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q);
      return matchYear && matchType && matchStatus && matchSearch;
    });
  }, [mockData, yearFilter, typeFilter, statusFilter, search]);

  const paged = useMemo(
    () => filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize),
    [filtered, pagination]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đợt Tuyển sinh"
        description={`${filtered.length} đợt tuyển sinh`}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Tuyển sinh' }, { label: 'Đợt tuyển sinh' }]}
        actions={
          canEdit && (
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Tạo đợt mới
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
              placeholder="Mã, tên đợt tuyển sinh..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Năm
            </label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Loại
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
              <option value="regular">Chính quy</option>
              <option value="transfer">Chuyển ngành</option>
              <option value="second_degree">Văn bằng 2</option>
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
              <option value="draft">Nháp</option>
              <option value="open">Mở đăng ký</option>
              <option value="closed">Đã đóng</option>
              <option value="enrolled">Hoàn tất</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải đợt tuyển sinh..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title="Chưa có đợt tuyển sinh nào"
              description="Bắt đầu bằng cách tạo đợt tuyển sinh đầu tiên."
              action={
                canEdit && (
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Tạo đợt mới
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã</TableHeadCell>
                <TableHeadCell>Tên đợt tuyển sinh</TableHeadCell>
                <TableHeadCell>Năm</TableHeadCell>
                <TableHeadCell>Loại</TableHeadCell>
                <TableHeadCell>Thí sinh</TableHeadCell>
                <TableHeadCell>Đã nhập học</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((b, i) => {
                const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.draft;
                return (
                  <TableRow key={b._id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                      {(pagination.page - 1) * pagination.pageSize + i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{b.code}</TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">{b.name}</TableCell>
                    <TableCell>{b.year}</TableCell>
                    <TableCell>
                      <Badge variant="info" size="sm">
                        {ADMISSION_TYPE_LABELS[b.admissionType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">
                      {b.totalCandidates.toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">
                      {b.totalEnrolled.toLocaleString('vi-VN')}
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
                        {canEdit && (
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
                          </Button>
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
