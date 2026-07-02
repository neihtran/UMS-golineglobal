import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const PROGRAMS = ['Công nghệ thông tin', 'Kinh tế', 'Luật', 'Sư phạm', 'Ngoại ngữ', 'Toàn trường'];
const STANDARDS = ['AUN-QA (6 tiêu chuẩn)', 'AUN-QA (11 tiêu chuẩn)', 'ISO 9001:2015', 'Bộ GD&ĐT'];
const DEPTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Phòng Khảo đảm bảo CL', 'Phòng Hành chính'];

export default function ReportCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    title: '',
    program: PROGRAMS[0],
    standard: STANDARDS[0],
    dept: DEPTS[0],
    dueDate: '',
    description: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo báo cáo chất lượng mới"
        description="QA-01 — Tạo báo cáo kiểm định / tự đánh giá mới"
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Báo cáo chất lượng', href: '/qa/bao-cao' },
          { label: 'Tạo mới' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/bao-cao')}>
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Mã báo cáo" required>
              <Input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="VD: AUN-2026-03" />
            </FormField>
            <FormField label="Tên báo cáo" required>
              <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="VD: Báo cáo tự đánh giá AUN-QA" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Chương trình / Đơn vị">
              <select value={form.program} onChange={(e) => update('program', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Tiêu chuẩn">
              <select value={form.standard} onChange={(e) => update('standard', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {STANDARDS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Đơn vị phụ trách">
              <select value={form.dept} onChange={(e) => update('dept', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Hạn nộp">
              <Input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
            </FormField>
            <FormField label="Người phụ trách">
              <Input value="" onChange={() => {}} placeholder="Chọn người phụ trách..." />
            </FormField>
          </div>

          <FormField label="Mô tả báo cáo">
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              placeholder="Mô tả mục đích, phạm vi báo cáo..." rows={4}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]" />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => navigate('/qa/bao-cao')}>Hủy</Button>
            <Button leftIcon={<Save className="h-4 w-4" />}>Tạo báo cáo</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
