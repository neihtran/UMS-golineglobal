import { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const GRADUATIONS = [
  { id: 'gr01', studentId: 'SV-2021-0045', studentName: 'Nguyễn Hoàng Minh', class: 'CNTT-K21', major: 'Công nghệ thông tin', graduationYear: 2025, gpa: 3.72, thesis: 'Nghiên cứu ứng dụng AI trong nhận diện hình ảnh y tế', thesisScore: 8.5, status: 'graduated', degree: 'Xuất sắc' },
  { id: 'gr02', studentId: 'SV-2021-0089', studentName: 'Trần Thị Lan Anh', class: 'KT-K21', major: 'Kinh tế', graduationYear: 2025, gpa: 3.45, thesis: 'Phân tích tác động của FDI đến tăng trưởng kinh tế Việt Nam', thesisScore: 8.2, status: 'graduated', degree: 'Giỏi' },
  { id: 'gr03', studentId: 'SV-2021-0112', studentName: 'Lê Văn Tuấn', class: 'LUAT-K21', major: 'Luật', graduationYear: 2025, gpa: 3.18, thesis: 'Thực trạng pháp luật về thương mại điện tử tại Việt Nam', thesisScore: 7.8, status: 'pending_review', degree: 'Khá' },
  { id: 'gr04', studentId: 'SV-2021-0203', studentName: 'Phạm Thị Hương', class: 'NN-K21', major: 'Ngôn ngữ Anh', graduationYear: 2025, gpa: 3.55, thesis: 'Phân tích sai lầm ngữ pháp trong tiếng Anh của sinh viên Việt Nam', thesisScore: 8.0, status: 'graduated', degree: 'Giỏi' },
  { id: 'gr05', studentId: 'SV-2021-0034', studentName: 'Bùi Đình Nam', class: 'CNTT-K21', major: 'Công nghệ thông tin', graduationYear: 2025, gpa: 2.15, thesis: 'Xây dựng hệ thống quản lý thư viện cho trường học', thesisScore: 5.5, status: 'not_met', degree: 'Trung bình' },
  { id: 'gr06', studentId: 'SV-2021-0078', studentName: 'Đặng Minh Châu', class: 'YD-K21', major: 'Y dược', graduationYear: 2025, gpa: 3.82, thesis: 'Đánh giá hiệu quả thuốc kháng sinh trong điều trị nhiễm khuẩn hô hấp', thesisScore: 9.0, status: 'graduated', degree: 'Xuất sắc' },
];

export default function GraduationList() {
  const { t } = useTranslation('sis');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [major, setMajor] = useState('Tất cả');
  const [status, setStatus] = useState('all');

  const filtered = GRADUATIONS.filter((g) => {
    const match = !search || g.studentName.toLowerCase().includes(search.toLowerCase()) || g.studentId.toLowerCase().includes(search.toLowerCase());
    const matchMajor = major === 'Tất cả' || g.major === major;
    const matchStatus = status === 'all' || g.status === status;
    return match && matchMajor && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; labelKey: string }> = {
    graduated: { variant: 'success', labelKey: 'graduation.status.graduated' },
    pending_review: { variant: 'warning', labelKey: 'graduation.status.pending_review' },
    not_met: { variant: 'error', labelKey: 'graduation.status.not_met' },
  };

  const STATS = [
    { labelKey: 'graduation.stats.eligible', value: 4, color: 'success' },
    { labelKey: 'graduation.stats.pending', value: 1, color: 'warning' },
    { labelKey: 'graduation.stats.notMet', value: 1, color: 'error' },
    { labelKey: 'graduation.stats.issued', value: 3, color: 'primary' },
  ];

  const DEGREE_COLOR: Record<string, string> = {
    'Xuất sắc': 'text-[rgb(var(--success))]',
    'Giỏi': 'text-[rgb(var(--primary))]',
    'Khá': 'text-[rgb(var(--info))]',
    'Trung bình': 'text-[rgb(var(--warning))]',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('graduation.title')}
        description={t('graduation.description')}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: t('graduation.breadcrumb.list') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('graduation.export')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('graduation.print')}</Button>
            <Button leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={() => window.location.href = '/sis/tot-nghiep/mo-dot'}>{t('graduation.add')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.labelKey)}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('graduation.filter.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={major} onChange={(e) => { setMajor(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          {['Tất cả', 'Công nghệ thông tin', 'Kinh tế', 'Luật', 'Ngôn ngữ Anh', 'Y dược'].map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('graduation.filter.allStatuses')}</option>
          <option value="graduated">{t('graduation.status.graduated')}</option>
          <option value="pending_review">{t('graduation.status.pending_review')}</option>
          <option value="not_met">{t('graduation.status.not_met')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('graduation.table.mssv')}</TableHeadCell>
            <TableHeadCell>{t('graduation.table.sinhVien')}</TableHeadCell>
            <TableHeadCell>{t('graduation.table.nganhLop')}</TableHeadCell>
            <TableHeadCell>{t('graduation.table.khoa')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('graduation.table.gpa')}</TableHeadCell>
            <TableHeadCell>{t('graduation.table.detai')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('graduation.table.diemLV')}</TableHeadCell>
            <TableHeadCell>{t('graduation.table.xeploai')}</TableHeadCell>
            <TableHeadCell>{t('graduation.table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('graduation.table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message={t('graduation.empty.title')} />
          ) : (
            paged.map((g) => {
              const sc = STATUS_CONFIG[g.status];
              return (
                <TableRow key={g.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{g.studentId}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{g.studentName}</TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{g.major}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{g.class}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{g.graduationYear}</TableCell>
                  <TableCell className="text-right font-semibold text-[rgb(var(--text-primary))]">{g.gpa.toFixed(2)}</TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-sm text-[rgb(var(--text-secondary))]" title={g.thesis}>{g.thesis}</p>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[rgb(var(--primary))]">{g.thesisScore.toFixed(1)}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-semibold ${DEGREE_COLOR[g.degree]}`}>{g.degree}</span>
                  </TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/sis/tot-nghiep/${g.id}`}>{t('graduation.table.xem')}</Button>
                      <Button variant="ghost" size="sm">{t('graduation.table.capBang')}</Button>
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
    </div>
  );
}
