import { useState } from 'react';
import {
  Search,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useTranslation } from 'react-i18next';

const ARCHIVED_DOCS = [
  { id: 'a1', number: 'QĐ-2025-0089', title: 'Quyết định công nhận tốt nghiệp đợt 2 năm học 2024-2025', type: 'qđ', typeLabelKey: 'docType.qd', from: 'Ban Giám hiệu', date: '2025-12-28', status: 'valid', statusLabelKey: 'search.statsValid', archiveCode: 'LTVB-2025-0089', archiveDate: '2025-12-30' },
  { id: 'a2', number: 'CV-2025-1890', title: 'Công văn về việc triển khai học kỳ 1 năm học 2025-2026', type: 'cv', typeLabelKey: 'docType.cv', from: 'Phòng Đào tạo', date: '2025-08-15', status: 'valid', statusLabelKey: 'search.statsValid', archiveCode: 'LTVB-2025-0456', archiveDate: '2025-08-20' },
  { id: 'a3', number: 'QĐ-2025-0045', title: 'Quyết định bổ nhiệm Phó Trưởng khoa Ngoại ngữ', type: 'qđ', typeLabelKey: 'docType.qd', from: 'Ban Giám hiệu', date: '2025-06-10', status: 'expired', statusLabelKey: 'search.statsExpired', archiveCode: 'LTVB-2025-0234', archiveDate: '2025-06-15' },
  { id: 'a4', number: 'TB-2025-0078', title: 'Thông báo lịch thi học kỳ 1 năm học 2024-2025', type: 'tb', typeLabelKey: 'docType.tb', from: 'Phòng Đào tạo', date: '2025-01-05', status: 'expired', statusLabelKey: 'search.statsExpired', archiveCode: 'LTVB-2025-0012', archiveDate: '2025-01-10' },
  { id: 'a5', number: 'CV-2024-2345', title: 'Công văn về việc thanh toán học phí học kỳ 2 năm học 2023-2024', type: 'cv', typeLabelKey: 'docType.cv', from: 'Phòng Tài chính', date: '2024-12-20', status: 'expired', statusLabelKey: 'search.statsExpired', archiveCode: 'LTVB-2024-0789', archiveDate: '2024-12-25' },
  { id: 'a6', number: 'QĐ-2024-0112', title: 'Quyết định khen thưởng tập thể và cá nhân xuất sắc năm học 2023-2024', type: 'qđ', typeLabelKey: 'docType.qd', from: 'Ban Giám hiệu', date: '2024-11-15', status: 'valid', statusLabelKey: 'search.statsValid', archiveCode: 'LTVB-2024-0567', archiveDate: '2024-11-20' },
  { id: 'a7', number: 'TT-2024-0023', title: 'Tờ trình đề nghị phê duyệt đề cương NCKH cấp trường', type: 'tt', typeLabelKey: 'soanthaoMoi.typeTt', from: 'Khoa Khoa học', date: '2024-10-01', status: 'expired', statusLabelKey: 'search.statsExpired', archiveCode: 'LTVB-2024-0345', archiveDate: '2024-10-05' },
  { id: 'a8', number: 'CV-2024-1890', title: 'Công văn về việc nghỉ lễ 02/09 và 20/10/2024', type: 'cv', typeLabelKey: 'docType.cv', from: 'Phòng Hành chính', date: '2024-08-25', status: 'expired', statusLabelKey: 'search.statsExpired', archiveCode: 'LTVB-2024-0234', archiveDate: '2024-08-28' },
];

const TYPE_CONFIG: Record<string, { color: 'primary' | 'warning' | 'success' | 'neutral' }> = {
  qđ: { color: 'primary' },
  cv: { color: 'neutral' },
  tb: { color: 'warning' },
  tt: { color: 'success' },
};

const STATS_CONFIG = [
  { labelKey: 'search.statsTotal', value: '3.591', icon: '📁', color: 'primary' },
  { labelKey: 'search.statsValid', value: '2.134', icon: '✅', color: 'success' },
  { labelKey: 'search.statsExpired', value: '1.457', icon: '❌', color: 'error' },
  { labelKey: 'search.statsVerified', value: '3.412', icon: '🛡️', color: 'neutral' },
] as const;

const TABLE_HEADERS = [
  'table.stt',
  'table.soVb',
  'common.title',
  'common.type',
  'table.ngayVb',
  'table.hienVanBan',
  'table.maLuuTru',
  'common.action',
] as const;

const VALIDITY_OPTIONS = [
  { id: 'all', labelKey: 'search.filterAll' },
  { id: 'valid', labelKey: 'search.filterValid' },
  { id: 'expired', labelKey: 'search.filterExpired' },
] as const;

const TYPE_FILTER_OPTIONS = [
  { id: 'all', labelKey: 'search.filterAll' },
  { id: 'qđ', labelKey: 'docType.qd' },
  { id: 'cv', labelKey: 'docType.cv' },
  { id: 'tb', labelKey: 'docType.tb' },
  { id: 'tt', labelKey: 'soanthaoMoi.typeTt' },
] as const;

export default function DocSearch() {
  const { t } = useTranslation('dms');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const filtered = ARCHIVED_DOCS.filter((d) => {
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.number.toLowerCase().includes(search.toLowerCase()) ||
      d.archiveCode.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchYear = yearFilter === 'all' || d.date.startsWith(yearFilter);
    return matchSearch && matchType && matchStatus && matchYear;
  });

  const paged = filtered.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('search.title')}
        description={t('search.description')}
        breadcrumbs={[{ label: 'DMS', href: '/dms' }, { label: t('search.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('search.exportResult')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS_CONFIG.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.labelKey)}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              placeholder={t('search.searchPlaceholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              wrapperClassName="w-80"
              leftIcon={<Search className="h-4 w-4" />}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[rgb(var(--text-muted))]">{t('search.filterType')}:</span>
              {TYPE_FILTER_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setTypeFilter(f.id); setPage(1); }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    typeFilter === f.id
                      ? 'bg-[rgb(var(--primary))] text-white border-transparent'
                      : 'bg-white text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-hover))]'
                  }`}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[rgb(var(--text-muted))]">{t('table.hieuLuc')}:</span>
              {VALIDITY_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setStatusFilter(s.id); setPage(1); }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    statusFilter === s.id
                      ? 'bg-[rgb(var(--primary))] text-white border-transparent'
                      : 'bg-white text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-hover))]'
                  }`}
                >
                  {t(s.labelKey)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[rgb(var(--text-muted))]">{t('search.filterYear')}:</span>
              <select
                value={yearFilter}
                onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                className="text-xs border border-[rgb(var(--border))] rounded-lg px-2.5 py-1.5 bg-white text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--border-focus))]"
              >
                <option value="all">{t('search.filterAll')}</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              {TABLE_HEADERS.map((h, i) => (
                <TableHeadCell key={h}>{i === TABLE_HEADERS.length - 1 ? '' : t(h)}</TableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[rgb(var(--text-muted))]">
                  {t('empty.noResults')}
                </td>
              </tr>
            ) : (
              paged.map((d, i) => (
                <TableRow key={d.id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-medium text-[rgb(var(--primary))]">{d.number}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[rgb(var(--text-primary))] line-clamp-2">{d.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TYPE_CONFIG[d.type].color}>{t(d.typeLabelKey)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      <span className="text-sm text-[rgb(var(--text-secondary))]">{d.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={d.status === 'valid' ? 'success' : 'error'}
                      className="gap-1"
                    >
                      {d.status === 'valid' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {t(d.statusLabelKey)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] px-1.5 py-0.5 rounded font-mono text-[rgb(var(--text-muted))]">
                      {d.archiveCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>{t('search.view')}</Button>
                      <Button variant="ghost" size="sm">{t('search.print')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Card>
    </div>
  );
}
