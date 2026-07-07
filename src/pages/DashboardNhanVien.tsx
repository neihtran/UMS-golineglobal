import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Users, GraduationCap, FileText,
  DollarSign, BarChart3, Building2,
  Bell, Clock, TrendingUp, CheckCircle2,
  Activity, ShieldCheck, AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
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
const NV_STATS = [
  { label: 'Viên chức', value: '126', change: '+2 tuyển mới', changeType: 'up', icon: <Users className="h-5 w-5" />, color: 'primary' },
  { label: 'Sinh viên', value: '8.430', change: '+156 tuyển sinh', changeType: 'up', icon: <GraduationCap className="h-5 w-5" />, color: 'info' },
  { label: 'Đơn vị', value: '14', change: '1 đang kiểm tra', changeType: 'warn', icon: <Building2 className="h-5 w-5" />, color: 'accent' },
  { label: 'Văn bản chờ', value: '23', change: '3 khẩn cấp', changeType: 'warn', icon: <FileText className="h-5 w-5" />, color: 'warning' },
  { label: 'Học phí thu', value: '94.2%', change: 'vượt target 90%', changeType: 'up', icon: <DollarSign className="h-5 w-5" />, color: 'success' },
  { label: 'Công việc', value: '12', change: '3 sắp hết hạn', changeType: 'warn', icon: <ClipboardList className="h-5 w-5" />, color: 'warning' },
];

// ─── Quick Actions ──────────────────────────────────────────────────────
const NV_QUICK_ACTIONS = [
  { label: 'Nhân sự', route: '/hrm/vien-chuc', icon: <Users className="h-5 w-5" />, color: 'primary', sub: 'Quản lý viên chức' },
  { label: 'Sinh viên', route: '/sis/sinh-vien', icon: <GraduationCap className="h-5 w-5" />, color: 'info', sub: 'Danh sách sinh viên' },
  { label: 'Văn bản', route: '/dms/soan-thao', icon: <FileText className="h-5 w-5" />, color: 'warning', sub: 'Soạn & duyệt văn bản' },
  { label: 'Học phí', route: '/fin/hoc-phi', icon: <DollarSign className="h-5 w-5" />, color: 'success', sub: 'Quản lý học phí' },
  { label: 'Công việc', route: '/wms/cong-viec', icon: <ClipboardList className="h-5 w-5" />, color: 'accent', sub: 'Giao việc & theo dõi' },
  { label: 'Báo cáo BI', route: '/bi/bao-cao', icon: <BarChart3 className="h-5 w-5" />, color: 'primary', sub: 'Phân tích dữ liệu' },
];

// ─── Charts Data ──────────────────────────────────────────────────────
const HR_DISTRIBUTION = [
  { name: 'Giảng viên', value: 186, color: '#0369A1' },
  { name: 'Nhân viên', value: 86, color: '#2D5D8A' },
  { name: 'Viên chức QL', value: 40, color: '#7C3AED' },
];

const TUITION_STATUS = [
  { name: 'Đã đóng', value: 8230, color: '#22C55E' },
  { name: 'Chưa đóng', value: 200, color: '#EF4444' },
];

const DOC_STATS = [
  { type: 'Chờ ký', so: 38, color: 'warning' },
  { type: 'Chờ duyệt', so: 23, color: 'error' },
  { type: 'Đã ký', so: 156, color: 'success' },
  { type: 'Từ chối', so: 8, color: 'neutral' },
];

const NV_ACTIVITIES = [
  { id: 1, icon: <FileText className="h-4 w-4" />, color: 'warning', title: '23 văn bản đang chờ phê duyệt — nhiều nhất từ Phòng HC', time: 'Hôm nay', type: 'warning' },
  { id: 2, icon: <DollarSign className="h-4 w-4" />, color: 'success', title: 'Thu học phí HK2 đạt 94.2% — vượt target 90%', time: 'Hôm nay', type: 'success' },
  { id: 3, icon: <GraduationCap className="h-4 w-4" />, color: 'info', title: '156 sinh viên mới được xác nhận nhập học HK2', time: '2 ngày trước', type: 'info' },
  { id: 4, icon: <ClipboardList className="h-4 w-4" />, color: 'warning', title: '12 công việc được giao — 3 cần xử lý trước 05/07', time: '3 ngày trước', type: 'warning' },
  { id: 5, icon: <CheckCircle2 className="h-4 w-4" />, color: 'success', title: 'Bảng lương tháng 6/2026 đã hoàn tất thanh toán', time: '1 tuần trước', type: 'success' },
];

const NV_NOTIFICATIONS = [
  { id: 1, priority: 'urgent', title: '3 văn bản khẩn cần xử lý trước 17:00 hôm nay', time: 'Hôm nay', read: false },
  { id: 2, priority: 'reminder', title: 'Hạn nộp báo cáo tháng 6 — còn 2 ngày', time: 'Hôm nay', read: false },
  { id: 3, priority: 'reminder', title: '200 sinh viên chưa đóng học phí HK2', time: 'Hôm nay', read: false },
  { id: 4, priority: 'info', title: 'Bảng lương tháng 7/2026 đã sẵn sàng', time: '25/06/2026', read: true },
  { id: 5, priority: 'info', title: 'Lịch họp giao ban tháng 7: 10/07/2026', time: '24/06/2026', read: true },
];

// ─── DashboardNhanVien ──────────────────────────────────────────────────────────
export default function DashboardNhanVien() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const unreadCount = NV_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--info))] to-[rgb(var(--primary))] p-6 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3" />
        <div className="flex items-start justify-between relative">
          <div>
            <h1 className="text-2xl font-black">Xin chào, {user.name.split(' ').slice(-1)[0]}</h1>
            <p className="mt-1 text-sm font-medium text-white/80">
              {ROLE_LABELS[user.role] ?? user.role} — Bảng điều khiển Nhân viên — Học kỳ 2/2026-2027
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                14 đơn vị — 8.430 sinh viên
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                23 văn bản chờ xử lý
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Building2 className="h-7 w-7" />
            </div>
            <span className="text-[10px] text-white/60 mt-1">Nhân viên</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {NV_STATS.map((s) => (
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

          {/* HR distribution */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phân bổ nhân sự</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Tổng: 312 người</span>
            </div>
            <CardContent className="flex items-center gap-4">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={HR_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} animationDuration={1500} animationEasing="ease-out">
                      {HR_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v} người`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {HR_DISTRIBUTION.map((r) => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-xs text-[rgb(var(--text-secondary))]">{r.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{r.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document stats */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[rgb(var(--warning))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tình trạng văn bản</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Tháng 7/2026</span>
            </div>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DOC_STATS} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v} văn bản`]} />
                  <Bar dataKey="so" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out">
                    {DOC_STATS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.color === 'success' ? 'rgb(var(--success))' :
                        entry.color === 'warning' ? 'rgb(var(--warning))' :
                        entry.color === 'error' ? 'rgb(var(--error))' : 'rgb(var(--text-muted))'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
              {NV_ACTIVITIES.map((a) => (
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
              {NV_QUICK_ACTIONS.map((qa) => (
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

          {/* Tuition status */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[rgb(var(--success))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thu học phí HK2</h3>
              </div>
            </div>
            <CardContent className="flex items-center gap-4">
              <div className="h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart animationDuration={1500} animationEasing="ease-out">
                    <Pie data={TUITION_STATUS} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3} animationDuration={1500} animationEasing="ease-out">
                      {TUITION_STATUS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString()]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {TUITION_STATUS.map((r) => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-xs text-[rgb(var(--text-secondary))]">{r.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{r.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-[rgb(var(--border))] pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">Tổng SV</span>
                  <span className="text-xs font-bold text-[rgb(var(--primary))]">8.430</span>
                </div>
                <p className="text-[10px] text-[rgb(var(--success))] font-semibold">Tỷ lệ: 97.6% đã đóng</p>
              </div>
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
              {NV_NOTIFICATIONS.map((n) => (
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
