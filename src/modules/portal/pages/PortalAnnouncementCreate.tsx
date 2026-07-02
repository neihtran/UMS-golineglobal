import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const CATEGORIES = ['Học vụ', 'Học bổng', 'Tuyển sinh', 'Sự kiện', 'Thông báo', 'NCKH'];

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}{required && <span className="text-[rgb(var(--error))] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[rgb(var(--error))]">{error}</p>}
    </div>
  );
}

export default function PortalAnnouncementCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Học vụ');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      e.preventDefault();
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!content.trim()) e.content = 'Nội dung không được để trống';
    return e;
  };

  const handleSubmit = (e: React.FormEvent, draft = false) => {
    e.preventDefault();
    const errs = validate();
    if (!draft && Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
    setTimeout(() => navigate('/portal'), 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)]">
          <svg className="h-10 w-10 text-[rgb(var(--success))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">Thông báo đã được đăng!</h3>
        <p className="text-sm text-[rgb(var(--text-muted))]">Đang chuyển về trang chủ PORTAL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng thông báo mới"
        description="PORTAL-01 · Tạo tin tức, thông báo cho sinh viên & giảng viên"
        breadcrumbs={[
          { label: 'PORTAL', href: '/portal' },
          { label: 'Cổng thông tin', href: '/portal' },
          { label: 'Đăng thông báo' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/portal')}>Hủy bỏ</Button>}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Nội dung thông báo</h3>
            </div>
            <CardContent className="pt-5 space-y-4">
              <Field label="Tiêu đề" required error={errors.title}>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors(p => { const n = { ...p }; delete n.title; return n; }); }}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
                />
              </Field>

              <Field label="Mô tả ngắn (tóm tắt)" required={false}>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Nhập mô tả ngắn (hiển thị trong danh sách thông báo)..."
                  rows={2}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
                />
              </Field>

              <Field label="Nội dung chi tiết" required error={errors.content}>
                <textarea
                  value={content}
                  onChange={(e) => { setContent(e.target.value); setErrors(p => { const n = { ...p }; delete n.content; return n; }); }}
                  placeholder="Nhập nội dung chi tiết thông báo..."
                  rows={10}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] resize-none"
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cài đặt</h3>
            </div>
            <CardContent className="pt-5 space-y-4">
              <Field label="Danh mục" required>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">Tags</label>
                <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))] text-xs font-medium">
                      #{t}
                      <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-[rgb(var(--error))]">×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={tags.length === 0 ? 'Nhập tag...' : ''}
                    className="flex-1 min-w-[80px] bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Ghim lên đầu</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">Hiển thị ưu tiên trên trang chủ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPinned(p => !p)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pinned ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pinned ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Cover image placeholder */}
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Ảnh bìa</h3>
            </div>
            <CardContent className="pt-5">
              <div className="flex items-center justify-center border-2 border-dashed border-[rgb(var(--border))] rounded-xl py-8 cursor-pointer hover:border-[rgb(var(--primary-light))] transition-colors">
                <div className="text-center">
                  <Image className="h-10 w-10 text-[rgb(var(--text-muted))] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Tải ảnh bìa lên</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">JPG, PNG, WEBP · Tối đa 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">Đăng thông báo</Button>
            <Button type="button" variant="outline" className="w-full" onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}>Lưu nháp</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
