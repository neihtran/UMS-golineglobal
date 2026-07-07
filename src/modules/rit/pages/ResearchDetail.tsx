import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Calendar, DollarSign, BookOpen, Edit, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';

const PROJECT = {
  id: 'rit1',
  code: 'NCKH-2026-001',
  title: 'Nghiên cứu ứng dụng AI trong giảng dạy đại học',
  leader: 'PGS.TS. Nguyễn Văn A',
  dept: 'Khoa CNTT',
  level: 'Cấp Bộ' as const,
  budget: 500000000,
  status: 'active' as const,
  progress: 45,
  startDate: '01/01/2026',
  deadline: '31/12/2026',
  field: 'CNTT & Giáo dục',
  members: ['PGS.TS. Nguyễn Văn A', 'TS. Trần Thị B', 'ThS. Lê Văn C', 'CN. Phạm Thị D'],
  publications: 2,
  objectives: ['Xây dựng mô hình AI hỗ trợ giảng dạy', 'Thử nghiệm tại 3 khoa', 'Công bố 5 bài báo quốc tế'],
  milestones: [
    { name: 'Giai đoạn 1: Khảo sát & Thiết kế', deadline: '31/03/2026', status: 'completed' },
    { name: 'Giai đoạn 2: Phát triển mô hình', deadline: '30/06/2026', status: 'in_progress' },
    { name: 'Giai đoạn 3: Thử nghiệm', deadline: '30/09/2026', status: 'pending' },
    { name: 'Giai đoạn 4: Đánh giá & Báo cáo', deadline: '31/12/2026', status: 'pending' },
  ],
};

const PROJECTS_MAP: Record<string, typeof PROJECT> = {
  p1: PROJECT,
  p2: { ...PROJECT, id: 'p2', code: 'HTQT-2026-001', title: 'Hợp tác với ĐH Tokyo về nghiên cứu Data Science', leader: 'PGS.TS. Lê Thị Lan' },
  p3: { ...PROJECT, id: 'p3', code: 'NCKH-2026-002', title: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh', leader: 'TS. Bùi Minh Tuấn' },
  p4: { ...PROJECT, id: 'p4', code: 'NCKH-2025-003', title: 'Mô hình dự báo thời tiết sử dụng Deep Learning', leader: 'TS. Hoàng Thu Lan' },
};

const MILESTONE_STATUS: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
  completed: { variant: 'success', label: 'Hoàn thành' },
  in_progress: { variant: 'warning', label: 'Đang thực hiện' },
  pending: { variant: 'info', label: 'Chưa bắt đầu' },
};

function formatVND(v: number) {
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)} triệu`;
  return `${v.toLocaleString('vi-VN')}đ`;
}

interface ResearchDetailProps {
  id?: string;
}

export default function ResearchDetail({ id }: ResearchDetailProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const [showExtend, setShowExtend] = useState(false);
  const p = PROJECTS_MAP[actualId] ?? PROJECT;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => setShowExtend(true)}>Gia hạn</Button>
        <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>Chỉnh sửa</Button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Mô tả đề tài</h3>
            </div>
            <CardContent className="pt-4">
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                Đề tài nghiên cứu ứng dụng trí tuệ nhân tạo (AI) trong việc hỗ trợ giảng dạy tại các trường đại học, tập trung vào việc phát triển các công cụ AI giúp nâng cao chất lượng giảng dạy và học tập.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="info">AI</Badge>
                <Badge variant="info">Education</Badge>
                <Badge variant="info">Machine Learning</Badge>
                <Badge variant="info">NLP</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cột mốc thực hiện</h3>
            </div>
            <CardContent className="space-y-4 pt-4">
              {p.milestones.map((m, i) => {
                const sc = MILESTONE_STATUS[m.status];
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        m.status === 'completed' ? 'bg-[rgb(var(--success))] text-white' :
                        m.status === 'in_progress' ? 'bg-[rgb(var(--warning))] text-white' :
                        'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                      }`}>
                        {i + 1}
                      </div>
                      {i < p.milestones.length - 1 && (
                        <div className="w-0.5 h-8 bg-[rgb(var(--border))]" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[rgb(var(--text-primary))]">{m.name}</p>
                        <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                      </div>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Hạn: {m.deadline}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-center justify-between">
                <Badge variant={p.status === 'active' ? 'success' : 'neutral'} dot>{p.status === 'active' ? 'Đang thực hiện' : p.status}</Badge>
                <Badge variant={p.level === 'Cấp Bộ' ? 'warning' : 'info'}>{p.level}</Badge>
              </div>
              <div className="space-y-3">
                {[
                  { icon: <Users className="h-4 w-4" />, label: 'Trưởng nhóm', value: p.leader },
                  { icon: <BookOpen className="h-4 w-4" />, label: 'Lĩnh vực', value: p.field },
                  { icon: <Calendar className="h-4 w-4" />, label: 'Bắt đầu', value: p.startDate },
                  { icon: <Calendar className="h-4 w-4" />, label: 'Kết thúc', value: p.deadline },
                  { icon: <DollarSign className="h-4 w-4" />, label: 'Kinh phí', value: formatVND(p.budget) },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="text-[rgb(var(--text-muted))] mt-0.5">{icon}</div>
                    <div>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
                      <p className="text-sm text-[rgb(var(--text-primary))]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Tiến độ</p>
                <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{p.progress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[rgb(var(--bg-base))] overflow-hidden">
                <div className="h-full rounded-full bg-[rgb(var(--primary))] transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thành viên ({p.members.length})</h3>
            </div>
            <CardContent className="space-y-3 pt-4">
              {p.members.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                    {m.split(' ').slice(-2).map((n) => n[0]).join('')}
                  </div>
                  <span className="text-sm text-[rgb(var(--text-primary))]">{m}</span>
                  {i === 0 && <Badge variant="success" size="sm">Trưởng nhóm</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {showExtend && (
        <ExtendModal project={p} onClose={() => setShowExtend(false)} onSuccess={() => setShowExtend(false)} />
      )}
    </div>
  );
}

// ── ExtendModal ───────────────────────────────────────────────────────────────

interface ExtendModalProps {
  project: typeof PROJECT;
  onClose: () => void;
  onSuccess: () => void;
}

function ExtendModal({ project, onClose, onSuccess }: ExtendModalProps) {
  const [newDeadline, setNewDeadline] = useState('');
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    setSaved(true);
    setTimeout(() => { onSuccess(); }, 600);
  };

  const currentDeadline = project.deadline;
  const newDate = newDeadline ? new Date(newDeadline) : null;
  const currentDate = new Date(currentDeadline.split('/').reverse().join('-'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[rgb(var(--bg-card))] rounded-2xl p-6 w-[480px] shadow-2xl border border-[rgb(var(--border))]">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)]">
            <RefreshCw className="h-6 w-6 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h3 className="font-bold text-[rgb(var(--text-primary))]">Gia hạn đề tài</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{project.title}</p>
          </div>
          <button onClick={onClose} className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors">
            ✕
          </button>
        </div>

        {step === 'form' ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Hạn hiện tại</label>
              <input
                value={currentDeadline}
                disabled
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-3 text-sm text-[rgb(var(--text-muted))] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                Hạn mới <span className="text-[rgb(var(--error))]">*</span>
              </label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
              />
              {newDate && newDate <= currentDate && (
                <p className="mt-1 text-xs text-[rgb(var(--error))]">Hạn mới phải sau ngày hiện tại</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Lý do gia hạn</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Cần thêm thời gian thu thập dữ liệu do chậm tiến độ..."
                rows={3}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
              />
            </div>
            <div className="rounded-lg border border-[rgb(var(--warning)/0.2)] bg-[rgb(var(--warning)/0.04)] p-3 text-xs text-[rgb(var(--text-secondary))">
              ⚠️ Yêu cầu gia hạn cần được phê duyệt bởi phó hiệu trưởng hoặc trưởng khoa.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
              <Button className="flex-1" onClick={() => setStep('confirm')} disabled={!newDeadline || (newDate !== null && newDate <= currentDate)}>
                Tiếp tục
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-[rgb(var(--success)/0.2)] bg-[rgb(var(--success)/0.04)] p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))]" />
                <h4 className="font-semibold text-[rgb(var(--text-primary))]">Xác nhận gia hạn</h4>
              </div>
              {[
                { label: 'Đề tài', value: project.title },
                { label: 'Hạn cũ', value: currentDeadline },
                { label: 'Hạn mới', value: newDeadline ? new Intl.DateTimeFormat('vi-VN').format(new Date(newDeadline)) : '' },
                { label: 'Lý do', value: reason || '—' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>Quay lại</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saved}>
                {saved ? '✓ Đã gửi yêu cầu' : 'Gửi yêu cầu'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
