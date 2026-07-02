import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Save, Printer, Search, X, Plus, Trash2,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const STUDENTS = [
  { id: 's1', code: 'SV2026001', name: 'Nguyễn Văn An', class: 'K60-CNTT', dept: 'Khoa CNTT' },
  { id: 's2', code: 'SV2026002', name: 'Trần Thị Bình', class: 'K59-KT', dept: 'Khoa Kinh tế' },
  { id: 's3', code: 'SV2026003', name: 'Lê Minh Cường', class: 'K60-Luat', dept: 'Khoa Luật' },
  { id: 's4', code: 'SV2026004', name: 'Phạm Thu Dung', class: 'K60-NN', dept: 'Khoa Ngoại ngữ' },
  { id: 's5', code: 'SV2026005', name: 'Hoàng Văn E', class: 'K61-CNTT', dept: 'Khoa CNTT' },
  { id: 's6', code: 'SV2026006', name: 'Vũ Thị F', class: 'K60-YD', dept: 'Khoa Y dược' },
];

const SEMESTERS = ['HK1 2026-2027', 'HK2 2025-2026', 'HK1 2025-2026', 'HK2 2024-2025'];
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tiền mặt' },
  { id: 'bank', label: 'Chuyển khoản' },
  { id: 'vnpay', label: 'VNPay' },
  { id: 'momo', label: 'MoMo' },
];

const DEFAULT_BREAKDOWN = [
  { label: 'Học phí chính khóa', amount: 9500000 },
  { label: 'Phí thực hành', amount: 2000000 },
  { label: 'Phí bảo hiểm', amount: 300000 },
  { label: 'Phí thư viện', amount: 200000 },
  { label: 'Phí sử dụng CSVC', amount: 500000 },
];

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export default function CreateTuitionPage() {
  const { t } = useTranslation('fin');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof STUDENTS[0] | null>(null);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [breakdown, setBreakdown] = useState(DEFAULT_BREAKDOWN);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNote, setReceiptNote] = useState('');
  const [saved, setSaved] = useState(false);

  const filteredStudents = STUDENTS.filter((s) =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search),
  );

  const totalAmount = breakdown.reduce((s, b) => s + b.amount, 0);
  const receiptCode = `PT-2026-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

  const handleSave = (print = false) => {
    setSaved(true);
    setTimeout(() => {
      if (print) {
        window.print();
      }
      navigate('/fin/hoc-phi');
    }, 600);
  };

  const updateBreakdown = (idx: number, amount: number) => {
    setBreakdown((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], amount };
      return next;
    });
  };

  const addBreakdownItem = () => {
    setBreakdown((prev) => [...prev, { label: 'Khoản mục mới', amount: 0 }]);
  };

  const removeBreakdownItem = (idx: number) => {
    setBreakdown((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('createTuition.title')}
        description={t('createTuition.subtitle')}
        breadcrumbs={[
          { label: 'FIN', href: '/fin' },
          { label: t('tuition.title'), href: '/fin/hoc-phi' },
          { label: t('createTuition.title') },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/fin/hoc-phi')}>
              {t('createTuition.back')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 380px' }}>
        <div className="space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('createTuition.student.title')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                  {t('createTuition.student.label')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                {selectedStudent ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary))] text-white text-xs font-bold">
                      {selectedStudent.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{selectedStudent.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{selectedStudent.code} · {selectedStudent.class}</p>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
                      <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setShowStudentList(true); }}
                        onFocus={() => setShowStudentList(true)}
                        placeholder={t('createTuition.student.search')}
                        className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
                      />
                    </div>
                    {showStudentList && (
                      <div className="absolute z-10 mt-1 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-xl overflow-hidden">
                        {filteredStudents.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-[rgb(var(--text-muted))]">{t('createTuition.student.notFound')}</p>
                        ) : (
                          filteredStudents.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => { setSelectedStudent(s); setShowStudentList(false); setSearch(''); }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors text-left"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-xs font-bold">
                                {s.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{s.name}</p>
                                <p className="text-xs text-[rgb(var(--text-muted))]">{s.code} · {s.class}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                  {t('tuition.hocKy')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                >
                  {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('createTuition.breakdown.title')}</h3>
              <button
                onClick={addBreakdownItem}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.08)] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> {t('createTuition.breakdown.add')}
              </button>
            </div>
            <CardContent className="p-5 space-y-3">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    value={item.label}
                    onChange={(e) => {
                      const next = [...breakdown];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setBreakdown(next);
                    }}
                    className="flex-1 h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
                    placeholder={t('createTuition.breakdown.itemLabel')}
                  />
                  <div className="relative w-40">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateBreakdown(idx, parseInt(e.target.value) || 0)}
                      className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-3 pr-12 text-sm text-right focus:outline-none focus:ring-2"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgb(var(--text-muted))]">đ</span>
                  </div>
                  {breakdown.length > 1 && (
                    <button
                      onClick={() => removeBreakdownItem(idx)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.08)] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <div className="border-t border-[rgb(var(--border)/0.6)] pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('createTuition.breakdown.total')}</span>
                <span className="text-base font-bold text-[rgb(var(--error))]">{fmt(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('createTuition.payment.title')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{t('createTuition.payment.method')}</label>
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium text-center transition-all ${
                        paymentMethod === m.id
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)] text-[rgb(var(--primary))]'
                          : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3)]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{t('createTuition.payment.paidDate')}</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">{t('createTuition.payment.note')}</label>
                <textarea
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder={t('createTuition.payment.notePlaceholder')}
                  rows={2}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('createTuition.preview.title')}</h3>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('createTuition.preview.subtitle')}</p>
            </div>
            <CardContent className="p-0">
              <div className="m-4 p-6 rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-white space-y-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-[rgb(var(--text-muted))]">TRƯỜNG ĐẠI HỌC</p>
                  <p className="text-[10px] font-bold text-[rgb(var(--text-primary))]">PHÒNG TÀI CHÍNH — KẾ TOÁN</p>
                  <div className="my-2 border-t border-b border-gray-300 py-1">
                    <p className="text-xs font-bold text-[rgb(var(--text-primary))]">PHIẾU THU HỌC PHÍ</p>
                    <p className="text-[9px] text-[rgb(var(--text-muted))]">{t('createTuition.preview.receiptNo')} {receiptCode}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[9px]">
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">{t('createTuition.preview.studentName')}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{selectedStudent?.name ?? '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">{t('createTuition.preview.studentCode')}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{selectedStudent?.code ?? '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">{t('createTuition.preview.class')}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{selectedStudent?.class ?? '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">{t('createTuition.preview.semester')}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">{semester}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[rgb(var(--text-muted))]">{t('createTuition.preview.paidDate')}</span>
                    <span className="font-medium text-[rgb(var(--text-primary))]">
                      {paidDate ? new Intl.DateTimeFormat('vi-VN').format(new Date(paidDate)) : '—'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-1.5 text-[9px]">
                  {breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-secondary))]">{item.label}</span>
                      <span className="font-medium text-[rgb(var(--text-primary))]">{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-400 pt-2 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[rgb(var(--text-primary))]">{t('createTuition.preview.total')}</span>
                  <span className="font-black text-[rgb(var(--error))]">{fmt(totalAmount)}</span>
                </div>

                <div className="text-[9px] text-[rgb(var(--text-muted))] italic text-center">
                  ({selectedStudent?.name ?? '—'}) {t('createTuition.preview.receiptNote')} {semester}
                </div>

                <div className="flex justify-between pt-4 text-[8px]">
                  <div className="text-center">
                    <p className="font-medium text-[rgb(var(--text-secondary))]">{t('createTuition.preview.payer')}</p>
                    <div className="h-6" />
                    <p className="text-[rgb(var(--text-muted))]">{(selectedStudent?.name ?? '—')}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-[rgb(var(--text-secondary))]">{t('createTuition.preview.cashier')}</p>
                    <div className="h-6" />
                    <p className="text-[rgb(var(--text-muted))]">{t('createTuition.preview.signature')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => handleSave(false)}
              disabled={!selectedStudent || saved}
            >
              {saved ? `✓ ${t('createTuition.actions.saved')}` : t('createTuition.actions.save')}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => handleSave(true)}
              disabled={!selectedStudent || saved}
            >
              {t('createTuition.actions.print')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
