import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Edit2, MessageSquare, Clock } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
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
  maxScore: 10,
  submittedAt: '2026-06-29 14:22',
  gradedAt: '2026-06-30 10:00',
  status: 'graded',
  score: 8.5,
  file: 'bai_tap_03_nguyen_van_an.py',
  fileSize: '2.4 KB',
  code: `# Bài tập tuần 3 — Vòng lặp
# Họ tên: Nguyễn Văn An | MSSV: 20261TH003
# Lớp: CNTT-2026.1

# ═══════════════════════════════════════
# CÂU 1: Vòng lặp for — In 10 lần "Xin chào!"
# ═══════════════════════════════════════
for i in range(1, 11):
    print(f"{i}. Xin chào!")

# ═══════════════════════════════════════
# CÂU 2: Vòng lặp while — In số từ 1 đến n
# ═══════════════════════════════════════
n = int(input("Nhập n: "))
i = 1
while i <= n:
    print(i)
    i += 1

# ═══════════════════════════════════════
# CÂU 3: Hàm đệ quy tính giai thừa
# ═══════════════════════════════════════
def giai_thua(n):
    """Tính n! bằng đệ quy"""
    if n == 0 or n == 1:
        return 1
    return n * giai_thua(n - 1)

# Tính 5!
print(f"5! = {giai_thua(5)}")  # Kết quả: 120

# ═══════════════════════════════════════
# CÂU 4: Tính dãy Fibonacci
# ═══════════════════════════════════════
def fibonacci(n):
    """Trả về list n số Fibonacci đầu tiên"""
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]

print(f"Fibonacci(10): {fibonacci(10)}")

# ═══════════════════════════════════════
# CÂU 5: Đếm số chữ số của một số
# ═══════════════════════════════════════
def dem_chu_so(n):
    return len(str(abs(n)))

print(f"Số chữ số của 12345: {dem_chu_so(12345)}")  # 5
`,

  grading: {
    'c1': { label: 'Câu 1 — Vòng lặp for', max: 2, score: 2, comment: 'Đúng hoàn toàn' },
    'c2': { label: 'Câu 2 — Vòng lặp while', max: 2, score: 1.5, comment: 'Thiếu xử lý n <= 0' },
    'c3': { label: 'Câu 3 — Hàm đệ quy', max: 3, score: 3, comment: 'Tốt, có comment' },
    'c4': { label: 'Câu 4 — Fibonacci (bonus)', max: 2, score: 1.5, comment: 'Chưa tối ưu' },
    'c5': { label: 'Câu 5 — Comment & code sạch', max: 1, score: 0.5, comment: 'Ít comment ở câu 2' },
  },
};

export default function AssignmentSubmissionDetail() {
  const { id, submissionId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bài nộp: ${SUBMISSION.studentName}`}
        description={`${SUBMISSION.assignment} · ${SUBMISSION.course}`}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Bài tập SV', href: '/lms/bai-tap-sinh-vien' },
          { label: SUBMISSION.assignment },
          { label: SUBMISSION.studentName },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Tải file</Button>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/lms/bai-tap/${id}/cham`)}>Quay lại</Button>
            <Button size="sm" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/lms/bai-tap/${id}/cham/${submissionId}`)}>Chỉnh sửa điểm</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Info + Code */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student info */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-lg font-bold text-[rgb(var(--primary))]">
                    {SUBMISSION.studentName.split(' ').slice(-2).map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[rgb(var(--text-primary))]">{SUBMISSION.studentName}</p>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">{SUBMISSION.studentId} · {SUBMISSION.class}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{SUBMISSION.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-xs text-[rgb(var(--text-muted))]">Trạng thái</p>
                  <Badge variant="success" dot size="sm" className="mt-1">Đã nộp</Badge>
                </div>
                <div className="text-center flex-1 border-x border-[rgb(var(--border)/0.4)]">
                  <p className="text-xs text-[rgb(var(--text-muted))]">Nộp lúc</p>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mt-1">{SUBMISSION.submittedAt}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-[rgb(var(--text-muted))]">File</p>
                  <p className="text-xs font-medium text-[rgb(var(--primary))] mt-1">{SUBMISSION.fileSize}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File info */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{SUBMISSION.file}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{SUBMISSION.fileSize} · Python source</p>
                </div>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Tải</Button>
            </CardContent>
          </Card>

          {/* Code viewer */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nội dung bài nộp</h3>
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm">{SUBMISSION.file}</Badge>
                <span className="text-xs text-[rgb(var(--text-muted))]">{SUBMISSION.fileSize}</span>
              </div>
            </div>
            <CardContent className="p-0">
              <pre className="p-5 text-sm font-mono text-[rgb(var(--text-secondary))] leading-relaxed overflow-x-auto bg-[rgb(var(--bg-base))] rounded-b-xl">
                <code>{SUBMISSION.code}</code>
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Right: Grading result */}
        <div className="space-y-4">
          {/* Score card */}
          <Card className={`border-2 ${SUBMISSION.status === 'graded' ? 'border-[rgb(var(--success))]' : 'border-[rgb(var(--warning))]'}`}>
            <CardContent className="p-5 text-center">
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Điểm số</p>
              {SUBMISSION.status === 'graded' ? (
                <>
                  <p className={`text-5xl font-black ${
                    SUBMISSION.score >= 8 ? 'text-[rgb(var(--success))]' :
                    SUBMISSION.score >= 6 ? 'text-[rgb(var(--warning))]' :
                    'text-[rgb(var(--error))]'
                  }`}>
                    {SUBMISSION.score}
                    <span className="text-2xl text-[rgb(var(--text-muted))]">/{SUBMISSION.maxScore}</span>
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        SUBMISSION.score >= 8 ? 'bg-[rgb(var(--success))]' :
                        SUBMISSION.score >= 6 ? 'bg-[rgb(var(--warning))]' :
                        'bg-[rgb(var(--error))]'
                      }`}
                      style={{ width: `${(SUBMISSION.score / SUBMISSION.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-2">Chấm ngày: {SUBMISSION.gradedAt}</p>
                </>
              ) : (
                <div className="py-4">
                  <Clock className="h-10 w-10 text-[rgb(var(--warning))] mx-auto mb-2" />
                  <p className="text-sm text-[rgb(var(--warning))]">Chưa được chấm</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Criteria breakdown */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Chi tiết tiêu chí</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              {Object.entries(SUBMISSION.grading).map(([key, g]: [string, any]) => {
                const pct = Math.round((g.score / g.max) * 100);
                return (
                  <div key={key} className="rounded-lg border border-[rgb(var(--border)/0.5)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{g.label}</span>
                      <span className={`text-sm font-bold ${
                        pct >= 80 ? 'text-[rgb(var(--success))]' : pct >= 60 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--error))]'
                      }`}>
                        {g.score}/{g.max}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80 ? 'bg-[rgb(var(--success))]' : pct >= 60 ? 'bg-[rgb(var(--warning))]' : 'bg-[rgb(var(--error))]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] italic">{g.comment}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Nhận xét của giảng viên</h3>
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed italic">
                "Bài làm tổng thể tốt, đã nắm vững kiến thức về vòng lặp và đệ quy. Cần bổ sung comment giải thích cho từng câu lệnh, đặc biệt ở câu 2 về xử lý trường hợp n &lt;= 0."
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Button className="w-full" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/lms/bai-tap/${id}/cham/${submissionId}`)}>
            Chỉnh sửa điểm
          </Button>
        </div>
      </div>
    </div>
  );
}
