import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus, Download, CheckCircle2, AlertTriangle,
  FileText, Award,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import ReportDetail from './ReportDetail';

const REPORTS = [
  { id: 'r01', code: 'AUN-2026-01', title: 'Báo cáo tự đánh giá theo chuẩn AUN-QA (Cấp chương trình)', program: 'Công nghệ thông tin', standard: '6 tiêu chuẩn', dept: 'Khoa CNTT', status: 'in_progress', dueDate: '2026-09-30', progress: 45, evidenceCount: 124, lastUpdate: '2026-06-25', assignedTo: 'PGS.TS. Lý Văn Hùng' },
  { id: 'r02', code: 'AUN-2026-02', title: 'Báo cáo tự đánh giá theo chuẩn AUN-QA (Cấp chương trình)', program: 'Kinh tế', standard: '6 tiêu chuẩn', dept: 'Khoa Kinh tế', status: 'in_progress', dueDate: '2026-09-30', progress: 30, evidenceCount: 78, lastUpdate: '2026-06-20', assignedTo: 'PGS.TS. Hoàng Thị Lan' },
  { id: 'r03', code: 'AUN-2025-01', title: 'Báo cáo tự đánh giá AUN-QA lần 2', program: 'Công nghệ thông tin', standard: '11 tiêu chuẩn', dept: 'Khoa CNTT', status: 'submitted', dueDate: '2025-12-15', progress: 100, evidenceCount: 312, lastUpdate: '2025-12-10', assignedTo: 'GS.TS. Nguyễn Hoàng Long' },
  { id: 'r04', code: 'KIEMDINH-2024-03', title: 'Kiểm định chất lượng cơ sở giáo dục', program: 'Toàn trường', standard: 'Bộ GD&ĐT', dept: 'Phòng Khảo đảm bảo CL', status: 'not_started', dueDate: '2026-12-31', progress: 0, evidenceCount: 0, lastUpdate: '2026-01-15', assignedTo: 'TS. Thảo Nguyễn' },
  { id: 'r05', code: 'ISO-2026-01', title: 'Đánh giá nội bộ theo ISO 9001:2015', program: 'Toàn trường', standard: 'ISO 9001:2015', dept: 'Phòng Hành chính', status: 'in_progress', dueDate: '2026-08-31', progress: 65, evidenceCount: 198, lastUpdate: '2026-06-22', assignedTo: 'Chu Hanh' },
  { id: 'r06', code: 'AUN-2025-02', title: 'Kiểm định AUN-QA lần 1 ngành Luật', program: 'Luật', standard: '11 tiêu chuẩn', dept: 'Khoa Luật', status: 'external_assessed', dueDate: '2025-11-20', progress: 100, evidenceCount: 289, lastUpdate: '2025-11-18', assignedTo: 'TS. Bùi Đình Nam' },
];

export default function QAReportList() {
  const { t } = useTranslation('qa');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState('all');
  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });

  const selectedReport = selectedId ? REPORTS.find((r) => r.id === selectedId) : null;

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral' | 'error'; label: string }> = {
    submitted: { variant: 'success', label: t('report.status.submitted') },
    in_progress: { variant: 'warning', label: t('report.status.in_progress') },
    not_started: { variant: 'neutral', label: t('report.status.not_started') },
    external_assessed: { variant: 'info', label: t('report.status.external_assessed') },
  };

  const filtered = REPORTS.filter((r) => {
    const match = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'all' || r.dept === dept;
    const matchStatus = status === 'all' || r.status === status;
    return match && matchDept && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('report.title')}
        description={t('report.description')}
        breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: t('report.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/qa/bao-cao/tao')}>{t('report.create')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t('report.statTotal'), value: REPORTS.length, icon: <FileText className="h-5 w-5" />, color: 'primary' },
          { label: t('report.statInProgress'), value: REPORTS.filter(r => r.status === 'in_progress').length, icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' },
          { label: t('report.statSubmitted'), value: REPORTS.filter(r => r.status === 'submitted').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: t('report.statEvidence'), value: REPORTS.reduce((s, r) => s + r.evidenceCount, 0), icon: <Award className="h-5 w-5" />, color: 'accent' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 hover-lift">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('report.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('filter.all')}</option>
          {['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Phòng Khảo đảm bảo CL', 'Phòng Hành chính'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('filter.all')}</option>
          <option value="in_progress">{t('report.status.in_progress')}</option>
          <option value="submitted">{t('report.status.submitted')}</option>
          <option value="not_started">{t('report.status.not_started')}</option>
          <option value="external_assessed">{t('report.status.external_assessed')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('report.table.code')}</TableHeadCell>
            <TableHeadCell>{t('report.table.name')}</TableHeadCell>
            <TableHeadCell>{t('report.table.programUnit')}</TableHeadCell>
            <TableHeadCell>{t('report.table.standard')}</TableHeadCell>
            <TableHeadCell>{t('report.table.assignedTo')}</TableHeadCell>
            <TableHeadCell>{t('report.table.progress')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('report.table.evidence')}</TableHeadCell>
            <TableHeadCell>{t('report.table.lastUpdate')}</TableHeadCell>
            <TableHeadCell>{t('table.status')}</TableHeadCell>
            <TableHeadCell>{t('table.actions')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message={t('report.empty')} />
          ) : (
            paged.map((r) => {
              const sc = STATUS_CONFIG[r.status];
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{r.code}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="font-medium text-[rgb(var(--text-primary))] line-clamp-1">{r.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{r.program}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.dept}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.standard}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                        <div
                          className="h-full rounded-full bg-[rgb(var(--primary))] transition-all progress-fill"
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">{r.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{r.evidenceCount}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{r.lastUpdate}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(r.id)}>{t('table.view')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/qa/bao-cao/${r.id}/minh-chung`)}>{t('report.evidence')}</Button>
                    </div>
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

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedReport ? `${selectedReport.code} — Chi tiết` : ''}
        description={selectedReport ? selectedReport.title : ''}
        size="fullscreen"
      >
        {selectedId ? <ReportDetail id={selectedId} /> : null}
      </DetailModal>
    </div>
  );
}
