import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Button, Input, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const POSITIONS = ['Giang vien', 'Tro giang', 'Pho truong khoa', 'Truong khoa', 'Chuyen vien', 'Truong phong', 'Pho Hieu truong', 'Hieu truong'];
const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh te', 'Khoa Luat', 'Khoa Ngoai ngu', 'Khoa Su pham', 'Khoa Y duoc', 'Phong To chuc', 'Phong Tai chinh', 'Ban Giam hieu'];

type SelectField = React.ChangeEvent<HTMLSelectElement>;
type InputField = React.ChangeEvent<HTMLInputElement>;
type TextareaField = React.ChangeEvent<HTMLTextAreaElement>;

export default function AppointmentCreate() {
  const { t } = useTranslation('hrm');
  const [form, setForm] = useState({
    name: '', dept: '', currentPosition: '', newPosition: '',
    type: 'new', effectiveDate: '', requester: '', requesterDept: '', reason: '', file: '',
  });

  const APPOINTMENT_TYPES = [
    { value: 'new', label: t('appointmentCreate.form.appointmentType') + ' — ' + t('appointment.type.new') },
    { value: 'reappoint', label: t('appointmentCreate.form.appointmentType') + ' — ' + t('appointment.type.reappoint') },
    { value: 'promote', label: t('appointmentCreate.form.appointmentType') + ' — ' + t('appointment.type.promote') },
    { value: 'transfer', label: t('appointmentCreate.form.appointmentType') + ' — ' + t('appointment.type.transfer') },
    { value: 'dismiss', label: t('appointmentCreate.form.appointmentType') + ' — ' + t('appointment.type.dismiss') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('appointmentCreate.title')}
        description={t('appointmentCreate.description')}
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: t('appointment.breadcrumb'), href: '/hrm/bo-nhiem' },
          { label: t('appointmentCreate.breadcrumb') },
        ]}
        actions={
          <div className="flex gap-2">
            <Link to="/hrm/bo-nhiem"><Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('appointmentCreate.btn.back')}</Button></Link>
          </div>
        }
      />

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle as="h3">{t('appointmentCreate.staffInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  {t('appointmentCreate.form.fullName')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <Input value={form.name} onChange={(e: InputField) => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('appointmentCreate.form.fullNamePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  {t('appointmentCreate.form.dept')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
                  value={form.dept} onChange={(e: SelectField) => setForm(f => ({ ...f, dept: e.target.value }))}>
                  <option value="">— {t('appointmentCreate.form.dept')} —</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('appointmentCreate.form.currentPosition')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
                  value={form.currentPosition} onChange={(e: SelectField) => setForm(f => ({ ...f, currentPosition: e.target.value }))}>
                  <option value="">— {t('appointmentCreate.form.currentPosition')} —</option>
                  {POSITIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('appointmentCreate.form.staffCode')}</label>
                <Input value={form.name ? `VC-2026-${Math.floor(Math.random() * 900 + 100)}` : ''} placeholder={t('appointmentCreate.form.staffCodeAuto')} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h3">{t('appointmentCreate.appointmentInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  {t('appointmentCreate.form.appointmentType')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
                  value={form.type} onChange={(e: SelectField) => setForm(f => ({ ...f, type: e.target.value }))}>
                  {APPOINTMENT_TYPES.map(at => <option key={at.value} value={at.value}>{at.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  {t('appointmentCreate.form.newPosition')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
                  value={form.newPosition} onChange={(e: SelectField) => setForm(f => ({ ...f, newPosition: e.target.value }))}>
                  <option value="">— {t('appointmentCreate.form.newPosition')} —</option>
                  {POSITIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  {t('appointmentCreate.form.effectiveDate')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <Input type="date" value={form.effectiveDate} onChange={(e: InputField) => setForm(f => ({ ...f, effectiveDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                {t('appointmentCreate.form.reason')} <span className="text-[rgb(var(--error))]">*</span>
              </label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none"
                rows={4} placeholder={t('appointmentCreate.form.reasonPlaceholder')}
                value={form.reason} onChange={(e: TextareaField) => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h3">{t('appointmentCreate.requesterInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                  {t('appointmentCreate.form.requester')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <Input value={form.requester} onChange={(e: InputField) => setForm(f => ({ ...f, requester: e.target.value }))} placeholder={t('appointmentCreate.form.requesterPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('appointmentCreate.form.requesterDept')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
                  value={form.requesterDept} onChange={(e: SelectField) => setForm(f => ({ ...f, requesterDept: e.target.value }))}>
                  <option value="">— {t('appointmentCreate.form.requesterDept')} —</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('appointmentCreate.form.attachFile')}</label>
              <div className="flex items-center gap-3">
                <Input value={form.file} onChange={(e: InputField) => setForm(f => ({ ...f, file: e.target.value }))}
                  placeholder={t('appointmentCreate.form.selectFilePlaceholder')} className="flex-1" />
                <Button variant="outline" size="sm">{t('appointmentCreate.form.browse')}</Button>
              </div>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('appointmentCreate.form.fileHint')}</p>
            </div>
          </CardContent>
        </Card>

        {(form.name || form.newPosition) && (
          <Card>
            <CardHeader>
              <CardTitle as="h3">{t('appointmentCreate.preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-[rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.03)] p-4 space-y-2 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="neutral">{form.type}</Badge>
                  <Badge variant="info">{t('appointmentCreate.previewPending')}</Badge>
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  {t('appointmentCreate.previewFor')}: <strong>{form.name || '—'}</strong>
                </p>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  {t('appointmentCreate.previewAppointment')}: <strong>{form.currentPosition || '—'}</strong> → <strong>{form.newPosition || '—'}</strong>
                </p>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  {t('appointmentCreate.previewDate')}: <strong>{form.effectiveDate || '—'}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Link to="/hrm/bo-nhiem"><Button variant="outline">{t('appointmentCreate.btn.cancel')}</Button></Link>
          <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>{t('appointmentCreate.btn.saveDraft')}</Button>
          <Button variant="primary" leftIcon={<Save className="h-4 w-4" />}>{t('appointmentCreate.btn.submit')}</Button>
        </div>
      </div>
    </div>
  );
}