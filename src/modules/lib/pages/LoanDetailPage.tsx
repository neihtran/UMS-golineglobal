import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, CheckCircle2, Clock,
  Printer, Download, RefreshCw, Calendar, User,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const LOAN_DETAIL = {
  id: 'l03',
  code: 'PM-2026-0003',
  book: {
    title: 'Clean Code: A Handbook of Agile Software',
    isbn: '978-013235088',
    author: 'Robert C. Martin',
    category: 'CNTT',
    location: 'Kệ A1-07',
    publisher: 'Prentice Hall',
    year: 2008,
  },
  borrower: {
    name: 'Lê Đình Phong',
    code: 'SV-2023-0211',
    class: 'KT-K23',
    phone: '0901 234 567',
    email: 'ldphong@student.edu.vn',
  },
  borrowDate: '2026-06-05',
  dueDate: '2026-06-20',
  returnDate: '2026-06-18',
  actualDays: 13,
  librarian: 'Trần Văn Minh',
  note: 'Mượn đúng hạn, sách còn mới',
  status: 'returned_late',
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; label: string; desc: string }> = {
  active: { variant: 'info', label: 'Đang mượn', desc: 'Đang trong thời gian mượn' },
  overdue: { variant: 'error', label: 'Quá hạn', desc: 'Đã quá hạn trả' },
  returned_late: { variant: 'warning', label: 'Trả trễ', desc: 'Đã trả nhưng trễ 2 ngày' },
  returned_on_time: { variant: 'success', label: 'Đã trả', desc: 'Đã trả đúng hạn' },
};

const HISTORY = [
  { version: '1.0', time: '2026-06-05 09:00', user: 'Nguyễn Thị Bích', action: 'Lập phiếu mượn sách', detail: 'Mượn sách tại quầy' },
  { version: '2.0', time: '2026-06-18 14:30', user: 'Trần Văn Minh', action: 'Trả sách', detail: 'Sách còn mới, không phạt' },
];

export default function LoanDetailPage() {
  const navigate = useNavigate();
  const [showReturn, setShowReturn] = useState(false);
  const d = LOAN_DETAIL;
  const sc = STATUS_CONFIG[d.status];
  const daysOverdue = d.returnDate
    ? Math.max(0, Math.ceil((new Date(d.returnDate).getTime() - new Date(d.dueDate).getTime()) / 86400000))
    : Math.max(0, Math.ceil((Date.now() - new Date(d.dueDate).getTime()) / 86400000));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Phiếu mượn ${d.code}`}
        description={`${d.borrower.name} · ${d.book.title}`}
        breadcrumbs={[
          { label: 'LIB', href: '/lib' },
          { label: 'Mượn trả', href: '/lib/muon-tra' },
          { label: d.code },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lib/muon-tra')}>
              Quay lại
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>In phiếu</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Tải file</Button>
            {d.status !== 'returned_on_time' && d.status !== 'returned_late' && (
              <Button size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setShowReturn(true)}>
                Trả sách
              </Button>
            )}
          </div>
        }
      />

      {/* Status strip */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {sc.desc}
        </span>
        {daysOverdue > 0 && (
          <>
            <span className="h-4 w-px bg-[rgb(var(--border))]" />
            <span className="text-xs font-medium text-[rgb(var(--error))]">
              {daysOverdue} ngày {d.returnDate ? 'trễ' : 'quá hạn'}
            </span>
          </>
        )}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Left */}
        <div className="space-y-4">
          {/* Thông tin người mượn */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin người mượn</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[rgb(var(--text-primary))]">{d.borrower.name}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-0.5">{d.borrower.class}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">MSSV: {d.borrower.code}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                {[
                  { label: 'Mã SV', value: d.borrower.code },
                  { label: 'Lớp', value: d.borrower.class },
                  { label: 'SĐT', value: d.borrower.phone },
                  { label: 'Email', value: d.borrower.email },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-16 shrink-0 pt-0.5">{item.label}:</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin tài liệu */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin tài liệu</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[rgb(var(--text-primary))] leading-snug">{d.book.title}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{d.book.author}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">ISBN: {d.book.isbn}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                {[
                  { label: 'ISBN', value: d.book.isbn },
                  { label: 'Danh mục', value: d.book.category },
                  { label: 'Vị trí', value: d.book.location },
                  { label: 'Nhà xuất bản', value: `${d.book.publisher}, ${d.book.year}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0 pt-0.5">{item.label}:</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin mượn trả */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin mượn trả</h3>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Mã phiếu', value: d.code },
                  { label: 'Ngày mượn', value: d.borrowDate },
                  { label: 'Hạn trả', value: d.dueDate, highlight: d.status === 'overdue' },
                  { label: 'Ngày trả', value: d.returnDate ?? '—', success: !!d.returnDate },
                  { label: 'Số ngày mượn', value: `${d.actualDays} ngày` },
                  { label: 'Thủ thư', value: d.librarian },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0 pt-0.5">{item.label}:</span>
                    <span className={`text-xs font-medium ${item.highlight ? 'text-[rgb(var(--error))]' : item.success ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--text-primary))]'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              {d.note && (
                <div className="pt-3 border-t border-[rgb(var(--border)/0.6)]">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú:</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{d.note}</p>
                </div>
              )}
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
              {d.status !== 'returned_on_time' && d.status !== 'returned_late' ? (
                <Button className="w-full" size="sm" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => setShowReturn(true)}>
                  Trả sách
                </Button>
              ) : (
                <div className="rounded-lg border border-[rgb(var(--success)/0.2)] bg-[rgb(var(--success)/0.04)] p-3 text-center">
                  <CheckCircle2 className="h-6 w-6 text-[rgb(var(--success))] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[rgb(var(--success))]">Đã hoàn tất</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">Sách đã được trả</p>
                </div>
              )}
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>In phiếu</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Tải file</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>Gia hạn</Button>
            </CardContent>
          </Card>

          {/* Thông tin mượn */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">Thông tin</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'Mã phiếu', value: d.code },
                { label: 'Trạng thái', value: sc.label },
                { label: 'Ngày mượn', value: d.borrowDate },
                { label: 'Hạn trả', value: d.dueDate },
                { label: 'Ngày trả', value: d.returnDate ?? '—' },
                { label: 'Thủ thư', value: d.librarian },
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
              {HISTORY.map((h, i) => (
                <div key={i} className="relative pl-5">
                  <div className={`absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'}`} />
                  {i < HISTORY.length - 1 && <div className="absolute left-2.5 top-5 bottom-0 w-px bg-[rgb(var(--border)/0.5)]" />}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-[rgb(var(--primary))]">v{h.version}</span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">{h.time}</span>
                  </div>
                  <p className="text-xs font-medium text-[rgb(var(--text-primary))]">{h.action}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{h.user} · {h.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {showReturn && (
        <ReturnModal loan={d} onClose={() => setShowReturn(false)} onSuccess={() => navigate('/lib/muon-tra')} />
      )}
    </div>
  );
}

// ── ReturnModal ───────────────────────────────────────────────────────────────

interface ReturnModalProps {
  loan: typeof LOAN_DETAIL;
  onClose: () => void;
  onSuccess: () => void;
}

function ReturnModal({ loan, onClose, onSuccess }: ReturnModalProps) {
  const [condition, setCondition] = useState<'good' | 'damaged' | 'lost'>('good');
  const [fine, setFine] = useState(0);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [saved, setSaved] = useState(false);

  const fineAmounts = { good: 0, damaged: 50000, lost: 200000 };

  const handleSubmit = () => {
    setSaved(true);
    setTimeout(() => { onSuccess(); }, 600);
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
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{loan.book.title}</p>
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
                Phí phạt {fine > 0 ? `(đã tự động tính: ${fine.toLocaleString('vi-VN')}đ)` : '(nếu có)'}
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
                placeholder="Ghi chú tình trạng sách (không bắt buộc)..."
                rows={2}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
              />
            </div>

            {fine > 0 && (
              <div className="rounded-lg border border-[rgb(var(--error)/0.2)] bg-[rgb(var(--error)/0.04)] p-3 text-xs text-[rgb(var(--text-secondary))">
                ⚠️ Phí phạt phải được thanh toán trước khi mượn sách tiếp theo.
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
                { label: 'Mã phiếu', value: loan.code },
                { label: 'Tài liệu', value: loan.book.title },
                { label: 'Người mượn', value: loan.borrower.name },
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
