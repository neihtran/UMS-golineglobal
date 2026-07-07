import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Plus, BookOpen, Star, Eye, BookMarked as BorrowIcon, CheckCircle2 } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce, useBookList } from '@/hooks';

const CATEGORY_COLORS: Record<string, string> = {
  'CNTT': 'primary',
  'Kinh tế': 'success',
  'Luật': 'warning',
  'Ngoại ngữ': 'accent',
  'Khoa học': 'info',
  'Y dược': 'error',
  'Chính trị': 'neutral',
  'Sư phạm': 'primary',
};

const STATUS_CONFIG = {
  available: { variant: 'success' as const, label: 'Có sẵn' },
  borrowed: { variant: 'warning' as const, label: 'Đang mượn' },
  reserved: { variant: 'info' as const, label: 'Đã đặt' },
  lost: { variant: 'error' as const, label: 'Mất' },
};

export default function BookList() {
  const navigate = useNavigate();
  const [borrowModal, setBorrowModal] = useState<string | null>(null);
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useBookList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    categoryId: categoryFilter !== 'Tất cả' ? categoryFilter : undefined,
  });

  const books = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const uniqueCategories = [...new Set(books.map((b: any) => b.category).filter(Boolean))].sort();

  const getBookById = (id: string) => books.find((b) => b._id === id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tài liệu"
        description={`${total} đầu sách / tài liệu trong kho`}
        breadcrumbs={[{ label: 'LIB', href: '/lib' }, { label: 'Tài liệu' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/lib/tai-lieu/tao')}>Thêm tài liệu</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên, tác giả hoặc ISBN..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="Tất cả">Tất cả</option>
          {uniqueCategories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Có sẵn</option>
          <option value="borrowed">Đang mượn</option>
          <option value="reserved">Đã đặt</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Tài liệu</TableHeadCell>
            <TableHeadCell>Danh mục</TableHeadCell>
            <TableHeadCell>ISBN</TableHeadCell>
            <TableHeadCell>Vị trí</TableHeadCell>
            <TableHeadCell className="text-right">Tổng</TableHeadCell>
            <TableHeadCell className="text-right">Còn lại</TableHeadCell>
            <TableHeadCell>Đánh giá</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        {isLoading ? (
          <TableSkeleton rows={pagination.pageSize} colSpan={9} />
        ) : (
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-sm text-[rgb(var(--text-muted))]">Không tìm thấy tài liệu nào</TableCell>
              </TableRow>
            ) : (
              books.map((b) => {
                const sc = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.available;
                return (
                  <TableRow key={b._id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                          <BookOpen className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))] max-w-[240px] truncate">{b.title}</p>
                          <p className="text-[10px] text-[rgb(var(--text-muted))]">{b.authorNames?.join(', ') || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={CATEGORY_COLORS[b.categoryName ?? ''] as any || 'neutral'} size="sm">{b.categoryName ?? '—'}</Badge></TableCell>
                    <TableCell className="font-mono text-[10px] text-[rgb(var(--text-secondary))]">{b.isbn ?? '—'}</TableCell>
                    <TableCell className="text-xs text-[rgb(var(--text-secondary))] font-mono">{b.location ?? '—'}</TableCell>
                    <TableCell numeric className="text-[rgb(var(--text-secondary))]">{b.totalCopies}</TableCell>
                    <TableCell numeric>
                      <span className={`text-sm font-semibold ${b.availableCopies > 0 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'}`}>
                        {b.availableCopies}
                      </span>
                    </TableCell>
                    <TableCell>
                      {b.borrowCount > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{b.borrowCount.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                      )}
                    </TableCell>
                    <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/lib/tai-lieu/${b._id}`)}>Xem</Button>
                        {b.availableCopies > 0 && (
                          <Button variant="ghost" size="sm" leftIcon={<BorrowIcon className="h-3.5 w-3.5" />} onClick={() => setBorrowModal(b._id)}>Mượn</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        )}
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      {borrowModal && getBookById(borrowModal) && (
        <ListBorrowModal
          book={getBookById(borrowModal)!}
          onClose={() => setBorrowModal(null)}
        />
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookItem = any;

interface ListBorrowModalProps {
  book: BookItem;
  onClose: () => void;
}

function ListBorrowModal({ book, onClose }: ListBorrowModalProps) {
  const [form, setForm] = useState({ studentCode: '', studentName: '', class: '', dueDate: '' });
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    setSaved(true);
    setTimeout(() => onClose(), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[rgb(var(--bg-card))] rounded-2xl p-6 w-[460px] shadow-2xl border border-[rgb(var(--border))]">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)]">
            <BorrowIcon className="h-6 w-6 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h3 className="font-bold text-[rgb(var(--text-primary))]">Mượn tài liệu</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 line-clamp-1">{book.title}</p>
          </div>
          <button onClick={onClose} className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors">
            ✕
          </button>
        </div>

        {step === 'form' ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mã sinh viên (*)</label>
              <input
                value={form.studentCode}
                onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                placeholder="VD: SV-2024-0001"
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Họ và tên (*)</label>
              <input
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="VD: Nguyễn Văn An"
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Lớp</label>
              <input
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                placeholder="VD: CNTT-2024"
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ngày hết hạn</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div className="rounded-lg border border-[rgb(var(--warning)/0.2)] bg-[rgb(var(--warning)/0.04)] p-3 text-xs text-[rgb(var(--text-secondary))">
              ⚠️ Thời gian mượn tối đa 14 ngày. Quá hạn sẽ bị phạt theo quy định thư viện.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
              <Button className="flex-1" onClick={() => setStep('confirm')}>Tiếp tục</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-[rgb(var(--success)/0.2)] bg-[rgb(var(--success)/0.04)] p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))]" />
                <h4 className="font-semibold text-[rgb(var(--text-primary))]">Xác nhận mượn</h4>
              </div>
              {[
                { label: 'Tài liệu', value: book.title },
                { label: 'Mã SV', value: form.studentCode || '—' },
                { label: 'Họ tên', value: form.studentName || '—' },
                { label: 'Lớp', value: form.class || '—' },
                { label: 'Hạn trả', value: form.dueDate || '14 ngày kể từ hôm nay' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary)] line-clamp-1">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>Quay lại</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saved}>
                {saved ? '✓ Đã xác nhận' : 'Xác nhận mượn'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
