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
import { useCreateIamRole, useUpdateIamRole } from '@/hooks/useIam';
import type { Role, RoleStatus } from '@/types/iam.types';

interface RoleSheetProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}

export function RoleSheet({ open, onClose, role }: RoleSheetProps) {
  const isEdit = !!role;

  // Only return null when sheet is closed; allow null role for create mode
  if (!open) return null;

  const [form, setForm] = useState({
    code: role?.code || '',
    name: role?.name || '',
    description: role?.description || '',
    status: (role?.status ?? 1) as RoleStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMut = useCreateIamRole();
  const updateMut = useUpdateIamRole();
  const loading = createMut.isPending || updateMut.isPending;

  // Reset form when switching to edit a different role
  useEffect(() => {
    if (role) {
      setForm({
        code: role.code || '',
        name: role.name || '',
        description: role.description || '',
        status: (role.status ?? 1) as RoleStatus,
      });
    } else {
      setForm({ code: '', name: '', description: '', status: 1 as RoleStatus });
    }
    setErrors({});
  }, [role?.id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Mã vai trò không được để trống';
    if (!form.name.trim()) newErrors.name = 'Tên vai trò không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEdit && role) {
        await updateMut.mutateAsync({
          id: role.id,
          payload: {
            name: form.name,
            description: form.description || undefined,
            status: form.status,
          },
        });
        toast.success('Đã cập nhật vai trò');
      } else {
        await createMut.mutateAsync({
          code: form.code,
          name: form.name,
          description: form.description || undefined,
          status: form.status,
        });
        toast.success('Đã tạo vai trò mới');
      }
      onClose();
    } catch (e) {
      toast.error((e as Error).message || 'Thao tác thất bại');
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã vai trò" error={errors.code}>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="vd: GIAO_VIEN"
                disabled={isEdit}
              />
            </FormField>
            <FormField label="Tên vai trò" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="vd: Giảng viên"
              />
            </FormField>
          </div>

          <FormField label="Mô tả">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn về vai trò này"
            />
          </FormField>

          <FormField label="Trạng thái">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.status === 1}
                onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })}
              />
              <span className="text-sm text-[rgb(var(--text-secondary))]">
                Hoạt động
              </span>
            </label>
          </FormField>

          {!isEdit && (
            <p className="text-xs text-[rgb(var(--text-muted))]">
              Mã vai trò không thể thay đổi sau khi tạo.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo vai trò'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default RoleSheet;