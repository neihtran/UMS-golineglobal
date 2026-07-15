import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Award } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useGraduationDetail, useIssueDiploma } from '@/hooks/useSis';

export default function GraduationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: g, isLoading, isError } = useGraduationDetail(id);
  const issueDiploma = useIssueDiploma();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết tốt nghiệp" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Tốt nghiệp', href: '/sis/tot-nghiep' }]} />
        <div className="px-5 py-10"><LoadingState message="Đang tải..." /></div>
      </div>
    );
  }

  if (isError || !g) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết tốt nghiệp" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Tốt nghiệp', href: '/sis/tot-nghiep' }]} />
        <div className="px-5 py-10"><EmptyState title="Không tìm thấy hồ sơ" description="Hồ sơ này có thể đã bị xóa." /></div>
      </div>
    );
  }

  const studentName = typeof g.student === 'object' && g.student ? (g.student as any).name : '—';
  const studentCode = typeof g.student === 'object' && g.student ? (g.student as any).code : '—';

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
    pending_review: { variant: 'warning', label: 'Chờ xét duyệt' },
    graduated: { variant: 'success', label: 'Đã tốt nghiệp' },
    diploma_issued: { variant: 'success', label: 'Đã cấp bằng' },
    not_met: { variant: 'error', label: 'Không đạt' },
  };

  const sc = STATUS_CONFIG[g.status] ?? STATUS_CONFIG['pending_review'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tốt nghiệp — ${studentName}`}
        description={`${studentCode}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Tốt nghiệp', href: '/sis/tot-nghiep' },
          { label: studentName },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/tot-nghiep')}>
              Quay lại
            </Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'GPA tích lũy', value: g.gpa?.toFixed(2) ?? '—' },
          { label: 'Tổng tín chỉ', value: g.totalCredits ?? '—' },
          { label: 'Điểm luận văn', value: g.thesisScore?.toFixed(1) ?? '—' },
          { label: 'Xếp loại', value: g.degree ?? '—' },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
              <p className="mt-1 text-xl font-bold text-[rgb(var(--text-primary))]">{value}</p>
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
            { label: 'Khóa', value: g.cohort },
            { label: 'GPA', value: g.gpa?.toFixed(2) ?? '—' },
            { label: 'Tín chỉ', value: g.totalCredits ?? '—' },
            { label: 'Năm tốt nghiệp', value: g.graduationYear },
            { label: 'Học kỳ xét', value: g.graduationSemester },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {g.thesisTitle && (
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Luận văn / Đồ án</h3>
          </div>
          <CardContent className="pt-5 grid grid-cols-2 gap-4">
            {[
              { label: 'Tên đề tài', value: g.thesisTitle },
              { label: 'Người hướng dẫn', value: g.thesisAdvisor ?? '—' },
              { label: 'Ngày bảo vệ', value: g.thesisDefendedAt ? new Date(g.thesisDefendedAt).toLocaleDateString('vi-VN') : '—' },
              { label: 'Điểm', value: g.thesisScore != null ? `${g.thesisScore}/10` : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-3">
          <Award className="h-5 w-5 text-[rgb(var(--warning))]" />
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Văn bằng</h3>
        </div>
        <CardContent className="pt-5 grid grid-cols-3 gap-4">
          {[
            { label: 'Số hiệu bằng', value: g.diplomaNo ?? '—' },
            { label: 'Ngày cấp', value: g.diplomaDate ? new Date(g.diplomaDate).toLocaleDateString('vi-VN') : '—' },
            { label: 'Loại bằng', value: g.degree ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{label}</p>
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
          {g.status !== 'diploma_issued' && g.status !== 'not_met' && (
            <div className="flex items-end">
              <Button
                leftIcon={<Award className="h-4 w-4" />}
                onClick={() => {
                  const diplomaNo = prompt('Nhập số hiệu bằng:');
                  if (!diplomaNo) return;
                  const diplomaDate = prompt('Nhập ngày cấp (dd/MM/yyyy):', new Date().toLocaleDateString('vi-VN'));
                  if (!diplomaDate) return;
                  issueDiploma.mutate({
                    id: id!,
                    diplomaNo,
                    diplomaDate: diplomaDate.split('/').reverse().join('-'),
                  });
                }}
                disabled={issueDiploma.isPending}
              >
                Cấp bằng
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
