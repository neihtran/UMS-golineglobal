import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const CATEGORIES = ['Thiết bị CNTT', 'Thiết bị nghe nhìn', 'Nội thất', 'Phương tiện', 'Thiết bị chuyên ngành', 'Thiết bị y tế', 'Khác'];
const DEPARTMENTS = ['Phòng CNTT', 'Khoa CNTT', 'Khoa Kinh tế', 'Khoa Ngoại ngữ', 'Khoa Cơ khí', 'Phòng Hành chính', 'Ban Giám hiệu', 'Khoa Vật lý'];
const UNITS = ['bộ', 'máy', 'cái', 'chiếc', 'hệ thống', 'bộ'];

export default function QATaiSanCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: CATEGORIES[0],
    dept: DEPARTMENTS[0],
    quantity: '',
    unit: UNITS[0],
    value: '',
    supplier: '',
    purchaseDate: '',
    location: '',
    status: 'active',
    description: '',
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm tài sản mới"
        description="QA-02 — Nhập thông tin tài sản cần theo dõi"
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Quản lý Tài sản', href: '/qa/tai-san' },
          { label: 'Thêm mới' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/tai-san')}>
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Mã tài sản" required>
              <Input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="VD: TS-IT-004" />
            </FormField>
            <FormField label="Tên tài sản" required>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="VD: Máy tính Dell OptiPlex 7090" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Loại tài sản">
              <select value={form.category} onChange={(e) => update('category', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Đơn vị sử dụng">
              <select value={form.dept} onChange={(e) => update('dept', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select value={form.status} onChange={(e) => update('status', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                <option value="active">Đang sử dụng</option>
                <option value="maintenance">Đang bảo trì</option>
                <option value="broken">Hỏng</option>
                <option value="disposed">Đã thanh lý</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Số lượng" required>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => update('quantity', e.target.value)} placeholder="VD: 10" />
            </FormField>
            <FormField label="Đơn vị">
              <select value={form.unit} onChange={(e) => update('unit', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </FormField>
            <FormField label="Giá trị (VNĐ)" required>
              <Input type="number" min={0} value={form.value} onChange={(e) => update('value', e.target.value)} placeholder="VD: 50000000" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nhà cung cấp">
              <Input value={form.supplier} onChange={(e) => update('supplier', e.target.value)} placeholder="VD: Công ty TNHH Viễn Thông ABC" />
            </FormField>
            <FormField label="Ngày mua">
              <Input type="date" value={form.purchaseDate} onChange={(e) => update('purchaseDate', e.target.value)} />
            </FormField>
          </div>

          <FormField label="Vị trí / Ghi chú">
            <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="VD: Tòa A, Tầng 3, Phòng 301" />
          </FormField>

          <FormField label="Mô tả thêm">
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              placeholder="Mô tả chi tiết tài sản, tình trạng, thông số kỹ thuật..."
              rows={4}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]" />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => navigate('/qa/tai-san')}>Hủy</Button>
            <Button leftIcon={<Save className="h-4 w-4" />}>Lưu tài sản</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
