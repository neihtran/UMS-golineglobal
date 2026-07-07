import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, TrendingUp, Users, FileText, Calculator, CreditCard,
  FileDown, Eye, Save,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TableEmpty, Modal, DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useDetailModal } from '@/hooks/useDetailModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const PAYROLLS = [
  { id: 'pr01', name: 'Nguyễn Hoàng Long', code: 'VC-2020-001', dept: 'Khoa CNTT', position: 'Trưởng khoa', salary: 18500000, allowance: 4500000, deduction: 2100000, net: 20900000, month: '06/2026', status: 'paid' },
  { id: 'pr02', name: 'Trần Thị Mai Lan', code: 'VC-2018-042', dept: 'Khoa Kinh tế', position: 'Phó trưởng khoa', salary: 15200000, allowance: 3200000, deduction: 1800000, net: 16620000, month: '06/2026', status: 'paid' },
  { id: 'pr03', name: 'Lê Văn Minh', code: 'VC-2022-108', dept: 'Khoa Luật', position: 'Giảng viên', salary: 9800000, allowance: 1800000, deduction: 1100000, net: 10500000, month: '06/2026', status: 'pending' },
  { id: 'pr04', name: 'Phạm Thu Hà', code: 'VC-2019-067', dept: 'Phòng Tổ chức', position: 'Chuyên viên', salary: 11200000, allowance: 2400000, deduction: 1340000, net: 12260000, month: '06/2026', status: 'paid' },
  { id: 'pr05', name: 'Hoàng Thị Lan', code: 'VC-2016-022', dept: 'Ban Giám hiệu', position: 'Phó Hiệu trưởng', salary: 22000000, allowance: 8000000, deduction: 3500000, net: 26500000, month: '06/2026', status: 'paid' },
  { id: 'pr06', name: 'Lý Văn Hùng', code: 'VC-2015-011', dept: 'Ban Giám hiệu', position: 'Hiệu trưởng', salary: 28000000, allowance: 10000000, deduction: 4500000, net: 33500000, month: '06/2026', status: 'paid' },
];

const CHART_DATA = [
  { month: 'T1', total: 3.2, bonus: 0.4 },
  { month: 'T2', total: 3.1, bonus: 0.3 },
  { month: 'T3', total: 3.3, bonus: 0.5 },
  { month: 'T4', total: 3.4, bonus: 0.4 },
  { month: 'T5', total: 3.5, bonus: 0.6 },
  { month: 'T6', total: 3.6, bonus: 0.5 },
];

const PIPELINE_STAGES = [
  { id: 'new', labelKey: 'salary.recruitment.new', count: 24, color: 'rgb(var(--primary))', bgColor: 'rgb(var(--primary)/0.1)' },
  { id: 'screening', labelKey: 'salary.recruitment.screening', count: 18, color: 'rgb(var(--accent))', bgColor: 'rgb(var(--accent)/0.1)' },
  { id: 'interview', labelKey: 'salary.recruitment.interview', count: 12, color: 'rgb(var(--info))', bgColor: 'rgb(var(--info)/0.1)' },
  { id: 'offer', labelKey: 'salary.recruitment.offer', count: 5, color: 'rgb(var(--warning))', bgColor: 'rgb(var(--warning)/0.1)' },
];

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

export default function SalarySheet() {
  const { t } = useTranslation('hrm');
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [, setTemplateOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ salary: 0, allowance: 0, reason: '' });

  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [disburseModalOpen, setDisburseModalOpen] = useState(false);
  const [calcForm, setCalcForm] = useState({ month: '06/2026', dept: '', note: '' });
  const [disburseForm, setDisburseForm] = useState({ method: 'Chuyển khoản', bank: 'Vietcombank', accountNo: '', accountName: '', date: '', note: '' });

  const { selectedId, openDetail, openEdit, close, isEditMode } = useDetailModal({ size: 'fullscreen' });
  const selectedPayroll = selectedId ? PAYROLLS.find((p) => p.id === selectedId) ?? null : null;

  const filtered = PAYROLLS.filter((p) => {
    const match = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === '' || p.dept === dept;
    return match && matchDept;
  });

  const openAdjust = (p: typeof PAYROLLS[0]) => {
    setAdjustForm({ salary: p.salary, allowance: p.allowance, reason: '' });
    openEdit(p.id);
  };

  const pipelineTotal = PIPELINE_STAGES.reduce((s, st) => s + st.count, 0);

  const summary = [
    { labelKey: 'salary.summary.totalFund', value: '3.6 tỷ', subKey: 'salary.summary.month', icon: <DollarSign className="h-5 w-5" />, color: 'primary' },
    { labelKey: 'salary.summary.staffCount', value: '456', subKey: 'salary.summary.staffUnit', icon: <Users className="h-5 w-5" />, color: 'info' },
    { labelKey: 'salary.summary.increaseVsPrev', value: '+2.8%', subKey: 'salary.summary.increaseNote', icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
    { labelKey: 'salary.summary.disbursed', value: '454', subKey: 'salary.summary.pendingConfirm', icon: <FileText className="h-5 w-5" />, color: 'accent' },
  ];

  const recruitmentStats = [
    { labelKey: 'salary.recruitment.totalCandidates', value: '59' },
    { labelKey: 'salary.recruitment.interviewRate', value: '20.3%' },
    { labelKey: 'salary.recruitment.avgTime', value: '12 ngày' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('salary.title')}
        description={t('salary.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('salary.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<FileDown className="h-4 w-4" />} onClick={() => setTemplateOpen(true)}>{t('salary.downloadTemplate')}</Button>
            <Button variant="outline" leftIcon={<Calculator className="h-4 w-4" />} onClick={() => setCalcModalOpen(true)}>{t('salary.calculate')}</Button>
            <Button variant="outline" leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => setDisburseModalOpen(true)}>{t('salary.disburse')}</Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 flex items-center gap-4 hover-lift">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.labelKey)}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.subKey)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('salary.chart.title')}</h3>
            <Badge variant="info">{t('salary.chart.unit')}</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
              <Bar dataKey="total" name={t('salary.chart.total')} fill="rgb(var(--primary))" radius={[4, 4, 0, 0]}  animationDuration={1500} animationEasing="ease-out" />
              <Bar dataKey="bonus" name={t('salary.chart.bonus')} fill="rgb(var(--accent))" radius={[4, 4, 0, 0]}  animationDuration={1500} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('salary.recruitment.title')}</h3>
            <Badge variant="neutral">{pipelineTotal} {t('salary.recruitment.profiles')}</Badge>
          </div>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-xs text-[rgb(var(--text-secondary))]">{t(stage.labelKey)}</span>
                  </div>
                  <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{stage.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(stage.count / pipelineTotal) * 100}%`, background: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[rgb(var(--border)/0.5)] space-y-2">
            {recruitmentStats.map((stat) => (
              <div key={stat.labelKey} className="flex justify-between text-xs">
                <span className="text-[rgb(var(--text-muted))]">{t(stat.labelKey)}</span>
                <span className="font-semibold text-[rgb(var(--text-primary))]">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('filter.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} wrapperClassName="w-72" />
        <select value={dept} onChange={(e) => setDept(e.target.value)}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="">{t('salary.deptFilter.all')}</option>
          <option value="Khoa CNTT">{t('salary.deptFilter.khoaCNTT')}</option>
          <option value="Khoa Kinh tế">{t('salary.deptFilter.khoaKinhTe')}</option>
          <option value="Khoa Luật">{t('salary.deptFilter.khoaLuat')}</option>
          <option value="Phòng Tổ chức">{t('salary.deptFilter.phongToChuc')}</option>
          <option value="Ban Giám hiệu">{t('salary.deptFilter.banGiamHieu')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('salary.table.staff')}</TableHeadCell>
            <TableHeadCell>{t('salary.table.maVC')}</TableHeadCell>
            <TableHeadCell>{t('table.donVi')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('salary.table.luongCoBan')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('salary.table.allowance')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('salary.table.deduction')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('salary.table.netPay')}</TableHeadCell>
            <TableHeadCell>{t('salary.table.month')}</TableHeadCell>
            <TableHeadCell>{t('salary.table.status')}</TableHeadCell>
            <TableHeadCell>{t('salary.table.action')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty colSpan={10} message={t('empty.noSalarySheets')} />
          ) : (
            filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <button
                    onClick={() => openDetail(p.id)}
                    className="font-medium text-[rgb(var(--text-primary))] hover:text-[rgb(var(--primary))] transition-colors text-left w-full"
                  >
                    {p.name}
                  </button>
                </TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{p.code}</TableCell>
                <TableCell>
                  <p className="text-[rgb(var(--text-secondary))]">{p.dept}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{p.position}</p>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{fmt(p.salary)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-[rgb(var(--success))]">+{fmt(p.allowance)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-[rgb(var(--error))]">-{fmt(p.deduction)}</TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-[rgb(var(--primary))]">{fmt(p.net)}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.month}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 'paid' ? 'success' : 'warning'} dot size="sm">
                    {p.status === 'paid' ? t('salary.table.paid') : t('salary.table.pending')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => openDetail(p.id)}>{t('action.detail')}</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Detail / Edit Modal */}
      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedPayroll ? selectedPayroll.name : ''}
        description={selectedPayroll ? `${selectedPayroll.code} · ${selectedPayroll.dept} · ${selectedPayroll.position}` : ''}
        size="fullscreen"
        onEdit={selectedPayroll && !isEditMode ? () => openAdjust(selectedPayroll) : undefined}
        onPrint={selectedPayroll && !isEditMode ? () => window.print() : undefined}
      >
        {selectedPayroll && (
          isEditMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-lg font-bold">
                  {selectedPayroll.name.split(' ').slice(-2).map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedPayroll.name}</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedPayroll.code} · {selectedPayroll.dept} · {selectedPayroll.position}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.salaryNewLabel')}</label>
                  <Input type="number" value={adjustForm.salary} onChange={(e) => setAdjustForm(f => ({ ...f, salary: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.salaryOldLabel')}</label>
                  <Input type="number" value={adjustForm.allowance} onChange={(e) => setAdjustForm(f => ({ ...f, allowance: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.note')}</label>
                <textarea
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none"
                  rows={3}
                  placeholder={t('contract.form.notePlaceholder')}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm(f => ({ ...f, reason: e.target.value }))}
                />
              </div>
              <div className="p-4 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--text-secondary))]">{t('salary.modal.salaryOld')}</span>
                  <span className="font-mono font-semibold text-[rgb(var(--text-primary))]">{fmt(selectedPayroll.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--text-secondary))]">{t('salary.modal.salaryNew')}</span>
                  <span className="font-mono font-semibold text-[rgb(var(--success))]">{fmt(adjustForm.salary)}</span>
                </div>
                <div className="flex justify-between border-t border-[rgb(var(--border)/0.5)] pt-2">
                  <span className="text-[rgb(var(--text-secondary))]">{t('salary.modal.difference')}</span>
                  <span className={`font-mono font-bold ${adjustForm.salary > selectedPayroll.salary ? 'text-[rgb(var(--success))]' : adjustForm.salary < selectedPayroll.salary ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-muted))]'}`}>
                    {adjustForm.salary >= selectedPayroll.salary ? '+' : ''}{fmt(adjustForm.salary - selectedPayroll.salary)}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={close}>{t('cancel')}</Button>
                <Button leftIcon={<Save className="h-4 w-4" />} onClick={close}>{t('contract.modal.saveChanges')}</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-white text-lg font-bold">
                  {selectedPayroll.name.split(' ').slice(-2).map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedPayroll.name}</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedPayroll.code} · {selectedPayroll.dept} · {selectedPayroll.position}</p>
                </div>
                <Badge variant={selectedPayroll.status === 'paid' ? 'success' : 'warning'} dot className="ml-auto">
                  {selectedPayroll.status === 'paid' ? t('salary.table.paid') : t('salary.table.pending')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: t('salary.table.luongCoBan'), value: fmt(selectedPayroll.salary) },
                  { label: t('salary.table.allowance'), value: `+${fmt(selectedPayroll.allowance)}` },
                  { label: t('salary.table.deduction'), value: `-${fmt(selectedPayroll.deduction)}` },
                  { label: t('salary.table.netPay'), value: fmt(selectedPayroll.net), highlight: true },
                  { label: t('salary.table.month'), value: selectedPayroll.month },
                  { label: t('salary.table.status'), value: selectedPayroll.status === 'paid' ? t('salary.table.paid') : t('salary.table.pending') },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2 ${highlight ? 'bg-[rgb(var(--primary)/0.04)] -mx-2 px-2 rounded' : ''}`}>
                    <span className="shrink-0 text-[rgb(var(--text-muted))] w-32">{label}:</span>
                    <span className={`font-mono font-medium ${highlight ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </DetailModal>

      {/* Modal: Tính lương */}
      <Modal
        open={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
        title={t('salary.modal.calculateTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCalcModalOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" leftIcon={<Calculator className="h-4 w-4" />} onClick={() => setCalcModalOpen(false)}>{t('salary.modal.calculateBtn')}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.salaryMonth')}</label>
              <Input type="month" value={calcForm.month} onChange={(e) => setCalcForm(f => ({ ...f, month: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.applyDept')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={calcForm.dept} onChange={(e) => setCalcForm(f => ({ ...f, dept: e.target.value }))}>
                <option value="">{t('salary.deptFilter.all')}</option>
                <option value="Khoa CNTT">{t('salary.deptFilter.khoaCNTT')}</option>
                <option value="Khoa Kinh tế">{t('salary.deptFilter.khoaKinhTe')}</option>
                <option value="Khoa Luật">{t('salary.deptFilter.khoaLuat')}</option>
                <option value="Phòng Tổ chức">{t('salary.deptFilter.phongToChuc')}</option>
                <option value="Ban Giám hiệu">{t('salary.deptFilter.banGiamHieu')}</option>
                <option value="Khoa Ngoại ngữ">{t('salary.deptFilter.khoaNgoaiNgu')}</option>
                <option value="Khoa Sư phạm">{t('salary.deptFilter.khoaSuPham')}</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4">
            <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">{t('salary.modal.summaryTable')}</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: t('salary.modal.staffCount'), value: '456' },
                { label: t('salary.modal.totalSalary'), value: fmt(PAYROLLS.reduce((s, p) => s + p.salary, 0)) },
                { label: t('salary.modal.totalAllowance'), value: fmt(PAYROLLS.reduce((s, p) => s + p.allowance, 0)) },
                { label: t('salary.modal.totalDeduction'), value: fmt(PAYROLLS.reduce((s, p) => s + p.deduction, 0)) },
                { label: t('salary.modal.totalNet'), value: fmt(PAYROLLS.reduce((s, p) => s + p.net, 0)), highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`flex justify-between py-1.5 border-b border-[rgb(var(--border)/0.4)] last:border-0 ${highlight ? 'font-bold text-[rgb(var(--primary))]' : ''}`}>
                  <span className="text-[rgb(var(--text-secondary))]">{label}</span>
                  <span className="font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.note')}</label>
            <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('contract.form.notePlaceholder')} value={calcForm.note} onChange={(e) => setCalcForm(f => ({ ...f, note: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* Modal: Chi trả lương */}
      <Modal
        open={disburseModalOpen}
        onClose={() => setDisburseModalOpen(false)}
        title={t('salary.modal.disburseTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDisburseModalOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => setDisburseModalOpen(false)}>{t('salary.modal.disbursement.confirmBtn')}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--warning)/0.06)] border border-[rgb(var(--warning)/0.2)]">
            <DollarSign className="h-8 w-8 text-[rgb(var(--warning))] shrink-0" />
            <div>
              <p className="font-semibold text-[rgb(var(--text-primary))]">{t('salary.modal.disbursement.confirmTitle', { month: calcForm.month })}</p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{t('salary.modal.disbursement.confirmDesc', { total: fmt(PAYROLLS.reduce((s, p) => s + p.net, 0)), count: '456' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.disbursement.method')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={disburseForm.method} onChange={(e) => setDisburseForm(f => ({ ...f, method: e.target.value }))}>
                <option>{t('salary.modal.disbursement.transfer')}</option><option>{t('salary.modal.disbursement.cash')}</option><option>{t('salary.modal.disbursement.ewallet')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.disbursement.bank')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={disburseForm.bank} onChange={(e) => setDisburseForm(f => ({ ...f, bank: e.target.value }))}>
                <option value="Vietcombank">{t('salary.bank.vietcombank')}</option>
                <option value="VietinBank">{t('salary.bank.vietinbank')}</option>
                <option value="BIDV">{t('salary.bank.bidv')}</option>
                <option value="Agribank">{t('salary.bank.agribank')}</option>
                <option value="Techcombank">{t('salary.bank.techcombank')}</option>
                <option value="ACB">{t('salary.bank.acb')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.disbursement.accountNo')}</label>
              <Input value={disburseForm.accountNo} onChange={(e) => setDisburseForm(f => ({ ...f, accountNo: e.target.value }))} placeholder={t('salary.modal.disbursement.accountNo')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.disbursement.accountName')}</label>
              <Input value={disburseForm.accountName} onChange={(e) => setDisburseForm(f => ({ ...f, accountName: e.target.value }))} placeholder={t('salary.modal.disbursement.accountName')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.disbursement.disbursementDate')}</label>
              <Input type="date" value={disburseForm.date} onChange={(e) => setDisburseForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.note')}</label>
            <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('contract.form.notePlaceholder')} value={disburseForm.note} onChange={(e) => setDisburseForm(f => ({ ...f, note: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
