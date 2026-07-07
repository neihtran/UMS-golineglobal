import { useState } from 'react';
import { Button, Input } from '@/components/ui';

const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Phòng Tổ chức', 'Phòng Tài chính', 'Phòng Đào tạo'];
const CONTRACT_TYPES = ['Cơ hữu', 'Thỉnh giảng', 'Thử việc'];
const TITLES = ['Giáo sư', 'Phó Giáo sư', 'Tiến sĩ', 'Thạc sĩ', 'Kỹ sư', 'Cử nhân'];
const EDUCATIONS = ['Tiến sĩ', 'Thạc sĩ', 'Đại học', 'Cao đẳng'];

interface VienChucFormProps {
  initialValues?: {
    code?: string; name?: string; dob?: string; cccd?: string; gender?: string; ethnicity?: string;
    address?: string; phone?: string; email?: string; dept?: string; title?: string; position?: string;
    contractType?: string; salary?: string; education?: string; major?: string; school?: string; gradYear?: string;
  };
  onSubmit?: (values: Record<string, string>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function VienChucForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Lưu',
}: VienChucFormProps) {
  const [form, setForm] = useState({
    code: '', name: '', dob: '', cccd: '', gender: 'Nam', ethnicity: 'Kinh', address: '',
    phone: '', email: '', dept: '', title: '', position: '', contractType: 'Cơ hữu',
    salary: '', education: '', major: '', school: '', gradYear: '',
    ...initialValues,
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mã viên chức</label>
          <Input value={form.code} onChange={set('code')} placeholder="VC-2020-001" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Họ tên</label>
          <Input value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ngày sinh</label>
          <Input type="date" value={form.dob} onChange={set('dob')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Giới tính</label>
          <select
            value={form.gender}
            onChange={set('gender')}
            className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
          >
            <option>Nam</option><option>Nữ</option><option>Khác</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Số CCCD</label>
          <Input value={form.cccd} onChange={set('cccd')} placeholder="025 085 001234" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Chức danh</label>
          <select
            value={form.title}
            onChange={set('title')}
            className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
          >
            <option value="">-- Chọn --</option>
            {TITLES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Chức vụ</label>
          <Input value={form.position} onChange={set('position')} placeholder="Trưởng khoa" />
        </div>
        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Đơn vị</label>
          <select
            value={form.dept}
            onChange={set('dept')}
            className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
          >
            <option value="">-- Chọn đơn vị --</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Loại hợp đồng</label>
          <select
            value={form.contractType}
            onChange={set('contractType')}
            className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
          >
            {CONTRACT_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Lương cơ bản (VND)</label>
          <Input type="number" value={form.salary} onChange={set('salary')} placeholder="15000000" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Trình độ</label>
          <select
            value={form.education}
            onChange={set('education')}
            className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
          >
            <option value="">-- Chọn --</option>
            {EDUCATIONS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Chuyên ngành</label>
          <Input value={form.major} onChange={set('major')} placeholder="Khoa học Máy tính" />
        </div>
        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Trường tốt nghiệp</label>
          <Input value={form.school} onChange={set('school')} placeholder="ĐH Bách Khoa TP.HCM" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Điện thoại</label>
          <Input value={form.phone} onChange={set('phone')} placeholder="0912 345 678" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Email</label>
          <Input type="email" value={form.email} onChange={set('email')} placeholder="nguyen.van@truong.edu.vn" />
        </div>
        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Địa chỉ</label>
          <Input value={form.address} onChange={set('address')} placeholder="Số 12, Đường Nguyễn Trãi, Quận 1, TP.HCM" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[rgb(var(--border)/0.6)]">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
