import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers';
import { Button, Input } from '@/components/ui';

export default function Login() {
  const { t } = useTranslation('common');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const QUICK_ACCOUNTS = [
    { role: 'Quản trị viên', email: 'admin@truong-dhcn.vn' },
    { role: 'Hiệu trưởng', email: 'tran.dinh.long@truong.edu.vn' },
    { role: 'Phó Hiệu trưởng', email: 'nguyen.thi.lan.huong@truong.edu.vn' },
    { role: 'Trưởng khoa', email: 'truong.minh.tuan@truong.edu.vn' },
    { role: 'Giảng viên', email: 'nguyen.hoang.long@truong.edu.vn' },
    { role: 'Nhân viên', email: 'hoang.thi.tan@truong.edu.vn' },
    { role: 'Sinh viên', email: 'sv-2025-0001@sinhvien.truong.edu.vn' },
  ];

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
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

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

          {/* ─── Dev bypass quick login ──────────────────────────────────── */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-400 text-sm">⚠</span>
              <p className="text-sm font-semibold text-red-400">DEV BYPASS — ĐĂNG NHẬP NHANH</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('dev123456');
                    setErrors({});
                  }}
                  className="flex flex-col items-start rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 py-2 text-left transition-colors hover:border-[rgb(var(--primary))]/50 hover:bg-[rgb(var(--primary))]/5 cursor-pointer w-full"
                >
                  <span className="text-xs font-semibold text-[rgb(var(--text-primary))] leading-tight">{account.role}</span>
                  <span className="text-[10px] text-[rgb(var(--text-muted))] leading-tight mt-0.5 break-all">{account.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-[rgb(var(--text-muted))]">
            {t('login.contactHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
