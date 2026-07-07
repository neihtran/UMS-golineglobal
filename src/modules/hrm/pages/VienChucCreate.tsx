import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useCreateVienChuc, useDepartmentList } from '@/hooks/useHrm';

const CONTRACT_TYPES = ['Cơ hữu', 'Thỉnh giảng', 'Thử việc'];
const TITLES = ['Giáo sư', 'Phó Giáo sư', 'Tiến sĩ', 'Thạc sĩ', 'Kỹ sư', 'Cử nhân'];
const EDUCATIONS = ['Tiến sĩ', 'Thạc sĩ', 'Đại học', 'Cao đẳng'];

export default function VienChucCreate() {
  const { t } = useTranslation('hrm');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '', name: '', dob: '', cccd: '', gender: 'Nam', ethnicity: 'Kinh', address: '', phone: '', email: '',
    dept: '', title: '', position: '', contractType: 'Cơ hữu', salary: '', education: '', major: '', school: '', gradYear: '',
  });

  const [submitError, setSubmitError] = useState('');
  const createMutation = useCreateVienChuc();
  const { data: deptData } = useDepartmentList({ pageSize: 100 });
  const departments = deptData?.data ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.name || !form.code) {
      setSubmitError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    createMutation.mutate(
      {
        ...form,
        salary: form.salary ? Number(form.salary) : undefined,
        department: form.dept || undefined,
      } as any,
      {
        onSuccess: () => {
          navigate('/hrm/vien-chuc');
        },
        onError: (err: any) => {
          setSubmitError(err?.response?.data?.error?.message || 'Tạo viên chức thất bại');
        },
      }
    );
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('vienChucCreate.title')}
        description={t('vienChucCreate.description')}
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: t('vienChuc.title', { defaultValue: 'Vien chuc' }), href: '/hrm/vien-chuc' },
          { label: t('vienChucCreate.breadcrumb') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/hrm/vien-chuc')}>{t('vienChucCreate.btn.cancel')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
        )}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('vienChucCreate.personalInfo')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('vienChucCreate.form.code') + ' (*)'}>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder={t('vienChucCreate.form.codePlaceholder')} required />
            </Field>
            <Field label={t('vienChucCreate.form.fullName') + ' (*)'}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('vienChucCreate.form.fullNamePlaceholder')} required />
            </Field>
            <Field label={t('vienChucCreate.form.dob') + ' (*)'}>
              <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
            </Field>
            <Field label={t('vienChucCreate.form.cccd') + ' (*)'}>
              <Input value={form.cccd} onChange={(e) => setForm({ ...form, cccd: e.target.value })} placeholder={t('vienChucCreate.form.cccdPlaceholder')} required />
            </Field>
            <Field label={t('vienChucCreate.form.gender')}>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2">
                <option>{t('vienChucCreate.form.male')}</option><option>{t('vienChucCreate.form.female')}</option>
              </select>
            </Field>
            <Field label={t('vienChucCreate.form.ethnicity')}>
              <Input value={form.ethnicity} onChange={(e) => setForm({ ...form, ethnicity: e.target.value })} />
            </Field>
            <Field label={t('vienChucCreate.form.address')}>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t('vienChucCreate.form.addressPlaceholder')} />
            </Field>
            <Field label={t('vienChucCreate.form.phone') + ' (*)'}>
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t('vienChucCreate.form.phonePlaceholder')} required />
            </Field>
            <Field label={t('vienChucCreate.form.email')}>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('vienChucCreate.form.emailPlaceholder')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('vienChucCreate.workInfo')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('vienChucCreate.form.dept') + ' (*)'}>
              <select value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2">
                <option value="">{t('vienChucCreate.form.selectDept')}</option>
                {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label={t('vienChucCreate.form.title')}>
              <select value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2">
                <option value="">{t('vienChucCreate.form.selectTitle')}</option>
                {TITLES.map((t_label) => <option key={t_label}>{t_label}</option>)}
              </select>
            </Field>
            <Field label={t('vienChucCreate.form.position')}>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder={t('vienChucCreate.form.positionPlaceholder')} />
            </Field>
            <Field label={t('vienChucCreate.form.contractType') + ' (*)'}>
              <select value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })} className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2">
                {CONTRACT_TYPES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label={t('vienChucCreate.form.salary')}>
              <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder={t('vienChucCreate.form.salaryPlaceholder')} />
            </Field>
            <Field label={t('vienChucCreate.form.education')}>
              <select value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2">
                <option value="">{t('vienChucCreate.form.selectEducation')}</option>
                {EDUCATIONS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </Field>
            <Field label={t('vienChucCreate.form.major')}>
              <Input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
            </Field>
            <Field label={t('vienChucCreate.form.school')}>
              <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
            </Field>
            <Field label={t('vienChucCreate.form.gradYear')}>
              <Input type="number" value={form.gradYear} onChange={(e) => setForm({ ...form, gradYear: e.target.value })} placeholder={t('vienChucCreate.form.gradYearPlaceholder')} />
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/hrm/vien-chuc')}>{t('vienChucCreate.btn.cancel')}</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{t('vienChucCreate.btn.save')}</Button>
        </div>
      </form>
    </div>
  );
}