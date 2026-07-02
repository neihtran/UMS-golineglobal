import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Search,
  Clock,
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

const SIGNED_DOCS = [
  { id: 's1', number: 'QĐ-2026-0156', title: 'Quyết định công nhận tốt nghiệp đợt 1/2026', signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-25 14:32', type: 'qđ', typeLabelKey: 'docType.qd', level: 'Trường', verifyCode: 'VBS-2026-00789' },
  { id: 's2', number: 'CV-2026-0231', title: 'Công văn về việc triển khai học kỳ 2 năm học 2025-2026', signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-24 09:15', type: 'cv', typeLabelKey: 'docType.cv', level: 'Trường', verifyCode: 'VBS-2026-00788' },
  { id: 's3', number: 'TB-2026-0112', title: 'Thông báo lịch thi học kỳ 2 năm học 2025-2026', signer: 'TS. Trần Thị Hương', signedAt: '2026-06-23 16:45', type: 'tb', typeLabelKey: 'docType.tb', level: 'Khoa', verifyCode: 'VBS-2026-00787' },
  { id: 's4', number: 'QĐ-2026-0155', title: 'Quyết định bổ nhiệm Trưởng khoa Công nghệ thông tin', signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-22 11:20', type: 'qđ', typeLabelKey: 'docType.qd', level: 'Trường', verifyCode: 'VBS-2026-00786' },
  { id: 's5', number: 'CV-2026-0228', title: 'Công văn về đăng ký đề tài NCKH cấp trường năm 2026', signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-21 08:30', type: 'cv', typeLabelKey: 'docType.cv', level: 'Trường', verifyCode: 'VBS-2026-00785' },
  { id: 's6', number: 'QĐ-2026-0154', title: 'Quyết định khen thưởng CBGV nhân ngày Nhà giáo Việt Nam 20/11', signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-20 15:00', type: 'qđ', typeLabelKey: 'docType.qd', level: 'Trường', verifyCode: 'VBS-2026-00784' },
  { id: 's7', number: 'CV-2026-0225', title: 'Công văn về việc thay đổi lịch thi cuối kỳ', signer: 'TS. Trần Thị Hương', signedAt: '2026-06-19 10:00', type: 'cv', typeLabelKey: 'docType.cv', level: 'Khoa', verifyCode: 'VBS-2026-00783' },
  { id: 's8', number: 'TT-2026-0034', title: 'Tờ trình đề nghị phê duyệt kinh phí mua sắm thiết bị', signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-18 14:00', type: 'tt', typeLabelKey: 'soanthaoMoi.typeTt', level: 'Trường', verifyCode: 'VBS-2026-00782' },
];

const TYPE_CONFIG: Record<string, { color: 'primary' | 'warning' | 'success' | 'neutral' }> = {
  qđ: { color: 'primary' },
  cv: { color: 'neutral' },
  tb: { color: 'warning' },
  tt: { color: 'success' },
};

const STATS_CONFIG = [
  { labelKey: 'signed.statsSignedWeek', value: '47', icon: '✅', color: 'success' },
  { labelKey: 'signed.statsVerifying', value: '3', icon: '⏳', color: 'warning' },
  { labelKey: 'signed.statsVerified', value: '1.248', icon: '🛡️', color: 'primary' },
  { labelKey: 'signed.statsArchived', value: '3.591', icon: '📁', color: 'neutral' },
] as const;

const TABLE_HEADERS = [
  'table.stt',
  'table.soVb',
  'common.title',
  'common.type',
  'signed.signerLevel',
  'common.signer',
  'common.signDate',
  'table.maXacMinh',
  'common.action',
] as const;

export default function SignedDocuments() {
  const { t } = useTranslation('dms');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = SIGNED_DOCS.filter((d) => {
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.number.toLowerCase().includes(search.toLowerCase()) ||
      d.verifyCode.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const paged = filtered.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('signed.title')}
        description={t('signed.description')}
        breadcrumbs={[{ label: 'DMS', href: '/dms' }, { label: t('signed.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('signed.exportExcel')}</Button>
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
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('signed.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
          leftIcon={<Search className="h-4 w-4" />}
        />
        <div className="flex gap-2">
          {[
            { id: 'all', labelKey: 'signed.filterAll' },
            { id: 'qđ', labelKey: 'docType.qd' },
            { id: 'cv', labelKey: 'docType.cv' },
            { id: 'tb', labelKey: 'docType.tb' },
            { id: 'tt', labelKey: 'soanthaoMoi.typeTt' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setTypeFilter(f.id); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                typeFilter === f.id
                  ? 'bg-[rgb(var(--primary))] text-white border-transparent'
                  : 'bg-white text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-hover))]'
              }`}
            >
              {f.id === 'all' ? t(f.labelKey) : t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

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
                <td colSpan={9} className="text-center py-12 text-[rgb(var(--text-muted))]">
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
                    <Badge variant={d.level === 'Trường' ? 'primary' : 'neutral'}>{d.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[rgb(var(--text-secondary))]">{d.signer}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      <span className="text-sm text-[rgb(var(--text-secondary))]">{d.signedAt}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] px-1.5 py-0.5 rounded font-mono text-[rgb(var(--text-muted))]">
                      {d.verifyCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dms/van-ban-da-ky/${d.id}`)}>{t('signed.view')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dms/van-ban-da-ky/${d.id}?verify=1`)}>{t('signed.verify')}</Button>
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
