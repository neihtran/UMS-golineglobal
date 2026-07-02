import { useState } from 'react';
import { Plus, Eye, Copy, FileText, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const QUESTIONS = [
  { id: 'q01', content: 'Trong mô hình OSI, tầng nào chịu trách nhiệm mã hóa dữ liệu?', type: 'multiple_choice', difficulty: 'medium', subject: 'Mạng máy tính', course: 'INT3201', usageCount: 12, createdBy: 'Phạm Thu Hà', createdAt: '2026-05-15', status: 'active', correctAnswer: 'Tầng 6 (Presentation)' },
  { id: 'q02', content: 'Thuật toán sắp xếp nào có độ phức tạp trung bình O(n log n)?', type: 'multiple_choice', difficulty: 'medium', subject: 'Cấu trúc dữ liệu', course: 'INT2201', usageCount: 24, createdBy: 'Trần Thị Mai Lan', createdAt: '2026-05-10', status: 'active', correctAnswer: 'Merge Sort' },
  { id: 'q03', content: 'SQL Injection là gì và cách phòng chống?', type: 'essay', difficulty: 'hard', subject: 'An toàn thông tin', course: 'INT4001', usageCount: 8, createdBy: 'Nguyễn Hoàng Long', createdAt: '2026-04-20', status: 'active', correctAnswer: null },
  { id: 'q04', content: 'Mô tả các bước trong quy trình xác thực ba bước (Three-Way Handshake) của TCP.', type: 'essay', difficulty: 'hard', subject: 'Mạng máy tính', course: 'INT3201', usageCount: 15, createdBy: 'Phạm Thu Hà', createdAt: '2026-03-28', status: 'active', correctAnswer: null },
  { id: 'q05', content: 'Giao thức HTTP hoạt động ở tầng nào trong mô hình TCP/IP?', type: 'true_false', difficulty: 'easy', subject: 'Mạng máy tính', course: 'INT3201', usageCount: 31, createdBy: 'Phạm Thu Hà', createdAt: '2026-05-01', status: 'active', correctAnswer: 'True' },
  { id: 'q06', content: 'Cho mảng [3, 1, 4, 1, 5, 9]. Kết quả sau khi sắp xếp tăng dần bằng thuật toán Quick Sort là gì?', type: 'fill_blank', difficulty: 'medium', subject: 'Cấu trúc dữ liệu', course: 'INT2201', usageCount: 7, createdBy: 'Trần Thị Mai Lan', createdAt: '2026-05-12', status: 'active', correctAnswer: '[1, 1, 3, 4, 5, 9]' },
  { id: 'q07', content: 'Khai báo con trỏ trong C++ đúng syntax là gì?', type: 'multiple_choice', difficulty: 'easy', subject: 'Lập trình C++', course: 'INT1005', usageCount: 45, createdBy: 'Nguyễn Hoàng Long', createdAt: '2026-04-15', status: 'inactive', correctAnswer: 'int* ptr;' },
];

export default function QuestionBankFull() {
  const { t } = useTranslation('exam');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');

  const TYPE_CONFIG: Record<string, { variant: 'info' | 'warning' | 'accent' | 'primary'; label: string; icon: React.ReactNode }> = {
    multiple_choice: { variant: 'info', label: t('type.multiple_choice'), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    essay: { variant: 'warning', label: t('type.essay'), icon: <FileText className="h-3.5 w-3.5" /> },
    true_false: { variant: 'accent', label: t('type.true_false'), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    fill_blank: { variant: 'primary', label: t('type.fill_blank'), icon: <HelpCircle className="h-3.5 w-3.5" /> },
  };

  const DIFF_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
    easy: { variant: 'success', label: t('difficulty.easy') },
    medium: { variant: 'warning', label: t('difficulty.medium') },
    hard: { variant: 'error', label: t('difficulty.hard') },
  };

  const STATUS_LABEL = {
    active: t('status.active'),
    inactive: t('status.inactive'),
  };

  const filtered = QUESTIONS.filter((q) => {
    const match = !search || q.content.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'all' || q.type === type;
    const matchDiff = difficulty === 'all' || q.difficulty === difficulty;
    const matchStatus = status === 'all' || q.status === status;
    return match && matchType && matchDiff && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('questionBankFull.title')}
        description={t('questionBankFull.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard'), href: '/exam' }, { label: t('breadcrumb.questionBankFull') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>{t('common.import')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('questionBankFull.addQuestion')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: t('questionBankFull.stats.total'), value: QUESTIONS.length, color: 'primary' },
          { label: t('questionBankFull.stats.multipleChoice'), value: QUESTIONS.filter(q => q.type === 'multiple_choice').length, color: 'info' },
          { label: t('questionBankFull.stats.essay'), value: QUESTIONS.filter(q => q.type === 'essay').length, color: 'warning' },
          { label: t('questionBankFull.stats.fillBlank'), value: QUESTIONS.filter(q => q.type === 'fill_blank').length, color: 'accent' },
          { label: t('questionBankFull.stats.trueFalse'), value: QUESTIONS.filter(q => q.type === 'true_false').length, color: 'neutral' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('common.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('common.allType')}</option>
          <option value="multiple_choice">{t('type.multiple_choice')}</option>
          <option value="essay">{t('type.essay')}</option>
          <option value="true_false">{t('type.true_false')}</option>
          <option value="fill_blank">{t('type.fill_blank')}</option>
        </select>
        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('questionBankFull.filter.difficulty')}</option>
          <option value="easy">{t('difficulty.easy')}</option>
          <option value="medium">{t('difficulty.medium')}</option>
          <option value="hard">{t('difficulty.hard')}</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('common.all')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="inactive">{t('status.inactive')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('questionBankFull.table.content')}</TableHeadCell>
            <TableHeadCell>{t('questionBankFull.table.subject')}</TableHeadCell>
            <TableHeadCell>{t('questionBankFull.table.type')}</TableHeadCell>
            <TableHeadCell>{t('questionBankFull.table.difficulty')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('questionBankFull.table.usage')}</TableHeadCell>
            <TableHeadCell>{t('questionBankFull.table.createdBy')}</TableHeadCell>
            <TableHeadCell>{t('questionBankFull.table.createdAt')}</TableHeadCell>
            <TableHeadCell>{t('common.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('common.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message={t('questionBankFull.empty.title')} />
          ) : (
            paged.map((q) => {
              const tc = TYPE_CONFIG[q.type];
              const dc = DIFF_CONFIG[q.difficulty];
              return (
                <TableRow key={q.id}>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-[rgb(var(--text-primary))] line-clamp-2">{q.content}</p>
                    {q.correctAnswer && (
                      <p className="text-xs text-[rgb(var(--success))] mt-1">{t('questionBankFull.table.correctAnswer')}: {q.correctAnswer}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{q.subject}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{q.course}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tc.variant} size="sm">{tc.label}</Badge>
                  </TableCell>
                  <TableCell><Badge variant={dc.variant} size="sm">{dc.label}</Badge></TableCell>
                  <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{q.usageCount}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{q.createdBy}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{q.createdAt}</TableCell>
                  <TableCell><Badge variant={q.status === 'active' ? 'success' : 'neutral'} dot size="sm">{STATUS_LABEL[q.status as keyof typeof STATUS_LABEL] || q.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>{t('common.view')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />}>{t('common.copy')}</Button>
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
