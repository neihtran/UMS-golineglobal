import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Input,
  Checkbox,
  toast,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { useCreateIamUser, useIamRoles, useUpdateIamUser, useAssignIamUserRoles } from '@/hooks/useIam';
import type { Role, User, UserStatusString } from '@/types/iam.types';

interface AccountSheetProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const STATUS_OPTIONS: { value: UserStatusString; label: string }[] = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'LOCKED', label: 'Bị khóa' },
  { value: 'SUSPENDED', label: 'Tạm ngừng' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: '', label: 'Chọn loại tài khoản' },
  { value: 'system', label: 'Hệ thống' },
  { value: 'employee', label: 'Cán bộ' },
  { value: 'student', label: 'Sinh viên' },
];

interface FormState {
  username: string;
  email: string;
  full_name: string;
  phone: string;
  status: UserStatusString;
  account_type: string;
  role_codes: string[];
  password: string;
  sendEmail: boolean;
}

const empty: FormState = {
  username: '',
  email: '',
  full_name: '',
  phone: '',
  status: 'ACTIVE',
  account_type: '',
  role_codes: [],
  password: '',
  sendEmail: true,
};

export function AccountSheet({ open, onClose, user }: AccountSheetProps) {
  const isEdit = !!user;
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rolesQuery = useIamRoles({ per_page: 100 });
  const createMut = useCreateIamUser();
  const updateMut = useUpdateIamUser();
  const assignRoleMut = useAssignIamUserRoles();
  const loading = createMut.isPending || updateMut.isPending;

  // Sync form khi sheet mở/đóng (không phụ thuộc user refetch)
  useEffect(() => {
    if (open) {
      if (user) {
        setForm({
          username: user.username || '',
          email: user.email || '',
          full_name: user.profile?.full_name || '',
          phone: user.phone || '',
          status: (user.status as UserStatusString) ?? 'ACTIVE',
          account_type: user.account_type ?? '',
          role_codes: user.roles ?? [],
          password: '',
          sendEmail: false,
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = 'Tên đăng nhập không được để trống';
    if (!form.email.trim()) e.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.full_name.trim()) e.full_name = 'Họ và tên không được để trống';
    if (!isEdit && !form.password) e.password = 'Mật khẩu không được để trống';
    else if (!isEdit && form.password.length < 8) e.password = 'Mật khẩu tối thiểu 8 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleRole = (code: string) => {
    setForm(prev => ({
      ...prev,
      role_codes: prev.role_codes.includes(code)
        ? prev.role_codes.filter(c => c !== code)
        : [...prev.role_codes, code],
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEdit && user) {
        await updateMut.mutateAsync({
          id: user.id,
          payload: {
            email: form.email,
            phone: form.phone || undefined,
            full_name: form.full_name,
            status: form.status,
            account_type: form.account_type || undefined,
          },
        });
        // Gán vai trò sau khi update thông tin
        await assignRoleMut.mutateAsync({
          id: user.id,
          payload: { role_codes: form.role_codes },
        });
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await createMut.mutateAsync({
          username: form.username,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          full_name: form.full_name,
          account_type: form.account_type || undefined,
          role_codes: form.role_codes.length ? form.role_codes : undefined,
        });
        toast.success('Tạo tài khoản thành công');
      }
      onClose();
    } catch (err) {
      toast.error((err as Error).message || 'Thao tác thất bại');
    }
  };

  const roles = (rolesQuery.data?.data ?? []) as Role[];

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <FormField label="Tên đăng nhập" error={errors.username} required>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="vd: nguyen.van.a"
              disabled={isEdit}
            />
          </FormField>

          <FormField label="Họ và tên" error={errors.full_name} required>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="vd: Nguyễn Văn A"
            />
          </FormField>

          <FormField label="Email" error={errors.email} required>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vd: email@truong.edu.vn"
              type="email"
            />
          </FormField>

          <FormField label="Số điện thoại">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="vd: 0987654321"
            />
          </FormField>

          <FormField label="Loại tài khoản">
            <select
              value={form.account_type}
              onChange={(e) => setForm({ ...form, account_type: e.target.value })}
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            >
              {ACCOUNT_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Vai trò">
            {rolesQuery.isLoading ? (
              <p className="text-sm text-[rgb(var(--text-muted))]">Đang tải vai trò...</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto rounded-lg border border-[rgb(var(--border))] p-3">
                {roles.length === 0 && (
                  <p className="text-sm text-[rgb(var(--text-muted))]">Chưa có vai trò nào.</p>
                )}
                {roles.map(r => (
                  <label key={r.code} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.role_codes.includes(r.code)}
                      onChange={() => toggleRole(r.code)}
                    />
                    <span className="text-sm text-[rgb(var(--text-secondary))]">
                      {r.name} <code className="text-xs text-[rgb(var(--text-muted))]">({r.code})</code>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {isEdit && (
              <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                Có thể dùng trang "Vai trò người dùng" để chỉnh sửa nhanh.
              </p>
            )}
          </FormField>

          <FormField label="Trạng thái">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as UserStatusString })}
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </FormField>

          {!isEdit && (
            <>
              <FormField label="Mật khẩu" error={errors.password} required>
                <Input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  type="password"
                  placeholder="Tối thiểu 8 ký tự"
                />
              </FormField>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.sendEmail}
                  onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                />
                <span className="text-sm text-[rgb(var(--text-secondary))]">
                  Gửi email thông báo cho người dùng
                </span>
              </label>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AccountSheet;