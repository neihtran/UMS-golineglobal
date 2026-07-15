import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useDepartmentList } from '@/hooks/useHrm';
import { useUpdateStudent, type Student } from '@/hooks/useSis';

interface StudentEditModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

const schema = z.object({
  code: z.string().min(1, 'Mã sinh viên không được để trống'),
  name: z.string().min(1, 'Họ tên không được để trống'),
  dob: z.string().optional(),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  cccd: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  department: z.string().min(1, 'Khoa không được để trống'),
  className: z.string().optional(),
  courseYear: z.coerce.number().min(1, 'Khóa phải lớn hơn 0').optional(),
  status: z.enum(['studying', 'graduated', 'suspended', 'expelled', 'reserved']),
  enrollmentDate: z.string().min(1, 'Ngày nhập học không được để trống'),
  gpa: z.coerce.number().min(0).max(4).optional(),
  totalCredits: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function StudentEditModal({ open, onClose, student }: StudentEditModalProps) {
  const { data: deptResp } = useDepartmentList({ isActive: true });
  const departments = (deptResp as any)?.data ?? [];
  const updateStudent = useUpdateStudent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'studying',
    },
  });

  useEffect(() => {
    if (student && open) {
      reset({
        code: student.code,
        name: student.name,
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        gender: student.gender ?? '',
        ethnicity: student.ethnicity ?? '',
        cccd: student.cccd ?? '',
        address: student.address ?? '',
        phone: student.phone ?? '',
        email: student.email ?? '',
        department: typeof student.department === 'object'
          ? (student.department as any)._id
          : student.department,
        className: student.className ?? '',
        courseYear: student.courseYear,
        status: student.status,
        enrollmentDate: student.enrollmentDate
          ? new Date(student.enrollmentDate).toISOString().split('T')[0]
          : '',
        gpa: student.gpa,
        totalCredits: student.totalCredits,
      });
    }
  }, [student, open, reset]);

  const onSubmit = (data: FormValues) => {
    if (!student?._id) return;
    updateStudent.mutate(
      { id: student._id, ...data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[rgb(var(--bg-card))] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
            Sửa thông tin sinh viên
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[rgb(var(--bg-hover))] transition-colors"
          >
            <X className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="edit-student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide mb-3">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Mã sinh viên <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <Input
                    {...register('code')}
                    placeholder="Nhập mã sinh viên"
                    error={errors.code?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Họ tên <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Nhập họ tên"
                    error={errors.name?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Ngày sinh
                  </label>
                  <Input
                    type="date"
                    {...register('dob')}
                    error={errors.dob?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Giới tính
                  </label>
                  <select
                    {...register('gender')}
                    className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Dân tộc
                  </label>
                  <Input
                    {...register('ethnicity')}
                    placeholder="Nhập dân tộc"
                    error={errors.ethnicity?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Số CCCD
                  </label>
                  <Input
                    {...register('cccd')}
                    placeholder="Nhập số CCCD"
                    error={errors.cccd?.message}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Địa chỉ
                  </label>
                  <Input
                    {...register('address')}
                    placeholder="Nhập địa chỉ"
                    error={errors.address?.message}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide mb-3">
                Liên hệ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Điện thoại
                  </label>
                  <Input
                    {...register('phone')}
                    placeholder="Nhập số điện thoại"
                    error={errors.phone?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Email
                  </label>
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="Nhập email"
                    error={errors.email?.message}
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide mb-3">
                Thông tin học tập
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Khoa <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <select
                    {...register('department')}
                    className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                  >
                    <option value="">Chọn khoa</option>
                    {departments.map((d: any) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Lớp
                  </label>
                  <Input
                    {...register('className')}
                    placeholder="Nhập lớp"
                    error={errors.className?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Khoá (Năm thứ)
                  </label>
                  <Input
                    type="number"
                    {...register('courseYear')}
                    placeholder="1-10"
                    min={1}
                    max={10}
                    error={errors.courseYear?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Ngày nhập học <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <Input
                    type="date"
                    {...register('enrollmentDate')}
                    error={errors.enrollmentDate?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Số tín chỉ tích lũy
                  </label>
                  <Input
                    type="number"
                    {...register('totalCredits')}
                    placeholder="0"
                    error={errors.totalCredits?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    GPA
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('gpa')}
                    placeholder="0.00 - 4.00"
                    error={errors.gpa?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    {...register('status')}
                    className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
                  >
                    <option value="studying">Đang học</option>
                    <option value="reserved">Bảo lưu</option>
                    <option value="suspended">Tạm ngưng</option>
                    <option value="graduated">Đã tốt nghiệp</option>
                    <option value="expelled">Đình chỉ</option>
                  </select>
                </div>
              </div>
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
            form="edit-student-form"
            disabled={updateStudent.isPending}
            loading={updateStudent.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
