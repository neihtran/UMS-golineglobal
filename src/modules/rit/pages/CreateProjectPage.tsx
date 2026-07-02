import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, FileText, Users,
  Calendar, CheckCircle2,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const LEVELS = ['Cấp Bộ', 'Cấp trường'];
const FIELDS = ['CNTT', 'Khoa học', 'Kinh tế', 'Sư phạm', 'Luật', 'Y dược', 'Ngoại ngữ', 'Nông nghiệp', 'Kỹ thuật', 'Khác'];
const MEMBERS = [
  'PGS.TS. Nguyễn Văn A', 'TS. Trần Thị B', 'ThS. Lê Văn C',
  'CN. Phạm Thị D', 'TS. Hoàng Minh E', 'ThS. Bùi Văn F',
];

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    code: '',
    level: LEVELS[1],
    field: FIELDS[0],
    description: '',
    objectives: '',
    leader: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    phone: '',
    email: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const toggleMember = (name: string) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/rit/de-tai'), 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng ký đề tài mới"
        description="RIT-01 — Lập hồ sơ đăng ký đề tài nghiên cứu khoa học"
        breadcrumbs={[
          { label: 'RIT', href: '/rit' },
          { label: 'Đề tài', href: '/rit/de-tai' },
          { label: 'Tạo đề tài mới' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/rit/de-tai')}>
            Quay lại
          </Button>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Thông tin đề tài */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin đề tài</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                  Tên đề tài <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <textarea
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="VD: Ứng dụng AI trong phát hiện gian lận thi cử"
                  rows={2}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mã đề tài</label>
                  <input
                    value={form.code}
                    onChange={(e) => update('code', e.target.value)}
                    placeholder="VD: NCKH-2026-001"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Cấp đề tài <span className="text-[rgb(var(--error))]">*</span></label>
                  <select
                    value={form.level}
                    onChange={(e) => update('level', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
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
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Kinh phí dự kiến (VNĐ) <span className="text-[rgb(var(--error))]">*</span></label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => update('budget', e.target.value)}
                    placeholder="VD: 500000000"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mô tả đề tài</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Mô tả ngắn gọn nội dung và phạm vi nghiên cứu..."
                  rows={3}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mục tiêu nghiên cứu (mỗi dòng 1 mục tiêu)</label>
                <textarea
                  value={form.objectives}
                  onChange={(e) => update('objectives', e.target.value)}
                  placeholder="1. Xây dựng mô hình AI hỗ trợ giảng dạy&#10;2. Thử nghiệm tại 3 khoa&#10;3. Công bố 5 bài báo quốc tế"
                  rows={3}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chủ nhiệm & Thành viên */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Chủ nhiệm & Thành viên</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                  Chủ nhiệm đề tài <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  value={form.leader}
                  onChange={(e) => update('leader', e.target.value)}
                  placeholder="VD: PGS.TS. Nguyễn Văn A"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">SĐT</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="VD: nvana@university.edu.vn"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--text-secondary))]">Thành viên tham gia</label>
                <div className="flex flex-wrap gap-2">
                  {MEMBERS.map((name) => {
                    const selected = selectedMembers.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleMember(name)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          selected
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]'
                            : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3)]'
                        }`}
                      >
                        {selected && <CheckCircle2 className="h-3 w-3" />}
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thời gian thực hiện */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thời gian thực hiện</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Ngày kết thúc <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => update('deadline', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/rit/de-tai')}>Hủy bỏ</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={saved}>
              {saved ? '✓ Đã lưu' : 'Lưu đề tài'}
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))] line-clamp-2">
                    {form.title || 'Tên đề tài'}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{form.code || 'Mã đề tài'}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Cấp', value: form.level },
                  { label: 'Lĩnh vực', value: form.field },
                  { label: 'Kinh phí', value: form.budget ? `${parseInt(form.budget).toLocaleString('vi-VN')}đ` : '—' },
                  { label: 'Chủ nhiệm', value: form.leader || '—' },
                  { label: 'Thành viên', value: `${selectedMembers.length} người` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </div>
              {form.deadline && (
                <div className="rounded-lg border border-[rgb(var(--border)/0.6)] p-2 text-center">
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">Thời gian</p>
                  <p className="text-xs font-medium text-[rgb(var(--text-primary))]">
                    {new Intl.DateTimeFormat('vi-VN').format(new Date(form.startDate))} → {new Intl.DateTimeFormat('vi-VN').format(new Date(form.deadline))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Hướng dẫn</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                'Điền đầy đủ thông tin bắt buộc (*)',
                'Tên đề tài ngắn gọn, rõ ràng',
                'Kinh phí phải phù hợp với cấp đề tài',
                'Cấp Bộ: tối thiểu 500 triệu, Cấp trường: 50–500 triệu',
                'Thời gian thực hiện: 6–24 tháng',
                'Đề tài sẽ được phê duyệt trong 7 ngày làm việc',
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
