import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Save, Globe, Clock, User as UserIcon, Lock } from 'lucide-react';
import { Button, toast } from '@/components/ui';
import { FormField } from '@/components/forms';
import { useIamProfile, useUpdateIamProfile, useChangePassword } from '@/hooks/useIam';
import { useAuthStore } from '@/stores/authStore';

const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8)' },
  { value: 'Asia/Seoul', label: 'Seoul (GMT+9)' },
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

interface ProfileFormState {
  preferred_language: string;
  timezone: string;
}

export default function AccountSettingsPage() {
  const profileQuery = useIamProfile();
  const updateMut = useUpdateIamProfile();
  const changePwMut = useChangePassword();
  const { updateUser } = useAuthStore();

  const profile = profileQuery.data?.data;
  const userProfile = profile?.profile;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileFormState>({
    preferred_language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        preferred_language: userProfile.preferred_language || 'vi',
        timezone: userProfile.timezone || 'Asia/Ho_Chi_Minh',
      });
      setAvatarPreview(userProfile.avatar || null);
    }
  }, [userProfile?.user_id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 2MB');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(userProfile?.avatar || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.preferred_language) errs.preferred_language = 'Vui lòng chọn ngôn ngữ';
    if (!form.timezone.trim()) errs.timezone = 'Vui lòng nhập múi giờ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await updateMut.mutateAsync({
        avatar: avatarFile || undefined,
        preferred_language: form.preferred_language,
        timezone: form.timezone,
      });
      toast.success(result?.message || 'Cập nhật thông tin thành công');
      if (result?.data) {
        updateUser({
          avatar: result.data.profile?.avatar || undefined,
        });
      }
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as Error).message
        || 'Cập nhật thất bại';
      toast.error(msg);
    }
  };

  const validatePassword = (): boolean => {
    const errs: Record<string, string> = {};
    if (!pwForm.current_password) errs.current_password = 'Vui lòng nhập mật khẩu hiện tại';
    if (!pwForm.new_password) errs.new_password = 'Vui lòng nhập mật khẩu mới';
    else if (pwForm.new_password.length < 8) errs.new_password = 'Mật khẩu mới tối thiểu 8 ký tự';
    if (!pwForm.new_password_confirmation) errs.new_password_confirmation = 'Vui lòng xác nhận mật khẩu mới';
    else if (pwForm.new_password !== pwForm.new_password_confirmation) errs.new_password_confirmation = 'Xác nhận mật khẩu không khớp';
    if (pwForm.new_password && pwForm.current_password && pwForm.new_password === pwForm.current_password) {
      errs.new_password = 'Mật khẩu mới không được trùng mật khẩu hiện tại';
    }
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      await changePwMut.mutateAsync({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
        new_password_confirmation: pwForm.new_password_confirmation,
      });
      toast.success('Đổi mật khẩu thành công');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setPwErrors({});
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as Error).message
        || 'Đổi mật khẩu thất bại';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {profileQuery.isLoading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-8 text-center text-sm text-[rgb(var(--text-muted))]">
          <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
          Đang tải thông tin tài khoản...
        </div>
      )}

      {profileQuery.isError && (
        <div className="rounded-xl border border-[rgb(var(--error))/0.3] bg-[rgb(var(--error))/0.05] p-4 text-sm text-[rgb(var(--error))]">
          Không thể tải thông tin tài khoản: {(profileQuery.error as Error).message}
        </div>
      )}

      {profile && (
        <>
          {/* ── Form thông tin & tùy chỉnh ── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Tên đăng nhập</p>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-1">{profile.username}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-1">{profile.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Vai trò</p>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))] mt-1">
                    {profile.roles && profile.roles.length > 0 ? profile.roles.join(', ') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">User ID</p>
                  <p className="text-sm font-mono text-[rgb(var(--text-primary))] mt-1">#{profile.id}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Ảnh đại diện
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-[rgb(var(--border))]" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-2xl font-bold text-[rgb(var(--primary))]">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {avatarFile && (
                    <button type="button" onClick={removeAvatar} className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors">
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <Button type="button" variant="outline" size="sm" leftIcon={<Camera className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()}>
                    {avatarPreview ? 'Đổi ảnh' : 'Chọn ảnh'}
                  </Button>
                  <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">PNG, JPG, GIF. Tối đa 2MB.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Tùy chỉnh hiển thị
              </h3>
              <FormField label="Ngôn ngữ ưu tiên" error={errors.preferred_language} required>
                <select
                  value={form.preferred_language}
                  onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                >
                  {LANGUAGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Múi giờ" error={errors.timezone} required>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                >
                  {TIMEZONE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </FormField>
              <div className="flex items-start gap-2 text-xs text-[rgb(var(--text-muted))] pt-2">
                <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Giờ hiện tại: {new Date().toLocaleString('vi-VN', { timeZone: form.timezone })}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="submit" disabled={updateMut.isPending} leftIcon={updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
                {updateMut.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>

          {/* ── Form đổi mật khẩu (độc lập) ── */}
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Đổi mật khẩu
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1.5">
                  Mật khẩu hiện tại <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                />
                {pwErrors.current_password && <p className="text-xs text-[rgb(var(--error))] mt-1">{pwErrors.current_password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1.5">
                  Mật khẩu mới <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                  placeholder="Tối thiểu 8 ký tự"
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                />
                {pwErrors.new_password && <p className="text-xs text-[rgb(var(--error))] mt-1">{pwErrors.new_password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1.5">
                  Xác nhận mật khẩu mới <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.new_password_confirmation}
                  onChange={(e) => setPwForm({ ...pwForm, new_password_confirmation: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                />
                {pwErrors.new_password_confirmation && <p className="text-xs text-[rgb(var(--error))] mt-1">{pwErrors.new_password_confirmation}</p>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[rgb(var(--text-secondary))]">
                <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]" />
                Hiện mật khẩu
              </label>
              <div className="pt-2">
                <Button type="submit" variant="outline" size="sm" disabled={changePwMut.isPending} leftIcon={changePwMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}>
                  {changePwMut.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
