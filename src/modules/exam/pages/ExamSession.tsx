import { useState } from 'react';
import { Video, Users, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SESSIONS = [
  { id: 's1', examId: 'EX001', name: 'Thi giữa kỳ – INT2201', course: 'Cấu trúc dữ liệu', type: 'midterm', room: 'A101', duration: 90, totalStudents: 45, present: 42, proctor: 'TS. Nguyễn Văn A', status: 'active', startTime: '2026-06-26 08:00', endTime: '2026-06-26 09:30' },
  { id: 's2', examId: 'EX002', name: 'Thi cuối kỳ – INT3110', course: 'Cơ sở dữ liệu', type: 'final', room: 'B202', duration: 120, totalStudents: 38, present: 0, proctor: 'PGS.TS. Trần Thị B', status: 'scheduled', startTime: '2026-06-28 08:00', endTime: '2026-06-28 10:00' },
  { id: 's3', examId: 'EX003', name: 'Thi giữa kỳ – KT1001', course: 'Kinh tế vi mô', type: 'midterm', room: 'C303', duration: 60, totalStudents: 52, present: 52, proctor: 'TS. Lê Văn C', status: 'completed', startTime: '2026-06-20 14:00', endTime: '2026-06-20 15:00' },
  { id: 's4', examId: 'EX004', name: 'Kiểm tra – NN1001', course: 'Tiếng Anh A1', type: 'quiz', room: 'D404', duration: 45, totalStudents: 30, present: 28, proctor: 'ThS. Phạm Thị D', status: 'active', startTime: '2026-06-26 10:00', endTime: '2026-06-26 10:45' },
];

export default function ExamSession() {
  const { t } = useTranslation('exam');
  const [statusFilter, setStatusFilter] = useState('all');
  const active = SESSIONS.filter((s) => s.status === 'active');

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
    active: { variant: 'warning', label: t('examSession.status.activeLabel') },
    scheduled: { variant: 'info', label: t('examSession.status.scheduledLabel') },
    completed: { variant: 'success', label: t('examSession.status.completedLabel') },
    cancelled: { variant: 'neutral', label: t('examSession.status.cancelledLabel') },
  };

  const TYPE_CONFIG: Record<string, { label: string; variant: 'primary' | 'accent' | 'info' }> = {
    midterm: { label: t('examSession.type.midterm'), variant: 'accent' },
    final: { label: t('examSession.type.final'), variant: 'primary' },
    quiz: { label: t('examSession.type.quiz'), variant: 'info' },
    practice: { label: t('examSession.type.practice'), variant: 'info' },
  };

  const filtered = SESSIONS.filter((s) => statusFilter === 'all' || s.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('examSession.title')}
        description={t('examSession.description')}
        breadcrumbs={[
          { label: t('breadcrumb.dashboard'), href: '/exam' },
          { label: t('breadcrumb.examSession') },
        ]}
        actions={
          <Button leftIcon={<Video className="h-4 w-4" />} className="bg-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.9]">
            {t('examSession.monitorOnline')}
          </Button>
        }
      />

      {/* Active sessions */}
      {active.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--warning))] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(var(--warning))]" />
            </span>
            {t('examSession.activeSessions.title')} ({active.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((s) => (
              <Card key={s.id} className="border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.03)]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{s.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{s.room} · {s.startTime.split('T')[1]}</p>
                    </div>
                    <Badge variant="warning" size="sm" dot>{t('common.live')}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))]">
                      <Users className="h-3.5 w-3.5" />
                      <span>{s.present}/{s.totalStudents}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{s.duration} {t('examSession.card.minutes')}</span>
                    </div>
                    <Badge variant="warning" size="sm">{s.totalStudents - s.present} {t('examSession.card.present')}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" leftIcon={<Video className="h-3.5 w-3.5" />}>
                    {t('common.monitorNow')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All sessions */}
      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('examSession.allSessions.title')}</h3>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2"
            >
              <option value="all">{t('examSession.status.all')}</option>
              <option value="active">{t('examSession.status.active')}</option>
              <option value="scheduled">{t('examSession.status.scheduled')}</option>
              <option value="completed">{t('examSession.status.completed')}</option>
            </select>
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>{t('examSession.table.session')}</TableHeadCell>
              <TableHeadCell>{t('examSession.table.course')}</TableHeadCell>
              <TableHeadCell>{t('examSession.table.type')}</TableHeadCell>
              <TableHeadCell>{t('examSession.table.room')}</TableHeadCell>
              <TableHeadCell>{t('examSession.table.time')}</TableHeadCell>
              <TableHeadCell>{t('examSession.table.students')}</TableHeadCell>
              <TableHeadCell>{t('examSession.table.proctor')}</TableHeadCell>
              <TableHeadCell>{t('common.trangThai')}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s) => {
              const sc = STATUS_CONFIG[s.status];
              const tc = TYPE_CONFIG[s.type];
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))] text-sm">{s.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{s.examId}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.course}</TableCell>
                  <TableCell><Badge variant={tc.variant} size="sm">{tc.label}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.room}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] text-xs">
                    <div>{s.startTime.split('T')[1]} – {s.endTime.split('T')[1]}</div>
                    <div className="text-[rgb(var(--text-muted))]">{s.duration} {t('examSession.card.minutes')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{s.present}/{s.totalStudents}</span>
                      {s.totalStudents - s.present > 0 && (
                        <Badge variant="error" size="sm">{s.totalStudents - s.present} {t('examSession.card.present')}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.proctor}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
