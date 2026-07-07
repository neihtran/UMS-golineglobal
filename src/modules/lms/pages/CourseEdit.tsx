import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

const SEMESTERS = ['HK1/2025-2026', 'HK2/2025-2026', 'HK1/2026-2027'];
const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Khoa Khoa học'];
const INSTRUCTORS = [
  'TS. Nguyễn Văn Minh', 'PGS.TS. Lê Thị Lan', 'ThS. Trần Hoàng Nam',
  'TS. Bùi Minh Tuấn', 'PGS.TS. Đặng Văn Minh', 'TS. Hoàng Thu Lan',
];

const COURSES_MAP: Record<string, {
  code: string;
  name: string;
  instructor: string;
  dept: string;
  description: string;
  startDate: string;
  endDate: string;
  maxStudents: string;
  status: string;
  credits: string;
}> = {
  c1: {
    code: 'CS101', name: 'Nhập môn Lập trình Python',
    instructor: 'TS. Nguyễn Văn Minh', dept: 'Khoa CNTT',
    description: 'Môn học giới thiệu về lập trình Python cho sinh viên năm nhất, bao gồm các khái niệm cơ bản về biến, vòng lặp, hàm, cấu trúc dữ liệu và lập trình hướng đối tượng.',
    startDate: '2026-01-15', endDate: '2026-05-30', maxStudents: '312',
    credits: '4', status: 'published',
  },
  c2: {
    code: 'MATH201', name: 'Giải tích 2',
    instructor: 'PGS.TS. Lê Thị Lan', dept: 'Khoa CNTT',
    description: 'Học phần Giải tích 2 cung cấp kiến thức về tích phân, chuỗi và phương trình vi phân.',
    startDate: '2026-01-15', endDate: '2026-05-30', maxStudents: '280',
    credits: '4', status: 'published',
  },
  c3: {
    code: 'ENG301', name: 'Tiếng Anh Học thuật',
    instructor: 'ThS. Trần Hoàng Nam', dept: 'Khoa Ngoại ngữ',
    description: 'Phát triển kỹ năng đọc, viết và thuyết trình học thuật bằng tiếng Anh.',
    startDate: '2026-01-15', endDate: '2026-05-30', maxStudents: '245',
    credits: '3', status: 'published',
  },
  c4: {
    code: 'PHYS101', name: 'Vật lý Đại cương',
    instructor: 'TS. Bùi Minh Tuấn', dept: 'Khoa Khoa học',
    description: 'Các khái niệm nền tảng về cơ học, nhiệt học và điện từ học.',
    startDate: '2026-01-15', endDate: '2026-05-30', maxStudents: '198',
    credits: '4', status: 'published',
  },
  c5: {
    code: 'CHEM101', name: 'Hóa học Đại cương',
    instructor: 'PGS.TS. Đặng Văn Minh', dept: 'Khoa Khoa học',
    description: 'Khám phá các nguyên lý cơ bản của hóa học: cấu tạo nguyên tử, liên kết hóa học và phản ứng.',
    startDate: '2026-01-15', endDate: '2026-05-30', maxStudents: '165',
    credits: '3', status: 'published',
  },
  c6: {
    code: 'CS201', name: 'Cơ sở dữ liệu',
    instructor: 'TS. Hoàng Thu Lan', dept: 'Khoa CNTT',
    description: 'Học phần Cơ sở dữ liệu cung cấp nền tảng về mô hình quan hệ, SQL và thiết kế CSDL.',
    startDate: '', endDate: '', maxStudents: '120',
    credits: '3', status: 'draft',
  },
};

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

interface CourseEditProps {
  id?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function CourseEdit({ id, onSubmit, onCancel }: CourseEditProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const source = COURSES_MAP[actualId] ?? COURSES_MAP['c1'];
  const [form, setForm] = useState({
    code: source.code,
    name: source.name,
    instructor: source.instructor,
    dept: source.dept,
    semester: 'HK1/2025-2026',
    credits: source.credits,
    description: source.description,
    startDate: source.startDate,
    endDate: source.endDate,
    maxStudents: source.maxStudents,
    status: source.status,
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
    onSubmit?.();
  };

  return (
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
          <Button variant="outline" type="button" onClick={onCancel}>Hủy bỏ</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>Lưu thay đổi</Button>
        </div>
      </form>
  );
}
