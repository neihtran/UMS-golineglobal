import { useMemo, useState } from 'react';
import { Plus, Eye, Pencil, UserCheck } from 'lucide-react';
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

interface AdmissionStudent {
  _id: string;
  candidateCode: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  citizenId?: string;
  phone?: string;
  email?: string;
  major?: { name: string; code: string };
  admissionScore?: number;
  priorityLevel?: number;
  status: string;
  batch?: { code: string; name: string };
  studentCode?: string;
}

const STATUS_CONFIG: Record<string, { variant: 'warning' | 'success' | 'info' | 'neutral'; label: string }> = {
  pending: { variant: 'warning', label: 'Chờ kết quả' },
  accepted: { variant: 'success', label: 'Trúng tuyển' },
  enrolled: { variant: 'info', label: 'Đã nhập học' },
  cancelled: { variant: 'neutral', label: 'Hủy' },
};

export default function AdmissionStudentList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });
  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);

  const [batchFilter, setBatchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Mock data
  const mockData: AdmissionStudent[] = [
    { _id: '1', candidateCode: 'TS2026-001', fullName: 'Nguyễn Văn An', gender: 'Nam', citizenId: '079201234567', phone: '0912345678', major: { name: 'Công nghệ thông tin', code: 'CNTT' }, admissionScore: 26.5, priorityLevel: 1, status: 'enrolled', batch: { code: 'TS2026-1', name: 'Tuyển sinh 2026' }, studentCode: 'SV2026001' },
    { _id: '2', candidateCode: 'TS2026-002', fullName: 'Trần Thị Bình', gender: 'Nữ', citizenId: '079208765432', phone: '0987654321', major: { name: 'Kinh tế', code: 'KT' }, admissionScore: 24.0, priorityLevel: 2, status: 'accepted', batch: { code: 'TS2026-1', name: 'Tuyển sinh 2026' } },
    { _id: '3', candidateCode: 'TS2026-003', fullName: 'Lê Văn Cường', gender: 'Nam', phone: '0901234567', major: { name: 'Kỹ thuật phần mềm', code: 'KTPM' }, admissionScore: 25.0, priorityLevel: 1, status: 'pending', batch: { code: 'TS2026-1', name: 'Tuyển sinh 2026' } },
    { _id: '4', candidateCode: 'TS2026-004', fullName: 'Phạm Thị Dung', gender: 'Nữ', phone: '0932123456', major: { name: 'Ngôn ngữ Anh', code: 'NNA' }, admissionScore: 23.5, priorityLevel: 1, status: 'enrolled', batch: { code: 'TS2026-1', name: 'Tuyển sinh 2026' }, studentCode: 'SV2026002' },
    { _id: '5', candidateCode: 'TS2026-005', fullName: 'Hoàng Văn Em', gender: 'Nam', phone: '0943123456', major: { name: 'Luật', code: 'L' }, admissionScore: 22.0, priorityLevel: 3, status: 'cancelled', batch: { code: 'TS2026-1', name: 'Tuyển sinh 2026' } },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockData.filter((s) => {
      const matchBatch = !batchFilter || s.batch?.code === batchFilter;
      const matchStatus = !statusFilter || s.status === statusFilter;
      const matchSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.candidateCode.toLowerCase().includes(q) ||
        s.citizenId?.toLowerCase().includes(q) ||
        s.studentCode?.toLowerCase().includes(q);
      return matchBatch && matchStatus && matchSearch;
    });
  }, [mockData, batchFilter, statusFilter, search]);

  const paged = useMemo(
    () => filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize),
    [filtered, pagination]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Thí sinh"
        description={`${filtered.length} thí sinh`}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Tuyển sinh' }, { label: 'Danh sách thí sinh' }]}
        actions={
          canEdit && (
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Thêm thí sinh
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
              placeholder="Tên, mã thí sinh, CCCD..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Đợt tuyển sinh
            </label>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="TS2026-1">TS2026-1</option>
              <option value="TS2026-2">TS2026-2</option>
              <option value="TS2025-1">TS2025-1</option>
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
              <option value="pending">Chờ kết quả</option>
              <option value="accepted">Trúng tuyển</option>
              <option value="enrolled">Đã nhập học</option>
              <option value="cancelled">Hủy</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải danh sách thí sinh..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<UserCheck className="h-12 w-12" />}
              title="Chưa có thí sinh nào"
              description="Danh sách thí sinh sẽ hiển thị ở đây sau khi tuyển sinh."
              action={
                canEdit && (
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Thêm thí sinh
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
                <TableHeadCell>Mã TS</TableHeadCell>
                <TableHeadCell>Họ tên</TableHeadCell>
                <TableHeadCell>Ngành</TableHeadCell>
                <TableHeadCell>Điểm</TableHeadCell>
                <TableHeadCell>Ưu tiên</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((s, i) => {
                const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
                return (
                  <TableRow key={s._id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                      {(pagination.page - 1) * pagination.pageSize + i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{s.candidateCode}</TableCell>
                    <TableCell className="font-medium">
                      {s.fullName}
                      {s.studentCode && (
                        <span className="ml-2 text-xs text-[rgb(var(--success))]">({s.studentCode})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">
                      {s.major?.name || '—'}
                    </TableCell>
                    <TableCell className="tabular-nums font-medium text-[rgb(var(--primary))]">
                      {s.admissionScore?.toFixed(1) || '—'}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">
                      {s.priorityLevel ? `Ưu tiên ${s.priorityLevel}` : '—'}
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
