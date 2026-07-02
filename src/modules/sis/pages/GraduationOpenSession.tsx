import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SEMESTERS = ['HK2/2024-2025', 'HK1/2025-2026', 'HK2/2025-2026'];
const MAJORS = ['Tất cả', 'Công nghệ thông tin', 'Kinh tế', 'Luật', 'Ngôn ngữ Anh', 'Y dược', 'Sư phạm'];

const CANDIDATES = [
  { msv: 'SV-2021-0045', name: 'Nguyễn Hoàng Minh', class: 'CNTT-K21', major: 'Công nghệ thông tin', gpa: 3.72, credits: 140, status: 'eligible' },
  { msv: 'SV-2021-0089', name: 'Trần Thị Lan Anh', class: 'KT-K21', major: 'Kinh tế', gpa: 3.45, credits: 138, status: 'eligible' },
  { msv: 'SV-2021-0112', name: 'Lê Văn Tuấn', class: 'LUAT-K21', major: 'Luật', gpa: 3.18, credits: 142, status: 'eligible' },
  { msv: 'SV-2021-0203', name: 'Phạm Thị Hương', class: 'NN-K21', major: 'Ngôn ngữ Anh', gpa: 3.55, credits: 136, status: 'eligible' },
  { msv: 'SV-2021-0034', name: 'Bùi Đình Nam', class: 'CNTT-K21', major: 'Công nghệ thông tin', gpa: 2.15, credits: 120, status: 'not_met' },
  { msv: 'SV-2021-0078', name: 'Đặng Minh Châu', class: 'YD-K21', major: 'Y dược', gpa: 3.82, credits: 144, status: 'eligible' },
  { msv: 'SV-2021-0156', name: 'Ngô Văn Phong', class: 'CNTT-K21', major: 'Công nghệ thông tin', gpa: 2.85, credits: 130, status: 'eligible' },
  { msv: 'SV-2021-0223', name: 'Trịnh Thu Minh', class: 'KT-K21', major: 'Kinh tế', gpa: 3.10, credits: 134, status: 'not_met' },
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

export default function GraduationOpenSession() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    semester: SEMESTERS[1],
    title: '',
    openDate: '2026-01-10',
    closeDate: '2026-02-15',
    reviewDate: '2026-02-20',
    majorFilter: 'Tất cả',
    note: '',
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const eligibleCandidates = CANDIDATES.filter((c) => {
    const matchMajor = form.majorFilter === 'Tất cả' || c.major === form.majorFilter;
    return matchMajor && c.status === 'eligible';
  });

  const toggleAll = () => {
    const eligibleMsvs = eligibleCandidates.map((c) => c.msv);
    if (eligibleMsvs.every((m) => selected.includes(m))) {
      setSelected((s) => s.filter((m) => !eligibleMsvs.includes(m)));
    } else {
      setSelected((s) => [...new Set([...s, ...eligibleMsvs])]);
    }
  };

  const toggleOne = (msv: string) => {
    setSelected((prev) => prev.includes(msv) ? prev.filter((m) => m !== msv) : [...prev, msv]);
  };

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = t('graduation.openSession.validation.tenDotRequired');
    if (!form.openDate) e.openDate = t('graduation.openSession.validation.ngayMoRequired');
    if (!form.closeDate) e.closeDate = t('graduation.openSession.validation.ngayDongRequired');
    if (selected.length === 0) e.note = t('graduation.openSession.validation.selectStudent');
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/sis/tot-nghiep');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('graduation.openSession.title')}
        description={t('graduation.openSession.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('graduation.breadcrumb.list'), href: '/sis/tot-nghiep' },
          { label: t('graduation.breadcrumb.openSession') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/sis/tot-nghiep')}>{t('common.cancel')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Thông tin đợt xét */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('graduation.openSession.sessionInfo')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('graduation.openSession.hocKyXet')} required>
              <select
                value={form.semester}
                onChange={(e) => set('semester', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label={t('graduation.openSession.tenDot')} required error={errors.title}>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t('graduation.openSession.dotPlaceholder')} error={errors.title} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('graduation.openSession.ngayMoDon')} required error={errors.openDate}>
                <Input type="date" value={form.openDate} onChange={(e) => set('openDate', e.target.value)} error={errors.openDate} />
              </Field>
              <Field label={t('graduation.openSession.ngayDongDon')} required error={errors.closeDate}>
                <Input type="date" value={form.closeDate} onChange={(e) => set('closeDate', e.target.value)} error={errors.closeDate} />
              </Field>
            </div>
            <Field label={t('graduation.openSession.ngayXetDuyet')}>
              <Input type="date" value={form.reviewDate} onChange={(e) => set('reviewDate', e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label={t('graduation.openSession.ghiChu')}>
                <textarea
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                  rows={2}
                  placeholder={t('graduation.openSession.notePlaceholder')}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Sinh viên đủ điều kiện */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('graduation.openSession.eligibleStudents')}</h3>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                {t('graduation.openSession.eligibleNote', { count: eligibleCandidates.length, selected: selected.length })}
              </p>
            </div>
            <select
              value={form.majorFilter}
              onChange={(e) => set('majorFilter', e.target.value)}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2"
            >
              {MAJORS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <CardContent className="pt-5 space-y-2">
            {errors.note && <p className="text-xs text-[rgb(var(--error))]">{errors.note}</p>}

            {/* Header check */}
            <div className="flex items-center gap-3 px-3 py-2 border-b border-[rgb(var(--border)/0.4)]">
              <input
                type="checkbox"
                checked={eligibleCandidates.length > 0 && eligibleCandidates.map((c) => c.msv).every((m) => selected.includes(m))}
                onChange={toggleAll}
                className="h-4 w-4 accent-[rgb(var(--primary))]"
              />
              <span className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{t('graduation.openSession.selectAll')}</span>
            </div>

            {/* Danh sách */}
            <div className="max-h-72 overflow-y-auto space-y-1">
              {eligibleCandidates.length === 0 ? (
                <p className="text-center py-8 text-sm text-[rgb(var(--text-muted))]">{t('graduation.openSession.noEligible')}</p>
              ) : (
                eligibleCandidates.map((c) => (
                  <div
                    key={c.msv}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer"
                    onClick={() => toggleOne(c.msv)}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(c.msv)}
                      onChange={() => {}}
                      className="h-4 w-4 accent-[rgb(var(--primary))]"
                    />
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                      {c.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.name}</p>
                      <p className="text-xs text-[rgb(var(--text-secondary))]">{c.msv} · {c.class} · {c.major}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-[rgb(var(--text-muted))]">{t('graduation.openSession.gpa')}</p>
                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{c.gpa.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[rgb(var(--text-muted))]">{t('graduation.openSession.tc')}</p>
                        <p className="text-sm font-semibold text-[rgb(var(--text-secondary))]">{c.credits}</p>
                      </div>
                      <Badge variant="success" size="sm">{t('graduation.openSession.eligible')}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {eligibleCandidates.filter((c) => c.status === 'not_met').length > 0 && (
              <div className="mt-2 pt-2 border-t border-[rgb(var(--border)/0.4)]">
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">
                  {t('graduation.openSession.notEligible')} ({CANDIDATES.filter((c) => c.status === 'not_met').length})
                </p>
                {CANDIDATES.filter((c) => c.status === 'not_met').map((c) => (
                  <div key={c.msv} className="flex items-center gap-3 px-3 py-2 opacity-50">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--text-muted)/0.1)] text-xs font-semibold text-[rgb(var(--text-muted))]">
                      {c.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">{c.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{c.msv} · {t('graduation.openSession.gpa')} {c.gpa.toFixed(2)}</p>
                    </div>
                    <Badge variant="error" size="sm" className="ml-auto shrink-0">{t('graduation.openSession.notMet')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/tot-nghiep')}>{t('common.cancel')}</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
            {t('graduation.openSession.open', { count: selected.length })}
          </Button>
        </div>
      </form>
    </div>
  );
}
