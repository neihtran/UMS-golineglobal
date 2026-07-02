import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SEMESTERS = ['HK1/2025-2026', 'HK2/2025-2026', 'HK1/2026-2027'];
const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Khoa Khoa học'];
const INSTRUCTORS = [
  'TS. Nguyễn Văn Minh', 'PGS.TS. Lê Thị Lan', 'ThS. Trần Hoàng Nam',
  'TS. Bùi Minh Tuấn', 'PGS.TS. Đặng Văn Minh', 'TS. Hoàng Thu Lan',
];

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

export default function CourseCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '', name: '', instructor: '', dept: DEPARTMENTS[0],
    semester: SEMESTERS[0], credits: '3', description: '',
    startDate: '', endDate: '', maxStudents: '100',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã khóa học không được để trống';
    if (!form.name.trim()) e.name = 'Tên khóa học không được để trống';
    if (!form.instructor) e.instructor = 'Giảng viên không được để trống';
    if (!form.startDate) e.startDate = 'Ngày bắt đầu không được để trống';
    if (!form.endDate) e.endDate = 'Ngày kết thúc không được để trống';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/lms/khoa-hoc');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo khóa học mới"
        description="LMS-01 — Tạo và xuất bản khóa học mới trên nền tảng LMS"
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Khóa học', href: '/lms/khoa-hoc' },
          { label: 'Tạo mới' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/lms/khoa-hoc')}>Hủy bỏ</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin khóa học</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label="Mã khóa học" required error={errors.code}>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="CS101" error={errors.code} />
            </Field>
            <Field label="Tên khóa học" required error={errors.name}>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nhập tên khóa học" error={errors.name} />
            </Field>
            <div className="col-span-2">
              <Field label="Mô tả khóa học">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  placeholder="Mô tả nội dung, mục tiêu học tập của khóa học..."
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phân công & Thời gian</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label="Giảng viên" required error={errors.instructor}>
              <select
                value={form.instructor}
                onChange={(e) => set('instructor', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                <option value="">-- Chọn giảng viên --</option>
                {INSTRUCTORS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Khoa phụ trách">
              <select
                value={form.dept}
                onChange={(e) => set('dept', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Học kỳ">
                <select
                  value={form.semester}
                  onChange={(e) => set('semester', e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                >
                  {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Số tín chỉ">
                <Input type="number" value={form.credits} onChange={(e) => set('credits', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ngày bắt đầu" required error={errors.startDate}>
                <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} error={errors.startDate} />
              </Field>
              <Field label="Ngày kết thúc" required error={errors.endDate}>
                <Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} error={errors.endDate} />
              </Field>
            </div>
            <Field label="Số SV tối đa">
              <Input type="number" value={form.maxStudents} onChange={(e) => set('maxStudents', e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/lms/khoa-hoc')}>Hủy bỏ</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>Lưu & Xuất bản</Button>
        </div>
      </form>
    </div>
  );
}
