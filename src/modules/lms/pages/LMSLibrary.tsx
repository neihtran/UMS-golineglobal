import { useState } from 'react';
import { Plus, Search, Download, Eye, Edit2, Play, FileText, Video, BookOpen, FileArchive, FolderOpen, Grid3X3, List } from 'lucide-react';
import { Button, Badge, Card, CardContent, DetailModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useDetailModal } from '@/hooks/useDetailModal';
import MaterialDetailPage from './MaterialDetailPage';

const MATERIALS = [
  { id: 'm1', title: 'Bài giảng tuần 1 — Giới thiệu Python', course: 'CS101', type: 'video', duration: '45 phút', size: '320 MB', updated: '2026-06-10', views: 1245, status: 'published' },
  { id: 'm2', title: 'Slide bài giảng Chương 2 — Biến & Kiểu dữ liệu', course: 'CS101', type: 'pdf', pages: 28, size: '5.2 MB', updated: '2026-06-12', views: 890, status: 'published' },
  { id: 'm3', title: 'Tài liệu tham khảo — Python for Everybody', course: 'CS101', type: 'document', pages: 156, size: '12.8 MB', updated: '2026-05-20', views: 567, status: 'published' },
  { id: 'm4', title: 'Video thực hành — Cài đặt môi trường', course: 'CS101', type: 'video', duration: '20 phút', size: '180 MB', updated: '2026-06-01', views: 2100, status: 'published' },
  { id: 'm5', title: 'Bài tập thực hành tuần 3', course: 'CS101', type: 'zip', items: 8, size: '2.1 MB', updated: '2026-06-15', views: 432, status: 'published' },
  { id: 'm6', title: 'Đề cương môn học HK1 2026-2027', course: 'CS101', type: 'pdf', pages: 12, size: '1.5 MB', updated: '2026-08-01', views: 3200, status: 'published' },
  { id: 'm7', title: 'Bài giảng tuần 2 — Vòng lặp & Hàm', course: 'CS101', type: 'video', duration: '55 phút', size: '410 MB', updated: '2026-06-17', views: 980, status: 'draft' },
  { id: 'm8', title: 'Tổng hợp công thức Toán cao cấp', course: 'MATH201', type: 'pdf', pages: 8, size: '0.8 MB', updated: '2026-06-08', views: 780, status: 'published' },
];

const TYPE_CONFIG = {
  video: { icon: <Video className="h-5 w-5" />, color: 'error', label: 'Video' },
  pdf: { icon: <FileText className="h-5 w-5" />, color: 'accent', label: 'PDF' },
  document: { icon: <BookOpen className="h-5 w-5" />, color: 'info', label: 'Tài liệu' },
  zip: { icon: <FileArchive className="h-5 w-5" />, color: 'warning', label: 'ZIP' },
};

export default function LMSLibrary() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('Tất cả');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { selectedId, openDetail, close } = useDetailModal<string>({ size: 'fullscreen' });
  const selectedMaterial = selectedId ? MATERIALS.find((m) => m.id === selectedId) : null;

  const courses = ['Tất cả', ...Array.from(new Set(MATERIALS.map((m) => m.course)))];
  const types = ['all', 'video', 'pdf', 'document', 'zip'];
  const typeLabels = { all: 'Tất cả', video: 'Video', pdf: 'PDF', document: 'Tài liệu', zip: 'ZIP' };

  const filtered = MATERIALS.filter((m) => {
    const match = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.course.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    const matchCourse = courseFilter === 'Tất cả' || m.course === courseFilter;
    return match && matchType && matchCourse;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thư viện học liệu"
        description={`${MATERIALS.length} tài liệu học tập trên ${courses.length - 1} khóa học`}
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Thư viện học liệu' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/lms/thu-vien-hoc-lieu/them'}>Thêm học liệu</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng học liệu', value: MATERIALS.length, icon: <FolderOpen className="h-5 w-5" />, color: 'primary' },
          { label: 'Video bài giảng', value: MATERIALS.filter(m => m.type === 'video').length, icon: <Video className="h-5 w-5" />, color: 'error' },
          { label: 'Tài liệu PDF', value: MATERIALS.filter(m => m.type === 'pdf').length, icon: <FileText className="h-5 w-5" />, color: 'accent' },
          { label: 'Lượt xem tuần này', value: '8.2K', icon: <Play className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học liệu..."
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] w-64"
            />
          </div>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]">
            {courses.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]">
            {types.map((t) => <option key={t} value={t}>{typeLabels[t as keyof typeof typeLabels]}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded ${view === 'grid' ? 'bg-[rgb(var(--primary))] text-white' : 'text-[rgb(var(--text-muted))]'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded ${view === 'list' ? 'bg-[rgb(var(--primary))] text-white' : 'text-[rgb(var(--text-muted))]'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => {
            const tc = TYPE_CONFIG[m.type as keyof typeof TYPE_CONFIG];
            return (
              <Card key={m.id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors cursor-pointer group">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[rgb(var(--bg-base))] flex items-center justify-center overflow-hidden rounded-t-xl">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--${tc.color})/0.1)] text-[rgb(var(--${tc.color}))]`}>
                    {tc.icon}
                  </div>
                  {m.status === 'draft' && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="warning" size="sm">Nháp</Badge>
                    </div>
                  )}
                  {m.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                        <Play className="h-5 w-5 text-black ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] px-1.5 py-0.5 rounded">
                      {m.course}
                    </span>
                    <Badge variant="neutral" size="sm">{tc.label}</Badge>
                  </div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-2 leading-snug mb-2">{m.title}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-[rgb(var(--text-muted))]">
                    {m.type === 'video' && <span>⏱ {m.duration}</span>}
                    {'pages' in m && <span>📄 {m.pages} trang</span>}
                    {'items' in m && <span>📦 {m.items} files</span>}
                    <span>💾 {m.size}</span>
                  </div>
                  <div className="flex gap-1 mt-3 pt-3 border-t border-[rgb(var(--border)/0.4)]">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} className="flex-1" onClick={() => openDetail(m.id)}>Xem</Button>
                    <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={(e) => { e.stopPropagation(); window.location.href = `/lms/thu-vien-hoc-lieu/${m.id}/sua`; }}>Sửa</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {['Học liệu', 'Khóa', 'Loại', 'Thông tin', 'Kích thước', 'Lượt xem', 'Cập nhật', 'Thao tác'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {filtered.map((m) => {
                const tc = TYPE_CONFIG[m.type as keyof typeof TYPE_CONFIG];
                return (
                  <tr key={m.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${tc.color})/0.1)] text-[rgb(var(--${tc.color}))]`}>
                          {tc.icon}
                        </div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))] max-w-xs truncate">{m.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] px-1.5 py-0.5 rounded">{m.course}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="neutral" size="sm">{tc.label}</Badge></td>
                    <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">
                      {m.type === 'video' && `⏱ ${m.duration}`}
                      {'pages' in m && `📄 ${m.pages} trang`}
                      {'items' in m && `📦 ${m.items} files`}
                    </td>
                    <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{m.size}</td>
                    <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{m.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{m.updated}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => openDetail(m.id)}>Xem</Button>
                        <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => window.location.href = `/lms/thu-vien-hoc-lieu/${m.id}/sua`}>Sửa</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="h-12 w-12 text-[rgb(var(--text-muted))] mb-3" />
          <p className="text-sm text-[rgb(var(--text-secondary))]">Không tìm thấy học liệu nào</p>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedMaterial ? selectedMaterial.title : ''}
        description={selectedMaterial ? selectedMaterial.course : ''}
        size="fullscreen"
      >
        {selectedMaterial ? (
          <MaterialDetailPage id={selectedMaterial.id} />
        ) : null}
      </DetailModal>
    </div>
  );
}
