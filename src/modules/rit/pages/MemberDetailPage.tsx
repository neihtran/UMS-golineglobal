import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, FlaskConical, Users, BookOpen,
  Award, Calendar, Mail, Phone, Globe, ExternalLink,
  FileText,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const MEMBER = {
  id: 'm01',
  code: 'NCV-2015-001',
  name: 'PGS.TS. Lý Văn Hùng',
  degree: 'Tiến sĩ',
  field: 'Khoa học máy tính',
  dept: 'Khoa CNTT',
  email: 'lyvanhung@university.edu.vn',
  phone: '0912 345 678',
  bio: 'Chuyên gia về Trí tuệ nhân tạo và Học máy, với hơn 15 năm kinh nghiệm nghiên cứu và giảng dạy tại các trường đại học hàng đầu trong và ngoài nước.',
  status: 'active',
  type: 'capped',
  since: 2015,
  projects: 12,
  publications: 45,
  hIndex: 8,
  citations: 342,
  orcid: '0000-0002-1234-5678',
  googleScholar: 'LyVanHung',
  scopus: '5721-ABC-456',
};

const PROJECT_HISTORY = [
  { id: 'p1', code: 'NCKH-2024-001', title: 'Ứng dụng AI trong phát hiện gian lận thi cử', role: 'Chủ nhiệm', year: 2024, status: 'done' },
  { id: 'p2', code: 'NCKH-2023-007', title: 'Hệ thống gợi ý học tập thông minh cho sinh viên', role: 'Chủ nhiệm', year: 2023, status: 'done' },
  { id: 'p3', code: 'NCKH-2022-003', title: 'Nghiên cứu chatbot cho dịch vụ công', role: 'Thành viên', year: 2022, status: 'done' },
];

const PUBLICATIONS = [
  { id: 'pub1', title: 'Anomaly Detection in Online Examination Systems Using Ensemble Learning', journal: 'IEEE Access', year: 2025, citations: 18, indexed: 'SCOPUS Q1' },
  { id: 'pub2', title: 'A Survey of Explainable AI in Education: Methods and Applications', journal: 'Computers & Education', year: 2024, citations: 31, indexed: 'SCOPUS Q1' },
  { id: 'pub3', title: 'Deep Learning for Student Performance Prediction: A Comparative Study', journal: 'Expert Systems', year: 2023, citations: 24, indexed: 'SCOPUS Q2' },
];

const PROJECT_STATUS: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  done: { variant: 'success', label: 'Hoàn thành' },
  active: { variant: 'warning', label: 'Đang thực hiện' },
};

export default function MemberDetailPage() {
  const navigate = useNavigate();
  const m = MEMBER;

  return (
    <div className="space-y-6">
      <PageHeader
        title={m.name}
        description={`${m.code} · ${m.degree} · ${m.dept}`}
        breadcrumbs={[
          { label: 'RIT', href: '/rit' },
          { label: 'Nghiên cứu viên', href: '/rit/ncv' },
          { label: m.code },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/rit/ncv')}>
              Quay lại
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>Chỉnh sửa</Button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Đề tài NCKH', value: m.projects, icon: <FlaskConical className="h-5 w-5" />, color: 'primary' },
          { label: 'Bài báo', value: m.publications, icon: <BookOpen className="h-5 w-5" />, color: 'info' },
          { label: 'H-index', value: m.hIndex, icon: <Award className="h-5 w-5" />, color: 'accent' },
          { label: 'Trích dẫn', value: m.citations, icon: <FileText className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
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
                <Users className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin cá nhân</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{m.bio}</p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgb(var(--border)/0.6)]">
                {[
                  { icon: <Mail className="h-4 w-4" />, label: 'Email', value: m.email },
                  { icon: <Phone className="h-4 w-4" />, label: 'Điện thoại', value: m.phone },
                  { icon: <Calendar className="h-4 w-4" />, label: 'Tham gia từ', value: `${m.since}` },
                  { icon: <Globe className="h-4 w-4" />, label: 'Lĩnh vực', value: m.field },
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

          {/* Đề tài tham gia */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Đề tài đã tham gia ({PROJECT_HISTORY.length})</h3>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgb(var(--border)/0.5)]">
                {PROJECT_HISTORY.map((proj) => {
                  const sc = PROJECT_STATUS[proj.status];
                  return (
                    <div key={proj.id} className="px-5 py-3.5 hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer" onClick={() => navigate(`/rit/de-tai/${proj.id}`)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{proj.code}</span>
                            <Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge>
                            <Badge variant="neutral" size="sm">{proj.year}</Badge>
                          </div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-1">{proj.title}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Vai trò: <span className="text-[rgb(var(--text-secondary))]">{proj.role}</span></p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-[rgb(var(--text-muted))] shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Công bố khoa học */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Công bố khoa học ({PUBLICATIONS.length})</h3>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgb(var(--border)/0.5)]">
                {PUBLICATIONS.map((pub) => (
                  <div key={pub.id} className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-2 leading-snug">{pub.title}</p>
                    <div className="flex items-center gap-3 flex-wrap mt-1.5">
                      <span className="text-xs text-[rgb(var(--text-muted))] italic">{pub.journal}, {pub.year}</span>
                      <Badge variant="info" size="sm">{pub.indexed}</Badge>
                      <span className="text-xs text-[rgb(var(--text-muted))]">📖 {pub.citations} trích dẫn</span>
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-[rgb(var(--text-primary))]">{m.name}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{m.degree}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Mã NCV', value: m.code },
                  { label: 'Khoa', value: m.dept },
                  { label: 'Loại', value: m.type === 'capped' ? 'NCV chính' : 'NCV nội bộ' },
                  { label: 'Trạng thái', value: m.status === 'active' ? 'Hoạt động' : 'Chờ duyệt' },
                  { label: 'Tham gia', value: `Từ ${m.since}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Liên kết học thuật */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Liên kết học thuật</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              {[
                { label: 'ORCID', value: m.orcid, url: `https://orcid.org/${m.orcid}` },
                { label: 'Google Scholar', value: m.googleScholar, url: '#' },
                { label: 'SCOPUS', value: m.scopus, url: '#' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgb(var(--bg-hover))] transition-colors group"
                >
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[rgb(var(--text-muted))] font-mono">{item.value}</span>
                    <ExternalLink className="h-3 w-3 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--primary))] transition-colors" />
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Hành động */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>Chỉnh sửa hồ sơ</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<FlaskConical className="h-3.5 w-3.5" />}>Xem đề tài</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<BookOpen className="h-3.5 w-3.5" />}>Công bố khoa học</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
