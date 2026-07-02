import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Edit2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

type SubjectType = 'theory' | 'practice' | 'project' | 'internship';
type SubjectStatus = 'active' | 'inactive';

const MOCK_SUBJECTS = [
  { code: 'INT1005', name: 'Nhập môn Tin học', credits: 3, semester: 1, type: 'theory' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
  { code: 'INT2201', name: 'Cấu trúc dữ liệu', credits: 4, semester: 2, type: 'theory' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
  { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, semester: 3, type: 'theory' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
  { code: 'INT3201', name: 'Mạng máy tính', credits: 3, semester: 3, type: 'practice' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
  { code: 'INT3301', name: 'Lập trình hướng đối tượng', credits: 4, semester: 2, type: 'practice' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
  { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, semester: 5, type: 'theory' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
  { code: 'INT3501', name: 'An toàn thông tin', credits: 3, semester: 4, type: 'theory' as SubjectType, dept: 'Khoa CNTT', status: 'inactive' as SubjectStatus },
  { code: 'INT4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8, type: 'project' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
  { code: 'GEN1011', name: 'Toán cao cấp A1', credits: 4, semester: 1, type: 'theory' as SubjectType, dept: 'Khoa Khoa học', status: 'active' as SubjectStatus },
  { code: 'GEN1012', name: 'Tiếng Anh A1', credits: 3, semester: 1, type: 'practice' as SubjectType, dept: 'Khoa Ngoại ngữ', status: 'active' as SubjectStatus },
  { code: 'GEN2011', name: 'Xác suất thống kê', credits: 3, semester: 3, type: 'theory' as SubjectType, dept: 'Khoa Khoa học', status: 'active' as SubjectStatus },
  { code: 'INT4002', name: 'Thực tập tốt nghiệp', credits: 5, semester: 8, type: 'internship' as SubjectType, dept: 'Khoa CNTT', status: 'active' as SubjectStatus },
];

const TYPE_CONFIG: Record<SubjectType, { variant: 'info' | 'accent' | 'warning' | 'primary'; labelKey: string }> = {
  theory: { variant: 'info', labelKey: 'subject.type.lyThuyet' },
  practice: { variant: 'accent', labelKey: 'subject.type.thucHanh' },
  project: { variant: 'warning', labelKey: 'subject.type.doAn' },
  internship: { variant: 'primary', labelKey: 'subject.type.thucTap' },
};

const TYPE_LABELS: Record<string, string> = {
  'theory': 'Lý thuyết',
  'practice': 'Thực hành',
  'project': 'Đồ án',
  'internship': 'Thực tập',
};

const DEPARTMENTS = ['Tất cả', 'Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Khoa Khoa học'];
const TYPE_OPTIONS = ['Tất cả', 'Lý thuyết', 'Thực hành', 'Đồ án', 'Thực tập'];

export default function SubjectList() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('Tất cả');
  const [type, setType] = useState('Tất cả');

  const filtered = MOCK_SUBJECTS.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'Tất cả' || s.dept === dept;
    const typeLabel = TYPE_LABELS[s.type];
    const matchType = type === 'Tất cả' || typeLabel === type;
    return matchSearch && matchDept && matchType;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('subject.title')}
        description={t('subject.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.breadcrumb.list'), href: '/sis/chuong-trinh-dao-tao' },
          { label: t('subject.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('subject.export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/sis/chuong-trinh-dao-tao/mon-hoc/tao'}>{t('subject.add')}</Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('subject.filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-64"
        />
        <select
          value={dept}
          onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          {TYPE_OPTIONS.map((tOpt) => <option key={tOpt}>{tOpt}</option>)}
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('subject.table.maMon')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.tenMon')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.tinChi')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.hocKy')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.loai')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.khoaPhuTrach')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={8} message={t('subject.empty.title')} />
          ) : (
            paged.map((s) => {
              const tc = TYPE_CONFIG[s.type];
              return (
                <TableRow key={s.code}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{s.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.credits}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.semester}</TableCell>
                  <TableCell><Badge variant={tc.variant} size="sm">{t(tc.labelKey)}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.dept}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                      {s.status === 'active' ? t('subject.status.active') : t('subject.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/sis/chuong-trinh-dao-tao/mon-hoc/${s.code}`)}>{t('subject.action.xem')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => navigate(`/sis/chuong-trinh-dao-tao/mon-hoc/${s.code}/sua`)}>{t('subject.action.sua')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
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
    </div>
  );
}
