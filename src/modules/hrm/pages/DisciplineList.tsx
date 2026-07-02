import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, AlertTriangle, Scale, Ban } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const DISCIPLINES = [
  { id: 'dc01', code: 'KL-2026-001', name: 'Nguyen Van Minh', dept: 'Khoa CNTT', type: 'academic', level: 'severe', date: '2026-06-10', status: 'pending', description: 'Sao chép bai tap lon', handler: 'PGS.TS. Le Hoang', handlerDept: 'Phong Dao tao', nextSteps: 'Cho phan hoi tu gia dinh' },
  { id: 'dc02', code: 'KL-2026-002', name: 'Tran Thi Huong', dept: 'Khoa Luat', type: 'rule', level: 'moderate', date: '2026-06-08', status: 'reviewed', description: 'Nghi hoc qua 20%', handler: 'TS. Ngo Thu Lan', handlerDept: 'Phong CNV', nextSteps: 'Dang cho phan hoi tu gia dinh sinh vien' },
  { id: 'dc03', code: 'KL-2026-003', name: 'Le Dinh Phong', dept: 'Khoa Y duoc', type: 'ethics', level: 'mild', date: '2026-06-05', status: 'resolved', description: 'Thong tin sai trong bao cao thuc tap', handler: 'PGS.TS. Vu Thi Mai', handlerDept: 'Khoa Y duoc', resolution: 'Phe binh bang van ban', resolvedAt: '2026-06-15' },
  { id: 'dc04', code: 'KL-2026-004', name: 'Pham Thi Lan', dept: 'Khoa Ngoai ngu', type: 'rule', level: 'mild', date: '2026-06-01', status: 'pending', description: 'Su dung tai lieu khong duoc phep', handler: 'ThS. Tran Van Hung', handlerDept: 'Phong Khao thi' },
  { id: 'dc05', code: 'KL-2025-015', name: 'Hoang Van Son', dept: 'Khoa Kinh te', type: 'academic', level: 'severe', date: '2025-11-20', status: 'resolved', description: 'Gian lan thi cuoi ky', handler: 'PGS.TS. Dang Minh Tuan', handlerDept: 'Ban Ky luat', resolution: 'Huy ket qua thi', resolvedAt: '2025-12-05' },
  { id: 'dc06', code: 'KL-2025-016', name: 'Dang Minh Tuan', dept: 'Khoa CNTT', type: 'ethics', level: 'moderate', date: '2025-11-15', status: 'resolved', description: 'Quay roi sinh vien', handler: 'TS. Pham Thi Huong', handlerDept: 'Phong CNV', resolution: 'Canh cao bang van ban', resolvedAt: '2025-11-28' },
];

const LEVEL_CONFIG: Record<string, { variant: 'error' | 'warning' | 'neutral'; labelKey: string }> = {
  severe: { variant: 'error', labelKey: 'discipline.level.severe' },
  moderate: { variant: 'warning', labelKey: 'discipline.level.moderate' },
  mild: { variant: 'neutral', labelKey: 'discipline.level.mild' },
};

const STATUS_CONFIG: Record<string, { variant: 'warning' | 'info' | 'success'; labelKey: string }> = {
  pending: { variant: 'warning', labelKey: 'discipline.status.pending' },
  reviewed: { variant: 'info', labelKey: 'discipline.status.reviewed' },
  resolved: { variant: 'success', labelKey: 'discipline.status.resolved' },
};

const TYPE_CONFIG: Record<string, string> = {
  academic: 'discipline.type.academic',
  rule: 'discipline.type.rule',
  ethics: 'discipline.type.ethics',
  safety: 'discipline.type.safety',
  other: 'discipline.type.other',
};

export default function DisciplineList() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [quyDinhOpen, setQuyDinhOpen] = useState(false);
  const [chiTietOpen, setChiTietOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof DISCIPLINES[0] | null>(null);

  const filtered = DISCIPLINES.filter((d) => {
    const match = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'all' || d.dept === dept;
    const matchStatus = status === 'all' || d.status === status;
    return match && matchDept && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('discipline.title')}
        description={t('discipline.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('discipline.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('discipline.exportReport')}</Button>
            <Button variant="outline" leftIcon={<Scale className="h-4 w-4" />} onClick={() => setQuyDinhOpen(true)}>{t('discipline.viewRegulation')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>{t('discipline.createRecord')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { labelKey: 'discipline.stats.total', value: 6, icon: <Scale className="h-5 w-5" />, color: 'primary' },
          { labelKey: 'discipline.stats.pending', value: 2, icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
          { labelKey: 'discipline.stats.reviewed', value: 1, icon: <Ban className="h-5 w-5" />, color: 'info' },
          { labelKey: 'discipline.stats.resolved', value: 3, icon: <Scale className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.labelKey)}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
        />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('discipline.filter.deptAll')}</option>
          {['Khoa CNTT', 'Khoa Luat', 'Khoa Y duoc', 'Khoa Ngoai ngu', 'Khoa Kinh te'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('discipline.filter.statusAll')}</option>
          <option value="pending">{t('discipline.status.pending')}</option>
          <option value="reviewed">{t('discipline.status.reviewed')}</option>
          <option value="resolved">{t('discipline.status.resolved')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('discipline.table.caseCode')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.violator')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.dept')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.type')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.level')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.description')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.date')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.status')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.action')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.noDiscipline')} />
          ) : (
            paged.map((d) => {
              const lc = LEVEL_CONFIG[d.level];
              const sc = STATUS_CONFIG[d.status];
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{d.code}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{d.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{d.dept}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{t(TYPE_CONFIG[d.type])}</TableCell>
                  <TableCell><Badge variant={lc.variant} size="sm">{t(lc.labelKey)}</Badge></TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-sm text-[rgb(var(--text-secondary))]" title={d.description}>{d.description}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{d.date}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(d); setChiTietOpen(true); }}>{t('action.detail')}</Button>
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

      {/* Modal 1: Create record */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('discipline.modal.createTitle')} size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('discipline.btn.cancel')}</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>{t('discipline.btn.saveRecord')}</Button>
          </div>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.violator')}</label>
              <Input placeholder={t('discipline.modal.violatorPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.dept')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
                {['Khoa CNTT', 'Khoa Luat', 'Khoa Y duoc', 'Khoa Ngoai ngu', 'Khoa Kinh te', 'Phong To chuc'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.violationType')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k}>{t(v)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.level')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
                <option>{t('discipline.level.mild')}</option><option>{t('discipline.level.moderate')}</option><option>{t('discipline.level.severe')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.recordDate')}</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.recordBy')}</label>
              <Input placeholder={t('discipline.modal.recordByPlaceholder')} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.violationDesc')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={3} placeholder={t('discipline.modal.violationDescPlaceholder')} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('discipline.modal.proposedAction')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('discipline.modal.proposedActionPlaceholder')} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Regulations */}
      <Modal open={quyDinhOpen} onClose={() => setQuyDinhOpen(false)} title={t('discipline.modal.regulationTitle')} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setQuyDinhOpen(false)}>{t('discipline.btn.close')}</Button></div>}>
        <div className="space-y-3">
          {[
            { levelKey: 'discipline.level.mild', color: 'rgb(var(--neutral))', descKey: 'discipline.modal.proposedActionPlaceholder' },
            { levelKey: 'discipline.level.moderate', color: 'rgb(var(--warning))', descKey: 'discipline.modal.proposedActionPlaceholder' },
            { levelKey: 'discipline.level.severe', color: 'rgb(var(--error))', descKey: 'discipline.modal.proposedActionPlaceholder' },
          ].map(({ levelKey, color }) => (
            <div key={levelKey} className="rounded-lg border border-[rgb(var(--border))] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full" style={{ background: color }} />
                <span className="font-semibold text-[rgb(var(--text-primary))]">{t('discipline.modal.levelHeader')}: {t(levelKey)}</span>
              </div>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{t('discipline.modal.proposedActionPlaceholder')}</p>
            </div>
          ))}
          <div className="rounded-lg border border-[rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.04)] p-4 text-sm text-[rgb(var(--text-secondary))]">
            <p className="font-semibold text-[rgb(var(--text-primary))] mb-1">{t('discipline.modal.processTitle')}</p>
            <p>{t('discipline.modal.processStep1')}</p>
            <p>{t('discipline.modal.processStep2')}</p>
            <p>{t('discipline.modal.processStep3')}</p>
            <p>{t('discipline.modal.processStep4')}</p>
            <p>{t('discipline.modal.processStep5')}</p>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Detail */}
      <Modal open={chiTietOpen} onClose={() => setChiTietOpen(false)} title={t('discipline.modal.detailTitle')} size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setChiTietOpen(false)}>{t('discipline.btn.close')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => setChiTietOpen(false)}>{t('discipline.modal.downloadRecord')}</Button>
          </div>
        }>
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-lg font-bold text-white">
                {selectedItem.name.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedItem.name}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedItem.code} · {selectedItem.dept}</p>
              </div>
              <Badge variant={STATUS_CONFIG[selectedItem.status].variant} dot className="ml-auto">{t(STATUS_CONFIG[selectedItem.status].labelKey)}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('discipline.table.type'), value: t(TYPE_CONFIG[selectedItem.type]) },
                { label: t('discipline.table.level'), value: t(LEVEL_CONFIG[selectedItem.level].labelKey) },
                { label: t('discipline.table.date'), value: selectedItem.date },
                { label: t('discipline.modal.recordBy'), value: selectedItem.handler },
                { label: t('discipline.modal.dept'), value: selectedItem.handlerDept },
                { label: t('discipline.table.status'), value: t(STATUS_CONFIG[selectedItem.status].labelKey) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-36">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('discipline.modal.violationDesc')}</p>
              <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-sm text-[rgb(var(--text-secondary))]">
                {selectedItem.description}
              </div>
            </div>

            {selectedItem.nextSteps && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('discipline.modal.nextStep')}</p>
                <div className="rounded-lg border border-[rgb(var(--warning)/0.2)] bg-[rgb(var(--warning)/0.04)] p-3 text-sm text-[rgb(var(--text-secondary))]">
                  {selectedItem.nextSteps}
                </div>
              </div>
            )}

            {selectedItem.resolution && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('discipline.modal.result')}</p>
                <div className="rounded-lg border border-[rgb(var(--success)/0.2)] bg-[rgb(var(--success)/0.04)] p-3 text-sm text-[rgb(var(--text-secondary))]">
                  <p>{selectedItem.resolution}</p>
                  {selectedItem.resolvedAt && <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('discipline.modal.resolvedAt')}: {selectedItem.resolvedAt}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}