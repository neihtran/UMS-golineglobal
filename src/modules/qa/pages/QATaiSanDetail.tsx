import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Edit2, Wrench, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Badge, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/qa.service';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  active: { variant: 'success', label: 'Đang sử dụng' },
  maintenance: { variant: 'warning', label: 'Đang bảo trì' },
  broken: { variant: 'error', label: 'Hỏng' },
  disposed: { variant: 'neutral', label: 'Đã thanh lý' },
};

const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export default function QATaiSanDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [maintenance, setMaintenance] = useState<any[]>([]);

  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ['qa-asset', id],
    queryFn: () => assetService.get(id!).then((r: any) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: depData, isLoading: depLoading } = useQuery({
    queryKey: ['qa-asset', id, 'depreciation'],
    queryFn: () => assetService.getDepreciation(id!).then((r: any) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: maintenanceData } = useQuery({
    queryKey: ['qa-asset', id, 'maintenance'],
    queryFn: () => assetService.getMaintenance(id!).then((r: any) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (maintenanceData?.data) {
      setMaintenance(maintenanceData.data);
    }
  }, [maintenanceData]);

  const asset = assetData;
  const sc = asset ? STATUS_CONFIG[asset.status] : undefined;

  if (assetLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết tài sản" breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: 'Quản lý Tài sản' }]} />
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <PageHeader title="Không tìm thấy" breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: 'Quản lý Tài sản' }]} />
        <div className="flex items-center justify-center h-64">
          <p className="text-[rgb(var(--text-muted))]">Không tìm thấy tài sản này.</p>
        </div>
      </div>
    );
  }

  const depreciationRows = depData?.years ?? [];

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
                {sc && <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>}
                <Badge variant="neutral" size="sm">{asset.category}</Badge>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Đơn vị sử dụng', value: asset.departmentName ?? '—' },
                  { label: 'Vị trí', value: asset.location },
                  { label: 'Ngày mua', value: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('vi-VN') : '—' },
                  { label: 'Hạn bảo hành', value: asset.warranty ? new Date(asset.warranty).toLocaleDateString('vi-VN') : '—' },
                  { label: 'Người phụ trách', value: asset.assignee ?? '—' },
                  { label: 'Nhà cung cấp', value: asset.supplier ?? '—' },
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
                  <p className="text-lg font-bold text-[rgb(var(--primary))]">
                    {fmt.format(depData ? asset.value - depreciationRows[0]?.depreciation * depreciationRows.length : asset.value)}
                  </p>
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
                  <span className="text-[rgb(var(--primary))]">{fmt.format(asset.value * asset.depreciation / 100)}</span>
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
              {depLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--text-muted))]" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={depreciationRows.map((d: { bookValue: number; depreciation: number; year: number }) => ({ ...d, bookValueM: d.bookValue / 1_000_000, depreciationM: d.depreciation / 1_000_000 }))} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('vi-VN')} triệu`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="bookValueM" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name="Giá trị còn lại" />
                    <Bar dataKey="depreciationM" fill="rgb(var(--warning))" radius={[4, 4, 0, 0]} name="Khấu hao năm" />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
                  {maintenance.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có lịch sử bảo trì</td></tr>
                  ) : (
                    maintenance.map((log, i) => (
                      <tr key={i} className="hover:bg-[rgb(var(--bg-hover))]">
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.date ? new Date(log.date).toLocaleDateString('vi-VN') : '—'}</td>
                        <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{log.type}</Badge></td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.cost > 0 ? fmt.format(log.cost) : '—'}</td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.note}</td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{log.vendor}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
