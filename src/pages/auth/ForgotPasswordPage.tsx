import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Input, toast } from '@/components/ui';
import { FormField } from '@/components/forms';
import {
  useForgotPassword,
  useResetPassword,
  useVerifyResetToken,
} from '@/hooks/useIam';

type Step = 'request' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const forgotMut = useForgotPassword();
  const verifyMut = useVerifyResetToken();
  const resetMut = useResetPassword();

  const validateRequest = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Vui lòng nhập tên đăng nhập';
    else if (!/^[a-zA-Z0-9._-]+$/.test(username)) e.username = 'Tên đăng nhập không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRequest = async () => {
    if (!validateRequest()) return;
    try {
      const result = await forgotMut.mutateAsync({ username });
      const resetToken = (result as { reset_token?: string })?.reset_token;
      if (resetToken) {
        setToken(resetToken);
        toast.success('Token đặt lại đã được tạo. Vui lòng nhập mật khẩu mới.');
        setStep('reset');
      } else {
        toast.success('Yêu cầu đã được gửi. Kiểm tra email của bạn để nhận token.');
        setStep('reset');
      }
    } catch (err) {
      toast.error((err as Error).message || 'Gửi yêu cầu thất bại');
    }
  };

  const validateReset = () => {
    const e: Record<string, string> = {};
    if (!token.trim()) e.token = 'Vui lòng nhập token đặt lại';
    if (!password) e.password = 'Vui lòng nhập mật khẩu mới';
    else if (password.length < 8) e.password = 'Mật khẩu tối thiểu 8 ký tự';
    if (password !== passwordConfirm) e.passwordConfirm = 'Xác nhận mật khẩu không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validateReset()) return;
    try {
      await verifyMut.mutateAsync({ username, token });
      await resetMut.mutateAsync({
        username,
        token,
        password,
        password_confirmation: passwordConfirm,
      });
      toast.success('Đặt lại mật khẩu thành công');
      setStep('done');
    } catch (err) {
      toast.error((err as Error).message || 'Đặt lại mật khẩu thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-base))] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] mb-3">
            <KeyRound className="h-7 w-7 text-[rgb(var(--primary))]" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Quên mật khẩu</h1>
          <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
            {step === 'request' && 'Nhập tên đăng nhập để nhận token đặt lại mật khẩu'}
            {step === 'reset' && 'Nhập token và mật khẩu mới của bạn'}
            {step === 'done' && 'Mật khẩu đã được đặt lại thành công'}
          </p>
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6 shadow-sm">
          {step === 'request' && (
            <div className="space-y-4">
              <FormField label="Tên đăng nhập" error={errors.username} required>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="vd: nguyen.van.a hoặc student_001"
                  autoFocus
                />
              </FormField>
              <Button
                onClick={handleRequest}
                disabled={forgotMut.isPending}
                className="w-full"
                leftIcon={forgotMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {forgotMut.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4">
              <FormField label="Token đặt lại" error={errors.token} required>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Dán token từ email vào đây"
                />
              </FormField>
              <FormField label="Mật khẩu mới" error={errors.password} required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                />
              </FormField>
              <FormField label="Xác nhận mật khẩu" error={errors.passwordConfirm} required>
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </FormField>
              <Button
                onClick={handleReset}
                disabled={resetMut.isPending || verifyMut.isPending}
                className="w-full"
                leftIcon={resetMut.isPending || verifyMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {resetMut.isPending || verifyMut.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="h-12 w-12 mx-auto text-[rgb(var(--success))]" />
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[rgb(var(--border))] flex justify-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1 text-sm text-[rgb(var(--primary))] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}