import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, FileText, Download, RotateCcw } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SUBMISSIONS = {
  a2: {
    id: 'sub_a2_001',
    assignmentId: 'a2',
    studentId: 'SV-2022-0001',
    studentName: 'Nguyễn Văn An',
    course: 'Giải tích 2',
    courseCode: 'MATH201',
    assignmentTitle: 'Bài tập Tích phân xác định',
    submittedAt: '2026-06-27 22:14',
    gradedAt: '2026-06-29 09:30',
    gradedBy: 'PGS.TS. Lê Thị Lan',
    status: 'graded',
    score: 8.5,
    totalScore: 10,
    feedback: 'Bài làm tốt, thể hiện hiểu biết vững về tích phân xác định. Cần cải thiện phần ứng dụng tích phân vào bài toán thực tế.',
    answers: [
      { no: 1, question: 'Tính ∫₀¹ x² dx', answer: '# Câu 1\nimport math\n\nresult = 1/3  # = 0.333...\nprint(f"Kết quả: {result}")', score: 2, maxScore: 2, comment: 'Chính xác, trình bày rõ ràng.' },
      { no: 2, question: 'Tính ∫₀^π sin(x) dx', answer: '# Câu 2\n# ∫₀^π sin(x) dx = [-cos(x)]₀^π = (-cos π) - (-cos 0) = 2\nprint("Kết quả: 2")', score: 1.5, maxScore: 2, comment: 'Kết quả đúng, thiếu giải thích chi tiết.' },
      { no: 3, question: 'Ứng dụng: Tính diện tích hình phẳng giới hạn bởi y=x² và y=x', answer: '# Câu 3\n# Diện tích = ∫₀¹ (x - x²) dx = [x²/2 - x³/3]₀¹ = 1/6 ≈ 0.1667\nS = 1/6\nprint(f"Diện tích: {S}")', score: 2, maxScore: 2, comment: 'Tuyệt vời! Lời giải chi tiết và chính xác.' },
      { no: 4, question: 'Tính ∫₁^e ln(x) dx bằng tích phân từng phần', answer: '# Câu 4\n# ∫ ln(x) dx = x*ln(x) - x + C\n# ∫₁^e ln(x) dx = [x*ln(x) - x]₁^e = (e*e - e) - (1*0 - 1) = 1\nprint("Kết quả: 1")', score: 1.5, maxScore: 2, comment: 'Công thức đúng, có thể trình bày mạch lạc hơn.' },
      { no: 5, question: 'Tính ∫₀^∞ e^(-x) dx', answer: '# Câu 5\n# ∫₀^∞ e^(-x) dx = [-e^(-x)]₀^∞ = 0 - (-1) = 1\nresult = 1\nprint(f"Kết quả: {result}")', score: 1.5, maxScore: 2, comment: 'Kết quả đúng, bước giới hạn cần ghi rõ hơn.' },
    ],
    files: [
      { name: 'SV-2022-0001_BT2_MATH201.pdf', size: '1.2 MB', uploadedAt: '2026-06-27 22:14' },
      { name: 'loigiai_ontap.pdf', size: '0.8 MB', uploadedAt: '2026-06-27 22:15' },
    ],
  },
  a5: {
    id: 'sub_a5_001',
    assignmentId: 'a5',
    studentId: 'SV-2022-0001',
    studentName: 'Nguyễn Văn An',
    course: 'Cấu trúc Dữ liệu',
    courseCode: 'CS102',
    assignmentTitle: 'Lab: Danh sách liên kết',
    submittedAt: '2026-06-28 19:30',
    gradedAt: '2026-06-29 14:00',
    gradedBy: 'TS. Nguyễn Văn Minh',
    status: 'graded',
    score: 9.0,
    totalScore: 10,
    feedback: 'Bài làm xuất sắc. Code sạch, có comment đầy đủ, giải thuật tối ưu. Cần bổ sung thêm phần xử lý exception.',
    answers: [
      { no: 1, question: 'Cài đặt danh sách liên kết đơn (Singly Linked List)', answer: '# Câu 1: Singly Linked List\nclass Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n    \n    def append(self, data):\n        new_node = Node(data)\n        if not self.head:\n            self.head = new_node\n            return\n        curr = self.head\n        while curr.next:\n            curr = curr.next\n        curr.next = new_node', score: 2, maxScore: 2, comment: 'Hoàn hảo!' },
      { no: 2, question: 'Cài đặt hàm xóa phần tử tại vị trí n', answer: '# Câu 2\n    def delete_at(self, n):\n        if not self.head:\n            return None\n        if n == 0:\n            self.head = self.head.next\n            return\n        curr = self.head\n        for _ in range(n - 1):\n            if not curr.next:\n                return None\n            curr = curr.next\n        if curr.next:\n            curr.next = curr.next.next', score: 2, maxScore: 2, comment: 'Code tối ưu, xử lý edge cases tốt.' },
      { no: 3, question: 'Cài đặt hàm đảo ngược danh sách (in-place)', answer: '# Câu 3\n    def reverse(self):\n        prev = None\n        curr = self.head\n        while curr:\n            next_node = curr.next\n            curr.next = prev\n            prev = curr\n            curr = next_node\n        self.head = prev', score: 2, maxScore: 2, comment: 'Chuẩn! Độ phức tạp O(n).' },
      { no: 4, question: 'Kiểm tra danh sách có vòng (cycle) hay không', answer: '# Câu 4: Floyd\'s cycle detection\n    def has_cycle(self):\n        slow = self.head\n        fast = self.head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                return True\n        return False', score: 1.5, maxScore: 2, comment: 'Thuật toán đúng, cần thêm comment giải thích.' },
      { no: 5, question: 'Tìm phần tử giữa của danh sách', answer: '# Câu 5: Two pointers\n    def middle(self):\n        slow = self.head\n        fast = self.head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n        return slow.data if slow else None', score: 1.5, maxScore: 2, comment: 'Tốt, có thể dùng length/2 thay thế.' },
    ],
    files: [
      { name: 'SV-2022-0001_Lab3_CS102.py', size: '4.5 KB', uploadedAt: '2026-06-28 19:30' },
    ],
  },
};

export default function StudentSubmissionDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string; submissionId: string }>();
  const sub = id ? SUBMISSIONS[id as keyof typeof SUBMISSIONS] : undefined;

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-16 w-16 text-[rgb(var(--text-muted))] mb-4" />
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Không tìm thấy bài nộp</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/lms/bai-tap-cua-toi')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const scorePercent = (sub.score / sub.totalScore) * 100;
  const gradeLabel = scorePercent >= 9 ? 'A+' : scorePercent >= 8.5 ? 'A' : scorePercent >= 8 ? 'B+' : scorePercent >= 7 ? 'B' : scorePercent >= 6 ? 'C' : 'D';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Kết quả: ${sub.assignmentTitle}`}
        description={`${sub.courseCode} · ${sub.course} · Nộp: ${sub.submittedAt}`}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Bài tập', href: '/lms/bai-tap-cua-toi' },
          { label: sub.assignmentTitle },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lms/bai-tap-cua-toi')}>Quay lại</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Tải bài nộp</Button>
          </div>
        }
      />

      {/* Score overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(var(--border))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={scorePercent >= 8.5 ? 'rgb(var(--success))' : scorePercent >= 6.5 ? 'rgb(var(--warning))' : 'rgb(var(--error))'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorePercent / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[rgb(var(--text-primary))]">{sub.score}</span>
                  <span className="text-xs text-[rgb(var(--text-muted))]">/{sub.totalScore}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">Điểm số</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-3xl font-bold ${
                      scorePercent >= 8.5 ? 'text-[rgb(var(--success))]' :
                      scorePercent >= 6.5 ? 'text-[rgb(var(--warning))]' :
                      'text-[rgb(var(--error))]'
                    }`}>{sub.score.toFixed(1)}</span>
                    <span className="text-lg text-[rgb(var(--text-muted))]">/ {sub.totalScore}</span>
                    <Badge variant={scorePercent >= 8.5 ? 'success' : scorePercent >= 6.5 ? 'warning' : 'error'}>{gradeLabel}</Badge>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${scorePercent >= 8.5 ? 'bg-[rgb(var(--success))]' : scorePercent >= 6.5 ? 'bg-[rgb(var(--warning))]' : 'bg-[rgb(var(--error))]'}`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  Được chấm bởi <span className="font-medium text-[rgb(var(--text-secondary))]">{sub.gradedBy}</span> · {sub.gradedAt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" />
              <span className="text-[rgb(var(--text-secondary))]">Đã nộp</span>
              <span className="ml-auto text-[rgb(var(--text-muted))]">{sub.submittedAt}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-[rgb(var(--warning))]" />
              <span className="text-[rgb(var(--text-secondary))]">Đã chấm</span>
              <span className="ml-auto text-[rgb(var(--text-muted))]">{sub.gradedAt}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <span className="text-[rgb(var(--text-secondary))]">File đính kèm</span>
              <span className="ml-auto text-[rgb(var(--text-muted))]">{sub.files.length} file</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <span className="text-[rgb(var(--text-secondary))]">Có thể nộp lại</span>
              <span className="ml-auto text-[rgb(var(--text-muted))]">Còn 3 ngày</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback */}
      {sub.feedback && (
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nhận xét của giảng viên</h3>
          </div>
          <CardContent className="pt-5">
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed italic">"{sub.feedback}"</p>
          </CardContent>
        </Card>
      )}

      {/* File attachments */}
      {sub.files.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">File đã nộp</h3>
          </div>
          <CardContent className="pt-5 space-y-2">
            {sub.files.map((f, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-3 hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{f.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{f.size} · {f.uploadedAt}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>Tải</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Answer breakdown */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Chi tiết từng câu</h3>
        </div>
        <CardContent className="pt-5 space-y-4">
          {sub.answers.map((a) => (
            <div key={a.no} className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-[rgb(var(--bg-base))]">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgb(var(--primary))] text-xs font-bold text-white">
                    {a.no}
                  </div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{a.question}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={a.score === a.maxScore ? 'success' : a.score >= a.maxScore * 0.8 ? 'warning' : 'error'}
                    size="sm"
                  >
                    {a.score}/{a.maxScore}
                  </Badge>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-1.5">Bài làm của bạn</p>
                  <pre className="text-sm text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-base))] rounded-lg p-3 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{a.answer}</pre>
                </div>
                {a.comment && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgb(var(--success)/0.06)] border border-[rgb(var(--success)/0.2)]">
                    <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))] mt-0.5 shrink-0" />
                    <p className="text-xs text-[rgb(var(--text-secondary))]">{a.comment}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
