import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Edit, FileText, Calendar, TrendingUp,
  Users, Award, BarChart3,
} from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const REPORT = {
  id: 'r2026',
  title: 'Báo cáo Công tác Đảng Quý II/2026',
  period: 'Quý II/2026',
  createdAt: '15/07/2026',
  creator: 'Phòng Tổ chức — Đảng ủy trường',
  status: 'submitted',
  stats: {
    totalMembers: 128,
    official: 120,
    probation: 8,
    branches: 12,
    meetings: 42,
    studies: 28,
    campaigns: 15,
    kpiScore: 94,
  },
  branchPerformance: [
    { name: 'CNTT', meetings: 12, studies: 8, campaigns: 3 },
    { name: 'Kinh tế', meetings: 10, studies: 6, campaigns: 2 },
    { name: 'Luật', meetings: 8, studies: 5, campaigns: 1 },
    { name: 'Ngoại ngữ', meetings: 9, studies: 7, campaigns: 2 },
    { name: 'Sư phạm', meetings: 11, studies: 6, campaigns: 1 },
    { name: 'Y dược', meetings: 7, studies: 4, campaigns: 1 },
  ],
  kpiHistory: [
    { name: 'Q1-25', score: 88 },
    { name: 'Q2-25', score: 91 },
    { name: 'Q3-25', score: 89 },
    { name: 'Q4-25', score: 93 },
    { name: 'Q1-26', score: 92 },
    { name: 'Q2-26', score: 94 },
  ],
  keyAchievements: [
    '100% chi bộ hoàn thành sinh hoạt định kỳ hàng tháng',
    '28 lớp bồi dưỡng lý luận chính trị cho đảng viên',
    '15 phong trào thi đua yêu nước được tổ chức',
    '8 đảng viên được khen thưởng cấp Bộ, Trường',
    'Hoàn thành xuất sắc nhiệm vụ chính trị năm học',
  ],
  issues: [
    'Chi bộ Khoa Y dược: chưa hoàn thành 1 buổi sinh hoạt',
    '2 đảng viên dự bị chưa hoàn thành thủ tục chính thức',
    'Cần tăng cường hoạt động nghiên cứu khoa học Đảng',
  ],
  upcoming: [
    'Hội nghị tổng kết công tác Đảng 6 tháng đầu năm',
    'Bầu cử chi ủy nhiệm kỳ mới tại 3 chi bộ',
    'Tổ chức thi đua chào mừng ngày thành lập Đảng',
  ],
};

export default function ReportDetailPage() {
  const navigate = useNavigate();
  const r = REPORT;

  return (
    <div className="space-y-6">
      <PageHeader
        title={r.title}
        description={`${r.period} · ${r.createdAt}`}
        breadcrumbs={[
          { label: 'PMS', href: '/pms' },
          { label: 'Báo cáo', href: '/pms/bao-cao' },
          { label: r.period },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/pms/bao-cao')}>
              Quay lại
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>Chỉnh sửa</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Tải PDF</Button>
          </div>
        }
      />

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Đảng viên', value: `${r.stats.totalMembers}`, icon: <Users className="h-5 w-5" />, color: 'primary' },
          { label: 'Chi bộ', value: `${r.stats.branches}`, icon: <BarChart3 className="h-5 w-5" />, color: 'accent' },
          { label: 'Hoạt động', value: `${r.stats.meetings + r.stats.studies + r.stats.campaigns}`, icon: <Calendar className="h-5 w-5" />, color: 'info' },
          { label: 'Điểm KPI', value: `${r.stats.kpiScore}`, icon: <Award className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Left */}
        <div className="space-y-4">
          {/* Hoạt động theo chi bộ */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hoạt động theo chi bộ</h3>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={r.branchPerformance}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="meetings" fill="rgb(var(--error))" name="Sinh hoạt" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="studies" fill="rgb(var(--primary))" name="Học tập" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="campaigns" fill="rgb(var(--success))" name="Phong trào" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Thành tích nổi bật */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[rgb(var(--success))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thành tích nổi bật</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-3">
              {r.keyAchievements.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)] text-[10px] font-bold text-[rgb(var(--success))]">
                    ✓
                  </div>
                  <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{a}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Vấn đề cần lưu ý */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[rgb(var(--warning))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Vấn đề cần lưu ý</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-3">
              {r.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--warning)/0.1)] text-[10px] font-bold text-[rgb(var(--warning))]">
                    !
                  </div>
                  <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{issue}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kế hoạch sắp tới */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Kế hoạch sắp tới</h3>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgb(var(--border)/0.5)]">
                {r.upcoming.map((item, i) => (
                  <div key={i} className="px-5 py-3">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* KPI trend */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[rgb(var(--success))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Xu hướng KPI</h3>
              </div>
            </div>
            <CardContent className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={r.kpiHistory}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="rgb(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Tóm tắt báo cáo</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'Kỳ báo cáo', value: r.period },
                { label: 'Ngày lập', value: r.createdAt },
                { label: 'Người lập', value: 'Phòng Tổ chức' },
                { label: 'Đảng viên', value: `${r.stats.totalMembers} (${r.stats.official} chính thức)` },
                { label: 'Chi bộ', value: `${r.stats.branches} chi bộ` },
                { label: 'Sinh hoạt', value: `${r.stats.meetings} buổi` },
                { label: 'Học tập', value: `${r.stats.studies} lớp` },
                { label: 'Phong trào', value: `${r.stats.campaigns} đợt` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Tải PDF</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>Xuất Word</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>Chỉnh sửa</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
