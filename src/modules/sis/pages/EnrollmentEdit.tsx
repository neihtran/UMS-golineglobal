import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useEnrollmentDetail, useGradeEnrollment } from '@/hooks/useSis';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-[rgb(var(--error))]">{error}</p>}
    </div>
  );
}

export default function EnrollmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: enrollment, isLoading, isError } = useEnrollmentDetail(id);
  const gradeMutation = useGradeEnrollment();

  const [form, setForm] = useState({
    midtermScore: '',
    finalScore: '',
    attendanceCount: '',
    totalSessions: '',
    notes: '',
  });

  if (enrollment && !form.midtermScore && enrollment.midtermScore !== undefined) {
    setForm({
      midtermScore: enrollment.midtermScore?.toString() ?? '',
      finalScore: enrollment.finalScore?.toString() ?? '',
      attendanceCount: enrollment.attendanceCount?.toString() ?? '',
      totalSessions: enrollment.totalSessions?.toString() ?? '',
      notes: enrollment.notes ?? '',
    });
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleGrade = () => {
    gradeMutation.mutate(
      {
        id,
        data: {
          midtermScore: form.midtermScore ? Number(form.midtermScore) : undefined,
          finalScore: form.finalScore ? Number(form.finalScore) : undefined,
          attendanceCount: form.attendanceCount ? Number(form.attendanceCount) : undefined,
          totalSessions: form.totalSessions ? Number(form.totalSessions) : undefined,
          notes: form.notes || undefined,
        },
      },
      { onSuccess: () => navigate('/sis/dang-ky-hoc-phan') }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sửa đăng ký" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Đăng ký học phần', href: '/sis/dang-ky-hoc-phan' }]} />
        <div className="px-5 py-10"><LoadingState message="Đang tải..." /></div>
      </div>
    );
  }

  if (isError || !enrollment) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sửa đăng ký" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Đăng ký học phần', href: '/sis/dang-ky-hoc-phan' }]} />
        <div className="px-5 py-10"><EmptyState title="Không tìm thấy" description="Đăng ký này có thể đã bị xóa." /></div>
      </div>
    );
  }

  const studentName = typeof enrollment.student === 'object' && enrollment.student ? (enrollment.student as any).name : '—';
  const courseName = typeof enrollment.course === 'object' && enrollment.course ? (enrollment.course as any).name : '—';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa đăng ký"
        description={`Sinh viên: ${studentName} — Học phần: ${courseName}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Đăng ký học phần', href: '/sis/dang-ky-hoc-phan' },
          { label: 'Chỉnh sửa' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/sis/dang-ky-hoc-phan')}>Quay lại</Button>}
      />

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Ghi điểm & Thông tin đăng ký</h3>
        </div>
        <CardContent className="grid grid-cols-2 gap-4 pt-5">
          <Field label="Điểm giữa kỳ (0-10)">
            <Input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={form.midtermScore}
              onChange={(e) => set('midtermScore', e.target.value)}
              placeholder="8.5"
            />
          </Field>
          <Field label="Điểm cuối kỳ (0-10)">
            <Input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={form.finalScore}
              onChange={(e) => set('finalScore', e.target.value)}
              placeholder="9.0"
            />
          </Field>
          <Field label="Số buổi có mặt">
            <Input
              type="number"
              min={0}
              value={form.attendanceCount}
              onChange={(e) => set('attendanceCount', e.target.value)}
              placeholder="25"
            />
          </Field>
          <Field label="Tổng số buổi">
            <Input
              type="number"
              min={0}
              value={form.totalSessions}
              onChange={(e) => set('totalSessions', e.target.value)}
              placeholder="30"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Ghi chú">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                placeholder="Ghi chú thêm về đăng ký này..."
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/sis/dang-ky-hoc-phan')}>Quay lại</Button>
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleGrade}
          disabled={gradeMutation.isPending}
        >
          {gradeMutation.isPending ? 'Đang lưu...' : 'Lưu điểm'}
        </Button>
      </div>
    </div>
  );
}
