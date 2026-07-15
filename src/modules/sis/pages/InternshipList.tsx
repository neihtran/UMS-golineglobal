import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, MapPin, FileText, CheckCircle2, Clock } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  Card,
  CardContent,
  ActionButtons,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import {
  useInternshipList,
  type Internship,
} from '@/hooks/useSis';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error' | 'info'; label: string }> = {
  registered: { variant: 'info', label: 'Đã đăng ký' },
  in_progress: { variant: 'warning', label: 'Đang thực tập' },
  pending_report: { variant: 'neutral', label: 'Chờ báo cáo' },
  completed: { variant: 'success', label: 'Hoàn thành' },
  rejected: { variant: 'error', label: 'Từ chối' },
};

const gradeColor = (g: number) => {
  if (g >= 8.5) return 'text-[rgb(var(--success))]';
  if (g >= 7.0) return 'text-[rgb(var(--primary))]';
  if (g >= 5.0) return 'text-[rgb(var(--warning))]';
  return 'text-[rgb(var(--error))]';
};

const gradeLabel = (g: number) => {
  if (g >= 8.5) return 'A';
  if (g >= 7.5) return 'B+';
  if (g >= 7.0) return 'B';
  if (g >= 6.5) return 'C+';
  if (g >= 6.0) return 'C';
  if (g >= 5.0) return 'D';
  return 'F';
};

export default function InternshipList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, refetch } = useInternshipList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const items: Internship[] = useMemo(() => ((data as any)?.data ?? []) as Internship[], [data]);
  const total = (data as any)?.total ?? items.length;

  const stats = useMemo(() => {
    return {
      total: items.length,
      inProgress: items.filter((i) => i.status === 'in_progress').length,
      completed: items.filter((i) => i.status === 'completed').length,
      avgGrade: items.filter((i) => i.grade != null).length > 0
        ? (
            items.filter((i) => i.grade != null).reduce((s, i) => s + (i.grade ?? 0), 0) /
            items.filter((i) => i.grade != null).length
          ).toFixed(1)
        : '—',
    };
  }, [items]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Thực tập tốt nghiệp"
        description={`${total} hồ sơ thực tập trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Thực tập' },
        ]}
        actions={
          <>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/sis/thuc-tap/tao')}>
              Thêm thực tập
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Tổng đăng ký', value: stats.total, icon: <Briefcase className="h-5 w-5" />, color: 'primary' },
          { label: 'Đang thực tập', value: stats.inProgress, icon: <Clock className="h-5 w-5" />, color: 'warning' },
          { label: 'Hoàn thành', value: stats.completed, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: 'Điểm TB', value: stats.avgGrade, icon: <FileText className="h-5 w-5" />, color: 'accent' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên sinh viên, mã SV, công ty..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="registered">Đã đăng ký</option>
          <option value="in_progress">Đang thực tập</option>
          <option value="pending_report">Chờ báo cáo</option>
          <option value="completed">Hoàn thành</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {isLoading ? (
        <div className="px-5 py-8"><LoadingState message="Đang tải danh sách thực tập..." /></div>
      ) : isError ? (
        <div className="px-5 py-10">
          <EmptyState title="Không thể tải dữ liệu" description="Vui lòng thử lại." action={<Button variant="outline" onClick={() => refetch()}>Thử lại</Button>} />
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10">
          <EmptyState
            title={search || statusFilter ? 'Không tìm thấy kết quả' : 'Chưa có hồ sơ thực tập nào'}
            description={search || statusFilter ? 'Thử thay đổi bộ lọc.' : 'Bắt đầu bằng cách thêm hồ sơ thực tập.'}
            action={!search && !statusFilter ? <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/sis/thuc-tap/tao')}>Thêm thực tập</Button> : undefined}
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>STT</TableHeadCell>
              <TableHeadCell>Sinh viên</TableHeadCell>
              <TableHeadCell>Ngành</TableHeadCell>
              <TableHeadCell>Công ty</TableHeadCell>
              <TableHeadCell>Vị trí</TableHeadCell>
              <TableHeadCell>Địa điểm</TableHeadCell>
              <TableHeadCell>Thời gian</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
              <TableHeadCell>Tiến độ</TableHeadCell>
              <TableHeadCell>Điểm</TableHeadCell>
              <TableHeadCell>Thao tác</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((i, idx) => {
              const sc = STATUS_CONFIG[i.status] ?? STATUS_CONFIG['registered'];
              const studentName = typeof i.student === 'object' && i.student ? (i.student as any).name : i.studentName ?? '—';
              const studentCode = typeof i.student === 'object' && i.student ? (i.student as any).code : i.studentCode ?? '—';
              return (
                <TableRow key={i._id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{studentName}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{studentCode} — {i.className ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">{i.major ?? '—'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-[rgb(var(--text-primary))]">{i.company}</p>
                      {i.supervisor && <p className="text-xs text-[rgb(var(--text-muted))]">{i.supervisor}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{i.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                      <MapPin className="h-3 w-3" />
                      {i.location ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[rgb(var(--text-secondary))]">
                      {i.startDate ? new Date(i.startDate).toLocaleDateString('vi-VN') : '—'}
                      {i.endDate ? ` → ${new Date(i.endDate).toLocaleDateString('vi-VN')}` : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant as any} size="sm">{sc.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {i.status === 'completed' ? (
                      <Badge variant="success" size="sm">100%</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                          <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${i.progress ?? 0}%` }} />
                        </div>
                        <span className="text-xs text-[rgb(var(--text-muted))]">{i.progress ?? 0}%</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {i.grade != null ? (
                      <div>
                        <span className={`text-sm font-bold ${gradeColor(i.grade)}`}>{i.grade.toFixed(1)}</span>
                        <span className="text-xs text-[rgb(var(--text-muted))] ml-1">({gradeLabel(i.grade)})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ActionButtons
                      viewHref={`/sis/thuc-tap/${i._id}`}
                      editHref={`/sis/thuc-tap/${i._id}/sua`}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {items.length > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}
    </div>
  );
}
