import { useNavigate, useParams } from 'react-router-dom';
import { Edit2, CheckCircle2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const QUESTIONS = {
  q2: {
    id: 'q2', course: 'CS101', courseName: 'Nhập môn Lập trình Python',
    type: 'multiple_choice', difficulty: 'medium',
    content: 'Kết quả của len([1, [2, 3], 4]) là bao nhiêu?',
    score: 1, usage: 8, status: 'active',
    tags: ['Python', 'Built-in'],
    author: 'TS. Nguyễn Văn Minh', createdAt: '2025-09-15', updatedAt: '2026-01-20',
    options: [
      { id: 'A', text: '3', isCorrect: true },
      { id: 'B', text: '4', isCorrect: false },
      { id: 'C', text: '2', isCorrect: false },
      { id: 'D', text: '5', isCorrect: false },
    ],
    explanation: 'Danh sách có 3 phần tử: 1, [2, 3], và 4. Hàm len() đếm số phần tử ở cấp cao nhất.',
  },
  q3: {
    id: 'q3', course: 'CS101', courseName: 'Nhập môn Lập trình Python',
    type: 'essay', difficulty: 'hard',
    content: 'Giải thích sự khác nhau giữa list và tuple trong Python. Cho ví dụ minh họa.',
    score: 3, usage: 5, status: 'active',
    tags: ['Python', 'Data types', 'Advanced'],
    author: 'TS. Nguyễn Văn Minh', createdAt: '2025-09-20', updatedAt: '2025-10-01',
    sampleAnswer: 'List là cấu trúc dữ liệu có thể thay đổi (mutable), sử dụng dấu ngoặc vuông []. Tuple là cấu trúc không thể thay đổi (immutable), sử dụng dấu ngoặc tròn ().',
  },
  q4: {
    id: 'q4', course: 'MATH201', courseName: 'Giải tích 2',
    type: 'true_false', difficulty: 'easy',
    content: 'Hàm f(x) = x³ là hàm chẵn.',
    score: 0.5, usage: 15, status: 'active',
    tags: ['Calculus', 'Functions'],
    author: 'PGS.TS. Lê Thị Lan', createdAt: '2025-08-10', updatedAt: '2025-11-05',
    correctAnswer: 'Sai', // false
    explanation: 'Hàm f(x) = x³ là hàm lẻ vì f(-x) = -f(x). Hàm chẵn phải thỏa f(-x) = f(x).',
  },
  q5: {
    id: 'q5', course: 'MATH201', courseName: 'Giải tích 2',
    type: 'multiple_choice', difficulty: 'easy',
    content: 'Đạo hàm của sin(x) theo x là gì?',
    score: 1, usage: 18, status: 'active',
    tags: ['Derivative', 'Trigonometry'],
    author: 'PGS.TS. Lê Thị Lan', createdAt: '2025-08-12', updatedAt: '2025-12-20',
    options: [
      { id: 'A', text: 'cos(x)', isCorrect: true },
      { id: 'B', text: '-cos(x)', isCorrect: false },
      { id: 'C', text: 'sin(x)', isCorrect: false },
      { id: 'D', text: '-sin(x)', isCorrect: false },
    ],
    explanation: 'Theo công thức đạo hàm: d/dx[sin(x)] = cos(x).',
  },
  q6: {
    id: 'q6', course: 'ENG301', courseName: 'Tiếng Anh Học thuật',
    type: 'fill_blank', difficulty: 'medium',
    content: 'Complete: The meeting ___ (start) at 9 AM yesterday.',
    score: 1, usage: 7, status: 'draft',
    tags: ['Grammar', 'Tense'],
    author: 'ThS. Trần Hoàng Nam', createdAt: '2026-01-10', updatedAt: '2026-01-10',
    correctAnswer: 'started',
    explanation: 'Câu trần thuật ở quá khứ đơn: yesterday → V-ing hoặc V-ed (start → started).',
  },
  q7: {
    id: 'q7', course: 'CS101', courseName: 'Nhập môn Lập trình Python',
    type: 'multiple_choice', difficulty: 'easy',
    content: 'Output của print(type([])) là gì?',
    score: 1, usage: 10, status: 'active',
    tags: ['Python', 'OOP'],
    author: 'TS. Nguyễn Văn Minh', createdAt: '2025-09-05', updatedAt: '2025-09-05',
    options: [
      { id: 'A', text: "<class 'list'>", isCorrect: true },
      { id: 'B', text: "<class 'tuple'>", isCorrect: false },
      { id: 'C', text: "<class 'dict'>", isCorrect: false },
      { id: 'D', text: "<type 'list'>", isCorrect: false },
    ],
    explanation: '[] là literal tạo danh sách rỗng, type() trả về class của đối tượng.',
  },
  q8: {
    id: 'q8', course: 'PHYS101', courseName: 'Vật lý Đại cương',
    type: 'multiple_choice', difficulty: 'medium',
    content: 'Định luật Newton thứ hai: F = ?',
    score: 1, usage: 20, status: 'active',
    tags: ['Mechanics', 'Newton'],
    author: 'TS. Bùi Minh Tuấn', createdAt: '2025-07-01', updatedAt: '2025-10-15',
    options: [
      { id: 'A', text: 'm × a', isCorrect: true },
      { id: 'B', text: 'm × v', isCorrect: false },
      { id: 'C', text: 'p × t', isCorrect: false },
      { id: 'D', text: 'W / d', isCorrect: false },
    ],
    explanation: 'Định luật II Newton: F = m × a (Lực = Khối lượng × Gia tốc).',
  },
};

export default function QuestionDetail() {
  const { t } = useTranslation('exam');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const q = id ? QUESTIONS[id as keyof typeof QUESTIONS] : undefined;

  const DIFF_CONFIG = {
    easy: { variant: 'success' as const, label: t('difficulty.easy') },
    medium: { variant: 'warning' as const, label: t('difficulty.medium') },
    hard: { variant: 'error' as const, label: t('difficulty.hard') },
  };
  const STATUS_CONFIG = {
    active: { variant: 'success' as const, label: t('status.active') },
    draft: { variant: 'neutral' as const, label: t('status.draft') },
    archived: { variant: 'warning' as const, label: t('status.archived') },
  };

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">{t('questionDetail.notFound.title')}</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/exam/ngan-hang-cau-hoi')}>
          {t('questionDetail.notFound.back')}
        </Button>
      </div>
    );
  }

  const dc = DIFF_CONFIG[q.difficulty as keyof typeof DIFF_CONFIG];
  const sc = STATUS_CONFIG[q.status as keyof typeof STATUS_CONFIG];

  const TYPE_LABELS: Record<string, string> = {
    multiple_choice: t('type.multiple_choice'),
    essay: t('type.essay'),
    true_false: t('type.true_false'),
    fill_blank: t('type.fill_blank'),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('questionDetail.title', { id: q.id.toUpperCase() })}
        description={`${q.course} — ${q.courseName} · ${TYPE_LABELS[q.type]}`}
        breadcrumbs={[
          { label: t('breadcrumb.dashboard'), href: '/exam' },
          { label: t('breadcrumb.questionBank'), href: '/exam/ngan-hang-cau-hoi' },
          { label: q.id.toUpperCase() },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/exam/ngan-hang-cau-hoi')}>{t('common.back')}</Button>
            <Button leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/exam/ngan-hang-cau-hoi/${q.id}/sua`)}>{t('common.edit')}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Question content */}
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('questionDetail.section.content')}</h3>
            </div>
            <CardContent className="pt-5 space-y-5">
              <p className="text-base font-medium text-[rgb(var(--text-primary))] leading-relaxed">{q.content}</p>

              {/* Options — multiple choice */}
              {q.type === 'multiple_choice' && 'options' in q && (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      opt.isCorrect
                        ? 'border-[rgb(var(--success))] bg-[rgb(var(--success)/0.06)]'
                        : 'border-[rgb(var(--border))]'
                    }`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        opt.isCorrect
                          ? 'bg-[rgb(var(--success))] text-white'
                          : 'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-muted))]'
                      }`}>
                        {opt.id}
                      </span>
                      <span className={`flex-1 text-sm ${
                        opt.isCorrect ? 'font-medium text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]'
                      }`}>
                        {opt.text}
                      </span>
                      {opt.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))] shrink-0" />
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {/* Options — true/false */}
              {q.type === 'true_false' && 'correctAnswer' in q && (
                <div className="grid grid-cols-2 gap-3">
                  {[t('type.true_false').split('/')[0]?.trim() || 'Đúng', t('type.true_false').split('/')[1]?.trim() || 'Sai'].map((label) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-lg border ${
                      label === (q as { correctAnswer: string }).correctAnswer
                        ? 'border-[rgb(var(--success))] bg-[rgb(var(--success)/0.06)]'
                        : 'border-[rgb(var(--border))]'
                    }`}>
                      <span className={`text-sm font-medium ${label === (q as { correctAnswer: string }).correctAnswer ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--text-muted))]'}`}>{label}</span>
                      {label === (q as { correctAnswer: string }).correctAnswer && <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))] ml-auto" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Fill blank answer */}
              {q.type === 'fill_blank' && 'correctAnswer' in q && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--success))] bg-[rgb(var(--success)/0.06)]">
                  <span className="text-sm text-[rgb(var(--text-muted))]">{t('questionBankFull.table.correctAnswer')}:</span>
                  <span className="font-medium text-[rgb(var(--success))]">{(q as { correctAnswer: string }).correctAnswer}</span>
                  <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))] ml-auto" />
                </div>
              )}

              {/* Essay sample answer */}
              {q.type === 'essay' && 'sampleAnswer' in q && (
                <div className="p-4 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
                  <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">{t('questionDetail.answer.sampleAnswer')}</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))] italic">"{q.sampleAnswer}"</p>
                </div>
              )}

              {/* Explanation */}
              {'explanation' in q && q.explanation && (
                <div className="p-3 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
                  <p className="text-xs font-semibold text-[rgb(var(--primary))] uppercase tracking-wide mb-1">{t('questionDetail.explanation')}</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{q.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('questionDetail.section.info')}</h3>
            </div>
            <CardContent className="space-y-3 pt-5">
              {[
                { label: t('questionDetail.info.course'), value: `${q.course} — ${q.courseName}` },
                { label: t('questionDetail.info.type'), value: TYPE_LABELS[q.type] },
                { label: t('questionDetail.info.difficulty'), node: <Badge variant={dc.variant} size="sm">{dc.label}</Badge> },
                { label: t('questionDetail.info.score'), value: `${q.score} ${t('questionDetail.info.point')}` },
                { label: t('questionDetail.info.usageCount'), value: `${q.usage} ${t('questionDetail.info.times')}` },
                { label: t('questionDetail.info.status'), node: <Badge variant={sc.variant} size="sm">{sc.label}</Badge> },
                { label: t('questionDetail.info.author'), value: q.author },
                { label: t('questionDetail.info.createdAt'), value: q.createdAt },
                { label: t('questionDetail.info.updatedAt'), value: q.updatedAt },
              ].map(({ label, value, node }) => (
                <div key={label} className="flex justify-between text-sm border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  {value && <span className="font-medium text-[rgb(var(--text-primary))] text-right max-w-[140px] truncate">{value}</span>}
                  {node && node}
                </div>
              ))}

              {q.tags.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1.5">{t('questionDetail.info.tags')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.tags.map((t_tag) => (
                      <span key={t_tag} className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-2 py-0.5 text-xs text-[rgb(var(--text-muted))]">{t_tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-2">
              <Button className="w-full" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/exam/ngan-hang-cau-hoi/${q.id}/sua`)}>
                {t('common.edit')}
              </Button>
              <Button variant="outline" className="w-full text-[rgb(var(--error))]" leftIcon={<Trash2 className="h-4 w-4" />}>
                {t('common.delete')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
