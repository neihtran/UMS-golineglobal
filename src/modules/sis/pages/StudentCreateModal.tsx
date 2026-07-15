import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useCreateStudent, type CreateStudentInput } from '@/hooks/useSis';
import { useDepartmentList } from '@/hooks/useHrm';

interface StudentCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function StudentCreateModal({ open, onClose }: StudentCreateModalProps) {
  const createMutation = useCreateStudent();
  const { data: deptResp } = useDepartmentList({ isActive: true });
  
  const departments = (deptResp as any)?.data ?? [];
  
  const [form, setForm] = useState<CreateStudentInput>({
    code: '',
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
    className: '',
    major: '',
    department: '',
    courseYear: 1,
    enrollmentDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof CreateStudentInput, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Mã sinh viên không được để trống';
    if (!form.name.trim()) newErrors.name = 'Họ tên không được để trống';
    if (!form.department.trim()) newErrors.department = 'Khoa không được để trống';
    if (!form.enrollmentDate) newErrors.enrollmentDate = 'Ngày nhập học không được để trống';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Backend validates courseYear as 1-10 (năm học thứ)
    const cy = parseInt(String(form.courseYear));
    const payload = {
      ...form,
      courseYear: !isNaN(cy) && cy >= 1 && cy <= 10 ? cy : 1,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        onClose();
        setForm({
          code: '',
          name: '',
          email: '',
          phone: '',
          gender: '',
          dob: '',
          address: '',
          className: '',
          major: '',
          department: '',
          courseYear: 1,
          enrollmentDate: new Date().toISOString().split('T')[0],
        });
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[rgb(var(--bg-card))] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Thêm sinh viên mới</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[rgb(var(--bg-hover))] transition-colors"
          >
            <X className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Mã sinh viên <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => set('code', e.target.value)}
                  placeholder="VD: SV-2024-0001"
                  error={errors.code}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Họ tên <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="VD: Nguyễn Văn An"
                  error={errors.email}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@sinhvien.edu.vn"
                  error={errors.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Số điện thoại
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="0901234567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Giới tính
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value)}
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set('dob', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                Địa chỉ
              </label>
              <Input
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Địa chỉ thường trú"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Lớp
                </label>
                <Input
                  value={form.className}
                  onChange={(e) => set('className', e.target.value)}
                  placeholder="VD: 24T1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  Ngành học
                </label>
                <Input
                  value={form.major}
                  onChange={(e) => set('major', e.target.value)}
                  placeholder="VD: Công nghệ Thông tin"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                Khoa <span className="text-[rgb(var(--error))]">*</span>
              </label>
              <select
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
              >
                <option value="">Chọn khoa</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-xs text-[rgb(var(--error))]">{errors.department}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                Khoá (Năm thứ)
              </label>
              <Input
                type="number"
                value={form.courseYear}
                onChange={(e) => set('courseYear', parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                placeholder="1-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
              Ngày nhập học <span className="text-[rgb(var(--error))]">*</span>
            </label>
            <Input
              type="date"
              value={form.enrollmentDate}
              onChange={(e) => set('enrollmentDate', e.target.value)}
              error={errors.enrollmentDate}
            />
          </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgb(var(--border))]">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="student-form"
            disabled={createMutation.isPending}
            loading={createMutation.isPending}
          >
            Thêm sinh viên
          </Button>
        </div>
      </div>
    </div>
  );
}
