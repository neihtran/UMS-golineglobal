import { useState } from 'react';
import {
  Smartphone, Mail, MessageSquare, Usb, ShieldCheck, CheckCircle2,
  Save, QrCode, RefreshCw,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Switch } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const MFA_METHODS = [
  {
    id: 'totp',
    name: 'Authenticator App',
    description: 'Quét mã QR hoặc nhập khóa bí mật trên ứng dụng xác thực như Google Authenticator, Authy, Microsoft Authenticator.',
    icon: <QrCode className="h-5 w-5" />,
    status: 'active' as const,
    enrolled: 342,
    color: 'success',
  },
  {
    id: 'email',
    name: 'Email OTP',
    description: 'Nhận mã OTP 6 chữ số qua email đăng nhập mỗi khi đăng nhập từ thiết bị mới.',
    icon: <Mail className="h-5 w-5" />,
    status: 'active' as const,
    enrolled: 512,
    color: 'info',
  },
  {
    id: 'sms',
    name: 'SMS OTP',
    description: 'Nhận mã OTP qua tin nhắn SMS đến số điện thoại đã đăng ký. Phí dịch vụ theo nhà mạng.',
    icon: <MessageSquare className="h-5 w-5" />,
    status: 'inactive' as const,
    enrolled: 0,
    color: 'neutral',
  },
  {
    id: 'webauthn',
    name: 'Khóa bảo mật vật lý (WebAuthn)',
    description: 'Dùng thiết bị phần cứng bảo mật như YubiKey, Titan Security Key. Bảo mật cao nhất, chống lừa đảo (phishing).',
    icon: <Usb className="h-5 w-5" />,
    status: 'inactive' as const,
    enrolled: 0,
    color: 'neutral',
  },
];

const ENROLLED_USERS = [
  { id: 'u01', name: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', method: 'TOTP', enrolledAt: '2024-01-15', lastUsed: '2026-06-26' },
  { id: 'u02', name: 'Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', method: 'Email OTP', enrolledAt: '2024-03-10', lastUsed: '2026-06-26' },
  { id: 'u03', name: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn', method: 'TOTP', enrolledAt: '2024-05-22', lastUsed: '2026-06-25' },
  { id: 'u04', name: 'Bùi Minh Tuấn', email: 'tuan.bui@truong.edu.vn', method: 'Email OTP', enrolledAt: '2024-08-01', lastUsed: '2026-06-24' },
  { id: 'u05', name: 'Lê Thị Bình', email: 'binh.le@truong.edu.vn', method: 'TOTP', enrolledAt: '2025-01-12', lastUsed: '2026-06-20' },
  { id: 'u06', name: 'Trần Minh Đức', email: 'minh.duc@truong.edu.vn', method: 'Email OTP', enrolledAt: '2025-03-05', lastUsed: '2026-06-18' },
];

const METHOD_CONFIG: Record<string, { variant: 'success' | 'info' | 'neutral'; label: string }> = {
  totp: { variant: 'success', label: 'TOTP' },
  email: { variant: 'info', label: 'Email OTP' },
  sms: { variant: 'neutral', label: 'SMS OTP' },
  webauthn: { variant: 'neutral', label: 'WebAuthn' },
};

const POLICY_OPTIONS = [
  { value: 'required_all', label: 'Bắt buộc MFA toàn hệ thống', desc: 'Tất cả người dùng phải bật MFA để tiếp tục đăng nhập', recommended: true },
  { value: 'required_admin', label: 'Chỉ bắt buộc vai trò Admin', desc: 'Chỉ tài khoản quản trị viên phải bật MFA', recommended: false },
  { value: 'optional', label: 'Tùy chọn (khuyến khích)', desc: 'Người dùng tự quyết định có bật MFA hay không', recommended: false },
  { value: 'disabled', label: 'Tắt MFA', desc: 'Không yêu cầu xác thực đa yếu tố (không khuyến khích)', recommended: false },
];

export default function MFAConfig() {
  const [methods, setMethods] = useState(MFA_METHODS);
  const [policy, setPolicy] = useState('required_all');
  const [saved, setSaved] = useState(false);

  const toggleMethod = (id: string) => {
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' as const : 'active' as const } : m));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalEnrolled = methods.reduce((s, m) => s + m.enrolled, 0);
  const activeMethods = methods.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cấu hình MFA"
        description="IAM-01 — Thiết lập phương thức xác thực đa yếu tố (Multi-Factor Authentication)"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Cấu hình MFA' }]}
        actions={
          <Button
            leftIcon={saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            onClick={handleSave}
          >
            {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng người dùng đã bật MFA', value: totalEnrolled, icon: <ShieldCheck className="h-5 w-5" />, color: 'success' },
          { label: 'Tổng nhân sự toàn trường', value: 340, icon: <CheckCircle2 className="h-5 w-5" />, color: 'primary' },
          { label: 'Tỷ lệ đăng ký MFA', value: `${Math.round((totalEnrolled / 340) * 100)}%`, icon: <CheckCircle2 className="h-5 w-5" />, color: totalEnrolled / 340 >= 0.8 ? 'success' : 'warning' },
          { label: 'Phương thức đang bật', value: activeMethods, icon: <Smartphone className="h-5 w-5" />, color: 'info' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MFA methods */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phương thức xác thực</h3>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Bật/tắt các phương thức MFA mà người dùng có thể sử dụng</p>
        </div>
        <CardContent className="divide-y divide-[rgb(var(--border)/0.5)]">
          {methods.map((method) => (
            <div key={method.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  method.status === 'active'
                    ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                    : 'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                }`}>
                  {method.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-[rgb(var(--text-primary))]">{method.name}</p>
                    {method.status === 'active' && (
                      <Badge variant="success" dot size="sm">Đang bật</Badge>
                    )}
                    {method.enrolled > 0 && (
                      <Badge variant="neutral" size="sm">{method.enrolled} người dùng</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">{method.description}</p>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  checked={method.status === 'active'}
                  onChange={() => toggleMethod(method.id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Policy */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Chính sách MFA</h3>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Chọn mức bắt buộc MFA cho người dùng trong hệ thống</p>
        </div>
        <CardContent className="space-y-3 py-5">
          {POLICY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                policy === opt.value
                  ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] ring-1 ring-[rgb(var(--primary))]'
                  : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] hover:bg-[rgb(var(--bg-hover))]'
              }`}
            >
              <input
                type="radio"
                name="mfa_policy"
                value={opt.value}
                checked={policy === opt.value}
                onChange={() => setPolicy(opt.value)}
                className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary))]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium text-sm ${policy === opt.value ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'}`}>
                    {opt.label}
                  </p>
                  {opt.recommended && (
                    <span className="rounded-full border border-[rgb(var(--success))] bg-[rgb(var(--success)/0.1)] px-2 py-0.5 text-[10px] font-bold text-[rgb(var(--success))]">
                      Khuyến nghị
                    </span>
                  )}
                </div>
                <p className="text-xs text-[rgb(var(--text-secondary))]">{opt.desc}</p>
              </div>
              {policy === opt.value && (
                <CheckCircle2 className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
              )}
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Enrolled users */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Người dùng đã đăng ký MFA</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Danh sách nhân sự đã bật và sử dụng MFA</p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>Làm mới</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {['Người dùng', 'Email', 'Phương thức', 'Ngày đăng ký', 'Sử dụng lần cuối'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {ENROLLED_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-[rgb(var(--text-primary))]">{user.name}</p>
                  </td>
                  <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{user.email}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={METHOD_CONFIG[user.method.toLowerCase().replace(' ', '')]?.variant || 'neutral'} size="sm">
                      {user.method}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{user.enrolledAt}</td>
                  <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{user.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
