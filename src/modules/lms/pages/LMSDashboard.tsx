import { Link } from 'react-router-dom';
import {
  BookOpen, Users, TrendingUp, Award, Download,
  Star, ArrowRight, BarChart3, CheckCircle2,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const LMS_STATS = [
  { label: 'Tổng khóa học', value: '148', sub: '+12 tháng này', icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
  { label: 'Học viên đang học', value: '4.821', sub: '310 giảng viên', icon: <Users className="h-5 w-5" />, color: 'success' },
  { label: 'Tỷ lệ hoàn thành', value: '68.4%', sub: '+5.2% so với tháng trước', icon: <TrendingUp className="h-5 w-5" />, color: 'accent' },
  { label: 'Điểm TB toàn khóa', value: '7.82', sub: '+0.3 cải thiện', icon: <Award className="h-5 w-5" />, color: 'info' },
];

const TOP_COURSES = [
  { code: 'CS101', name: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', students: 312, completion: 78, rating: 4.8 },
  { code: 'MATH201', name: 'Giải tích 2', instructor: 'PGS.TS. Lê Thị Lan', students: 280, completion: 65, rating: 4.5 },
  { code: 'ENG301', name: 'Tiếng Anh Học thuật', instructor: 'ThS. Trần Hoàng Nam', students: 245, completion: 72, rating: 4.6 },
  { code: 'PHYS101', name: 'Vật lý Đại cương', instructor: 'TS. Bùi Minh Tuấn', students: 198, completion: 58, rating: 4.2 },
  { code: 'CHEM101', name: 'Hóa học Đại cương', instructor: 'PGS.TS. Đặng Văn Minh', students: 165, completion: 81, rating: 4.7 },
];

const COMPLETION_BARS = [
  { name: 'CS101', rate: 78 }, { name: 'MATH201', rate: 65 },
  { name: 'ENG301', rate: 72 }, { name: 'PHYS101', rate: 58 },
  { name: 'CHEM101', rate: 81 }, { name: 'BIO101', rate: 70 },
];

const ACTIVITY_TREND = [
  { week: 'T1', active: 3200 }, { week: 'T2', active: 3450 },
  { week: 'T3', active: 3120 }, { week: 'T4', active: 3800 },
  { week: 'T5', active: 4200 }, { week: 'T6', active: 4100 },
];




export default function LMSDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Dashboard</h1>
          <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">Tổng quan hoạt động học tập toàn hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Xuất báo cáo</Button>
          <Link to="/lms/khoa-hoc/tao">
            <Button size="sm" leftIcon={<BookOpen className="h-3.5 w-3.5" />}>Tạo khóa học</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {LMS_STATS.map((s) => (
          <Card key={s.label} className="hover-lift">
            <CardContent className="p-5 flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide truncate">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))] mt-1">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions — 4 feature cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tạo khóa học', href: '/lms/khoa-hoc/tao', icon: <BookOpen className="h-5 w-5" />, color: 'primary', desc: 'Tạo & xuất bản khóa mới' },
          { label: 'Xem bảng điểm', href: '/lms/bang-diem', icon: <BarChart3 className="h-5 w-5"  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />, color: 'info', desc: 'Xuất & quản lý điểm' },
          { label: 'Nội dung khóa học', href: '/lms/noi-dung-khoa-hoc', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success', desc: 'Học liệu SCORM/xAPI' },
          { label: 'Bài tập SV', href: '/lms/bai-tap-sinh-vien', icon: <Award className="h-5 w-5" />, color: 'accent', desc: 'Phân công & chấm bài' },
        ].map((q) => (
          <Link key={q.label} to={q.href}>
            <Card className="hover:border-[rgb(var(--primary)/0.3)] transition-colors cursor-pointer group">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--${q.color})/0.1)] text-[rgb(var(--${q.color}))] group-hover:scale-110 transition-transform`}>
                  {q.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{q.label}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{q.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Top courses + Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top courses */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Khóa học nổi bật</h3>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Top 5 khóa có lượt đăng ký cao nhất</p>
            </div>
            <Link to="/lms/khoa-hoc" className="flex items-center gap-1 text-xs text-[rgb(var(--primary))] hover:underline shrink-0">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {TOP_COURSES.map((c) => (
              <Link
                key={c.code}
                to={`/lms/khoa-hoc/${c.code.toLowerCase()}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                  {c.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))] truncate">{c.name}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{c.instructor}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-[rgb(var(--text-primary))]">{c.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tỷ lệ hoàn thành theo khóa</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">% học viên hoàn thành 100% nội dung</p>
          </div>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPLETION_BARS} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Hoàn thành']} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {COMPLETION_BARS.map((entry, i) => (
                    <Bar
                      key={i}
                      dataKey="rate"
                      fill={entry.rate >= 70 ? 'rgb(var(--success))' : entry.rate >= 50 ? 'rgb(var(--primary))' : 'rgb(var(--warning))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hoạt động học tập</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Lượt truy cập 6 tuần gần nhất</p>
          </div>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ACTIVITY_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} lượt`, 'Truy cập']} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="active" stroke="rgb(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'rgb(var(--primary))' }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
