import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Users, GraduationCap, FileText,
  Bell, Clock, TrendingUp, CheckCircle2,
  Activity, BookMarked, BookOpen,
  ClipboardList, CalendarDays,
  Award, AlertTriangle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
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
const GV_STATS = [
  { label: 'Lớp đang dạy', value: '6', change: '3 lớp hôm nay', changeType: 'up', icon: <GraduationCap className="h-5 w-5" />, color: 'primary' },
  { label: 'Bài tập đã giao', value: '24', change: '4 mới tuần này', changeType: 'up', icon: <BookOpen className="h-5 w-5" />, color: 'info' },
  { label: 'Bài chấm chưa xong', value: '18', change: '3 sắp hết hạn', changeType: 'warn', icon: <ClipboardList className="h-5 w-5" />, color: 'warning' },
  { label: 'Sinh viên', value: '186', change: 'trong 6 lớp', changeType: 'up', icon: <Users className="h-5 w-5" />, color: 'accent' },
  { label: 'Tài liệu', value: '42', change: '3 tải lên mới', changeType: 'up', icon: <FileText className="h-5 w-5" />, color: 'primary' },
  { label: 'Thông báo', value: '7', change: '2 chưa đọc', changeType: 'warn', icon: <Bell className="h-5 w-5" />, color: 'warning' },
];

// ─── Quick Actions ──────────────────────────────────────────────────────
const GV_QUICK_ACTIONS = [
  { label: 'Bài tập SV', route: '/lms/bai-tap-sinh-vien', icon: <ClipboardList className="h-5 w-5" />, color: 'primary', sub: 'Giao bài & chấm điểm' },
  { label: 'Khóa học', route: '/lms/khoa-hoc', icon: <BookOpen className="h-5 w-5" />, color: 'info', sub: 'Quản lý khóa học' },
  { label: 'Tạo đề thi', route: '/exam/tao-thi', icon: <FileText className="h-5 w-5" />, color: 'accent', sub: 'Tạo đề thi trắc nghiệm' },
  { label: 'Lịch thi', route: '/exam/ca-thi', icon: <CalendarDays className="h-5 w-5" />, color: 'warning', sub: 'Xem lịch coi thi' },
  { label: 'Thư viện', route: '/lib/tai-lieu', icon: <BookMarked className="h-5 w-5" />, color: 'accent', sub: 'Tài liệu học tập' },
  { label: 'Công việc', route: '/wms/cong-viec-cua-toi', icon: <ClipboardList className="h-5 w-5" />, color: 'primary', sub: 'Việc được giao' },
];

// ─── Charts Data ──────────────────────────────────────────────────────
const CLASS_ENROLLMENT = [
  { lop: 'CNTT-K63-01', sv: 45, di: 43, vang: 2 },
  { lop: 'CNTT-K63-02', sv: 42, di: 41, vang: 1 },
  { lop: 'KHMT-K63', sv: 38, di: 37, vang: 1 },
  { lop: 'HTTT-K63', sv: 35, di: 34, vang: 1 },
  { lop: 'KTMT-K63', sv: 40, di: 39, vang: 1 },
];

const GRADING_PROGRESS = [
  { bai: 'BT Chương 5', lop: 'CNTT-K63', submitted: 38, total: 45, rate: 84 },
  { bai: 'BT Chương 4', lop: 'CNTT-K63', submitted: 44, total: 45, rate: 98 },
  { bai: 'BT Chương 3', lop: 'CNTT-K63', submitted: 45, total: 45, rate: 100 },
  { bai: 'BT Chương 5', lop: 'KHMT-K63', submitted: 30, total: 38, rate: 79 },
];

const GV_ACTIVITIES = [
  { id: 1, icon: <ClipboardList className="h-4 w-4" />, color: 'warning', title: '18 bài tập đã nộp chưa được chấm — 3 bài sắp hết hạn 48h', time: 'Hôm nay', type: 'warning' },
  { id: 2, icon: <CheckCircle2 className="h-4 w-4" />, color: 'success', title: 'Kết quả thi giữa kỳ đã công bố — 186 sinh viên', time: '2 ngày trước', type: 'success' },
  { id: 3, icon: <FileText className="h-4 w-4" />, color: 'primary', title: 'Cập nhật slide bài giảng Chương 6 — Lập trình Web', time: '3 ngày trước', type: 'info' },
  { id: 4, icon: <BookOpen className="h-4 w-4" />, color: 'info', title: '42 sinh viên đăng ký khóa học Lập trình Web HK2', time: '4 ngày trước', type: 'info' },
  { id: 5, icon: <Award className="h-4 w-4" />, color: 'success', title: '8 sinh viên đạt điểm cao (>8.5) — đề xuất khen thưởng', time: '1 tuần trước', type: 'success' },
];

const GV_NOTIFICATIONS = [
  { id: 1, priority: 'urgent', title: '3 bài tập sắp hết hạn chấm — trước 02/07/2026', time: 'Hôm nay', read: false },
  { id: 2, priority: 'reminder', title: 'Lịch coi thi giữa kỳ cần xác nhận trước 03/07', time: 'Hôm nay', read: false },
  { id: 3, priority: 'reminder', title: 'Báo cáo tiến độ giảng dạy HK2 gửi Phòng Đào tạo — còn 5 ngày', time: 'Hôm nay', read: false },
  { id: 4, priority: 'info', title: 'Slide bài giảng Chương 6 đã được duyệt', time: '25/06/2026', read: true },
  { id: 5, priority: 'info', title: 'Lịch họp tổ bộ môn tháng 7: 05/07/2026', time: '24/06/2026', read: true },
];

const UPCOMING_CLASSES = [
  { time: '07:30', subject: 'Lập trình Web', lop: 'CNTT-K63-01', room: 'A101', today: true },
  { time: '09:30', subject: 'Cơ sở dữ liệu', lop: 'CNTT-K63-02', room: 'B202', today: true },
  { time: '13:30', subject: 'Mạng máy tính', lop: 'KHMT-K63', room: 'C303', today: false },
];

// ─── DashboardGV ──────────────────────────────────────────────────────────
export default function DashboardGV() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const unreadCount = GV_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] p-6 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3" />
        <div className="flex items-start justify-between relative">
          <div>
            <h1 className="text-2xl font-black">Xin chào, {(user.fullName || user.name || 'User').split(' ').slice(-1)[0]}</h1>
            <p className="mt-1 text-sm font-medium text-white/80">
              {ROLE_LABELS[user.role] ?? user.role} — Bảng điều khiển Giảng viên — Học kỳ 2/2026-2027
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                6 lớp — 186 sinh viên
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                18 bài tập chưa chấm
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <BookOpen className="h-7 w-7" />
            </div>
            <span className="text-[10px] text-white/60 mt-1">Giảng viên</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {GV_STATS.map((s) => (
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
                  {s.changeType === 'up' && <TrendingUp className="h-3 w-3 inline mr-0.5" />}
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

          {/* Class attendance */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tình trạng điểm danh theo lớp</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">HK2/2026-2027</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CLASS_ENROLLMENT} layout="vertical" margin={{ top: 0, right: 80, left: 80, bottom: 0 }}>
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="lop" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v} SV`]} />
                  <Bar dataKey="di" name="Có mặt" fill="rgb(var(--success))" radius={[0, 4, 4, 0]} barSize={16}  animationDuration={1500} animationEasing="ease-out" />
                  <Bar dataKey="vang" name="Vắng" fill="rgb(var(--error))" radius={[0, 4, 4, 0]} barSize={16}  animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Grading progress */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[rgb(var(--warning))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tiến độ chấm bài tập</h3>
              </div>
              <span className="text-xs font-semibold text-[rgb(var(--warning))]">18 bài chưa chấm</span>
            </div>
            <CardContent className="h-48">
              <div className="space-y-4">
                {GRADING_PROGRESS.map((g) => (
                  <div key={g.bai + g.lop} className="flex items-center gap-4">
                    <div className="w-36 shrink-0">
                      <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">{g.bai}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">{g.lop} · {g.submitted}/{g.total} nộp</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-2.5 bg-[rgb(var(--border))] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${g.rate}%`,
                            backgroundColor: g.rate === 100 ? 'rgb(var(--success))' : g.rate >= 80 ? 'rgb(var(--accent))' : 'rgb(var(--warning))',
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-10 text-right text-xs font-semibold text-[rgb(var(--text-primary))]">{g.rate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
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
              {GV_ACTIVITIES.map((a) => (
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
              {GV_QUICK_ACTIONS.map((qa) => (
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
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Lịch giảng dạy hôm nay</h3>
              </div>
              <span className="text-xs text-[rgb(var(--primary))] font-semibold">2 tiết</span>
            </div>
            <CardContent className="p-5 space-y-3">
              {UPCOMING_CLASSES.map((cls, i) => (
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
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{cls.lop} · {cls.room}</p>
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
              {GV_NOTIFICATIONS.map((n) => (
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
