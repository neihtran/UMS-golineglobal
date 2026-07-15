import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  GraduationCap, BookOpen, ClipboardList,
  CalendarDays, DollarSign, Award,
  Bell, Clock, CheckCircle2,
  Activity, AlertTriangle,
  FileText, BarChart3,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { ROLE_LABELS } from '@/constants/modules';

// ─── Shared chart styles ────────────────────────────────────────────────────
const CHART_TOOLTIP_STYLE = {
  background: 'rgb(var(--bg-card))',
  border: '1px solid rgb(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'rgb(var(--text-primary))',
};

// ─── Stats ──────────────────────────────────────────────────────────────
const SV_STATS = [
  { label: 'Học phần đã đăng ký', value: '6', change: 'HK2 2026-2027', changeType: 'up', icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
  { label: 'Tín chỉ tích lũy', value: '98', change: 'cần 132 tín chỉ', changeType: 'up', icon: <Award className="h-5 w-5" />, color: 'info' },
  { label: 'GPA hiện tại', value: '3.25', change: '+0.1 vs HK trước', changeType: 'up', icon: <BarChart3 className="h-5 w-5" />, color: 'success' },
  { label: 'Bài tập chưa nộp', value: '3', change: '2 sắp hết hạn', changeType: 'warn', icon: <ClipboardList className="h-5 w-5" />, color: 'warning' },
  { label: 'Học phí còn nợ', value: '4.5M', change: 'đóng trước 15/07', changeType: 'warn', icon: <DollarSign className="h-5 w-5" />, color: 'error' },
  { label: 'Thông báo mới', value: '5', change: '2 chưa đọc', changeType: 'warn', icon: <Bell className="h-5 w-5" />, color: 'warning' },
];

// ─── Quick Actions ──────────────────────────────────────────────────────
const SV_QUICK_ACTIONS = [
  { label: 'Học phần', route: '/portal/dkHP', icon: <BookOpen className="h-5 w-5" />, color: 'primary', sub: 'Đăng ký học phần' },
  { label: 'Lịch học', route: '/portal/lich-hoc', icon: <CalendarDays className="h-5 w-5" />, color: 'info', sub: 'Xem lịch học tuần' },
  { label: 'Bài tập', route: '/lms/bai-tap-cua-toi', icon: <ClipboardList className="h-5 w-5" />, color: 'warning', sub: 'Nộp bài tập' },
  { label: 'Điểm thi', route: '/portal/diem-thi', icon: <Award className="h-5 w-5" />, color: 'success', sub: 'Tra cứu điểm' },
  { label: 'Học phí', route: '/portal/hoc-phi', icon: <DollarSign className="h-5 w-5" />, color: 'accent', sub: 'Tình trạng học phí' },
  { label: 'Lịch thi', route: '/portal/lich-thi', icon: <FileText className="h-5 w-5" />, color: 'warning', sub: 'Xem lịch thi' },
];

// ─── Charts Data ──────────────────────────────────────────────────────
const GPA_TREND = [
  { hk: 'HK1 2024-2025', gpa: 3.05 },
  { hk: 'HK2 2024-2025', gpa: 3.15 },
  { hk: 'HK1 2025-2026', gpa: 3.15 },
  { hk: 'HK2 2025-2026', gpa: 3.25 },
];

const SUBJECT_SCORES = [
  { mon: 'LT Web', diem: 8.5, tb: 7.8 },
  { mon: 'CSDL', diem: 9.0, tb: 7.5 },
  { mon: 'Mạng MT', diem: 7.5, tb: 7.2 },
  { mon: 'Toán rời rạc', diem: 8.0, tb: 7.8 },
  { mon: 'NNLT Python', diem: 8.5, tb: 8.0 },
];

const SV_ACTIVITIES = [
  { id: 1, icon: <ClipboardList className="h-4 w-4" />, color: 'warning', title: '3 bài tập chưa nộp — 2 bài sắp hết hạn trước 08/07', time: 'Hôm nay', type: 'warning' },
  { id: 2, icon: <DollarSign className="h-4 w-4" />, color: 'error', title: 'Học phí HK2 còn nợ 4.500.000₫ — hạn chót 15/07', time: 'Hôm nay', type: 'warning' },
  { id: 3, icon: <CheckCircle2 className="h-4 w-4" />, color: 'success', title: 'Kết quả thi giữa kỳ: 5/6 môn đạt điểm cao hơn TB khoa', time: '2 ngày trước', type: 'success' },
  { id: 4, icon: <Award className="h-4 w-4" />, color: 'success', title: 'GPA tích lũy đạt 3.25/4.0 — xếp hạng top 15% khóa', time: '1 tuần trước', type: 'success' },
  { id: 5, icon: <BookOpen className="h-4 w-4" />, color: 'info', title: '6 học phần HK2 đã được xác nhận đăng ký', time: '2 tuần trước', type: 'info' },
];

const SV_NOTIFICATIONS = [
  { id: 1, priority: 'urgent', title: 'Học phí HK2 còn nợ 4.500.000₫ — hạn đóng 15/07', time: 'Hôm nay', read: false },
  { id: 2, priority: 'reminder', title: '2 bài tập sắp hết hạn nộp trước 08/07', time: 'Hôm nay', read: false },
  { id: 3, priority: 'reminder', title: 'Lịch thi giữa kỳ được công bố — kiểm tra ngay', time: 'Hôm nay', read: false },
  { id: 4, priority: 'info', title: 'Thời khóa biểu HK2 đã cập nhật — có thay đổi phòng học', time: '25/06/2026', read: true },
  { id: 5, priority: 'info', title: 'Kết quả thi giữa kỳ môn LT Web: 8.5/10', time: '24/06/2026', read: true },
];

const UPCOMING_SCHEDULE = [
  { time: '07:30', subject: 'Lập trình Web', room: 'A101', today: true },
  { time: '09:30', subject: 'Cơ sở dữ liệu', room: 'B202', today: true },
  { time: '13:30', subject: 'Mạng máy tính', room: 'C303', today: false },
];

const UPCOMING_EXAMS = [
  { mon: 'Lập trình Web', ngay: '10/07/2026', gio: '08:00', phong: 'A301' },
  { mon: 'Cơ sở dữ liệu', ngay: '12/07/2026', gio: '08:00', phong: 'B102' },
];

// ─── DashboardSinhVien ──────────────────────────────────────────────────────────
export default function DashboardSinhVien() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const unreadCount = SV_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--success))] to-[rgb(var(--info))] p-6 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3" />
        <div className="flex items-start justify-between relative">
          <div>
            <h1 className="text-2xl font-black">Xin chào, {(user.fullName || user.name || 'User').split(' ').slice(-1)[0]}</h1>
            <p className="mt-1 text-sm font-medium text-white/80">
              {ROLE_LABELS[user.role] ?? user.role} — Học kỳ 2/2026-2027
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                6 học phần — GPA: 3.25
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                3 bài tập chưa nộp
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="text-[10px] text-white/60 mt-1">Sinh viên</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {SV_STATS.map((s) => (
          <Card key={s.label} className="group hover:border-[rgb(var(--primary-light))] transition-all cursor-default">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))] group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[rgb(var(--text-muted))] uppercase tracking-wide leading-tight">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className={`text-[11px] font-medium mt-0.5 ${
                  s.changeType === 'up' ? 'text-[rgb(var(--success))]' :
                  s.changeType === 'warn' ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--text-muted))]'
                }`}>
                  {s.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 360px' }}>
        <div className="space-y-6">

          {/* GPA trend */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[rgb(var(--success))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Xu hướng GPA qua các học kỳ</h3>
              </div>
              <span className="text-xs text-[rgb(var(--success))] font-semibold">GPA: 3.25/4.0</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={GPA_TREND} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="hk" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[2.5, 4]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="" />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`GPA: ${v.toFixed(2)}/4.0`]} />
                  <Line type="monotone" dataKey="gpa" name="GPA" stroke="rgb(var(--success))" strokeWidth={2} dot={{ r: 4, fill: 'rgb(var(--success))' }} animationDuration={1500} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject scores */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[rgb(var(--accent))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Điểm thi giữa kỳ so với TB khoa</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">HK2/2026-2027</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SUBJECT_SCORES} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="mon" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v}/10`]} />
                  <Bar dataKey="diem" name="Điểm của bạn" fill="rgb(var(--success))" radius={[4, 4, 0, 0]} barSize={24} animationDuration={1500} animationEasing="ease-out" />
                  <Bar dataKey="tb" name="TB khoa" fill="rgb(var(--text-muted))" radius={[4, 4, 0, 0]} barSize={24} animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Upcoming exams */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[rgb(var(--warning))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Lịch thi sắp tới</h3>
              </div>
              <span className="text-xs text-[rgb(var(--warning))] font-semibold">2 kỳ thi</span>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {UPCOMING_EXAMS.map((exam) => (
                <div key={exam.mon} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)]">
                    <span className="text-[10px] font-medium text-[rgb(var(--warning))]">{exam.ngay.split('/')[0]}/{exam.ngay.split('/')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{exam.mon}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{exam.gio} · {exam.phong}</p>
                  </div>
                  <Badge variant="warning" size="sm">Sắp tới</Badge>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 pt-3">
              <button
                onClick={() => navigate('/portal/lich-thi')}
                className="w-full text-center text-sm font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-light))] transition-colors"
              >
                Xem lịch thi đầy đủ
              </button>
            </div>
          </Card>

          {/* Recent activities */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hoạt động gần đây</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {SV_ACTIVITIES.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${a.color})/0.1)] text-[rgb(var(--${a.color}))]`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--text-primary))] leading-relaxed">{a.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{a.time}</p>
                  </div>
                  <Badge variant={a.type === 'warning' ? 'warning' : a.type === 'success' ? 'success' : 'neutral'} size="sm">
                    {a.type === 'warning' ? 'Cảnh báo' : a.type === 'success' ? 'Thành công' : 'Thông tin'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Quick actions */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hành động nhanh</h3>
            </div>
            <CardContent className="p-4 space-y-2">
              {SV_QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.route}
                  onClick={() => navigate(qa.route)}
                  className="w-full flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] p-3 hover:border-[rgb(var(--primary-light))] hover:bg-[rgb(var(--bg-hover))] transition-all group text-left"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${qa.color})/0.1)] text-[rgb(var(--${qa.color}))] group-hover:scale-110 transition-transform`}>
                    {qa.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors leading-tight">{qa.label}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">{qa.sub}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Today's schedule */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Lịch học hôm nay</h3>
              </div>
              <span className="text-xs text-[rgb(var(--primary))] font-semibold">2 tiết</span>
            </div>
            <CardContent className="p-5 space-y-3">
              {UPCOMING_SCHEDULE.map((cls, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg ${
                    cls.today ? 'bg-[rgb(var(--primary)/0.1)]' : 'bg-[rgb(var(--border)/0.5)]'
                  }`}>
                    <span className={`text-[10px] font-medium ${
                      cls.today ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-muted))]'
                    }`}>{cls.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[rgb(var(--text-primary))]">{cls.subject}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{cls.room}</p>
                  </div>
                  {cls.today && (
                    <span className="text-[10px] font-semibold text-[rgb(var(--primary))]">Hôm nay</span>
                  )}
                </div>
              ))}
              <button
                onClick={() => navigate('/portal/lich-hoc')}
                className="w-full text-center text-sm font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-light))] transition-colors pt-2 border-t border-[rgb(var(--border))]"
              >
                Xem lịch tuần
              </button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[rgb(var(--warning))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông báo</h3>
              </div>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[rgb(var(--error))] px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {SV_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${!n.read ? 'bg-[rgb(var(--warning)/0.03)]' : 'hover:bg-[rgb(var(--bg-hover))]'}`}
                >
                  {!n.read && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--error))]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.read ? 'font-semibold text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{n.time}</p>
                  </div>
                  <Badge variant={n.priority === 'urgent' ? 'error' : n.priority === 'reminder' ? 'warning' : 'neutral'} size="sm">
                    {n.priority === 'urgent' ? 'Khẩn' : n.priority === 'reminder' ? 'Nhắc' : 'Thông tin'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 pt-3">
              <button className="w-full text-center text-sm font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-light))] transition-colors">
                Xem tất cả thông báo
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
