import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Paperclip, Send, Save } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ASSIGNMENT_DETAIL = {
  id: 'a1',
  title: 'Bài tập Chương 3: Vòng lặp',
  course: 'Nhập môn Lập trình Python',
  courseCode: 'CS101',
  instructor: 'TS. Nguyễn Văn Minh',
  due: '2026-06-30 23:59',
  duration: '120 phút',
  questions: 5,
  totalScore: 10,
  description: 'Bài tập thực hành về vòng lặp for và while trong Python. Sinh viên cần hoàn thành các bài tập từ cơ bản đến nâng cao, nộp file .py qua hệ thống.',
  requirements: [
    'Nộp file Python (.py) có đặt tên theo format: MSSV_BT3.py',
    'Mỗi bài tập cần có comment mô tả đề bài',
    'Chạy thử và đảm bảo không có lỗi runtime trước khi nộp',
    'Thời gian làm bài: 120 phút kể từ khi bắt đầu',
  ],
  questions_list: [
    {
      no: 1,
      type: 'coding',
      title: 'Vòng lặp for cơ bản',
      desc: 'Viết chương trình Python in ra các số từ 1 đến 10, mỗi số trên một dòng.',
      hint: 'Sử dụng vòng lặp for với range(1, 11)',
      maxScore: 2,
    },
    {
      no: 2,
      type: 'coding',
      title: 'Vòng lặp while',
      desc: 'Viết chương trình yêu cầu người dùng nhập số nguyên dương. Sử dụng vòng lặp while để tiếp tục yêu cầu cho đến khi nhập đúng số dương.',
      hint: 'Sử dụng while True và break khi điều kiện thỏa mãn',
      maxScore: 2,
    },
    {
      no: 3,
      type: 'coding',
      title: 'Bảng cửu chương',
      desc: 'In bảng cửu chương từ 1 đến 5. Mỗi bảng cách nhau một dòng trống.',
      hint: 'Sử dụng hai vòng for lồng nhau',
      maxScore: 2,
    },
    {
      no: 4,
      type: 'coding',
      title: 'Tính tổng',
      desc: 'Viết chương trình tính tổng các số từ 1 đến n, trong đó n được nhập từ bàn phím.',
      hint: 'Có thể dùng công thức n*(n+1)/2 hoặc vòng lặp',
      maxScore: 2,
    },
    {
      no: 5,
      type: 'coding',
      title: 'Số nguyên tố',
      desc: 'Viết hàm kiểm tra một số có phải là số nguyên tố hay không. Sử dụng vòng lặp để kiểm tra.',
      hint: 'Số nguyên tố chỉ chia hết cho 1 và chính nó',
      maxScore: 2,
    },
  ],
};

export default function StudentDoAssignment() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(7200);
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = (no: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [no]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/lms/bai-tap-cua-toi'), 2000);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = ASSIGNMENT_DETAIL.questions_list.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={ASSIGNMENT_DETAIL.title}
        description={`${ASSIGNMENT_DETAIL.courseCode} · ${ASSIGNMENT_DETAIL.course} · Hạn nộp: ${ASSIGNMENT_DETAIL.due}`}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Bài tập', href: '/lms/bai-tap-cua-toi' },
          { label: ASSIGNMENT_DETAIL.title },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lms/bai-tap-cua-toi')}>
              Quay lại
            </Button>
            {submitted ? (
              <Button variant="outline" disabled>Đã nộp</Button>
            ) : (
              <>
                <Button variant="outline" leftIcon={<Save className="h-4 w-4" />}>Lưu nháp</Button>
                <Button leftIcon={<Send className="h-4 w-4" />} onClick={handleSubmit}>Nộp bài</Button>
              </>
            )}
          </div>
        }
      />

      {/* Timer + progress bar */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[rgb(var(--warning))]" />
          <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">Thời gian còn lại:</span>
          <span className="font-bold text-[rgb(var(--warning))] tabular-nums">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
          <div
            className="h-full rounded-full bg-[rgb(var(--primary))] transition-all"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-sm text-[rgb(var(--text-muted))]">{answeredCount}/{totalQuestions} câu</span>
        <Badge variant="info">{ASSIGNMENT_DETAIL.totalScore} điểm</Badge>
      </div>

      {/* Assignment info */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin bài tập</h3>
        </div>
        <CardContent className="pt-5 space-y-4">
          <p className="text-sm text-[rgb(var(--text-secondary))]">{ASSIGNMENT_DETAIL.description}</p>
          <div>
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Yêu cầu khi nộp</p>
            <ul className="space-y-1.5">
              {ASSIGNMENT_DETAIL.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[rgb(var(--text-secondary))]">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))] shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {submitted ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)] mx-auto">
              <Send className="h-8 w-8 text-[rgb(var(--success))]" />
            </div>
            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">Bài tập đã được nộp thành công!</h3>
            <p className="text-sm text-[rgb(var(--text-muted))]">Đang chuyển về danh sách bài tập...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ASSIGNMENT_DETAIL.questions_list.map((q) => (
            <Card key={q.no}>
              <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--primary))] text-sm font-bold text-white">
                    {q.no}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[rgb(var(--text-primary))]">{q.title}</h4>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{q.type === 'coding' ? 'Bài lập trình' : 'Trắc nghiệm'} · {q.maxScore} điểm</p>
                  </div>
                </div>
                {answers[q.no] && (
                  <Badge variant="success" size="sm">Đã trả lời</Badge>
                )}
              </div>
              <CardContent className="pt-5 space-y-4">
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{q.desc}</p>
                {q.hint && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgb(var(--warning)/0.06)] border border-[rgb(var(--warning)/0.2)]">
                    <span className="text-[10px] font-bold text-[rgb(var(--warning))] mt-0.5 shrink-0">GỢI Ý</span>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{q.hint}</p>
                  </div>
                )}
                <textarea
                  value={answers[q.no] ?? ''}
                  onChange={(e) => setAnswer(q.no, e.target.value)}
                  placeholder={`# Viết code Python cho câu ${q.no} vào đây\n# (Có thể dùng Ctrl+V để dán)`}
                  rows={8}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-4 py-3 text-sm font-mono text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
                />
                <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-muted))]">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Đính kèm file (tùy chọn)</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Submit section */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                  <span className="text-sm text-[rgb(var(--text-secondary))]">
                    Đã trả lời <span className="font-bold text-[rgb(var(--text-primary))]">{answeredCount}</span>/{totalQuestions} câu
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" leftIcon={<Save className="h-4 w-4" />}>Lưu nháp</Button>
                  <Button leftIcon={<Send className="h-4 w-4" />} onClick={handleSubmit}>
                    Nộp bài ({totalQuestions} câu)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
