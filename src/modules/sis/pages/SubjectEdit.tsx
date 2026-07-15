import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useSubjectDetail, useUpdateSubject } from '@/hooks/useSis';
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

type SubjectEditProps = { id: string };

export default function SubjectEdit({ id }: SubjectEditProps) {
  const navigate = useNavigate();
  const { data: subject, isLoading, isError } = useSubjectDetail(id);
  const updateMutation = useUpdateSubject();
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
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form when data loads
  if (subject && !form.name) {
    const deptId =
      typeof subject.department === 'object' && subject.department
        ? (subject.department as any)._id
        : '';
    setForm({
      code: subject.code,
      name: subject.name,
      credits: subject.credits.toString(),
      theoryHours: (subject.theoryHours ?? '').toString(),
      practiceHours: (subject.practiceHours ?? '').toString(),
      description: subject.description ?? '',
      department: deptId,
      isActive: subject.isActive,
    });
  }

  const set = (k: string, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã môn học không được để trống';
    if (!form.name.trim()) e.name = 'Tên môn học không được để trống';
    if (!form.credits) e.credits = 'Số tín chỉ không được để trống';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    updateMutation.mutate(
      {
        id,
        data: {
          code: form.code.trim(),
          name: form.name.trim(),
          credits: Number(form.credits),
          theoryHours: form.theoryHours ? Number(form.theoryHours) : undefined,
          practiceHours: form.practiceHours ? Number(form.practiceHours) : undefined,
          description: form.description.trim() || undefined,
          department: form.department || undefined,
          isActive: form.isActive,
        },
      },
      {
        onSuccess: () => navigate('/sis/chuong-trinh-dao-tao/mon-hoc'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sửa môn học" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Môn học', href: '/sis/chuong-trinh-dao-tao/mon-hoc' }, { label: '...' }]} />
        <div className="px-5 py-10"><LoadingState message="Đang tải..." /></div>
      </div>
    );
  }

  if (isError || !subject) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sửa môn học" breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Môn học', href: '/sis/chuong-trinh-dao-tao/mon-hoc' }]} />
        <div className="px-5 py-10">
          <EmptyState title="Không tìm thấy môn học" description="Môn học này có thể đã bị xóa." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa môn học: ${subject.name}`}
        description={`Mã: ${subject.code}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Môn học', href: '/sis/chuong-trinh-dao-tao/mon-hoc' },
          { label: subject.code },
          { label: 'Sửa' },
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
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} error={errors.code} />
            </Field>
            <Field label="Tên môn học" required error={errors.name}>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Số tín chỉ" required error={errors.credits}>
                <Input type="number" value={form.credits} onChange={(e) => set('credits', e.target.value)} error={errors.credits} />
              </Field>
              <Field label="Giờ lý thuyết">
                <Input type="number" value={form.theoryHours} onChange={(e) => set('theoryHours', e.target.value)} />
              </Field>
              <Field label="Giờ thực hành">
                <Input type="number" value={form.practiceHours} onChange={(e) => set('practiceHours', e.target.value)} />
              </Field>
            </div>
            <Field label="Khoa phụ trách">
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Trạng thái</label>
              <select
                value={form.isActive ? 'active' : 'inactive'}
                onChange={(e) => set('isActive', e.target.value === 'active')}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng sử dụng</option>
              </select>
            </div>
            <div className="col-span-2">
              <Field label="Mô tả">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc')}>
            Quay lại
          </Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
