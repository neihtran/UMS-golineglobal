import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Modal, Button, Input, Select, FormField, Badge } from '@/components/ui';

interface AcademicTerm {
  _id: string;
  code: string;
  academicYear: string;
  semester: number;
  termType: 'regular' | 'summer' | 'short';
  startDate: string;
  endDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  status: 'planning' | 'registration' | 'studying' | 'grading' | 'finished';
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcademicTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: AcademicTerm;
}

const TERM_TYPE_OPTIONS = [
  { value: 'regular', label: 'Chính quy' },
  { value: 'summer', label: 'Hè' },
  { value: 'short', label: 'Ngắn hạn' },
];

const SEMESTER_OPTIONS = [
  { value: '1', label: 'Học kỳ 1' },
  { value: '2', label: 'Học kỳ 2' },
  { value: '3', label: 'Học kỳ hè' },
];

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Lên kế hoạch' },
  { value: 'registration', label: 'Đăng ký' },
  { value: 'studying', label: 'Đang học' },
  { value: 'grading', label: 'Chấm điểm' },
  { value: 'finished', label: 'Kết thúc' },
];

export function AcademicTermModal({ isOpen, onClose, mode, data }: AcademicTermModalProps) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    academicYear: `${currentYear}-${currentYear + 1}`,
    semester: 1,
    termType: 'regular' as const,
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationEnd: '',
    status: 'planning' as const,
    isActive: true,
    isCurrent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isViewMode = mode === 'view';
  const modeConfig = {
    create: { title: 'Thêm học kỳ', submitText: 'Tạo mới' },
    edit: { title: 'Sửa học kỳ', submitText: 'Lưu thay đổi' },
    view: { title: 'Chi tiết học kỳ', submitText: null },
  };

  const config = modeConfig[mode];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.academicYear) {
      newErrors.academicYear = 'Năm học không được để trống';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu không được để trống';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc không được để trống';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isViewMode) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const code = `${formData.academicYear}-HK${formData.semester}`;
      console.log('Submit:', mode, { ...formData, code });
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      size="lg"
      footer={
        config.submitText ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              {config.submitText}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* Academic Year + Semester */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Năm học" error={errors.academicYear}>
            {isViewMode ? (
              <div className="flex items-center gap-2">
                {data?.academicYear}
                {data?.isCurrent && (
                  <Badge variant="success" size="sm">
                    Hiện tại
                  </Badge>
                )}
              </div>
            ) : (
              <Input
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="VD: 2026-2027"
              />
            )}
          </FormField>

          <FormField label="Học kỳ">
            {isViewMode ? (
              <div>
                Học kỳ {data?.semester}
                {data?.termType !== 'regular' && (
                  <span className="ml-1 text-[rgb(var(--text-muted))]">
                    ({TERM_TYPE_OPTIONS.find((o) => o.value === data?.termType)?.label})
                  </span>
                )}
              </div>
            ) : (
              <Select
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: Number(e.target.value) })
                }
                options={SEMESTER_OPTIONS}
              />
            )}
          </FormField>
        </div>

        {/* Term Type (only for create/edit) */}
        {!isViewMode && (
          <FormField label="Loại học kỳ">
            <Select
              value={formData.termType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  termType: e.target.value as 'regular' | 'summer' | 'short',
                })
              }
              options={TERM_TYPE_OPTIONS}
            />
          </FormField>
        )}

        {/* Time Period */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ngày bắt đầu" error={errors.startDate}>
            {isViewMode ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                {formatDateDisplay(data?.startDate || '')}
              </div>
            ) : (
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            )}
          </FormField>

          <FormField label="Ngày kết thúc" error={errors.endDate}>
            {isViewMode ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                {formatDateDisplay(data?.endDate || '')}
              </div>
            ) : (
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            )}
          </FormField>
        </div>

        {/* Registration Period */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ngày bắt đầu đăng ký">
            {isViewMode ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                {data?.registrationStart ? formatDateDisplay(data.registrationStart) : '—'}
              </div>
            ) : (
              <Input
                type="date"
                value={formData.registrationStart}
                onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
              />
            )}
          </FormField>

          <FormField label="Ngày kết thúc đăng ký">
            {isViewMode ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                {data?.registrationEnd ? formatDateDisplay(data.registrationEnd) : '—'}
              </div>
            ) : (
              <Input
                type="date"
                value={formData.registrationEnd}
                onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
              />
            )}
          </FormField>
        </div>

        {/* Status */}
        <FormField label="Trạng thái">
          {isViewMode ? (
            <Badge
              variant={
                data?.status === 'studying'
                  ? 'success'
                  : data?.status === 'registration'
                  ? 'info'
                  : data?.status === 'grading'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {STATUS_OPTIONS.find((o) => o.value === data?.status)?.label || data?.status}
            </Badge>
          ) : (
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'planning' | 'registration' | 'studying' | 'grading' | 'finished',
                })
              }
              options={STATUS_OPTIONS}
            />
          )}
        </FormField>

        {/* Current Term Toggle */}
        {!isViewMode && (
          <div className="flex items-center gap-3 p-3 bg-[rgb(var(--bg-secondary))] rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isCurrent: !formData.isCurrent })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isCurrent ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isCurrent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div>
              <span className="text-sm font-medium">Học kỳ hiện tại</span>
              <p className="text-xs text-[rgb(var(--text-muted))]">
                Chỉ một học kỳ được đánh dấu là hiện tại
              </p>
            </div>
          </div>
        )}

        {/* View mode - Additional info */}
        {isViewMode && data && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">Thông tin bổ sung</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[rgb(var(--text-muted))]">Mã học kỳ:</span>
                <span className="ml-2 font-mono">{data.code}</span>
              </div>
              <div>
                <span className="text-[rgb(var(--text-muted))]">Học kỳ hiện tại:</span>
                <Badge
                  variant={data.isCurrent ? 'success' : 'neutral'}
                  className="ml-2"
                  dot
                  size="sm"
                >
                  {data.isCurrent ? 'Có' : 'Không'}
                </Badge>
              </div>
              <div>
                <span className="text-[rgb(var(--text-muted))]">Hoạt động:</span>
                <Badge
                  variant={data.isActive ? 'success' : 'neutral'}
                  className="ml-2"
                  dot
                  size="sm"
                >
                  {data.isActive ? 'Có' : 'Không'}
                </Badge>
              </div>
              <div>
                <span className="text-[rgb(var(--text-muted))]">Ngày tạo:</span>
                <span className="ml-2">{new Date(data.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
