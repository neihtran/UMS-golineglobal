import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useCreateGraduationSession } from '@/hooks/useSis';

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

export default function GraduationOpenSession() {
  const navigate = useNavigate();
  const createSession = useCreateGraduationSession();

  const [form, setForm] = useState({
    name: '',
    semester: '',
    academicYear: '',
    openDate: '',
    closeDate: '',
    reviewDate: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Tên đợt xét không được để trống';
    if (!form.semester.trim()) e.semester = 'Học kỳ không được để trống';
    if (!form.academicYear.trim()) e.academicYear = 'Năm học không được để trống';
    if (!form.openDate) e.openDate = 'Ngày mở không được để trống';
    if (!form.closeDate) e.closeDate = 'Ngày đóng không được để trống';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const submitData = {
      name: form.name.trim(),
      semester: form.semester,
      academicYear: form.academicYear.trim(),
      openDate: form.openDate,
      closeDate: form.closeDate,
      reviewDate: form.reviewDate || undefined,
      description: form.description.trim() || undefined,
      status: 'draft' as const,
    };

    try {
      await createSession.mutateAsync(submitData);
      navigate('/sis/tot-nghiep');
    } catch (err: any) {
      console.error('Create session error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mở đợt xét tốt nghiệp"
        description="Tạo đợt xét tốt nghiệp mới để bắt đầu quy trình xét tốt nghiệp."
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Tốt nghiệp', href: '/sis/tot-nghiep' },
          { label: 'Mở đợt xét' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/sis/tot-nghiep')}>
            Quay lại
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin đợt xét</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label="Tên đợt xét" required error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Đợt xét tốt nghiệp HK2/2025-2026"
                error={errors.name}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Học kỳ" required error={errors.semester}>
                <select
                  value={form.semester}
                  onChange={(e) => set('semester', e.target.value)}
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                >
                  <option value="">Chọn học kỳ</option>
                  <option value="HK1">Học kỳ 1</option>
                  <option value="HK2">Học kỳ 2</option>
                  <option value="HK3">Học kỳ 3 (Hè)</option>
                </select>
              </Field>
              <Field label="Năm học" required error={errors.academicYear}>
                <Input
                  value={form.academicYear}
                  onChange={(e) => set('academicYear', e.target.value)}
                  placeholder="2025-2026"
                  error={errors.academicYear}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ngày mở đơn" required error={errors.openDate}>
                <Input
                  type="date"
                  value={form.openDate}
                  onChange={(e) => set('openDate', e.target.value)}
                  error={errors.openDate}
                />
              </Field>
              <Field label="Ngày đóng đơn" required error={errors.closeDate}>
                <Input
                  type="date"
                  value={form.closeDate}
                  onChange={(e) => set('closeDate', e.target.value)}
                  error={errors.closeDate}
                />
              </Field>
            </div>
            <Field label="Ngày xét duyệt">
              <Input
                type="date"
                value={form.reviewDate}
                onChange={(e) => set('reviewDate', e.target.value)}
              />
            </Field>
            <div className="col-span-2">
              <Field label="Ghi chú">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm về đợt xét tốt nghiệp này..."
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/tot-nghiep')}>
            Quay lại
          </Button>
          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            disabled={createSession.isPending}
          >
            {createSession.isPending ? 'Đang tạo...' : 'Mở đợt xét'}
          </Button>
        </div>
      </form>
    </div>
  );
}
