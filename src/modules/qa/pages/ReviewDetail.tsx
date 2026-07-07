import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Plus, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const REVIEWS = [
  { id: 'r1', code: 'KD2026001', name: 'Kiểm định chương trình CNTT', type: 'Kiểm định CTĐT', standard: 'AUN-QA', status: 'in-progress', deadline: '2026-09-30', progress: 65, description: 'Kiểm định chương trình đào tạo CNTT theo tiêu chuẩn AUN-QA gồm 11 tiêu chuẩn.' },
  { id: 'r2', code: 'KD2025003', name: 'Đánh giá nội bộ hệ thống quản lý', type: 'Đánh giá nội bộ', standard: 'ISO 9001', status: 'in-progress', deadline: '2026-08-15', progress: 40, description: 'Đánh giá nội bộ Hệ thống quản lý chất lượng theo ISO 9001:2015.' },
  { id: 'r3', code: 'KD2024001', name: 'Kiểm định chương trình Kế toán', type: 'Kiểm định CTĐT', standard: 'AUN-QA', status: 'completed', deadline: '2025-12-31', progress: 100, description: 'Đã hoàn thành kiểm định CTĐT Kế toán.' },
  { id: 'r4', code: 'KD2026002', name: 'Cập nhật hồ sơ kiểm định Vật lý', type: 'Cập nhật HS', standard: 'AUN-QA', status: 'pending', deadline: '2026-12-31', progress: 10, description: 'Cập nhật hồ sơ minh chứng cho CTĐT Vật lý.' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  completed: { variant: 'success', label: 'Hoàn thành' },
  'in-progress': { variant: 'warning', label: 'Đang thực hiện' },
  pending: { variant: 'neutral', label: 'Chưa bắt đầu' },
};

const PROGRESS_DATA = [
  { tieu_chuan: 'TC1: Mục tiêu', score: 80 },
  { tieu_chuan: 'TC2: CTĐT', score: 65 },
  { tieu_chuan: 'TC3: Người học', score: 70 },
  { tieu_chuan: 'TC4: GV', score: 55 },
  { tieu_chuan: 'TC5: Hỗ trợ', score: 60 },
  { tieu_chuan: 'TC6: Kết quả', score: 75 },
];

export default function ReviewDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const r = REVIEWS.find((x) => x.id === id);
  const sc = r ? STATUS_CONFIG[r.status] : null;

  if (!r) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold text-[rgb(var(--text-primary))]">Không tìm thấy hoạt động kiểm định</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/qa/kiem-dinh')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${r.code} — Chi tiết`}
        description={r.name}
        breadcrumbs={[
          { label: 'QA', href: '/qa' },
          { label: 'Kiểm định chất lượng', href: '/qa/kiem-dinh' },
          { label: r.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button variant="outline" leftIcon={<CheckCircle2 className="h-4 w-4" />}>Cập nhật tiến độ</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`/qa/kiem-dinh/${id}/minh-chung`)}>Minh chứng</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={sc?.variant} dot size="sm">{sc?.label}</Badge>
            <Badge variant="neutral" size="sm">{r.type}</Badge>
            <Badge variant="accent" size="sm">{r.standard}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {[
              { label: 'Hạn chót', value: r.deadline },
              { label: 'Tiến độ', value: `${r.progress}%` },
              { label: 'Người phụ trách', value: 'Chưa phân công' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{item.label}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{r.description}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-2">Tiến độ theo tiêu chuẩn</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PROGRESS_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <XAxis dataKey="tieu_chuan" tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="score" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name="Hoàn thành %"  animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/qa/kiem-dinh')}>
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
