import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, CheckCircle2, Building2, FileText, ClipboardList, Users, BadgeCheck } from 'lucide-react';
import { Button, Card, CardContent, Switch } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SECTIONS = [
  { id: 'general', labelKey: 'config.section.general', icon: <BadgeCheck className="h-4 w-4" /> },
  { id: 'dept', labelKey: 'config.section.dept', icon: <Building2 className="h-4 w-4" /> },
  { id: 'contract', labelKey: 'config.section.contract', icon: <FileText className="h-4 w-4" /> },
  { id: 'leave', labelKey: 'config.section.leave', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'salary', labelKey: 'config.section.salary', icon: <Users className="h-4 w-4" /> },
];

const LEAVE_TYPES = [
  { id: 'annual', labelKey: 'config.leave.annual', defaultDays: 12, color: 'primary' },
  { id: 'sick', labelKey: 'config.leave.sick', defaultDays: 30, color: 'warning' },
  { id: 'unpaid', labelKey: 'config.leave.unpaid', defaultDays: 90, color: 'neutral' },
  { id: 'maternity', labelKey: 'config.leave.maternity', defaultDays: 180, color: 'accent' },
  { id: 'paternity', labelKey: 'config.leave.paternity', defaultDays: 14, color: 'info' },
];

const CONTRACT_SETTINGS = [
  { id: 'auto_expire', labelKey: 'config.contract.autoExpire', descKey: 'config.contract.autoExpireDesc', enabled: true },
  { id: 'require_sign', labelKey: 'config.contract.requireSign', descKey: 'config.contract.requireSignDesc', enabled: true },
  { id: 'probation_req', labelKey: 'config.contract.probationReq', descKey: 'config.contract.probationReqDesc', enabled: true },
  { id: 'contract_template', labelKey: 'config.contract.contractTemplate', descKey: 'config.contract.contractTemplateDesc', enabled: true },
];

const GENERAL_SETTINGS = [
  { id: 'auto_code', labelKey: 'config.general.autoCode', descKey: 'config.general.autoCodeDesc', enabled: true },
  { id: 'require_profile', labelKey: 'config.general.requireProfile', descKey: 'config.general.requireProfileDesc', enabled: true },
  { id: 'dept_head', labelKey: 'config.general.deptHeadApproval', descKey: 'config.general.deptHeadApprovalDesc', enabled: false },
  { id: 'hr_approval', labelKey: 'config.general.hrApproval', descKey: 'config.general.hrApprovalDesc', enabled: true },
  { id: 'audit_trail', labelKey: 'config.general.auditTrail', descKey: 'config.general.auditTrailDesc', enabled: true },
];

const SALARY_SETTINGS = [
  { id: 'auto_calc', labelKey: 'config.salary.autoCalc', descKey: 'config.salary.autoCalcDesc', enabled: true },
  { id: 'bank_transfer', labelKey: 'config.salary.bankTransfer', descKey: 'config.salary.bankTransferDesc', enabled: true },
  { id: 'payslip_email', labelKey: 'config.salary.payslipEmail', descKey: 'config.salary.payslipEmailDesc', enabled: false },
  { id: 'insurance_sync', labelKey: 'config.salary.insuranceSync', descKey: 'config.salary.insuranceSyncDesc', enabled: false },
];

export default function HRMConfig() {
  const { t } = useTranslation('hrm');
  const [activeSection, setActiveSection] = useState(0);
  const [saved, setSaved] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState(LEAVE_TYPES);
  const [contractSettings, setContractSettings] = useState(CONTRACT_SETTINGS);
  const [generalSettings, setGeneralSettings] = useState(GENERAL_SETTINGS);
  const [salarySettings, setSalarySettings] = useState(SALARY_SETTINGS);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggle = (setter: React.Dispatch<React.SetStateAction<typeof GENERAL_SETTINGS>>, id: string) => {
    setter(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const adjustLeave = (id: string, delta: number) => {
    setLeaveTypes(prev => prev.map(l => {
      if (l.id !== id) return l;
      const newVal = l.defaultDays + delta;
      return { ...l, defaultDays: Math.min(Math.max(newVal, 0), 365) };
    }));
  };

  const activeSectionId = SECTIONS[activeSection]?.id;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('config.title')}
        description={t('config.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('config.breadcrumb') }]}
        actions={
          <Button leftIcon={saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />} onClick={handleSave}>
            {saved ? t('config.saved') : t('config.saveChanges')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            {SECTIONS.map((sec, i) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(i)}
                className={`w-full flex items-start gap-3 rounded-lg p-3 text-left transition-all ${
                  activeSection === i
                    ? 'bg-[rgb(var(--primary)/0.08] border border-[rgb(var(--primary))]'
                    : 'hover:bg-[rgb(var(--bg-hover))] border border-transparent'
                }`}
              >
                <div className={`shrink-0 mt-0.5 ${
                  activeSection === i ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-muted))]'
                }`}>
                  {sec.icon}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    activeSection === i ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'
                  }`}>{t(sec.labelKey)}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {activeSectionId === 'general' && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('config.section.general')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('config.section.generalDesc')}</p>
              </div>
              <CardContent className="py-5 space-y-3">
                {generalSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t(setting.labelKey)}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t(setting.descKey)}</p>
                    </div>
                    <Switch checked={setting.enabled} onChange={() => toggle(setGeneralSettings, setting.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSectionId === 'dept' && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('config.section.dept')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('config.section.deptDesc')}</p>
              </div>
              <CardContent className="py-5">
                <div className="space-y-3">
                  {[
                    { name: 'Khoa CNTT', code: 'KCNTT', staff: 42, head: 'PGS.TS. Nguyen Hoang Long' },
                    { name: 'Khoa Kinh te', code: 'KTE', staff: 38, head: 'TS. Tran Thi Mai Lan' },
                    { name: 'Khoa Luat', code: 'KLUAT', staff: 29, head: 'TS. Le Van Minh' },
                    { name: 'Khoa Ngoai ngu', code: 'KNNGOAI', staff: 35, head: 'ThS. Bui Dinh Nam' },
                    { name: 'Phong TC-NS', code: 'PTCCS', staff: 12, head: 'ThS. Pham Thu Ha' },
                    { name: 'Phong Tai chinh', code: 'PTCKT', staff: 8, head: 'TS. Hoang Thi Lan' },
                  ].map((dept, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] p-3 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[rgb(var(--text-primary))]">{dept.name} <span className="font-mono text-xs text-[rgb(var(--text-muted))]">({dept.code})</span></p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{t('config.dept.head')}: {dept.head} · {dept.staff} {t('config.dept.staff')}</p>
                      </div>
                      <Button variant="ghost" size="sm">{t('config.dept.edit')}</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-3 w-full">{t('config.dept.addDept')}</Button>
              </CardContent>
            </Card>
          )}

          {activeSectionId === 'contract' && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('config.section.contract')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('config.section.contractDesc')}</p>
              </div>
              <CardContent className="py-5 space-y-3">
                {contractSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t(setting.labelKey)}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t(setting.descKey)}</p>
                    </div>
                    <Switch checked={setting.enabled} onChange={() => toggle(setContractSettings, setting.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSectionId === 'leave' && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('config.section.leave')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('config.section.leaveDesc')}</p>
              </div>
              <CardContent className="py-5">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {leaveTypes.map((leave) => (
                    <div key={leave.id} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4">
                      <p className="text-xs text-[rgb(var(--text-muted))] mb-2">{t(leave.labelKey)}</p>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{leave.defaultDays}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{t('config.leave.unit')}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => adjustLeave(leave.id, -1)}
                            className="h-7 w-7 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors flex items-center justify-center text-sm font-bold">−</button>
                          <button onClick={() => adjustLeave(leave.id, 1)}
                            className="h-7 w-7 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors flex items-center justify-center text-sm font-bold">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSectionId === 'salary' && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('config.section.salary')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('config.section.salaryDesc')}</p>
              </div>
              <CardContent className="py-5 space-y-3">
                {salarySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t(setting.labelKey)}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t(setting.descKey)}</p>
                    </div>
                    <Switch checked={setting.enabled} onChange={() => toggle(setSalarySettings, setting.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}