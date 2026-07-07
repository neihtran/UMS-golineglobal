import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Edit2, Wrench } from 'lucide-react';
import { Card, CardContent, Button, Badge, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { facilityService } from '@/services/qa.service';

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

const PIE_COLORS = ['rgb(var(--primary))', 'rgb(var(--border))'];

export default function QACsvcDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [occupancyPct, setOccupancyPct] = useState(0);

  const { data: facilityData, isLoading } = useQuery({
    queryKey: ['qa-facility', id],
    queryFn: () => facilityService.get(id!).then((r: any) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const f = facilityData;

  useEffect(() => {
    if (f) {
      setOccupancyPct(f.capacity > 0 ? Math.round((f.currentUsage / f.capacity) * 100) : 0);
    }
  }, [f]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết CSVC" breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: 'CSVC' }]} />
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!f) {
    return (
      <div className="space-y-6">
        <PageHeader title="Không tìm thấy" breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: 'CSVC' }]} />
        <div className="flex items-center justify-center h-64">
          <p className="text-[rgb(var(--text-muted))]">Không tìm thấy cơ sở vật chất này.</p>
        </div>
      </div>
    );
  }

  const sc = STATUS_CONFIG[f.status];
  const cc = CONDITION_CONFIG[f.condition];
  const occupancyData = [
    { name: 'Đã sử dụng', value: f.currentUsage, color: PIE_COLORS[0] },
    { name: 'Còn trống', value: Math.max(0, f.capacity - f.currentUsage), color: PIE_COLORS[1] },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${f.code} — Chi tiết CSVC`}
        description={f.name}
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'CSVC', href: '/qa/csvc' },
          { label: f.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button variant="outline" leftIcon={<Wrench className="h-4 w-4" />}>Ghi nhận bảo trì</Button>
            <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate('/qa/csvc')}>Chỉnh sửa</Button>
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/csvc')}>Quay lại</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {sc && <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>}
                <Badge variant="neutral" size="sm">{f.type}</Badge>
                {cc && <Badge variant={cc.variant} size="sm">{cc.label}</Badge>}
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Tòa / Tầng', value: `${f.building} — ${f.floor}` },
                  { label: 'Diện tích', value: `${f.area} m²` },
                  { label: 'Sức chứa', value: `${f.capacity} người` },
                  { label: 'Thiết bị', value: `${f.equipment} thiết bị` },
                  { label: 'Người phụ trách', value: f.supervisor },
                  { label: 'Điện thoại', value: f.supervisorPhone },
                  { label: 'Kiểm tra gần nhất', value: f.lastInspected ? new Date(f.lastInspected).toLocaleDateString('vi-VN') : '—' },
                  { label: 'Kiểm tra tiếp theo', value: f.nextInspection ? new Date(f.nextInspection).toLocaleDateString('vi-VN') : '—' },
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
              {(f.features ?? []).map((feat: string) => (
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
                <p className="text-xs text-[rgb(var(--text-muted))]">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>
              <CardContent className="h-48 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} người`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute left-0 right-0 flex flex-col items-center" style={{ position: 'relative' }}>
                  <p className="text-3xl font-bold text-[rgb(var(--primary))]">{occupancyPct}%</p>
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
                  <span className="text-xs text-[rgb(var(--text-muted))]">Còn trống ({Math.max(0, f.capacity - f.currentUsage)})</span>
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
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-[rgb(var(--text-muted))]">
                      Chưa có lịch sử bảo trì (API /qa/facilities/:id/maintenance cần triển khai riêng)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
