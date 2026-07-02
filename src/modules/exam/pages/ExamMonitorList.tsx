import { useState } from 'react';
import { Plus, Monitor, Eye, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const MONITORS = [
  { id: 'mo01', examCode: 'THI-2026-001', examName: 'Thi giữa kỳ — Nhập môn Tin học', course: 'INT1005', scheduledAt: '2026-06-28 08:00', duration: 90, totalStudents: 156, present: 148, absent: 8, cheating: 0, status: 'active', room: 'Phòng A101', supervisor: 'Nguyễn Hoàng Long' },
  { id: 'mo02', examCode: 'THI-2026-002', examName: 'Thi giữa kỳ — Cấu trúc dữ liệu', course: 'INT2201', scheduledAt: '2026-06-28 13:30', duration: 90, totalStudents: 98, present: 94, absent: 4, cheating: 0, status: 'scheduled', room: 'Phòng B201', supervisor: 'Trần Thị Mai Lan' },
  { id: 'mo03', examCode: 'THI-2026-003', examName: 'Thi cuối kỳ — Kinh tế vi mô', course: 'KT1001', scheduledAt: '2026-06-29 08:00', duration: 120, totalStudents: 203, present: 0, absent: 0, cheating: 0, status: 'scheduled', room: 'Phòng A301', supervisor: 'Bùi Đình Nam' },
  { id: 'mo04', examCode: 'THI-2026-004', examName: 'Thi thử — Mạng máy tính', course: 'INT3201', scheduledAt: '2026-06-25 14:00', duration: 60, totalStudents: 87, present: 82, absent: 5, cheating: 1, status: 'completed', room: 'Phòng C102', supervisor: 'Phạm Thu Hà' },
  { id: 'mo05', examCode: 'THI-2026-005', examName: 'Thi giữa kỳ — Tiếng Anh A2', course: 'NN1001', scheduledAt: '2026-06-27 15:00', duration: 90, totalStudents: 280, present: 275, absent: 5, cheating: 0, status: 'active', room: 'Hội trường lớn', supervisor: 'Ngô Thanh Sơn' },
];

export default function ExamMonitorList() {
  const { t } = useTranslation('exam');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'info' | 'neutral' | 'error'; label: string }> = {
    active: { variant: 'success', label: t('examMonitorList.status.active') },
    scheduled: { variant: 'info', label: t('examMonitorList.status.scheduled') },
    completed: { variant: 'neutral', label: t('examMonitorList.status.completed') },
    cancelled: { variant: 'error', label: t('examMonitorList.status.cancelled') },
  };

  const filtered = MONITORS.filter((m) => {
    const match = !search || m.examName.toLowerCase().includes(search.toLowerCase()) || m.examCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || m.status === status;
    return match && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const activeExams = MONITORS.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('examMonitorList.title')}
        description={t('examMonitorList.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard'), href: '/exam' }, { label: t('breadcrumb.examMonitorList') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<BarChart3 className="h-4 w-4" />}>{t('examMonitorList.report')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('examMonitorList.createSession')}</Button>
          </>
        }
      />

      {/* Live status banner */}
      {activeExams > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--success)/0.15)]">
            <div className="h-3 w-3 rounded-full bg-[rgb(var(--success))] animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-[rgb(var(--success))]">{t('examMonitorList.liveBanner.count', { count: activeExams })}</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{t('examMonitorList.liveBanner.realtime')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t('examMonitorList.stats.monitoring'), value: MONITORS.filter(m => m.status === 'active').length, color: 'success' },
          { label: t('examMonitorList.stats.scheduled'), value: MONITORS.filter(m => m.status === 'scheduled').length, color: 'info' },
          { label: t('examMonitorList.stats.totalStudents'), value: MONITORS.reduce((s, m) => s + m.totalStudents, 0), color: 'primary' },
          { label: t('examMonitorList.stats.cheatingCases'), value: MONITORS.reduce((s, m) => s + m.cheating, 0), color: 'error' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('common.all')}</option>
          <option value="active">{t('examMonitorList.status.active')}</option>
          <option value="scheduled">{t('examMonitorList.status.scheduled')}</option>
          <option value="completed">{t('examMonitorList.status.completed')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('examMonitorList.table.examCode')}</TableHeadCell>
            <TableHeadCell>{t('examMonitorList.table.examName')}</TableHeadCell>
            <TableHeadCell>{t('examMonitorList.table.roomTime')}</TableHeadCell>
            <TableHeadCell>{t('examMonitorList.table.supervisor')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('examMonitorList.table.registered')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('examMonitorList.table.present')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('examMonitorList.table.absent')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('examMonitorList.table.cheating')}</TableHeadCell>
            <TableHeadCell>{t('common.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('common.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message={t('questionBankFull.empty.title')} />
          ) : (
            paged.map((m) => {
              const sc = STATUS_CONFIG[m.status];
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{m.examCode}</TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{m.examName}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{m.course} · {m.duration} {t('examSession.card.minutes')}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{m.room}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{m.scheduledAt}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{m.supervisor}</TableCell>
                  <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{m.totalStudents}</TableCell>
                  <TableCell className="text-center">
                    {m.status === 'active' || m.status === 'completed' ? (
                      <span className="font-bold text-[rgb(var(--success))]">{m.present}</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {m.absent > 0 ? (
                      <span className="font-semibold text-[rgb(var(--error))]">{m.absent}</span>
                    ) : m.status === 'scheduled' ? '—' : (
                      <span className="text-[rgb(var(--text-muted))]">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {m.cheating > 0 ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)] text-xs font-bold text-[rgb(var(--error))]">{m.cheating}</span>
                    ) : <span className="text-[rgb(var(--text-muted))]">0</span>}
                  </TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                      {m.status === 'active' ? t('common.monitor') : t('common.view')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
