import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Building2, Calendar, Award, Edit2, ArrowLeft, Printer, Plus, FileText, Download } from 'lucide-react';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Modal, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import {
  useVienChucById,
  useStaffContractHistory,
  useStaffSalaryHistory,
  useStaffTraining,
  useStaffDiscipline,
  useStaffAppointments,
  useStaffAttachments,
} from '@/hooks/useHrm';
import { useLeaveBalance } from '@/hooks/useLeave';
import type { VienChuc } from '@/types/common.types';
import type { StaffAppointmentItem } from '@/services/hrm.service';

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
      <p className="text-sm text-[rgb(var(--text-primary))]">{value || '—'}</p>
    </div>
  );
}

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

export default function VienChucDetail() {
  const { t } = useTranslation('hrm');
  const { id } = useParams<{ id: string }>();

  // ─── Tabs ───────────────────────────────────────────────────────────────────
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const activeTab = TAB_KEYS[activeTabIdx];

  // ─── Modals ────────────────────────────────────────────────────────────────
  const [personalOpen, setPersonalOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentAction, setAppointmentAction] = useState<'create' | 'view' | 'edit' | 'renew'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<StaffAppointmentItem | null>(null);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [disciplineOpen, setDisciplineOpen] = useState(false);

  // ─── Form states ───────────────────────────────────────────────────────────
  const [personalForm, setPersonalForm] = useState({
    name: '', dob: '', cccd: '', phone: '', email: '', ethnicity: '', religion: '', address: '',
  });
  const [contractForm, setContractForm] = useState({
    type: 'Co huu', salary: '', startDate: '', endDate: '', note: '',
  });
  const [salaryForm, setSalaryForm] = useState({ salary: '', allowance: '', reason: '' });
  const [appointmentForm, setAppointmentForm] = useState({
    type: 'Bo nhiem moi', title: '', decisionNo: '', signer: '', decisionDate: '', effectiveDate: '',
  });
  const [credentialForm, setCredentialForm] = useState({
    name: '', org: '', year: '', cert: 'Chung chi',
  });
  const [leaveForm, setLeaveForm] = useState({
    type: 'Nghi phep nam', days: '', startDate: '', endDate: '', reason: '',
  });

  // ─── Data fetching ─────────────────────────────────────────────────────────
  const { data: vcData, isLoading } = useVienChucById(id || '');
  const staff = (vcData as VienChuc | undefined);

  const contractHistory = useStaffContractHistory(id || '');
  const salaryHistory = useStaffSalaryHistory(id || '');
  const training = useStaffTraining(id || '');
  const discipline = useStaffDiscipline(id || '');
  const appointments = useStaffAppointments(id || '');
  const attachments = useStaffAttachments(id || '');
  const { data: leaveBalanceData } = useLeaveBalance(id || '');

  const sc = staff?.status ? STATUS_CONFIG[staff.status as keyof typeof STATUS_CONFIG] : undefined;

  const annualBalance = leaveBalanceData?.byType?.find((b: any) => b.type === 'annual');
  const sickBalance = leaveBalanceData?.byType?.find((b: any) => b.type === 'sick');
  const unpaidBalance = leaveBalanceData?.byType?.find((b: any) => b.type === 'unpaid');
  const usedAnnual = annualBalance?.used ?? 0;
  const usedSick = sickBalance?.used ?? 0;

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (isLoading || !staff) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={isLoading ? 'Đang tải...' : 'Không tìm thấy'}
          breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: 'Viên chức' }]}
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-[rgb(var(--text-muted))]">
            {isLoading ? 'Đang tải thông tin...' : 'Không tìm thấy viên chức này.'}
          </p>
        </div>
      </div>
    );
  }

  // Current salary from first salary record
  const currentSalary = salaryHistory.data?.data?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={staff.name}
        description={`${staff.code} · ${staff.title || ''} · ${(staff as any).department?.name || staff.position || ''}`}
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: t('vienChuc.title', { defaultValue: 'Viên chức' }), href: '/hrm/vien-chuc' },
          { label: staff.name },
        ]}
        actions={
          <>
            <Link to="/hrm/vien-chuc">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('vienChucDetail.btn.back')}</Button>
            </Link>
            <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />}>{t('vienChucDetail.btn.print')}</Button>
            <Button variant="primary" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => setPersonalOpen(true)}>{t('vienChucDetail.btn.edit')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-3xl font-bold text-white mb-4 ring-4 ring-[rgb(var(--primary)/0.2)]">
                {(staff.name || 'NA').split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{staff.name}</h2>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{staff.title || ''}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{staff.position || ''}</p>
              {sc && <Badge variant={sc.variant} dot className="mt-2">{t(sc.labelKey)}</Badge>}
              <div className="mt-6 w-full space-y-2.5">
                {[
                  { icon: <Mail className="h-3.5 w-3.5" />, text: staff.email || '' },
                  { icon: <Phone className="h-3.5 w-3.5" />, text: staff.phone || '' },
                  { icon: <Building2 className="h-3.5 w-3.5" />, text: (staff as any).department?.name || staff.position || '' },
                  { icon: <Calendar className="h-3.5 w-3.5" />, text: `${t('vienChucDetail.info.joinDate')}: ${staff.joinDate || ''}` },
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
                { label: t('vienChucDetail.info.joinDate'), value: staff.dob || '' },
                { label: t('vienChucDetail.info.cccd'), value: staff.cccd || '' },
                { label: t('vienChucDetail.info.gender'), value: staff.gender || '' },
                { label: t('vienChucDetail.info.education'), value: staff.education || '' },
                { label: t('vienChucDetail.info.major'), value: staff.major || '' },
                { label: t('vienChucDetail.info.joinDate'), value: staff.joinDate || '' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-[rgb(var(--border)/0.4)] last:border-0 text-sm">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value || '—'}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main content with tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {/* Tab bar */}
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

            {/* Tab content */}
            <div className="p-5">

              {/* Tab: Basic */}
              {activeTab === 'vienChucDetail.tabs.basic' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.personalInfo')}</h4>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => setPersonalOpen(true)}>{t('vienChucDetail.btn.editPersonal')}</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8">
                      <InfoRow label={t('vienChucDetail.info.fullName')} value={staff.name} />
                      <InfoRow label={t('vienChucDetail.info.joinDate')} value={staff.dob || ''} />
                      <InfoRow label={t('vienChucDetail.info.cccd')} value={staff.cccd || ''} />
                      <InfoRow label={t('vienChucDetail.info.gender')} value={staff.gender || ''} />
                      <InfoRow label={t('vienChucDetail.info.ethnicity')} value={staff.ethnicity || ''} />
                      <InfoRow label={t('vienChucDetail.info.religion')} value={staff.religion || ''} />
                      <InfoRow label={t('vienChucDetail.info.address')} value={staff.address || ''} />
                      <InfoRow label={t('vienChucDetail.info.contactAddress')} value={staff.contact || ''} />
                      <InfoRow label={t('vienChucDetail.info.phone')} value={staff.phone || ''} />
                      <InfoRow label={t('vienChucDetail.info.personalEmail')} value={staff.email || ''} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.educationInfo')}</h4>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => setPersonalOpen(true)}>{t('vienChucDetail.btn.editPersonal')}</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8">
                      <InfoRow label={t('vienChucDetail.info.education')} value={staff.education || ''} />
                      <InfoRow label={t('vienChucDetail.info.major')} value={staff.major || ''} />
                      <InfoRow label={t('vienChucDetail.info.school')} value={staff.school || ''} />
                      <InfoRow label={t('vienChucDetail.info.gradYear')} value={String(staff.gradYear || '')} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Contract & Salary */}
              {activeTab === 'vienChucDetail.tabs.contractSalary' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.contractHistory')}</h4>
                      <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setContractOpen(true)}>{t('vienChucDetail.btn.renewContract')}</Button>
                    </div>
                    <div className="space-y-0">
                      {contractHistory.isLoading ? (
                        <p className="text-sm text-[rgb(var(--text-muted))] py-4">Đang tải...</p>
                      ) : contractHistory.data?.data?.length ? (
                        contractHistory.data.data.map((c, i) => (
                          <div key={c._id || i} className="flex items-center gap-4 py-3 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">{c.year}</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.type}</p>
                              <p className="text-xs text-[rgb(var(--text-muted))]">{c.note || ''}</p>
                            </div>
                            <Badge variant={c.status === 'Hieu luc' ? 'success' : 'neutral'}>{c.status}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[rgb(var(--text-muted))] py-4">Chưa có hợp đồng nào.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.currentSalary')}</h4>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => setSalaryOpen(true)}>{t('vienChucDetail.btn.adjustSalary')}</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { labelKey: 'vienChucDetail.salaryBase', value: currentSalary ? fmt(currentSalary.baseSalary) : '—' },
                        { labelKey: 'vienChucDetail.allowance', value: currentSalary ? fmt(currentSalary.allowance) : '—' },
                        { labelKey: 'vienChucDetail.insurance', value: currentSalary ? fmt(currentSalary.insurance || 0) : '—' },
                        { labelKey: 'vienChucDetail.netPay', value: currentSalary ? fmt(currentSalary.netSalary) : '—' },
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
                        <thead>
                          <tr className="bg-[rgb(var(--bg-base))]">
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.salaryHistoryDate')}</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.salaryBase')}</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.allowance')}</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('vienChucDetail.netPay')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                          {salaryHistory.isLoading ? (
                            <tr><td colSpan={4} className="px-4 py-4 text-center text-[rgb(var(--text-muted))]">Đang tải...</td></tr>
                          ) : salaryHistory.data?.data?.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-4 text-center text-[rgb(var(--text-muted))]">Chưa có dữ liệu lương.</td></tr>
                          ) : (
                            salaryHistory.data?.data?.map((s) => (
                            <tr key={s._id} className="hover:bg-[rgb(var(--bg-hover))]">
                              <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">
                                {s.date ? new Date(s.date).toLocaleDateString('vi-VN') : '—'}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-[rgb(var(--text-secondary))]">{fmt(s.baseSalary)}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-[rgb(var(--text-secondary))]">{fmt(s.allowance)}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-semibold text-[rgb(var(--text-primary))]">{fmt(s.netSalary)}</td>
                            </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Appointment */}
              {activeTab === 'vienChucDetail.tabs.appointment' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.appointmentHistory')}</h4>
                      <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">
                        {appointments.data?.data?.length || 0} {t('vienChucDetail.appointmentCount')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}
                      onClick={() => { setSelectedAppointment(null); setAppointmentAction('create'); setAppointmentOpen(true); }}>
                      {t('vienChucDetail.btn.createDecision')}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {appointments.isLoading ? (
                      <p className="text-sm text-[rgb(var(--text-muted))] py-4">Đang tải...</p>
                    ) : appointments.data?.data?.length ? (
                      appointments.data.data.map((apt) => (
                        <div key={apt._id} className={`rounded-xl border p-5 transition-colors ${apt.isCurrent ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.03)]' : 'border-[rgb(var(--border))]'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${apt.isCurrent ? 'bg-[rgb(var(--primary)/0.1] text-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'}`}>
                                <Award className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <Badge variant="neutral" size="sm">{apt.type}</Badge>
                                  {apt.isCurrent && <Badge variant="primary" size="sm">{t('vienChucDetail.badge.current')}</Badge>}
                                </div>
                                <p className="font-semibold text-[rgb(var(--text-primary))]">{apt.title}</p>
                              </div>
                            </div>
                            <Badge variant={apt.statusVariant || 'neutral'} dot>{apt.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                              <FileText className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                              <span>{t('vienChucDetail.modal.decisionShortLabels.decisionNo')}: <strong className="font-mono text-[rgb(var(--text-primary))]">{apt.decisionNo}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                              <span>{t('vienChucDetail.modal.decisionShortLabels.decisionDate')}: <strong className="text-[rgb(var(--text-primary))]">{apt.decisionDate ? new Date(apt.decisionDate).toLocaleDateString('vi-VN') : '—'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                              <Building2 className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                              <span>{t('vienChucDetail.modal.decisionShortLabels.signer')}: <strong className="text-[rgb(var(--text-primary))]">{apt.signer}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))" />
                              <span>{t('vienChucDetail.modal.decisionShortLabels.effectiveDate')}: <strong className="text-[rgb(var(--text-primary))]">{apt.effectiveDate ? new Date(apt.effectiveDate).toLocaleDateString('vi-VN') : '—'}</strong></span>
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
                      ))
                    ) : (
                      <p className="text-sm text-[rgb(var(--text-muted))] py-4">Chưa có quyết định bổ nhiệm nào.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Training */}
              {activeTab === 'vienChucDetail.tabs.training' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.credentials')}</h4>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCredentialOpen(true)}>{t('vienChucDetail.btn.addCert')}</Button>
                  </div>
                  {training.isLoading ? (
                    <p className="text-sm text-[rgb(var(--text-muted))]">Đang tải...</p>
                  ) : training.data?.data?.length ? (
                    training.data.data.map((t_item) => (
                      <div key={t_item._id} className="flex items-start gap-4 rounded-lg border border-[rgb(var(--border))] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-lg">
                          *
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t_item.name}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t_item.organization} · {t_item.year}</p>
                        </div>
                        <Badge variant="success">{t_item.certificate || 'Chứng chỉ'}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[rgb(var(--text-muted))] py-4">Chưa có đào tạo nào được ghi nhận.</p>
                  )}
                </div>
              )}

              {/* Tab: Attendance / Leave balance */}
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
                      { labelKey: 'vienChucDetail.annualLeave', value: String(annualBalance?.remaining ?? '—') },
                      { labelKey: 'vienChucDetail.sickLeave', value: String(sickBalance?.remaining ?? '—') },
                      { labelKey: 'vienChucDetail.unpaidLeave', value: String(unpaidBalance?.remaining ?? '—') },
                      { labelKey: 'vienChucDetail.totalLeave', value: String(usedAnnual + usedSick) },
                    ].map(({ labelKey, value }) => (
                      <div key={labelKey} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-center">
                        <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
                        <p className="text-xl font-bold text-[rgb(var(--text-primary))] mt-1">{value}</p>
                        <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('vienChucDetail.leaveDaysUnit')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Reward / Discipline */}
              {activeTab === 'vienChucDetail.tabs.reward' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">{t('vienChucDetail.disciplineHistory')}</h4>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setDisciplineOpen(true)}>{t('vienChucDetail.btn.addReward')}</Button>
                  </div>
                  {discipline.isLoading ? (
                    <p className="text-sm text-[rgb(var(--text-muted))]">Đang tải...</p>
                  ) : discipline.data?.data?.length ? (
                    discipline.data.data.map((d, i) => (
                      <div key={d._id || i} className="flex items-center gap-4 py-3 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${d.level === 'success' ? 'bg-[rgb(var(--success)/0.1] text-[rgb(var(--success))]' : 'bg-[rgb(var(--warning)/0.1] text-[rgb(var(--warning))]'}`}>
                          !
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{d.type}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{d.note}</p>
                        </div>
                        <span className="text-xs font-mono text-[rgb(var(--text-muted))]">{d.year}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[rgb(var(--text-muted))] py-4">Chưa có khen thưởng/kỷ luật nào.</p>
                  )}
                </div>
              )}

              {/* Tab: Documents */}
              {activeTab === 'vienChucDetail.tabs.documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                      {t('vienChucDetail.documentsList')} ({attachments.data?.data?.length || 0})
                    </h4>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>{t('vienChucDetail.btn.upload')}</Button>
                  </div>
                  {attachments.isLoading ? (
                    <p className="text-sm text-[rgb(var(--text-muted))]">Đang tải...</p>
                  ) : attachments.data?.data?.length ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {attachments.data.data.map((f) => (
                        <div key={f._id} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] p-3 hover:border-[rgb(var(--primary-light))] transition-colors cursor-pointer">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08] text-[rgb(var(--primary))] text-xs font-bold">{f.type}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{f.name}</p>
                            <p className="text-xs text-[rgb(var(--text-muted))]">{f.size} · {f.date ? new Date(f.date).toLocaleDateString('vi-VN') : ''}</p>
                          </div>
                          <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--text-muted))] py-4">Chưa có tài liệu nào.</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal: Edit Personal */}
      <Modal open={personalOpen} onClose={() => setPersonalOpen(false)} title={t('vienChucDetail.modal.editPersonalTitle')} size="xl"
        footer={<div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setPersonalOpen(false)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={() => setPersonalOpen(false)}>{t('save')}</Button>
        </div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-lg font-bold text-white">
              {(staff.name || 'NA').split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{staff.code} · {staff.title || ''} · {staff.position || ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.fullName')}</label>
              <Input value={personalForm.name} onChange={(e) => setPersonalForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.dob')}</label>
              <Input type="date" value={personalForm.dob} onChange={(e) => setPersonalForm(f => ({ ...f, dob: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.cccd')}</label>
              <Input value={personalForm.cccd} onChange={(e) => setPersonalForm(f => ({ ...f, cccd: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.phone')}</label>
              <Input value={personalForm.phone} onChange={(e) => setPersonalForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.email')}</label>
              <Input type="email" value={personalForm.email} onChange={(e) => setPersonalForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
        </div>
      </Modal>

      {/* Modal: Renew Contract */}
      <Modal open={contractOpen} onClose={() => setContractOpen(false)} title={t('vienChucDetail.modal.contractTitle')} size="lg"
        footer={<div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setContractOpen(false)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={() => setContractOpen(false)}>{t('save')}</Button>
        </div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
              {(staff.name || 'NA').split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">{staff.code}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.contractType')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]"
                value={contractForm.type} onChange={(e) => setContractForm(f => ({ ...f, type: e.target.value }))}>
                <option>{t('vienChucDetail.contractTypeCoHuu')}</option>
                <option>{t('vienChucDetail.contractTypeThinhGiang')}</option>
                <option>{t('vienChucDetail.contractTypeThuViec')}</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.salaryBase')} (VND)</label>
              <Input type="number" value={contractForm.salary} onChange={(e) => setContractForm(f => ({ ...f, salary: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.startDate')}</label>
              <Input type="date" value={contractForm.startDate} onChange={(e) => setContractForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.endDate')}</label>
              <Input type="date" value={contractForm.endDate} onChange={(e) => setContractForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.note')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)] resize-none" rows={2}
                placeholder={t('vienChucDetail.modal.notePlaceholder')}
                value={contractForm.note} onChange={(e) => setContractForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Salary Adjust */}
      <Modal open={salaryOpen} onClose={() => setSalaryOpen(false)} title={t('vienChucDetail.modal.salaryAdjustTitle')} size="lg"
        footer={<div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setSalaryOpen(false)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={() => setSalaryOpen(false)}>{t('save')}</Button>
        </div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
              {(staff.name || 'NA').split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">{staff.code} · {t('vienChucDetail.salaryBase')}: <strong>{currentSalary ? fmt(currentSalary.baseSalary) : '—'}</strong></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.newSalary')}</label>
              <Input type="number" value={salaryForm.salary} onChange={(e) => setSalaryForm(f => ({ ...f, salary: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.allowanceAmount')}</label>
              <Input type="number" value={salaryForm.allowance} onChange={(e) => setSalaryForm(f => ({ ...f, allowance: e.target.value }))} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.salaryReason')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)] resize-none" rows={3}
                placeholder={t('vienChucDetail.modal.salaryReasonPlaceholder')}
                value={salaryForm.reason} onChange={(e) => setSalaryForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
          {currentSalary && (
            <div className="p-4 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[rgb(var(--text-secondary))]">{t('vienChucDetail.modal.salaryOld')}</span><span className="font-mono font-semibold text-[rgb(var(--text-primary))]">{fmt(currentSalary.baseSalary)}</span></div>
              <div className="flex justify-between"><span className="text-[rgb(var(--text-secondary))]">{t('vienChucDetail.modal.newSalaryLabel')}</span><span className="font-mono font-semibold text-[rgb(var(--success))]">{fmt(Number(salaryForm.salary) || 0)}</span></div>
              <div className="flex justify-between border-t border-[rgb(var(--border)/0.5)] pt-2">
                <span className="text-[rgb(var(--text-secondary))]">{t('vienChucDetail.modal.difference')}</span>
                <span className={`font-mono font-bold ${Number(salaryForm.salary) >= currentSalary.baseSalary ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'}`}>
                  {Number(salaryForm.salary) >= currentSalary.baseSalary ? '+' : ''}{fmt(Number(salaryForm.salary || 0) - currentSalary.baseSalary)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Decision */}
      <Modal open={appointmentOpen} onClose={() => setAppointmentOpen(false)}
        title={
          appointmentAction === 'create' ? t('vienChucDetail.modal.decisionModal.create') :
          appointmentAction === 'view' ? t('vienChucDetail.modal.decisionModal.view') :
          appointmentAction === 'renew' ? t('vienChucDetail.modal.decisionModal.renew') :
          t('vienChucDetail.modal.decisionModal.edit')
        }
        size="xl"
        footer={<div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setAppointmentOpen(false)}>{t('close')}</Button>
          {appointmentAction !== 'view' && <Button variant="primary" onClick={() => setAppointmentOpen(false)}>{t('save')}</Button>}
        </div>}>
        {appointmentAction === 'view' && selectedAppointment ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('vienChucDetail.modal.decisionFields.type'), value: selectedAppointment.type },
                { label: t('vienChucDetail.modal.decisionFields.title'), value: selectedAppointment.title },
                { label: t('vienChucDetail.modal.decisionFields.decisionNo'), value: selectedAppointment.decisionNo },
                { label: t('vienChucDetail.modal.decisionFields.decisionDate'), value: selectedAppointment.decisionDate ? new Date(selectedAppointment.decisionDate).toLocaleDateString('vi-VN') : '' },
                { label: t('vienChucDetail.modal.decisionFields.signer'), value: selectedAppointment.signer },
                { label: t('vienChucDetail.modal.decisionFields.effectiveDate'), value: selectedAppointment.effectiveDate ? new Date(selectedAppointment.effectiveDate).toLocaleDateString('vi-VN') : '' },
                { label: t('table.trangThai'), value: selectedAppointment.status },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-36">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value || '—'}</span>
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
                    {selectedAppointment.type} · Số QD: <strong className="font-mono">{selectedAppointment.decisionNo}</strong> · Ngày: {selectedAppointment.decisionDate ? new Date(selectedAppointment.decisionDate).toLocaleDateString('vi-VN') : ''}
                  </p>
                </div>
                <Badge variant={selectedAppointment.statusVariant || 'neutral'} dot className="ml-auto shrink-0">{selectedAppointment.status}</Badge>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.type')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]"
                  value={appointmentForm.type} onChange={(e) => setAppointmentForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Bo nhiem moi">{t('appointment.appointmentType.boNhiemMoi')}</option>
                  <option value="Bo nhiem lai">{t('appointment.appointmentType.boNhiemLai')}</option>
                  <option value="Dieu chuyen">{t('appointment.appointmentType.dieuChuyen')}</option>
                  <option value="Mien nhiem">{t('appointment.appointmentType.mienNhiem')}</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.title')}</label>
                <Input value={selectedAppointment ? selectedAppointment.title : appointmentForm.title}
                  onChange={(e) => setAppointmentForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={t('vienChucDetail.modal.decisionFields.titlePlaceholder')} />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.decisionNo')}</label>
                <Input value={selectedAppointment ? selectedAppointment.decisionNo : appointmentForm.decisionNo}
                  onChange={(e) => setAppointmentForm(f => ({ ...f, decisionNo: e.target.value }))}
                  placeholder="QD-2026-001" />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.signer')}</label>
                <Input value={appointmentForm.signer}
                  onChange={(e) => setAppointmentForm(f => ({ ...f, signer: e.target.value }))} />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.decisionDate')}</label>
                <Input type="date" value={selectedAppointment ? selectedAppointment.decisionDate : appointmentForm.decisionDate}
                  onChange={(e) => setAppointmentForm(f => ({ ...f, decisionDate: e.target.value }))} />
              </div>
              <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.decisionFields.effectiveDate')}</label>
                <Input type="date" value={selectedAppointment ? selectedAppointment.effectiveDate : appointmentForm.effectiveDate}
                  onChange={(e) => setAppointmentForm(f => ({ ...f, effectiveDate: e.target.value }))} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Credential */}
      <Modal open={credentialOpen} onClose={() => setCredentialOpen(false)} title={t('vienChucDetail.modal.credentialTitle')} size="lg"
        footer={<div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCredentialOpen(false)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={() => setCredentialOpen(false)}>{t('save')}</Button>
        </div>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.credentialName')}</label>
            <Input value={credentialForm.name}
              onChange={(e) => setCredentialForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('vienChucDetail.modal.credentialNamePlaceholder')} />
          </div>
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.issuer')}</label>
            <Input value={credentialForm.org}
              onChange={(e) => setCredentialForm(f => ({ ...f, org: e.target.value }))}
              placeholder={t('vienChucDetail.modal.issuerPlaceholder')} />
          </div>
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.issueYear')}</label>
            <Input type="number" value={credentialForm.year}
              onChange={(e) => setCredentialForm(f => ({ ...f, year: e.target.value }))} />
          </div>
          <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.credentialType')}</label>
            <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]"
              value={credentialForm.cert} onChange={(e) => setCredentialForm(f => ({ ...f, cert: e.target.value }))}>
              <option value="Chung chi">{t('vienChucDetail.modal.credentialTypeCertificate')}</option>
              <option value="Bang tot nghiep">{t('vienChucDetail.modal.credentialTypeDegree')}</option>
              <option value="Chung nhan">{t('vienChucDetail.modal.credentialTypeCertification')}</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal: Leave Request */}
      <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} title={t('vienChucDetail.modal.leaveTitle')} size="lg"
        footer={<div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setLeaveOpen(false)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={() => setLeaveOpen(false)}>{t('save')}</Button>
        </div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
              {(staff.name || 'NA').split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{staff.name}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">{staff.code} · {t('vienChucDetail.modal.remainingDays')}: <strong>12 {t('vienChucDetail.leaveDaysUnit')}</strong></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.leaveType')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]"
                value={leaveForm.type} onChange={(e) => setLeaveForm(f => ({ ...f, type: e.target.value }))}>
                <option value="Nghi phep nam">{t('leaveRequestForm.leaveTypeAnnual')}</option>
                <option value="Nghi om">{t('leaveRequestForm.leaveTypeSick')}</option>
                <option value="Nghi khong luong">{t('leaveRequestForm.leaveTypeUnpaid')}</option>
                <option value="Nghi thai san">{t('leaveRequestForm.leaveTypeMaternity')}</option>
                <option value="Nghi tham nom">{t('leaveRequestForm.leaveTypePaternity')}</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.leaveDays')}</label>
              <Input type="number" min="1" value={leaveForm.days} onChange={(e) => setLeaveForm(f => ({ ...f, days: e.target.value }))} />
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.startDate')}</label>
              <Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.endDate')}</label>
              <Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.leaveReason')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)] resize-none" rows={3}
                placeholder={t('vienChucDetail.modal.leaveReasonPlaceholder')}
                value={leaveForm.reason} onChange={(e) => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Discipline */}
      <Modal open={disciplineOpen} onClose={() => setDisciplineOpen(false)} title={t('vienChucDetail.modal.disciplineTitle')} size="lg"
        footer={<div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDisciplineOpen(false)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={() => setDisciplineOpen(false)}>{t('save')}</Button>
        </div>}>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.disciplineType')}</label>
            <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
              <option value="Khen thuong">{t('vienChucDetail.modal.disciplineTypeReward')}</option>
              <option value="Ky luat">{t('vienChucDetail.modal.disciplineTypeDiscipline')}</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.disciplineYear')}</label>
            <Input type="number" value={new Date().getFullYear().toString()} />
          </div>
          <div className="col-span-2"><label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('vienChucDetail.modal.disciplineContent')}</label>
            <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)] resize-none" rows={3}
              placeholder={t('vienChucDetail.modal.disciplineContentPlaceholder')} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
