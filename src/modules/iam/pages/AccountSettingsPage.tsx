import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Save, Globe, Clock, User as UserIcon } from 'lucide-react';
import {
  Button,
  toast,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { useIamProfile, useUpdateIamProfile } from '@/hooks/useIam';
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
      // Cập nhật authStore để sidebar header reflect thay đổi
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin tài khoản (read-only) */}
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

          {/* Avatar upload */}
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Ảnh đại diện
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover border-2 border-[rgb(var(--border))]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-2xl font-bold text-[rgb(var(--primary))]">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {avatarFile && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                    title="Hủy ảnh đã chọn"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Camera className="h-4 w-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? 'Đổi ảnh' : 'Chọn ảnh'}
                </Button>
                <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">
                  PNG, JPG, GIF. Tối đa 2MB. Nên dùng ảnh vuông.
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Tùy chọn hiển thị
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
              <span>Giờ hiện tại theo múi giờ đã chọn: {new Date().toLocaleString('vi-VN', { timeZone: form.timezone })}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-[rgb(var(--bg-base))] py-3 -mx-1 px-1 border-t border-[rgb(var(--border))]">
            <Button
              type="submit"
              disabled={updateMut.isPending}
              leftIcon={updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            >
              {updateMut.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}