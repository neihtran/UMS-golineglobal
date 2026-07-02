import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Award,
  Star,
  Download,
} from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const TEACHING_STATS = [
  { label: 'Môn đang dạy', value: '8', sub: 'HK 2/2025-2026', icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
  { label: 'Tổng sinh viên', value: '342', sub: 'Tất cả lớp', icon: <Users className="h-5 w-5" />, color: 'success' },
  { label: 'Nộp bài chờ chấm', value: '47', sub: 'Cần xử lý', icon: <Clock className="h-5 w-5" />, color: 'warning' },
  { label: 'Điểm TB lớp', value: '7.4', sub: '+0.3 kỳ trước', icon: <Award className="h-5 w-5" />, color: 'info' },
];

const MY_COURSES = [
  { code: 'CS101', name: 'Nhập môn Lập trình Python', students: 312, weeks: 15, completedWeeks: 8, pending: 12, rating: 4.7 },
  { code: 'CS201', name: 'Cấu trúc Dữ liệu & Giải thuật', students: 280, weeks: 15, completedWeeks: 8, pending: 8, rating: 4.5 },
  { code: 'CS301', name: 'Lập trình Web', students: 195, weeks: 14, completedWeeks: 6, pending: 15, rating: 4.8 },
  { code: 'CS401', name: 'Trí tuệ Nhân tạo', students: 150, weeks: 14, completedWeeks: 4, pending: 20, rating: 4.6 },
];

const DEADLINES = [
  { course: 'CS101', task: 'Chấm bài tập tuần 7', due: 'Còn 1 ngày', urgent: true },
  { course: 'CS201', task: 'Gửi đề kiểm tra giữa kỳ', due: 'Còn 3 ngày', urgent: true },
  { course: 'CS301', task: 'Nộp điểm quá trình', due: 'Còn 5 ngày', urgent: false },
  { course: 'CS101', task: 'Thảo luận chủ đề 3', due: 'Còn 2 ngày', urgent: true },
  { course: 'CS401', task: 'Chấm bài tập nhóm', due: 'Còn 7 ngày', urgent: false },
];

const SCORE_DIST = [
  { name: 'A+ (≥9.0)', value: 8.2, color: '#16A34A' },
  { name: 'A (8.5–8.9)', value: 15.5, color: '#2D5D8A' },
  { name: 'B+ (8.0–8.4)', value: 22.3, color: '#E8A020' },
  { name: 'B (7.0–7.9)', value: 28.1, color: '#94A3B8' },
  { name: 'C+ (6.5–6.9)', value: 15.8, color: '#F59E0B' },
  { name: 'C (<6.5)', value: 10.1, color: '#DC2626' },
];

export default function LecturerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Giảng viên"
        description="LMS-01 — Quản lý giảng dạy, bài tập, điểm số"
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Giảng viên' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/lms">Về LMS</Link>
          </Button>
        }
      />

      {/* Hero info */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)]">
              <BookOpen className="h-7 w-7 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--text-primary))">
                Học kỳ 2, 2025–2026
              </h2>
              <p className="text-sm text-[rgb(var(--text-secondary))] mt-0.5">
                TS. Nguyễn Văn Minh · {TEACHING_STATS[0].value} môn · {TEACHING_STATS[1].value} sinh viên
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TEACHING_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--text-secondary))]">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* My courses */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))">Môn học của tôi</h3>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Xuất báo cáo</Button>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {MY_COURSES.map((c) => (
              <div key={c.code} className="px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                    {c.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-[rgb(var(--text-muted))]">
                      <span>{c.students} SV</span>
                      <span>·</span>
                      <span>Tuần {c.completedWeeks}/{c.weeks}</span>
                      {c.pending > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[rgb(var(--error))] font-medium">Nộp bài chờ: {c.pending}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                        <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${(c.completedWeeks / c.weeks) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5 inline-block">
                        {Math.round((c.completedWeeks / c.weeks) * 100)}% tiến độ
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{c.rating}</span>
                  </div>
                  <Button size="sm">Vào lớp</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deadlines + Score dist */}
        <div className="space-y-6">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))">Công việc sắp đến hạn</h3>
            </div>
            <CardContent className="divide-y divide-[rgb(var(--border)/0.5)]">
              {DEADLINES.map((d, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    d.urgent ? 'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]' : 'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-muted))]'
                  }`}>
                    {d.course}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[rgb(var(--text-primary))]">{d.task}</p>
                    <p className={`text-xs mt-0.5 ${d.urgent ? 'text-[rgb(var(--error))] font-semibold' : 'text-[rgb(var(--text-muted))]'}`}>
                      {d.due}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))">Phân bố điểm</h3>
            </div>
            <CardContent className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SCORE_DIST}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {SCORE_DIST.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
