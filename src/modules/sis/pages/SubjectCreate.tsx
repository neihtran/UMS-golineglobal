import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useCreateSubject } from '@/hooks/useSis';
import { useDepartmentList } from '@/hooks/useHrm';

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

export default function SubjectCreate() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const createMutation = useCreateSubject();
  const { data: deptResp } = useDepartmentList({ isActive: true });
  const departments = ((deptResp as any)?.data ?? []) as Array<{ _id: string; name: string }>;

  const [form, setForm] = useState({
    code: '',
    name: '',
    credits: '',
    theoryHours: '',
    practiceHours: '',
    description: '',
    department: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã môn học không được để trống';
    if (!form.name.trim()) e.name = 'Tên môn học không được để trống';
    if (!form.credits) e.credits = 'Số tín chỉ không được để trống';
    if (!form.department) e.department = 'Khoa phụ trách không được để trống';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    createMutation.mutate(
      {
        code: form.code.trim(),
        name: form.name.trim(),
        credits: Number(form.credits),
        theoryHours: form.theoryHours ? Number(form.theoryHours) : undefined,
        practiceHours: form.practiceHours ? Number(form.practiceHours) : undefined,
        description: form.description.trim() || undefined,
        department: form.department,
        isActive: true,
      },
      {
        onSuccess: () => navigate('/sis/chuong-trinh-dao-tao/mon-hoc'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm môn học mới"
        description="Điền thông tin để tạo môn học mới trong hệ thống."
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('subject.titleList'), href: '/sis/chuong-trinh-dao-tao/mon-hoc' },
          { label: 'Thêm mới' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc')}>
            Quay lại
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin môn học</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label="Mã môn học" required error={errors.code}>
              <Input
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="INT1005"
                error={errors.code}
              />
            </Field>
            <Field label="Tên môn học" required error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Nhập môn Tin học"
                error={errors.name}
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Số tín chỉ" required error={errors.credits}>
                <Input
                  type="number"
                  value={form.credits}
                  onChange={(e) => set('credits', e.target.value)}
                  placeholder="3"
                  error={errors.credits}
                />
              </Field>
              <Field label="Giờ lý thuyết">
                <Input
                  type="number"
                  value={form.theoryHours}
                  onChange={(e) => set('theoryHours', e.target.value)}
                  placeholder="30"
                />
              </Field>
              <Field label="Giờ thực hành">
                <Input
                  type="number"
                  value={form.practiceHours}
                  onChange={(e) => set('practiceHours', e.target.value)}
                  placeholder="15"
                />
              </Field>
            </div>
            <Field label="Khoa phụ trách" required error={errors.department}>
              <select
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                <option value="">— Chọn khoa —</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Mô tả">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về nội dung môn học..."
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc')}>
            Quay lại
          </Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </form>
    </div>
  );
}
