import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Wrench, Clock, CheckCircle2, UserPlus, Wifi, Wind,
  Refrigerator, WashingMachine, Printer, Download, BedDouble,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal, Input, Select } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ROOM_DETAIL = {
  id: 'A102',
  block: 'Khu A',
  floor: 1,
  capacity: 6,
  occupied: 5,
  gender: 'Nam',
  status: 'available',
  price: 800000,
  area: '28m²',
  phone: '028 3812 5102',
  amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh'],
  yearBuilt: 2020,
  lastRenovation: '2024-06',
  students: [
    { id: 's1', code: 'SV2024001', name: 'Nguyễn Văn Minh', dob: '2004-03-15', class: 'CNTT-2024', phone: '0901 234 567', checkIn: '2024-09-01', status: 'active', avatar: 'NVM' },
    { id: 's2', code: 'SV2024002', name: 'Trần Hoàng Nam', dob: '2004-07-22', class: 'CNTT-2024', phone: '0902 345 678', checkIn: '2024-09-01', status: 'active', avatar: 'THN' },
    { id: 's3', code: 'SV2024003', name: 'Lê Đức Anh', dob: '2004-11-08', class: 'CNTT-2024', phone: '0903 456 789', checkIn: '2024-09-01', status: 'active', avatar: 'LDA' },
    { id: 's4', code: 'SV2024004', name: 'Phạm Quang Huy', dob: '2004-05-30', class: 'KT-2024', phone: '0904 567 890', checkIn: '2024-09-01', status: 'active', avatar: 'PQH' },
    { id: 's5', code: 'SV2024005', name: 'Vũ Minh Tuấn', dob: '2004-09-12', class: 'CNTT-2024', phone: '0905 678 901', checkIn: '2024-09-01', status: 'active', avatar: 'VMT' },
  ],
  history: [
    { version: '1.0', time: '2024-09-01 08:00', user: 'Phòng KTX', action: 'Tiếp nhận sinh viên' },
    { version: '2.0', time: '2025-01-15 10:00', user: 'Phòng KTX', action: 'Cập nhật cư dân' },
  ],
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  Wifi: <Wifi className="h-4 w-4" />,
  'Điều hòa': <Wind className="h-4 w-4" />,
  'Tủ lạnh': <Refrigerator className="h-4 w-4" />,
  'Máy giặt': <WashingMachine className="h-4 w-4" />,
};

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export default function RoomDetailPage() {
  const navigate = useNavigate();
  const [addModal, setAddModal] = useState(false);
  const d = ROOM_DETAIL;
  const pct = Math.round((d.occupied / d.capacity) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Phòng ${d.id}`}
        description={`${d.block} · Tầng ${d.floor} · ${d.gender}`}
        breadcrumbs={[
          { label: 'KTX', href: '/ktx' },
          { label: 'Phòng', href: '/ktx/phong' },
          { label: `Phòng ${d.id}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/ktx/phong')}>
              Quay lại
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>In DS cư dân</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Tải file</Button>
            <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setAddModal(true)}>Thêm cư dân</Button>
          </div>
        }
      />

      {/* Status strip */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <Badge variant={pct === 100 ? 'success' : 'warning'} dot size="sm">
          {pct === 100 ? 'Đầy' : `${d.capacity - d.occupied} chỗ trống`}
        </Badge>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          Giới tính: <span className="font-medium text-[rgb(var(--text-secondary))]">{d.gender}</span>
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          Sức chứa: <span className="font-medium text-[rgb(var(--text-secondary))]">{d.capacity} người</span>
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          Diện tích: <span className="font-medium text-[rgb(var(--text-secondary))]">{d.area}</span>
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          Giá: <span className="font-medium text-[rgb(var(--text-secondary))]">{fmt(d.price)}/tháng</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Left: Student list */}
        <div className="space-y-4">
          {/* Room info card */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin phòng</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <BedDouble className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[rgb(var(--text-muted))]">Phòng {d.id}</p>
                  <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mt-0.5">{d.block} · Tầng {d.floor}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                    Sức chứa: {d.capacity} người · Diện tích: {d.area}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">Giới tính:</span>
                  <Badge variant={d.gender === 'Nam' ? 'info' : 'accent'} size="sm">{d.gender}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">Số điện thoại:</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{d.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">Xây dựng:</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{d.yearBuilt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">Sửa chữa gần nhất:</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{d.lastRenovation}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">Tiện nghi:</span>
                  <div className="flex gap-1.5">
                    {d.amenities.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2 py-0.5 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        {AMENITY_ICONS[a] ?? <BedDouble className="h-3 w-3" />} {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cư dân */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cư dân ({d.occupied}/{d.capacity})</h3>
              <Button variant="ghost" size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setAddModal(true)}>Thêm</Button>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border)/0.6)]">
                    {['Cư dân', 'Mã SV', 'Lớp', 'SĐT', 'Ngày vào', 'Trạng thái', ''].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                  {d.students.map((s) => (
                    <tr key={s.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[9px] font-bold text-[rgb(var(--primary))]">
                            {s.avatar}
                          </div>
                          <span className="font-medium text-[rgb(var(--text-primary))]">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono text-[rgb(var(--text-muted))]">{s.code}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{s.class}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{s.phone}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{s.checkIn}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="success" dot size="sm">Đang ở</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm">Chi tiết</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Sự cố / lịch sử */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[rgb(var(--warning))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Sự cố & Bảo trì</h3>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Wrench className="h-3.5 w-3.5" />}>Báo sự cố</Button>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle2 className="h-10 w-10 text-[rgb(var(--success))] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Không có sự cố</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Phòng hoạt động bình thường</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions + Info */}
        <div className="space-y-4">
          {/* Công suất */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Công suất phòng</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-center py-2">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(var(--border))" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={pct === 100 ? 'rgb(var(--success))' : 'rgb(var(--primary))'}
                      strokeWidth="3"
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[rgb(var(--text-primary))]">{pct}%</span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">lấp đầy</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[rgb(var(--text-muted))]">Đang ở</span>
                  <span className="font-bold text-[rgb(var(--success))]">{d.occupied} người</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[rgb(var(--text-muted))]">Còn trống</span>
                  <span className="font-bold text-[rgb(var(--warning))]">{d.capacity - d.occupied} chỗ</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[rgb(var(--text-muted))]">Sức chứa</span>
                  <span className="font-bold text-[rgb(var(--text-primary))]">{d.capacity} người</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hành động */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Hành động</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              <Button className="w-full" size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setAddModal(true)}>Thêm cư dân</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>In DS cư dân</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Tải file đính kèm</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Wrench className="h-3.5 w-3.5" />}>Báo sự cố</Button>
            </CardContent>
          </Card>

          {/* Thông tin */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Thông tin</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'Phòng', value: d.id },
                { label: 'Khu', value: d.block },
                { label: 'Tầng', value: d.floor },
                { label: 'Giới tính', value: d.gender },
                { label: 'Diện tích', value: d.area },
                { label: 'Giá/tháng', value: fmt(d.price) },
                { label: 'Xây dựng', value: d.yearBuilt },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-20 shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary)]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lịch sử */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Lịch sử</h3>
            </div>
            <CardContent className="p-3 space-y-3">
              {d.history.map((h, i) => (
                <div key={i} className="relative pl-5">
                  <div className={`absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'}`} />
                  {i < d.history.length - 1 && <div className="absolute left-2.5 top-5 bottom-0 w-px bg-[rgb(var(--border)/0.5)]" />}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-[rgb(var(--primary))]">v{h.version}</span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">{h.time}</span>
                  </div>
                  <p className="text-xs font-medium text-[rgb(var(--text-primary))]">{h.action}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{h.user}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Thêm cư dân */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Nhận cư dân vào phòng" size="lg">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgb(var(--primary)/0.05)] border border-[rgb(var(--primary)/0.15)]">
            <BedDouble className="h-5 w-5 text-[rgb(var(--primary))] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Phòng {d.id} — {d.block} · {d.gender}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">Còn {d.capacity - d.occupied} chỗ trống · Giá {fmt(d.price)}/tháng</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mã sinh viên" placeholder="VD: SV20240006" />
            <Input label="Họ tên" placeholder="Họ và tên đầy đủ" />
            <Select
              label="Giới tính"
              options={[
                { value: 'Nam', label: 'Nam' },
                { value: 'Nữ', label: 'Nữ' },
              ]}
            />
            <Input label="Ngày sinh" type="date" />
            <Input label="Lớp" placeholder="VD: CNTT-2024" />
            <Input label="Số điện thoại" placeholder="090x xxx xxx" />
          </div>
          <hr className="border-[rgb(var(--border))]" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày nhận phòng" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            <Input label="Hạn ở (ngày kết thúc)" type="date" />
            <div className="col-span-2">
              <Input label="Ghi chú" placeholder="Thông tin bổ sung (nếu có)" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddModal(false)}>Hủy</Button>
            <Button onClick={() => setAddModal(false)}>Xác nhận nhận cư dân</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
