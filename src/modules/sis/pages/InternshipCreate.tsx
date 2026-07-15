import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useCreateInternship } from '@/hooks/useSis';

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}{required && <span className="text-[rgb(var(--error))] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[rgb(var(--error))]">{error}</p>}
    </div>
  );
}

export default function InternshipCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateInternship();

  const [form, setForm] = useState({
    studentName: '',
    studentCode: '',
    className: '',
    major: '',
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    supervisor: '',
    supervisorPhone: '',
    supervisorEmail: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.studentName.trim()) e.studentName = 'Tên sinh viên không được để trống';
    if (!form.studentCode.trim()) e.studentCode = 'Mã sinh viên không được để trống';
    if (!form.company.trim()) e.company = 'Tên công ty không được để trống';
    if (!form.position.trim()) e.position = 'Vị trí thực tập không được để trống';
    if (!form.startDate) e.startDate = 'Ngày bắt đầu không được để trống';
    if (!form.endDate) e.endDate = 'Ngày kết thúc không được để trống';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    createMutation.mutate(
      {
        studentName: form.studentName.trim(),
        studentCode: form.studentCode.trim(),
        student: '', // Will be set if student selected from system
        className: form.className.trim() || undefined,
        major: form.major.trim() || undefined,
        company: form.company.trim(),
        position: form.position.trim(),
        location: form.location.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        supervisor: form.supervisor.trim() || undefined,
        supervisorPhone: form.supervisorPhone.trim() || undefined,
        supervisorEmail: form.supervisorEmail.trim() || undefined,
        description: form.description.trim() || undefined,
        status: 'registered',
        progress: 0,
        reportSubmitted: false,
      },
      {
        onSuccess: () => navigate('/sis/thuc-tap'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm hồ sơ thực tập"
        description="Tạo hồ sơ thực tập tốt nghiệp mới."
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Thực tập', href: '/sis/thuc-tap' },
          { label: 'Thêm mới' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/sis/thuc-tap')}>
            Quay lại
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin sinh viên</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label="Mã sinh viên" required error={errors.studentCode}>
              <Input
                value={form.studentCode}
                onChange={(e) => set('studentCode', e.target.value)}
                placeholder="SV2022001"
                error={errors.studentCode}
              />
            </Field>
            <Field label="Họ tên sinh viên" required error={errors.studentName}>
              <Input
                value={form.studentName}
                onChange={(e) => set('studentName', e.target.value)}
                placeholder="Nguyễn Văn A"
                error={errors.studentName}
              />
            </Field>
            <Field label="Lớp">
              <Input
                value={form.className}
                onChange={(e) => set('className', e.target.value)}
                placeholder="CNTT-K24"
              />
            </Field>
            <Field label="Ngành">
              <Input
                value={form.major}
                onChange={(e) => set('major', e.target.value)}
                placeholder="CNTT"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin thực tập</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label="Tên công ty" required error={errors.company}>
              <Input
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="FPT Software"
                error={errors.company}
              />
            </Field>
            <Field label="Vị trí thực tập" required error={errors.position}>
              <Input
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
                placeholder="Thực tập sinh Backend"
                error={errors.position}
              />
            </Field>
            <Field label="Địa điểm">
              <Input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Đà Nẵng"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ngày bắt đầu" required error={errors.startDate}>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                  error={errors.startDate}
                />
              </Field>
              <Field label="Ngày kết thúc" required error={errors.endDate}>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                  error={errors.endDate}
                />
              </Field>
            </div>
            <Field label="Người hướng dẫn">
              <Input
                value={form.supervisor}
                onChange={(e) => set('supervisor', e.target.value)}
                placeholder="Nguyễn Văn B"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SĐT người hướng dẫn">
                <Input
                  value={form.supervisorPhone}
                  onChange={(e) => set('supervisorPhone', e.target.value)}
                  placeholder="0901234567"
                />
              </Field>
              <Field label="Email người hướng dẫn">
                <Input
                  value={form.supervisorEmail}
                  onChange={(e) => set('supervisorEmail', e.target.value)}
                  placeholder="supervisor@company.com"
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Ghi chú">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm về vị trí thực tập..."
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/thuc-tap')}>
            Quay lại
          </Button>
          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
