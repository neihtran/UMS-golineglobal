import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit2, Wrench } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const ASSET = {
  id: 'ts001',
  code: 'TS-IT-001',
  name: 'Máy tính Dell OptiPlex 7090',
  category: 'Thiết bị CNTT',
  dept: 'Phòng CNTT',
  quantity: 25,
  unit: 'bộ',
  value: 750000000,
  status: 'active',
  depreciation: 45,
  location: 'Tòa A, Tầng 3',
  supplier: 'Công ty TNHH Viễn Thông ABC',
  purchaseDate: '2024-01-15',
  warranty: '2027-01-15',
  assignee: 'Nguyễn Văn Minh',
};

const MAINTENANCE_LOG = [
  { date: '2025-06-10', type: 'Bảo trì định kỳ', cost: 5000000, note: 'Vệ sinh, thay keo tản nhiệt', vendor: 'Công ty ABC' },
  { date: '2025-03-01', type: 'Sửa chữa', cost: 3500000, note: 'Thay nguồn 1 máy', vendor: 'Trung tâm sửa chữa IT' },
  { date: '2024-12-15', type: 'Bảo trì định kỳ', cost: 0, note: 'Cài đặt bản vá Windows', vendor: 'Nội bộ' },
];

const DEPRECIATION_DATA = [
  { year: '2024', bookValue: 750, depreciation: 0 },
  { year: '2025', bookValue: 600, depreciation: 150 },
  { year: '2026', bookValue: 450, depreciation: 150 },
  { year: '2027', bookValue: 300, depreciation: 150 },
  { year: '2028', bookValue: 150, depreciation: 150 },
  { year: '2029', bookValue: 0, depreciation: 150 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  active: { variant: 'success', label: 'Đang sử dụng' },
  maintenance: { variant: 'warning', label: 'Đang bảo trì' },
  broken: { variant: 'error', label: 'Hỏng' },
  disposed: { variant: 'neutral', label: 'Đã thanh lý' },
};

const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export default function QATaiSanDetail() {
  const navigate = useNavigate();

  const asset = ASSET;
  const sc = STATUS_CONFIG[asset.status];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${asset.code} — Chi tiết tài sản`}
        description={asset.name}
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Quản lý Tài sản', href: '/qa/tai-san' },
          { label: asset.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button variant="outline" leftIcon={<Wrench className="h-4 w-4" />} onClick={() => navigate(`/qa/tai-san/${asset.id}/bao-tri`)}>Bảo trì</Button>
            <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/qa/tai-san/${asset.id}/chinh-sua`)}>Chỉnh sửa</Button>
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/tai-san')}>Quay lại</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                <Badge variant="neutral" size="sm">{asset.category}</Badge>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Đơn vị sử dụng', value: asset.dept },
                  { label: 'Vị trí', value: asset.location },
                  { label: 'Ngày mua', value: asset.purchaseDate },
                  { label: 'Hạn bảo hành', value: asset.warranty },
                  { label: 'Người phụ trách', value: asset.assignee },
                  { label: 'Nhà cung cấp', value: asset.supplier },
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
            <CardContent className="p-5 space-y-3">
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Giá trị tài sản</p>
              <div className="text-center">
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{fmt.format(asset.value)}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Nguyên giá</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[rgb(var(--border)/0.5)]">
                <div className="text-center">
                  <p className="text-lg font-bold text-[rgb(var(--primary))]">{fmt.format(asset.value * 0.55)}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">Giá trị còn lại</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[rgb(var(--warning))]">{asset.depreciation}%</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">Khấu hao</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[rgb(var(--text-muted))]">Khấu hao</span>
                  <span className="text-[rgb(var(--primary))]">{fmt.format(asset.value * 0.45)}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                  <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${asset.depreciation}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Charts + Log */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Biểu đồ khấu hao tài sản</h3>
              <Badge variant="info">Đơn vị: triệu VNĐ</Badge>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPRECIATION_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v} triệu`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="bookValue" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name="Giá trị còn lại"  animationDuration={1500} animationEasing="ease-out" />
                  <Bar dataKey="depreciation" fill="rgb(var(--warning))" radius={[4, 4, 0, 0]} name="Khấu hao năm"  animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Lịch sử bảo trì / Sửa chữa</h3>
              <Button variant="outline" size="sm" leftIcon={<Wrench className="h-3.5 w-3.5" />}>Ghi nhận bảo trì</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border)/0.6)]">
                    {['Ngày', 'Loại', 'Chi phí', 'Ghi chú', 'Đơn vị thực hiện'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                  {MAINTENANCE_LOG.map((log, i) => (
                    <tr key={i} className="hover:bg-[rgb(var(--bg-hover))]">
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.date}</td>
                      <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{log.type}</Badge></td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.cost > 0 ? fmt.format(log.cost) : '—'}</td>
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
