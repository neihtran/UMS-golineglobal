import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, AlertTriangle, Download, Upload } from 'lucide-react';
import {
  Card, CardContent, Button, Badge, Table, TableHead,
  TableBody, TableRow, TableHeadCell, TableCell,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const STATS = [
  { labelKey: 'department.stats.total', value: '456', change: '+8 tuần này', icon: <Users className="h-5 w-5" />, color: 'primary' },
  { labelKey: 'department.stats.permanent', value: '312', sub: '68.4%', icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
  { labelKey: 'department.stats.visiting', value: '144', sub: '31.6%', icon: <Users className="h-5 w-5" />, color: 'accent' },
  { labelKey: 'department.stats.trial', value: '8', sub: 'cần theo dõi', icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
];

const DEPARTMENTS = [
  { id: 'd1', name: 'Khoa CNTT', head: 'TS. Nguyen Van A', staff: 42, vc: 38, guest: 4, status: 'active' },
  { id: 'd2', name: 'Khoa Kinh te', head: 'PGS.TS. Tran Thi B', staff: 38, vc: 35, guest: 3, status: 'active' },
  { id: 'd3', name: 'Khoa Luat', head: 'TS. Le Van C', staff: 29, vc: 27, guest: 2, status: 'active' },
  { id: 'd4', name: 'Khoa Ngoai ngu', head: 'ThS. Pham Thi D', staff: 35, vc: 30, guest: 5, status: 'active' },
  { id: 'd5', name: 'Khoa Su pham', head: 'PGS.TS. Hoang Van E', staff: 31, vc: 29, guest: 2, status: 'active' },
  { id: 'd6', name: 'Khoa Y duoc', head: 'GS.TS. Do Van F', staff: 27, vc: 24, guest: 3, status: 'warning' },
];

const DEPT_BARS = DEPARTMENTS.map((d) => ({ name: d.name.replace('Khoa ', ''), count: d.staff }));

export default function DepartmentList() {
  const { t } = useTranslation('hrm');
  const [search, setSearch] = useState('');

  const filtered = DEPARTMENTS.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.head.toLowerCase().includes(search.toLowerCase())
  );

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
        {STATS.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.labelKey)}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub ?? s.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('department.listTitle')} ({filtered.length})</h3>
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
                  <TableHeadCell>{t('department.table.head')}</TableHeadCell>
                  <TableHeadCell>{t('department.table.permanent')}</TableHeadCell>
                  <TableHeadCell>{t('department.table.visiting')}</TableHeadCell>
                  <TableHeadCell>{t('department.table.total')}</TableHeadCell>
                  <TableHeadCell>{t('department.table.status')}</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <p className="font-medium text-[rgb(var(--text-primary))]">{d.name}</p>
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{d.head}</TableCell>
                    <TableCell className="text-[rgb(var(--success))]">{d.vc}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{d.guest}</TableCell>
                    <TableCell className="font-semibold">{d.staff}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'active' ? 'success' : 'warning'} dot size="sm">
                        {d.status === 'active' ? t('department.table.statusActive') : t('department.table.statusWarning')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
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
              <BarChart data={DEPT_BARS} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
                <Bar dataKey="count" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]}  animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}