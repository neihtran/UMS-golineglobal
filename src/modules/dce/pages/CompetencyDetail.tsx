import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const STANDARDS = [
  { id: 's1', code: 'CDIO-1.1', name: 'Thiết kế hệ thống phần mềm', dept: 'Khoa CNTT', level: 'Cấp 4', target: 3.8, avgScore: 3.72, n: 124, lastAssess: '2026-05-15', status: 'active' },
  { id: 's2', code: 'CDIO-2.1', name: 'Kỹ năng giao tiếp và làm việc nhóm', dept: 'Khoa Sư phạm', level: 'Cấp 3', target: 3.5, avgScore: 3.38, n: 98, lastAssess: '2026-05-20', status: 'active' },
  { id: 's3', code: 'CDIO-3.1', name: 'Tư duy phản biện và giải quyết vấn đề', dept: 'Khoa CNTT', level: 'Cấp 4', target: 3.6, avgScore: 3.25, n: 110, lastAssess: '2026-06-01', status: 'review' },
  { id: 's4', code: 'CDIO-3.2', name: 'Sử dụng ngoại ngữ chuyên ngành', dept: 'Khoa Ngoại ngữ', level: 'Cấp 3', target: 3.5, avgScore: 2.91, n: 86, lastAssess: '2026-04-10', status: 'warning' },
  { id: 's5', code: 'CDIO-4.1', name: 'Ứng dụng CNTT trong chuyên môn', dept: 'Khoa CNTT', level: 'Cấp 4', target: 4.0, avgScore: 3.60, n: 140, lastAssess: '2026-05-28', status: 'active' },
  { id: 's6', code: 'CDIO-2.2', name: 'Kỹ năng nghiên cứu khoa học', dept: 'Khoa Khoa học', level: 'Cấp 3', target: 3.2, avgScore: 2.75, n: 65, lastAssess: '2026-03-22', status: 'warning' },
  { id: 's7', code: 'CDIO-1.2', name: 'Phân tích và thiết kế cơ sở dữ liệu', dept: 'Khoa CNTT', level: 'Cấp 4', target: 3.7, avgScore: 3.65, n: 132, lastAssess: '2026-06-05', status: 'active' },
  { id: 's8', code: 'CDIO-4.2', name: 'Kỹ năng thuyết trình và truyền thông', dept: 'Khoa Kinh tế', level: 'Cấp 3', target: 3.4, avgScore: 3.41, n: 88, lastAssess: '2026-04-30', status: 'active' },
  { id: 's9', code: 'CDIO-1.3', name: 'Kiến thức nền tảng toán học', dept: 'Khoa CNTT', level: 'Cấp 3', target: 3.3, avgScore: 3.18, n: 95, lastAssess: '2026-05-10', status: 'active' },
  { id: 's10', code: 'CDIO-3.3', name: 'Kỹ năng quản lý dự án', dept: 'Khoa Kinh tế', level: 'Cấp 4', target: 3.6, avgScore: 3.22, n: 72, lastAssess: '2026-02-28', status: 'review' },
];

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Đạt chuẩn' },
  review: { variant: 'warning' as const, label: 'Đang xem xét' },
  warning: { variant: 'error' as const, label: 'Chưa đạt' },
};

const SCORE_HISTORY = [
  { ky: 'HK1/2024-2025', score: 3.45 },
  { ky: 'HK2/2024-2025', score: 3.52 },
  { ky: 'HK1/2025-2026', score: 3.58 },
  { ky: 'HK2/2025-2026', score: 3.72 },
];

const RELATED_STANDARDS = [
  { id: 's10', code: 'CDIO-3.3', name: 'Kỹ năng quản lý dự án', dept: 'Khoa Kinh tế' },
  { id: 's5', code: 'CDIO-4.1', name: 'Ứng dụng CNTT trong chuyên môn', dept: 'Khoa CNTT' },
];

export default function CompetencyDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const s = STANDARDS.find((x) => x.id === id);
  const sc = s ? STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] : null;

  if (!s) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold text-[rgb(var(--text-primary))]">Không tìm thấy chuẩn đầu ra</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dce/chuan-dau-ra')}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chi tiết: ${s.code}`}
        description={s.name}
        breadcrumbs={[
          { label: 'DCE', href: '/dce' },
          { label: 'Chuẩn đầu ra', href: '/dce/chuan-dau-ra' },
          { label: s.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button variant="outline" leftIcon={<Edit3 className="h-4 w-4" />}>Chỉnh sửa</Button>
            <Button variant="outline" leftIcon={<Trash2 className="h-4 w-4" />}>Xóa</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={sc?.variant} dot size="sm">{sc?.label}</Badge>
            <Badge variant="neutral" size="sm">{s.level}</Badge>
            <span className="text-xs text-[rgb(var(--text-muted))]">Mã: {s.code}</span>
            <span className="text-xs text-[rgb(var(--text-muted))]">Khoa: {s.dept}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Mục tiêu', value: s.target.toFixed(1) },
              { label: 'Điểm TB', value: s.avgScore.toFixed(2) },
              { label: 'Mẫu số', value: s.n.toString() },
              { label: 'Đánh giá gần nhất', value: s.lastAssess },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{item.label}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-2">Lịch sử điểm qua các kỳ</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_HISTORY} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <XAxis dataKey="ky" tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)}/5`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="score" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name="Điểm TB"  animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {RELATED_STANDARDS.length > 0 && (
            <div>
              <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-2">Chuẩn đầu ra liên quan</p>
              <div className="flex flex-wrap gap-2">
                {RELATED_STANDARDS.map((r) => (
                  <Button key={r.id} variant="outline" size="sm" onClick={() => navigate(`/dce/chuan-dau-ra/${r.id}`)}>
                    {r.code}: {r.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dce/chuan-dau-ra')}>
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
