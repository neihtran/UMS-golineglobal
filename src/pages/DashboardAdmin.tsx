import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Users, GraduationCap, BarChart3, FileText,
  DollarSign, Award, ClipboardList,
  Bell, Clock, TrendingUp, CheckCircle2,
  ShieldCheck, FlaskConical, Building2, ScanSearch,
  Activity, Database, CreditCard,
  Eye, PieChart as PieChartIcon, BookMarked,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import { ROLE_LABELS } from '@/constants/modules';

// ─── Shared chart styles ────────────────────────────────────────────────────
const CHART_TOOLTIP_STYLE = {
  background: 'rgb(var(--bg-card))',
  border: '1px solid rgb(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'rgb(var(--text-primary))',
};

// ─── Admin Stats ────────────────────────────────────────────────────────────
const ADMIN_STATS = [
  { label: 'Tổng người dùng', value: '1.247', change: '+12 tuần này', changeType: 'up', icon: <Users className="h-5 w-5" />, color: 'primary' },
  { label: 'Sinh viên đang học', value: '8.430', change: '+156 nhập học', changeType: 'up', icon: <GraduationCap className="h-5 w-5" />, color: 'info' },
  { label: 'Viên chức & GV', value: '312', change: '+3 tuyển mới', changeType: 'up', icon: <Building2 className="h-5 w-5" />, color: 'accent' },
  { label: 'Phân hệ hoạt động', value: '18/18', change: '100% uptime', changeType: 'up', icon: <ShieldCheck className="h-5 w-5" />, color: 'success' },
  { label: 'Văn bản chờ duyệt', value: '23', change: '5 khẩn cấp', changeType: 'warn', icon: <FileText className="h-5 w-5" />, color: 'warning' },
  { label: 'Doanh thu tháng', value: '₫2.8T', change: '+8.2% YoY', changeType: 'up', icon: <DollarSign className="h-5 w-5" />, color: 'success' },
];

// ─── Admin Quick Actions ───────────────────────────────────────────────────
const ADMIN_QUICK_ACTIONS = [
  { label: 'Danh sách SV', route: '/sis/sinh-vien', icon: <GraduationCap className="h-5 w-5" />, color: 'primary', sub: 'Quản lý sinh viên' },
  { label: 'Văn bản điện tử', route: '/dms/soan-thao', icon: <FileText className="h-5 w-5" />, color: 'warning', sub: 'Soạn & phát hành' },
  { label: 'Báo cáo BI', route: '/bi/bao-cao/tao', icon: <BarChart3 className="h-5 w-5" />, color: 'info', sub: 'Phân tích dữ liệu' },
  { label: 'Quản lý công việc', route: '/wms/tao-cv', icon: <ClipboardList className="h-5 w-5" />, color: 'accent', sub: 'Tạo & phân công' },
  { label: 'Ký túc xá', route: '/ktx', icon: <Building2 className="h-5 w-5" />, color: 'primary', sub: 'Quản lý KTX' },
  { label: 'Tài chính', route: '/fin', icon: <CreditCard className="h-5 w-5" />, color: 'success', sub: 'Thu chi & kế toán' },
];

// ─── Admin Charts Data ────────────────────────────────────────────────────
const MONTHLY_ENROLLMENT = [
  { month: 'T9/25', sv: 240, vc: 12, gv: 5 },
  { month: 'T10/25', sv: 310, vc: 8, gv: 3 },
  { month: 'T11/25', sv: 180, vc: 15, gv: 2 },
  { month: 'T12/25', sv: 95, vc: 6, gv: 1 },
  { month: 'T1/26', sv: 420, vc: 20, gv: 8 },
  { month: 'T2/26', sv: 380, vc: 11, gv: 4 },
  { month: 'T3/26', sv: 290, vc: 9, gv: 6 },
  { month: 'T4/26', sv: 350, vc: 14, gv: 3 },
  { month: 'T5/26', sv: 260, vc: 7, gv: 2 },
  { month: 'T6/26', sv: 180, vc: 18, gv: 5 },
];

const USER_BY_ROLE = [
  { name: 'Sinh viên', value: 8430, color: '#1E3A5F' },
  { name: 'Giảng viên', value: 186, color: '#2D5D8A' },
  { name: 'Nhân viên', value: 89, color: '#3B82F6' },
  { name: 'Quản trị', value: 12, color: '#93C5FD' },
];

const MODULE_USAGE = [
  { name: 'SIS', requests: 45200, avgTime: 1.2 },
  { name: 'LMS', requests: 38100, avgTime: 2.1 },
  { name: 'DMS', requests: 22400, avgTime: 0.8 },
  { name: 'HRM', requests: 16800, avgTime: 1.5 },
  { name: 'FIN', requests: 12300, avgTime: 1.8 },
  { name: 'EXAM', requests: 9800, avgTime: 3.2 },
  { name: 'WMS', requests: 7600, avgTime: 1.1 },
  { name: 'KTX', requests: 5400, avgTime: 0.9 },
];

const REVENUE_TREND = [
  { month: 'T1', hocPhi: 1200, kyLuat: 0 },
  { month: 'T2', hocPhi: 1100, kyLuat: 0 },
  { month: 'T3', hocPhi: 800, kyLuat: 0 },
  { month: 'T4', hocPhi: 600, kyLuat: 50 },
  { month: 'T5', hocPhi: 200, kyLuat: 80 },
  { month: 'T6', hocPhi: 2800, kyLuat: 120 },
  { month: 'T7', hocPhi: 300, kyLuat: 40 },
  { month: 'T8', hocPhi: 200, kyLuat: 20 },
];

const ATTENDANCE_DATA = [
  { name: 'CNTT', di: 98.2, nghi: 1.8 },
  { name: 'Kinh tế', di: 97.5, nghi: 2.5 },
  { name: 'Luật', di: 96.8, nghi: 3.2 },
  { name: 'Ngoại ngữ', di: 99.1, nghi: 0.9 },
  { name: 'Khoa học', di: 97.0, nghi: 3.0 },
  { name: 'Sư phạm', di: 98.5, nghi: 1.5 },
];

const SYSTEM_STATUS = [
  { name: 'IAM', uptime: 99.98, color: '#22C55E' },
  { name: 'SIS', uptime: 99.95, color: '#22C55E' },
  { name: 'DMS', uptime: 99.90, color: '#22C55E' },
  { name: 'LMS', uptime: 99.87, color: '#22C55E' },
  { name: 'OCR', uptime: 99.99, color: '#22C55E' },
  { name: 'EXAM', uptime: 99.75, color: '#22C55E' },
  { name: 'FIN', uptime: 99.92, color: '#22C55E' },
  { name: 'HRM', uptime: 99.88, color: '#22C55E' },
];

const ADMIN_ACTIVITIES = [
  { id: 1, icon: <GraduationCap className="h-4 w-4" />, color: 'primary', title: 'Sinh viên Nguyễn Văn A đăng ký học phần HK2 2026-2027', time: '5 phút trước', type: 'info' },
  { id: 2, icon: <FileText className="h-4 w-4" />, color: 'warning', title: 'Văn bản QĐ-2026-042 chờ ký duyệt — Phòng Hành chính', time: '12 phút trước', type: 'warning' },
  { id: 3, icon: <CheckCircle2 className="h-4 w-4" />, color: 'success', title: 'Biên bản họp Hội đồng Khoa CNTT đã ký số thành công', time: '28 phút trước', type: 'success' },
  { id: 4, icon: <FlaskConical className="h-4 w-4" />, color: 'accent', title: 'Đề tài NCKH NCKH-2026-005 nghiệm thu — TS. Trần Văn B', time: '1 giờ trước', type: 'info' },
  { id: 5, icon: <ScanSearch className="h-4 w-4" />, color: 'info', title: '240 trang hồ sơ tuyển sinh K62 đã số hóa xong', time: '2 giờ trước', type: 'info' },
  { id: 6, icon: <Users className="h-4 w-4" />, color: 'primary', title: '2 đảng viên mới được kết nạp — Chi bộ Khoa Kinh tế', time: '3 giờ trước', type: 'info' },
  { id: 7, icon: <Award className="h-4 w-4" />, color: 'success', title: 'Kết quả kiểm định AUN-QA gửi công bố thành công', time: '4 giờ trước', type: 'success' },
];

const ADMIN_NOTIFICATIONS = [
  { id: 1, priority: 'urgent', title: 'Hạn nộp báo cáo công tác Đảng Q2/2026', time: 'Hôm nay, 17:00', read: false },
  { id: 2, priority: 'reminder', title: '3 văn bản cần ký duyệt trước 18:00 hôm nay', time: 'Hôm nay', read: false },
  { id: 3, priority: 'reminder', title: '8 hợp đồng lao động hết hạn trong 30 ngày', time: 'Hôm nay', read: false },
  { id: 4, priority: 'info', title: 'Kết quả kiểm định AUN-QA sẵn sàng công bố', time: '25/06/2026', read: true },
  { id: 5, priority: 'info', title: 'Hệ thống LMS cập nhật phiên bản mới v2.4', time: '24/06/2026', read: true },
];

// ─── DashboardAdmin ───────────────────────────────────────────────────────
export default function DashboardAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const unreadCount = ADMIN_NOTIFICATIONS.filter((n) => !n.read).length;
  const totalUsers = USER_BY_ROLE.reduce((s, r) => s + r.value, 0);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] p-6 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3" />
        <div className="flex items-start justify-between relative">
          <div>
            <h1 className="text-2xl font-black">Xin chào, {user.name.split(' ').slice(-1)[0]}</h1>
            <p className="mt-1 text-sm font-medium text-white/80">
              {ROLE_LABELS[user.role] ?? user.role} — Bảng điều khiển UMS — Học kỳ 2/2026-2027
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Hệ thống hoạt động bình thường
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                18 phân hệ online
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <span className="text-[10px] text-white/60 mt-1">Quản trị viên</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {ADMIN_STATS.map((s) => (
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
          {/* Enrollment chart */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Đăng ký người dùng theo tháng</h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[rgb(var(--primary))] inline-block" /> Sinh viên</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[rgb(var(--accent))] inline-block" /> Viên chức</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[rgb(var(--info))] inline-block" /> Giảng viên</span>
              </div>
            </div>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_ENROLLMENT} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradSv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradVc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--accent))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="rgb(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradGv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--info))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="rgb(var(--info))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="sv" name="Sinh viên" stroke="rgb(var(--primary))" strokeWidth={2} fill="url(#gradSv)" dot={false} />
                  <Area type="monotone" dataKey="vc" name="Viên chức" stroke="rgb(var(--accent))" strokeWidth={2} fill="url(#gradVc)" dot={false} />
                  <Area type="monotone" dataKey="gv" name="Giảng viên" stroke="rgb(var(--info))" strokeWidth={2} fill="url(#gradGv)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance chart */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-[rgb(var(--info))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tình trạng điểm danh theo khoa</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Học kỳ 2/2026-2027</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ATTENDANCE_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`]} />
                  <Bar dataKey="di" name="Đi học" fill="rgb(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nghi" name="Nghỉ" fill="rgb(var(--error))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Module usage */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[rgb(var(--accent))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Lưu lượng truy cập phân hệ</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Top 8 phân hệ — tháng 6/2026</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MODULE_USAGE} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v.toLocaleString()} requests`]} />
                  <Bar dataKey="requests" name="Requests" fill="rgb(var(--accent))" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[rgb(var(--success))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Doanh thu học phí & phí theo tháng</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Đơn vị: triệu đồng (₫M)</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_TREND} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`₫${v}M`]} />
                  <Bar dataKey="hocPhi" name="Học phí" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kyLuat" name="Kỷ luật" fill="rgb(var(--error))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hoạt động gần đây</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {ADMIN_ACTIVITIES.map((a) => (
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
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {ADMIN_QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.route}
                    onClick={() => navigate(qa.route)}
                    className="flex flex-col items-start gap-2 rounded-xl border border-[rgb(var(--border))] p-3 hover:border-[rgb(var(--primary-light))] hover:bg-[rgb(var(--bg-hover))] transition-all group text-left"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${qa.color})/0.1)] text-[rgb(var(--${qa.color}))] group-hover:scale-110 transition-transform`}>
                      {qa.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors leading-tight">{qa.label}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">{qa.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User distribution */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phân bố người dùng</h3>
              </div>
            </div>
            <CardContent className="flex items-center gap-4">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={USER_BY_ROLE} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {USER_BY_ROLE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString()]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {USER_BY_ROLE.map((r) => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-xs text-[rgb(var(--text-secondary))]">{r.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{r.value.toLocaleString()}</span>
                      <span className="text-[10px] text-[rgb(var(--text-muted))] ml-1">({(r.value / totalUsers * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-[rgb(var(--border))] pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">Tổng</span>
                  <span className="text-xs font-bold text-[rgb(var(--primary))]">{totalUsers.toLocaleString()}</span>
                </div>
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
              {ADMIN_NOTIFICATIONS.map((n) => (
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

          {/* System status */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--success))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Trạng thái hệ thống</h3>
              </div>
              <span className="text-xs text-[rgb(var(--success))] font-medium">● All Online</span>
            </div>
            <CardContent className="p-5 space-y-3">
              {SYSTEM_STATUS.map((sys) => (
                <div key={sys.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: sys.color }} />
                    <span className="text-sm text-[rgb(var(--text-secondary))]">{sys.name}</span>
                  </div>
                  <span className="text-xs text-[rgb(var(--text-muted))]">{sys.uptime}%</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[rgb(var(--border))]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[rgb(var(--text-muted))]">Uptime trung bình</span>
                  <span className="text-xs font-bold text-[rgb(var(--success))]">99.93%</span>
                </div>
                <div className="w-full h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden">
                  <div className="h-full bg-[rgb(var(--success))] rounded-full" style={{ width: '99.93%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active sessions */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phiên đang hoạt động</h3>
              </div>
              <span className="text-xs text-[rgb(var(--primary))] font-semibold">847 người</span>
            </div>
            <CardContent className="p-5 space-y-3">
              {[
                { user: 'GV. Trần Văn B', role: 'Giảng viên', time: 'Đang hoạt động', color: 'primary' },
                { user: 'SV. Nguyễn Thị C', role: 'Sinh viên', time: '4 phút trước', color: 'info' },
                { user: 'NV. Lê Hoàng D', role: 'Nhân viên', time: '7 phút trước', color: 'accent' },
                { user: 'SV. Phạm Văn E', role: 'Sinh viên', time: '12 phút trước', color: 'info' },
                { user: 'GV. Hoàng Thị F', role: 'Giảng viên', time: '18 phút trước', color: 'primary' },
              ].map((u, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--${u.color})/0.1)] text-[10px] font-bold text-[rgb(var(--${u.color}))]`}>
                      {u.user.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[rgb(var(--text-primary))]">{u.user}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">{u.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[rgb(var(--text-muted))]">{u.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
