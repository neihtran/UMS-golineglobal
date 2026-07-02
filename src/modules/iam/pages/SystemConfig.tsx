import { useState } from 'react';
import {
  Settings, Mail, MapPin, GraduationCap,
  FileText, DollarSign, Save, CheckCircle2, Clock,
  Shield, Database, HardDrive, KeyRound, Lock, Globe, Server,
} from 'lucide-react';
import {
  Button, Badge, Card, CardContent, Input, Switch,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

interface SettingSection { title: string; icon: React.ReactNode; description: string; }
const SECTIONS: SettingSection[] = [
  { title: 'Thông tin trường', icon: <GraduationCap className="h-5 w-5" />, description: 'Tên, địa chỉ, mã trường, logo' },
  { title: 'Thông tin liên hệ', icon: <Mail className="h-5 w-5" />, description: 'Email, điện thoại, website' },
  { title: 'Cấu hình học kỳ', icon: <Clock className="h-5 w-5" />, description: 'Năm học, học kỳ hiện tại, ngày nghỉ' },
  { title: 'Địa điểm', icon: <MapPin className="h-5 w-5" />, description: 'Cơ sở, tòa nhà, phòng học' },
  { title: 'Mô-đun mặc định', icon: <FileText className="h-5 w-5" />, description: 'Bật/tắt phân hệ theo nhu cầu' },
  { title: 'Ngân hàng & Tài chính', icon: <DollarSign className="h-5 w-5" />, description: 'Tài khoản, MST, thông tin ngân hàng' },
  { title: 'Mã hóa & Lưu trữ', icon: <Shield className="h-5 w-5" />, description: 'SSL, mã hóa dữ liệu, backup' },
  { title: 'Hạn mức & Giới hạn', icon: <Server className="h-5 w-5" />, description: 'Upload, session, rate limit, timeout' },
];

export default function SystemConfig() {
  const [activeSection, setActiveSection] = useState(0);
  const [saved, setSaved] = useState(false);

  const [modules, setModules] = useState([
    { module: 'IAM', label: 'Quản trị Hệ thống', status: true },
    { module: 'HRM', label: 'Quản lý Nhân sự', status: true },
    { module: 'SIS', label: 'Quản lý Sinh viên & Đào tạo', status: true },
    { module: 'LMS', label: 'Dạy học Số', status: true },
    { module: 'EXAM', label: 'Thi trực tuyến', status: true },
    { module: 'FIN', label: 'Tài chính & Kế toán', status: true },
    { module: 'DMS', label: 'Văn bản Điện tử', status: true },
    { module: 'WMS', label: 'Quản lý Công việc', status: true },
    { module: 'DCE', label: 'Năng lực Số', status: false },
    { module: 'PMS', label: 'Công tác Đảng', status: false },
    { module: 'OCR', label: 'Số hóa Tài liệu', status: false },
  ]);

  const [encryptionSettings, setEncryptionSettings] = useState([
    { id: 'ssl', label: 'Bật SSL/TLS', description: 'Mã hóa kết nối HTTPS cho toàn bộ hệ thống', enabled: true },
    { id: 'backup', label: 'Backup tự động hàng ngày', description: 'Sao lưu database và file cấu hình vào lúc 2:00 sáng', enabled: true },
    { id: 'encrypt_data', label: 'Mã hóa dữ liệu at-rest', description: 'Mã hóa AES-256 cho dữ liệu nhạy cảm (password, CCCD, lương)', enabled: true },
    { id: 'audit_log', label: 'Ghi Audit Log', description: 'Log đầy đủ mọi thao tác tạo / sửa / xóa của admin', enabled: true },
    { id: 'two_phase', label: 'Xác nhận 2 bước khi xóa', description: 'Yêu cầu xác nhận qua email trước khi xóa dữ liệu nhạy cảm', enabled: false },
    { id: 'auto_logout', label: 'Auto-logout admin', description: 'Đăng xuất tài khoản admin sau 30 phút không tương tác', enabled: true },
    { id: 'geo_block', label: 'Chặn truy cập theo quốc gia', description: 'Chỉ cho phép truy cập từ Việt Nam, chặn VPN/Proxy nước ngoài', enabled: false },
    { id: 'api_rate', label: 'Giới hạn tần suất API', description: 'Giới hạn 100 request/phút cho mỗi IP', enabled: true },
  ]);

  const [limits, setLimits] = useState([
    { id: 'upload_size', label: 'Dung lượng upload tối đa', value: 50, unit: 'MB', min: 1, max: 500 },
    { id: 'file_size', label: 'Kích thước file đính kèm', value: 25, unit: 'MB', min: 1, max: 200 },
    { id: 'session_timeout', label: 'Session timeout', value: 30, unit: 'phút', min: 5, max: 480 },
    { id: 'password_history', label: 'Không dùng lại mật khẩu cũ', value: 5, unit: 'lần', min: 1, max: 20 },
    { id: 'login_attempts', label: 'Khóa sau khi đăng nhập sai', value: 5, unit: 'lần', min: 3, max: 20 },
    { id: 'lockout_duration', label: 'Thời gian khóa tài khoản', value: 15, unit: 'phút', min: 5, max: 1440 },
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleEncryption = (id: string) => {
    setEncryptionSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const toggleModule = (module: string) => {
    setModules(prev => prev.map(m => m.module === module ? { ...m, status: !m.status } : m));
  };

  const adjustLimit = (id: string, delta: number) => {
    setLimits(prev => prev.map(l => {
      if (l.id !== id) return l;
      const newVal = l.value + delta;
      return { ...l, value: Math.min(Math.max(newVal, l.min), l.max) };
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cấu hình Hệ thống"
        description="IAM-01 — Thiết lập thông tin trường, học kỳ, mô-đun và các tham số toàn cục"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Cấu hình' }]}
        actions={
          <Button leftIcon={saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />} onClick={handleSave}>
            {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar nav */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            {SECTIONS.map((sec, i) => (
              <button
                key={sec.title}
                onClick={() => setActiveSection(i)}
                className={`w-full flex items-start gap-3 rounded-lg p-3 text-left transition-all ${
                  activeSection === i
                    ? 'bg-[rgb(var(--primary)/0.08] border border-[rgb(var(--primary))]'
                    : 'hover:bg-[rgb(var(--bg-hover))] border border-transparent'
                }`}
              >
                <div className={`shrink-0 mt-0.5 ${
                  activeSection === i ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-muted))]'
                }`}>
                  {sec.icon}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    activeSection === i ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'
                  }`}>{sec.title}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] leading-tight mt-0.5">{sec.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 0 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin Trường</h3>
              </div>
              <CardContent className="space-y-4 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Tên trường" defaultValue="Trường Đại học Khoa học và Công nghệ" />
                  <Input label="Tên viết tắt" defaultValue="ĐHKHCN" />
                  <Input label="Mã trường (Mã BGD)" defaultValue="KHCNSG-2020" />
                  <Input label="Mã số thuế" defaultValue="0XXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Địa chỉ</label>
                  <textarea
                    className="w-full rounded-[var(--radius-sm)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none"
                    rows={2}
                    defaultValue="Số 1, Đường ABC, Phường XYZ, Quận 1, Thành phố Hồ Chí Minh"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Tỉnh/Thành phố" defaultValue="Thành phố Hồ Chí Minh" />
                  <Input label="Quận/Huyện" defaultValue="Quận 1" />
                  <Input label="Quốc gia" defaultValue="Việt Nam" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 1 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin Liên hệ</h3>
              </div>
              <CardContent className="space-y-4 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email chính" defaultValue="contact@truong.edu.vn" type="email" />
                  <Input label="Email phòng IT" defaultValue="it@truong.edu.vn" type="email" />
                  <Input label="Điện thoại" defaultValue="028 3XXX XXXX" type="tel" />
                  <Input label="Hotline" defaultValue="1900 XXXX XX" type="tel" />
                  <Input label="Website" defaultValue="https://truong.edu.vn" />
                  <Input label="Fax" defaultValue="028 3XXX YYY" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 2 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cấu hình Học kỳ</h3>
              </div>
              <CardContent className="space-y-4 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Năm học hiện tại" defaultValue="2025-2026" />
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Học kỳ hiện tại</label>
                    <select className="w-full h-9 rounded-[var(--radius-sm)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
                      <option>Học kỳ 1 (2025-2026)</option>
                      <option selected>Học kỳ 2 (2025-2026)</option>
                    </select>
                  </div>
                  <Input label="Ngày bắt đầu HK2" defaultValue="2026-01-12" type="date" />
                  <Input label="Ngày kết thúc HK2" defaultValue="2026-05-30" type="date" />
                  <Input label="Ngày nghỉ Tết (bắt đầu)" defaultValue="2026-01-25" type="date" />
                  <Input label="Ngày nghỉ Tết (kết thúc)" defaultValue="2026-02-10" type="date" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 3 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cơ sở & Tòa nhà</h3>
              </div>
              <CardContent className="py-5">
                <div className="space-y-3">
                  {[
                    { name: 'Cơ sở chính', code: 'CS1', address: 'Số 1 Đường ABC, Q.1, TP.HCM', floors: 12, rooms: 180 },
                    { name: 'Cơ sở 2', code: 'CS2', address: 'Số 2 Đường DEF, Q.3, TP.HCM', floors: 6, rooms: 80 },
                    { name: 'Cơ sở 3', code: 'CS3', address: 'Khu Công nghệ, Q.9, TP.HCM', floors: 8, rooms: 120 },
                  ].map((loc, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] p-3 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[rgb(var(--text-primary))]">{loc.name} <span className="font-mono text-xs text-[rgb(var(--text-muted))]">({loc.code})</span></p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{loc.address} · {loc.floors} tầng · {loc.rooms} phòng</p>
                      </div>
                      <Button variant="ghost" size="sm">Sửa</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" leftIcon={<Settings className="h-4 w-4" />} className="mt-3 w-full">Thêm cơ sở mới</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 4 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Mô-đun mặc định</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Bật/tắt các phân hệ hiển thị trên sidebar và truy cập</p>
              </div>
              <CardContent className="py-5 space-y-3">
                {modules.map((mod) => (
                  <div key={mod.module} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-3">
                    <div>
                      <Badge variant="neutral" size="sm" className="mb-1">{mod.module}</Badge>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{mod.label}</p>
                    </div>
                    <Switch
                      checked={mod.status}
                      onChange={() => toggleModule(mod.module)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 6 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Mã hóa & Lưu trữ</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Thiết lập bảo mật dữ liệu, backup và các cảnh báo hệ thống</p>
              </div>
              <CardContent className="py-5 space-y-3">
                {/* Security score */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--success)/0.05)] border border-[rgb(var(--success)/0.2)] mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)]">
                    <Shield className="h-6 w-6 text-[rgb(var(--success))]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[rgb(var(--text-primary))]">Mức bảo mật: Cao</p>
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">6/8 cấu hình bảo mật đang bật. Khuyến nghị bật thêm Xác nhận 2 bước và Chặn theo quốc gia.</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-black text-[rgb(var(--success))]">75<span className="text-lg">/100</span></p>
                  </div>
                </div>
                {encryptionSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        setting.enabled
                          ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                          : 'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                      }`}>
                        {setting.id === 'ssl' || setting.id === 'encrypt_data' ? <Lock className="h-4 w-4" /> :
                         setting.id === 'backup' ? <Database className="h-4 w-4" /> :
                         setting.id === 'audit_log' ? <HardDrive className="h-4 w-4" /> :
                         setting.id === 'two_phase' ? <KeyRound className="h-4 w-4" /> :
                         setting.id === 'auto_logout' ? <Clock className="h-4 w-4" /> :
                         setting.id === 'geo_block' ? <Globe className="h-4 w-4" /> :
                         <Server className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{setting.label}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onChange={() => toggleEncryption(setting.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 7 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hạn mức & Giới hạn</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Cấu hình các giới hạn về upload, session, bảo mật</p>
              </div>
              <CardContent className="py-5">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {limits.map((limit) => (
                    <div key={limit.id} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4">
                      <p className="text-xs text-[rgb(var(--text-muted))] mb-2">{limit.label}</p>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{limit.value}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{limit.unit}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => adjustLimit(limit.id, -1)}
                            disabled={limit.value <= limit.min}
                            className="h-7 w-7 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-bold"
                          >−</button>
                          <button
                            onClick={() => adjustLimit(limit.id, 1)}
                            disabled={limit.value >= limit.max}
                            className="h-7 w-7 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Rate limit info */}
                <div className="mt-6 p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))]">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-4 w-4 text-[rgb(var(--primary))]" />
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Giới hạn tần suất (Rate Limiting)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {[
                      { label: 'API Gateway', value: '100 req/phút/IP' },
                      { label: 'Login endpoint', value: '5 req/phút/IP' },
                      { label: 'Upload endpoint', value: '10 req/phút/IP' },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between border-b border-[rgb(var(--border)/0.5)] pb-1.5 last:border-0">
                        <span className="text-[rgb(var(--text-secondary))]">{r.label}</span>
                        <span className="font-medium text-[rgb(var(--text-primary))] font-mono text-xs">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 5 && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin Ngân hàng</h3>
              </div>
              <CardContent className="space-y-4 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Tên ngân hàng" defaultValue="Ngân hàng TMCP Ngoại thương Việt Nam (VCB)" />
                  <Input label="Chi nhánh" defaultValue="Chi nhánh Quận 1, TP.HCM" />
                  <Input label="Số tài khoản" defaultValue="1234567890" />
                  <Input label="Tên tài khoản" defaultValue="Trường ĐHKHCN" />
                  <Input label="Mã SWIFT/BIC" defaultValue="BFTVVNVX" />
                  <Input label="Nội dung chuyển khoản mặc định" defaultValue="UMS-{currentYear}-[MaSV]" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
