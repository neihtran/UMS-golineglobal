import { useState } from 'react';
import { Shield, Save, AlertTriangle, Copy, CheckCircle2, XCircle } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: RoleData) => void;
}

interface RoleData {
  name: string;
  code: string;
  description: string;
  baseRole: string;
  modules: Record<string, { read: boolean; write: boolean; approve: boolean }>;
  status: string;
}

const MODULES = [
  { id: 'IAM', label: 'IAM – Bảo mật & Tài khoản', icon: '🔐' },
  { id: 'HRM', label: 'HRM – Nhân sự', icon: '👥' },
  { id: 'SIS', label: 'SIS – Sinh viên & Đào tạo', icon: '🎓' },
  { id: 'LMS', label: 'LMS – Dạy học Số', icon: '📚' },
  { id: 'EXAM', label: 'EXAM – Thi trực tuyến', icon: '📝' },
  { id: 'DMS', label: 'DMS – Văn bản điện tử', icon: '📄' },
  { id: 'FIN', label: 'FIN – Tài chính', icon: '💰' },
  { id: 'WMS', label: 'WMS – Quản lý Công việc', icon: '✅' },
  { id: 'PORTAL', label: 'PORTAL – Cổng thông tin', icon: '🌐' },
  { id: 'LIB', label: 'LIB – Thư viện', icon: '🏛️' },
  { id: 'KTX', label: 'KTX – Ký túc xá', icon: '🏠' },
  { id: 'OCR', label: 'OCR – Số hóa Tài liệu', icon: '📠' },
  { id: 'BI', label: 'BI – Phân tích Dữ liệu', icon: '📊' },
  { id: 'DCE', label: 'DCE – Năng lực Số', icon: '🔧' },
  { id: 'QA', label: 'QA – Chất lượng', icon: '⭐' },
  { id: 'RIT', label: 'RIT – Nghiên cứu', icon: '🔬' },
  { id: 'INT', label: 'INT – Tích hợp', icon: '🔌' },
  { id: 'PMS', label: 'PMS – Công tác Đảng', icon: '🏛️' },
];

const BASE_ROLES = [
  { value: '', label: '— Trống (bắt đầu từ đầu) —' },
  { value: 'GIANG_VIEN', label: 'Giảng viên (copy quyền)' },
  { value: 'NHAN_VIEN', label: 'Nhân viên HC (copy quyền)' },
  { value: 'SINH_VIEN', label: 'Sinh viên (copy quyền)' },
  { value: 'ADMIN', label: 'Quản trị (copy quyền)' },
];

const BASE_PERMISSIONS: Record<string, Record<string, { read: boolean; write: boolean; approve: boolean }>> = {
  '': Object.fromEntries(MODULES.map(m => [m.id, { read: false, write: false, approve: false }])),
  GIANG_VIEN: Object.fromEntries(MODULES.filter(m => ['SIS', 'LMS', 'EXAM', 'DMS', 'WMS', 'PORTAL', 'LIB'].includes(m.id)).map(m => [m.id, { read: true, write: true, approve: false }])),
  NHAN_VIEN: Object.fromEntries(MODULES.filter(m => ['HRM', 'DMS', 'FIN', 'WMS', 'PORTAL', 'KTX'].includes(m.id)).map(m => [m.id, { read: true, write: true, approve: false }])),
  SINH_VIEN: Object.fromEntries(MODULES.filter(m => ['SIS', 'LMS', 'EXAM', 'PORTAL', 'LIB'].includes(m.id)).map(m => [m.id, { read: true, write: true, approve: false }])),
  ADMIN: Object.fromEntries(MODULES.map(m => [m.id, { read: true, write: true, approve: true }])),
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      title={label}
      className="flex items-center justify-center"
    >
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))]" />
      ) : (
        <XCircle className="h-5 w-5 text-[rgb(var(--border))]" />
      )}
    </button>
  );
}

export default function CreateRoleModal({ open, onClose, onSave }: CreateRoleModalProps) {
  const emptyModules = Object.fromEntries(MODULES.map(m => [m.id, { read: false, write: false, approve: false }]));

  const [data, setData] = useState<RoleData>({
    name: '',
    code: '',
    description: '',
    baseRole: '',
    modules: { ...emptyModules },
    status: 'active',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [selectAllRead, setSelectAllRead] = useState(false);

  const generateCode = (name: string) =>
    name.trim().toUpperCase().replace(/Đ/g, 'D').replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_');

  const handleNameChange = (name: string) => {
    const code = generateCode(name);
    setData((d) => ({ ...d, name, code }));
  };

  const handleBaseRoleChange = (baseRole: string) => {
    const modules = BASE_PERMISSIONS[baseRole] || { ...emptyModules };
    setData((d) => ({ ...d, baseRole, modules: { ...modules } }));
  };

  const toggleModule = (moduleId: string, action: 'read' | 'write' | 'approve') => {
    setData((d) => ({
      ...d,
      modules: {
        ...d.modules,
        [moduleId]: {
          ...d.modules[moduleId],
          [action]: !d.modules[moduleId][action],
        },
      },
    }));
  };

  const handleSelectAll = () => {
    if (selectAllRead) {
      setData((d) => ({ ...d, modules: { ...emptyModules } }));
      setSelectAllRead(false);
    } else {
      const all = Object.fromEntries(MODULES.map(m => [m.id, { read: true, write: false, approve: false }]));
      setData((d) => ({ ...d, modules: all }));
      setSelectAllRead(true);
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!data.name.trim()) newErrors.name = 'Tên vai trò là bắt buộc';
    if (!data.code.trim()) newErrors.code = 'Mã vai trò là bắt buộc';
    else if (!/^[A-Z][A-Z0-9_]*$/.test(data.code)) newErrors.code = 'Mã viết HOA, không dấu, gạch dưới (_)';
    const hasAnyPermission = Object.values(data.modules).some(m => m.read || m.write || m.approve);
    if (!hasAnyPermission) newErrors.modules = 'Phải cấp ít nhất 1 quyền cho vai trò';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.(data);
    handleClose();
  };

  const handleClose = () => {
    setData({ name: '', code: '', description: '', baseRole: '', modules: { ...emptyModules }, status: 'active' });
    setErrors({});
    setSelectAllRead(false);
    onClose();
  };

  const totalRead = Object.values(data.modules).filter(m => m.read).length;
  const totalWrite = Object.values(data.modules).filter(m => m.write).length;
  const totalApprove = Object.values(data.modules).filter(m => m.approve).length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Tạo vai trò mới"
      description="Thiết lập tên, mã và phân quyền chi tiết cho vai trò hệ thống"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>Tạo vai trò</Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Name + Code */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tên vai trò *"
            placeholder="VD: Trưởng phòng Tài chính"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Mã vai trò *"
            placeholder="VD: TRUONG_PHUONG_TAI_CHINH"
            value={data.code}
            onChange={(e) => setData((d) => ({ ...d, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))}
            error={errors.code}
            leftIcon={<Shield className="h-4 w-4 text-[rgb(var(--text-muted))]" />}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
            Mô tả
          </label>
          <textarea
            value={data.description}
            onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
            placeholder="Mô tả ngắn về vai trò này, phạm vi trách nhiệm..."
            rows={2}
            className="w-full rounded-[var(--radius-sm)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none"
          />
        </div>

        {/* Base role */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
              Bắt đầu từ vai trò có sẵn
            </label>
            <span className="text-xs text-[rgb(var(--text-muted))]">(tùy chọn — copy quyền từ vai trò khác)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {BASE_ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleBaseRoleChange(r.value)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  data.baseRole === r.value
                    ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)] text-[rgb(var(--primary))] ring-1 ring-[rgb(var(--primary))]'
                    : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.4)] hover:bg-[rgb(var(--bg-hover))]'
                }`}
              >
                <Copy className="h-3.5 w-3.5" />
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Permission matrix */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
              Ma trận phân quyền
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-[rgb(var(--primary))] hover:underline flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              {selectAllRead ? 'Bỏ chọn tất cả' : 'Chọn tất cả Đọc'}
            </button>
          </div>

          {errors.modules && (
            <p className="mb-2 text-xs text-[rgb(var(--error))] flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {errors.modules}
            </p>
          )}

          <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_80px] bg-[rgb(var(--bg-base))] border-b border-[rgb(var(--border))] px-4 py-2.5">
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))]">Module</p>
              <p className="text-center text-xs font-semibold text-[rgb(var(--text-muted))]">Đọc</p>
              <p className="text-center text-xs font-semibold text-[rgb(var(--text-muted))]">Ghi</p>
              <p className="text-center text-xs font-semibold text-[rgb(var(--text-muted))]">Duyệt</p>
            </div>
            {/* Rows */}
            <div className="max-h-72 overflow-y-auto">
              {MODULES.map((mod, i) => {
                const perms = data.modules[mod.id] || { read: false, write: false, approve: false };
                return (
                  <div
                    key={mod.id}
                    className={`grid grid-cols-[1fr_80px_80px_80px] items-center px-4 py-2.5 ${
                      i % 2 === 0 ? 'bg-[rgb(var(--bg-card))]' : 'bg-[rgb(var(--bg-base))]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{mod.icon}</span>
                      <span className="text-sm text-[rgb(var(--text-primary))]">{mod.label}</span>
                    </div>
                    <div className="flex justify-center">
                      <Toggle
                        checked={perms.read}
                        onChange={() => toggleModule(mod.id, 'read')}
                        label="Đọc"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Toggle
                        checked={perms.write}
                        onChange={() => toggleModule(mod.id, 'write')}
                        label="Ghi"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Toggle
                        checked={perms.approve}
                        onChange={() => toggleModule(mod.id, 'approve')}
                        label="Duyệt"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Summary */}
            <div className="grid grid-cols-[1fr_80px_80px_80px] bg-[rgb(var(--bg-base))] border-t border-[rgb(var(--border))] px-4 py-2.5">
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))]">Tổng cộng</p>
              <p className="text-center text-xs font-bold text-[rgb(var(--success))]">{totalRead}/{MODULES.length}</p>
              <p className="text-center text-xs font-bold text-[rgb(var(--info))]">{totalWrite}/{MODULES.length}</p>
              <p className="text-center text-xs font-bold text-[rgb(var(--accent))]">{totalApprove}/{MODULES.length}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
            Trạng thái
          </label>
          <div className="flex gap-3">
            {[
              { value: 'active', label: 'Hoạt động', color: 'text-[rgb(var(--success))]', desc: 'Vai trò có thể được gán cho người dùng' },
              { value: 'inactive', label: 'Tạm ngừng', color: 'text-[rgb(var(--text-muted))]', desc: 'Vai trò bị khóa, không thể gán mới' },
            ].map((s) => (
              <label
                key={s.value}
                className={`flex items-start gap-2.5 rounded-lg border px-4 py-2.5 cursor-pointer transition-all flex-1 ${
                  data.status === s.value
                    ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)]'
                    : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-hover))]'
                }`}
              >
                <input
                  type="radio"
                  name="role_status"
                  value={s.value}
                  checked={data.status === s.value}
                  onChange={() => setData((d) => ({ ...d, status: s.value }))}
                  className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary))]"
                />
                <div>
                  <p className={`text-sm font-medium ${data.status === s.value ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'}`}>{s.label}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{s.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
