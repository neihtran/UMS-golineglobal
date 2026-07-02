import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COURSES = ['CS101', 'MATH201', 'ENG301', 'PHYS101', 'CHEM101'];
const TYPE_OPTIONS = [
  { id: 'multiple_choice', label: 'Trắc nghiệm', icon: '☑️' },
  { id: 'essay', label: 'Tự luận', icon: '✍️' },
  { id: 'true_false', label: 'Đúng / Sai', icon: '✓' },
  { id: 'fill_blank', label: 'Điền khuyết', icon: '___' },
];
const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'Dễ', variant: 'success' as const },
  { id: 'medium', label: 'Trung bình', variant: 'warning' as const },
  { id: 'hard', label: 'Khó', variant: 'error' as const },
];

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

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export default function QuestionCreate() {
  const { t } = useTranslation('exam');
  const navigate = useNavigate();
  const [type, setType] = useState('multiple_choice');
  const [course, setCourse] = useState('CS101');
  const [difficulty, setDifficulty] = useState('medium');
  const [content, setContent] = useState('');
  const [score, setScore] = useState('1');
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [options, setOptions] = useState<AnswerOption[]>([
    { id: 'a', text: '', isCorrect: true },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
    if (k === 'type') setType(v);
    if (k === 'course') setCourse(v);
    if (k === 'difficulty') setDifficulty(v);
    if (k === 'content') setContent(v);
    if (k === 'score') setScore(v);
    if (k === 'explanation') setExplanation(v);
  };

  const setOption = (id: string, text: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const toggleCorrect = (id: string) => {
    setOptions((prev) =>
      type === 'multiple_choice'
        ? prev.map((o) => ({ ...o, isCorrect: o.id === id }))
        : prev.map((o) => ({ ...o, isCorrect: !o.isCorrect }))
    );
  };

  const addOption = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newId = letters[options.length];
    if (newId) setOptions((prev) => [...prev, { id: newId, text: '', isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
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
    if (!content.trim()) e.content = t('questionCreate.validation.contentRequired');
    if (type === 'multiple_choice' && options.some((o) => !o.text.trim())) e.options = t('questionCreate.validation.answersRequired');
    if (type === 'multiple_choice' && !options.some((o) => o.isCorrect)) e.options = t('questionCreate.validation.atLeastOneCorrect');
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
        title={t('questionCreate.title')}
        description={t('questionCreate.description')}
        breadcrumbs={[
          { label: t('breadcrumb.dashboard'), href: '/exam' },
          { label: t('breadcrumb.questionBank'), href: '/exam/ngan-hang-cau-hoi' },
          { label: t('breadcrumb.questionCreate') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/exam/ngan-hang-cau-hoi')}>{t('common.cancel')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

        {/* Loại câu hỏi */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('questionCreate.section.questionType')}</h3>
          </div>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {TYPE_OPTIONS.map((t_opt) => (
                <button
                  key={t_opt.id}
                  type="button"
                  onClick={() => set('type', t_opt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                    type === t_opt.id
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] ring-1 ring-[rgb(var(--primary))]'
                      : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--primary)/0.4)]'
                  }`}
                >
                  <span className="text-2xl">{t_opt.icon}</span>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{TYPE_LABELS[t_opt.id]}</p>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    type === t_opt.id ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]' : 'border-[rgb(var(--border))]'
                  }`}>
                    {type === t_opt.id && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thông tin cơ bản */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('questionCreate.section.questionInfo')}</h3>
          </div>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('questionCreate.form.course')} required error={errors.course}>
                <select
                  value={course}
                  onChange={(e) => set('course', e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
                >
                  {COURSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={t('questionCreate.form.difficulty')} required>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => set('difficulty', d.id)}
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
              </Field>
            </div>

            <Field label={t('questionCreate.form.content')} required error={errors.content}>
              <textarea
                value={content}
                onChange={(e) => set('content', e.target.value)}
                placeholder={t('questionCreate.form.contentPlaceholder')}
                rows={3}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
              />
            </Field>

            {/* Options cho trắc nghiệm */}
            {type === 'multiple_choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    {t('questionCreate.form.answers')} <span className="text-[rgb(var(--error))]">*</span>
                  </label>
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
                        placeholder={t('questionCreate.form.answerPlaceholder', { id: opt.id.toUpperCase() })}
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
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] font-medium"
                  >
                    <Plus className="h-4 w-4" /> {t('questionCreate.form.addAnswer')}
                  </button>
                )}
                <p className="text-xs text-[rgb(var(--text-muted))]">{t('questionCreate.form.markCorrect')}</p>
              </div>
            )}

            {/* Điểm & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('questionCreate.form.score')}>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => set('score', e.target.value)}
                  min="0.5"
                  step="0.5"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
                />
              </Field>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{t('questionCreate.form.tags')}</label>
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
                    placeholder={tags.length === 0 ? t('questionCreate.form.tagsPlaceholder') : ''}
                    className="flex-1 min-w-[100px] bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {type !== 'multiple_choice' && (
              <Field label={t('questionCreate.form.explanation')}>
                <textarea
                  value={explanation}
                  onChange={(e) => set('explanation', e.target.value)}
                  placeholder={t('questionCreate.form.explanationPlaceholder')}
                  rows={2}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
                />
              </Field>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}>{t('common.saveDraft')}</Button>
          <Button type="submit">{t('common.submit')}</Button>
        </div>
      </form>
    </div>
  );
}
