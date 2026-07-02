import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Download, Eye } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const REPORTS = [
  { id: 'r1', title: 'Báo cáo công tác Đảng Q1/2026', type: 'Báo cáo quý', date: '2026-04-10', author: 'PMS-01', status: 'approved' },
  { id: 'r2', title: 'Báo cáo kiểm điểm đảng viên năm 2025', type: 'Kiểm điểm', date: '2026-01-15', author: 'PMS-02', status: 'approved' },
  { id: 'r3', title: 'Báo cáo phát triển đảng viên mới 2025', type: 'Thống kê', date: '2026-01-20', author: 'PMS-03', status: 'approved' },
  { id: 'r4', title: 'Kế hoạch công tác Đảng Q2/2026', type: 'Kế hoạch', date: '2026-06-01', author: 'PMS-01', status: 'draft' },
  { id: 'r5', title: 'Báo cáo giám sát đảng viên', type: 'Giám sát', date: '2026-05-15', author: 'PMS-02', status: 'pending' },
];

export default function PMSReportListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = REPORTS.filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo Đảng"
        description={`${REPORTS.length} báo cáo`}
        breadcrumbs={[{ label: 'PMS', href: '/pms' }, { label: 'Báo cáo' }]}
        actions={<Button leftIcon={<Download className="h-4 w-4" />} variant="outline" size="sm">Xuất báo cáo</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm báo cáo..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{r.title}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{r.author} · {r.date}</p>
              </div>
              <Badge variant="neutral" size="sm">{r.type}</Badge>
              <Badge variant={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'neutral'} dot size="sm">
                {r.status === 'approved' ? 'Đã duyệt' : r.status === 'pending' ? 'Chờ duyệt' : 'Nháp'}
              </Badge>
              <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/pms/bao-cao/chi-tiet/${r.id}`)}>Chi tiết</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
