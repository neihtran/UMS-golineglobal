import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const { t } = useTranslation('common');
  const { login: authLogin, isAuthenticated } = useAuth();
  const { user: storeUser, _hasHydrated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setHasHydrated(_hasHydrated); }, [_hasHydrated]);

  const ROLE_DASHBOARD_LOGIN: Record<string, string> = {
    SUPER_ADMIN: '/dashboard',
    HIEU_TRUONG: '/dashboard',
    PHO_HIEU_TRUONG: '/dashboard',
    TRUONG_KHOA: '/dashboard',
    GIAO_VIEN: '/portal',
    NHAN_VIEN: '/hrm',
    SINH_VIEN: '/portal',
  };

  // Redirect if already authenticated → go to their dashboard, not home
  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated && storeUser?.role) {
      navigate(ROLE_DASHBOARD_LOGIN[storeUser.role] ?? '/dashboard', { replace: true });
    }
  }, [isAuthenticated, hasHydrated]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // ─── Dev bypass: quick login by role ─────────────────────────────────────────
  const DEV_ACCOUNTS = [
    { role: 'SUPER_ADMIN', label: 'Quản trị viên', email: 'admin@truong.edu.vn', color: 'accent' },
    { role: 'HIEU_TRUONG', label: 'Hiệu trưởng', email: 'tran.dinh.long@truong.edu.vn', color: 'primary' },
    { role: 'PHO_HIEU_TRUONG', label: 'Phó Hiệu trưởng', email: 'nguyen.thi.lan.huong@truong.edu.vn', color: 'primary' },
    { role: 'TRUONG_KHOA', label: 'Trưởng khoa', email: 'hoang.minh.tuan@truong.edu.vn', color: 'primary' },
    { role: 'GIAO_VIEN', label: 'Giảng viên', email: 'nguyen.hoang.long@truong.edu.vn', color: 'success' },
    { role: 'NHAN_VIEN', label: 'Nhân viên', email: 'hoang.thi.lan@truong.edu.vn', color: 'warning' },
    { role: 'SINH_VIEN', label: 'Sinh viên', email: 'sv-2020-0001@sinhvien.truong.edu.vn', color: 'info' },
  ] as const;

  // ─── Dev login: call real API with seed account credentials ───────────────────
  const handleDevLogin = async (email: string) => {
    setLoading(true);
    setErrors({});
    try {
      // Dev bypass: call the real backend login API with seed account credentials
      // Seed accounts all have password: Password@123
      const result = await authLogin(email, 'Password@123');
      if (result?.mfaRequired) {
        navigate('/auth/mfa');
        return;
      }
      if (result?.error) {
        setErrors({ general: result.error });
        return;
      }
      // On success, authLogin already called storeLogin + navigate internally
    } catch {
      setErrors({ general: 'Đăng nhập thất bại. Thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = t('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t('validation.emailInvalid');
    if (!password) errs.password = t('validation.required');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const result = await authLogin(email.trim(), password);

      if (result?.mfaRequired) {
        navigate('/auth/mfa');
        return;
      }

      if (result?.error) {
        setErrors({ general: result.error });
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Loading splash while auth store rehydrates from localStorage */}
      {!hasHydrated && (
        <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-base))] w-full">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgb(var(--border))] border-t-[rgb(var(--primary))]" />
            <p className="text-sm text-[rgb(var(--text-muted))]">Đang khởi tạo...</p>
          </div>
        </div>
      )}

      {hasHydrated && (
      <>
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
        <div className="relative z-10">
          <img src="/logo-pedagogy.png" alt={t('nav.brandShort')} className="h-12 w-auto" />
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

          {/* General error */}
          {errors.general && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

            <Button type="submit" fullWidth loading={loading} size="lg">
              {t('login.submit')}
            </Button>
          </form>

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

          {/* ─── Dev bypass: quick role login ──────────────────────────── */}
          <div className="rounded-xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 space-y-2">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2">
              Dev bypass — đăng nhập nhanh
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEV_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDevLogin(acc.email)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] hover:bg-[rgb(var(--primary))/0.08] hover:border-[rgb(var(--primary))] transition-colors"
                >
                  <span className="text-[rgb(var(--text-secondary))]">{acc.label}</span>
                  <span className="block text-[rgb(var(--text-muted))] text-[10px] mt-0.5">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-[rgb(var(--text-muted))]">
            {t('login.contactHint')}
          </p>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
