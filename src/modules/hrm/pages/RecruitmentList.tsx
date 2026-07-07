import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, Eye, FileText, Users, CheckCircle2, Clock, Building2, Edit3 } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, Modal, DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';

const PIPELINE_STAGES = [
  { id: 'new', count: 28, color: '#1E3A5F' },
  { id: 'screening', count: 18, color: '#2D5D8A' },
  { id: 'test', count: 12, color: '#6B7280' },
  { id: 'interview', count: 8, color: '#0EA5E9' },
  { id: 'offer', count: 3, color: '#16A34A' },
];

const PIPELINE_APPLICANTS = [
  { id: 'a01', name: 'Nguyen Van An', position: 'Giang vien CNTT', stage: 'new', appliedAt: '2026-06-28', method: 'Xet ho so', status: 'pending' },
  { id: 'a02', name: 'Tran Thi Binh', position: 'Giang vien CNTT', stage: 'new', appliedAt: '2026-06-27', method: 'Xet ho so', status: 'pending' },
  { id: 'a03', name: 'Le Van Cuong', position: 'Chuyen vien Tai chinh', stage: 'screening', appliedAt: '2026-06-20', method: 'Thi viet', status: 'screening' },
  { id: 'a04', name: 'Pham Thi Dung', position: 'Giang vien Tieng Anh', stage: 'test', appliedAt: '2026-06-18', method: 'Phong van', status: 'testing' },
  { id: 'a05', name: 'Hoang Minh Duc', position: 'Ky thuat vien Ha tang', stage: 'interview', appliedAt: '2026-06-10', method: 'Thi thuc hanh', status: 'interviewed' },
  { id: 'a06', name: 'Vu Thi Lan', position: 'Chuyen vien Tai chinh', stage: 'offer', appliedAt: '2026-06-05', method: 'Thi viet + PV', status: 'offered' },
];

const RECRUITMENTS = [
  { id: 'rc01', code: 'TD-2026-001', title: 'Tuyen dung Giang vien CNTT', dept: 'Khoa CNTT', position: 'Giang vien', level: 'Thac si', slots: 3, applicants: 47, deadline: '2026-07-15', status: 'open', method: 'Xet ho so + Phong van' },
  { id: 'rc02', code: 'TD-2026-002', title: 'Tuyen dung Chuyen vien Tai chinh', dept: 'Phong Tai chinh', position: 'Chuyen vien', level: 'Dai hoc', slots: 2, applicants: 31, deadline: '2026-07-20', status: 'open', method: 'Thi viet + Phong van' },
  { id: 'rc03', code: 'TD-2026-003', title: 'Tuyen dung Giang vien Tieng Anh', dept: 'Khoa Ngoai ngu', position: 'Giang vien', level: 'Thac si', slots: 1, applicants: 18, deadline: '2026-06-30', status: 'closed', method: 'Xet ho so + Phong van' },
  { id: 'rc04', code: 'TD-2026-004', title: 'Tuyen dung Ky thuat vien Ha tang', dept: 'Phong CNTT', position: 'Ky thuat vien', level: 'Cao dang', slots: 2, applicants: 0, deadline: '2026-08-01', status: 'draft', method: 'Thi thuc hanh' },
  { id: 'rc05', code: 'TD-2025-008', title: 'Tuyen dung Tro giang Luat', dept: 'Khoa Luat', position: 'Tro giang', level: 'Sinh vien', slots: 4, applicants: 62, deadline: '2025-12-10', status: 'completed', method: 'Xet ho so' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; labelKey: string }> = {
  open: { variant: 'success', labelKey: 'recruitment.status.open' },
  closed: { variant: 'error', labelKey: 'recruitment.status.closed' },
  draft: { variant: 'neutral', labelKey: 'recruitment.status.draft' },
  completed: { variant: 'info', labelKey: 'recruitment.status.completed' },
};

const PIPELINE_LABEL: Record<string, string> = {
  new: 'recruitment.pipeline.stages.new',
  screening: 'recruitment.pipeline.stages.screening',
  test: 'recruitment.pipeline.stages.test',
  interview: 'recruitment.pipeline.stages.interview',
  offer: 'recruitment.pipeline.stages.offer',
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

export default function RecruitmentList() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [hoSoOpen, setHoSoOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', dept: '', position: '', level: '', slots: '', deadline: '', method: '', description: '' });

  const { selectedId, openDetail, openEdit, close, isEditMode } = useDetailModal({ size: 'fullscreen' });
  const selectedItem = selectedId ? RECRUITMENTS.find((r) => r.id === selectedId) ?? null : null;

  const filtered = RECRUITMENTS.filter((r) => {
    const match = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'all' || r.dept === dept;
    const matchStatus = status === 'all' || r.status === status;
    return match && matchDept && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
  const pipelineTotal = PIPELINE_STAGES.reduce((s, st) => s + st.count, 0);
  const openCount = RECRUITMENTS.filter(r => r.status === 'open').length;
  const totalApplicants = RECRUITMENTS.reduce((s, r) => s + r.applicants, 0);

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
          { labelKey: 'recruitment.stats.totalJobs', value: RECRUITMENTS.length, sub: `${openCount} ${t('recruitment.stats.open')}`, icon: <FileText className="h-5 w-5" />, color: 'primary' },
          { labelKey: 'recruitment.stats.candidates', value: totalApplicants, sub: t('recruitment.stats.allSessions'), icon: <Users className="h-5 w-5" />, color: 'accent' },
          { labelKey: 'recruitment.stats.hired', value: 12, sub: t('recruitment.stats.year'), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { labelKey: 'recruitment.stats.processing', value: pipelineTotal, sub: t('recruitment.stats.profiles'), icon: <Clock className="h-5 w-5" />, color: 'warning' },
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
          <Badge variant="neutral">{pipelineTotal} {t('recruitment.pipeline.total')}</Badge>
        </div>

        <div className="flex gap-0 mb-6">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div className="w-full h-3 rounded-t-lg flex items-center justify-center text-white text-xs font-bold relative overflow-hidden" style={{ background: stage.color }}>
                  <span className="relative z-10">{stage.count}</span>
                </div>
                <div className="w-full bg-[rgb(var(--border))] h-6 flex items-center justify-center">
                  <span className="text-xs text-[rgb(var(--text-secondary))] text-center px-1 leading-tight">{t(PIPELINE_LABEL[stage.id])}</span>
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
              {PIPELINE_APPLICANTS.map((a) => {
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
                      <Badge variant={PIPELINE_APPLICANT_STYLE[a.status].variant} dot size="sm">{t(PIPELINE_APPLICANT_LABEL[a.status])}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('filter.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2))]">
          <option value="all">{t('recruitment.filter.deptAll')}</option>
          {['Khoa CNTT', 'Khoa Ngoai ngu', 'Khoa Luat', 'Phong Tai chinh', 'Phong CNTT'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2))]">
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
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.noRecruitment')} />
          ) : (
            paged.map((r) => {
              const sc = STATUS_CONFIG[r.status];
              return (
                <TableRow key={r.id} className="group">
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{r.code}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => openDetail(r.id)}
                      className="text-left w-full hover:text-[rgb(var(--primary))] transition-colors"
                    >
                      <p className="font-medium text-[rgb(var(--text-primary))]">{r.title}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{r.method}</p>
                    </button>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.dept}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.level}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">{r.slots}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {r.applicants > 0 ? <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{r.applicants}</span> : <span className="text-sm text-[rgb(var(--text-muted))]">—</span>}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.deadline}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => openDetail(r.id)}>{t('recruitment.modal.profileTitle')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => setHoSoOpen(true)}>{t('recruitment.btn.profiles')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => { openEdit(r.id); setEditForm({ title: r.title, dept: r.dept, position: r.position, level: r.level, slots: r.slots.toString(), deadline: r.deadline, method: r.method, description: '' }); }}>{t('action.edit')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} pageSizeOptions={[10, 25, 50]} />

      {/* Modal Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('recruitment.modal.createTitle')} size="xl"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setCreateOpen(false)}>{t('recruitment.btn.cancel')}</Button><Button variant="primary" onClick={() => setCreateOpen(false)}>{t('recruitment.btn.publish')}</Button></div>}>
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

      {/* Detail / Edit Modal */}
      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedItem ? selectedItem.title : ''}
        description={selectedItem ? `${selectedItem.code} · ${selectedItem.dept} · ${selectedItem.position}` : ''}
        size="fullscreen"
        onEdit={selectedItem && !isEditMode ? () => openEdit(selectedItem.id) : undefined}
      >
        {selectedItem && (
          isEditMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]"><Building2 className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('recruitment.modal.editing')}:</p>
                  <p className="font-medium text-[rgb(var(--text-primary))]">{selectedItem.title}</p>
                </div>
                <Badge variant={STATUS_CONFIG[selectedItem.status].variant} dot className="ml-auto">{t(STATUS_CONFIG[selectedItem.status].labelKey)}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.jobTitle')}</label>
                  <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.dept')}</label>
                  <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]" value={editForm.dept} onChange={(e) => setEditForm(f => ({ ...f, dept: e.target.value }))}>
                    {['Khoa CNTT', 'Khoa Ngoai ngu', 'Khoa Luat', 'Khoa Kinh te', 'Phong Tai chinh', 'Ban Giam hieu'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.position')}</label>
                  <Input value={editForm.position} onChange={(e) => setEditForm(f => ({ ...f, position: e.target.value }))} />
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
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('recruitment.modal.method')}</label>
                  <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]" value={editForm.method} onChange={(e) => setEditForm(f => ({ ...f, method: e.target.value }))}>
                    {['Xet ho so', 'Xet ho so + Phong van', 'Thi viet + Phong van', 'Thi thuc hanh'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={close}>{t('recruitment.btn.cancel')}</Button>
                <Button variant="primary" onClick={close}>{t('recruitment.btn.saveChanges')}</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary))] text-white"><Building2 className="h-6 w-6" /></div>
                <div>
                  <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedItem.title}</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedItem.code} · {selectedItem.dept} · {selectedItem.position}</p>
                </div>
                <Badge variant={STATUS_CONFIG[selectedItem.status].variant} dot className="ml-auto">{t(STATUS_CONFIG[selectedItem.status].labelKey)}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: t('recruitment.modal.position'), value: selectedItem.position },
                  { label: t('recruitment.modal.level'), value: selectedItem.level },
                  { label: t('recruitment.table.slots'), value: `${selectedItem.slots} nguoi` },
                  { label: t('recruitment.table.deadline'), value: selectedItem.deadline },
                  { label: t('recruitment.modal.method'), value: selectedItem.method },
                  { label: t('recruitment.table.candidates'), value: `${selectedItem.applicants} ho so` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                    <span className="shrink-0 text-[rgb(var(--text-muted))] w-36">{label}:</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('recruitment.modal.jobDesc')} & {t('recruitment.modal.benefits')}</p>
                <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4 text-sm text-[rgb(var(--text-secondary))] space-y-2">
                  <p>Yeu cau tot nghiep {selectedItem.level} tro len chuyen nganh lien quan.</p>
                  <p>Co kha nang lam viec doc lap va theo nhom.</p>
                  <p>Duoc huong luong theo nang luc, phu cap, bao hiem day du.</p>
                  <p>Co hoi dao tao va phat trien nghe nghiep.</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3">{t('recruitment.modal.applicantList')} ({PIPELINE_APPLICANTS.length} ho so)</p>
                <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                  <Table>
                    <TableHead><TableRow>
                      <TableHeadCell>{t('recruitment.pipeline.table.candidate')}</TableHeadCell>
                      <TableHeadCell>{t('recruitment.pipeline.table.appliedDate')}</TableHeadCell>
                      <TableHeadCell>{t('recruitment.pipeline.table.stage')}</TableHeadCell>
                      <TableHeadCell>{t('recruitment.pipeline.table.status')}</TableHeadCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {PIPELINE_APPLICANTS.slice(0, 3).map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                                {a.name.split(' ').slice(-2).map(n => n[0]).join('')}
                              </div>
                              <p className="font-medium text-[rgb(var(--text-primary))]">{a.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-[rgb(var(--text-secondary))]">{a.appliedAt}</TableCell>
                          <TableCell><Badge variant={PIPELINE_APPLICANT_STYLE[a.status].variant} size="sm">{t(PIPELINE_APPLICANT_LABEL[a.status])}</Badge></TableCell>
                          <TableCell><Badge variant={STATUS_CONFIG[selectedItem.status].variant} dot size="sm">{t(STATUS_CONFIG[selectedItem.status].labelKey)}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )
        )}
      </DetailModal>

      {/* Modal Profiles */}
      <Modal open={hoSoOpen} onClose={() => setHoSoOpen(false)} title={t('recruitment.modal.profilesTitle')} size="xl"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setHoSoOpen(false)}>{t('recruitment.btn.close')}</Button><Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('recruitment.modal.downloadAll')}</Button></div>}>
        <div className="space-y-3">
          <p className="text-sm text-[rgb(var(--text-secondary))]">{t('recruitment.modal.profilesTitle')} <strong>{PIPELINE_APPLICANTS.length} ho so</strong></p>
          {PIPELINE_APPLICANTS.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-lg border border-[rgb(var(--border))] p-4 hover:border-[rgb(var(--primary-light))] transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-sm font-bold text-[rgb(var(--primary))]">
                {a.name.split(' ').slice(-2).map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[rgb(var(--text-primary))]">{a.name}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{a.position} · {a.method} · {a.appliedAt}</p>
              </div>
              <Badge variant={PIPELINE_APPLICANT_STYLE[a.status].variant} size="sm">{t(PIPELINE_APPLICANT_LABEL[a.status])}</Badge>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>{t('recruitment.modal.profileTitle')}</Button>
                <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('recruitment.modal.profileDownloadCV')}</Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
