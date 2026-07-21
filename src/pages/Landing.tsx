import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  DollarSign,
  ClipboardList,
  BarChart3,
  ScanSearch,
  Globe,
  Award,
  Building2,
  FlaskConical,
  Puzzle,
  GraduationCap as GraduationCapLib,
  Landmark,
  CheckCircle,
  ArrowRight,
  Lock,
  Eye,
  Zap,
  Database,
  ChevronRight,
  Layers,
  Bell,
} from 'lucide-react';

const HERO_STATS = [
  { value: '12.800+', label: 'Sinh viên', icon: <GraduationCap className="h-5 w-5" /> },
  { value: '310+', label: 'Cán bộ & nhân viên', icon: <Users className="h-5 w-5" /> },
  { value: '20+', label: 'Phân hệ tích hợp', icon: <Layers className="h-5 w-5" /> },
  { value: '18', label: 'Phân hệ đồng bộ', icon: <Puzzle className="h-5 w-5" /> },
];

const SECURITY_FEATURES = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'RBAC', desc: 'Phân quyền linh hoạt theo 12 vai trò: từ Ban Giám hiệu đến Sinh viên' },
  { icon: <Lock className="h-5 w-5" />, title: '2FA / MFA', desc: 'Xác thực đa yếu tố bảo vệ tài khoản nghiêm ngặt' },
  { icon: <Eye className="h-5 w-5" />, title: 'SSO', desc: 'Đăng nhập một lần, truy cập toàn hệ thống không cần nhớ nhiều mật khẩu' },
  { icon: <Database className="h-5 w-5" />, title: 'Audit Log', desc: 'Ghi nhận toàn bộ hoạt động, minh bạch và truy vết mọi thao tác' },
];

const MODULES = [
  { name: 'IAM', label: 'Quản trị Hệ thống', color: '#1E3A5F', icon: <ShieldCheck className="h-5 w-5" />, desc: 'SSO · RBAC · MFA · Audit Log' },
  { name: 'HRM', label: 'Nhân sự', color: '#2563EB', icon: <Users className="h-5 w-5" />, desc: 'Hồ sơ · Hợp đồng · Lương · Nghỉ phép' },
  { name: 'SIS', label: 'Đào tạo & Sinh viên', color: '#7C3AED', icon: <GraduationCap className="h-5 w-5" />, desc: 'CTĐT · Tuyển sinh · Đăng ký HP · Điểm' },
  { name: 'DMS', label: 'Văn bản Điện tử', color: '#D97706', icon: <FileText className="h-5 w-5" />, desc: 'Ký số · Phê duyệt · Lưu trữ' },
  { name: 'FIN', label: 'Tài chính & Kế toán', color: '#DC2626', icon: <DollarSign className="h-5 w-5" />, desc: 'Học phí · Chi lương · Quyết toán' },
  { name: 'LMS', label: 'Dạy học Số', color: '#059669', icon: <BookOpen className="h-5 w-5" />, desc: 'SCORM/xAPI · Bài tập · Điểm quá trình' },
  { name: 'EXAM', label: 'Thi trực tuyến', color: '#CA8A04', icon: <Award className="h-5 w-5" />, desc: 'Ngân hàng câu hỏi · Thi có giám sát' },
  { name: 'PORTAL', label: 'Cổng thông tin', color: '#0891B2', icon: <Globe className="h-5 w-5" />, desc: 'SV · Giảng viên · Một cổng duy nhất' },
  { name: 'WMS', label: 'Quản lý Công việc', color: '#9333EA', icon: <ClipboardList className="h-5 w-5" />, desc: 'Giao việc · Deadline · Trách nhiệm' },
  { name: 'BI', label: 'Phân tích Dữ liệu', color: '#2563EB', icon: <BarChart3 className="h-5 w-5" />, desc: 'Dashboard · Báo cáo thời gian thực' },
  { name: 'OCR', label: 'Số hóa Tài liệu', color: '#6B7280', icon: <ScanSearch className="h-5 w-5" />, desc: 'OCR đa ngữ · Hồ sơ giấy → số' },
  { name: 'LIB', label: 'Thư viện', color: '#1E3A5F', icon: <BookOpen className="h-5 w-5" />, desc: 'E-book · Mượn/trả trực tuyến' },
  { name: 'KTX', label: 'Ký túc xá', color: '#059669', icon: <Building2 className="h-5 w-5" />, desc: 'Đăng ký phòng · Quản lý tiện ích' },
  { name: 'RIT', label: 'NCKH & HTQT', color: '#7C3AED', icon: <FlaskConical className="h-5 w-5" />, desc: 'Đề tài · Hợp tác quốc tế' },
  { name: 'DCE', label: 'Năng lực Số', color: '#7C3AED', icon: <GraduationCapLib className="h-5 w-5" />, desc: 'DigCompEdu · Lộ trình cá nhân hóa' },
  { name: 'INT', label: 'Tích hợp Quốc gia', color: '#059669', icon: <Puzzle className="h-5 w-5" />, desc: 'HEMIS · VNeID · Kho bạc Nhà nước' },
  { name: 'PMS', label: 'Công tác Đảng', color: '#DC2626', icon: <Landmark className="h-5 w-5" />, desc: 'Hồ sơ đảng viên · Kết nạp · Chi bộ' },
  { name: 'QA', label: 'Kiểm định Chất lượng', color: '#0891B2', icon: <Award className="h-5 w-5" />, desc: 'AUN-QA · Minh chứng · Tài sản' },
];

const INTEGRATIONS = [
  { name: 'HEMIS', desc: 'Hệ thống thông tin quản lý giáo dục — Bộ GD&ĐT' },
  { name: 'VNeID', desc: 'Định danh điện tử — Bộ Công an' },
  { name: 'CSDL Văn bằng', desc: 'Cơ sở dữ liệu quốc gia về văn bằng' },
  { name: 'Kho bạc Nhà nước', desc: 'Hệ thống quản lý ngân sách nhà nước' },
  { name: 'Cổng Dịch vụ Công', desc: 'Dịch vụ công trực tuyến quốc gia' },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function AnimatedStat({ value, label, icon, delay }: {
  value: string; label: string; icon: React.ReactNode; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const numeric = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  const count = useCountUp(numeric, 2000, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))]">
        {icon}
      </div>
      <p className="text-3xl font-black text-white">
        {visible ? `${count.toLocaleString()}${suffix}` : '0'}
      </p>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  );
}

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);

  const FEATURES = [
    {
      title: 'Một nền tảng, một chân lý',
      desc: 'Dữ liệu nhập một lần, dùng chung toàn hệ thống. Không còn "đảo dữ liệu" giữa các phòng ban.',
      highlight: 'Tiết kiệm 95% thời gian tổng hợp báo cáo',
    },
    {
      title: 'Đồng bộ từ nhân sự đến sinh viên',
      desc: 'HRM là nguồn danh tính gốc cho IAM. SIS quản lý toàn bộ quy trình đào tạo từ tuyển sinh đến tốt nghiệp.',
      highlight: '100% văn bản ký số sau 3 năm',
    },
    {
      title: 'Quyết định dựa trên dữ liệu',
      desc: 'BI Dashboard cho Ban Giám hiệu — báo cáo thời gian thực, không cần chờ tổng hợp Excel.',
      highlight: 'Dashboard tự động cập nhật mọi lúc',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((f) => (f + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F2035 0%, #1E3A5F 40%, #2D5D8A 100%)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full border border-white/5" />
          <div className="absolute -top-16 -left-16 h-[380px] w-[380px] rounded-full border border-white/5" />
          <div className="absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-white/[0.02]" />
          {/* Floating orbs */}
          <div className="absolute right-20 top-20 h-2 w-2 rounded-full bg-[rgb(var(--accent))] animate-pulse opacity-60" />
          <div className="absolute right-40 top-40 h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse" />
          <div className="absolute left-1/4 bottom-1/3 h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28">
          {/* Logo */}
          <div className="mb-8 flex justify-center animate-fade-in">
            <img src="/logo-pedagogy.png" alt="Trường Đại học Sư phạm - Đại học Đà Nẵng" className="h-20 w-auto mb-6" />
          </div>

          {/* Badge */}
          <div className="mb-8 flex justify-center animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-[rgb(var(--accent))]" />
              Phiên bản 1.0 — Tháng 6/2026
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl font-black leading-tight text-white animate-fade-in-up sm:text-5xl lg:text-6xl">
              Hệ thống Quản lý
              <br />
              <span className="gradient-text">Đại học Toàn diện</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Nền tảng số hóa toàn bộ quy trình vận hành — từ đào tạo, nhân sự,
              tài chính đến NCKH và hợp tác quốc tế. Tích hợp 18 phân hệ trên
              một hệ thống duy nhất.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-300">
            <Link
              to="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--accent))] px-7 py-3.5 text-base font-bold text-[rgb(var(--primary-dark))] shadow-lg transition-all hover:bg-[rgb(var(--accent-light))] hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              Xem demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            {/* <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-0.5">
              Xem demo
            </button> */}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in-up delay-500">
            {HERO_STATS.map((s, i) => (
              <AnimatedStat key={s.label} {...s} delay={i * 100} />
            ))}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgb(var(--bg-base))] to-transparent" />
      </section>

      {/* ─── SECURITY ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--primary))]">
            Bảo mật doanh nghiệp
          </p>
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
            4 trụ cột bảo mật
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECURITY_FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 transition-all hover:border-[rgb(var(--primary-light))] hover-lift animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))] transition-colors group-hover:bg-[rgb(var(--primary))] group-hover:text-white">
                {f.icon}
              </div>
              <h3 className="mb-1 font-semibold text-[rgb(var(--text-primary))]">{f.title}</h3>
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURE HIGHLIGHT ───────────────────────────────────────────── */}
      <section className="bg-[rgb(var(--bg-base))] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: tabs */}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--primary))]">
                Tính năng nổi bật
              </p>
              <h2 className="mb-8 text-3xl font-bold text-[rgb(var(--text-primary))]">
                Chuyển đổi số toàn diện
              </h2>
              <div className="space-y-3">
                {FEATURES.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFeature(i)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      activeFeature === i
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)] shadow-md'
                        : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--primary-light))]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        activeFeature === i
                          ? 'bg-[rgb(var(--primary))] text-white'
                          : 'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`font-semibold ${activeFeature === i ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'}`}>
                        {f.title}
                      </span>
                    </div>
                    {activeFeature === i && (
                      <div className="mt-2 ml-9 animate-fade-in">
                        <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{f.desc}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--success)/0.1)] px-3 py-1 text-xs font-semibold text-[rgb(var(--success))]">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {f.highlight}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: visual */}
            <div className="relative">
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <p className="ml-2 text-xs text-[rgb(var(--text-muted))]">Dashboard — BGH</p>
                </div>
                {/* Mock dashboard */}
                <div className="space-y-3">
                  {[
                    { label: 'Tổng sinh viên', value: '12.847', change: '+124', color: '#1E3A5F' },
                    { label: 'Tốt nghiệp HK1', value: '2.341', change: '+8%', color: '#16A34A' },
                    { label: 'Học phí thu được', value: '42.5 tỷ', change: '+12%', color: '#2563EB' },
                    { label: 'Đề tài NCKH', value: '156', change: '+23', color: '#7C3AED' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm text-[rgb(var(--text-secondary))]">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{item.value}</span>
                        <span className="text-xs font-semibold text-[rgb(var(--success))]">{item.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))]/10 to-[rgb(var(--accent))/10]" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODULES SHOWCASE ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--primary))]">
              18 phân hệ tích hợp
            </p>
            <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
              Toàn bộ vận hành đại học
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[rgb(var(--text-secondary))]">
              Từ quản lý nhân sự, đào tạo, tài chính đến nghiên cứu khoa học — tất cả trên một nền tảng duy nhất, dữ liệu đồng bộ.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {MODULES.map((m, i) => (
              <div
                key={m.name}
                className="group rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 transition-all hover:-translate-y-1 hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${(i % 5) * 80}ms` }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${m.color}15`, color: m.color }}>
                  {m.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-[rgb(var(--text-muted))]">{m.name}</p>
                <p className="mt-0.5 text-sm font-semibold text-[rgb(var(--text-primary))] leading-tight">{m.label}</p>
                <p className="mt-1 text-xs text-[rgb(var(--text-muted))] leading-tight">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NATIONAL INTEGRATION ─────────────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: 'linear-gradient(135deg, #0F2035 0%, #1E3A5F 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
              Liên thông Quốc gia
            </p>
            <h2 className="text-3xl font-bold text-white">Kết nối hệ thống cấp Nhà nước</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/50">
              UMS tích hợp chính thức với các cơ sở dữ liệu và hệ thống thông tin quốc gia theo quy định của Bộ GD&ĐT.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {INTEGRATIONS.map((int, i) => (
              <div
                key={int.name}
                className="rounded-xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm animate-fade-in-up hover:bg-white/10 transition-colors"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))]">
                  <Database className="h-5 w-5" />
                </div>
                <p className="font-bold text-white">{int.name}</p>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">{int.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.05)] px-4 py-1.5">
            <Bell className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-sm font-medium text-[rgb(var(--primary))]">Đánh giá thực tập cho đơn vị ngoài</span>
          </div>
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
            Sẵn sàng chuyển đổi số?
          </h2>
          <p className="mt-4 text-[rgb(var(--text-secondary))]">
            Giảng viên trường phổ thông hoặc đơn vị ngoài có thể đánh giá sinh viên thực tập qua link — không cần tạo tài khoản.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--primary))] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[rgb(var(--primary-light))] hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              Đăng nhập hệ thống
              <ChevronRight className="h-5 w-5" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-8 py-4 text-base font-semibold text-[rgb(var(--text-primary))] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              Liên hệ hỗ trợ
            </button>
          </div>
          <p className="mt-8 text-sm text-[rgb(var(--text-muted))]">
            Liên hệ{' '}
            <span className="font-medium text-[rgb(var(--primary))]">phong-cong-nghe@truong.edu.vn</span>
            {' '}nếu cần hỗ trợ triển khai
          </p>
        </div>
      </section>
    </div>
  );
}
