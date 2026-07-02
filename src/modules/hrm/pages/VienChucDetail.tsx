import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Building2, Calendar, Award, Edit2, ArrowLeft, Printer, Plus, FileText, Download } from 'lucide-react';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Modal, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const MOCK_STAFF = {
  id: 'vc001', code: 'VC-2020-001', name: 'Nguyen Hoang Long', dob: '1985-03-15',
  cccd: '025 085 001234', gender: 'Nam', ethnicity: 'Kinh', religion: 'Khong',
  address: 'So 12, Duong Nguyen Trai, Quan 1, TP.HCM',
  contact: '48/5 Duong Le Van Viet, Quan 9, TP.HCM',
  phone: '0912 345 678', email: 'long.nguyen@truong.edu.vn',
  title: 'PGS.TS', position: 'Truong khoa', dept: 'Khoa CNTT',
  contractType: 'Co huu', salary: 18500000, status: 'active', joinDate: '2015-09-01',
  education: 'Tien si', major: 'Khoa hoc May tinh', school: 'DH Bach Khoa TP.HCM', gradYear: 2012,
  languages: [{ name: 'Tieng Anh', level: 'IELTS 7.0' }, { name: 'Tieng Phap', level: 'B1' }],
  itSkills: 'MOS Excel, Word',
};

const CONTRACT_HISTORY = [
  { year: '2015', type: 'Thu viec', note: 'HD 03 thang', status: 'Het han' },
  { year: '2015', type: 'Co huu lan 1', note: 'HD 12 thang', status: 'Het han' },
  { year: '2016', type: 'Co huu lan 2', note: 'HD khong xac dinh thoi han', status: 'Het han' },
  { year: '2020', type: 'Bo nhiem Truong khoa', note: 'QD so 234/TK-2020', status: 'Hieu luc' },
];

const SALARY_HISTORY = [
  { date: '2025-01-01', salary: 18500000, allowance: 4200000, insurance: 1850000, net: 20850000 },
  { date: '2024-01-01', salary: 17800000, allowance: 4000000, insurance: 1780000, net: 20020000 },
  { date: '2023-01-01', salary: 16500000, allowance: 3800000, insurance: 1650000, net: 18650000 },
];

const TRAINING = [
  { id: 'tr01', name: 'Phuong phap giang day hien dai', org: 'Bo GD&DT', year: 2023, cert: 'Chung chi' },
  { id: 'tr02', name: 'Ky nang lanh dao cho Truong khoa', org: 'Hoc vien Hanh chinh', year: 2022, cert: 'Chung chi' },
  { id: 'tr03', name: 'AI trong giao duc dai hoc', org: 'DH RMIT', year: 2024, cert: 'Chung chi' },
];

const DISCIPLINE = [
  { year: 2023, type: 'Khen thuong', note: 'Chien si thi dua cap truong', level: 'success' },
  { year: 2022, type: 'Khen thuong', note: 'Tap the lop xuat sac', level: 'success' },
  { year: 2021, type: 'Ky luat', note: 'Nhac nho vi pham gio giang', level: 'warning' },
];

const APPOINTMENTS = [
  { id: 'apt01', type: 'Bo nhiem', title: 'Truong khoa CNTT', decisionNo: '234/TK-2020', decisionDate: '2020-06-10', effectiveDate: '2020-06-15', signer: 'Hieu truong', status: 'Het hieu luc', statusVariant: 'neutral' as const, isCurrent: false },
  { id: 'apt02', type: 'Bo nhiem lai', title: 'Truong khoa CNTT', decisionNo: '112/TK-2024', decisionDate: '2024-06-05', effectiveDate: '2024-06-10', signer: 'Hieu truong', status: 'Hieu luc', statusVariant: 'success' as const, isCurrent: true },
  { id: 'apt03', type: 'Dieu chuyen', title: 'Giang vien Khoa CNTT', decisionNo: 'QD-2015-001', decisionDate: '2015-09-01', effectiveDate: '2015-09-01', signer: 'Hieu truong', status: 'Het hieu luc', statusVariant: 'neutral' as const, isCurrent: false },
];

const ATTACHMENTS = [
  { name: 'Bang Tien si', type: 'PDF', size: '2.4 MB', date: '2012-05-20' },
  { name: 'CCCD mat truoc', type: 'JPG', size: '1.1 MB', date: '2020-09-01' },
  { name: 'HDLKhong xac dinh', type: 'PDF', size: '0.8 MB', date: '2016-03-15' },
  { name: 'QD bo nhiem TK 2024', type: 'PDF', size: '0.5 MB', date: '2024-06-05' },
];

const TAB_KEYS = [
  'vienChucDetail.tabs.basic',
  'vienChucDetail.tabs.contractSalary',
  'vienChucDetail.tabs.appointment',
  'vienChucDetail.tabs.training',
  'vienChucDetail.tabs.attendance',
  'vienChucDetail.tabs.reward',
  'vienChucDetail.tabs.documents',
];

const STATUS_CONFIG = {
  active: { variant: 'success' as const, labelKey: 'vienChuc.status.active' },
  trial: { variant: 'warning' as const, labelKey: 'vienChuc.status.trial' },
  leave: { variant: 'error' as const, labelKey: 'vienChuc.status.leave' },
  inactive: { variant: 'neutral' as const, labelKey: 'vienChuc.status.inactive' },
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-b border-[rgb(var(--border)/0.4)] last:border-0">
      <p className="w-40 shrink-0 text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide">{label}</p>
      <p className="text-sm text-[rgb(var(--text-primary))]">{value}</p>
    </div>
  );
}

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

type SelectField = React.ChangeEvent<HTMLSelectElement>;
type InputField = React.ChangeEvent<HTMLInputElement>;
type TextareaField = React.ChangeEvent<HTMLTextAreaElement>;

export default function VienChucDetail() {
  const { t } = useTranslation('hrm');
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentAction, setAppointmentAction] = useState<'create' | 'view' | 'edit' | 'renew'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<typeof APPOINTMENTS[0] | null>(null);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [disciplineOpen, setDisciplineOpen] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    name: MOCK_STAFF.name, dob: MOCK_STAFF.dob, cccd: MOCK_STAFF.cccd,
    phone: MOCK_STAFF.phone, email: MOCK_STAFF.email,
    address: MOCK_STAFF.contact, ethnicity: MOCK_STAFF.ethnicity, religion: MOCK_STAFF.religion,
  });

  const [contractForm, setContractForm] = useState({
    type: 'Co huu', startDate: '', endDate: '', salary: MOCK_STAFF.salary.toString(), note: '',
  });

  const [salaryForm, setSalaryForm] = useState({
    salary: MOCK_STAFF.salary.toString(), allowance: '4200000', reason: '',
  });

  const [appointmentForm, setAppointmentForm] = useState({
    type: 'Bo nhiem', title: '', decisionNo: '', decisionDate: '', effectiveDate: '', signer: 'Hieu truong',
  });

  const [credentialForm, setCredentialForm] = useState({
    name: '', org: '', year: new Date().getFullYear().toString(), cert: 'Chung chi',
  });

  const [leaveForm, setLeaveForm] = useState({
    type: 'Nghi phep nam', startDate: '', endDate: '', reason: '', days: '0',
  });

  const staff = MOCK_STAFF;
  const sc = STATUS_CONFIG[staff.status as keyof typeof STATUS_CONFIG];
  const activeTab = TAB_KEYS[activeTabIdx];

  return (
    <div className="space-y-6">
      <PageHeader
        title={staff.name}
        description={`${staff.code} · ${staff.title} · ${staff.dept}`}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('vienChuc.title', { defaultValue: 'Vien chuc' }), href: '/hrm/vien-chuc' }, { label: staff.name }]}
        actions={
          <>
            <Link to="/hrm/vien-chuc"><Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('vienChucDetail.btn.back')}</Button></Link>
            <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />}>{t('vienChucDetail.btn.print')}</Button>
            <Button variant="primary" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => setPersonalOpen(true)}>{t('vienChucDetail.btn.edit')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-3xl font-bold text-white mb-4 ring-4 ring-[rgb(var(--primary)/0.2)]">
                {staff.name.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{staff.name}</h2>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{staff.title}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{staff.position}</p>
              <Badge variant={sc.variant} dot className="mt-2">{t(sc.labelKey)}</Badge>
              <div className="mt-6 w-full space-y-2.5">
                {[
                  { icon: <Mail className="h-3.5 w-3.5" />, text: staff.email },
                  { icon: <Phone className="h-3.5 w-3.5" />, text: staff.phone },
                  { icon: <Building2 className="h-3.5 w-3.5" />, text: staff.dept },
                  { icon: <Calendar className="h-3.5 w-3.5" />, text: `${t('vienChucDetail.info.joinDate')}: ${staff.joinDate}` },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-[rgb(var(--text-secondary))]">
                    <span className="text-[rgb(var(--text-muted))] shrink-0">{icon}</span>
                    <span className="truncate">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1" leftIcon={<Phone className="h-3.5 w-3.5" />}>{t('vienChucDetail.btn.call')}</Button>
                <Button variant="outline" size="sm" className="flex-1" leftIcon={<Mail className="h-3.5 w-3.5" />}>{t('vienChucDetail.btn.email')}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle as="h3">{t('vienChucDetail.quickInfo')}</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: t('vienChucDetail.info.joinDate'), value: staff.dob },
                { label: t('vienChucDetail.info.cccd'), value: staff.cccd },
                { label: t('vienChucDetail.info.gender'), value: staff.gender },
                { label: t('vienChucDetail.info.education'), value: staff.education },
                { label: t('vienChucDetail.info.major'), value: staff.major },
                { label: t('vienChucDetail.info.joinDate'), value: staff.joinDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-[rgb(var(--border)/0.4)] last:border-0 text-sm">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="border-b border-[rgb(var(--border)/0.6)] px-5">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {TAB_KEYS.map((key, i) => (
                  <button
                    key={key}
                    onClick={() => setActiveTabIdx(i)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTabIdx === i
                        ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                        : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                    }`}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {activeTab === 'vienChucDetail.tabs.basic' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.personalInfo')}</h4>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => setPersonalOpen(true)}>{t('vienChucDetail.btn.editPersonal')}</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8">
                      <InfoRow label={t('vienChucDetail.info.fullName')} value={staff.name} />
                      <InfoRow label={t('vienChucDetail.info.joinDate')} value={staff.dob} />
                      <InfoRow label={t('vienChucDetail.info.cccd')} value={staff.cccd} />
                      <InfoRow label={t('vienChucDetail.info.gender')} value={staff.gender} />
                      <InfoRow label={t('vienChucDetail.info.ethnicity')} value={staff.ethnicity} />
                      <InfoRow label={t('vienChucDetail.info.religion')} value={staff.religion} />
                      <InfoRow label={t('vienChucDetail.info.address')} value={staff.address} />
                      <InfoRow label={t('vienChucDetail.info.contactAddress')} value={staff.contact} />
                      <InfoRow label={t('vienChucDetail.info.phone')} value={staff.phone} />
                      <InfoRow label={t('vienChucDetail.info.personalEmail')} value={staff.email} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.educationInfo')}</h4>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => setPersonalOpen(true)}>{t('vienChucDetail.btn.editPersonal')}</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8">
                      <InfoRow label={t('vienChucDetail.info.education')} value={staff.education} />
                      <InfoRow label={t('vienChucDetail.info.major')} value={staff.major} />
                      <InfoRow label={t('vienChucDetail.info.school')} value={staff.school} />
                      <InfoRow label={t('vienChucDetail.info.gradYear')} value={staff.gradYear.toString()} />
                      <InfoRow label={t('vienChucDetail.info.foreignLang')} value={staff.languages.map((l) => `${l.name} (${l.level})`).join(', ')} />
                      <InfoRow label={t('vienChucDetail.info.itSkill')} value={staff.itSkills} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vienChucDetail.tabs.contractSalary' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.contractHistory')}</h4>
                      <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setContractOpen(true)}>{t('vienChucDetail.btn.renewContract')}</Button>
                    </div>
                    <div className="space-y-0">
                      {CONTRACT_HISTORY.map((c, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1] text-xs font-bold text-[rgb(var(--primary))]">{c.year}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.type}</p>
                            <p className="text-xs text-[rgb(var(--text-muted))]">{c.note}</p>
                          </div>
                          <Badge variant={c.status === 'Hieu luc' ? 'success' : 'neutral'}>{c.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.currentSalary')}</h4>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => setSalaryOpen(true)}>{t('vienChucDetail.btn.adjustSalary')}</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { labelKey: 'vienChucDetail.salaryBase', value: fmt(SALARY_HISTORY[0].salary) },
                        { labelKey: 'vienChucDetail.allowance', value: fmt(SALARY_HISTORY[0].allowance) },
                        { labelKey: 'vienChucDetail.insurance', value: fmt(SALARY_HISTORY[0].insurance) },
                        { labelKey: 'vienChucDetail.netPay', value: fmt(SALARY_HISTORY[0].net) },
                      ].map(({ labelKey, value }) => (
                        <div key={labelKey} className="rounded-lg border border-[rgb(var(--border))] p-3">
                          <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
                          <p className="text-base font-bold text-[rgb(var(--text-primary))] mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.salaryHistory')}</h4>
                      <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('vienChucDetail.btn.exportExcel')}</Button>
                    </div>
                    <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-[rgb(var(--bg-base))]">
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.salaryHistoryDate')}</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.salaryBase')}</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.allowance')}</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.netPay')}</th>
                        </tr></thead>
                        <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                          {SALARY_HISTORY.map((s) => (
                            <tr key={s.date} className="hover:bg-[rgb(var(--bg-hover))]">
                              <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">{s.date}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-[rgb(var(--text-secondary))]">{fmt(s.salary)}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-[rgb(var(--text-secondary))]">{fmt(s.allowance)}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-semibold text-[rgb(var(--text-primary))]">{fmt(s.net)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vienChucDetail.tabs.appointment' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.appointmentHistory')}</h4>
                      <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">{APPOINTMENTS.length} {t('vienChucDetail.appointmentCount')}</p>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}
                      onClick={() => { setSelectedAppointment(null); setAppointmentAction('create'); setAppointmentOpen(true); }}>
                      {t('vienChucDetail.btn.createDecision')}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {APPOINTMENTS.map((apt) => (
                      <div key={apt.id} className={`rounded-xl border p-5 transition-colors ${apt.isCurrent ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.03)]' : 'border-[rgb(var(--border))]'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${apt.isCurrent ? 'bg-[rgb(var(--primary)/0.1] text-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'}`}>
                              <Award className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <Badge variant="neutral" size="sm">{t(`appointment.appointmentType.${apt.type.replace(/ /g, '')}`) || apt.type}</Badge>
                                {apt.isCurrent && <Badge variant="primary" size="sm">{t('vienChucDetail.badge.current')}</Badge>}
                              </div>
                              <p className="font-semibold text-[rgb(var(--text-primary))]">{apt.title}</p>
                            </div>
                          </div>
                          <Badge variant={apt.statusVariant} dot>{apt.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                            <span>{t('vienChucDetail.modal.decisionShortLabels.decisionNo')}: <strong className="font-mono text-[rgb(var(--text-primary))]">{apt.decisionNo}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                            <span>{t('vienChucDetail.modal.decisionShortLabels.decisionDate')}: <strong className="text-[rgb(var(--text-primary))]">{apt.decisionDate}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                            <span>{t('vienChucDetail.modal.decisionShortLabels.signer')}: <strong className="text-[rgb(var(--text-primary))]">{apt.signer}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                            <span>{t('vienChucDetail.modal.decisionShortLabels.effectiveDate')}: <strong className="text-[rgb(var(--text-primary))]">{apt.effectiveDate}</strong></span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}
                            onClick={() => { setSelectedAppointment(apt); setAppointmentAction('view'); setAppointmentOpen(true); }}>
                            {t('vienChucDetail.btn.viewDecision')}
                          </Button>
                          <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                            onClick={() => { setSelectedAppointment(apt); setAppointmentAction('edit'); setAppointmentOpen(true); }}>
                            {t('action.edit')}
                          </Button>
                          {!apt.isCurrent && (
                            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}
                              onClick={() => { setSelectedAppointment(apt); setAppointmentAction('renew'); setAppointmentOpen(true); }}>
                              {t('vienChucDetail.btn.extend')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'vienChucDetail.tabs.training' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.credentials')}</h4>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCredentialOpen(true)}>{t('vienChucDetail.btn.addCert')}</Button>
                  </div>
                  {TRAINING.map((t_item) => (
                    <div key={t_item.id} className="flex items-start gap-4 rounded-lg border border-[rgb(var(--border))] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1] text-lg">*</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t_item.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t_item.org} · {t_item.year}</p>
                      </div>
                      <Badge variant="success">{t_item.cert}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'vienChucDetail.tabs.attendance' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.leaveBalanceYear')}</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('vienChucDetail.btn.exportReport')}</Button>
                      <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setLeaveOpen(true)}>{t('vienChucDetail.btn.requestLeave')}</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { labelKey: 'vienChucDetail.annualLeave', value: '12', unit: t('vienChucDetail.leaveDaysUnit') },
                      { labelKey: 'vienChucDetail.sickLeave', value: '3', unit: t('vienChucDetail.leaveDaysUnit') },
                      { labelKey: 'vienChucDetail.unpaidLeave', value: '0', unit: t('vienChucDetail.leaveDaysUnit') },
                      { labelKey: 'vienChucDetail.totalLeave', value: '3', unit: t('vienChucDetail.leaveDaysUnit') },
                    ].map(({ labelKey, value, unit }) => (
                      <div key={labelKey} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-center">
                        <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
                        <p className="text-xl font-bold text-[rgb(var(--text-primary))] mt-1">{value}</p>
                        <p className="text-[10px] text-[rgb(var(--text-muted))]">{unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'vienChucDetail.tabs.reward' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.disciplineHistory')}</h4>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setDisciplineOpen(true)}>{t('vienChucDetail.btn.addReward')}</Button>
                  </div>
                  {DISCIPLINE.map((d, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${d.level === 'success' ? 'bg-[rgb(var(--success)/0.1] text-[rgb(var(--success))]' : 'bg-[rgb(var(--warning)/0.1] text-[rgb(var(--warning))]'}`}>
                        {d.level === 'success' ? '!' : '!'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{d.type}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{d.note}</p>
                      </div>
                      <span className="text-xs font-mono text-[rgb(var(--text-muted))]">{d.year}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'vienChucDetail.tabs.documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.documentsList')} ({ATTACHMENTS.length})</h4>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>{t('vienChucDetail.btn.upload')}</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ATTACHMENTS.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] p-3 hover:border-[rgb(var(--primary-light))] transition-colors cursor-pointer">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08] text-[rgb(var(--primary))] text-xs font-bold">{f.type}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{f.name}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{f.size} · {f.date}</p>
                        </div>
                        <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal: Edit Personal */}
      <Modal open={personalOpen} onClose={() => setPersonalOpen(false)} title={t('vienChucDetail.modal.editPersonalTitle')} size="xl"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setPersonalOpen(false)}>{t('cancel')}</Button><Button variant="primary" onClick={() => setPersonalOpen(false)}>{t('save')}</Button></div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-lg font-bold text-white">
              {staff.name.split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{staff.code} · {staff.title} · {staff.dept}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.fullName')}</label><Input value={personalForm.name} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.dob')}</label><Input type="date" value={personalForm.dob} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, dob: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.cccd')}</label><Input value={personalForm.cccd} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, cccd: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.phone')}</label><Input value={personalForm.phone} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.ethnicity')}</label><Input value={personalForm.ethnicity} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, ethnicity: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.religion')}</label><Input value={personalForm.religion} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, religion: e.target.value }))} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.email')}</label><Input type="email" value={personalForm.email} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.contactAddress')}</label><Input value={personalForm.address} onChange={(e: InputField) => setPersonalForm(f => ({ ...f, address: e.target.value }))} /></div>
          </div>
        </div>
      </Modal>

      {/* Modal: Renew Contract */}
      <Modal open={contractOpen} onClose={() => setContractOpen(false)} title={t('vienChucDetail.modal.contractTitle')} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setContractOpen(false)}>{t('cancel')}</Button><Button variant="primary" onClick={() => setContractOpen(false)}>{t('save')}</Button></div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
              {staff.name.split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">{staff.code} · {staff.dept}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.contractType')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={contractForm.type} onChange={(e: SelectField) => setContractForm(f => ({ ...f, type: e.target.value }))}>
                <option>Co huu</option><option>Thinh giang</option><option>Thu viec</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.salaryBase')} (VND)</label><Input type="number" value={contractForm.salary} onChange={(e: InputField) => setContractForm(f => ({ ...f, salary: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.startDate')}</label><Input type="date" value={contractForm.startDate} onChange={(e: InputField) => setContractForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.endDate')}</label><Input type="date" value={contractForm.endDate} onChange={(e: InputField) => setContractForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.note')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('vienChucDetail.modal.notePlaceholder')} value={contractForm.note} onChange={(e: TextareaField) => setContractForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Salary Adjust */}
      <Modal open={salaryOpen} onClose={() => setSalaryOpen(false)} title={t('vienChucDetail.modal.salaryAdjustTitle')} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setSalaryOpen(false)}>{t('cancel')}</Button><Button variant="primary" onClick={() => setSalaryOpen(false)}>{t('save')}</Button></div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
              {staff.name.split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">{staff.code} · {t('vienChucDetail.salaryBase')}: <strong>{fmt(SALARY_HISTORY[0].salary)}</strong></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.newSalary')}</label><Input type="number" value={salaryForm.salary} onChange={(e: InputField) => setSalaryForm(f => ({ ...f, salary: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.allowanceAmount')}</label><Input type="number" value={salaryForm.allowance} onChange={(e: InputField) => setSalaryForm(f => ({ ...f, allowance: e.target.value }))} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.salaryReason')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={3} placeholder={t('vienChucDetail.modal.salaryReasonPlaceholder')} value={salaryForm.reason} onChange={(e: TextareaField) => setSalaryForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[rgb(var(--text-secondary))]">{t('vienChucDetail.modal.salaryOld')}</span><span className="font-mono font-semibold text-[rgb(var(--text-primary))]">{fmt(SALARY_HISTORY[0].salary)}</span></div>
            <div className="flex justify-between"><span className="text-[rgb(var(--text-secondary))]">{t('vienChucDetail.modal.newSalaryLabel')}</span><span className="font-mono font-semibold text-[rgb(var(--success))]">{fmt(Number(salaryForm.salary))}</span></div>
            <div className="flex justify-between border-t border-[rgb(var(--border)/0.5)] pt-2">
              <span className="text-[rgb(var(--text-secondary))]">{t('vienChucDetail.modal.difference')}</span>
              <span className={`font-mono font-bold ${Number(salaryForm.salary) >= SALARY_HISTORY[0].salary ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'}`}>
                {Number(salaryForm.salary) >= SALARY_HISTORY[0].salary ? '+' : ''}{fmt(Number(salaryForm.salary) - SALARY_HISTORY[0].salary)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Decision (create/view/edit/renew) */}
      <Modal open={appointmentOpen} onClose={() => setAppointmentOpen(false)}
        title={
          appointmentAction === 'create' ? t('vienChucDetail.modal.decisionModal.create') :
          appointmentAction === 'view' ? t('vienChucDetail.modal.decisionModal.view') :
          appointmentAction === 'renew' ? t('vienChucDetail.modal.decisionModal.renew') :
          t('vienChucDetail.modal.decisionModal.edit')
        }
        size="xl"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setAppointmentOpen(false)}>{t('close')}</Button>
          {appointmentAction !== 'view' && <Button variant="primary" onClick={() => setAppointmentOpen(false)}>{appointmentAction === 'renew' ? t('save') : t('save')}</Button>}
        </div>}>
        {appointmentAction === 'view' && selectedAppointment ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('vienChucDetail.modal.decisionFields.type'), value: selectedAppointment.type },
                { label: t('vienChucDetail.modal.decisionFields.title'), value: selectedAppointment.title },
                { label: t('vienChucDetail.modal.decisionFields.decisionNo'), value: selectedAppointment.decisionNo },
                { label: t('vienChucDetail.modal.decisionFields.decisionDate'), value: selectedAppointment.decisionDate },
                { label: t('vienChucDetail.modal.decisionFields.signer'), value: selectedAppointment.signer },
                { label: t('vienChucDetail.modal.decisionFields.effectiveDate'), value: selectedAppointment.effectiveDate },
                { label: t('table.trangThai'), value: selectedAppointment.status },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-36">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] text-center text-[rgb(var(--text-muted))]">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('vienChucDetail.modal.decisionFields.file')}: <strong className="font-mono">{selectedAppointment.decisionNo}.pdf</strong></p>
              <p className="text-xs mt-1">{t('vienChucDetail.modal.decisionFields.canDownload')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedAppointment && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
                <Award className="h-8 w-8 text-[rgb(var(--primary))] shrink-0" />
                <div>
                  <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedAppointment.title}</p>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">
                    {selectedAppointment.type} · So QD: <strong className="font-mono">{selectedAppointment.decisionNo}</strong> · Ngay: {selectedAppointment.decisionDate}
                  </p>
                </div>
                <Badge variant={selectedAppointment.statusVariant} dot className="ml-auto shrink-0">{selectedAppointment.status}</Badge>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.type')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={appointmentForm.type} onChange={(e: SelectField) => setAppointmentForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Bo nhiem">{t('appointment.appointmentType.boNhiemMoi')}</option><option value="Bo nhiem lai">{t('appointment.appointmentType.boNhiemLai')}</option><option value="Dieu chuyen">{t('appointment.appointmentType.dieuChuyen')}</option><option value="Mien nhiem">{t('appointment.appointmentType.mienNhiem')}</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.title')}</label>
                <Input value={selectedAppointment ? selectedAppointment.title : appointmentForm.title} onChange={(e: InputField) => setAppointmentForm(f => ({ ...f, title: e.target.value }))} placeholder={t('vienChucDetail.modal.decisionFields.titlePlaceholder')} />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.decisionNo')}</label>
                <Input value={selectedAppointment ? selectedAppointment.decisionNo : appointmentForm.decisionNo} onChange={(e: InputField) => setAppointmentForm(f => ({ ...f, decisionNo: e.target.value }))} placeholder={t('vienChucDetail.modal.decisionFields.decisionNoPlaceholder')} />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.signer')}</label>
                <Input value={appointmentForm.signer} onChange={(e: InputField) => setAppointmentForm(f => ({ ...f, signer: e.target.value }))} />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.decisionDate')}</label>
                <Input type="date" value={selectedAppointment ? selectedAppointment.decisionDate : appointmentForm.decisionDate} onChange={(e: InputField) => setAppointmentForm(f => ({ ...f, decisionDate: e.target.value }))} />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.effectiveDate')}</label>
                <Input type="date" value={selectedAppointment ? selectedAppointment.effectiveDate : appointmentForm.effectiveDate} onChange={(e: InputField) => setAppointmentForm(f => ({ ...f, effectiveDate: e.target.value }))} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Credential */}
      <Modal open={credentialOpen} onClose={() => setCredentialOpen(false)} title={t('vienChucDetail.modal.credentialTitle')} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setCredentialOpen(false)}>{t('cancel')}</Button><Button variant="primary" onClick={() => setCredentialOpen(false)}>{t('save')}</Button></div>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.credentialName')}</label>
            <Input value={credentialForm.name} onChange={(e: InputField) => setCredentialForm(f => ({ ...f, name: e.target.value }))} placeholder={t('vienChucDetail.modal.credentialNamePlaceholder')} />
          </div>
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.issuer')}</label>
            <Input value={credentialForm.org} onChange={(e: InputField) => setCredentialForm(f => ({ ...f, org: e.target.value }))} placeholder={t('vienChucDetail.modal.issuerPlaceholder')} />
          </div>
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.issueYear')}</label>
            <Input type="number" value={credentialForm.year} onChange={(e: InputField) => setCredentialForm(f => ({ ...f, year: e.target.value }))} />
          </div>
          <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.credentialType')}</label>
            <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={credentialForm.cert} onChange={(e: SelectField) => setCredentialForm(f => ({ ...f, cert: e.target.value }))}>
              <option value="Chung chi">{t('vienChucDetail.modal.credentialTypeCertificate')}</option><option value="Bang tot nghiep">{t('vienChucDetail.modal.credentialTypeDegree')}</option><option value="Chung nhan">{t('vienChucDetail.modal.credentialTypeCertification')}</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal: Leave Request */}
      <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} title={t('vienChucDetail.modal.leaveTitle')} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setLeaveOpen(false)}>{t('cancel')}</Button><Button variant="primary" onClick={() => setLeaveOpen(false)}>{t('save')}</Button></div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
              {staff.name.split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">{staff.code} · {t('vienChucDetail.modal.remainingDays')}: <strong>12 {t('vienChucDetail.leaveDaysUnit')}</strong></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.leaveType')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={leaveForm.type} onChange={(e: SelectField) => setLeaveForm(f => ({ ...f, type: e.target.value }))}>
                <option value="Nghi phep nam">{t('leaveRequestForm.leaveTypeAnnual')}</option><option value="Nghi om">{t('leaveRequestForm.leaveTypeSick')}</option><option value="Nghi khong luong">{t('leaveRequestForm.leaveTypeUnpaid')}</option><option value="Nghi thai san">{t('leaveRequestForm.leaveTypeMaternity')}</option><option value="Nghi tham nom">{t('leaveRequestForm.leaveTypePaternity')}</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.leaveDays')}</label>
              <Input type="number" min="1" value={leaveForm.days} onChange={(e: InputField) => setLeaveForm(f => ({ ...f, days: e.target.value }))} />
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.startDate')}</label>
              <Input type="date" value={leaveForm.startDate} onChange={(e: InputField) => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.endDate')}</label>
              <Input type="date" value={leaveForm.endDate} onChange={(e: InputField) => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.leaveReason')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={3} placeholder={t('vienChucDetail.modal.leaveReasonPlaceholder')} value={leaveForm.reason} onChange={(e: TextareaField) => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Discipline */}
      <Modal open={disciplineOpen} onClose={() => setDisciplineOpen(false)} title={t('vienChucDetail.modal.disciplineTitle')} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setDisciplineOpen(false)}>{t('cancel')}</Button><Button variant="primary" onClick={() => setDisciplineOpen(false)}>{t('save')}</Button></div>}>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.disciplineType')}</label>
            <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
              <option value="Khen thuong">{t('vienChucDetail.modal.disciplineTypeReward')}</option><option value="Ky luat">{t('vienChucDetail.modal.disciplineTypeDiscipline')}</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.disciplineYear')}</label>
            <Input type="number" value={new Date().getFullYear().toString()} />
          </div>
          <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.disciplineContent')}</label>
            <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={3} placeholder={t('vienChucDetail.modal.disciplineContentPlaceholder')} />
          </div>
        </div>
      </Modal>
    </div>
  );
}