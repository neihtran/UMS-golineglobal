import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Download, Plus, CheckCircle2, Clock, XCircle, FileCheck, CalendarDays, Search, Users } from 'lucide-react';
import { Button, Card, Badge, Modal, ActionButtons } from '@/components/ui';
import { Input } from '@/components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import { useGraduationSessionList, useGraduationSessionStudents, type GraduationSession } from '@/hooks/useSis';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string; icon: React.ElementType }> = {
  draft: { variant: 'neutral', label: 'Nháp', icon: Clock },
  open: { variant: 'success', label: 'Đang mở', icon: CheckCircle2 },
  closed: { variant: 'warning', label: 'Đã đóng', icon: XCircle },
  reviewed: { variant: 'info', label: 'Đã xét duyệt', icon: FileCheck },
};

const GRADUATION_STATUS: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  pending_review: { variant: 'warning', label: 'Chờ xét duyệt' },
  approved: { variant: 'success', label: 'Đạt' },
  not_approved: { variant: 'error', label: 'Không đạt' },
  graduated: { variant: 'success', label: 'Đã tốt nghiệp' },
  diploma_issued: { variant: 'success', label: 'Đã cấp bằng' },
  not_met: { variant: 'error', label: 'Không đạt' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function GraduationList() {
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GraduationSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, refetch } = useGraduationSessionList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: statusFilter || undefined,
  });

  const { data: sessionGraduations, isLoading: isLoadingStudents } = useGraduationSessionStudents(
    showStudentModal ? selectedSession?._id : undefined
  );

  const items: GraduationSession[] = ((data as any)?.data ?? []) as GraduationSession[];
  const total = (data as any)?.pagination?.total ?? items.length;

  const stats = {
    total: items.length,
    open: items.filter((s) => s.status === 'open').length,
    draft: items.filter((s) => s.status === 'draft').length,
    closed: items.filter((s) => s.status === 'closed').length,
    reviewed: items.filter((s) => s.status === 'reviewed').length,
  };

  // Filter graduations based on search
  const filteredGraduations = (sessionGraduations ?? []).filter((g: any) => {
    if (!searchTerm) return true;
    const student = g.student as any;
    const search = searchTerm.toLowerCase();
    return (
      student?.name?.toLowerCase().includes(search) ||
      student?.code?.toLowerCase().includes(search) ||
      student?.className?.toLowerCase().includes(search)
    );
  });

  // Stats for graduation status in modal
  const modalStats = {
    graduated: sessionGraduations?.filter((g: any) => ['graduated', 'diploma_issued'].includes(g.status)).length ?? 0,
    pending: sessionGraduations?.filter((g: any) => g.status === 'pending_review').length ?? 0,
    notMet: sessionGraduations?.filter((g: any) => g.status === 'not_met' || g.status === 'not_approved').length ?? 0,
  };

  const handleShowStudents = (session: GraduationSession) => {
    setSelectedSession(session);
    setSearchTerm('');
    setShowStudentModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đợt xét tốt nghiệp"
        description={`${total} đợt xét trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Tốt nghiệp' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Xuất Excel
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/sis/tot-nghiep/mo-dot')}>
              Mở đợt xét mới
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng đợt xét', value: stats.total, color: 'primary' },
          { label: 'Đang mở', value: stats.open, color: 'success' },
          { label: 'Đã đóng', value: stats.closed + stats.reviewed, color: 'warning' },
          { label: 'Nháp', value: stats.draft, color: 'muted' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="open">Đang mở</option>
          <option value="closed">Đã đóng</option>
          <option value="reviewed">Đã xét duyệt</option>
        </select>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <Card><div className="px-5 py-8"><LoadingState message="Đang tải danh sách đợt xét..." /></div></Card>
      ) : isError ? (
        <Card><div className="px-5 py-10"><EmptyState title="Không thể tải dữ liệu" description="Vui lòng thử lại." action={<Button variant="outline" onClick={() => refetch()}>Thử lại</Button>} /></div></Card>
      ) : items.length === 0 ? (
        <Card><div className="px-5 py-10"><EmptyState title={statusFilter ? 'Không tìm thấy đợt xét' : 'Chưa có đợt xét nào'} description={statusFilter ? 'Thử thay đổi bộ lọc.' : 'Bắt đầu bằng cách mở đợt xét tốt nghiệp đầu tiên.'} action={!statusFilter && <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/sis/tot-nghiep/mo-dot')}>Mở đợt xét</Button>} /></div></Card>
      ) : (
        <div className="grid gap-4">
          {items.map((session) => {
            const sc = STATUS_CONFIG[session.status] ?? STATUS_CONFIG['draft'];
            const StatusIcon = sc.icon;
            
            return (
              <Card key={session._id} className="hover:border-[rgb(var(--primary-light))]/50 transition-colors">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--${sc.variant === 'success' ? 'success' : sc.variant === 'warning' ? 'warning' : sc.variant === 'info' ? 'info' : 'muted'})/0.1)] text-[rgb(var(--${sc.variant === 'success' ? 'success' : sc.variant === 'warning' ? 'warning' : sc.variant === 'info' ? 'info' : 'muted'}))]`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{session.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                          <span className="font-medium">{session.semester}</span>
                          <span className="text-[rgb(var(--border))]">•</span>
                          <span>{session.academicYear}</span>
                          {session.totalCandidates > 0 && (
                            <>
                              <span className="text-[rgb(var(--border))]">•</span>
                              <span>{session.totalCandidates} sinh viên</span>
                            </>
                          )}
                        </div>
                        {session.description && (
                          <p className="mt-2 text-sm text-[rgb(var(--text-muted))] line-clamp-2">{session.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={sc.variant as any}>{sc.label}</Badge>
                      <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(session.openDate)} - {formatDate(session.closeDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--border)/0.6)] pt-4">
                    <div className="flex items-center gap-4 text-sm text-[rgb(var(--text-muted))]">
                      <span>Ngày mở: {formatDate(session.openDate)}</span>
                      <span>Ngày đóng: {formatDate(session.closeDate)}</span>
                      {session.reviewDate && <span>Ngày xét: {formatDate(session.reviewDate)}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionButtons
                        viewHref={`/sis/tot-nghiep/${session._id}`}
                        editHref={session.status === 'draft' ? `/sis/tot-nghiep/${session._id}/sua` : undefined}
                      />
                      {(session.status === 'open' || session.status === 'closed' || session.status === 'reviewed') && (
                        <Button variant="outline" size="sm" onClick={() => handleShowStudents(session)}>Danh sách SV</Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Hiển thị {items.length} / {total} đợt xét
          </p>
          <div className="flex items-center gap-2">
            <select
              value={pagination.pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-2 text-sm"
            >
              <option value={10}>10 / trang</option>
              <option value={25}>25 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}>
                Trước
              </Button>
              <span className="px-3 text-sm text-[rgb(var(--text-secondary))]">
                Trang {pagination.page}
              </span>
              <Button variant="outline" size="sm" disabled={items.length < pagination.pageSize} onClick={() => setPage(pagination.page + 1)}>
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student List Modal */}
      <Modal
        open={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={`Danh sách sinh viên - ${selectedSession?.name}`}
        description={`${filteredGraduations.length} sinh viên đăng ký xét tốt nghiệp`}
        size="full"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowStudentModal(false)}>Đóng</Button>
            <Button leftIcon={<Download className="h-4 w-4" />}>Xuất Excel</Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
              <Input
                placeholder="Tìm theo tên, mã SV, lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
              <span className="px-2 py-1 bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))] rounded">
                {modalStats.graduated} Đạt
              </span>
              <span className="px-2 py-1 bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))] rounded">
                {modalStats.pending} Chờ
              </span>
              <span className="px-2 py-1 bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))] rounded">
                {modalStats.notMet} Không đạt
              </span>
            </div>
          </div>

          {/* Table */}
          {isLoadingStudents ? (
            <div className="py-8 text-center text-[rgb(var(--text-muted))]">Đang tải...</div>
          ) : (
            <div className="border border-[rgb(var(--border))] rounded-lg overflow-hidden">
              <Table>
                <TableHead>
                  <TableRow className="bg-[rgb(var(--bg-secondary))]">
                    <TableHeadCell className="w-12">STT</TableHeadCell>
                    <TableHeadCell>Mã SV</TableHeadCell>
                    <TableHeadCell>Họ tên</TableHeadCell>
                    <TableHeadCell>Lớp</TableHeadCell>
                    <TableHeadCell className="text-center">GPA</TableHeadCell>
                    <TableHeadCell className="text-center">Tín chỉ</TableHeadCell>
                    <TableHeadCell className="text-center">Xếp loại</TableHeadCell>
                    <TableHeadCell className="text-center">Trạng thái</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGraduations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[rgb(var(--text-muted))]">
                        Chưa có sinh viên đăng ký xét tốt nghiệp
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGraduations.map((graduation: any, i: number) => {
                      const student = graduation.student as any;
                      const gs = GRADUATION_STATUS[graduation.status] ?? GRADUATION_STATUS['pending_review'];
                      return (
                        <TableRow key={graduation._id} className="hover:bg-[rgb(var(--bg-secondary))]">
                          <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{student?.code ?? '—'}</TableCell>
                          <TableCell className="font-medium">{student?.name ?? '—'}</TableCell>
                          <TableCell>{student?.className ?? '—'}</TableCell>
                          <TableCell className="text-center tabular-nums">{graduation.gpa?.toFixed(2) ?? '—'}</TableCell>
                          <TableCell className="text-center tabular-nums">{graduation.totalCredits ?? '—'}</TableCell>
                          <TableCell className="text-center">{graduation.degree ?? '—'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={gs.variant as any} dot>{gs.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
