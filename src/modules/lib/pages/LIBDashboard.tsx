import {
  BookOpen,
  Search,
  Download,
  Plus,
  Star,
  AlertCircle,
  BookMarked,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LIB_STATS = [
  { label: 'Tổng tài liệu', value: '42,180', change: '+1,240', icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
  { label: 'Đang mượn', value: '1,847', sub: 'Tỷ lệ trả: 94.2%', icon: <BookMarked className="h-5 w-5" />, color: 'accent' },
  { label: 'Tài liệu số', value: '8,642', sub: '20.5% kho', icon: <BookOpen className="h-5 w-5" />, color: 'info' },
  { label: 'Overdue', value: '47', sub: '⚠️ cần nhắc nợ', icon: <AlertCircle className="h-5 w-5" />, color: 'error' },
];

const BORROW_CHART = [
  { month: 'T1', borrows: 620, returns: 580 },
  { month: 'T2', borrows: 710, returns: 695 },
  { month: 'T3', borrows: 540, returns: 560 },
  { month: 'T4', borrows: 820, returns: 790 },
  { month: 'T5', borrows: 760, returns: 740 },
  { month: 'T6', borrows: 680, returns: 710 },
];

const TOP_BOOKS = [
  { title: 'Introduction to Algorithms (CLRS)', copies: 8, available: 3, borrowed: 5, category: 'CNTT', rating: 4.9 },
  { title: 'Kinh tế học vi mô — NXB Tài chính', copies: 12, available: 7, borrowed: 5, category: 'Kinh tế', rating: 4.7 },
  { title: 'Giáo trình Luật Hiến pháp', copies: 15, available: 10, borrowed: 5, category: 'Luật', rating: 4.5 },
  { title: 'Oxford Advanced Learner\'s Dictionary', copies: 6, available: 2, borrowed: 4, category: 'NN', rating: 4.8 },
  { title: 'Giáo trình Vật lý Đại cương T1', copies: 20, available: 14, borrowed: 6, category: 'Khoa học', rating: 4.3 },
];

const OVERDUE_BOOKS = [
  { borrower: 'Nguyễn Văn An', book: 'CS101 — Python Crash Course', due: '2026-06-20', days: 5 },
  { borrower: 'Trần Thị Bình', book: 'ECON — Kinh tế vĩ mô', due: '2026-06-22', days: 3 },
  { borrower: 'Lê Hoàng Nam', book: 'MATH — Giải tích T2', due: '2026-06-18', days: 7 },
];

export default function LIBDashboard() {
  const { t } = useTranslation('lib');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'LIB' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('addDocument')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {LIB_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.label === 'Tổng tài liệu' ? 'dashboard.totalDocuments' : s.label === 'Đang mượn' ? 'dashboard.borrowed' : s.label === 'Tài liệu số' ? 'dashboard.digitalDocuments' : 'dashboard.overdue')}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? t('dashboard.returnRate') + ': ' + '94.2%'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top books */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.topBooks')}</h3>
            <Button variant="outline" size="sm" leftIcon={<Search className="h-3.5 w-3.5" />}>{t('search.title')}</Button>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {TOP_BOOKS.map((book, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{book.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="neutral" size="sm">{book.category}</Badge>
                    <span className="text-xs text-[rgb(var(--text-muted))]">{book.available}/{book.copies} còn</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{book.rating}</span>
                </div>
                <Button variant="outline" size="sm">{t('loan.title')}</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Overdue */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[rgb(var(--error))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.overdueBooks')}</h3>
            </div>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {OVERDUE_BOOKS.map((item, i) => (
              <div key={i} className="px-5 py-3">
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.borrower}</p>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{item.book}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.dueDate')}: {item.due}</span>
                  <Badge variant="error" size="sm">+{item.days} {t('dashboard.days')}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4 pt-2">
            <Button variant="outline" size="sm" fullWidth>{t('dashboard.needReminder')}</Button>
          </div>
        </Card>
      </div>

      {/* Borrow chart */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.borrowReturn')}</h3>
        </div>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BORROW_CHART} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="borrows" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.borrows')} />
              <Bar dataKey="returns" fill="rgb(var(--success))" radius={[4, 4, 0, 0]} name={t('dashboard.returns')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
