import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut, KeyRound, User as UserIcon, Mail, Phone, Globe, Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  toast,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { PageHeader } from '@/components/layout';
import {
  useChangePassword,
  useHqnhatLogout,
  useIamProfile,
  useIamMyPermissions,
} from '@/hooks/useIam';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  system: 'Tài khoản hệ thống',
  employee: 'Cán bộ',
  student: 'Sinh viên',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const profileQuery = useIamProfile();
  const permsQuery = useIamMyPermissions();
  const logoutMut = useHqnhatLogout();
  const changeMut = useChangePassword();

  const profile = profileQuery.data?.data;

  const [pwForm, setPwForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setPwForm({ old_password: '', new_password: '', new_password_confirmation: '' });
    setPwErrors({});
  }, [profile?.id]);

  const validatePassword = () => {
    const e: Record<string, string> = {};
    if (!pwForm.old_password) e.old_password = 'Vui lòng nhập mật khẩu hiện tại';
    if (!pwForm.new_password) e.new_password = 'Vui lòng nhập mật khẩu mới';
    else if (pwForm.new_password.length < 8) e.new_password = 'Mật khẩu mới tối thiểu 8 ký tự';
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      e.new_password_confirmation = 'Xác nhận mật khẩu không khớp';
    }
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    try {
      await changeMut.mutateAsync(pwForm);
      toast.success('Đổi mật khẩu thành công');
      setPwForm({ old_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      toast.error((err as Error).message || 'Đổi mật khẩu thất bại');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Đăng xuất khỏi hệ thống?')) return;
    try {
      await logoutMut.mutateAsync();
      toast.success('Đã đăng xuất');
      navigate('/auth/login');
    } catch (err) {
      toast.error((err as Error).message || 'Đăng xuất thất bại');
    }
  };

  const fullName = profile?.profile?.full_name || profile?.username || '—';
  const initials = fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const roles = profile?.roles ?? [];
  const perms = permsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Thông tin tài khoản, quyền hạn và cài đặt bảo mật"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Hồ sơ cá nhân' }]}
        actions={
          <Button
            variant="outline"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
            disabled={logoutMut.isPending}
          >
            Đăng xuất
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            {profileQuery.isLoading ? (
              <p className="text-sm text-[rgb(var(--text-muted))]">Đang tải...</p>
            ) : profileQuery.isError ? (
              <p className="text-sm text-[rgb(var(--error))]">{(profileQuery.error as Error).message || 'Không thể tải hồ sơ.'}</p>
            ) : (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-2xl font-bold text-[rgb(var(--primary))]">
                  {initials || '?'}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[rgb(var(--text-primary))]">{fullName}</h2>
                <p className="text-sm text-[rgb(var(--text-muted))]">@{profile?.username}</p>
                <Badge variant={profile?.status === 'ACTIVE' ? 'success' : 'error'} dot className="mt-3">
                  {profile?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bị khóa'}
                </Badge>
                <p className="mt-3 text-xs text-[rgb(var(--text-muted))]">
                  {ACCOUNT_TYPE_LABELS[profile?.account_type ?? ''] ?? profile?.account_type ?? ''}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {roles.length ? (
                    roles.map(r => <Badge key={r} variant="primary" size="sm">{r}</Badge>)
                  ) : (
                    <Badge variant="neutral" size="sm">Chưa gán vai trò</Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Details + change password */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Thông tin chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileQuery.isLoading ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">Đang tải...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] p-3">
                    <Mail className="h-4 w-4 text-[rgb(var(--text-muted))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Email</p>
                      <p className="text-[rgb(var(--text-primary))]">{profile?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] p-3">
                    <Phone className="h-4 w-4 text-[rgb(var(--text-muted))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Số điện thoại</p>
                      <p className="text-[rgb(var(--text-primary))]">{profile?.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] p-3">
                    <Globe className="h-4 w-4 text-[rgb(var(--text-muted))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Ngôn ngữ</p>
                      <p className="text-[rgb(var(--text-primary))]">
                        {profile?.profile?.preferred_language?.toUpperCase() ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] p-3">
                    <Globe className="h-4 w-4 text-[rgb(var(--text-muted))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Múi giờ</p>
                      <p className="text-[rgb(var(--text-primary))]">{profile?.profile?.timezone ?? '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Đổi mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <FormField label="Mật khẩu hiện tại" error={pwErrors.old_password}>
                <Input
                  type="password"
                  value={pwForm.old_password}
                  onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </FormField>
              <FormField label="Mật khẩu mới" error={pwErrors.new_password}>
                <Input
                  type="password"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                  placeholder="Tối thiểu 8 ký tự"
                />
              </FormField>
              <FormField label="Xác nhận mật khẩu mới" error={pwErrors.new_password_confirmation}>
                <Input
                  type="password"
                  value={pwForm.new_password_confirmation}
                  onChange={(e) => setPwForm({ ...pwForm, new_password_confirmation: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </FormField>
              <Button
                onClick={handleChangePassword}
                disabled={changeMut.isPending}
                leftIcon={changeMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {changeMut.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Quyền của tôi ({perms.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {permsQuery.isLoading ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Đang tải...
                </p>
              ) : permsQuery.isError ? (
                <p className="text-sm text-[rgb(var(--error))]">{(permsQuery.error as Error).message || 'Không thể tải quyền.'}</p>
              ) : perms.length === 0 ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">Tài khoản chưa được gán quyền nào.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto">
                  {perms.map(p => (
                    <code key={p.id} className="text-xs font-mono bg-[rgb(var(--bg-base))] px-2 py-0.5 rounded">
                      {p.code}
                    </code>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}