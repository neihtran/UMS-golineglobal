import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const QUESTIONS = [
  { id: 'q2', course: 'CS101', type: 'multiple_choice', content: 'Kết quả của len([1, [2, 3], 4]) là bao nhiêu?', difficulty: 'medium', tags: ['Python', 'Built-in'], usage: 8, score: 1, status: 'active' },
  { id: 'q3', course: 'CS101', type: 'essay', content: 'Giải thích sự khác nhau giữa list và tuple trong Python. Cho ví dụ minh họa.', difficulty: 'hard', tags: ['Python', 'Data types', 'Advanced'], usage: 5, score: 3, status: 'active' },
  { id: 'q4', course: 'MATH201', type: 'true_false', content: 'Hàm f(x) = x^3 là hàm chẵn.', difficulty: 'easy', tags: ['Calculus', 'Functions'], usage: 15, score: 0.5, status: 'active' },
  { id: 'q5', course: 'MATH201', type: 'multiple_choice', content: 'Đạo hàm của sin(x) theo x là gì?', difficulty: 'easy', tags: ['Derivative', 'Trigonometry'], usage: 18, score: 1, status: 'active' },
  { id: 'q6', course: 'ENG301', type: 'fill_blank', content: 'Complete: The meeting ___ (start) at 9 AM yesterday.', difficulty: 'medium', tags: ['Grammar', 'Tense'], usage: 7, score: 1, status: 'draft' },
  { id: 'q7', course: 'CS101', type: 'multiple_choice', content: 'Output của print(type([])) là gì?', difficulty: 'easy', tags: ['Python', 'OOP'], usage: 10, score: 1, status: 'active' },
  { id: 'q8', course: 'PHYS101', type: 'multiple_choice', content: 'Định luật Newton thứ hai: F = ?', difficulty: 'medium', tags: ['Mechanics', 'Newton'], usage: 20, score: 1, status: 'active' },
];

export default function QuestionBank() {
  const { t } = useTranslation('exam');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('Tất cả');
  const [difficulty, setDifficulty] = useState('Tất cả');
  const [type, setType] = useState('Tất cả');

  const DIFFICULTY_CONFIG = {
    easy: { variant: 'success' as const, label: t('difficulty.easy') },
    medium: { variant: 'warning' as const, label: t('difficulty.medium') },
    hard: { variant: 'error' as const, label: t('difficulty.hard') },
  };

  const TYPE_CONFIG: Record<string, string> = {
    multiple_choice: t('type.multiple_choice'),
    essay: t('type.essay'),
    true_false: t('type.true_false'),
    fill_blank: t('type.fill_blank'),
  };

  const STATUS_CONFIG = {
    active: { variant: 'success' as const, label: t('status.active') },
    draft: { variant: 'neutral' as const, label: t('status.draft') },
    archived: { variant: 'warning' as const, label: t('status.archived') },
  };

  const filtered = QUESTIONS.filter((q) => {
    const matchSearch = !search || q.content.toLowerCase().includes(search.toLowerCase());
    const matchCourse = course === 'Tất cả' || q.course === course;
    const matchDiff = difficulty === 'Tất cả' || q.difficulty === difficulty;
    const matchType = type === 'Tất cả' || q.type === type;
    return matchSearch && matchCourse && matchDiff && matchType;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('questionBank.title')}
        description={t('questionBank.description')}
        breadcrumbs={[{ label: t('breadcrumb.dashboard'), href: '/exam' }, { label: t('breadcrumb.questionBank') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('common.export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/exam/ngan-hang-cau-hoi/them')}>{t('questionBank.addQuestion')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('questionBank.stats.total'), value: '2,847', icon: '❓', color: 'primary' },
          { label: t('questionBank.stats.multipleChoice'), value: '2,140', icon: '☑️', color: 'accent' },
          { label: t('questionBank.stats.essay'), value: '420', icon: '✍️', color: 'info' },
          { label: t('questionBank.stats.unused'), value: '187', icon: '📭', color: 'warning' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('common.searchPlaceholder')}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] w-64"
          />
        </div>
        <select value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]">
          {['Tất cả', 'CS101', 'MATH201', 'ENG301', 'PHYS101'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]">
          {['Tất cả', 'easy', 'medium', 'hard'].map(d => <option key={d}>{d === 'Tất cả' ? t('difficulty.all') : DIFFICULTY_CONFIG[d as keyof typeof DIFFICULTY_CONFIG]?.label}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]">
          {['Tất cả', 'multiple_choice', 'essay', 'true_false', 'fill_blank'].map(t_ => <option key={t_}>{t_ === 'Tất cả' ? t('common.allType') : TYPE_CONFIG[t_]}</option>)}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('questionBank.table.question')}</TableHeadCell>
            <TableHeadCell>{t('questionBank.table.course')}</TableHeadCell>
            <TableHeadCell>{t('questionBank.table.type')}</TableHeadCell>
            <TableHeadCell>{t('questionBank.table.difficulty')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('questionBank.table.score')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('questionBank.table.usageCount')}</TableHeadCell>
            <TableHeadCell>{t('questionBank.table.tags')}</TableHeadCell>
            <TableHeadCell>{t('common.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('common.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((q) => {
            const dc = DIFFICULTY_CONFIG[q.difficulty as keyof typeof DIFFICULTY_CONFIG];
            const sc = STATUS_CONFIG[q.status as keyof typeof STATUS_CONFIG];
            return (
              <TableRow key={q.id}>
                <TableCell className="max-w-[300px]">
                  <p className="text-sm text-[rgb(var(--text-primary))] line-clamp-2">{q.content}</p>
                </TableCell>
                <TableCell><Badge variant="primary" size="sm">{q.course}</Badge></TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{TYPE_CONFIG[q.type]}</TableCell>
                <TableCell><Badge variant={dc.variant} size="sm">{dc.label}</Badge></TableCell>
                <TableCell numeric className="font-mono">{q.score}</TableCell>
                <TableCell numeric className="text-[rgb(var(--text-secondary))]">{q.usage}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[140px]">
                    {q.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 text-[10px] text-[rgb(var(--text-muted))]">{tag}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/exam/ngan-hang-cau-hoi/${q.id}`)}>{t('common.view')}</Button>
                    <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => navigate(`/exam/ngan-hang-cau-hoi/${q.id}/sua`)}>{t('common.edit')}</Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
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
