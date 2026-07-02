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

export default function CourseEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: 'CS101', name: 'Nhập môn Lập trình Python',
    instructor: 'TS. Nguyễn Văn Minh', dept: 'Khoa CNTT',
    semester: 'HK1/2025-2026', credits: '4', description: 'Môn học giới thiệu về lập trình Python cho sinh viên năm nhất, bao gồm các khái niệm cơ bản về biến, vòng lặp, hàm, cấu trúc dữ liệu và lập trình hướng đối tượng.',
    startDate: '2026-01-15', endDate: '2026-05-30', maxStudents: '312', status: 'published',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Tên khóa học không được để trống';
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
        title={`Chỉnh sửa: ${form.name}`}
        description={`${form.code} — Cập nhật thông tin khóa học`}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Khóa học', href: '/lms/khoa-hoc' },
          { label: form.code },
          { label: 'Chỉnh sửa' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/lms/khoa-hoc')}>Hủy bỏ</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin khóa học</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label="Mã khóa học">
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} disabled className="opacity-60" />
            </Field>
            <Field label="Tên khóa học" required error={errors.name}>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            </Field>
            <div className="col-span-2">
              <Field label="Mô tả khóa học">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
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
            <Field label="Giảng viên">
              <select
                value={form.instructor}
                onChange={(e) => set('instructor', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
              >
                {INSTRUCTORS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Khoa phụ trách">
              <select
                value={form.dept}
                onChange={(e) => set('dept', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
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
              <Field label="Ngày bắt đầu">
                <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </Field>
              <Field label="Ngày kết thúc">
                <Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Số SV tối đa">
                <Input type="number" value={form.maxStudents} onChange={(e) => set('maxStudents', e.target.value)} />
              </Field>
              <Field label="Trạng thái">
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/lms/khoa-hoc')}>Hủy bỏ</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>Lưu thay đổi</Button>
        </div>
      </form>
    </div>
  );
}
