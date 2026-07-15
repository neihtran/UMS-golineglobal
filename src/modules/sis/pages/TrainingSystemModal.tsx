import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Input, Select, Badge } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';

interface TrainingSystem {
  _id: string;
  code: string;
  name: string;
  description?: string;
  durationYears: number;
  status: 'draft' | 'pending' | 'published' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TrainingSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: TrainingSystem;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'archived', label: 'Đã lưu trữ' },
];

const DURATION_OPTIONS = [
  { value: '1', label: '1 năm' },
  { value: '2', label: '2 năm' },
  { value: '3', label: '3 năm' },
  { value: '4', label: '4 năm' },
  { value: '5', label: '5 năm' },
  { value: '6', label: '6 năm' },
];

export function TrainingSystemModal({ isOpen, onClose, mode, data }: TrainingSystemModalProps) {
  const { t } = useTranslation('sis');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    durationYears: 4,
    status: 'draft' as const,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or data changes
  useState(() => {
    if (isOpen && data) {
      setFormData({
        code: data.code,
        name: data.name,
        description: data.description || '',
        durationYears: data.durationYears,
        status: data.status,
        isActive: data.isActive,
      });
    } else if (isOpen && mode === 'create') {
      setFormData({
        code: '',
        name: '',
        description: '',
        durationYears: 4,
        status: 'draft',
        isActive: true,
      });
    }
    setErrors({});
  });

  const isViewMode = mode === 'view';
  const modeConfig = {
    create: { title: 'Thêm hệ đào tạo', submitText: 'Tạo mới' },
    edit: { title: 'Sửa hệ đào tạo', submitText: 'Lưu thay đổi' },
    view: { title: 'Chi tiết hệ đào tạo', submitText: null },
  };

  const config = modeConfig[mode];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) {
      newErrors.code = 'Mã hệ đào tạo không được để trống';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Tên hệ đào tạo không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isViewMode) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: Call API
      console.log('Submit:', mode, formData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      size="md"
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
        {/* Code */}
        <FormField label="Mã hệ đào tạo" error={errors.code}>
          {isViewMode ? (
            <div className="font-mono">{data?.code}</div>
          ) : (
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="VD: CQ, LT, VB2"
              uppercase
            />
          )}
        </FormField>

        {/* Name */}
        <FormField label="Tên hệ đào tạo" error={errors.name}>
          {isViewMode ? (
            <div>{data?.name}</div>
          ) : (
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Chính quy, Liên thông"
            />
          )}
        </FormField>

        {/* Description */}
        <FormField label="Mô tả">
          {isViewMode ? (
            <div>{data?.description || '—'}</div>
          ) : (
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn về hệ đào tạo..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40 resize-none"
            />
          )}
        </FormField>

        {/* Duration */}
        <FormField label="Thời gian đào tạo">
          {isViewMode ? (
            <div>{data?.durationYears} năm</div>
          ) : (
            <Select
              value={formData.durationYears}
              onChange={(e) =>
                setFormData({ ...formData, durationYears: Number(e.target.value) })
              }
              options={DURATION_OPTIONS}
            />
          )}
        </FormField>

        {/* Status */}
        <FormField label="Trạng thái quy trình">
          {isViewMode ? (
            <Badge
              variant={
                data?.status === 'published'
                  ? 'success'
                  : data?.status === 'draft'
                  ? 'neutral'
                  : 'warning'
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
                  status: e.target.value as 'draft' | 'pending' | 'published' | 'archived',
                })
              }
              options={STATUS_OPTIONS}
            />
          )}
        </FormField>

        {/* Active Toggle */}
        {!isViewMode && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium">
              {formData.isActive ? 'Hoạt động' : 'Ngừng sử dụng'}
            </span>
          </div>
        )}

        {/* View mode - Additional info */}
        {isViewMode && data && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">Thông tin bổ sung</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[rgb(var(--text-muted))]">Hoạt động:</span>
                <Badge
                  variant={data.isActive ? 'success' : 'neutral'}
                  className="ml-2"
                  dot
                  size="sm"
                >
                  {data.isActive ? 'Hoạt động' : 'Ngừng sử dụng'}
                </Badge>
              </div>
              <div>
                <span className="text-[rgb(var(--text-muted))]">Thời gian đào tạo:</span>
                <span className="ml-2">{data.durationYears} năm</span>
              </div>
              <div>
                <span className="text-[rgb(var(--text-muted))]">Ngày tạo:</span>
                <span className="ml-2">{new Date(data.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div>
                <span className="text-[rgb(var(--text-muted))]">Cập nhật lần cuối:</span>
                <span className="ml-2">{new Date(data.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
