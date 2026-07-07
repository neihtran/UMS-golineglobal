import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';

const TOTAL_DIGITS = 6;

function OTPInput({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const firstEmpty = value.split('').findIndex((c) => !c);
    const focusIdx = firstEmpty === -1 ? TOTAL_DIGITS - 1 : firstEmpty;
    inputRefs.current[focusIdx]?.focus();
  }, []);

  const handleChange = (idx: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return;
    const digits = value.padEnd(TOTAL_DIGITS, ' ').split('');
    digits[idx] = ch;
    const next = digits.join('').trim();
    onChange(next);
    if (ch && idx < TOTAL_DIGITS - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (next.length === TOTAL_DIGITS) {
      inputRefs.current[TOTAL_DIGITS - 1]?.blur();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const digits = value.split('');
      if (digits[idx]) {
        digits[idx] = '';
        onChange(digits.join(''));
      } else if (idx > 0) {
        onChange(value.slice(0, -1));
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < TOTAL_DIGITS - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TOTAL_DIGITS);
    onChange(pasted);
    setTimeout(() => inputRefs.current[pasted.length - 1]?.focus(), 0);
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: TOTAL_DIGITS }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={[
            'h-14 w-12 rounded-lg border-2 bg-[rgb(var(--bg-card))] text-center text-2xl font-bold',
            'tracking-[0.25em] text-[rgb(var(--text-primary))] transition-all duration-150',
            'focus:outline-none focus:ring-2',
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/0.3'
              : 'border-[rgb(var(--border))] focus:border-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-light))/0.3',
          ].join(' ')}
          aria-label={`Mã số ${i + 1}`}
        />
      ))}
    </div>
  );
}

export default function MFA() {
  const navigate = useNavigate();
  const { mfaPending, login, clearMfaPending } = useAuthStore();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    if (!mfaPending) {
      navigate('/auth/login');
    }
  }, [mfaPending, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const isExpired = countdown === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== TOTAL_DIGITS) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    if (!mfaPending) {
      setError('Phiên xác thực đã hết hạn, vui lòng đăng nhập lại');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authService.verifyMfa(mfaPending.tempToken, code);
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      clearMfaPending();

      const ROLE_DASHBOARD: Record<string, string> = {
        SUPER_ADMIN: '/dashboard',
        HIEU_TRUONG: '/dashboard',
        PHO_HIEU_TRUONG: '/dashboard',
        TRUONG_KHOA: '/dashboard',
        GIAO_VIEN: '/portal',
        NHAN_VIEN: '/hrm',
        SINH_VIEN: '/portal',
      };
      navigate(ROLE_DASHBOARD[user.role] ?? '/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.error?.message ||
        'Mã xác thực không đúng, vui lòng thử lại';
      setError(msg);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    clearMfaPending();
    navigate('/auth/login');
  };

  if (!mfaPending) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-base))] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--accent))/0.15]">
              <ShieldCheck className="h-8 w-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">Xác thực bổ sung</h1>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Nhập mã 6 chữ số từ ứng dụng <strong>Authenticator</strong> của bạn
            </p>
            {mfaPending.user?.email && (
              <p className="text-xs text-[rgb(var(--text-muted))]">
                Tài khoản: {mfaPending.user.email}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <OTPInput value={code} onChange={setCode} hasError={!!error} />
              {error && (
                <p className="mt-3 text-center text-sm text-[rgb(var(--error))]" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="text-center">
              {isExpired ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm font-semibold text-[rgb(var(--primary))] hover:underline"
                >
                  Gửi lại mã
                </button>
              ) : (
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  Mã hết hạn sau{' '}
                  <span className="font-mono font-semibold text-[rgb(var(--text-primary))]">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                </p>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Xác nhận
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-[rgb(var(--text-muted))]">
            Không nhận được mã?{' '}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-[rgb(var(--primary))] hover:underline"
            >
              Đăng nhập lại
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
