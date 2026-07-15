import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useInternshipDetail } from '@/hooks/useSis';

export default function InternshipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: i, isLoading, isError } = useInternshipDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết thực tập" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Thực tập', href: '/sis/thuc-tap' }]} />
        <div className="px-5 py-10"><LoadingState message="Đang tải..." /></div>
      </div>
    );
  }

  if (isError || !i) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết thực tập" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Thực tập', href: '/sis/thuc-tap' }]} />
        <div className="px-5 py-10"><EmptyState title="Không tìm thấy" description="Hồ sơ này có thể đã bị xóa." /></div>
      </div>
    );
  }

  const studentName = typeof i.student === 'object' && i.student ? (i.student as any).name : i.studentName ?? '—';
  const studentCode = typeof i.student === 'object' && i.student ? (i.student as any).code : i.studentCode ?? '—';

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error' | 'info'; label: string }> = {
    registered: { variant: 'info', label: 'Đã đăng ký' },
    in_progress: { variant: 'warning', label: 'Đang thực tập' },
    pending_report: { variant: 'neutral', label: 'Chờ báo cáo' },
    completed: { variant: 'success', label: 'Hoàn thành' },
    rejected: { variant: 'error', label: 'Từ chối' },
  };

  const sc = STATUS_CONFIG[i.status] ?? STATUS_CONFIG['registered'];

  const gradeColor = (g: number) => {
    if (g >= 8.5) return 'text-[rgb(var(--success))]';
    if (g >= 7.0) return 'text-[rgb(var(--primary))]';
    if (g >= 5.0) return 'text-[rgb(var(--warning))]';
    return 'text-[rgb(var(--error))]';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Thực tập — ${studentName}`}
        description={studentCode}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Thực tập', href: '/sis/thuc-tap' },
          { label: studentName },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/thuc-tap')}>
              Quay lại
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Công ty', value: i.company },
          { label: 'Vị trí', value: i.position },
          { label: 'Trạng thái', value: sc.label },
          { label: 'Điểm', value: i.grade != null ? `${i.grade}/10` : '—' },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
              {label === 'Trạng thái' ? (
                <Badge variant={sc.variant as any} dot className="mt-1">{value}</Badge>
              ) : label === 'Điểm' ? (
                <p className={`mt-1 text-lg font-bold ${value !== '—' ? gradeColor(Number(value)) : 'text-[rgb(var(--text-primary))]'}`}>
                  {value}
                </p>
              ) : (
                <p className="mt-1 text-sm font-medium text-[rgb(var(--text-primary))] truncate">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin sinh viên</h3>
          <Badge variant={sc.variant as any} dot>{sc.label}</Badge>
        </div>
        <CardContent className="pt-5 grid grid-cols-3 gap-4">
          {[
            { label: 'Họ tên', value: studentName },
            { label: 'Mã sinh viên', value: studentCode },
            { label: 'Lớp', value: i.className ?? '—' },
            { label: 'Ngành', value: i.major ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin thực tập</h3>
        </div>
        <CardContent className="pt-5 grid grid-cols-3 gap-4">
          {[
            { label: 'Công ty', value: i.company },
            { label: 'Vị trí', value: i.position },
            { label: 'Địa điểm', value: i.location ?? '—' },
            { label: 'Ngày bắt đầu', value: i.startDate ? new Date(i.startDate).toLocaleDateString('vi-VN') : '—' },
            { label: 'Ngày kết thúc', value: i.endDate ? new Date(i.endDate).toLocaleDateString('vi-VN') : '—' },
            { label: 'Người hướng dẫn', value: i.supervisor ?? '—' },
            { label: 'SĐT người hướng dẫn', value: i.supervisorPhone ?? '—' },
            { label: 'Email người hướng dẫn', value: i.supervisorEmail ?? '—' },
            { label: 'Tiến độ', value: `${i.progress ?? 0}%` },
            { label: 'Báo cáo đã nộp', value: i.reportSubmitted ? 'Đã nộp' : 'Chưa nộp' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {i.description && (
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Ghi chú</h3>
          </div>
          <CardContent className="pt-5">
            <p className="text-sm text-[rgb(var(--text-secondary))]">{i.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
