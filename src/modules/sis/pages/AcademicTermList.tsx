import { useMemo, useState } from 'react';
import { Download, Plus, Eye, Pencil, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { AcademicTermModal } from './AcademicTermModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface AcademicTerm {
  _id: string;
  code: string;
  academicYear: string;
  semester: number;
  termType: 'regular' | 'summer' | 'short';
  startDate: string;
  endDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  status: 'planning' | 'registration' | 'studying' | 'grading' | 'finished';
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

const TERM_TYPE_LABELS: Record<string, string> = {
  regular: 'Chính quy',
  summer: 'Hè',
  short: 'Ngắn hạn',
};

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  planning: { label: 'Lên kế hoạch', variant: 'neutral' },
  registration: { label: 'Đăng ký', variant: 'info' },
  studying: { label: 'Đang học', variant: 'success' },
  grading: { label: 'Chấm điểm', variant: 'warning' },
  finished: { label: 'Kết thúc', variant: 'neutral' },
};

export default function AcademicTermList() {
  const { t } = useTranslation('sis');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });

  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);
  const canDelete = useRole([ROLES.ADMIN]);

  const [search, setSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data?: AcademicTerm;
  }>({ isOpen: false, mode: 'create' });

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<AcademicTerm | null>(null);

  // Mock data
  const mockData: AcademicTerm[] = [
    {
      _id: '1',
      code: '2025-2026-HK1',
      academicYear: '2025-2026',
      semester: 1,
      termType: 'regular',
      startDate: '2025-08-15',
      endDate: '2025-12-31',
      registrationStart: '2025-07-01',
      registrationEnd: '2025-08-10',
      status: 'finished',
      isActive: false,
      isCurrent: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-12-31T00:00:00Z',
    },
    {
      _id: '2',
      code: '2025-2026-HK2',
      academicYear: '2025-2026',
      semester: 2,
      termType: 'regular',
      startDate: '2026-01-10',
      endDate: '2026-05-31',
      registrationStart: '2025-12-15',
      registrationEnd: '2026-01-05',
      status: 'finished',
      isActive: false,
      isCurrent: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2026-05-31T00:00:00Z',
    },
    {
      _id: '3',
      code: '2026-2027-HK1',
      academicYear: '2026-2027',
      semester: 1,
      termType: 'regular',
      startDate: '2026-08-15',
      endDate: '2026-12-31',
      registrationStart: '2026-07-01',
      registrationEnd: '2026-08-10',
      status: 'studying',
      isActive: true,
      isCurrent: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-07-15T00:00:00Z',
    },
    {
      _id: '4',
      code: '2026-2027-HK2',
      academicYear: '2026-2027',
      semester: 2,
      termType: 'regular',
      startDate: '2027-01-10',
      endDate: '2027-05-31',
      status: 'planning',
      isActive: true,
      isCurrent: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-07-15T00:00:00Z',
    },
  ];

  const isLoading = false;

  // Get unique academic years for filter
  const academicYears = useMemo(() => {
    const years = [...new Set(mockData.map((t) => t.academicYear))];
    return years.sort().reverse();
  }, [mockData]);

  const filtered = useMemo(() => {
    return mockData.filter((at) => {
      const matchSearch =
        !search ||
        at.code.toLowerCase().includes(search.toLowerCase()) ||
        at.academicYear.includes(search);
      const matchYear = !academicYear || at.academicYear === academicYear;
      const matchSemester = !semester || at.semester === Number(semester);
      const matchStatus = !status || at.status === status;
      return matchSearch && matchYear && matchSemester && matchStatus;
    });
  }, [mockData, search, academicYear, semester, status]);

  const paged = useMemo(
    () =>
      filtered.slice(
        (pagination.page - 1) * pagination.pageSize,
        pagination.page * pagination.pageSize
      ),
    [filtered, pagination]
  );

  const handleView = (item: AcademicTerm) => {
    setModalState({ isOpen: true, mode: 'view', data: item });
  };

  const handleEdit = (item: AcademicTerm) => {
    setModalState({ isOpen: true, mode: 'edit', data: item });
  };

  const handleCreate = () => {
    setModalState({ isOpen: true, mode: 'create' });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'create' });
  };

  const handleDelete = (item: AcademicTerm) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = () => {
    console.log('Delete:', deleteItem?._id);
    setDeleteItem(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Học kỳ"
        description={`${filtered.length} học kỳ`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Học kỳ' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Xuất Excel
            </Button>
            {canEdit && (
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Thêm học kỳ
              </Button>
            )}
          </>
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
              placeholder="Tìm theo mã, năm học..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Năm học
            </label>
            <select
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              {academicYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Học kỳ
            </label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
              <option value="3">Học kỳ hè</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="planning">Lên kế hoạch</option>
              <option value="registration">Đăng ký</option>
              <option value="studying">Đang học</option>
              <option value="grading">Chấm điểm</option>
              <option value="finished">Kết thúc</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải danh sách học kỳ..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title={search || academicYear || semester || status ? 'Không tìm thấy học kỳ' : 'Chưa có học kỳ nào'}
              description={
                search || academicYear || semester || status
                  ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                  : 'Bắt đầu bằng cách thêm học kỳ đầu tiên.'
              }
              action={
                canEdit && !search && !academicYear && !semester && !status ? (
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                    Thêm học kỳ
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã HK</TableHeadCell>
                <TableHeadCell>Năm học</TableHeadCell>
                <TableHeadCell>Học kỳ</TableHeadCell>
                <TableHeadCell>Thời gian</TableHeadCell>
                <TableHeadCell>Đăng ký</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right min-w-[120px]">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((at, i) => (
                <TableRow key={at._id} className="hover:bg-[rgb(var(--bg-hover))]">
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                    {at.code}
                    {at.isCurrent && (
                      <Badge variant="success" size="sm" className="ml-2">
                        Hiện tại
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">
                    {at.academicYear}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    HK {at.semester}
                    {at.termType !== 'regular' && (
                      <span className="ml-1 text-xs text-[rgb(var(--text-muted))]">
                        ({TERM_TYPE_LABELS[at.termType]})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] text-sm">
                    {formatDate(at.startDate)} - {formatDate(at.endDate)}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] text-sm">
                    {at.registrationStart && at.registrationEnd
                      ? `${formatDate(at.registrationStart)} - ${formatDate(at.registrationEnd)}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_LABELS[at.status]?.variant || 'neutral'} size="sm">
                      {STATUS_LABELS[at.status]?.label || at.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(at)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(at)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(at)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-[rgb(var(--error))]" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
          pageSizeOptions={[10, 25, 50]}
        />
      )}

      {/* Create/Edit/View Modal */}
      <AcademicTermModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        mode={modalState.mode}
        data={modalState.data}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa học kỳ"
        itemName={deleteItem?.code}
      />
    </div>
  );
}
