import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Search, BookOpen,
  CheckCircle2, User, Calendar,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const AVAILABLE_BOOKS = [
  { id: 'b1', title: 'Introduction to Algorithms (CLRS)', isbn: '978-0262033848', author: 'Cormen, Leiserson...', category: 'CNTT', available: 3, location: 'Kệ A1-03' },
  { id: 'b2', title: 'Kinh tế học vi mô', isbn: '978-6040001234', author: 'Nguyễn Văn A', category: 'Kinh tế', available: 7, location: 'Kệ B2-11' },
  { id: 'b3', title: 'Giáo trình Luật Hiến pháp', isbn: '978-6040005678', author: 'PGS.TS. Trần Văn B', category: 'Luật', available: 10, location: 'Kệ C1-02' },
  { id: 'b4', title: "Oxford Advanced Learner's Dictionary", isbn: '978-0194799000', author: 'Oxford University Press', category: 'Ngoại ngữ', available: 0, location: 'Kệ D1-05' },
  { id: 'b5', title: 'Giáo trình Vật lý Đại cương T1', isbn: '978-6040009012', author: 'PGS.TS. Đặng Văn C', category: 'Khoa học', available: 14, location: 'Kệ E2-08' },
  { id: 'b6', title: 'Python Crash Course (2nd Ed)', isbn: '978-1593279288', author: 'Eric Matthes', category: 'CNTT', available: 2, location: 'Kệ A1-07' },
];

const CATEGORIES = ['CNTT', 'Kinh tế', 'Luật', 'Ngoại ngữ', 'Khoa học', 'Y dược', 'Chính trị', 'Sư phạm'];

export default function CreateLoanPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<typeof AVAILABLE_BOOKS>([]);
  const [form, setForm] = useState({
    studentCode: '',
    studentName: '',
    class: '',
    phone: '',
    dueDate: '',
    note: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/lib/muon-tra'), 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mượn sách mới"
        description="LIB-01 — Lập phiếu mượn sách mới cho sinh viên"
        breadcrumbs={[
          { label: 'LIB', href: '/lib' },
          { label: 'Mượn trả', href: '/lib/muon-tra' },
          { label: 'Mượn sách mới' },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lib/muon-tra')}>
            Quay lại
          </Button>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* LEFT */}
        <div className="space-y-4">
          {/* Thông tin sinh viên */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin người mượn</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Mã sinh viên <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    value={form.studentCode}
                    onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                    placeholder="VD: SV-2024-0142"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Họ và tên <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    value={form.studentName}
                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Lớp</label>
                  <input
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    placeholder="VD: CNTT-K24"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="VD: 0912 345 678"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-[rgb(var(--accent)/0.2)] bg-[rgb(var(--accent)/0.04)] p-3 text-xs text-[rgb(var(--text-secondary))">
                ℹ️ Sinh viên cần có thẻ thư viện còn hiệu lực để được mượn sách.
              </div>
            </CardContent>
          </Card>

          {/* Chọn sách */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[rgb(var(--primary))]" />
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">Chọn tài liệu</h3>
                </div>
                <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowBookPicker(true)}>
                  Chọn từ kho
                </Button>
              </div>
            </div>
            <CardContent className="p-5 space-y-3">
              {selectedBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-10 w-10 text-[rgb(var(--text-muted))] mb-2" />
                  <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Chưa chọn tài liệu nào</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Nhấn "Chọn từ kho" để tìm và thêm tài liệu</p>
                </div>
              ) : (
                selectedBooks.map((book) => (
                  <div key={book.id} className="flex items-center gap-3 p-3 rounded-xl border border-[rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.04)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-1">{book.title}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{book.isbn} · {book.location}</p>
                    </div>
                    <span className="rounded-lg border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.06)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--success))]">
                      {book.available} cuốn
                    </span>
                    <button
                      onClick={() => setSelectedBooks((b) => b.filter((x) => x.id !== book.id))}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--error)/0.1)] hover:text-[rgb(var(--error))] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
              <Button variant="outline" size="sm" className="w-full" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowBookPicker(true)}>
                Thêm tài liệu
              </Button>
            </CardContent>
          </Card>

          {/* Thông tin mượn */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin mượn</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ngày mượn</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Ngày hết hạn <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Ghi chú thêm (không bắt buộc)..."
                  rows={2}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
                />
              </div>
              <div className="rounded-lg border border-[rgb(var(--warning)/0.2)] bg-[rgb(var(--warning)/0.04)] p-3 text-xs text-[rgb(var(--text-secondary))">
                ⚠️ Thời gian mượn tối đa 14 ngày. Mỗi sinh viên tối đa 3 cuốn sách cùng lúc.
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/lib/muon-tra')}>Hủy bỏ</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={saved}>
              {saved ? '✓ Đã lưu' : 'Lưu phiếu mượn'}
            </Button>
          </div>
        </div>

        {/* RIGHT: Preview phiếu mượn */}
        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Phiếu mượn sách</h3>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Xem trước trước khi lưu</p>
            </div>
            <CardContent className="p-0">
              <div className="m-4 p-5 rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-white space-y-3">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-[rgb(var(--text-muted))]">THƯ VIỆN TRƯỜNG ĐẠI HỌC</p>
                  <div className="my-1.5 border-t border-b border-gray-300 py-1">
                    <p className="text-[10px] font-bold text-[rgb(var(--text-primary))]">PHIẾU MƯỢN SÁCH</p>
                    <p className="text-[8px] text-[rgb(var(--text-muted))]">
                      Mã: PM-{new Date().getFullYear()}-****
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-[9px]">
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">Họ tên:</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{form.studentName || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">Mã SV:</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{form.studentCode || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">Lớp:</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{form.class || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">Ngày mượn:</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">
                      {new Date().toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">Hạn trả:</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">
                      {form.dueDate ? new Intl.DateTimeFormat('vi-VN').format(new Date(form.dueDate)) : '—'}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-[8px] text-[rgb(var(--text-muted))] text-center italic">
                    Đã ký nhận mượn sách và chấp nhận các quy định của thư viện
                  </p>
                </div>
                <div className="flex justify-between pt-3 text-[8px]">
                  <div className="text-center">
                    <p className="font-medium text-[rgb(var(--text-secondary))]">Người mượn</p>
                    <div className="h-5" />
                    <p className="text-[rgb(var(--text-muted))]">{(form.studentName || '—').split(' ').slice(-1)[0]}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-[rgb(var(--text-secondary))]">Thủ thư</p>
                    <div className="h-5" />
                    <p className="text-[rgb(var(--text-muted))]">Ký & Ghi rõ họ tên</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hướng dẫn */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Hướng dẫn</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                'Điền thông tin sinh viên chính xác',
                'Chọn tài liệu từ kho thư viện',
                'Kiểm tra số lượng còn trống',
                'Xác nhận ngày hết hạn (tối đa 14 ngày)',
                'In phiếu mượn cho sinh viên',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--text-secondary))]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                    {i + 1}
                  </span>
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {showBookPicker && (
        <BookPickerModal
          books={AVAILABLE_BOOKS}
          selected={selectedBooks}
          onSelect={(book) => {
            if (!selectedBooks.find((b) => b.id === book.id)) {
              setSelectedBooks((prev) => [...prev, book]);
            }
          }}
          onDeselect={(bookId) => setSelectedBooks((prev) => prev.filter((b) => b.id !== bookId))}
          onClose={() => setShowBookPicker(false)}
        />
      )}
    </div>
  );
}

// ── BookPickerModal ────────────────────────────────────────────────────────────

interface BookPickerModalProps {
  books: typeof AVAILABLE_BOOKS;
  selected: typeof AVAILABLE_BOOKS;
  onSelect: (book: typeof AVAILABLE_BOOKS[0]) => void;
  onDeselect: (bookId: string) => void;
  onClose: () => void;
}

function BookPickerModal({ books, selected, onSelect, onDeselect, onClose }: BookPickerModalProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const categories = ['Tất cả', ...CATEGORIES];

  const filtered = books.filter((b) => {
    const matchSearch = !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Tất cả' || b.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const isSelected = (id: string) => selected.some((b) => b.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[rgb(var(--bg-card))] rounded-2xl w-[680px] max-h-[80vh] flex flex-col shadow-2xl border border-[rgb(var(--border))]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)]">
            <BookOpen className="h-6 w-6 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h3 className="font-bold text-[rgb(var(--text-primary))]">Chọn tài liệu từ kho</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Chọn tài liệu sinh viên muốn mượn</p>
          </div>
          <button onClick={onClose} className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors">
            ✕
          </button>
        </div>

        {/* Search & Filter */}
        <div className="px-6 py-3 border-b border-[rgb(var(--border)/0.6)] space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, ISBN, tác giả..."
              className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]'
                    : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Book list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-[rgb(var(--text-muted))] mb-3" />
              <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Không tìm thấy tài liệu</p>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Thử thay đổi từ khóa tìm kiếm</p>
            </div>
          ) : (
            filtered.map((book) => {
              const selected = isSelected(book.id);
              const unavailable = book.available === 0;
              return (
                <div
                  key={book.id}
                  onClick={() => {
                    if (unavailable) return;
                    if (selected) onDeselect(book.id);
                    else onSelect(book);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    selected
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)] cursor-pointer'
                      : unavailable
                      ? 'border-[rgb(var(--border))] opacity-50 cursor-not-allowed'
                      : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.3)] cursor-pointer'
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    selected ? 'bg-[rgb(var(--primary)/0.15)] text-[rgb(var(--primary))]' : 'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-muted))]'
                  }`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-1">{book.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{book.isbn} · {book.author}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{book.category} · {book.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {unavailable ? (
                      <span className="rounded-lg border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.06)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--error))]">
                        Hết sách
                      </span>
                    ) : selected ? (
                      <span className="flex items-center gap-1 rounded-lg border border-[rgb(var(--primary))] bg-[rgb(var(--primary))] px-2.5 py-1 text-xs font-medium text-white">
                        <CheckCircle2 className="h-3 w-3" /> Đã chọn
                      </span>
                    ) : (
                      <span className="rounded-lg border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.06)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--success))]">
                        {book.available} cuốn
                      </span>
                    )}
                    {selected && (
                      <span className="text-[10px] text-[rgb(var(--primary))] font-medium">Bỏ chọn</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgb(var(--border)/0.6)]">
          <p className="text-xs text-[rgb(var(--text-muted))]">
            Đã chọn: <span className="font-semibold text-[rgb(var(--text-primary))]">{selected.length}</span> tài liệu
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
            <Button onClick={onClose}>Xác nhận</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
