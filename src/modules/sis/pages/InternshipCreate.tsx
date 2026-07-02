import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const MAJORS = ['CNTT', 'Kế toán', 'QTKD', 'NNT', 'Tài chính', 'Luật', 'Vật lý', 'Sư phạm'];
const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Vật lý', 'Khoa Sư phạm'];

export default function InternshipCreate() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentCode: '',
    studentName: '',
    class: '',
    major: MAJORS[0],
    dept: DEPARTMENTS[0],
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    supervisor: '',
    supervisorPhone: '',
    email: '',
    status: 'registered',
    description: '',
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('internship.form.title')}
        description={t('internship.form.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Đào tạo', href: '/sis' },
          { label: t('internship.breadcrumb.tn'), href: '/sis/thuc-tap' },
          { label: t('internship.breadcrumb.create') },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/thuc-tap')}>
            {t('internship.form.back')}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide">{t('internship.form.studentInfo')}</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t('internship.form.maSinhVien')} required>
              <Input value={form.studentCode} onChange={(e) => update('studentCode', e.target.value)} placeholder={t('internship.form.maPlaceholder')} />
            </FormField>
            <FormField label={t('internship.form.hoTenSinhVien')} required>
              <Input value={form.studentName} onChange={(e) => update('studentName', e.target.value)} placeholder={t('internship.form.namePlaceholder')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label={t('internship.form.lop')}>
              <Input value={form.class} onChange={(e) => update('class', e.target.value)} placeholder={t('internship.form.classPlaceholder')} />
            </FormField>
            <FormField label={t('internship.form.nganh')}>
              <select value={form.major} onChange={(e) => update('major', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {MAJORS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </FormField>
            <FormField label={t('internship.form.khoaQuanLy')}>
              <select value={form.dept} onChange={(e) => update('dept', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FormField>
          </div>

          <h3 className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide pt-2 border-t border-[rgb(var(--border)/0.4)]">{t('internship.form.internshipInfo')}</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t('internship.form.congTy')} required>
              <Input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder={t('internship.form.companyPlaceholder')} />
            </FormField>
            <FormField label={t('internship.form.viTri')} required>
              <Input value={form.position} onChange={(e) => update('position', e.target.value)} placeholder={t('internship.form.positionPlaceholder')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label={t('internship.form.diaDiem')}>
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder={t('internship.form.locationPlaceholder')} />
            </FormField>
            <FormField label={t('internship.form.ngayBatDau')} required>
              <Input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
            </FormField>
            <FormField label={t('internship.form.ngayKetThuc')} required>
              <Input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
            </FormField>
          </div>

          <h3 className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide pt-2 border-t border-[rgb(var(--border)/0.4)]">{t('internship.form.supervisorInfo')}</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label={t('internship.form.hoTenNguoiHuongDan')}>
              <Input value={form.supervisor} onChange={(e) => update('supervisor', e.target.value)} placeholder={t('internship.form.supervisorPlaceholder')} />
            </FormField>
            <FormField label={t('internship.form.soDienThoai')}>
              <Input value={form.supervisorPhone} onChange={(e) => update('supervisorPhone', e.target.value)} placeholder={t('internship.form.phonePlaceholder')} />
            </FormField>
            <FormField label={t('internship.form.email')}>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder={t('internship.form.emailPlaceholder')} />
            </FormField>
          </div>

          <FormField label={t('internship.form.ghiChu')}>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              placeholder={t('internship.form.notePlaceholder')}
              rows={4}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]" />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => navigate('/sis/thuc-tap')}>{t('common.cancelShort')}</Button>
            <Button leftIcon={<Save className="h-4 w-4" />}>{t('internship.form.save')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
