import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const DEPARTMENTS = ['Khoa CNTT', 'Khoa Sư phạm', 'Khoa Ngoại ngữ', 'Khoa Khoa học', 'Khoa Kinh tế', 'Khoa Y dược', 'Khoa Luật'];
const LEVELS = ['Cấp 1', 'Cấp 2', 'Cấp 3', 'Cấp 4'];

export default function CompetencyCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    code: '',
    dept: DEPARTMENTS[0],
    level: LEVELS[0],
    target: '3.5',
    description: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm chuẩn đầu ra mới"
        description="DCE-01 — Tạo chuẩn đầu ra / năng lực mới cho chương trình đào tạo"
        breadcrumbs={[
          { label: 'DCE', href: '/dce' },
          { label: 'Chuẩn đầu ra', href: '/dce/chuan-dau-ra' },
          { label: 'Thêm mới' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dce/chuan-dau-ra')}>
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Mã chuẩn đầu ra" required>
              <Input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="VD: CDIO-1.4" />
            </FormField>
            <FormField label="Tên chuẩn đầu ra" required>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="VD: Thiết kế hệ thống IoT" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Khoa phụ trách">
              <select
                value={form.dept}
                onChange={(e) => update('dept', e.target.value)}
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
            <FormField label="Mục tiêu điểm TB">
              <Input type="number" step="0.1" min="0" max="5" value={form.target} onChange={(e) => update('target', e.target.value)} />
            </FormField>
          </div>

          <FormField label="Mô tả chuẩn đầu ra">
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Mô tả chi tiết chuẩn đầu ra..."
              rows={4}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => navigate('/dce/chuan-dau-ra')}>Hủy</Button>
            <Button leftIcon={<Save className="h-4 w-4" />}>Lưu chuẩn đầu ra</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
