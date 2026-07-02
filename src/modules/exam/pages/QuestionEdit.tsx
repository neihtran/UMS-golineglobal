import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COURSES = ['CS101', 'MATH201', 'ENG301', 'PHYS101', 'CHEM101'];
const DIFFICULTY_OPTIONS_OUTER = [
  { id: 'easy', variant: 'success' as const },
  { id: 'medium', variant: 'warning' as const },
  { id: 'hard', variant: 'error' as const },
];

const QUESTION_DATA: Record<string, {
  course: string; type: string; difficulty: string;
  content: string; score: string; tags: string[];
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}> = {
  q2: { course: 'CS101', type: 'multiple_choice', difficulty: 'medium', content: 'Kết quả của len([1, [2, 3], 4]) là bao nhiêu?', score: '1', tags: ['Python', 'Built-in'], options: [{ id: 'A', text: '3', isCorrect: true }, { id: 'B', text: '4', isCorrect: false }, { id: 'C', text: '2', isCorrect: false }, { id: 'D', text: '5', isCorrect: false }], explanation: 'Danh sách có 3 phần tử: 1, [2, 3], và 4. Hàm len() đếm số phần tử ở cấp cao nhất.' },
  q3: { course: 'CS101', type: 'essay', difficulty: 'hard', content: 'Giải thích sự khác nhau giữa list và tuple trong Python. Cho ví dụ minh họa.', score: '3', tags: ['Python', 'Data types', 'Advanced'], options: [], explanation: 'List là cấu trúc dữ liệu có thể thay đổi (mutable), sử dụng dấu ngoặc vuông []. Tuple là cấu trúc không thể thay đổi (immutable), sử dụng dấu ngoặc tròn ().' },
  q4: { course: 'MATH201', type: 'true_false', difficulty: 'easy', content: 'Hàm f(x) = x³ là hàm chẵn.', score: '0.5', tags: ['Calculus', 'Functions'], options: [{ id: 'A', text: 'Đúng', isCorrect: false }, { id: 'B', text: 'Sai', isCorrect: true }], explanation: 'Hàm f(x) = x³ là hàm lẻ vì f(-x) = -f(x). Hàm chẵn phải thỏa f(-x) = f(x).' },
  q5: { course: 'MATH201', type: 'multiple_choice', difficulty: 'easy', content: 'Đạo hàm của sin(x) theo x là gì?', score: '1', tags: ['Derivative', 'Trigonometry'], options: [{ id: 'A', text: 'cos(x)', isCorrect: true }, { id: 'B', text: '-cos(x)', isCorrect: false }, { id: 'C', text: 'sin(x)', isCorrect: false }, { id: 'D', text: '-sin(x)', isCorrect: false }], explanation: 'Theo công thức đạo hàm: d/dx[sin(x)] = cos(x).' },
  q6: { course: 'ENG301', type: 'fill_blank', difficulty: 'medium', content: 'Complete: The meeting ___ (start) at 9 AM yesterday.', score: '1', tags: ['Grammar', 'Tense'], options: [], explanation: 'Câu trần thuật ở quá khứ đơn: yesterday → V-ed (start → started).' },
  q7: { course: 'CS101', type: 'multiple_choice', difficulty: 'easy', content: 'Output của print(type([])) là gì?', score: '1', tags: ['Python', 'OOP'], options: [{ id: 'A', text: "<class 'list'>", isCorrect: true }, { id: 'B', text: "<class 'tuple'>", isCorrect: false }, { id: 'C', text: "<class 'dict'>", isCorrect: false }, { id: 'D', text: "<type 'list'>", isCorrect: false }], explanation: '[] là literal tạo danh sách rỗng, type() trả về class của đối tượng.' },
  q8: { course: 'PHYS101', type: 'multiple_choice', difficulty: 'medium', content: 'Định luật Newton thứ hai: F = ?', score: '1', tags: ['Mechanics', 'Newton'], options: [{ id: 'A', text: 'm × a', isCorrect: true }, { id: 'B', text: 'm × v', isCorrect: false }, { id: 'C', text: 'p × t', isCorrect: false }, { id: 'D', text: 'W / d', isCorrect: false }], explanation: 'Định luật II Newton: F = m × a (Lực = Khối lượng × Gia tốc).' },
};

interface AnswerOption { id: string; text: string; isCorrect: boolean; }

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}{required && <span className="text-[rgb(var(--error))] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[rgb(var(--error))]">{error}</p>}
    </div>
  );
}

export default function QuestionEdit() {
  const { t } = useTranslation('exam');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const data = id ? QUESTION_DATA[id] : undefined;

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">{t('questionEdit.notFound.title')}</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/exam/ngan-hang-cau-hoi')}>
          {t('questionEdit.notFound.back')}
        </Button>
      </div>
    );
  }

  const [type, setType] = useState(data.type);
  const [course, setCourse] = useState(data.course);
  const [difficulty, setDifficulty] = useState(data.difficulty);
  const [content, setContent] = useState(data.content);
  const [score, setScore] = useState(data.score);
  const [explanation, setExplanation] = useState(data.explanation);
  const [tags, setTags] = useState<string[]>([...data.tags]);
  const [tagInput, setTagInput] = useState('');
  const [options, setOptions] = useState<AnswerOption[]>([...data.options]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (k: string, v: string) => {
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
    if (k === 'type') setType(v);
    if (k === 'course') setCourse(v);
    if (k === 'difficulty') setDifficulty(v);
    if (k === 'content') setContent(v);
    if (k === 'score') setScore(v);
    if (k === 'explanation') setExplanation(v);
  };

  const setOption = (optId: string, text: string) => {
    setOptions((prev) => prev.map((o) => (o.id === optId ? { ...o, text } : o)));
  };

  const toggleCorrect = (optId: string) => {
    setOptions((prev) =>
      type === 'multiple_choice'
        ? prev.map((o) => ({ ...o, isCorrect: o.id === optId }))
        : prev.map((o) => ({ ...o, isCorrect: !o.isCorrect }))
    );
  };

  const addOption = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newId = letters[options.length];
    if (newId) setOptions((prev) => [...prev, { id: newId, text: '', isCorrect: false }]);
  };

  const removeOption = (optId: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.id !== optId));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      e.preventDefault();
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!content.trim()) e.content = t('questionEdit.validation.contentRequired');
    if ((type === 'multiple_choice') && options.some((o) => !o.text.trim())) e.options = t('questionEdit.validation.answersRequired');
    if ((type === 'multiple_choice') && !options.some((o) => o.isCorrect)) e.options = t('questionEdit.validation.atLeastOneCorrect');
    return e;
  };

  const handleSubmit = (ev: React.FormEvent, draft = false) => {
    ev.preventDefault();
    const errs = validate();
    if (!draft && Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/exam/ngan-hang-cau-hoi');
  };

  const DIFFICULTY_LABELS: Record<string, string> = {
    easy: t('difficulty.easy'),
    medium: t('difficulty.medium'),
    hard: t('difficulty.hard'),
  };

  const TYPE_LABELS: Record<string, string> = {
    multiple_choice: t('type.multiple_choice'),
    essay: t('type.essay'),
    true_false: t('type.true_false'),
    fill_blank: t('type.fill_blank'),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('questionEdit.title', { id: id || '' })}
        description={`${id || ''} · ${TYPE_LABELS[type]} · ${course}`}
        breadcrumbs={[
          { label: t('breadcrumb.dashboard'), href: '/exam' },
          { label: t('breadcrumb.questionBank'), href: '/exam/ngan-hang-cau-hoi' },
          { label: id || '' },
          { label: t('breadcrumb.questionEdit') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/exam/ngan-hang-cau-hoi')}>{t('common.cancel')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

        {/* Thông tin cơ bản */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('questionEdit.section.questionInfo')}</h3>
          </div>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('questionEdit.form.course')} required error={errors.course}>
                <select
                  value={course}
                  onChange={(e) => setField('course', e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
                >
                  {COURSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{t('questionEdit.form.difficulty')}</label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS_OUTER.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setField('difficulty', d.id)}
                      className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-all ${
                        difficulty === d.id
                          ? `border-[rgb(var(--${d.variant}))] bg-[rgb(var(--${d.variant})/0.1)] text-[rgb(var(--${d.variant}))]`
                          : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.4)]'
                      }`}
                    >
                      {DIFFICULTY_LABELS[d.id]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Field label={t('questionEdit.form.content')} required error={errors.content}>
              <textarea
                value={content}
                onChange={(e) => setField('content', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
              />
            </Field>

            {/* Options */}
            {type === 'multiple_choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))]">{t('questionEdit.form.answers')}</label>
                  {errors.options && <p className="text-xs text-[rgb(var(--error))]">{errors.options}</p>}
                </div>
                <div className="space-y-2">
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <span className="w-6 h-8 flex items-center justify-center rounded bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))] shrink-0">
                        {opt.id}
                      </span>
                      <input
                        value={opt.text}
                        onChange={(e) => setOption(opt.id, e.target.value)}
                        className="flex-1 h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleCorrect(opt.id)}
                        className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center text-sm font-bold transition-all ${
                          opt.isCorrect
                            ? 'border-[rgb(var(--success))] bg-[rgb(var(--success))] text-white'
                            : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--primary)/0.4)]'
                        }`}
                      >
                        ✓
                      </button>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(opt.id)}
                          className="h-9 w-9 shrink-0 rounded-lg border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--text-muted))] hover:border-[rgb(var(--error))] hover:text-[rgb(var(--error))] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 8 && (
                  <button type="button" onClick={addOption} className="flex items-center gap-2 text-sm text-[rgb(var(--primary))] font-medium">
                    <Plus className="h-4 w-4" /> {t('questionEdit.form.addAnswer')}
                  </button>
                )}
              </div>
            )}

            {/* Điểm & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('questionEdit.form.score')}>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setField('score', e.target.value)}
                  min="0.5" step="0.5"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
                />
              </Field>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{t('questionEdit.form.tags')}</label>
                <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
                  {tags.map((t_tag) => (
                    <span key={t_tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))] text-xs font-medium">
                      #{t_tag}
                      <button onClick={() => setTags((prev) => prev.filter((x) => x !== t_tag))} className="hover:text-[rgb(var(--error))]">×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={tags.length === 0 ? t('questionEdit.form.tagsPlaceholder') : ''}
                    className="flex-1 min-w-[100px] bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <Field label={t('questionEdit.form.explanation')}>
              <textarea
                value={explanation}
                onChange={(e) => setField('explanation', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/exam/ngan-hang-cau-hoi')}>{t('common.cancel')}</Button>
          <Button variant="outline" type="button" onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}>{t('common.saveDraft')}</Button>
          <Button type="submit">{t('common.saveChanges')}</Button>
        </div>
      </form>
    </div>
  );
}
