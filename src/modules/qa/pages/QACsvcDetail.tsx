import { useParams } from 'react-router-dom';
import { Download, Edit2, Wrench } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface QACsvcDetailProps {
  id?: string;
}

type Facility = {
  id: string;
  code: string;
  name: string;
  type: string;
  capacity: number;
  currentUsage: number;
  floor: string;
  building: string;
  area: number;
  equipment: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  condition: 'good' | 'fair' | 'needs_repair';
  lastInspected: string;
  nextInspection?: string;
  supervisor?: string;
  supervisorPhone?: string;
  features?: string[];
};

const FACILITIES_MAP: Record<string, Facility> = {
  f001: { id: 'f001', code: 'CSVC-A101', name: 'Phòng học A1-01', type: 'Phòng học', capacity: 60, currentUsage: 58, floor: 'Tầng 1', building: 'Tòa A', area: 90, equipment: 12, status: 'occupied', condition: 'good', lastInspected: '2026-05-10', nextInspection: '2026-11-10', supervisor: 'ThS. Nguyễn Văn Long', supervisorPhone: '0901234567', features: ['Máy chiếu', 'Điều hòa 2 chiều', 'Bảng trắng điện tử', 'Loa phóng thanh', 'WiFi phủ sóng'] },
  f002: { id: 'f002', code: 'CSVC-A102', name: 'Phòng học A1-02', type: 'Phòng học', capacity: 45, currentUsage: 0, floor: 'Tầng 1', building: 'Tòa A', area: 70, equipment: 10, status: 'available', condition: 'good', lastInspected: '2026-05-10' },
  f003: { id: 'f003', code: 'CSVC-A201', name: 'Lab Tin học A2-01', type: 'Phòng máy', capacity: 40, currentUsage: 40, floor: 'Tầng 2', building: 'Tòa A', area: 80, equipment: 42, status: 'occupied', condition: 'good', lastInspected: '2026-04-20' },
  f004: { id: 'f004', code: 'CSVC-A202', name: 'Lab Tin học A2-02', type: 'Phòng máy', capacity: 35, currentUsage: 28, floor: 'Tầng 2', building: 'Tòa A', area: 75, equipment: 38, status: 'occupied', condition: 'fair', lastInspected: '2026-03-15' },
  f005: { id: 'f005', code: 'CSVC-B101', name: 'Hội trường B1', type: 'Hội trường', capacity: 300, currentUsage: 250, floor: 'Tầng 1', building: 'Tòa B', area: 450, equipment: 25, status: 'occupied', condition: 'good', lastInspected: '2026-05-25' },
  f006: { id: 'f006', code: 'CSVC-B102', name: 'Phòng họp B1-02', type: 'Phòng họp', capacity: 20, currentUsage: 0, floor: 'Tầng 1', building: 'Tòa B', area: 40, equipment: 8, status: 'available', condition: 'good', lastInspected: '2026-05-10' },
  f007: { id: 'f007', code: 'CSVC-C101', name: 'Xưởng thực hành Cơ khí', type: 'Xưởng thực hành', capacity: 30, currentUsage: 22, floor: 'Tầng 1', building: 'Tòa C', area: 200, equipment: 18, status: 'occupied', condition: 'needs_repair', lastInspected: '2026-02-28' },
  f008: { id: 'f008', code: 'CSVC-C201', name: 'Phòng Lab Ngoại ngữ C2-01', type: 'Phòng nghe nhìn', capacity: 50, currentUsage: 48, floor: 'Tầng 2', building: 'Tòa C', area: 85, equipment: 55, status: 'occupied', condition: 'good', lastInspected: '2026-05-05' },
  f009: { id: 'f009', code: 'CSVC-C202', name: 'Thư viện Tòa C', type: 'Thư viện', capacity: 200, currentUsage: 85, floor: 'Tầng 2', building: 'Tòa C', area: 380, equipment: 6, status: 'occupied', condition: 'good', lastInspected: '2026-05-15' },
  f010: { id: 'f010', code: 'CSVC-D101', name: 'Sân thể thao đa năng', type: 'Sân thể thao', capacity: 100, currentUsage: 0, floor: 'Sân ngoài', building: 'Khu D', area: 1200, equipment: 15, status: 'reserved', condition: 'fair', lastInspected: '2026-04-01' },
  f011: { id: 'f011', code: 'CSVC-D102', name: 'Phòng gym sinh viên', type: 'Phòng gym', capacity: 50, currentUsage: 35, floor: 'Tầng 1', building: 'Khu D', area: 150, equipment: 20, status: 'occupied', condition: 'good', lastInspected: '2026-05-20' },
  f012: { id: 'f012', code: 'CSVC-A103', name: 'Phòng học A1-03', type: 'Phòng học', capacity: 50, currentUsage: 0, floor: 'Tầng 1', building: 'Tòa A', area: 75, equipment: 10, status: 'maintenance', condition: 'needs_repair', lastInspected: '2026-01-10' },
};

const MAINTENANCE_HISTORY = [
  { date: '2026-05-10', type: 'Kiểm tra định kỳ', cost: 0, result: 'Đạt', note: 'Toàn bộ thiết bị hoạt động bình thường', vendor: 'Phòng CNTT' },
  { date: '2026-03-15', type: 'Bảo trì điều hòa', cost: 1500000, result: 'Hoàn thành', note: 'Vệ sinh, nạp gas điều hòa', vendor: 'Điện lạnh Bách Khoa' },
  { date: '2025-11-10', type: 'Kiểm tra định kỳ', cost: 0, result: 'Đạt', note: 'Đạt tiêu chuẩn sử dụng', vendor: 'Phòng CNTT' },
  { date: '2025-06-20', type: 'Sửa chữa', cost: 3500000, result: 'Hoàn thành', note: 'Thay bóng đèn chiếu sáng 4 bộ', vendor: 'Điện lạnh Bách Khoa' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'accent'; label: string }> = {
  available: { variant: 'success', label: 'Trống' },
  occupied: { variant: 'warning', label: 'Đang sử dụng' },
  maintenance: { variant: 'accent', label: 'Bảo trì' },
  reserved: { variant: 'neutral', label: 'Đặt trước' },
};

const CONDITION_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  good: { variant: 'success', label: 'Tốt' },
  fair: { variant: 'warning', label: 'Khá' },
  needs_repair: { variant: 'error', label: 'Cần sửa chữa' },
};

export default function QACsvcDetail({ id }: QACsvcDetailProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const f = FACILITIES_MAP[actualId] ?? FACILITIES_MAP['f001'];
  const sc = STATUS_CONFIG[f.status];
  const cc = CONDITION_CONFIG[f.condition];
  const occupancy = Math.round((f.currentUsage / f.capacity) * 100);
  const OCCUPANCY_DATA = [
    { name: 'Đã sử dụng', value: f.currentUsage, color: 'rgb(var(--primary))' },
    { name: 'Còn trống', value: f.capacity - f.currentUsage, color: 'rgb(var(--border))' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
        <Button variant="outline" leftIcon={<Wrench className="h-4 w-4" />}>Ghi nhận bảo trì</Button>
        <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />}>Chỉnh sửa</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                <Badge variant="neutral" size="sm">{f.type}</Badge>
                <Badge variant={cc.variant} size="sm">{cc.label}</Badge>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Tòa / Tầng', value: `${f.building} — ${f.floor}` },
                  { label: 'Diện tích', value: `${f.area} m²` },
                  { label: 'Sức chứa', value: `${f.capacity} người` },
                  { label: 'Thiết bị', value: `${f.equipment} thiết bị` },
                  { label: 'Người phụ trách', value: f.supervisor ?? '—' },
                  { label: 'Điện thoại', value: f.supervisorPhone ?? '—' },
                  { label: 'Kiểm tra gần nhất', value: f.lastInspected },
                  { label: 'Kiểm tra tiếp theo', value: f.nextInspection ?? '—' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{item.label}</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-3">
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Tiện ích</p>
            </div>
            <CardContent className="pt-0 space-y-2">
              {(f.features ?? []).map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))]" />
                  <span className="text-sm text-[rgb(var(--text-secondary))]">{feat}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Charts + Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <div className="px-5 pt-5 pb-3">
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Công suất sử dụng</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Ngày cập nhật: hôm nay</p>
              </div>
              <CardContent className="h-48 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart animationDuration={1500} animationEasing="ease-out">
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Pie data={OCCUPANCY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" animationDuration={1500} animationEasing="ease-out">
                      {OCCUPANCY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} người`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute left-0 right-0 flex flex-col items-center" style={{ position: 'relative' }}>
                  <p className="text-3xl font-bold text-[rgb(var(--primary))]">{occupancy}%</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Đang sử dụng</p>
                </div>
              </CardContent>
              <div className="px-5 pb-4 flex justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--primary))]" />
                  <span className="text-xs text-[rgb(var(--text-muted))]">Đã dùng ({f.currentUsage})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--border))]" />
                  <span className="text-xs text-[rgb(var(--text-muted))]">Còn trống ({f.capacity - f.currentUsage})</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="px-5 pt-5 pb-3">
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Thông tin nhanh</p>
              </div>
              <CardContent className="pt-0 space-y-4">
                <div className="text-center border-b border-[rgb(var(--border)/0.4)] pb-3">
                  <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{f.capacity}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Sức chứa tối đa (người)</p>
                </div>
                <div className="text-center border-b border-[rgb(var(--border)/0.4)] pb-3">
                  <p className="text-2xl font-bold text-[rgb(var(--primary))]">{f.equipment}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Thiết bị đang lắp đặt</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[rgb(var(--accent))]">{f.area} m²</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Diện tích sàn</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <div className="px-5 pt-5 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Lịch sử kiểm tra / Bảo trì</h3>
              <Button variant="outline" size="sm" leftIcon={<Wrench className="h-3.5 w-3.5" />}>Ghi nhận bảo trì</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border)/0.6)]">
                    {['Ngày', 'Loại', 'Chi phí', 'Kết quả', 'Ghi chú', 'Đơn vị'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                  {MAINTENANCE_HISTORY.map((log, i) => (
                    <tr key={i} className="hover:bg-[rgb(var(--bg-hover))]">
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.date}</td>
                      <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{log.type}</Badge></td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.cost > 0 ? `${log.cost.toLocaleString('vi-VN')} đ` : '—'}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={log.result === 'Đạt' || log.result === 'Hoàn thành' ? 'success' : 'warning'} size="sm">{log.result}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.note}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.vendor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
