import { useState } from 'react';
import { Modal, Button, Input, Select, FormField, Badge } from '@/components/ui';

interface Major {
  _id: string;
  code: string;
  name: string;
}

interface Specialization {
  _id: string;
  code: string;
  name: string;
  description?: string;
  major: Major;
  status: 'draft' | 'pending' | 'published' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SpecializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: Specialization;
  majors: Major[];
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'archived', label: 'Đã lưu trữ' },
];

export function SpecializationModal({ isOpen, onClose, mode, data, majors }: SpecializationModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    major: '',
    status: 'draft' as const,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isViewMode = mode === 'view';
  const modeConfig = {
    create: { title: 'Thêm chuyên ngành', submitText: 'Tạo mới' },
    edit: { title: 'Sửa chuyên ngành', submitText: 'Lưu thay đổi' },
    view: { title: 'Chi tiết chuyên ngành', submitText: null },
  };

  const config = modeConfig[mode];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) {
      newErrors.code = 'Mã chuyên ngành không được để trống';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Tên chuyên ngành không được để trống';
    }
    if (!formData.major && mode === 'create') {
      newErrors.major = 'Vui lòng chọn ngành';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isViewMode) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      console.log('Submit:', mode, formData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const majorOptions = majors.map((m) => ({ value: m._id, label: m.name }));

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
        <FormField label="Mã chuyên ngành" error={errors.code}>
          {isViewMode ? (
            <div className="font-mono">{data?.code}</div>
          ) : (
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="VD: AI, KTTT, ATTT"
              uppercase
            />
          )}
        </FormField>

        {/* Name */}
        <FormField label="Tên chuyên ngành" error={errors.name}>
          {isViewMode ? (
            <div>{data?.name}</div>
          ) : (
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Trí tuệ nhân tạo"
            />
          )}
        </FormField>

        {/* Major */}
        <FormField label="Ngành cha" error={errors.major}>
          {isViewMode ? (
            <div>{(data?.major as any)?.name || '—'}</div>
          ) : (
            <Select
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              options={majorOptions}
              placeholder="Chọn ngành"
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
              placeholder="Mô tả ngắn về chuyên ngành..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40 resize-none"
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
