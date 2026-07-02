import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';

const TOTAL_DIGITS = 6;

function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first empty input on mount
    const firstEmpty = value.split('').findIndex((c) => !c);
    const focusIdx = firstEmpty === -1 ? TOTAL_DIGITS - 1 : firstEmpty;
    inputRefs.current[focusIdx]?.focus();
  }, []);

  const handleChange = (idx: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return; // only digits
    const digits = value.padEnd(TOTAL_DIGITS, ' ').split('');
    digits[idx] = ch;
    const next = digits.join('').trim();

    onChange(next);

    // Auto-advance focus
    if (ch && idx < TOTAL_DIGITS - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-submit when complete
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
    inputRefs.current[pasted.length - 1]?.focus();
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
          className="h-14 w-12 rounded-lg border-2 border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-center text-2xl font-bold tracking-[0.25em] text-[rgb(var(--text-primary))] transition-all duration-150 focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
          aria-label={`Mã số ${i + 1}`}
        />
      ))}
    </div>
  );
}

export default function MFA() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Countdown timer
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
    setError('');
    setLoading(true);
    try {
      // Demo: accept any 6-digit code
      await new Promise((r) => setTimeout(r, 1000));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(300);
    setCode('');
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg-base))] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-[var(--shadow-lg)] p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--accent)/0.15)]">
              <ShieldCheck className="h-8 w-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="text-center space-y-2 mb-8">
            <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">Xác thực bổ sung</h1>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Nhập mã 6 chữ số từ ứng dụng <strong>Authenticator</strong> của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <OTPInput value={code} onChange={setCode} />
              {error && (
                <p className="mt-3 text-center text-sm text-[rgb(var(--error))]" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* Countdown */}
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
            <button type="button" onClick={handleResend} className="font-medium text-[rgb(var(--primary))] hover:underline">
              Gửi lại
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
