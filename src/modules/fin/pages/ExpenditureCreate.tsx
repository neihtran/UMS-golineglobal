import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';

const CATEGORIES = ['Vật liệu', 'Điện nước', 'Thiết bị', 'In ấn', 'Sửa chữa', 'Khác'];
const DEPTS = ['Phòng Hành chính', 'Phòng Đào tạo', 'Khoa CNTT', 'Khoa Kinh tế', 'Phòng Tài chính'];

export default function ExpenditureCreate() {
  const { t } = useTranslation('fin');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    description: '',
    category: CATEGORIES[0],
    dept: DEPTS[0],
    amount: '',
    date: '',
    notes: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('create.title')}
        description={t('create.subtitle')}
        breadcrumbs={[
          { label: 'FIN', href: '/fin' },
          { label: t('expenditure.title'), href: '/fin/chi-tieu' },
          { label: t('create.title') },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/fin/chi-tieu')}>
            {t('create.back')}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t('create.form.maPhieu')} required>
              <Input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="VD: CP-2026-006" />
            </FormField>
            <FormField label={t('create.form.ngayChi')} required>
              <Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
            </FormField>
          </div>

          <FormField label={t('create.form.moTa')} required>
            <Input value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="VD: Chi phí mua sắm thiết bị phòng lab" />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label={t('create.form.loaiChiPhi')}>
              <select title={t('create.form.selectCategory')} value={form.category} onChange={(e) => update('category', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label={t('create.form.donViYeuCau')}>
              <select title={t('create.form.selectDept')} value={form.dept} onChange={(e) => update('dept', e.target.value)}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] w-full">
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label={t('create.form.soTien')} required>
              <Input type="number" value={form.amount} onChange={(e) => update('amount', e.target.value)} placeholder="0" />
            </FormField>
          </div>

          <FormField label={t('create.form.ghiChu')}>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)}
              placeholder="Ghi chú thêm (nếu có)..." rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3]" />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
            <Button variant="outline" onClick={() => navigate('/fin/chi-tieu')}>{t('create.cancel')}</Button>
            <Button leftIcon={<Save className="h-4 w-4" />}>{t('create.createBtn')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
