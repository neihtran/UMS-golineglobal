import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const TYPE_OPTIONS = ['Lý thuyết', 'Thực hành', 'Đồ án', 'Thực tập', 'Luận văn'];
const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Phòng Đào tạo'];

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

export default function SubjectCreate() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '', name: '', credits: '', hours: '', semester: '',
    type: 'Lý thuyết', dept: '', preSubject: '', description: '',
  });
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [preInput, setPreInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const addPre = () => {
    if (preInput.trim() && !prerequisites.includes(preInput.trim())) {
      setPrerequisites((p) => [...p, preInput.trim()]);
      setPreInput('');
    }
  };

  const removePre = (code: string) => setPrerequisites((p) => p.filter((x) => x !== code));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = t('subject.validation.maMonRequired');
    if (!form.name.trim()) e.name = t('subject.validation.tenMonRequired');
    if (!form.credits) e.credits = t('subject.validation.soTinChiRequired');
    if (!form.semester) e.semester = t('subject.validation.hocKyRequired');
    if (!form.dept) e.dept = t('subject.validation.khoaRequired');
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
        title={t('subject.form.titleCreate')}
        description={t('subject.form.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.titleList'), href: '/sis/chuong-trinh-dao-tao' },
          { label: t('subject.breadcrumb.create') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/sis/chuong-trinh-dao-tao')}>{t('subject.form.back')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Thông tin môn học */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('subject.form.info')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('subject.form.maMon')} required error={errors.code}>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="INT1005" error={errors.code} />
            </Field>
            <Field label={t('subject.form.tenMon')} required error={errors.name}>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nhập môn Tin học" error={errors.name} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('subject.form.soTinChi')} required error={errors.credits}>
                <Input type="number" value={form.credits} onChange={(e) => set('credits', e.target.value)} placeholder="3" error={errors.credits} />
              </Field>
              <Field label={t('subject.form.soTietHoc')}>
                <Input type="number" value={form.hours} onChange={(e) => set('hours', e.target.value)} placeholder="45" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('subject.form.hocKy')} required error={errors.semester}>
                <Input type="number" value={form.semester} onChange={(e) => set('semester', e.target.value)} placeholder="1" error={errors.semester} />
              </Field>
              <Field label={t('subject.form.loaiMonHoc')}>
                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                >
                  {TYPE_OPTIONS.map((tOpt) => <option key={tOpt}>{tOpt}</option>)}
                </select>
              </Field>
            </div>
            <Field label={t('subject.form.khoaPhuTrach')} required error={errors.dept}>
              <select
                value={form.dept}
                onChange={(e) => set('dept', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                <option value="">{t('subject.form.chuanKhoa')}</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label={t('subject.form.moTa')}>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  placeholder={t('subject.form.descriptionPlaceholder')}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Môn học tiên quyết */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('subject.form.monTienQuyet')}</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('subject.form.monTienQuyetNote')}</p>
          </div>
          <CardContent className="space-y-3 pt-5">
            {prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((code) => (
                  <div key={code} className="flex items-center gap-1.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-1 text-sm text-[rgb(var(--text-primary))]">
                    <span className="font-mono text-xs">{code}</span>
                    <button onClick={() => removePre(code)} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--error))]">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder={t('subject.form.prerequisitePlaceholder')}
                value={preInput}
                onChange={(e) => setPreInput(e.target.value)}
                wrapperClassName="flex-1"
              />
              <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={addPre} type="button">{t('subject.form.addPrerequisite')}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/chuong-trinh-dao-tao')}>{t('subject.form.back')}</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{t('subject.form.save')}</Button>
        </div>
      </form>
    </div>
  );
}
