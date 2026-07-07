import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input } from '@/components/ui';

const DEGREES = ['Tốt nghiệp PTTH', 'Tốt nghiệp THPT', 'Tốt nghiệp Trung cấp'];
const STATUS_OPTIONS = ['Đang học', 'Bảo lưu', 'Đình chỉ', 'Thôi học', 'Tốt nghiệp'];

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

interface StudentEditProps {
  id?: string;
  onSuccess?: () => void;
}

export default function StudentEdit({ onSuccess }: StudentEditProps = {}) {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    msv: 'SV-2022-0001', name: 'Nguyễn Văn An', dob: '2004-05-12',
    gender: 'Nam', email: 'an.nguyen@student.truong.edu.vn', phone: '0912 345 678',
    address: '48/5 Đường Lê Văn Việt, Quận 9, TP.HCM',
    class: 'CNTT-K60A', major: 'Công nghệ thông tin', dept: 'Khoa CNTT',
    cohort: '2022', status: 'Đang học', degree: 'Tốt nghiệp THPT',
    enrollmentDate: '2022-09-01', expectedGraduation: '2026-06-30',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.msv.trim()) e.msv = t('student.validation.msvRequired');
    if (!form.name.trim()) e.name = t('student.validation.hoTenRequired');
    if (!form.dob) e.dob = t('student.validation.ngaySinhRequired');
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/sis/sinh-vien');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('student.form.personalInfo')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('student.form.msv')} required error={errors.msv}>
              <Input value={form.msv} onChange={(e) => set('msv', e.target.value)} error={errors.msv} />
            </Field>
            <Field label={t('student.form.hoTen')} required error={errors.name}>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('student.form.ngaySinh')} required error={errors.dob}>
                <Input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} error={errors.dob} />
              </Field>
              <Field label={t('student.form.gioiTinh')}>
                <select
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                >
                  <option>Nam</option><option>Nữ</option><option>Khác</option>
                </select>
              </Field>
            </div>
            <Field label={t('student.form.email')}>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@student.truong.edu.vn" />
            </Field>
            <Field label={t('student.form.soDienThoai')}>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0912 345 678" />
            </Field>
            <div className="col-span-2">
              <Field label={t('student.form.diaChi')}>
                <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Số 12, Đường Nguyễn Trãi, Quận 1, TP.HCM" />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('student.form.academicInfo')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('student.form.lop')}>
              <Input value={form.class} onChange={(e) => set('class', e.target.value)} placeholder="CNTT-K60A" />
            </Field>
            <Field label={t('student.form.nganh')}>
              <Input value={form.major} onChange={(e) => set('major', e.target.value)} />
            </Field>
            <Field label={t('student.form.khoa')}>
              <select
                value={form.dept}
                onChange={(e) => set('dept', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                {['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Khoa Khoa học'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label={t('student.form.khoaHoc')}>
              <Input value={form.cohort} onChange={(e) => set('cohort', e.target.value)} placeholder="2022" />
            </Field>
            <Field label={t('student.form.bacDaoTao')}>
              <select
                value={form.degree}
                onChange={(e) => set('degree', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                {DEGREES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label={t('student.form.trangThai')}>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('student.form.ngayNhapHoc')}>
                <Input type="date" value={form.enrollmentDate} onChange={(e) => set('enrollmentDate', e.target.value)} />
              </Field>
              <Field label={t('student.form.duKienTotNghiep')}>
                <Input type="date" value={form.expectedGraduation} onChange={(e) => set('expectedGraduation', e.target.value)} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={onSuccess ?? (() => navigate('/sis/sinh-vien'))}>Hủy</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{t('common.update')}</Button>
        </div>
      </form>
    </div>
  );
}
