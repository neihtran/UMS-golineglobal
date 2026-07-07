import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, Eye, FileText, Users, CheckCircle2, Clock, Building2, Edit3 } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, Modal, TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce } from '@/hooks';
import { useRecruitmentList, useRecruitmentStats } from '@/hooks/useHrm';
import type { RecruitmentItem } from '@/services/hrm.service';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; labelKey: string }> = {
  open: { variant: 'success', labelKey: 'recruitment.status.open' },
  closed: { variant: 'error', labelKey: 'recruitment.status.closed' },
  draft: { variant: 'neutral', labelKey: 'recruitment.status.draft' },
  completed: { variant: 'info', labelKey: 'recruitment.status.completed' },
  cancelled: { variant: 'neutral', labelKey: 'recruitment.status.cancelled' },
};

const PIPELINE_STAGE_ORDER = ['new', 'screening', 'test', 'interview', 'offer', 'cancelled'] as const;
type PipelineStage = (typeof PIPELINE_STAGE_ORDER)[number];

interface PipelineStageConfig {
  id: PipelineStage;
  labelKey: string;
  color: string;
}

const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'new', labelKey: 'recruitment.pipeline.stages.new', color: '#1E3A5F' },
  { id: 'screening', labelKey: 'recruitment.pipeline.stages.screening', color: '#2D5D8A' },
  { id: 'test', labelKey: 'recruitment.pipeline.stages.test', color: '#6B7280' },
  { id: 'interview', labelKey: 'recruitment.pipeline.stages.interview', color: '#0EA5E9' },
  { id: 'offer', labelKey: 'recruitment.pipeline.stages.offer', color: '#16A34A' },
  { id: 'cancelled', labelKey: 'recruitment.pipeline.stages.cancelled', color: '#EF4444' },
];

const PIPELINE_LABEL: Record<PipelineStage, string> = {
  new: 'recruitment.pipeline.stages.new',
  screening: 'recruitment.pipeline.stages.screening',
  test: 'recruitment.pipeline.stages.test',
  interview: 'recruitment.pipeline.stages.interview',
  offer: 'recruitment.pipeline.stages.offer',
  cancelled: 'recruitment.pipeline.stages.cancelled',
};

const PIPELINE_APPLICANT_STYLE: Record<string, { variant: 'primary' | 'accent' | 'neutral' | 'info' | 'success' }> = {
  pending: { variant: 'neutral' },
  screening: { variant: 'accent' },
  testing: { variant: 'info' },
  interviewed: { variant: 'success' },
  offered: { variant: 'success' },
};

const PIPELINE_APPLICANT_LABEL: Record<string, string> = {
  pending: 'recruitment.pipeline.status.pending',
  screening: 'recruitment.pipeline.status.screening',
  testing: 'recruitment.pipeline.status.testing',
  interviewed: 'recruitment.pipeline.status.interviewed',
  offered: 'recruitment.pipeline.status.offered',
};

interface ApplicantRow {
  id: string;
  name: string;
  position: string;
  stage: PipelineStage;
  appliedAt: string;
  method: string;
  status: string;
}

export default function RecruitmentList() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecruitmentItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', position: '', level: '', slots: '', deadline: '', method: '', description: '' });

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useRecruitmentList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
  });

  const { data: statsData } = useRecruitmentStats();

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const pipelineCounts = useMemo(() => {
    const raw = (statsData as any)?.byStage as Record<string, number> | undefined;
    const counts: Record<PipelineStage, number> = {
      new: 0,
      screening: 0,
      test: 0,
      interview: 0,
      offer: 0,
      cancelled: 0,
    };
    for (const stage of PIPELINE_STAGE_ORDER) {
      counts[stage] = raw?.[stage] ?? 0;
    }
    return counts;
  }, [statsData]);

  const pipelineApplicants = useMemo(() => {
    const raw = (statsData as any)?.recentApplicants as ApplicantRow[] | undefined;
    return raw ?? [];
  }, [statsData]);

  const totalJobs = useMemo(() => total, [total]);
  const totalApplicants = useMemo(() => {
    const fromStats = (statsData as any)?.totalApplicants as number | undefined;
    if (typeof fromStats === 'number') return fromStats;
    return items.reduce((s, r) => s + (r.applicants || 0), 0);
  }, [items, statsData]);
  const totalHired = useMemo(() => (statsData as any)?.hired ?? '—', [statsData]);
  const totalProcessing = useMemo(() => (statsData as any)?.processing ?? '—', [statsData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('recruitment.title')}
        description={t('recruitment.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('recruitment.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>{t('recruitment.importProfiles')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>{t('recruitment.createJob')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { labelKey: 'recruitment.stats.totalJobs', value: totalJobs, sub: `${items.filter(r => r.status === 'open').length} ${t('recruitment.stats.open')}`, icon: <FileText className="h-5 w-5" />, color: 'primary' },
          { labelKey: 'recruitment.stats.candidates', value: totalApplicants, sub: t('recruitment.stats.allSessions'), icon: <Users className="h-5 w-5" />, color: 'accent' },
          { labelKey: 'recruitment.stats.hired', value: totalHired, sub: t('recruitment.stats.year'), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { labelKey: 'recruitment.stats.processing', value: totalProcessing, sub: t('recruitment.stats.profiles'), icon: <Clock className="h-5 w-5" />, color: 'warning' },
        ].map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 flex items-center gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.labelKey)}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('recruitment.pipeline.title')}</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('recruitment.pipeline.subtitle')}</p>
          </div>
          <Badge variant="neutral">
            {PIPELINE_STAGES.reduce((s, st) => s + pipelineCounts[st.id], 0)} {t('recruitment.pipeline.total')}
          </Badge>
        </div>

        <div className="flex gap-0 mb-6">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div className="w-full h-3 rounded-t-lg flex items-center justify-center text-white text-xs font-bold relative overflow-hidden" style={{ background: stage.color }}>
                  <span className="relative z-10">{pipelineCounts[stage.id]}</span>
                </div>
                <div className="w-full bg-[rgb(var(--border))] h-6 flex items-center justify-center">
                  <span className="text-xs text-[rgb(var(--text-secondary))] text-center px-1 leading-tight">{t(stage.labelKey)}</span>
                </div>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="absolute right-0 top-0 h-full flex items-center -mr-3 z-10">
                  <div className="w-6 h-6 rounded-full bg-[rgb(var(--bg-card))] border-2 border-[rgb(var(--border))] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--text-muted))]" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>{t('recruitment.pipeline.table.candidate')}</TableHeadCell>
                <TableHeadCell>{t('recruitment.pipeline.table.position')}</TableHeadCell>
                <TableHeadCell>{t('recruitment.pipeline.table.appliedDate')}</TableHeadCell>
                <TableHeadCell>{t('recruitment.pipeline.table.method')}</TableHeadCell>
                <TableHeadCell>{t('recruitment.pipeline.table.stage')}</TableHeadCell>
                <TableHeadCell>{t('recruitment.pipeline.table.status')}</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pipelineApplicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-[rgb(var(--text-muted))] py-8">
                    {t('recruitment.pipeline.empty', 'Chưa có ứng viên trong pipeline')}
                  </TableCell>
                </TableRow>
              ) : (
                pipelineApplicants.map((a) => {
                  const stageConfig = PIPELINE_STAGES.find(s => s.id === a.stage)!;
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-xs font-bold">
                            {a.name.split(' ').slice(-2).map(n => n[0]).join('')}
                          </div>
                          <p className="font-medium text-[rgb(var(--text-primary))]">{a.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{a.position}</TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{a.appliedAt}</TableCell>
                      <TableCell className="text-[rgb(var(--text-secondary))]">{a.method}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ background: stageConfig.color }} />
                          <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{t(PIPELINE_LABEL[a.stage])}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PIPELINE_APPLICANT_STYLE[a.status]?.variant || 'neutral'} dot size="sm">{t(PIPELINE_APPLICANT_LABEL[a.status] || a.status)}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('filter.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('recruitment.filter.statusAll')}</option>
          <option value="open">{t('recruitment.status.open')}</option>
          <option value="closed">{t('recruitment.status.closed')}</option>
          <option value="draft">{t('recruitment.status.draft')}</option>
          <option value="completed">{t('recruitment.status.completed')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('recruitment.table.jobCode')}</TableHeadCell>
            <TableHeadCell>{t('recruitment.table.title')}</TableHeadCell>
            <TableHeadCell>{t('recruitment.table.dept')}</TableHeadCell>
            <TableHeadCell>{t('recruitment.table.level')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('recruitment.table.slots')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('recruitment.table.candidates')}</TableHeadCell>
            <TableHeadCell>{t('recruitment.table.deadline')}</TableHeadCell>
            <TableHeadCell>{t('recruitment.table.status')}</TableHeadCell>
            <TableHeadCell>{t('recruitment.table.action')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : items.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.noRecruitment')} />
          ) : (
            items.map((r) => {
              const sc = STATUS_CONFIG[r.status] || { variant: 'neutral' as const, labelKey: r.status };
              return (
                <TableRow key={r._id} className="group">
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{r.code}</TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{r.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{r.method}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{(r.department as any)?.name || (r.department as any)?.shortName || '—'}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.level}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">{r.slots}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {r.applicants > 0 ? <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{r.applicants}</span> : <span className="text-sm text-[rgb(var(--text-muted))]">—</span>}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{new Date(r.deadline).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => { setSelectedItem(r); setDetailOpen(true); }}>{t('recruitment.modal.profileTitle')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>{t('recruitment.btn.profiles')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => { setSelectedItem(r); setEditOpen(true); }}>{t('action.edit')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={total}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} pageSizeOptions={[10, 25, 50]} />

      {/* Modal Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('recruitment.modal.createTitle')} size="xl"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setCreateOpen(false)}>{t('recruitment.btn.cancel')}</Button><Button variant="primary">{t('recruitment.btn.publish')}</Button></div>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.jobTitle')}</label>
              <Input placeholder={t('recruitment.modal.jobTitlePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.dept')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
                {['Khoa CNTT', 'Khoa Ngoai ngu', 'Khoa Luat', 'Khoa Kinh te', 'Phong Tai chinh', 'Ban Giam hieu'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.position')}</label>
              <Input placeholder={t('recruitment.modal.positionPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.level')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
                {['Dai hoc', 'Thac si', 'Tien si', 'Cao dang', 'Sinh vien'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.slots')}</label>
              <Input type="number" min="1" placeholder="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.deadline')}</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.method')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
                {['Xet ho so', 'Xet ho so + Phong van', 'Thi viet + Phong van', 'Thi thuc hanh'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.jobDesc')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)] resize-none" rows={3} placeholder={t('recruitment.modal.jobDescPlaceholder')} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.benefits')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)] resize-none" rows={2} placeholder={t('recruitment.modal.benefitsPlaceholder')} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Detail */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={t('recruitment.modal.detailTitle')} size="xl"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setDetailOpen(false)}>{t('recruitment.btn.close')}</Button><Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>{t('action.edit')}</Button></div>}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary))] text-white"><Building2 className="h-6 w-6" /></div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedItem.title}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedItem.code} · {(selectedItem.department as any)?.name || '—'} · {selectedItem.position}</p>
              </div>
              <Badge variant={STATUS_CONFIG[selectedItem.status]?.variant || 'neutral'} dot className="ml-auto">{t(STATUS_CONFIG[selectedItem.status]?.labelKey || selectedItem.status)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('recruitment.modal.position'), value: selectedItem.position },
                { label: t('recruitment.modal.level'), value: selectedItem.level },
                { label: t('recruitment.table.slots'), value: `${selectedItem.slots} ${t('recruitment.modal.slotsUnit')}` },
                { label: t('recruitment.table.deadline'), value: new Date(selectedItem.deadline).toLocaleDateString('vi-VN') },
                { label: t('recruitment.modal.method'), value: selectedItem.method },
                { label: t('recruitment.table.candidates'), value: `${selectedItem.applicants} ${t('recruitment.modal.applicantsUnit')}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-36">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </div>
            {selectedItem.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('recruitment.modal.jobDesc')}</p>
                <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4 text-sm text-[rgb(var(--text-secondary))]">{selectedItem.description}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Edit */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('recruitment.modal.editTitle')} size="xl"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setEditOpen(false)}>{t('recruitment.btn.cancel')}</Button><Button variant="primary">{t('recruitment.btn.saveChanges')}</Button></div>}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]"><Building2 className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t('recruitment.modal.editing')}:</p>
                <p className="font-medium text-[rgb(var(--text-primary))]">{selectedItem.title}</p>
              </div>
              <Badge variant={STATUS_CONFIG[selectedItem.status]?.variant || 'neutral'} dot className="ml-auto">{t(STATUS_CONFIG[selectedItem.status]?.labelKey || selectedItem.status)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.jobTitle')}</label>
                <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.dept')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]" value={editForm.position} onChange={(e) => setEditForm(f => ({ ...f, position: e.target.value }))}>
                  {['Khoa CNTT', 'Khoa Ngoai ngu', 'Khoa Luat', 'Khoa Kinh te', 'Phong Tai chinh', 'Ban Giam hieu'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.level')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]" value={editForm.level} onChange={(e) => setEditForm(f => ({ ...f, level: e.target.value }))}>
                  {['Dai hoc', 'Thac si', 'Tien si', 'Cao dang', 'Sinh vien'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.slots')}</label>
                <Input type="number" min="1" value={editForm.slots} onChange={(e) => setEditForm(f => ({ ...f, slots: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.deadline')}</label>
                <Input type="date" value={editForm.deadline} onChange={(e) => setEditForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
