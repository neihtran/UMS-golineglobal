import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Upload } from 'lucide-react';
import {
  Card, CardContent, Button, Badge, Table, TableHead,
  TableBody, TableRow, TableHeadCell, TableCell, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDepartmentList } from '@/hooks/useHrm';
import { useVienChucStats } from '@/hooks/useHrm';

const TYPE_COLORS: Record<string, string> = {
  faculty: 'primary',
  department: 'success',
  center: 'info',
  office: 'warning',
  institute: 'accent',
};

export default function DepartmentList() {
  const { t } = useTranslation('hrm');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useDepartmentList({ search: search || undefined });
  const { data: stats } = useVienChucStats();

  const records = data?.data ?? [];
  const total = records.length;
  const facultyCount = records.filter((r) => r.type === 'faculty').length;
  const activeCount = records.filter((r) => r.isActive).length;

  const deptBars = records.slice(0, 7).map((d) => ({
    name: d.shortName || d.name.replace('Khoa ', '').replace('Bộ môn ', ''),
    fullName: d.name,
    count: 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('department.title')}
        description={t('department.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('department.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>{t('department.import')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { labelKey: 'department.stats.total', value: String(stats?.total ?? total), change: '', color: 'primary' },
          { labelKey: 'department.stats.faculties', value: String(facultyCount), color: 'success' },
          { labelKey: 'department.stats.active', value: String(activeCount), color: 'info' },
          { labelKey: 'department.stats.permanent', value: String(stats?.byContractType?.filter((c) => c.type === 'Cơ hữu').reduce((s, c) => s + c.count, 0) ?? 0), color: 'accent' },
        ].map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                <span className="text-lg font-bold">🏛</span>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.labelKey)}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('department.listTitle')} ({total})</h3>
              <input
                type="search"
                placeholder={t('department.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-1"
              />
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>{t('department.table.dept')}</TableHeadCell>
                  <TableHeadCell>{t('department.table.type')}</TableHeadCell>
                  <TableHeadCell>{t('department.table.contact')}</TableHeadCell>
                  <TableHeadCell>{t('department.table.status')}</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableEmpty colSpan={4} message="Đang tải..." />
                ) : records.length === 0 ? (
                  <TableEmpty colSpan={4} message={t('empty.noDepartments')} />
                ) : (
                  records.map((d) => (
                    <TableRow key={d._id ?? d.code}>
                      <TableCell>
                        <p className="font-medium text-[rgb(var(--text-primary))]">{d.name}</p>
                        {d.code && <p className="text-xs text-[rgb(var(--text-muted))]">{d.code}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={(TYPE_COLORS[d.type] ?? 'neutral') as any} size="sm">
                          {d.type === 'faculty' ? 'Khoa' : d.type === 'department' ? 'Phòng' : d.type === 'center' ? 'Trung tâm' : d.type === 'office' ? 'Văn phòng' : 'Viện'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">
                        {d.phone ? <span>{d.phone}</span> : null}
                        {d.email ? <span className="ml-2 text-[rgb(var(--primary))]">{d.email}</span> : null}
                        {!d.phone && !d.email && '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={d.isActive ? 'success' : 'neutral'} dot size="sm">
                          {d.isActive ? t('department.table.statusActive') : t('department.table.statusInactive')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('department.chart.title')}</h3>
          </div>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBars} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [String(v), 'Khoa/Phòng']} />
                <Bar dataKey="count" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
