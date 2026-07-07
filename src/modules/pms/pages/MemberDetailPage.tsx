import { useParams } from 'react-router-dom';
import {
  Edit, Users, Award, Calendar, Phone, Mail,
  ShieldCheck, Star, FileText, CheckCircle2, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';

const MEMBER = {
  id: 'pm1',
  code: 'DV-1995-001',
  name: 'GS.TS. Lý Văn Hùng',
  dob: '1975-10-20',
  joinDate: '2001-05-15',
  branch: 'Chi bộ Khoa CNTT',
  role: 'Bí thư Chi bộ',
  education: 'Tiến sĩ',
  status: 'active',
  phone: '0912 345 678',
  email: 'lyvanhung@truong.edu.vn',
  achievements: 5,
  meetings: 42,
  studies: 28,
  campaigns: 8,
  description: 'Đảng viên gương mẫu, có nhiều đóng góp cho công tác Đảng và chuyên môn tại Khoa CNTT. Tích cực tham gia các phong trào của Đảng ủy trường.',
  studyRecords: [
    { title: 'Học tập chuyên đề Đảng Cương văn kiện Đại hội XIV', date: '15/03/2026', result: 'Đạt', score: 90 },
    { title: 'Học tập Nghị quyết TW 5 (khóa XIII)', date: '10/12/2025', result: 'Đạt', score: 92 },
    { title: 'Bồi dưỡng lý luận chính trị nâng cao', date: '20/06/2025', result: 'Đạt', score: 95 },
  ],
  disciplinaryRecords: [
    { title: 'Khen thưởng: Hoàn thành xuất sắc nhiệm vụ năm 2025', date: '15/01/2026', type: 'reward' },
    { title: 'Khen thưởng: Đảng viên tiêu biểu năm 2024', date: '10/07/2024', type: 'reward' },
  ],
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  active: { variant: 'success', label: 'Chính thức' },
  probation: { variant: 'warning', label: 'Dự bị' },
  suspended: { variant: 'neutral', label: 'Tạm đình chỉ' },
};

const MEMBERS_MAP: Record<string, typeof MEMBER> = {
  pm1: MEMBER,
  pm2: { ...MEMBER, id: 'pm2', code: 'DV-2008-002', name: 'Lê Thị Lan', branch: 'Chi bộ Phòng HC', role: 'Đảng viên' },
  pm3: { ...MEMBER, id: 'pm3', code: 'DV-2006-003', name: 'Trần Hoàng Nam', branch: 'Chi bộ Khoa CNTT', role: 'Phó Bí thư' },
};

interface MemberDetailPageProps {
  id?: string;
}

export default function MemberDetailPage({ id }: MemberDetailPageProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const m = MEMBERS_MAP[actualId] ?? MEMBER;
  const sc = STATUS_CONFIG[m.status];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>Chỉnh sửa</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Thành tích', value: `${m.achievements} lần`, icon: <Star className="h-5 w-5" />, color: 'warning' },
          { label: 'Sinh hoạt', value: `${m.meetings} buổi`, icon: <FileText className="h-5 w-5" />, color: 'primary' },
          { label: 'Học tập', value: `${m.studies} lớp`, icon: <TrendingUp className="h-5 w-5" />, color: 'info' },
          { label: 'Phong trào', value: `${m.campaigns} đợt`, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>
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
            <CardContent className="p-5">
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-4">{m.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                {[
                  { icon: <Calendar className="h-4 w-4" />, label: 'Ngày sinh', value: m.dob },
                  { icon: <Calendar className="h-4 w-4" />, label: 'Ngày vào Đảng', value: m.joinDate },
                  { icon: <Award className="h-4 w-4" />, label: 'Trình độ', value: m.education },
                  { icon: <Phone className="h-4 w-4" />, label: 'Điện thoại', value: m.phone },
                  { icon: <Mail className="h-4 w-4" />, label: 'Email', value: m.email },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="text-[rgb(var(--text-muted))] mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{item.label}</p>
                      <p className="text-sm text-[rgb(var(--text-primary))]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lịch sử học tập */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Lịch sử học tập lý luận</h3>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgb(var(--border)/0.5)]">
                {m.studyRecords.map((r, i) => (
                  <div key={i} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-2">{r.title}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Ngày: {r.date}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge variant={r.result === 'Đạt' ? 'success' : 'warning'} size="sm">{r.result}</Badge>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{r.score} điểm</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Khen thưởng / Kỷ luật */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Khen thưởng & Kỷ luật</h3>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgb(var(--border)/0.5)]">
                {m.disciplinaryRecords.map((r, i) => (
                  <div key={i} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          r.type === 'reward'
                            ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                            : 'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]'
                        }`}>
                          {r.type === 'reward' ? <Star className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{r.title}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{r.date}</p>
                        </div>
                      </div>
                      <Badge variant={r.type === 'reward' ? 'success' : 'error'} size="sm">
                        {r.type === 'reward' ? 'Khen thưởng' : 'Kỷ luật'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Quick info */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--error)/0.08)] text-[rgb(var(--error))]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-[rgb(var(--text-primary))]">{m.name}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{m.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Mã đảng viên', value: m.code },
                  { label: 'Chi bộ', value: m.branch },
                  { label: 'Trình độ', value: m.education },
                  { label: 'Ngày vào Đảng', value: m.joinDate },
                  { label: 'Trạng thái', value: sc.label },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Thành tích */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Thành tích</h3>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-center mb-2">
                {Array.from({ length: m.achievements }).map((_, i) => (
                  <span key={i} className="text-2xl text-amber-400">★</span>
                ))}
              </div>
              <p className="text-xs text-center text-[rgb(var(--text-muted))]">{m.achievements} lần được khen thưởng</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>Chỉnh sửa hồ sơ</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}>Xếp loại Đảng</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Star className="h-3.5 w-3.5" />}>Khen thưởng</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
