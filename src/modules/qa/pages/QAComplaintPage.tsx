import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Megaphone } from 'lucide-react';
import { Badge, Card, CardContent, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COMPLAINTS = [
  { id: 'c1', code: 'KN001', title: 'Khiếu nại về chất lượng giảng dạy môn Python', category: 'Chất lượng GD', from: 'SV2026003', date: '2026-06-20', status: 'pending', priority: 'high' },
  { id: 'c2', code: 'KN002', title: 'Phản ánh về cơ sở vật chất phòng lab A3', category: 'CSVC', from: 'SV2026001', date: '2026-06-18', status: 'in-progress', priority: 'medium' },
  { id: 'c3', code: 'KN003', title: 'Khiếu nại thời gian thi không phù hợp', category: 'Thi cử', from: 'SV2026004', date: '2026-06-15', status: 'resolved', priority: 'low' },
  { id: 'c4', code: 'KN004', title: 'Yêu cầu xem lại điểm thi giữa kỳ', category: 'Điểm thi', from: 'SV2026005', date: '2026-06-22', status: 'pending', priority: 'high' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  resolved: { variant: 'success', label: 'Đã giải quyết' },
  'in-progress': { variant: 'warning', label: 'Đang xử lý' },
  pending: { variant: 'neutral', label: 'Chờ tiếp nhận' },
};
const PRIORITY_CONFIG: Record<string, 'error' | 'warning' | 'success'> = { high: 'error', medium: 'warning', low: 'success' };

export default function QAComplaintPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = COMPLAINTS.filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khiếu nại & Phản ánh"
        description={`${COMPLAINTS.length} khiếu nại`}
        breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: 'Khiếu nại' }]}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khiếu nại..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((c) => {
          const sc = STATUS_CONFIG[c.status];
          return (
            <Card key={c.id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[rgb(var(--text-muted))]">{c.code}</span>
                    <Badge variant={PRIORITY_CONFIG[c.priority]} size="sm">{c.priority === 'high' ? 'Cao' : c.priority === 'medium' ? 'TB' : 'Thấp'}</Badge>
                    <Badge variant="neutral" size="sm">{c.category}</Badge>
                    <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                  </div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.title}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Từ: {c.from} · {c.date}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/qa/khieu-nai/${c.id}`)}>Xem</Button>
                  {c.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm">Tiếp nhận</Button>
                      <Button variant="ghost" size="sm">Từ chối</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
