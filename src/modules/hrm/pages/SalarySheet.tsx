import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, TrendingUp, Users, FileText, Calculator, CreditCard,
  FileDown, Edit3, Save,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, Modal, TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePagination, useDebounce } from '@/hooks';
import { useSalarySheets, useSalaryStats } from '@/hooks/useHrm';
import type { SalarySheetItem } from '@/services/hrm.service';

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

const SALARY_STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; labelKey: string }> = {
  paid: { variant: 'success', labelKey: 'salary.status.paid' },
  approved: { variant: 'success', labelKey: 'salary.status.approved' },
  submitted: { variant: 'warning', labelKey: 'salary.status.submitted' },
  draft: { variant: 'neutral', labelKey: 'salary.status.draft' },
};

export default function SalarySheet() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState<SalarySheetItem | null>(null);
  const [salaryAdjustOpen, setSalaryAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ salary: 0, allowance: 0, reason: '' });

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useSalarySheets({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    month: '2026-06',
  });

  const { data: statsData } = useSalaryStats();

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const chartData = useMemo(() => {
    const monthly = (statsData as any)?.monthly;
    if (Array.isArray(monthly)) {
      return monthly.map((row: any) => ({
        month: row.month || row._id || '',
        total: row.total ?? row.totalFund ?? 0,
        bonus: row.bonus ?? 0,
      }));
    }
    return [];
  }, [statsData]);

  const summaryStats = useMemo(() => {
    const raw = (statsData as any) ?? {};
    const totalFund = typeof raw.totalFund === 'number' ? raw.totalFund : items.reduce((s, p) => s + p.netSalary, 0);
    const staffCount = typeof raw.totalStaff === 'number' ? raw.totalStaff : total;
    const paidCount = typeof raw.paid === 'number' ? raw.paid : items.filter(p => p.status === 'paid').length;

    return [
      { labelKey: 'salary.summary.totalFund', value: fmt(totalFund).replace(' ₫', '').trim() + ' ₫', subKey: 'salary.summary.month', icon: <DollarSign className="h-5 w-5" />, color: 'primary' },
      { labelKey: 'salary.summary.staffCount', value: String(staffCount), subKey: 'salary.summary.staffUnit', icon: <Users className="h-5 w-5" />, color: 'info' },
      { labelKey: 'salary.summary.increaseVsPrev', value: raw.increaseVsPrev || '—', subKey: 'salary.summary.increaseNote', icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
      { labelKey: 'salary.summary.disbursed', value: String(paidCount), subKey: 'salary.summary.pendingConfirm', icon: <FileText className="h-5 w-5" />, color: 'accent' },
    ];
  }, [items, total, statsData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('salary.title')}
        description={t('salary.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('salary.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<FileDown className="h-4 w-4" />}>{t('salary.downloadTemplate')}</Button>
            <Button variant="outline" leftIcon={<Calculator className="h-4 w-4" />}>{t('salary.calculate')}</Button>
            <Button variant="outline" leftIcon={<CreditCard className="h-4 w-4" />}>{t('salary.disburse')}</Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 flex items-center gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
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

      {/* Chart */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('salary.chart.title')}</h3>
          <Badge variant="info">{t('salary.chart.unit')}</Badge>
        </div>
        {chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-[rgb(var(--text-muted))]">
            {t('salary.chart.empty', 'Chưa có dữ liệu biểu đồ')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="total" name={t('salary.chart.total')} fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bonus" name={t('salary.chart.bonus')} fill="rgb(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table */}
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('filter.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
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
          {isLoading ? (
            <TableSkeleton colSpan={10} rows={6} />
          ) : items.length === 0 ? (
            <TableEmpty colSpan={10} message={t('empty.noSalarySheets')} />
          ) : (
            items.map((p) => (
              <TableRow key={p._id}>
                <TableCell className="font-medium text-[rgb(var(--text-primary))]">{p.employeeName || '—'}</TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{p.employeeCode || '—'}</TableCell>
                <TableCell>
                  <p className="text-[rgb(var(--text-secondary))]">{p.department || '—'}</p>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{fmt(p.baseSalary)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-[rgb(var(--success))]">+{fmt(p.allowances)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-[rgb(var(--error))]">-{fmt(p.deductions)}</TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-[rgb(var(--primary))]">{fmt(p.netSalary)}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{p.month}</TableCell>
                <TableCell>
                  <Badge variant={SALARY_STATUS_CONFIG[p.status]?.variant || 'neutral'} dot size="sm">
                    {t(SALARY_STATUS_CONFIG[p.status]?.labelKey || p.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                    onClick={() => { setSelectedPayroll(p); setAdjustForm({ salary: p.baseSalary, allowance: p.allowances, reason: '' }); setSalaryAdjustOpen(true); }}>
                    {t('salary.table.adjust')}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={total}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} pageSizeOptions={[10, 25, 50]} />

      {/* Modal: Điều chỉnh lương */}
      <Modal
        open={salaryAdjustOpen}
        onClose={() => setSalaryAdjustOpen(false)}
        title={t('salary.modal.adjustTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSalaryAdjustOpen(false)}>{t('cancel')}</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={() => setSalaryAdjustOpen(false)}>{t('salary.modal.saveChanges')}</Button>
          </div>
        }
      >
        {selectedPayroll && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-lg font-bold">
                {(selectedPayroll.employeeName || 'NA').split(' ').slice(-2).map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedPayroll.employeeName || '—'}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedPayroll.employeeCode || ''} · {selectedPayroll.department || ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.salaryNewLabel')}</label>
                <Input type="number" value={adjustForm.salary} onChange={(e) => setAdjustForm(f => ({ ...f, salary: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.allowanceLabel')}</label>
                <Input type="number" value={adjustForm.allowance} onChange={(e) => setAdjustForm(f => ({ ...f, allowance: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('salary.modal.note')}</label>
              <textarea
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)] resize-none"
                rows={3}
                placeholder={t('contract.form.notePlaceholder')}
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm(f => ({ ...f, reason: e.target.value }))}
              />
            </div>
            <div className="p-4 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--text-secondary))]">{t('salary.modal.salaryOld')}</span>
                <span className="font-mono font-semibold text-[rgb(var(--text-primary))]">{fmt(selectedPayroll.baseSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--text-secondary))]">{t('salary.modal.salaryNew')}</span>
                <span className="font-mono font-semibold text-[rgb(var(--success))]">{fmt(adjustForm.salary)}</span>
              </div>
              <div className="flex justify-between border-t border-[rgb(var(--border)/0.5)] pt-2">
                <span className="text-[rgb(var(--text-secondary))]">{t('salary.modal.difference')}</span>
                <span className={`font-mono font-bold ${adjustForm.salary > selectedPayroll.baseSalary ? 'text-[rgb(var(--success))]' : adjustForm.salary < selectedPayroll.baseSalary ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-muted))]'}`}>
                  {adjustForm.salary >= selectedPayroll.baseSalary ? '+' : ''}{fmt(adjustForm.salary - selectedPayroll.baseSalary)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
