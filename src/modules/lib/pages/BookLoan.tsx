import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, BookOpen, CheckCircle2,
  AlertTriangle, RefreshCw,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import LoanDetailPage from './LoanDetailPage';

const LOANS = [
  { id: 'l01', bookCode: 'ISBN-978-030640615', bookTitle: 'Artificial Intelligence: A Modern Approach', borrower: 'Nguyễn Văn An', borrowerId: 'SV-2024-0142', class: 'CNTT-K24', borrowDate: '2026-06-10', dueDate: '2026-06-25', returnDate: null, status: 'overdue', librarian: 'Nguyễn Thị Bích' },
  { id: 'l02', bookCode: 'ISBN-978-026203384', bookTitle: 'Introduction to Algorithms', borrower: 'Trần Thu Hà', borrowerId: 'SV-2024-0167', class: 'CNTT-K24', borrowDate: '2026-06-12', dueDate: '2026-06-27', returnDate: null, status: 'active', librarian: 'Nguyễn Thị Bích' },
  { id: 'l03', bookCode: 'ISBN-978-013235088', bookTitle: 'Clean Code: A Handbook of Agile Software', borrower: 'Lê Đình Phong', borrowerId: 'SV-2023-0211', class: 'KT-K23', borrowDate: '2026-06-05', dueDate: '2026-06-20', returnDate: '2026-06-18', status: 'returned_late', librarian: 'Trần Văn Minh' },
  { id: 'l04', bookCode: 'ISBN-978-059600712', bookTitle: 'Head First Design Patterns', borrower: 'Phạm Thị Lan', borrowerId: 'SV-2024-0089', class: 'LUAT-K24', borrowDate: '2026-06-15', dueDate: '2026-06-30', returnDate: null, status: 'active', librarian: 'Nguyễn Thị Bích' },
  { id: 'l05', bookCode: 'ISBN-978-020163361', bookTitle: 'Design Patterns: Elements of Reusable Software', borrower: 'Bùi Hoàng Nam', borrowerId: 'SV-2023-0304', class: 'NN-K23', borrowDate: '2026-06-08', dueDate: '2026-06-23', returnDate: '2026-06-22', status: 'returned_on_time', librarian: 'Trần Văn Minh' },
  { id: 'l06', bookCode: 'ISBN-978-032112521', bookTitle: 'Domain-Driven Design: Tackling Complexity', borrower: 'Đặng Minh Châu', borrowerId: 'SV-2024-0056', class: 'CNTT-K24', borrowDate: '2026-06-01', dueDate: '2026-06-16', returnDate: null, status: 'overdue', librarian: 'Trần Văn Minh' },
  { id: 'l07', bookCode: 'ISBN-978-149195035', bookTitle: 'Building Microservices', borrower: 'Hoàng Văn Sơn', borrowerId: 'SV-2022-0178', class: 'CNTT-K22', borrowDate: '2026-06-20', dueDate: '2026-07-05', returnDate: null, status: 'active', librarian: 'Nguyễn Thị Bích' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  active: { variant: 'info', label: 'Đang mượn' },
  overdue: { variant: 'error', label: 'Quá hạn' },
  returned_on_time: { variant: 'success', label: 'Đã trả (đúng hạn)' },
  returned_late: { variant: 'warning', label: 'Đã trả (trễ)' },
};

export default function BookLoan() {
  const navigate = useNavigate();
  const [returnModal, setReturnModal] = useState<string | null>(null);
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedLoan = selectedId ? LOANS.find((l) => l.id === selectedId) : null;

  const filtered = LOANS.filter((l) => {
    const match = !search || l.bookTitle.toLowerCase().includes(search.toLowerCase()) || l.borrower.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || l.status === status;
    return match && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const overdueCount = LOANS.filter(l => l.status === 'overdue').length;
  const activeCount = LOANS.filter(l => l.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Mượn & Trả sách"
        description="LIB-01 — Quản lý mượn trả sách, theo dõi quá hạn và phí phạt"
        breadcrumbs={[{ label: 'LIB', href: '/lib' }, { label: 'Mượn trả' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/lib/muon/tao')}>Mượn sách mới</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Đang mượn', value: activeCount, icon: <BookOpen className="h-5 w-5" />, color: 'info' },
          { label: 'Quá hạn', value: overdueCount, icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
          { label: 'Tổng mượn tháng', value: LOANS.length, icon: <RefreshCw className="h-5 w-5" />, color: 'primary' },
          { label: 'Đã trả tháng', value: LOANS.filter(l => l.returnDate).length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 hover-lift">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Tìm theo tên sách, người mượn..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả</option>
          <option value="active">Đang mượn</option>
          <option value="overdue">Quá hạn</option>
          <option value="returned_on_time">Đã trả (đúng hạn)</option>
          <option value="returned_late">Đã trả (trễ)</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Người mượn</TableHeadCell>
            <TableHeadCell>Lớp / MSSV</TableHeadCell>
            <TableHeadCell>Tên sách</TableHeadCell>
            <TableHeadCell>Ngày mượn</TableHeadCell>
            <TableHeadCell>Ngày hết hạn</TableHeadCell>
            <TableHeadCell>Ngày trả</TableHeadCell>
            <TableHeadCell>Người ghi nhận</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message="Không tìm thấy phiếu mượn nào" />
          ) : (
            paged.map((l) => {
              const sc = STATUS_CONFIG[l.status];
              const overdue = l.status === 'overdue';
              return (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{l.borrower}</TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{l.class}</p>
                    <p className="font-mono text-xs text-[rgb(var(--text-muted))]">{l.borrowerId}</p>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-[rgb(var(--text-primary))] truncate">{l.bookTitle}</p>
                    <p className="font-mono text-xs text-[rgb(var(--text-muted))]">{l.bookCode}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{l.borrowDate}</TableCell>
                  <TableCell className={overdue ? 'text-red-500 font-semibold' : 'text-[rgb(var(--text-secondary))]'}>
                    <div className="flex items-center gap-1">
                      {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                      {l.dueDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    {l.returnDate ? (
                      <span className="text-sm text-[rgb(var(--success))]">{l.returnDate}</span>
                    ) : (
                      <span className="text-sm text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{l.librarian}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    {l.returnDate ? (
                      <Button variant="ghost" size="sm" onClick={() => openDetail(l.id)}>Chi tiết</Button>
                    ) : (
                      <Button variant="ghost" size="sm" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => setReturnModal(l.id)}>Trả sách</Button>
                    )}
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

      {returnModal && (
        <LoanReturnModal
          loan={LOANS.find((l) => l.id === returnModal)!}
          onClose={() => setReturnModal(null)}
        />
      )}

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedLoan ? selectedLoan.bookTitle : ''}
        description={selectedLoan ? `${selectedLoan.borrower} · ${selectedLoan.borrowerId}` : ''}
        size="fullscreen"
      >
        {selectedLoan ? <LoanDetailPage id={selectedLoan.id} /> : null}
      </DetailModal>
    </div>
  );
}

interface LoanReturnModalProps {
  loan: typeof LOANS[0];
  onClose: () => void;
}

function LoanReturnModal({ loan, onClose }: LoanReturnModalProps) {
  const [condition, setCondition] = useState<'good' | 'damaged' | 'lost'>('good');
  const [fine, setFine] = useState(0);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [saved, setSaved] = useState(false);

  const fineAmounts = { good: 0, damaged: 50000, lost: 200000 };

  const handleSubmit = () => {
    setSaved(true);
    setTimeout(() => onClose(), 600);
  };

  const conditions = [
    { id: 'good', label: 'Tốt', desc: 'Sách còn nguyên vẹn, không hư hỏng', color: 'success' },
    { id: 'damaged', label: 'Hư hỏng', desc: 'Sách bị rách, ố, gãy bìa...', color: 'warning' },
    { id: 'lost', label: 'Mất', desc: 'Sách bị mất hoặc không thể phục hồi', color: 'error' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[rgb(var(--bg-card))] rounded-2xl p-6 w-[480px] shadow-2xl border border-[rgb(var(--border))]">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)]">
            <CheckCircle2 className="h-6 w-6 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h3 className="font-bold text-[rgb(var(--text-primary))]">Trả sách</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 line-clamp-1">{loan.bookTitle}</p>
          </div>
          <button onClick={onClose} className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors">
            ✕
          </button>
        </div>

        {step === 'form' ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgb(var(--text-secondary))]">Tình trạng sách khi trả</label>
              <div className="space-y-2">
                {conditions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCondition(c.id); setFine(fineAmounts[c.id]); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      condition === c.id
                        ? `border-[rgb(var(--${c.color}))] bg-[rgb(var(--${c.color})/0.06)]`
                        : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.3)]'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      condition === c.id ? `border-[rgb(var(--${c.color}))] bg-[rgb(var(--${c.color}))]` : 'border-[rgb(var(--border))]'
                    }`}>
                      {condition === c.id && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        condition === c.id ? `text-[rgb(var(--${c.color}))]` : 'text-[rgb(var(--text-primary))]'
                      }`}>{c.label}</p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">{c.desc}</p>
                    </div>
                    {fineAmounts[c.id] > 0 && (
                      <span className="ml-auto text-xs font-semibold text-[rgb(var(--error))]">
                        +{fineAmounts[c.id].toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                Phí phạt {fine > 0 ? `(${fine.toLocaleString('vi-VN')}đ)` : '(nếu có)'}
              </label>
              <input
                type="number"
                value={fine}
                onChange={(e) => setFine(parseInt(e.target.value) || 0)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú tình trạng sách..."
                rows={2}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
              />
            </div>

            {fine > 0 && (
              <div className="rounded-lg border border-[rgb(var(--error)/0.2)] bg-[rgb(var(--error)/0.04)] p-3 text-xs text-[rgb(var(--text-secondary))">
                ⚠️ Phí phạt phải được thanh toán trước khi mượn sách tiếp.
              </div>
            )}

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
                <h4 className="font-semibold text-[rgb(var(--text-primary))]">Xác nhận trả sách</h4>
              </div>
              {[
                { label: 'Mã phiếu', value: `PM-2026-${loan.id.replace('l', '000').toUpperCase()}` },
                { label: 'Người mượn', value: loan.borrower },
                { label: 'Tài liệu', value: loan.bookTitle },
                { label: 'Ngày trả', value: new Date().toLocaleDateString('vi-VN') },
                { label: 'Tình trạng', value: conditions.find(c => c.id === condition)?.label ?? '' },
                { label: 'Phí phạt', value: fine > 0 ? `${fine.toLocaleString('vi-VN')}đ` : 'Không' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                  <span className={`text-xs font-medium ${item.label === 'Phí phạt' && fine > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-primary))]'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>Quay lại</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saved}>
                {saved ? '✓ Đã xác nhận' : 'Xác nhận trả'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
