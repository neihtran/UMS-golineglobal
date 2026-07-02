import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Users, Mail,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const DEGREES = ['Giáo sư', 'Phó Giáo sư', 'Tiến sĩ', 'Thạc sĩ', 'Cử nhân'];
const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Khoa Khoa học', 'Khoa Kỹ thuật'];
const FIELDS = ['Khoa học máy tính', 'Trí tuệ nhân tạo', 'Kinh tế số', 'Quản trị kinh doanh', 'An toàn thông tin', 'Khoa học dữ liệu', 'Marketing số', 'Ngôn ngữ học', 'Giáo dục số', 'Y sinh', 'Kỹ thuật điện', 'Kinh tế học'];

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    degree: DEGREES[3],
    dept: DEPARTMENTS[0],
    field: FIELDS[0],
    email: '',
    phone: '',
    orcid: '',
    googleScholar: '',
    bio: '',
    type: 'internal',
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/rit/ncv'), 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm nghiên cứu viên"
        description="RIT-01 — Lập hồ sơ nghiên cứu viên mới"
        breadcrumbs={[
          { label: 'RIT', href: '/rit' },
          { label: 'Nghiên cứu viên', href: '/rit/ncv' },
          { label: 'Thêm NCV' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/rit/ncv')}>
            Quay lại
          </Button>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Thông tin cá nhân */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[rgb(var(--primary))]" />
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
                    placeholder="VD: PGS.TS. Nguyễn Văn A"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mã NCV</label>
                  <input
                    value={form.code}
                    onChange={(e) => update('code', e.target.value)}
                    placeholder="VD: NCV-2026-001"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Học hàm / Học vị <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <select
                    value={form.degree}
                    onChange={(e) => update('degree', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {DEGREES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Khoa / Đơn vị <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <select
                    value={form.dept}
                    onChange={(e) => update('dept', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Lĩnh vực</label>
                  <select
                    value={form.field}
                    onChange={(e) => update('field', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {FIELDS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Loại NCV</label>
                  <div className="flex gap-2 h-10">
                    {[
                      { id: 'internal', label: 'NCV nội bộ' },
                      { id: 'capped', label: 'NCV chính' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => update('type', t.id)}
                        className={`flex-1 rounded-lg border text-sm font-medium transition-colors ${
                          form.type === t.id
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
                <Mail className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Liên hệ & Học thuật</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="VD: nguyenvana@university.edu.vn"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">ORCID</label>
                  <input
                    value={form.orcid}
                    onChange={(e) => update('orcid', e.target.value)}
                    placeholder="VD: 0000-0002-1234-5678"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Google Scholar</label>
                  <input
                    value={form.googleScholar}
                    onChange={(e) => update('googleScholar', e.target.value)}
                    placeholder="VD: nguyenvana123"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Tiểu sử</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  placeholder="Mô tả ngắn về lĩnh vực nghiên cứu, kinh nghiệm..."
                  rows={3}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/rit/ncv')}>Hủy bỏ</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={saved}>
              {saved ? '✓ Đã lưu' : 'Lưu nghiên cứu viên'}
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{form.name || 'Họ và tên'}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{form.degree}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Khoa', value: form.dept },
                  { label: 'Lĩnh vực', value: form.field },
                  { label: 'Email', value: form.email || '—' },
                  { label: 'Loại', value: form.type === 'capped' ? 'NCV chính' : 'NCV nội bộ' },
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
                'NCV chính: có học hàm (GS/PGS), được nghiệm thu cấp Bộ',
                'NCV nội bộ: giảng viên tham gia nghiên cứu',
                'ORCID giúp định danh nhà nghiên cứu quốc tế',
                'Hồ sơ sẽ được duyệt trong 3 ngày làm việc',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--text-secondary))]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
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
