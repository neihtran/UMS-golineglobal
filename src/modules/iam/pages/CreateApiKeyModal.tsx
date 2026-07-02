import { useState } from 'react';
import { Key, AlertTriangle } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';

interface CreateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: ApiKeyData) => void;
}

interface ApiKeyData {
  name: string;
  description: string;
  scopes: string[];
  dailyLimit: number;
  expiresIn: number;
}

const AVAILABLE_SCOPES = [
  { value: 'sis:read', label: 'SIS — Đọc dữ liệu sinh viên', group: 'SIS' },
  { value: 'sis:write', label: 'SIS — Ghi dữ liệu sinh viên', group: 'SIS' },
  { value: 'hrm:read', label: 'HRM — Đọc nhân sự', group: 'HRM' },
  { value: 'hrm:write', label: 'HRM — Ghi nhân sự', group: 'HRM' },
  { value: 'lms:read', label: 'LMS — Đọc dữ liệu học tập', group: 'LMS' },
  { value: 'lms:write', label: 'LMS — Ghi dữ liệu học tập', group: 'LMS' },
  { value: 'fin:read', label: 'FIN — Đọc tài chính', group: 'FIN' },
  { value: 'fin:write', label: 'FIN — Ghi tài chính', group: 'FIN' },
  { value: 'auth:verify', label: 'AUTH — Xác thực định danh', group: 'AUTH' },
  { value: 'vbqg:read', label: 'CSDL VBQG — Đọc', group: 'VBQG' },
  { value: 'vbqg:write', label: 'CSDL VBQG — Ghi', group: 'VBQG' },
  { value: 'dce:read', label: 'DCE — Đọc năng lực số', group: 'DCE' },
  { value: 'admin:*', label: 'ADMIN — Toàn quyền (⚠️ cực kỳ nguy hiểm)', group: 'ADMIN' },
];

const GROUPED_SCOPES = AVAILABLE_SCOPES.reduce<Record<string, typeof AVAILABLE_SCOPES>>((acc, scope) => {
  if (!acc[scope.group]) acc[scope.group] = [];
  acc[scope.group].push(scope);
  return acc;
}, {});

const EXPIRY_OPTIONS = [
  { value: 30, label: '30 ngày' },
  { value: 90, label: '90 ngày' },
  { value: 180, label: '6 tháng' },
  { value: 365, label: '1 năm' },
  { value: 0, label: 'Không hết hạn' },
];

export default function CreateApiKeyModal({ open, onClose, onSave }: CreateApiKeyModalProps) {
  const [data, setData] = useState<ApiKeyData>({
    name: '',
    description: '',
    scopes: [],
    dailyLimit: 10000,
    expiresIn: 90,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ApiKeyData, string>>>({});
  const [selectAll, setSelectAll] = useState(false);

  const toggleScope = (scope: string) => {
    setData((d) => ({
      ...d,
      scopes: d.scopes.includes(scope)
        ? d.scopes.filter((s) => s !== scope)
        : [...d.scopes, scope],
    }));
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setData((d) => ({ ...d, scopes: [] }));
      setSelectAll(false);
    } else {
      setData((d) => ({ ...d, scopes: AVAILABLE_SCOPES.map((s) => s.value) }));
      setSelectAll(true);
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ApiKeyData, string>> = {};
    if (!data.name.trim()) newErrors.name = 'Tên API Key là bắt buộc';
    if (data.scopes.length === 0) newErrors.scopes = 'Phải chọn ít nhất 1 scope';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.(data);
    handleClose();
  };

  const handleClose = () => {
    setData({ name: '', description: '', scopes: [], dailyLimit: 10000, expiresIn: 90 });
    setErrors({});
    setSelectAll(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Tạo API Key mới"
      description="Tạo key để tích hợp với hệ thống bên ngoài"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button leftIcon={<Key className="h-4 w-4" />} onClick={handleSave}>Tạo API Key</Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Name */}
        <Input
          label="Tên API Key *"
          placeholder="VD: HEMIS Integration Production"
          value={data.name}
          onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          error={errors.name}
          leftIcon={<Key className="h-4 w-4 text-[rgb(var(--text-muted))]" />}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
            Mô tả
          </label>
          <textarea
            value={data.description}
            onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
            placeholder="Mục đích sử dụng API key này..."
            rows={2}
            className="w-full rounded-[var(--radius-sm)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none"
          />
        </div>

        {/* Scopes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
              Quyền truy cập (Scopes) *
            </label>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-[rgb(var(--primary))] hover:underline"
            >
              {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          {errors.scopes && (
            <p className="mb-2 text-xs text-[rgb(var(--error))]">{errors.scopes}</p>
          )}

          <div className="space-y-3 max-h-60 overflow-y-auto rounded-lg border border-[rgb(var(--border))] p-3">
            {Object.entries(GROUPED_SCOPES).map(([group, scopes]) => (
              <div key={group}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-muted))] mb-1.5">
                  {group}
                </p>
                <div className="space-y-1">
                  {scopes.map((scope) => {
                    const isAdmin = scope.value === 'admin:*';
                    return (
                      <label
                        key={scope.value}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-all text-sm ${
                          data.scopes.includes(scope.value)
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)]'
                            : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] hover:bg-[rgb(var(--bg-hover))]'
                        } ${isAdmin ? 'border-red-200 bg-red-50/50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={data.scopes.includes(scope.value)}
                          onChange={() => toggleScope(scope.value)}
                          className="h-4 w-4 rounded border-[rgb(var(--border))] accent-[rgb(var(--primary))]"
                        />
                        <code className={`flex-1 font-mono text-xs ${data.scopes.includes(scope.value) ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-secondary))]'}`}>
                          {scope.value}
                        </code>
                        <span className="text-xs text-[rgb(var(--text-muted))]">{scope.label.split('—')[1]?.trim() || scope.label}</span>
                        {isAdmin && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily limit + Expiry */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
              Giới hạn lượt gọi / ngày
            </label>
            <select
              value={data.dailyLimit}
              onChange={(e) => setData((d) => ({ ...d, dailyLimit: Number(e.target.value) }))}
              className="w-full h-9 rounded-[var(--radius-sm)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
            >
              <option value={1000}>1,000 lượt / ngày</option>
              <option value={5000}>5,000 lượt / ngày</option>
              <option value={10000}>10,000 lượt / ngày</option>
              <option value={50000}>50,000 lượt / ngày</option>
              <option value={100000}>100,000 lượt / ngày</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
              Thời hạn
            </label>
            <select
              value={data.expiresIn}
              onChange={(e) => setData((d) => ({ ...d, expiresIn: Number(e.target.value) }))}
              className="w-full h-9 rounded-[var(--radius-sm)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2.5 rounded-lg border border-[rgb(var(--warning)/0.2)] bg-[rgb(var(--warning)/0.05)] p-3">
          <AlertTriangle className="h-4 w-4 text-[rgb(var(--warning))] shrink-0 mt-0.5" />
          <p className="text-xs text-[rgb(var(--warning))] leading-relaxed">
            API Key chỉ hiển thị <strong>một lần duy nhất</strong> ngay sau khi tạo. Hãy sao chép và lưu trữ an toàn ngay lập tức. Nếu mất key, bạn phải thu hồi và tạo key mới.
          </p>
        </div>
      </div>
    </Modal>
  );
}
