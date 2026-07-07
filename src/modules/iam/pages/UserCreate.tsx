import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, UserPlus, Shield } from 'lucide-react';
import { Button, Card, CardContent, Input, Switch } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const DEPARTMENTS = ['Phòng Tổ chức', 'Phòng Tài chính', 'Phòng Đào tạo', 'Phòng KH-CN', 'Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ'];
const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Quản trị hệ thống', color: 'primary' },
  { value: 'HIEU_TRUONG', label: 'Hiệu trưởng', color: 'warning' },
  { value: 'PHO_HIEU_TRUONG', label: 'Phó Hiệu trưởng', color: 'success' },
  { value: 'TRUONG_KHOA', label: 'Trưởng khoa', color: 'neutral' },
  { value: 'GIAO_VIEN', label: 'Giảng viên', color: 'accent' },
  { value: 'NHAN_VIEN', label: 'Nhân viên hành chính', color: 'neutral' },
  { value: 'SINH_VIEN', label: 'Sinh viên', color: 'info' },
];

export default function UserCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', displayName: '', role: 'SINH_VIEN', dept: '', mfaRequired: true, sendWelcome: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/iam/tai-khoan');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo tài khoản mới"
        description="IAM-01 — Tạo tài khoản người dùng và gán vai trò trong hệ thống"
        breadcrumbs={[
          { label: 'IAM', href: '/iam' },
          { label: 'Tài khoản', href: '/iam/tai-khoan' },
          { label: 'Tạo tài khoản' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/iam/tai-khoan')}>Hủy</Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin tài khoản</h3>
            </div>
            <CardContent className="space-y-4 pt-5">
              <Input
                label="Email (*)"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@truong.edu.vn"
                required
              />
              <Input
                label="Họ và tên (*)"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Nhập họ và tên đầy đủ"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Vai trò (*)</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Khoa / Phòng ban</label>
                  <select
                    value={form.dept}
                    onChange={(e) => setForm({ ...form, dept: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cấu hình bảo mật</h3>
            </div>
            <CardContent className="space-y-5">
              <Switch
                label="Bắt buộc MFA"
                description="Người dùng phải xác thực 2 yếu tố khi đăng nhập"
                checked={form.mfaRequired}
                onChange={(e) => setForm({ ...form, mfaRequired: e.target.checked })}
              />
              <div className="border-t border-[rgb(var(--border)/0.4)]" />
              <Switch
                label="Gửi email chào mừng"
                description="Gửi thông tin đăng nhập qua email cho người dùng mới"
                checked={form.sendWelcome}
                onChange={(e) => setForm({ ...form, sendWelcome: e.target.checked })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Role preview */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Xem trước vai trò</h3>
            </div>
            <CardContent className="space-y-3 pt-4">
              {ROLE_OPTIONS.map((r) => (
                <div
                  key={r.value}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                    form.role === r.value
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]'
                      : 'border-[rgb(var(--border))] hover:border-[rgb(var(--border))]'
                  }`}
                  onClick={() => setForm({ ...form, role: r.value })}
                >
                  <Shield className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{r.label}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full bg-[rgb(var(--${r.color}))]`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-center gap-3 p-4 rounded-lg border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)]">
                <div className="h-10 w-10 rounded-full bg-[rgb(var(--success)/0.1)] flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-[rgb(var(--success))]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Email tạm thời</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Mật khẩu ngẫu nhiên 12 ký tự</p>
                </div>
              </div>
              <Button type="submit" className="w-full" leftIcon={<Save className="h-4 w-4" />}>
                Tạo tài khoản
              </Button>
              <p className="text-center text-xs text-[rgb(var(--text-muted))]">
                Tài khoản sẽ được tạo với trạng thái "Chờ kích hoạt"
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
