import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Users, GraduationCap, BarChart3, FileText,
  DollarSign, Award, ClipboardList,
  Bell, Clock, TrendingUp, CheckCircle2,
  ShieldCheck, FlaskConical, Building2,
  Activity, CreditCard, BookMarked, AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area, Legend } from 'recharts';
import { ROLE_LABELS } from '@/constants/modules';

// ─── Shared chart styles ────────────────────────────────────────────────────
const CHART_TOOLTIP_STYLE = {
  background: 'rgb(var(--bg-card))',
  border: '1px solid rgb(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'rgb(var(--text-primary))',
};

// ─── BGH Stats ─────────────────────────────────────────────────────────────
const BGH_STATS = [
  { label: 'Tổng sinh viên', value: '8.430', change: '+156 tuyển sinh', changeType: 'up', icon: <GraduationCap className="h-5 w-5" />, color: 'primary' },
  { label: 'Giảng viên', value: '186', change: '+4 tuyển mới', changeType: 'up', icon: <Users className="h-5 w-5" />, color: 'info' },
  { label: 'Viên chức', value: '126', change: '+2 tuyển mới', changeType: 'up', icon: <Building2 className="h-5 w-5" />, color: 'accent' },
  { label: 'Khoa/Phòng', value: '14', change: '3 đang kiểm định', changeType: 'warn', icon: <ShieldCheck className="h-5 w-5" />, color: 'warning' },
  { label: 'Đề tài NCKH đang thực hiện', value: '47', change: '5 nghiệm thu Q2', changeType: 'warn', icon: <FlaskConical className="h-5 w-5" />, color: 'success' },
  { label: 'Tỷ lệ TN đúng hạn', value: '72.4%', change: '+3.2% vs năm trước', changeType: 'up', icon: <Award className="h-5 w-5" />, color: 'success' },
];

// ─── BGH Quick Actions ──────────────────────────────────────────────────────
const BGH_QUICK_ACTIONS = [
  { label: 'Văn bản chờ duyệt', route: '/dms/phe-duyet', icon: <FileText className="h-5 w-5" />, color: 'warning', sub: 'Xem & ký duyệt', count: '23' },
  { label: 'Báo cáo BI', route: '/bi', icon: <BarChart3 className="h-5 w-5"  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />, color: 'info', sub: 'Phân tích toàn trường', count: '' },
  { label: 'NCKH', route: '/rit', icon: <FlaskConical className="h-5 w-5" />, color: 'accent', sub: 'Đề tài & công bố', count: '47' },
  { label: 'Kiểm định AUN-QA', route: '/qa/kiem-dinh', icon: <ClipboardCheck className="h-5 w-5" />, color: 'success', sub: 'Tiến độ kiểm định', count: '3' },
  { label: 'Tài chính', route: '/fin', icon: <DollarSign className="h-5 w-5" />, color: 'primary', sub: 'Thu chi toàn trường', count: '' },
  { label: 'Công việc', route: '/wms', icon: <ClipboardList className="h-5 w-5" />, color: 'accent', sub: 'Giao việc & theo dõi', count: '' },
];

// ─── BGH Charts Data ──────────────────────────────────────────────────────
const ENROLLMENT_TREND = [
  { year: '2021', admitted: 2100, graduated: 1850 },
  { year: '2022', admitted: 2250, graduated: 1920 },
  { year: '2023', admitted: 2400, graduated: 2100 },
  { year: '2024', admitted: 2580, graduated: 2240 },
  { year: '2025', admitted: 2700, graduated: 2380 },
  { year: '2026', admitted: 2850, graduated: null },
];

const DEPARTMENT_ATTENDANCE = [
  { name: 'CNTT', di: 98.2, nghi: 1.8, khao: 0 },
  { name: 'Kinh tế', di: 97.5, nghi: 2.5, khao: 0 },
  { name: 'Luật', di: 96.8, nghi: 3.2, khao: 0 },
  { name: 'Ngoại ngữ', di: 99.1, nghi: 0.9, khao: 0 },
  { name: 'SP Toán', di: 98.5, nghi: 1.5, khao: 0 },
  { name: 'SP Văn', di: 97.8, nghi: 2.2, khao: 0 },
];

const GPA_TREND = [
  { khoa: 'CNTT', gpa: 3.12 },
  { khoa: 'Kinh tế', gpa: 3.08 },
  { khoa: 'Luật', gpa: 2.95 },
  { khoa: 'Ngoại ngữ', gpa: 3.28 },
  { khoa: 'SP Toán', gpa: 3.05 },
  { khoa: 'SP Văn', gpa: 3.15 },
];

const TUITION_STATUS = [
  { name: 'Đã đóng', value: 8230, color: '#22C55E' },
  { name: 'Chưa đóng', value: 200, color: '#EF4444' },
];

const PENDING_DOCS = [
  { type: 'Quyết định', so: 'QĐ-2026-042', from: 'Phòng HC', urgency: 'khẩn', time: '1 giờ' },
  { type: 'Công văn', so: 'CV-2026-118', from: 'Khoa CNTT', urgency: 'thường', time: '3 giờ' },
  { type: 'Báo cáo', so: 'BC-2026-056', from: 'Phòng Đào tạo', urgency: 'thường', time: '5 giờ' },
  { type: 'Thông báo', so: 'TB-2026-089', from: 'Khoa Kinh tế', urgency: 'thường', time: '1 ngày' },
];

const BGH_ACTIVITIES = [
  { id: 1, icon: <FileText className="h-4 w-4" />, color: 'warning', title: '23 văn bản đang chờ phê duyệt — nhiều nhất từ Phòng HC', time: 'Bây giờ', type: 'warning' },
  { id: 2, icon: <FlaskConical className="h-4 w-4" />, color: 'accent', title: '5 đề tài NCKH sẵn sàng nghiệm thu Q2/2026', time: '2 giờ trước', type: 'info' },
  { id: 3, icon: <CheckCircle2 className="h-4 w-4" />, color: 'success', title: 'Kết quả kiểm định AUN-QA gửi công bố thành công', time: 'Hôm qua', type: 'success' },
  { id: 4, icon: <GraduationCap className="h-4 w-4" />, color: 'info', title: 'Tỷ lệ tốt nghiệp đúng hạn HK1 đạt 72.4% — cao nhất 3 năm', time: 'Hôm qua', type: 'info' },
  { id: 5, icon: <DollarSign className="h-4 w-4" />, color: 'success', title: 'Thu học phí HK2 đạt 94.2% — vượt target 90%', time: '2 ngày trước', type: 'success' },
];

const BGH_NOTIFICATIONS = [
  { id: 1, priority: 'urgent', title: '3 văn bản khẩn cấp cần ký trước 17:00 hôm nay', time: 'Hôm nay', read: false },
  { id: 2, priority: 'reminder', title: '5 đề tài NCKH đến hạn nghiệm thu Q2/2026', time: 'Hôm nay', read: false },
  { id: 3, priority: 'reminder', title: 'Hạn báo cáo công tác Đảng Q2/2026 — còn 3 ngày', time: 'Hôm nay', read: false },
  { id: 4, priority: 'info', title: 'Kết quả khảo sát hài lòng SV năm học 2025-2026: 4.2/5.0', time: '25/06/2026', read: true },
  { id: 5, priority: 'info', title: 'Công bố quốc tế tháng 6/2026: 12 bài báo indexed', time: '24/06/2026', read: true },
];

// ─── DashboardBGH ──────────────────────────────────────────────────────────
export default function DashboardBGH() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const unreadCount = BGH_NOTIFICATIONS.filter((n) => !n.read).length;

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
              {ROLE_LABELS[user.role] ?? user.role} — Bảng điều khiển Giám sát — Học kỳ 2/2026-2027
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
                <AlertTriangle className="h-3.5 w-3.5" />
                23 văn bản chờ phê duyệt
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <span className="text-[10px] text-white/60 mt-1">Lãnh đạo BGH</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {BGH_STATS.map((s) => (
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

          {/* Enrollment trend */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tuyển sinh & Tốt nghiệp 5 năm</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">2021 — 2026</span>
            </div>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ENROLLMENT_TREND} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradAdm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--accent))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="rgb(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [v != null ? `${v.toLocaleString()} sinh viên` : '—']} />
                  <Area type="monotone" dataKey="admitted" name="Tuyển sinh" stroke="rgb(var(--primary))" strokeWidth={2} fill="url(#gradAdm)" dot={false}  animationDuration={1500} animationEasing="ease-out" />
                  <Area type="monotone" dataKey="graduated" name="Tốt nghiệp" stroke="rgb(var(--accent))" strokeWidth={2} fill="url(#gradGrad)" dot={false}  animationDuration={1500} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance by department */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-[rgb(var(--info))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tỷ lệ đi học theo khoa</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">HK2/2026-2027</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_ATTENDANCE} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`]} />
                  <Bar dataKey="di" name="Đi học" fill="rgb(var(--success))" radius={[4, 4, 0, 0]}  animationDuration={1500} animationEasing="ease-out" />
                  <Bar dataKey="nghi" name="Nghỉ" fill="rgb(var(--error))" radius={[4, 4, 0, 0]}  animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* GPA by department */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[rgb(var(--accent))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">GPA trung bình theo khoa</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">HK2/2026-2027</span>
            </div>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={GPA_TREND} layout="vertical" margin={{ top: 0, right: 60, left: 60, bottom: 0 }}>
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[2.5, 3.5]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="khoa" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`GPA: ${v.toFixed(2)}/4.0`]} />
                  <Bar dataKey="gpa" name="GPA" fill="rgb(var(--accent))" radius={[0, 4, 4, 0]} barSize={20}>
                    {GPA_TREND.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.gpa >= 3.2 ? 'rgb(var(--success))' : entry.gpa >= 3.0 ? 'rgb(var(--accent))' : 'rgb(var(--warning))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pending documents */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[rgb(var(--warning))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Văn bản chờ phê duyệt</h3>
              </div>
              <span className="text-xs font-semibold text-[rgb(var(--warning))]">23 văn bản</span>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {PENDING_DOCS.map((doc) => (
                <div key={doc.so} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer" onClick={() => navigate('/dms/phe-duyet')}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    doc.urgency === 'khẩn'
                      ? 'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]'
                      : 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{doc.type} {doc.so}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Từ: {doc.from} — {doc.time}</p>
                  </div>
                  <Badge variant={doc.urgency === 'khẩn' ? 'error' : 'warning'} size="sm">
                    {doc.urgency === 'khẩn' ? 'Khẩn' : 'Thường'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 pt-3">
              <button
                onClick={() => navigate('/dms/phe-duyet')}
                className="w-full text-center text-sm font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-light))] transition-colors"
              >
                Xem tất cả 23 văn bản chờ duyệt
              </button>
            </div>
          </Card>

          {/* Recent activities */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hoạt động nổi bật</h3>
              </div>
              <span className="text-xs text-[rgb(var(--text-muted))]">Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {BGH_ACTIVITIES.map((a) => (
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
              {BGH_QUICK_ACTIONS.map((qa) => (
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
                  {qa.count && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[rgb(var(--warning)/0.1)] px-1.5 text-[10px] font-bold text-[rgb(var(--warning))]">
                      {qa.count}
                    </span>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Tuition status */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[rgb(var(--success))]" />
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
              {BGH_NOTIFICATIONS.map((n) => (
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

          {/* Research output */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[rgb(var(--accent))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">NCKH & HTQT</h3>
              </div>
              <span className="text-xs text-[rgb(var(--accent))] font-semibold">Q2/2026</span>
            </div>
            <CardContent className="p-5 space-y-4">
              {[
                { label: 'Đề tài đang thực hiện', value: '47', sub: '5 nghiệm thu Q2' },
                { label: 'Công bố quốc tế', value: '38', sub: 'Scopus/WoS năm 2026' },
                { label: 'Hợp tác quốc tế', value: '12', sub: 'Đối tác active' },
                { label: 'Đề tài cấp Bộ/Tỉnh', value: '8', sub: '4 đang triển khai' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[rgb(var(--text-secondary))]">{item.label}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{item.sub}</p>
                  </div>
                  <span className="text-lg font-bold text-[rgb(var(--accent))]">{item.value}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/rit')}
                className="w-full text-center text-sm font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-light))] transition-colors pt-2 border-t border-[rgb(var(--border))]"
              >
                Xem chi tiết NCKH
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
