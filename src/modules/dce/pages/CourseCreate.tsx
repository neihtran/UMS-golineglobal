import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const DEPARTMENTS = ['CNTT', 'Ngoại ngữ', 'Nghiên cứu', 'Kinh doanh', 'Sư phạm', 'Y dược', 'Luật'];
const LEVELS = ['Sơ cấp', 'Trung cấp', 'Cao cấp'];
const FORMATS = ['E-learning', 'Hybrid', 'Workshop', 'Tự học'];
const INSTRUCTORS = ['GS.TS. Nguyễn Hoàng Long', 'PGS.TS. Lê Thị Lan', 'TS. Ngô Thanh Sơn', 'TS. Trần Thị Mai Lan', 'TS. Bùi Đình Nam'];

export default function CourseCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    title: '',
    domain: DEPARTMENTS[0],
    level: LEVELS[0],
    format: FORMATS[0],
    duration: '',
    instructor: INSTRUCTORS[0],
    description: '',
    objectives: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo khóa học mới"
        description="DCE-01 — Tạo khóa đào tạo năng lực số mới"
        breadcrumbs={[
          { label: 'DCE', href: '/dce' },
          { label: 'Khóa đào tạo', href: '/dce/khoa-dao-tao' },
          { label: 'Tạo mới' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dce/khoa-dao-tao')}>
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Mã khóa học" required>
              <Input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="VD: DCE-2026-007" />
            </FormField>
            <FormField label="Tên khóa học" required>
              <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="VD: An toàn thông tin cơ bản" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Lĩnh vực">
              <select
                value={form.domain}
                onChange={(e) => update('domain', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full"
              >
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Cấp độ">
              <select
                value={form.level}
                onChange={(e) => update('level', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full"
              >
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </FormField>
            <FormField label="Hình thức">
              <select
                value={form.format}
                onChange={(e) => update('format', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full"
              >
                {FORMATS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Thời lượng">
              <Input value={form.duration} onChange={(e) => update('duration', e.target.value)} placeholder="VD: 20 tiếng" />
            </FormField>
            <FormField label="Giảng viên phụ trách">
              <select
                value={form.instructor}
                onChange={(e) => update('instructor', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full"
              >
                {INSTRUCTORS.map((ins) => <option key={ins}>{ins}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Mô tả khóa học">
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Mô tả chi tiết nội dung khóa học..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]"
            />
          </FormField>

          <FormField label="Mục tiêu đào tạo">
            <textarea
              value={form.objectives}
              onChange={(e) => update('objectives', e.target.value)}
              placeholder="Mỗi mục tiêu trên 1 dòng..."
              rows={4}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => navigate('/dce/khoa-dao-tao')}>Hủy</Button>
            <Button leftIcon={<Save className="h-4 w-4" />}>Tạo khóa học</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
