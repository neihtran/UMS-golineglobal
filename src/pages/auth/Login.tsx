import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, CheckCircle2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@/constants/modules';
import type { User } from '@/types/auth.types';

const DEV_DEMO_USER: User = {
  id: 'dev-admin-001',
  email: 'dev-admin@ums.local',
  name: 'Dev Admin',
  username: 'devadmin',
  displayName: 'Dev Admin',
  role: ROLES.ADMIN,
  permissions: ['*'],
  department: 'dev-dept',
  title: 'Quản trị viên',
  phone: '0900000000',
  status: 'active',
  mfaEnabled: false,
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function Login() {
  const { t } = useTranslation('common');
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const QUICK_ACCOUNTS = [
    { role: 'Quản trị viên',   name: 'Quản trị viên',             email: 'admin@truong.edu.vn',             password: 'Admin@123' },
    { role: 'Hiệu trưởng',     name: 'GS.TS. Hoàng Tuấn Anh',     email: 'hieutruong@truong.edu.vn',        password: 'Ht@123' },
    { role: 'Phó Hiệu trưởng', name: 'PGS.TS. Trần Lan Hương',   email: 'phohieutruong@truong.edu.vn',     password: 'Pht@123' },
    { role: 'Trưởng khoa',     name: 'TS. Nguyễn Hoàng Long',     email: 'truongkhoa@truong.edu.vn',        password: 'Tk@123' },
    { role: 'Giảng viên',      name: 'ThS. Lê Văn Minh',          email: 'giaovien1@truong.edu.vn',         password: 'Gv1@123' },
    { role: 'Nhân viên',       name: 'CN. Hoàng Thị Tân',          email: 'nhanvien@truong.edu.vn',          password: 'Nv@123' },
    { role: 'Sinh viên',       name: 'Nguyễn Văn An',              email: 'sinhvien1@truong.edu.vn',         password: 'Sv@123' },
  ];

  const [selectedQuickEmail, setSelectedQuickEmail] = useState<string | null>(null);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = t('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('validation.emailInvalid');
    if (!password) errs.password = t('validation.required');
    else if (password.length < 6) errs.password = t('validation.passwordMinLength', { min: 6 });
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError(null);

    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error: any) {
      setApiError(error?.response?.data?.error?.message || error?.message || 'Đăng nhập thất bại');
    }
  };

  const handleQuickLogin = (account: typeof QUICK_ACCOUNTS[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedQuickEmail(account.email);
    setErrors({});
    setApiError(null);
  };

  const handleDemoLogin = () => {
    const { login } = useAuthStore.getState();
    login(DEV_DEMO_USER, 'dev-bypass-token', 'dev-bypass-refresh');
    // Delay navigation to allow Zustand state + persist to sync first
    setTimeout(() => {
      navigate('/dashboard/admin', { replace: true });
    }, 50);
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="flex min-h-screen">
      {/* ─── Left panel: branding ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F2035 0%, #1E3A5F 50%, #2D5D8A 100%)',
        }}
      >
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full border border-white/5" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full border border-white/5" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo-pedagogy.png" alt="Trường Đại học Sư phạm" className="h-16 w-auto object-contain" />
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60 leading-tight">ĐẠI HỌC ĐÀ NẴNG</p>
            <p className="text-sm font-bold text-white leading-tight">TRƯỜNG ĐẠI HỌC SƯ PHẠM</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            {t('login.heroTitle1')}<br />
            <span className="text-[rgb(var(--accent))]">{t('login.heroTitle2')}</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            {t('login.heroDescription')}
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {['IAM · HRM · SIS', 'LMS · EXAM · FIN', 'DMS · WMS · BI', 'OCR · KTX · RIT'].map((tag) => (
              <span key={tag} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '18', labelKey: 'login.statModules' },
            { value: '8K+', labelKey: 'login.statStudents' },
            { value: '500+', labelKey: 'login.statLecturers' },
          ].map(({ value, labelKey }) => (
            <div key={labelKey} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/50">{t(labelKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right panel: form ────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-8 bg-[rgb(var(--bg-base))]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]">
              <span className="text-lg font-bold text-white">U</span>
            </div>
            <span className="text-lg font-bold text-[rgb(var(--text-primary))]">UMS</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{t('login.title')}</h2>
            <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* API Error */}
            {apiError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500">
                {apiError}
              </div>
            )}

            <Input
              label={t('login.emailLabel')}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label={t('login.passwordLabel')}
              type="password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
                />
                <span className="text-[rgb(var(--text-secondary))]">{t('login.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-[rgb(var(--primary))] hover:underline font-medium">
                {t('login.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              {t('login.submit')}
            </Button>
          </form>

          {/* Demo Mode Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full rounded-xl border-2 border-dashed border-[rgb(var(--accent))]/50 bg-[rgb(var(--accent))]/5 px-4 py-3 text-sm font-semibold text-[rgb(var(--accent))] transition-all hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/10 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Bỏ qua đăng nhập (Demo Mode)
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgb(var(--border))]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[rgb(var(--bg-base))] px-3 text-[rgb(var(--text-muted))]">{t('login.or')}</span>
            </div>
          </div>

          <Button variant="outline" fullWidth size="lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
            </svg>
            {t('login.ssoButton')}
          </Button>

          {/* Quick login accounts */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-semibold text-blue-400">ĐĂNG NHẬP NHANH</p>
              </div>
              <span className="text-[10px] text-[rgb(var(--text-muted))] italic">Click để điền</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACCOUNTS.map((account) => {
                const isSelected = selectedQuickEmail === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleQuickLogin(account)}
                    className={cn(
                      'flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-all w-full',
                      isSelected
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 ring-1 ring-[rgb(var(--primary))]/30'
                        : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] hover:border-[rgb(var(--primary))]/50 hover:bg-[rgb(var(--primary))]/5'
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[rgb(var(--text-primary))] leading-tight">
                        {account.role}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--primary))]" />
                      )}
                    </span>
                    <span className="text-[11px] font-medium text-[rgb(var(--text-secondary))] leading-tight mt-0.5 line-clamp-1">
                      {account.name}
                    </span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))] leading-tight mt-0.5 break-all">
                      {account.email}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[rgb(var(--text-muted))] italic">
              Tài khoản demo — tự động điền mật khẩu tương ứng. Nhấn "Đăng nhập" để vào hệ thống.
            </p>
          </div>

          <p className="text-center text-xs text-[rgb(var(--text-muted))]">
            {t('login.contactHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
