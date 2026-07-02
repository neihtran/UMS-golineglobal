import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const ASSET = {
  id: 'ts001',
  code: 'TS-IT-001',
  name: 'Máy tính Dell OptiPlex 7090',
  dept: 'Phòng CNTT',
  location: 'Tòa A, Tầng 3',
};

const TYPES = ['Bảo trì định kỳ', 'Sửa chữa', 'Kiểm tra', 'Thay thế linh kiện', 'Nâng cấp'];
const VENDORS = ['Nội bộ', 'Công ty TNHH Viễn Thông ABC', 'Trung tâm sửa chữa IT', 'Dell Việt Nam'];

export default function QATaiSanMaintenance() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    assetCode: ASSET.code,
    type: TYPES[0],
    date: '',
    cost: '',
    duration: '',
    vendor: VENDORS[0],
    technician: '',
    phone: '',
    description: '',
    nextMaintenance: '',
    result: 'completed',
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ghi nhận bảo trì tài sản"
        description="QA-02 — Tạo phiếu bảo trì / sửa chữa"
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Quản lý Tài sản', href: '/qa/tai-san' },
          { label: ASSET.code, href: `/qa/tai-san/${ASSET.id}` },
          { label: 'Bảo trì' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/qa/tai-san/${ASSET.id}`)}>
            Quay lại
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide">Thông tin bảo trì</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Mã tài sản">
                  <Input value={form.assetCode} onChange={(e) => update('assetCode', e.target.value)} />
                </FormField>
                <FormField label="Loại bảo trì">
                  <select value={form.type} onChange={(e) => update('type', e.target.value)}
                    className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Ngày thực hiện" required>
                  <Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
                </FormField>
                <FormField label="Thời gian thực hiện (giờ)">
                  <Input type="number" min={0} value={form.duration} onChange={(e) => update('duration', e.target.value)} placeholder="VD: 4" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Chi phí (VNĐ)">
                  <Input type="number" min={0} value={form.cost} onChange={(e) => update('cost', e.target.value)} placeholder="0 = miễn phí" />
                </FormField>
                <FormField label="Kết quả">
                  <select value={form.result} onChange={(e) => update('result', e.target.value)}
                    className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                    <option value="completed">Hoàn thành</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="pending">Chờ phụ tùng</option>
                    <option value="failed">Không thể sửa</option>
                  </select>
                </FormField>
              </div>

              <h3 className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide pt-2 border-t border-[rgb(var(--border)/0.4)]">Đơn vị thực hiện</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField label="Đơn vị / Người thực hiện">
                  <select value={form.vendor} onChange={(e) => update('vendor', e.target.value)}
                    className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                    {VENDORS.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </FormField>
                <FormField label="Kỹ thuật viên">
                  <Input value={form.technician} onChange={(e) => update('technician', e.target.value)} placeholder="VD: Trần Văn An" />
                </FormField>
                <FormField label="Số điện thoại">
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="VD: 0901234567" />
                </FormField>
              </div>

              <FormField label="Mô tả công việc">
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                  placeholder="Mô tả chi tiết công việc bảo trì, thay thế, kết quả kiểm tra..."
                  rows={4}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]" />
              </FormField>

              <FormField label="Lần bảo trì tiếp theo (dự kiến)">
                <Input type="date" value={form.nextMaintenance} onChange={(e) => update('nextMaintenance', e.target.value)} />
              </FormField>

              <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                <Button variant="outline" onClick={() => navigate(`/qa/tai-san/${ASSET.id}`)}>Hủy</Button>
                <Button leftIcon={<Save className="h-4 w-4" />} onClick={() => navigate(`/qa/tai-san/${ASSET.id}`)}>Lưu phiếu bảo trì</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs font-semibold uppercase text-[rgb(var(--text-muted))]">Tài sản được bảo trì</p>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{ASSET.name}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{ASSET.code}</p>
                </div>
              </div>
              <div className="space-y-1 pt-2 border-t border-[rgb(var(--border)/0.4)]">
                <div>
                  <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">Đơn vị</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{ASSET.dept}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">Vị trí</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{ASSET.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs font-semibold uppercase text-[rgb(var(--text-muted))]">Hướng dẫn</p>
              <ul className="space-y-2 text-xs text-[rgb(var(--text-secondary))]">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))] mt-1 shrink-0" />
                  Điền đầy đủ thông tin phiếu bảo trì
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))] mt-1 shrink-0" />
                  Lưu chi phí thực tế phát sinh
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))] mt-1 shrink-0" />
                  Cập nhật trạng thái tài sản nếu cần
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))] mt-1 shrink-0" />
                  Đặt lịch bảo trì tiếp theo
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
