import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Download, Plus } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
  Card,
  CardContent,
  Select,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const COMPLAINTS = [
  { id: 'kn001', code: 'KN-2026-001', student: 'Nguyễn Văn An', class: 'K60-CNTT', category: 'Giảng dạy', content: 'Giảng viên đến lớp muộn, giảng chưa đúng chương trình', date: '2026-06-20', status: 'processing', priority: 'high', handler: 'Phòng Đào tạo', response: 'Đang xử lý' },
  { id: 'kn002', code: 'KN-2026-002', student: 'Lê Thị Bình', class: 'K59-KT', category: 'Học phí', content: 'Lỗi tính học phí học kỳ 1, bị tính trùng môn học', date: '2026-06-18', status: 'resolved', priority: 'medium', handler: 'Phòng Tài chính', response: 'Đã điều chỉnh, hoàn trả 2.5 triệu đồng' },
  { id: 'kn003', code: 'KN-2026-003', student: 'Trần Văn Cường', class: 'K60-Luat', category: 'Cơ sở vật chất', content: 'Phòng học thiếu bảng, máy chiếu không hoạt động', date: '2026-06-15', status: 'pending', priority: 'medium', handler: 'Phòng HCNS', response: 'Chưa phản hồi' },
  { id: 'kn004', code: 'KN-2026-004', student: 'Phạm Thu Dung', class: 'K60-NN', category: 'Tuyển sinh', content: 'Thông tin tuyển sinh không đúng, gây hiểu lầm', date: '2026-06-12', status: 'resolved', priority: 'high', handler: 'Phòng Tuyển sinh', response: 'Đã cập nhật thông tin, gửi email xin lỗi' },
  { id: 'kn005', code: 'KN-2026-005', student: 'Hoàng Minh Tuấn', class: 'K61-CNTT', category: 'Ký túc xá', content: 'Wifi ký túc xá không hoạt động 3 ngày', date: '2026-06-10', status: 'processing', priority: 'low', handler: 'Phòng CNTT', response: 'Đang sửa chữa' },
];

const CATEGORIES_KEYS = ['all', 'teaching', 'tuition', 'facility', 'admission', 'dormitory', 'other'];

export default function ComplaintList() {
  const { t } = useTranslation('qa');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');

  const CATEGORIES = [t('filter.all'), t('complaint.cat.teaching'), t('complaint.cat.tuition'), t('complaint.cat.facility'), t('complaint.cat.admission'), t('complaint.cat.dormitory'), t('complaint.cat.other')];
  const PRIORITIES = [t('filter.all'), t('priority.high'), t('priority.medium'), t('priority.low')];

  const PRIORITY_VARIANTS: Record<string, 'error' | 'warning' | 'info'> = {
    high: 'error',
    medium: 'warning',
    low: 'info',
  };

  const STATUSES: Record<string, { variant: 'success' | 'warning' | 'info' | 'error'; label: string }> = {
    pending: { variant: 'info', label: t('complaint.status.pending') },
    processing: { variant: 'warning', label: t('complaint.status.processing') },
    resolved: { variant: 'success', label: t('complaint.status.resolved') },
    rejected: { variant: 'error', label: t('complaint.status.rejected') },
  };

  const CATEGORY_MAP: Record<string, string> = {
    'Giảng dạy': 'teaching',
    'Học phí': 'tuition',
    'Cơ sở vật chất': 'facility',
    'Tuyển sinh': 'admission',
    'Ký túc xá': 'dormitory',
    'Khác': 'other',
  };

  const filtered = COMPLAINTS.filter((c) => {
    const matchSearch = !search || c.content.toLowerCase().includes(search.toLowerCase()) || c.student.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || CATEGORY_MAP[c.category] === category;
    const matchPri = priority === 'all' || c.priority === priority;
    const matchStatus = status === 'all' || c.status === status;
    return matchSearch && matchCat && matchPri && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('complaint.title')}
        description={t('complaint.description')}
        breadcrumbs={[{ label: 'QA' }, { label: t('complaint.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('complaint.create')}</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input placeholder={t('complaint.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES_KEYS.map((k, i) => ({ value: k, label: CATEGORIES[i] }))} className="w-44" />
            <Select value={priority} onChange={(e) => setPriority(e.target.value)} options={['all', 'high', 'medium', 'low'].map((k, i) => ({ value: k, label: PRIORITIES[i] }))} className="w-36" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[
              { value: 'all', label: t('filter.all') },
              { value: 'pending', label: t('complaint.status.pending') },
              { value: 'processing', label: t('complaint.status.processing') },
              { value: 'resolved', label: t('complaint.status.resolved') },
              { value: 'rejected', label: t('complaint.status.rejected') },
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>{t('table.code')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.complainant')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.category')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.content')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.priority')}</TableHeadCell>
                <TableHeadCell>{t('table.date')}</TableHeadCell>
                <TableHeadCell>{t('complaint.table.handler')}</TableHeadCell>
                <TableHeadCell>{t('table.status')}</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmpty colSpan={9} message={t('complaint.empty')} />
              ) : (
                paged.map((c) => (
                  <TableRow key={c.id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{c.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.student}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{c.class}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{c.category}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-[rgb(var(--text-secondary))]">{c.content}</TableCell>
                    <TableCell><Badge variant={PRIORITY_VARIANTS[c.priority] ?? 'info'} size="sm">{t(`priority.${c.priority}`)}</Badge></TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{c.date}</TableCell>
                    <TableCell className="text-sm">{c.handler}</TableCell>
                    <TableCell><Badge variant={STATUSES[c.status]?.variant ?? 'neutral'} size="sm">{STATUSES[c.status]?.label}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => navigate(`/qa/khieu-nai/${c.id}`)}>{t('table.detail')}</Button></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </div>
  );
}
