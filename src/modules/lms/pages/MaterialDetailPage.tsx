import { useParams } from 'react-router-dom';
import { Download, Edit2, Play, FileText, BookOpen, Video, FileArchive, Tag } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

const MATERIALS_MAP: Record<string, {
  id: string;
  title: string;
  course: string;
  courseName: string;
  instructor: string;
  type: 'video' | 'pdf' | 'document' | 'zip';
  duration?: string;
  pages?: number;
  items?: number;
  size: string;
  updated: string;
  views: number;
  status: 'published' | 'draft';
  description: string;
  topics: string[];
  tags: string[];
}> = {
  m1: { id: 'm1', title: 'Bài giảng tuần 1 — Giới thiệu Python', course: 'CS101', courseName: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', type: 'video', duration: '45 phút', size: '320 MB', updated: '2026-06-10', views: 1245, status: 'published', description: 'Bài giảng giới thiệu tổng quan về ngôn ngữ lập trình Python cho người mới bắt đầu. Nội dung bao gồm: lịch sử Python, cài đặt môi trường, các khái niệm cơ bản về biến, kiểu dữ liệu, và cách chạy chương trình đầu tiên.', topics: ['Bài giảng', 'Giáo trình'], tags: ['python', 'giới thiệu', 'lập trình'] },
  m2: { id: 'm2', title: 'Slide bài giảng Chương 2 — Biến & Kiểu dữ liệu', course: 'CS101', courseName: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', type: 'pdf', pages: 28, size: '5.2 MB', updated: '2026-06-12', views: 890, status: 'published', description: 'Slide bài giảng chi tiết về các biến và kiểu dữ liệu trong Python. Bao gồm số nguyên, số thực, chuỗi, danh sách, tuple, dictionary.', topics: ['Bài giảng'], tags: ['python', 'biến', 'kiểu dữ liệu'] },
  m3: { id: 'm3', title: 'Tài liệu tham khảo — Python for Everybody', course: 'CS101', courseName: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', type: 'document', pages: 156, size: '12.8 MB', updated: '2026-05-20', views: 567, status: 'published', description: 'Tài liệu tham khảo toàn diện về Python, phù hợp cho người mới bắt đầu. Được biên soạn bởi Dr. Charles Severance.', topics: ['Tài liệu tham khảo'], tags: ['python', 'tài liệu', 'ebook'] },
  m4: { id: 'm4', title: 'Video thực hành — Cài đặt môi trường', course: 'CS101', courseName: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', type: 'video', duration: '20 phút', size: '180 MB', updated: '2026-06-01', views: 2100, status: 'published', description: 'Video hướng dẫn chi tiết cách cài đặt Python và VS Code trên Windows, macOS và Linux. Cùng cài các thư viện cơ bản.', topics: ['Bài tập', 'Bài giảng'], tags: ['python', 'cài đặt', 'thực hành'] },
  m5: { id: 'm5', title: 'Bài tập thực hành tuần 3', course: 'CS101', courseName: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', type: 'zip', items: 8, size: '2.1 MB', updated: '2026-06-15', views: 432, status: 'published', description: 'Bộ bài tập thực hành tuần 3, gồm 8 bài tập về vòng lặp for/while và hàm trong Python. Có file đáp án kèm theo.', topics: ['Bài tập'], tags: ['python', 'bài tập', 'vòng lặp'] },
  m6: { id: 'm6', title: 'Đề cương môn học HK1 2026-2027', course: 'CS101', courseName: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', type: 'pdf', pages: 12, size: '1.5 MB', updated: '2026-08-01', views: 3200, status: 'published', description: 'Đề cương chi tiết môn học Nhập môn Lập trình Python, bao gồm mục tiêu, nội dung, phương pháp giảng dạy và đánh giá.', topics: ['Giáo trình'], tags: ['đề cương', 'python'] },
  m7: { id: 'm7', title: 'Bài giảng tuần 2 — Vòng lặp & Hàm', course: 'CS101', courseName: 'Nhập môn Lập trình Python', instructor: 'TS. Nguyễn Văn Minh', type: 'video', duration: '55 phút', size: '410 MB', updated: '2026-06-17', views: 980, status: 'draft', description: 'Bài giảng về vòng lặp for, while và cách định nghĩa hàm trong Python. Có nhiều ví dụ thực tế và bài tập minh họa.', topics: ['Bài giảng'], tags: ['python', 'vòng lặp', 'hàm'] },
  m8: { id: 'm8', title: 'Tổng hợp công thức Toán cao cấp', course: 'MATH201', courseName: 'Giải tích 2', instructor: 'PGS.TS. Lê Thị Lan', type: 'pdf', pages: 8, size: '0.8 MB', updated: '2026-06-08', views: 780, status: 'published', description: 'Tài liệu tổng hợp các công thức quan trọng trong Toán cao cấp: đạo hàm, tích phân, phương trình vi phân, chuỗi số.', topics: ['Tài liệu tham khảo'], tags: ['toán', 'công thức'] },
};

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  video: { icon: <Video className="h-6 w-6" />, color: 'error', label: 'Video bài giảng' },
  pdf: { icon: <FileText className="h-6 w-6" />, color: 'accent', label: 'Tài liệu PDF' },
  document: { icon: <BookOpen className="h-6 w-6" />, color: 'info', label: 'Tài liệu' },
  zip: { icon: <FileArchive className="h-6 w-6" />, color: 'warning', label: 'File nén' },
};

interface MaterialDetailPageProps {
  id?: string;
}

export default function MaterialDetailPage({ id }: MaterialDetailPageProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const mat = MATERIALS_MAP[actualId] ?? MATERIALS_MAP['m1'];
  const tc = TYPE_CONFIG[mat.type] ?? TYPE_CONFIG.pdf;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preview */}
          <Card>
            <div className="relative aspect-video bg-[rgb(var(--bg-base))] flex items-center justify-center overflow-hidden rounded-t-xl">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-[rgb(var(--${tc.color})/0.1)] text-[rgb(var(--${tc.color}))]`}>
                {tc.icon}
              </div>
              {mat.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors">
                    <Play className="h-7 w-7 text-black ml-1" />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Mô tả</h3>
            </div>
            <CardContent className="pt-5">
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{mat.description}</p>

              {mat.topics.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2">Chủ đề</p>
                  <div className="flex flex-wrap gap-2">
                    {mat.topics.map(t => <Badge key={t} variant="neutral" size="sm">{t}</Badge>)}
                  </div>
                </div>
              )}

              {mat.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-2 flex items-center gap-1"><Tag className="h-3 w-3" />Nhãn</p>
                  <div className="flex flex-wrap gap-2">
                    {mat.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))] text-xs font-medium">#{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin học liệu</h3>
            </div>
            <CardContent className="space-y-3 pt-5">
              {[
                { label: 'Khóa học', value: `${mat.course} — ${mat.courseName}` },
                { label: 'Giảng viên', value: mat.instructor },
                { label: 'Loại', value: tc.label },
                { label: 'Dung lượng', value: mat.size },
                ...(mat.duration ? [{ label: 'Thời lượng', value: mat.duration }] : []),
                ...(mat.pages ? [{ label: 'Số trang', value: `${mat.pages} trang` }] : []),
                ...(mat.items ? [{ label: 'Số file', value: `${mat.items} files` }] : []),
                { label: 'Cập nhật', value: mat.updated },
                { label: 'Lượt xem', value: mat.views.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  <span className="font-medium text-[rgb(var(--text-primary))] text-right max-w-[160px] truncate">{value}</span>
                </div>
              ))}

              <div className="pt-2">
                {mat.status === 'draft' && <Badge variant="warning" dot className="w-full justify-center">Bản nháp</Badge>}
                {mat.status === 'published' && <Badge variant="success" dot className="w-full justify-center">Đã xuất bản</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 pt-5">
              <Button className="w-full" leftIcon={mat.type === 'video' ? <Play className="h-4 w-4" /> : <Download className="h-4 w-4" />}>
                {mat.type === 'video' ? 'Phát video' : 'Tải xuống'}
              </Button>
              <Button variant="outline" className="w-full" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => window.location.href = `/lms/thu-vien-hoc-lieu/${mat.id}/sua`}>
                Chỉnh sửa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
