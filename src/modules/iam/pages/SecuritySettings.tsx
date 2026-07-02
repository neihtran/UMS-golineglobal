import { useState } from 'react';
import {
  Lock, KeyRound, Smartphone, CheckCircle2, AlertTriangle,
  Save, ShieldCheck, Globe,
} from 'lucide-react';
import {
  Button, Badge, Card, CardContent, Switch,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

interface ToggleSetting { label: string; description: string; enabled: boolean; }
interface PasswordPolicy { label: string; value: number; unit: string; min: number; max: number; }
interface MFAProvider { id: string; name: string; description: string; status: 'active' | 'inactive'; }

const SESSION_SETTINGS: ToggleSetting[] = [
  { label: 'Yêu cầu MFA toàn hệ thống', description: 'Bắt buộc tất cả người dùng xác thực hai yếu tố', enabled: true },
  { label: 'MFA cho vai trò Quản trị', description: 'Chỉ yêu cầu MFA với tài khoản admin', enabled: false },
  { label: 'Tự động đăng xuất khi không hoạt động', description: 'Hết phiên sau thời gian không tương tác', enabled: true },
  { label: 'Giới hạn đăng nhập đồng thời', description: 'Mỗi tài khoản chỉ đăng nhập trên một thiết bị', enabled: false },
  { label: 'Chặn đăng nhập từ VPN nước ngoài', description: 'Cảnh báo khi phát hiện IP ngoài Việt Nam', enabled: false },
  { label: 'Ghi nhật ký đăng nhập thất bại', description: 'Lưu log khi đăng nhập sai mật khẩu nhiều lần', enabled: true },
  { label: 'Bảo vệ CSRF token', description: 'Bật bảo vệ Cross-Site Request Forgery', enabled: true },
  { label: 'Mã hóa session cookie', description: 'HttpOnly, Secure, SameSite=Strict cho session cookies', enabled: true },
];

const DEFAULT_PASSWORD_POLICY: PasswordPolicy[] = [
  { label: 'Độ dài tối thiểu', value: 8, unit: 'ký tự', min: 6, max: 20 },
  { label: 'Độ dài tối đa', value: 32, unit: 'ký tự', min: 20, max: 128 },
  { label: 'Số ký tự đặc biệt tối thiểu', value: 1, unit: 'ký tự', min: 0, max: 10 },
  { label: 'Số chữ số tối thiểu', value: 1, unit: 'chữ số', min: 0, max: 10 },
  { label: 'Hết hạn mật khẩu sau', value: 90, unit: 'ngày', min: 30, max: 365 },
  { label: 'Không được dùng lại mật khẩu cũ trong', value: 5, unit: 'lần gần nhất', min: 1, max: 20 },
];

const MFA_METHODS: MFAProvider[] = [
  { id: 'totp', name: 'Authenticator App (TOTP)', description: 'Google Authenticator, Authy, Microsoft Authenticator', status: 'active' },
  { id: 'email', name: 'Email OTP', description: 'Mã OTP gửi qua email đăng nhập', status: 'active' },
  { id: 'sms', name: 'SMS OTP', description: 'Mã OTP gửi qua tin nhắn SMS — phí dịch vụ', status: 'inactive' },
  { id: 'webauthn', name: 'Khóa bảo mật vật lý (WebAuthn)', description: 'YubiKey, Titan Security Key — bảo mật cao nhất', status: 'inactive' },
];

const SSO_PROVIDERS = [
  { name: 'VNeID', status: 'active' as const, logo: '🇻🇳', desc: 'Định danh điện tử — Bộ Công an' },
  { name: 'Microsoft Entra ID', status: 'active' as const, logo: '🪟', desc: 'SSO cho tài khoản .edu.vn — Azure AD' },
  { name: 'Google Workspace', status: 'inactive' as const, logo: '🔵', desc: 'Đăng nhập bằng tài khoản Google trường' },
];

export default function SecuritySettings() {
  const [sessionSettings, setSessionSettings] = useState(SESSION_SETTINGS);
  const [passwordPolicy, setPasswordPolicy] = useState(DEFAULT_PASSWORD_POLICY);
  const [mfaMethods, setMfaMethods] = useState(MFA_METHODS);
  const [ssoProviders, setSsoProviders] = useState(SSO_PROVIDERS);

  const toggle = (index: number) => {
    setSessionSettings((prev) => prev.map((s, i) => i === index ? { ...s, enabled: !s.enabled } : s));
  };

  const toggleMFA = (id: string) => {
    setMfaMethods((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m));
  };

  const adjustPolicy = (index: number, delta: number) => {
    setPasswordPolicy((prev) => prev.map((p, i) => {
      if (i !== index) return p;
      const newVal = p.value + delta;
      return { ...p, value: Math.min(Math.max(newVal, p.min), p.max) };
    }));
  };

  const toggleSSO = (index: number) => {
    setSsoProviders((prev) => prev.map((p, i) => i === index ? {
      ...p, status: p.status === 'active' ? 'inactive' : 'active'
    } : p));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cấu hình Bảo mật"
        description="IAM-01 — MFA, chính sách mật khẩu, SSO, và các thiết lập bảo mật nâng cao"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Cấu hình bảo mật' }]}
        actions={
          <Button leftIcon={<Save className="h-4 w-4" />}>Lưu thay đổi</Button>
        }
      />

      {/* Security score */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)]">
                <ShieldCheck className="h-7 w-7 text-[rgb(var(--success))]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Điểm bảo mật hệ thống</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">Cấu hình bảo mật hiện tại đạt mức Bảo vệ Tốt</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-4xl font-black text-[rgb(var(--success))]">78<span className="text-2xl">/100</span></p>
                <p className="text-xs text-[rgb(var(--success))] font-semibold">Khả thi triển khai</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
              <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: '78%' }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { label: 'Bật WebAuthn', status: 'warning' },
                { label: 'Bật chặn VPN nước ngoài', status: 'warning' },
                { label: 'Bật giới hạn đăng nhập đồng thời', status: 'warning' },
                { label: 'Tăng độ dài mật khẩu lên 12+', status: 'success' },
              ].map((r) => (
                <div key={r.label} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  r.status === 'success'
                    ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                    : 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]'
                }`}>
                  {r.status === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {r.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-4">Gợi ý cải thiện</h4>
            <div className="space-y-3">
              {[
                { icon: <KeyRound className="h-4 w-4" />, text: 'Bật WebAuthn cho tài khoản admin', color: 'warning' },
                { icon: <Globe className="h-4 w-4" />, text: 'Kích hoạt chặn IP ngoài VN', color: 'warning' },
                { icon: <Lock className="h-4 w-4" />, text: 'Tăng độ dài mật khẩu lên 12 ký tự', color: 'success' },
                { icon: <Smartphone className="h-4 w-4" />, text: 'Thêm SMS OTP như phương án dự phòng MFA', color: 'info' },
              ].map((s, i) => (
                <div key={i} className={`flex items-start gap-2.5 rounded-lg border p-2.5 ${
                  s.color === 'warning' ? 'border-[rgb(var(--warning)/0.2)] bg-[rgb(var(--warning)/0.05)]'
                    : s.color === 'info' ? 'border-[rgb(var(--info)/0.2)] bg-[rgb(var(--info)/0.05)]'
                    : 'border-[rgb(var(--success)/0.2)] bg-[rgb(var(--success)/0.05)]'
                }`}>
                  <span className={`shrink-0 ${
                    s.color === 'warning' ? 'text-[rgb(var(--warning))]'
                      : s.color === 'info' ? 'text-[rgb(var(--info))]'
                      : 'text-[rgb(var(--success))]'
                  }`}>{s.icon}</span>
                  <p className={`text-xs leading-relaxed ${
                    s.color === 'warning' ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--text-secondary))]'
                  }`}>{s.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA methods */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phương thức MFA</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Cấu hình các phương thức xác thực đa yếu tố</p>
          </div>
        </div>
        <CardContent className="divide-y divide-[rgb(var(--border)/0.5)]">
          {mfaMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  method.status === 'active'
                    ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                    : 'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                }`}>
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-[rgb(var(--text-primary))]">{method.name}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{method.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={method.status === 'active' ? 'success' : 'neutral'} dot>{method.status === 'active' ? 'Đang bật' : 'Tắt'}</Badge>
                <Switch
                  checked={method.status === 'active'}
                  onChange={() => toggleMFA(method.id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Password policy */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Chính sách Mật khẩu</h3>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Cấu hình yêu cầu về mật khẩu cho tất cả người dùng</p>
        </div>
        <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-3 py-5">
          {passwordPolicy.map((p, i) => (
            <div key={p.label} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4">
              <p className="text-xs text-[rgb(var(--text-muted))] mb-2">{p.label}</p>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{p.value}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{p.unit}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => adjustPolicy(i, -1)}
                    disabled={p.value <= p.min}
                    className="h-7 w-7 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-bold"
                  >−</button>
                  <button
                    onClick={() => adjustPolicy(i, 1)}
                    disabled={p.value >= p.max}
                    className="h-7 w-7 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-bold"
                  >+</button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Session & SSO */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Session settings */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thiết lập Phiên đăng nhập</h3>
          </div>
          <CardContent className="divide-y divide-[rgb(var(--border)/0.5)]">
            {sessionSettings.map((s, i) => (
              <div key={s.label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{s.label}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{s.description}</p>
                </div>
                <Switch
                  checked={s.enabled}
                  onChange={() => toggle(i)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SSO providers */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Single Sign-On (SSO)</h3>
          </div>
          <CardContent className="divide-y divide-[rgb(var(--border)/0.5)]">
            {ssoProviders.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.logo}</span>
                  <div>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{p.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{p.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={p.status === 'active'}
                  onChange={() => toggleSSO(i)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
