import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';

const AVAILABLE_QUESTIONS = [
  { id: 'q1', content: 'Python có kiểu dữ liệu nào là immutable?', course: 'CS101', difficulty: 'easy', score: 1 },
  { id: 'q2', content: 'Kết quả của len([1, [2, 3], 4]) là bao nhiêu?', course: 'CS101', difficulty: 'medium', score: 1 },
  { id: 'q3', content: 'Giải thích sự khác nhau giữa list và tuple trong Python.', course: 'CS101', difficulty: 'hard', score: 3 },
  { id: 'q4', content: 'Hàm f(x) = x^3 là hàm chẵn.', course: 'MATH201', difficulty: 'easy', score: 0.5 },
  { id: 'q5', content: 'Đạo hàm của sin(x) theo x là gì?', course: 'MATH201', difficulty: 'easy', score: 1 },
];

const DIFF_COLOR: Record<string, string> = {
  easy: 'success', medium: 'warning', hard: 'error',
};

export default function CreateExam() {
  const { t } = useTranslation('exam');
  const [step, setStep] = useState(0);
  const [examName, setExamName] = useState('');
  const [course, setCourse] = useState('CS101');
  const [duration, setDuration] = useState('90');
  const [startTime, setStartTime] = useState('');
  const [selectedQs, setSelectedQs] = useState<string[]>(['q1', 'q3']);

  const totalScore = AVAILABLE_QUESTIONS
    .filter((q) => selectedQs.includes(q.id))
    .reduce((sum, q) => sum + q.score, 0);

  const STEPS = [
    t('exam.steps.examInfo'),
    t('exam.steps.selectQuestions'),
    t('exam.steps.settings'),
  ];

  function toggleQ(id: string) {
    setSelectedQs((qs) =>
      qs.includes(id) ? qs.filter((q) => q !== id) : [...qs, id]
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('exam.title')}
        description={t('exam.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard'), href: '/exam' }, { label: t('breadcrumb.createExam') }]}
        actions={
          <Link to="/exam">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('common.back')}</Button>
          </Link>
        }
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                i === step
                  ? 'text-[rgb(var(--primary))] border-b-2 border-[rgb(var(--primary))]'
                  : i < step
                  ? 'text-[rgb(var(--success))] border-b-2 border-[rgb(var(--success))]'
                  : 'text-[rgb(var(--text-muted))] border-b-2 border-transparent'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? 'bg-[rgb(var(--success))] text-white' :
                i === step ? 'bg-[rgb(var(--primary))] text-white' :
                'bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[rgb(var(--border))]" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-5">
              {step === 0 && (
                <div className="space-y-5">
                  <FormField label={t('exam.form.examName')} required>
                    <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder={t('exam.form.examNamePlaceholder')} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t('exam.form.course')} required>
                      <select value={course} onChange={(e) => setCourse(e.target.value)}
                        className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-full">
                        <option>CS101 — Nhập môn Lập trình Python</option>
                        <option>MATH201 — Giải tích 2</option>
                        <option>ENG301 — Tiếng Anh Học thuật</option>
                      </select>
                    </FormField>
                    <FormField label={t('exam.form.examType')} required>
                      <select className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-full">
                        <option>{t('exam.examTypes.midterm')}</option>
                        <option>{t('exam.examTypes.final')}</option>
                        <option>{t('exam.examTypes.quiz')}</option>
                      </select>
                    </FormField>
                    <FormField label={t('exam.form.duration')} required>
                      <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                    </FormField>
                    <FormField label={t('exam.form.startTime')} required>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </FormField>
                  </div>
                  <FormField label={t('exam.form.room')}>
                    <Input placeholder={t('exam.form.roomPlaceholder')} />
                  </FormField>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('exam.form.selectFromBank')}</h4>
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {selectedQs.length} {t('exam.summary.questions')} · {t('exam.summary.totalScore')}: {totalScore} {t('exam.summary.points')}
                    </span>
                  </div>
                  {AVAILABLE_QUESTIONS.map((q) => {
                    const isSelected = selectedQs.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQ(q.id)}
                        className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]'
                            : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary-light))]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleQ(q.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-light))/0.3]"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-[rgb(var(--text-primary)]">{q.content}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="primary" size="sm">{q.course}</Badge>
                            <Badge variant={DIFF_COLOR[q.difficulty] as 'success' | 'warning' | 'error'} size="sm">{t(`difficulty.${q.difficulty}`)}</Badge>
                            <span className="text-xs text-[rgb(var(--text-muted))]">{q.score} {t('exam.summary.points')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  {[
                    { key: 'enableWebcam', defaultChecked: true },
                    { key: 'preventTabSwitch', defaultChecked: true },
                    { key: 'preventCopyPaste', defaultChecked: true },
                    { key: 'allowReview', defaultChecked: false },
                  ].map(({ key, defaultChecked }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={defaultChecked}
                        className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-light))/0.3]" />
                      <span className="text-sm text-[rgb(var(--text-primary))]">{t(`exam.settings.${key}`)}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-[rgb(var(--border)/0.6)]">
                <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← {t('common.back')}</Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep((s) => Math.min(2, s + 1))}>{t('common.continue')} →</Button>
                ) : (
                  <Button leftIcon={<Save className="h-4 w-4" />}>{t('exam.publish')}</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('exam.summary.title')}</h4>
              {[
                { label: t('exam.summary.examName'), value: examName || '—' },
                { label: t('exam.summary.course'), value: course },
                { label: t('exam.summary.duration'), value: `${duration} ${t('examSession.card.minutes')}` },
                { label: t('exam.summary.questionCount'), value: `${selectedQs.length} ${t('exam.summary.questions')}` },
                { label: t('exam.summary.totalScore'), value: totalScore.toString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  <span className="font-semibold text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
