import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, CalendarDays, Users, FileText, Search } from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal } from '@/components/ui';
import { Input } from '@/components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useGraduationSessionById, useGraduationSessionStudents } from '@/hooks/useSis';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  draft: { variant: 'neutral', label: 'Nháp' },
  open: { variant: 'success', label: 'Đang mở' },
  closed: { variant: 'warning', label: 'Đã đóng' },
  reviewed: { variant: 'info', label: 'Đã xét duyệt' },
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
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function GraduationSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading, isError } = useGraduationSessionById(id);
  const { data: graduations, isLoading: isLoadingStudents } = useGraduationSessionStudents(id);
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết đợt xét" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Tốt nghiệp', href: '/sis/tot-nghiep' }, { label: 'Chi tiết' }]} />
        <div className="px-5 py-10"><LoadingState message="Đang tải..." /></div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết đợt xét" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Tốt nghiệp', href: '/sis/tot-nghiep' }, { label: 'Chi tiết' }]} />
        <div className="px-5 py-10"><EmptyState title="Không tìm thấy đợt xét" description="Đợt xét này có thể đã bị xóa." action={<Button variant="outline" leftIcon={<ArrowLeft />} onClick={() => navigate('/sis/tot-nghiep')}>Quay lại</Button>} /></div>
      </div>
    );
  }

  const sc = STATUS_CONFIG[session.status] ?? STATUS_CONFIG['draft'];
  
  // Filter graduations based on search
  const filteredGraduations = (graduations ?? []).filter((g: any) => {
    if (!searchTerm) return true;
    const student = g.student as any;
    const search = searchTerm.toLowerCase();
    return (
      student?.name?.toLowerCase().includes(search) ||
      student?.code?.toLowerCase().includes(search) ||
      student?.className?.toLowerCase().includes(search)
    );
  });

  // Stats for graduation status
  const stats = {
    total: graduations?.length ?? 0,
    graduated: graduations?.filter((g: any) => ['graduated', 'diploma_issued'].includes(g.status)).length ?? 0,
    pending: graduations?.filter((g: any) => g.status === 'pending_review').length ?? 0,
    notMet: graduations?.filter((g: any) => g.status === 'not_met' || g.status === 'not_approved').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={session.name}
        description={`${session.semester} - ${session.academicYear}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Tốt nghiệp', href: '/sis/tot-nghiep' },
          { label: session.name },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất Excel</Button>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/tot-nghiep')}>
              Quay lại
            </Button>
          </>
        }
      />

      {/* Status & Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Badge variant={sc.variant as any} className="mb-2">{sc.label}</Badge>
            <p className="text-xs text-[rgb(var(--text-muted))]">Trạng thái</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{stats.total}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">Sinh viên đăng ký</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[rgb(var(--text-primary))]">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">{formatDate(session.openDate)}</span>
            </div>
            <p className="text-xs text-[rgb(var(--text-muted))]">Ngày mở</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[rgb(var(--text-primary))]">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">{formatDate(session.closeDate)}</span>
            </div>
            <p className="text-xs text-[rgb(var(--text-muted))]">Ngày đóng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[rgb(var(--text-primary))]">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">{session.reviewDate ? formatDate(session.reviewDate) : '—'}</span>
            </div>
            <p className="text-xs text-[rgb(var(--text-muted))]">Ngày xét duyệt</p>
          </CardContent>
        </Card>
      </div>

      {/* Session Info */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin đợt xét</h3>
        </div>
        <CardContent className="pt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tên đợt xét</p>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{session.name}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Học kỳ</p>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{session.semester}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Năm học</p>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{session.academicYear}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số sinh viên</p>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{session.totalCandidates}</p>
          </div>
        </CardContent>
        {session.description && (
          <div className="px-5 pb-5">
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{session.description}</p>
          </div>
        )}
      </Card>

      {/* Actions based on status */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hành động</h3>
        </div>
        <CardContent className="pt-5 flex flex-wrap gap-3">
          {session.status === 'draft' && (
            <>
              <Button variant="outline">Chỉnh sửa</Button>
              <Button>Mở đợt xét</Button>
            </>
          )}
          {session.status === 'open' && (
            <>
              <Button variant="outline" leftIcon={<Users className="h-4 w-4" />} onClick={() => setShowStudentModal(true)}>Danh sách sinh viên</Button>
              <Button variant="outline">Đóng đợt xét</Button>
            </>
          )}
          {session.status === 'closed' && (
            <>
              <Button variant="outline" leftIcon={<Users className="h-4 w-4" />} onClick={() => setShowStudentModal(true)}>Xem danh sách</Button>
              <Button>Phê duyệt tốt nghiệp</Button>
            </>
          )}
          {session.status === 'reviewed' && (
            <>
              <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />} onClick={() => setShowStudentModal(true)}>Danh sách tốt nghiệp</Button>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Student List Modal */}
      <Modal
        open={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={`Danh sách sinh viên - ${session.name}`}
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
                {stats.graduated} Đạt
              </span>
              <span className="px-2 py-1 bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))] rounded">
                {stats.pending} Chờ
              </span>
              <span className="px-2 py-1 bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))] rounded">
                {stats.notMet} Không đạt
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
