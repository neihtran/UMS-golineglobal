import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useEnrollmentDetail } from '@/hooks/useSis';

export default function EnrollmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: enrollment, isLoading, isError } = useEnrollmentDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết đăng ký" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Đăng ký học phần', href: '/sis/dang-ky-hoc-phan' }]} />
        <div className="px-5 py-10"><LoadingState message="Đang tải..." /></div>
      </div>
    );
  }

  if (isError || !enrollment) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết đăng ký" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Đăng ký học phần', href: '/sis/dang-ky-hoc-phan' }]} />
        <div className="px-5 py-10">
          <EmptyState title="Không tìm thấy đăng ký" description="Đăng ký này có thể đã bị xóa." />
        </div>
      </div>
    );
  }

  const studentName = typeof enrollment.student === 'object' && enrollment.student ? (enrollment.student as any).name : '—';
  const studentCode = typeof enrollment.student === 'object' && enrollment.student ? (enrollment.student as any).code : '—';
  const studentClass = typeof enrollment.student === 'object' && enrollment.student ? (enrollment.student as any).className : '—';
  const courseName = typeof enrollment.course === 'object' && enrollment.course ? (enrollment.course as any).name : '—';
  const courseCode = typeof enrollment.course === 'object' && enrollment.course ? (enrollment.course as any).code : '—';

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
    enrolled: { variant: 'success', label: 'Đã đăng ký' },
    in_progress: { variant: 'warning', label: 'Đang học' },
    completed: { variant: 'info', label: 'Hoàn thành' },
    failed: { variant: 'error', label: 'Không đạt' },
    withdrawn: { variant: 'neutral', label: 'Đã rút' },
  };

  const sc = STATUS_CONFIG[enrollment.status] ?? STATUS_CONFIG['enrolled'];

  const calculateGrade = () => {
    if (!enrollment.midtermScore || !enrollment.finalScore) return null;
    return (enrollment.midtermScore * 0.4 + enrollment.finalScore * 0.6).toFixed(2);
  };

  const gradeColor = (g: number) => {
    if (g >= 8.5) return 'text-[rgb(var(--success))]';
    if (g >= 7.0) return 'text-[rgb(var(--primary))]';
    if (g >= 5.0) return 'text-[rgb(var(--warning))]';
    return 'text-[rgb(var(--error))]';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Đăng ký học phần — ${studentName}`}
        description={`${studentCode} · ${studentClass}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Đăng ký học phần', href: '/sis/dang-ky-hoc-phan' },
          { label: studentName },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/dang-ky-hoc-phan')}>
              Quay lại
            </Button>
            <Button leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/sis/dang-ky-hoc-phan/${id}/sua`)}>
              Sửa / Ghi điểm
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Mã sinh viên', value: studentCode },
          { label: 'Học phần', value: courseCode },
          { label: 'Ngày đăng ký', value: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN') : '—' },
          { label: 'Trạng thái', value: sc.label },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
              {label === 'Trạng thái' ? (
                <Badge variant={sc.variant as any} dot className="mt-1">{value}</Badge>
              ) : (
                <p className="mt-1 text-sm font-semibold text-[rgb(var(--text-primary))]">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin đăng ký</h3>
          <Badge variant={sc.variant as any} dot>{sc.label}</Badge>
        </div>
        <CardContent className="grid grid-cols-3 gap-4 pt-5">
          {[
            { label: 'Sinh viên', value: studentName },
            { label: 'Mã sinh viên', value: studentCode },
            { label: 'Lớp', value: studentClass },
            { label: 'Học phần', value: courseName },
            { label: 'Mã học phần', value: courseCode },
            { label: 'Ngày đăng ký', value: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN') : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scores */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Điểm số</h3>
        </div>
        <CardContent className="grid grid-cols-2 gap-4 pt-5">
          {[
            { label: 'Điểm giữa kỳ', value: enrollment.midtermScore?.toFixed(1) ?? '—' },
            { label: 'Điểm cuối kỳ', value: enrollment.finalScore?.toFixed(1) ?? '—' },
            { label: 'Tổng điểm', value: enrollment.totalScore?.toFixed(1) ?? (calculateGrade() ?? '—') },
            { label: 'Xếp loại', value: enrollment.letterGrade ?? '—' },
            { label: 'Số buổi có mặt / Tổng', value: enrollment.attendanceCount != null ? `${enrollment.attendanceCount} / ${enrollment.totalSessions ?? '?'}` : '—' },
          ].map(({ label, value }) => {
            const isNumeric = !isNaN(Number(value)) && value !== '—';
            return (
              <div key={label}>
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
                <p className={`text-sm font-bold ${isNumeric && Number(value) >= 8.5 ? gradeColor(Number(value)) : 'text-[rgb(var(--text-primary))]'}`}>
                  {value}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {enrollment.notes && (
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Ghi chú</h3>
          </div>
          <CardContent className="pt-5">
            <p className="text-sm text-[rgb(var(--text-secondary))]">{enrollment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
