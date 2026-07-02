import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, BookOpen,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const CATEGORIES = ['CNTT', 'Kinh tế', 'Luật', 'Ngoại ngữ', 'Khoa học', 'Y dược', 'Chính trị', 'Sư phạm'];
const LANGUAGES = ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp', 'Tiếng Trung', 'Tiếng Nhật', 'Khác'];

export default function CreateBookPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: CATEGORIES[0],
    publisher: '',
    year: new Date().getFullYear(),
    edition: '',
    language: LANGUAGES[0],
    pages: '',
    copies: '3',
    price: '',
    location: '',
    description: '',
    tags: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/lib/tai-lieu'), 600);
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm tài liệu mới"
        description="LIB-01 — Nhập thông tin tài liệu vào kho thư viện"
        breadcrumbs={[
          { label: 'LIB', href: '/lib' },
          { label: 'Tài liệu', href: '/lib/tai-lieu' },
          { label: 'Thêm mới' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/lib/tai-lieu')}>
              Quay lại
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thông tin cơ bản */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin cơ bản</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
                  Tên tài liệu <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="VD: Introduction to Algorithms"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Tác giả <span className="text-[rgb(var(--error))]">*</span></label>
                  <input
                    value={form.author}
                    onChange={(e) => update('author', e.target.value)}
                    placeholder="VD: Cormen, Leiserson..."
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">ISBN</label>
                  <input
                    value={form.isbn}
                    onChange={(e) => update('isbn', e.target.value)}
                    placeholder="VD: 978-0262033848"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Nhà xuất bản</label>
                  <input
                    value={form.publisher}
                    onChange={(e) => update('publisher', e.target.value)}
                    placeholder="VD: MIT Press"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Năm xuất bản</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => update('year', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Danh mục <span className="text-[rgb(var(--error))]">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Phiên bản</label>
                  <input
                    value={form.edition}
                    onChange={(e) => update('edition', e.target.value)}
                    placeholder="VD: 3rd Edition"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Ngôn ngữ</label>
                  <select
                    value={form.language}
                    onChange={(e) => update('language', e.target.value)}
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2"
                  >
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Số trang</label>
                  <input
                    type="number"
                    value={form.pages}
                    onChange={(e) => update('pages', e.target.value)}
                    placeholder="VD: 1312"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Số bản <span className="text-[rgb(var(--error))]">*</span></label>
                  <input
                    type="number"
                    value={form.copies}
                    onChange={(e) => update('copies', e.target.value)}
                    placeholder="VD: 3"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vị trí & Mô tả */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Vị trí & Mô tả</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Vị trí trong kho</label>
                  <input
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="VD: Kệ A1-03 · Tầng 1"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="VD: 450000"
                    className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Mô tả ngắn gọn về nội dung tài liệu..."
                  rows={3}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] resize-none focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Tags (phân cách bằng dấu phẩy)</label>
                <input
                  value={form.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  placeholder="VD: Thuật toán, CNTT, Khoa học máy tính"
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/lib/tai-lieu')}>Hủy bỏ</Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={saved}>
              {saved ? '✓ Đã lưu' : 'Lưu tài liệu'}
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Xem trước</h3>
            </div>
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
                  <BookOpen className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))] line-clamp-2">
                    {form.title || 'Tên tài liệu'}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{form.author || 'Tác giả'}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{form.isbn || 'ISBN'}</p>
                </div>
                <div className="w-full space-y-2">
                  {[
                    { label: 'Danh mục', value: form.category },
                    { label: 'Ngôn ngữ', value: form.language },
                    { label: 'Năm XB', value: String(form.year) },
                    { label: 'Bản sao', value: `${form.copies} cuốn` },
                    { label: 'Vị trí', value: form.location || '—' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-[rgb(var(--text-muted))]">{item.label}</span>
                      <span className="text-xs font-medium text-[rgb(var(--text-primary)]">{item.value}</span>
                    </div>
                  ))}
                </div>
                {form.tags && (
                  <div className="w-full flex flex-wrap gap-1 justify-center">
                    {form.tags.split(',').map((tag, i) => (
                      <span key={i} className="rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--text-secondary))]">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Hướng dẫn</h3>
            </div>
            <CardContent className="p-5 space-y-3">
              {[
                'Điền đầy đủ thông tin bắt buộc (*)',
                'ISBN giúp tra cứu nhanh trong kho',
                'Vị trí: Kệ + Số hiệu + Tầng',
                'Số bản: số lượng bản sao nhập vào kho',
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
    </div>
  );
}
