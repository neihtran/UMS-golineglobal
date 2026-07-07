import { useMemo } from 'react';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useBookList,
  useBorrowRecordList,
  useOverdueBorrowRecords,
} from '@/hooks/useLib';
import type { Book, BorrowRecord } from '@/services/lib.service';

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

export default function LIBDashboard() {
  const { t } = useTranslation('lib');

  // Fetch books (with large pageSize for dashboard aggregates)
  const booksQuery = useBookList({ page: 1, pageSize: 200 });
  const books: Book[] = booksQuery.data?.data ?? [];

  // Fetch borrow records (returned ones for borrow/return trend)
  const borrowsAllQuery = useBorrowRecordList({ page: 1, pageSize: 500 });
  const allRecords: BorrowRecord[] = borrowsAllQuery.data?.data ?? [];

  // Overdue records (dedicated endpoint)
  const overdueQuery = useOverdueBorrowRecords();
  const overdueRecords: BorrowRecord[] = overdueQuery.data?.data ?? [];

  const borrowedRecords = useMemo(
    () => allRecords.filter((r: BorrowRecord) => r.status === 'borrowed'),
    [allRecords],
  );

  // Compute stats from real data
  const totalCopies = books.reduce((sum: number, b: Book) => sum + (b.totalCopies ?? 0), 0);
  const digitalBooks = books.filter(
    (b: Book) =>
      b.type === 'ebook' ||
      b.type === 'journal' ||
      b.type === 'thesis' ||
      b.type === 'newspaper',
  ).length;
  const totalBorrowed = borrowedRecords.length;
  const totalReturned = allRecords.filter((r: BorrowRecord) => r.status === 'returned').length;
  const totalCompleted = totalReturned + totalBorrowed;
  const returnRate =
    totalCompleted === 0
      ? 0
      : Math.round((totalReturned / totalCompleted) * 1000) / 10;

  const statCards = [
    {
      label: t('dashboard.totalDocuments'),
      value: totalCopies.toLocaleString('vi-VN'),
      sub: `${books.length} đầu sách`,
      icon: <BookOpen className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: t('dashboard.borrowed'),
      value: totalBorrowed.toLocaleString('vi-VN'),
      sub: `${t('dashboard.returnRate')}: ${returnRate}%`,
      icon: <BookMarked className="h-5 w-5" />,
      color: 'accent',
    },
    {
      label: t('dashboard.digitalDocuments'),
      value: digitalBooks.toLocaleString('vi-VN'),
      sub:
        books.length === 0
          ? '—'
          : `${Math.round((digitalBooks / books.length) * 1000) / 10}% kho`,
      icon: <BookOpen className="h-5 w-5" />,
      color: 'info',
    },
    {
      label: t('dashboard.overdue'),
      value: overdueRecords.length.toLocaleString('vi-VN'),
      sub: '⚠️ ' + t('dashboard.needReminder', 'cần nhắc nợ'),
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'error',
    },
  ];

  // Top books by borrowCount
  const topBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => (b.borrowCount ?? 0) - (a.borrowCount ?? 0))
      .slice(0, 5)
      .map((b) => ({
        id: b._id,
        title: b.title,
        copies: b.totalCopies ?? 0,
        available: b.availableCopies ?? 0,
        borrowed: (b.totalCopies ?? 0) - (b.availableCopies ?? 0),
        category: b.categoryName ?? '—',
        rating: 0,
      }));
  }, [books]);

  // Borrow/return trend grouped by month — last 6 months
  const borrowChart = useMemo(() => {
    const buckets: Record<string, { borrows: number; returns: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = { borrows: 0, returns: 0 };
    }
    allRecords.forEach((r: BorrowRecord) => {
      const d = r.borrowedDate ? new Date(r.borrowedDate) : null;
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) buckets[key].borrows += 1;
      const ret = r.actualReturnDate ?? r.returnedDate;
      if (ret) {
        const rd = new Date(ret);
        const rkey = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}`;
        if (buckets[rkey]) buckets[rkey].returns += 1;
      }
    });
    return Object.entries(buckets).map(([k, v]) => {
      const [, m] = k.split('-');
      return {
        month: MONTH_LABELS[Number(m) - 1] ?? m,
        borrows: v.borrows,
        returns: v.returns,
      };
    });
  }, [allRecords]);

  // Overdue list — display overdue reader & book
  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN') : '—';

  const calcOverdueDays = (due?: string) => {
    if (!due) return 0;
    const diff = Math.floor(
      (Date.now() - new Date(due).getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'LIB' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              {t('export')}
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              {t('addDocument')}
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                  {s.value}
                </p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top books */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
              {t('dashboard.topBooks')}
            </h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Search className="h-3.5 w-3.5" />}
            >
              {t('search.title')}
            </Button>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {booksQuery.isLoading ? (
              <p className="px-5 py-4 text-sm text-[rgb(var(--text-muted))]">
                {t('common:common.loading')}
              </p>
            ) : topBooks.length === 0 ? (
              <p className="px-5 py-4 text-sm text-[rgb(var(--text-muted))]">
                Chưa có dữ liệu sách
              </p>
            ) : (
              topBooks.map((book, i) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                      {book.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="neutral" size="sm">
                        {book.category}
                      </Badge>
                      <span className="text-xs text-[rgb(var(--text-muted))]">
                        {book.available}/{book.copies} còn
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">
                      {book.rating > 0 ? book.rating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('loan.title')}
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Overdue */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[rgb(var(--error))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                {t('dashboard.overdueBooks')}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {overdueQuery.isLoading ? (
              <p className="px-5 py-4 text-sm text-[rgb(var(--text-muted))]">
                {t('common:common.loading')}
              </p>
            ) : overdueRecords.length === 0 ? (
              <p className="px-5 py-4 text-sm text-[rgb(var(--text-muted))]">
                Không có sách quá hạn
              </p>
            ) : (
              overdueRecords.slice(0, 5).map((item: BorrowRecord) => (
                <div key={item._id} className="px-5 py-3">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                    {item.readerName ?? item.readerCode ?? item.readerId}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                    {item.bookTitle ?? item.bookBarcode ?? item.bookId}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {t('dashboard.dueDate')}: {formatDate(item.dueDate)}
                    </span>
                    <Badge variant="error" size="sm">
                      +{calcOverdueDays(item.dueDate)} {t('dashboard.days')}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 pb-4 pt-2">
            <Button variant="outline" size="sm" fullWidth>
              {t('dashboard.needReminder')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Borrow chart */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">
            {t('dashboard.borrowReturn')}
          </h3>
        </div>
        <CardContent className="h-64">
          {borrowChart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-[rgb(var(--text-muted))]">
              Chưa có dữ liệu mượn/trả
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={borrowChart}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--bg-card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="borrows"
                  fill="rgb(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard.borrows')}
                />
                <Bar
                  dataKey="returns"
                  fill="rgb(var(--success))"
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard.returns')}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
