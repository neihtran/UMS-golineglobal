import { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';

const STATS_OVERVIEW = [
  { key: 'statsTotal', value: '4.839', change: '+12%', icon: '📄', color: 'primary' },
  { key: 'statsSigned', value: '3.591', change: '+8%', icon: '✍️', color: 'success' },
  { key: 'statsPending', value: '156', change: '-5%', icon: '⏳', color: 'warning' },
  { key: 'statsOverdue', value: '23', change: '+2', icon: '⚠️', color: 'error' },
] as const;

const MONTHLY_STATS = [
  { month: 'T1/2026', total: 423, signed: 389, pending: 34 },
  { month: 'T2/2026', total: 512, signed: 478, pending: 34 },
  { month: 'T3/2026', total: 489, signed: 456, pending: 33 },
  { month: 'T4/2026', total: 534, signed: 498, pending: 36 },
  { month: 'T5/2026', total: 478, signed: 451, pending: 27 },
  { month: 'T6/2026', total: 521, signed: 489, pending: 32 },
];

const DOC_TYPE_STATS = [
  { typeKey: 'docType.cv', count: 1847, percent: 38, colorClass: 'bg-[rgb(var(--primary))]' },
  { typeKey: 'docType.qd', count: 1234, percent: 25, colorClass: 'bg-[rgb(var(--success))]' },
  { typeKey: 'docType.tb', count: 967, percent: 20, colorClass: 'bg-[rgb(var(--accent))]' },
  { typeKey: 'soanthaoMoi.typeTt', count: 412, percent: 9, colorClass: 'bg-[rgb(var(--info))]' },
  { typeKey: 'docType.bc', count: 379, percent: 8, colorClass: 'bg-[rgb(var(--warning))]' },
];

const TOP_UNITS = [
  { unit: 'Phòng Tổ chức - Hành chính', total: 834, signed: 812, pending: 22 },
  { unit: 'Khoa Công nghệ thông tin', total: 678, signed: 661, pending: 17 },
  { unit: 'Phòng Đào tạo', total: 612, signed: 598, pending: 14 },
  { unit: 'Khoa Kinh tế', total: 534, signed: 521, pending: 13 },
  { unit: 'Phòng Tài chính - Kế toán', total: 489, signed: 478, pending: 11 },
  { unit: 'Khoa Ngoại ngữ', total: 423, signed: 415, pending: 8 },
];

const PERIOD_OPTIONS = [
  { id: '6thang', labelKey: 'statistics.chartPeriod6m' },
  { id: '12thang', labelKey: 'statistics.chartPeriod12m' },
] as const;

export default function DocStatistics() {
  const { t } = useTranslation('dms');
  const [timeRange, setTimeRange] = useState('6thang');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('statistics.title')}
        description={t('statistics.description')}
        breadcrumbs={[{ label: 'DMS', href: '/dms' }, { label: t('statistics.breadcrumb') }]}
        actions={
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('statistics.exportReport')}</Button>
        }
      />

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS_OVERVIEW.map((s) => (
          <Card key={s.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t(`statistics.${s.key}`)}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.change} {t('statistics.vsLastMonth')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t('statistics.chartTitle')}</CardTitle>
              <div className="flex gap-1">
                {PERIOD_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setTimeRange(r.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      timeRange === r.id
                        ? 'bg-[rgb(var(--primary))] text-white border-transparent'
                        : 'bg-white text-[rgb(var(--text-secondary))] border-[rgb(var(--border))]'
                    }`}
                  >
                    {t(r.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple bar chart using table cells */}
            <div className="space-y-3">
              {MONTHLY_STATS.map((m) => {
                const signedPct = Math.round((m.signed / m.total) * 100);
                const pendingPct = Math.round((m.pending / m.total) * 100);
                return (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-12 text-xs text-[rgb(var(--text-muted))] shrink-0">{m.month}</span>
                    <div className="flex-1 flex h-6 rounded overflow-hidden bg-[rgb(var(--bg-base))]">
                      <div
                        className="h-full bg-[rgb(var(--success))] flex items-center justify-center"
                        style={{ width: `${signedPct}%` }}
                      >
                        {signedPct > 15 && (
                          <span className="text-[10px] font-medium text-white">{m.signed}</span>
                        )}
                      </div>
                      <div
                        className="h-full bg-[rgb(var(--warning))] flex items-center justify-center"
                        style={{ width: `${pendingPct}%` }}
                      >
                        {pendingPct > 10 && (
                          <span className="text-[10px] font-medium text-white">{m.pending}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[rgb(var(--text-primary))] w-10 text-right shrink-0">
                      {m.total}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[rgb(var(--border)/0.5)]">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-[rgb(var(--success))]" />
                <span className="text-xs text-[rgb(var(--text-muted))]">{t('statistics.signedStat')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-[rgb(var(--warning))]" />
                <span className="text-xs text-[rgb(var(--text-muted))]">{t('statistics.pendingStat')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doc type breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t('statistics.docTypeTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DOC_TYPE_STATS.map((d) => (
              <div key={d.typeKey}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[rgb(var(--text-primary))]">{t(d.typeKey)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{d.count}</span>
                    <span className="text-xs text-[rgb(var(--text-muted))]">{d.percent}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[rgb(var(--bg-base))] overflow-hidden">
                  <div
                    className={`h-full ${d.colorClass} rounded-full`}
                    style={{ width: `${d.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top units */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('statistics.topUnitsTitle')}</CardTitle>
        </CardHeader>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>{t('table.stt')}</TableHeadCell>
              <TableHeadCell>{t('common.dept')}</TableHeadCell>
              <TableHeadCell>{t('statistics.totalDocs')}</TableHeadCell>
              <TableHeadCell>{t('statistics.signedDocs')}</TableHeadCell>
              <TableHeadCell>{t('statistics.pendingDocs')}</TableHeadCell>
              <TableHeadCell>{t('statistics.ratio')}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TOP_UNITS.map((u, i) => (
              <TableRow key={u.unit}>
                <TableCell className="text-[rgb(var(--text-muted))]">{i + 1}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{u.unit}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{u.total}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--success))]" />
                    <span className="text-sm text-[rgb(var(--text-secondary))]">{u.signed}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[rgb(var(--warning))]" />
                    <span className="text-sm text-[rgb(var(--text-secondary))]">{u.pending}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-[rgb(var(--bg-base))] overflow-hidden">
                      <div
                        className="h-full bg-[rgb(var(--success))] rounded-full"
                        style={{ width: `${Math.round((u.signed / u.total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[rgb(var(--success))]">
                      {Math.round((u.signed / u.total) * 100)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
