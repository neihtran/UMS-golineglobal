import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Star, MapPin, Hash, User,
  BarChart2, Download, Printer, BookMarked as BorrowIcon,
  CheckCircle2, Clock,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const BOOK_DETAIL = {
  id: 'b1',
  title: 'Introduction to Algorithms (CLRS)',
  author: 'Cormen, Leiserson, Rivest, Stein',
  isbn: '978-0262033848',
  category: 'CNTT',
  publisher: 'MIT Press',
  year: 2009,
  edition: '3rd Edition',
  language: 'Tiếng Anh',
  pages: 1312,
  copies: 8,
  available: 3,
  borrowed: 5,
  reserved: 0,
  rating: 4.9,
  location: 'Kệ A1-03 · Tầng 1',
  description: 'Cuốn sách kinh điển về thuật toán và cấu trúc dữ liệu, được sử dụng rộng rãi trong các trường đại học trên toàn thế giới.',
  tags: ['Thuật toán', 'Cấu trúc dữ liệu', 'CNTT', 'Khoa học máy tính'],
  history: [
    { version: '1.0', time: '2024-01-15 08:00', user: 'Thủ thư', action: 'Nhập sách vào kho' },
    { version: '1.1', time: '2024-06-20 10:30', user: 'Thủ thư', action: 'Cập nhật số lượng' },
  ],
};

const BORROWERS = [
  { id: 'br1', name: 'Nguyễn Văn An', code: 'SV2024001', class: 'CNTT-2024', borrowDate: '2026-06-01', dueDate: '2026-06-15', status: 'overdue', returned: false },
  { id: 'br2', name: 'Trần Thị Bình', code: 'SV2024002', class: 'KT-2024', borrowDate: '2026-06-05', dueDate: '2026-06-19', status: 'borrowed', returned: false },
  { id: 'br3', name: 'Lê Minh Cường', code: 'SV2024003', class: 'CNTT-2024', borrowDate: '2026-06-10', dueDate: '2026-06-24', status: 'borrowed', returned: false },
  { id: 'br4', name: 'Phạm Thu Dung', code: 'SV2024004', class: 'CNTT-2024', borrowDate: '2026-06-15', dueDate: '2026-06-29', status: 'borrowed', returned: false },
  { id: 'br5', name: 'Hoàng Văn E', code: 'SV2024005', class: 'CNTT-2024', borrowDate: '2026-06-20', dueDate: '2026-07-04', status: 'borrowed', returned: false },
];

const STATUS_CONFIG: Record<string, { variant: 'warning' | 'success' | 'error'; label: string }> = {
  overdue: { variant: 'error', label: 'Quá hạn' },
  borrowed: { variant: 'warning', label: 'Đang mượn' },
  returned: { variant: 'success', label: 'Đã trả' },
};

export default function BookDetailPage() {
  const navigate = useNavigate();
  const [showBorrow, setShowBorrow] = useState(false);
  const d = BOOK_DETAIL;

  return (
    <div className="space-y-6">
      <PageHeader
        title={d.title}
        description={`LIB-01 · ${d.isbn} · ${d.category}`}
        breadcrumbs={[
          { label: 'LIB', href: '/lib' },
          { label: 'Tài liệu', href: '/lib/tai-lieu' },
          { label: d.title },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lib/tai-lieu')}>
              Quay lại
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>In thông tin</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Tải file</Button>
            {d.available > 0 && (
              <Button size="sm" leftIcon={<BorrowIcon className="h-4 w-4" />} onClick={() => setShowBorrow(true)}>
                Mượn tài liệu
              </Button>
            )}
          </div>
        }
      />

      {/* Status strip */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <Badge variant={d.available > 0 ? 'success' : 'warning'} dot size="sm">
          {d.available > 0 ? `${d.available} cuốn có sẵn` : 'Hết sách'}
        </Badge>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          <span className="font-medium text-[rgb(var(--text-secondary))]">{d.copies}</span> tổng bản
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          <span className="font-medium text-[rgb(var(--text-secondary))]">{d.borrowed}</span> đang mượn
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{d.rating}/5</span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-[1fr_300px]">
        {/* Left */}
        <div className="space-y-4">
          {/* Thông tin tài liệu */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin tài liệu</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-[rgb(var(--text-primary))] leading-snug">{d.title}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{d.author}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{d.publisher} · {d.year} · {d.edition}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                {[
                  { label: 'ISBN', value: d.isbn, icon: <Hash className="h-3.5 w-3.5" /> },
                  { label: 'Danh mục', value: d.category, icon: <BarChart2 className="h-3.5 w-3.5" /> },
                  { label: 'Ngôn ngữ', value: d.language, icon: <BookOpen className="h-3.5 w-3.5" /> },
                  { label: 'Số trang', value: `${d.pages} trang`, icon: <BookOpen className="h-3.5 w-3.5" /> },
                  { label: 'Vị trí', value: d.location, icon: <MapPin className="h-3.5 w-3.5" /> },
                  { label: 'Tác giả', value: d.author, icon: <User className="h-3.5 w-3.5" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="mt-0.5 text-[rgb(var(--text-muted))] shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">{item.label}</p>
                      <p className="text-xs font-medium text-[rgb(var(--text-primary))] leading-snug">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mô tả */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Mô tả</h3>
            </div>
            <CardContent className="p-5">
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{d.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {d.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[rgb(var(--border))] px-2.5 py-0.5 text-xs font-medium text-[rgb(var(--text-secondary))]">{tag}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Người đang mượn */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Người đang mượn ({d.borrowed})</h3>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border)/0.6)]">
                    {['Người mượn', 'Mã SV', 'Lớp', 'Ngày mượn', 'Hạn trả', 'Trạng thái'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                  {BORROWERS.map((b) => {
                    const sc = STATUS_CONFIG[b.status];
                    return (
                      <tr key={b.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                        <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">{b.name}</td>
                        <td className="px-4 py-2.5 text-xs font-mono text-[rgb(var(--text-muted))]">{b.code}</td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{b.class}</td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{b.borrowDate}</td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{b.dueDate}</td>
                        <td className="px-4 py-2.5"><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Hành động */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Hành động</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              <Button className="w-full" size="sm" leftIcon={<BorrowIcon className="h-3.5 w-3.5" />} onClick={() => setShowBorrow(true)} disabled={d.available === 0}>
                Mượn tài liệu
              </Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>In thông tin</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Tải file</Button>
            </CardContent>
          </Card>

          {/* Thống kê */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Số lượng</h3>
            </div>
            <CardContent className="p-4 space-y-2">
              {[
                { label: 'Tổng bản', value: d.copies, color: 'primary' },
                { label: 'Có sẵn', value: d.available, color: 'success' },
                { label: 'Đang mượn', value: d.borrowed, color: 'warning' },
                { label: 'Đã đặt', value: d.reserved, color: 'info' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                  <span className={`text-sm font-bold text-[rgb(var(--${item.color}))]`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Thông tin */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Thông tin</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'ISBN', value: d.isbn },
                { label: 'Danh mục', value: d.category },
                { label: 'Vị trí', value: d.location },
                { label: 'Ngôn ngữ', value: d.language },
                { label: 'Số trang', value: `${d.pages} trang` },
                { label: 'Xuất bản', value: String(d.year) },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-20 shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lịch sử */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Lịch sử</h3>
            </div>
            <CardContent className="p-3 space-y-3">
              {d.history.map((h, i) => (
                <div key={i} className="relative pl-5">
                  <div className={`absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'}`} />
                  {i < d.history.length - 1 && <div className="absolute left-2.5 top-5 bottom-0 w-px bg-[rgb(var(--border)/0.5)]" />}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-[rgb(var(--primary))]">v{h.version}</span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">{h.time}</span>
                  </div>
                  <p className="text-xs font-medium text-[rgb(var(--text-primary))]">{h.action}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{h.user}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Borrow modal */}
      {showBorrow && (
        <BorrowModal book={d} onClose={() => setShowBorrow(false)} onSuccess={() => navigate('/lib/tai-lieu')} />
      )}
    </div>
  );
}

// ── BorrowModal ──────────────────────────────────────────────────────────────

interface BorrowModalProps {
  book: typeof BOOK_DETAIL;
  onClose: () => void;
  onSuccess: () => void;
}

function BorrowModal({ book, onClose, onSuccess }: BorrowModalProps) {
  const [form, setForm] = useState({ studentCode: '', studentName: '', class: '', dueDate: '' });
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    setSaved(true);
    setTimeout(() => { onSuccess(); }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[rgb(var(--bg-card))] rounded-2xl p-6 w-[480px] shadow-2xl border border-[rgb(var(--border))]">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)]">
            <BorrowIcon className="h-6 w-6 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h3 className="font-bold text-[rgb(var(--text-primary))]">Mượn tài liệu</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{book.title}</p>
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
                title="Ngày hết hạn"
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
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
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
