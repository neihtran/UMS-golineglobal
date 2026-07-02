import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const TYPES = ['Phòng học', 'Phòng máy', 'Hội trường', 'Phòng họp', 'Xưởng thực hành', 'Phòng nghe nhìn', 'Thư viện', 'Sân thể thao', 'Phòng gym'];
const BUILDINGS = ['Tòa A', 'Tòa B', 'Tòa C', 'Khu D', 'Khu E'];
const FLOORS: Record<string, string[]> = {
  'Tòa A': ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'],
  'Tòa B': ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4'],
  'Tòa C': ['Tầng 1', 'Tầng 2', 'Tầng 3'],
  'Khu D': ['Sân ngoài', 'Tầng 1'],
  'Khu E': ['Tầng 1', 'Tầng 2'],
};

export default function QACsvcCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: TYPES[0],
    building: BUILDINGS[0],
    floor: FLOORS[BUILDINGS[0]][0],
    capacity: '',
    area: '',
    equipment: '',
    status: 'available',
    condition: 'good',
    description: '',
  });

  const update = (key: string, val: string) => setForm((f) => {
    const next = { ...f, [key]: val };
    if (key === 'building') next.floor = FLOORS[val][0];
    return next;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm phòng CSVC mới"
        description="QA-03 — Nhập thông tin cơ sở vật chất cần quản lý"
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'CSVC', href: '/qa/csvc' },
          { label: 'Thêm mới' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/csvc')}>
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Mã phòng / CSVC" required>
              <Input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="VD: CSVC-A101" />
            </FormField>
            <FormField label="Tên phòng" required>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="VD: Phòng học A1-01" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Loại phòng">
              <select value={form.type} onChange={(e) => update('type', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Tòa nhà">
              <select value={form.building} onChange={(e) => update('building', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {BUILDINGS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </FormField>
            <FormField label="Tầng">
              <select value={form.floor} onChange={(e) => update('floor', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {FLOORS[form.building].map((fl) => <option key={fl}>{fl}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Sức chứa (người)" required>
              <Input type="number" min={1} value={form.capacity} onChange={(e) => update('capacity', e.target.value)} placeholder="VD: 60" />
            </FormField>
            <FormField label="Diện tích (m²)" required>
              <Input type="number" min={1} value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="VD: 90" />
            </FormField>
            <FormField label="Số thiết bị">
              <Input type="number" min={0} value={form.equipment} onChange={(e) => update('equipment', e.target.value)} placeholder="VD: 12" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Trạng thái">
              <select value={form.status} onChange={(e) => update('status', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                <option value="available">Trống</option>
                <option value="occupied">Đang sử dụng</option>
                <option value="maintenance">Bảo trì</option>
                <option value="reserved">Đặt trước</option>
              </select>
            </FormField>
            <FormField label="Tình trạng">
              <select value={form.condition} onChange={(e) => update('condition', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                <option value="good">Tốt</option>
                <option value="fair">Khá</option>
                <option value="needs_repair">Cần sửa chữa</option>
              </select>
            </FormField>
          </div>

          <FormField label="Mô tả / Ghi chú">
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              placeholder="Mô tả đặc điểm phòng, trang thiết bị, lưu ý sử dụng..."
              rows={4}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]" />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => navigate('/qa/csvc')}>Hủy</Button>
            <Button leftIcon={<Save className="h-4 w-4" />}>Lưu phòng</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
