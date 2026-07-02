import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const MAJORS = ['Công nghệ thông tin', 'Kinh tế', 'Luật', 'Ngoại ngữ', 'Sư phạm', 'Y dược', 'Dược', 'Khoa học', 'Kỹ thuật'];
const DEGREES = ['Đại học', 'Cao đẳng', 'Thạc sĩ'];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}{required && <span className="text-[rgb(var(--error))] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function CurriculumCreate() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '', name: '', major: '', degree: 'Đại học', version: 'V1.0',
    year: new Date().getFullYear().toString(), totalCredits: '',
    minGPA: '2.0', targetOutput: '', duration: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = t('curriculum.validation.maRequired');
    if (!form.name.trim()) e.name = t('curriculum.validation.tenRequired');
    if (!form.major) e.major = t('curriculum.validation.nganhRequired');
    if (!form.totalCredits) e.totalCredits = t('curriculum.validation.tongTcRequired');
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/sis/chuong-trinh-dao-tao');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('curriculum.form.titleCreate')}
        description={t('curriculum.form.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.titleList'), href: '/sis/chuong-trinh-dao-tao' },
          { label: t('curriculum.breadcrumb.create') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/sis/chuong-trinh-dao-tao')}>{t('curriculum.form.back')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Thông tin cơ bản */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('curriculum.form.basicInfo')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('curriculum.form.maCTDT')} required>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder={t('curriculum.form.codePlaceholder')} error={errors.code} />
            </Field>
            <Field label={t('curriculum.form.tenChuongTrinh')} required>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('curriculum.form.namePlaceholder')} error={errors.name} />
            </Field>
            <Field label={t('curriculum.form.nganhDaoTao')} required>
              <select
                value={form.major}
                onChange={(e) => set('major', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] [&_.invalid]:border-[rgb(var(--error))]"
              >
                <option value="">{t('curriculum.form.chuanNganh')}</option>
                {MAJORS.map((m) => <option key={m}>{m}</option>)}
              </select>
              {errors.major && <p className="mt-1 text-xs text-[rgb(var(--error))]">{errors.major}</p>}
            </Field>
            <Field label={t('curriculum.form.bacDaoTao')}>
              <select
                value={form.degree}
                onChange={(e) => set('degree', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
              >
                {DEGREES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('curriculum.form.phienBan')}>
                <Input value={form.version} onChange={(e) => set('version', e.target.value)} placeholder={t('curriculum.form.versionPlaceholder')} />
              </Field>
              <Field label={t('curriculum.form.namBanHanh')}>
                <Input type="number" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder={t('curriculum.form.yearPlaceholder')} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label={t('curriculum.form.moTa')}>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  placeholder={t('curriculum.form.descriptionPlaceholder')}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Thông số đào tạo */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('curriculum.form.params')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('curriculum.form.tongTinChi')} required>
              <Input type="number" value={form.totalCredits} onChange={(e) => set('totalCredits', e.target.value)} placeholder={t('curriculum.form.totalCreditsPlaceholder')} error={errors.totalCredits} />
            </Field>
            <Field label={t('curriculum.form.gpaToiThieu')}>
              <Input type="number" step="0.1" value={form.minGPA} onChange={(e) => set('minGPA', e.target.value)} placeholder={t('curriculum.form.gpaPlaceholder')} />
            </Field>
            <Field label={t('curriculum.form.thoiGianDaoTao')}>
              <Input type="number" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder={t('curriculum.form.durationPlaceholder')} />
            </Field>
            <Field label={t('curriculum.form.chuanDauRa')}>
              <Input value={form.targetOutput} onChange={(e) => set('targetOutput', e.target.value)} placeholder={t('curriculum.form.chuanPlaceholder')} />
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/chuong-trinh-dao-tao')}>{t('curriculum.form.back')}</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{t('curriculum.form.save')}</Button>
        </div>
      </form>
    </div>
  );
}
