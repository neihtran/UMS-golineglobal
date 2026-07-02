import { Fragment, useState } from 'react';
import { Home, CheckCircle2 } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';

const STEPS = ['Thông tin sinh viên', 'Chọn phòng', 'Xác nhận'];

const AVAILABLE_ROOMS = [
  { id: 'A102', block: 'Khu A', floor: 1, capacity: 6, occupied: 5, gender: 'Nam', amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh'], price: 800000 },
  { id: 'A103', block: 'Khu A', floor: 1, capacity: 6, occupied: 4, gender: 'Nam', amenities: ['Wifi', 'Điều hòa'], price: 750000 },
  { id: 'B201', block: 'Khu B', floor: 2, capacity: 8, occupied: 6, gender: 'Nữ', amenities: ['Wifi', 'Điều hòa', 'Máy giặt'], price: 900000 },
  { id: 'C302', block: 'Khu C', floor: 3, capacity: 4, occupied: 3, gender: 'Nam', amenities: ['Wifi', 'Máy giặt', 'Tủ lạnh'], price: 950000 },
];

export default function RoomRegistration() {
  const [step, setStep] = useState(0);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const room = AVAILABLE_ROOMS.find((r) => r.id === selectedRoom);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng ký KTX"
        description="KTX-01 · Sinh viên đăng ký phòng ở Ký túc xá"
        breadcrumbs={[{ label: 'KTX', href: '/ktx' }, { label: 'Đăng ký phòng' }]}
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <Fragment key={s}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                i === step
                  ? 'text-[rgb(var(--primary))] border-b-2 border-[rgb(var(--primary))]'
                  : i < step
                  ? 'text-[rgb(var(--success))] border-b-2 border-[rgb(var(--success))]'
                  : 'text-[rgb(var(--text-muted))] border-b-2 border-transparent'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? 'bg-[rgb(var(--success))] text-white' :
                i === step ? 'bg-[rgb(var(--primary))] text-white' :
                'bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[rgb(var(--border))]" />}
          </Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-5">
              {step === 0 && (
                <div className="space-y-5">
                  <FormField label="Mã sinh viên" required>
                    <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="VD: SV-2022-0001" />
                  </FormField>
                  <FormField label="Họ và tên" required>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn An" />
                  </FormField>
                  <FormField label="Số điện thoại" required>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0912 345 678" />
                  </FormField>
                  <div className="rounded-lg border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--accent)/0.05)] p-3 text-xs text-[rgb(var(--text-secondary))">
                    ℹ️ Chỉ sinh viên chưa có phòng mới được đăng ký. Nếu đã có phòng, vui lòng chuyển phòng thay vì đăng ký mới.
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-[rgb(var(--text-primary))]">Chọn phòng trống</h4>
                  {AVAILABLE_ROOMS.map((r) => {
                    const isSelected = selectedRoom === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRoom(r.id)}
                        className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]'
                            : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary-light))]'
                        }`}
                      >
                        <Home className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-[rgb(var(--text-primary))]">Phòng {r.id}</span>
                            <Badge variant="neutral" size="sm">{r.block} · Tầng {r.floor}</Badge>
                            <Badge variant={r.gender === 'Nam' ? 'info' : 'accent'} size="sm">{r.gender}</Badge>
                          </div>
                          <p className="text-xs text-[rgb(var(--text-muted)]">
                            {r.occupied}/{r.capacity} giường · Còn {r.capacity - r.occupied} chỗ
                          </p>
                          <div className="flex gap-1.5 mt-1.5">
                            {r.amenities.map((a) => (
                              <span key={a} className="rounded border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] text-[rgb(var(--text-muted))">{a}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-[rgb(var(--primary))]">
                            {r.price.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-[10px] text-[rgb(var(--text-muted))">/tháng</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 2 && room && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))]" />
                      <h4 className="font-semibold text-[rgb(var(--text-primary))]">Xác nhận đăng ký</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Sinh viên', value: name || '—' },
                        { label: 'Mã SV', value: studentId || '—' },
                        { label: 'Phòng', value: `Phòng ${room.id} — ${room.block}` },
                        { label: 'Giường', value: `${room.occupied + 1}/${room.capacity}` },
                        { label: 'Giới tính', value: room.gender },
                        { label: 'Giá', value: `${room.price.toLocaleString('vi-VN')}đ/tháng` },
                      ].map(({ label, value }) => (
                        <div key={label} className="border-b border-[rgb(var(--border)/0.4)] pb-2">
                          <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{label}</p>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.05)] p-3 text-xs text-[rgb(var(--text-secondary))">
                    ⚠️ Phí KTX phải được thanh toán trong vòng 7 ngày sau khi xác nhận. Nếu không, đăng ký sẽ tự động bị hủy.
                  </div>
                  <Button fullWidth size="lg" leftIcon={<CheckCircle2 className="h-4 w-4" />}>
                    Xác nhận đăng ký
                  </Button>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-[rgb(var(--border)/0.6)]">
                <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  ← Quay lại
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    onClick={() => setStep((s) => Math.min(2, s + 1))}
                    disabled={step === 0 && (!studentId || !name)}
                  >
                    Tiếp tục →
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">Hướng dẫn</h4>
              {[
                'Điền thông tin sinh viên chính xác',
                'Chọn phòng phù hợp với giới tính',
                'Kiểm tra tiện nghi phòng',
                'Thanh toán phí trong 7 ngày',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--text-secondary))]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                    {i + 1}
                  </span>
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
