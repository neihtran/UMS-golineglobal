import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Users, Phone, ShieldCheck,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const BRANCHES = ['Chi bộ Khoa CNTT', 'Chi bộ Khoa Kinh tế', 'Chi bộ Khoa Luật', 'Chi bộ Khoa Ngoại ngữ', 'Chi bộ Khoa Sư phạm', 'Chi bộ Khoa Y dược', 'Chi bộ Ban Giám hiệu', 'Chi bộ Phòng Tổ chức', 'Chi bộ Phòng Tài chính'];
const ROLES = ['Đảng viên', 'Chi ủy viên', 'Phó Bí thư Chi bộ', 'Bí thư Chi bộ'];
const DEGREES = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Phó Giáo sư', 'Giáo sư'];

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    dob: '',
    joinDate: '',
    branch: BRANCHES[0],
    role: ROLES[0],
    education: DEGREES[1],
    email: '',
    phone: '',
    cccd: '',
    address: '',
    status: 'probation',
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/pms/dang-vien'), 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm đảng viên"
        description="PMS-01 — Lập hồ sơ đảng viên mới"
        breadcrumbs={[
          { label: 'PMS', href: '/pms' },
          { label: 'Đảng viên', href: '/pms/dang-vien' },
          { label: 'Thêm đảng viên' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/pms/dang-vien')}>
            Quay lại
          </Button>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Left */}
        <div className="space-y-4">
          {/* Thông tin cá nhân */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[rgb(var(--error))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin cá nhân</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Họ và tên <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mã đảng viên</label>
                  <input
                    value={form.code}
                    onChange={(e) => update('code', e.target.value)}
                    placeholder="VD: DV-2026-001"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ngày sinh</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => update('dob', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ngày vào Đảng <span className="text-[rgb(var(--error))]">*</span></label>
                  <input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => update('joinDate', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Trình độ</label>
                  <select
                    value={form.education}
                    onChange={(e) => update('education', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {DEGREES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Số CCCD</label>
                  <input
                    value={form.cccd}
                    onChange={(e) => update('cccd', e.target.value)}
                    placeholder="VD: 001234567890"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Địa chỉ</label>
                <input
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder="VD: Số 1, Đường ABC, Quận 1, TP.HCM"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Công tác Đảng */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--error))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Công tác Đảng</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Chi bộ <span className="text-[rgb(var(--error))]">*</span></label>
                  <select
                    value={form.branch}
                    onChange={(e) => update('branch', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Chức vụ Đảng</label>
                  <select
                    value={form.role}
                    onChange={(e) => update('role', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Tình trạng</label>
                  <div className="flex gap-2 h-10">
                    {[
                      { id: 'probation', label: 'Dự bị' },
                      { id: 'active', label: 'Chính thức' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => update('status', t.id)}
                        className={`flex-1 rounded-lg border text-sm font-medium transition-colors ${
                          form.status === t.id
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]'
                            : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3)]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liên hệ */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[rgb(var(--error))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Liên hệ</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="VD: nguyenvana@truong.edu.vn"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/pms/dang-vien')}>Hủy bỏ</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={saved}>
              {saved ? '✓ Đã lưu' : 'Lưu đảng viên'}
            </Button>
          </div>
        </div>

        {/* Right: Preview & Hướng dẫn */}
        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Xem trước</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--error)/0.08)] text-[rgb(var(--error))]">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{form.name || 'Họ và tên'}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{form.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Chi bộ', value: form.branch },
                  { label: 'Ngày vào Đảng', value: form.joinDate || '—' },
                  { label: 'Trình độ', value: form.education },
                  { label: 'Tình trạng', value: form.status === 'probation' ? 'Dự bị' : 'Chính thức' },
                  { label: 'Email', value: form.email || '—' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Hướng dẫn</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                'Điền đầy đủ thông tin bắt buộc (*)',
                'Đảng viên dự bị: thử thách 12 tháng trước khi chính thức',
                'Mã đảng viên do hệ thống tự sinh nếu bỏ trống',
                'Hồ sơ sẽ được duyệt bởi Bí thư Chi bộ',
                'Hồ sơ dự bị cần theo dõi trong 12 tháng',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--text-secondary))]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)] text-[10px] font-bold text-[rgb(var(--error))]">
                    {i + 1}
                  </span>
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
