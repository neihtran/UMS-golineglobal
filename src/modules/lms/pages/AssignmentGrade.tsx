import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Star, MessageSquare } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SUBMISSION = {
  id: 's1',
  studentId: 'SV001',
  studentName: 'Nguyễn Văn An',
  studentCode: '20261TH003',
  class: 'CNTT-2026.1',
  email: 'nvano@student.edu.vn',
  course: 'Nhập môn Lập trình Python',
  assignment: 'Bài tập tuần 3 — Vòng lặp',
  submittedAt: '2026-06-29 14:22',
  maxScore: 10,
  file: 'bai_tap_03_nguyen_van_an.py',
  code: `# Bài tập tuần 3 — Vòng lặp
# Họ tên: Nguyễn Văn An | MSSV: 20261TH003

# Câu 1: Vòng lặp for
for i in range(1, 11):
    print(f"{i}. Xin chào!")

# Câu 2: Vòng lặp while
n = int(input("Nhập n: "))
i = 1
while i <= n:
    print(i)
    i += 1

# Câu 3: Đệ quy tính giai thừa
def giai_thua(n):
    if n == 0 or n == 1:
        return 1
    return n * giai_thua(n - 1)

print(giai_thua(5))  # Kết quả: 120
`,
};

const CRITERIA = [
  { id: 'c1', label: 'Đúng cú pháp Python', max: 2 },
  { id: 'c2', label: 'Vòng lặp for đúng', max: 2 },
  { id: 'c3', label: 'Vòng lặp while đúng', max: 2 },
  { id: 'c4', label: 'Hàm đệ quy đúng', max: 3 },
  { id: 'c5', label: 'Code sạch, có comment', max: 1 },
];

export default function AssignmentGrade() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [saved, setSaved] = useState(false);

  const totalScore = Object.values(scores).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const maxTotal = CRITERIA.reduce((sum, c) => sum + c.max, 0);

  const handleScore = (cId: string, value: string) => {
    setScores((prev) => ({ ...prev, [cId]: value }));
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chấm bài: ${SUBMISSION.studentName}`}
        description={`${SUBMISSION.assignment} · ${SUBMISSION.course}`}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Bài tập SV', href: '/lms/bai-tap-sinh-vien' },
          { label: SUBMISSION.assignment },
          { label: SUBMISSION.studentName },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/lms/bai-tap/${id}`)}>
              Quay lại
            </Button>
            <Button variant="outline" leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
              Lưu tạm
            </Button>
            <Button leftIcon={<Send className="h-4 w-4" />} onClick={() => navigate('/lms/bai-tap-sinh-vien')}>
              Trả bài & Gửi điểm
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Student info + code */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student info */}
          <Card>
            <CardContent className="p-5 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-bold text-lg">
                  {SUBMISSION.studentName.split(' ').slice(-2).map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[rgb(var(--text-primary))]">{SUBMISSION.studentName}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{SUBMISSION.studentCode} · {SUBMISSION.class}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{SUBMISSION.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">Nộp lúc</p>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{SUBMISSION.submittedAt}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">File đính kèm</p>
                  <p className="text-sm font-semibold text-[rgb(var(--primary))]">{SUBMISSION.file}</p>
                </div>
                <div className="text-center">
                  <Badge variant="success" size="sm">Đã nộp</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code viewer */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nội dung bài nộp</h3>
              <Badge variant="neutral" size="sm">{SUBMISSION.file}</Badge>
            </div>
            <CardContent className="p-0">
              <pre className="p-5 text-sm font-mono text-[rgb(var(--text-secondary))] leading-relaxed overflow-x-auto bg-[rgb(var(--bg-base))] rounded-b-xl">
                <code>{SUBMISSION.code}</code>
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Right: Grading panel */}
        <div className="space-y-4">
          {/* Score summary */}
          <Card className="border-[rgb(var(--primary)/0.3)]">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Tổng điểm</p>
              <p className="text-4xl font-bold text-[rgb(var(--primary))]">{totalScore}<span className="text-xl text-[rgb(var(--text-muted))]">/{maxTotal}</span></p>
              <div className="mt-3 h-2 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgb(var(--primary))] transition-all"
                  style={{ width: `${(totalScore / maxTotal) * 100}%` }}
                />
              </div>
              {saved && (
                <p className="mt-2 text-xs text-[rgb(var(--success))] flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Đã lưu
                </p>
              )}
            </CardContent>
          </Card>

          {/* Criteria */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tiêu chí chấm điểm</h3>
              <p className="text-xs text-[rgb(var(--text-muted))]">Nhập điểm cho từng tiêu chí</p>
            </div>
            <CardContent className="p-4 space-y-4">
              {CRITERIA.map((c) => (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-[rgb(var(--text-secondary))]">{c.label}</label>
                    <span className="text-xs text-[rgb(var(--text-muted))]">/{c.max}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={c.max}
                    step={0.5}
                    value={scores[c.id] || ''}
                    onChange={(e) => handleScore(c.id, e.target.value)}
                    placeholder="0"
                    className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] text-center font-semibold"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nhận xét</h3>
            </div>
            <CardContent className="p-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Nhập nhận xét cho sinh viên (sẽ được gửi kèm điểm)..."
                rows={4}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] resize-none"
              />
              <Button variant="outline" size="sm" className="mt-2" leftIcon={<MessageSquare className="h-3.5 w-3.5" />}>
                Mẫu nhận xét
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
