import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, CheckCircle2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  ActionButtons,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import {
  useEnrollmentList,
  useUpdateEnrollment,
  type Enrollment,
} from '@/hooks/useSis';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  enrolled: { variant: 'success', label: 'Đã đăng ký' },
  in_progress: { variant: 'warning', label: 'Đang học' },
  completed: { variant: 'info', label: 'Hoàn thành' },
  failed: { variant: 'error', label: 'Không đạt' },
  withdrawn: { variant: 'neutral', label: 'Đã rút' },
};

export default function StudentEnrollment() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, refetch } = useEnrollmentList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const updateMutation = useUpdateEnrollment();

  const items: Enrollment[] = useMemo(
    () => ((data as any)?.data ?? []) as Enrollment[],
    [data]
  );

  const filtered = items;
  const total = (data as any)?.total ?? filtered.length;

  const stats = useMemo(() => {
    const totalCount = items.length;
    const approved = items.filter((e) => e.status === 'enrolled' || e.status === 'in_progress' || e.status === 'completed').length;
    const pending = items.filter((e) => e.status === 'enrolled').length;
    return { totalCount, approved, pending };
  }, [items]);

  const getStudentName = (e: Enrollment) => {
    if (typeof e.student === 'object' && e.student) return (e.student as any).name ?? '—';
    return '—';
  };

  const getStudentCode = (e: Enrollment) => {
    if (typeof e.student === 'object' && e.student) return (e.student as any).code ?? '—';
    return '—';
  };

  const getStudentClass = (e: Enrollment) => {
    if (typeof e.student === 'object' && e.student) return (e.student as any).className ?? '—';
    return '—';
  };

  const getCourseName = (e: Enrollment) => {
    if (typeof e.course === 'object' && e.course) return (e.course as any).name ?? '—';
    return '—';
  };

  const getCourseCode = (e: Enrollment) => {
    if (typeof e.course === 'object' && e.course) return (e.course as any).code ?? '—';
    return '—';
  };

  const handleApprove = (e: Enrollment) => {
    updateMutation.mutate({ id: e._id, data: { status: 'in_progress' } });
  };

  const handleReject = (e: Enrollment) => {
    updateMutation.mutate({ id: e._id, data: { status: 'withdrawn' } });
  };

  const STATS_CARDS = [
    { label: 'Tổng đăng ký', value: stats.totalCount, icon: <Download className="h-5 w-5" />, color: 'primary' },
    { label: 'Đang học / Hoàn thành', value: stats.approved, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { label: 'Chờ duyệt', value: stats.pending, icon: <Download className="h-5 w-5" />, color: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng ký học phần"
        description={`${total} đăng ký trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Đăng ký học phần' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Xuất Excel
            </Button>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/sis/dang-ky-hoc-phan/tao')}
            >
              Tạo đăng ký
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS_CARDS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Tìm theo tên sinh viên, mã SV, mã học phần..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-64 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="enrolled">Đã đăng ký</option>
            <option value="in_progress">Đang học</option>
            <option value="completed">Hoàn thành</option>
            <option value="failed">Không đạt</option>
            <option value="withdrawn">Đã rút</option>
          </select>
          <span className="text-sm text-[rgb(var(--text-muted))] ml-auto">
            {filtered.length} kết quả
          </span>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải danh sách đăng ký..." />
          </div>
        ) : isError ? (
          <div className="px-5 py-10">
            <EmptyState
              title="Không thể tải dữ liệu"
              description="Vui lòng kiểm tra kết nối và thử lại."
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Thử lại
                </Button>
              }
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              title={search || statusFilter ? 'Không tìm thấy đăng ký' : 'Chưa có đăng ký nào'}
              description={
                search || statusFilter
                  ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                  : 'Bắt đầu bằng cách tạo đăng ký học phần đầu tiên.'
              }
              action={
                !search && !statusFilter && (
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => navigate('/sis/dang-ky-hoc-phan/tao')}
                  >
                    Tạo đăng ký
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Họ tên</TableHeadCell>
                <TableHeadCell>Lớp</TableHeadCell>
                <TableHeadCell>Mã HP</TableHeadCell>
                <TableHeadCell>Học phần</TableHeadCell>
                <TableHeadCell>Ngày đăng ký</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((e) => {
                const sc = STATUS_CONFIG[e.status] ?? STATUS_CONFIG['enrolled'];
                return (
                  <TableRow key={e._id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                      {getStudentCode(e)}
                    </TableCell>
                    <TableCell className="font-medium text-[rgb(var(--text-primary))]">
                      {getStudentName(e)}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">
                      {getStudentClass(e)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                      {getCourseCode(e)}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">
                      {getCourseName(e)}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))] text-xs">
                      {e.enrollmentDate
                        ? new Date(e.enrollmentDate).toLocaleDateString('vi-VN')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sc.variant as any} dot size="sm">
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {e.status === 'enrolled' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[rgb(var(--success))]"
                              onClick={() => handleApprove(e)}
                              disabled={updateMutation.isPending}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[rgb(var(--error))]"
                              onClick={() => handleReject(e)}
                              disabled={updateMutation.isPending}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        <ActionButtons viewHref={`/sis/dang-ky-hoc-phan/${e._id}`} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {filtered.length > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}
    </div>
  );
}
