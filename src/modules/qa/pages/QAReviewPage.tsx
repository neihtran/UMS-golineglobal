import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const REVIEWS = [
  { id: 'r1', code: 'KD2026001', name: 'Kiểm định chương trình CNTT', type: 'Kiểm định CTĐT', standard: 'AUN-QA', status: 'in-progress', deadline: '2026-09-30', progress: 65 },
  { id: 'r2', code: 'KD2025003', name: 'Đánh giá nội bộ hệ thống quản lý', type: 'Đánh giá nội bộ', standard: 'ISO 9001', status: 'in-progress', deadline: '2026-08-15', progress: 40 },
  { id: 'r3', code: 'KD2024001', name: 'Kiểm định chương trình Kế toán', type: 'Kiểm định CTĐT', standard: 'AUN-QA', status: 'completed', deadline: '2025-12-31', progress: 100 },
  { id: 'r4', code: 'KD2026002', name: 'Cập nhật hồ sơ kiểm định Vật lý', type: 'Cập nhật HS', standard: 'AUN-QA', status: 'pending', deadline: '2026-12-31', progress: 10 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  completed: { variant: 'success', label: 'Hoàn thành' },
  'in-progress': { variant: 'warning', label: 'Đang thực hiện' },
  pending: { variant: 'neutral', label: 'Chưa bắt đầu' },
};

export default function QAReviewPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = REVIEWS.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiểm định chất lượng"
        description={`${REVIEWS.length} hoạt động kiểm định`}
        breadcrumbs={[{ label: 'QA', href: '/qa' }, { label: 'Kiểm định' }]}
        actions={<Button variant="outline" size="sm">Xem tiêu chuẩn</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiểm định..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
      </div>
      <div className="space-y-4">
        {filtered.map((r) => {
          const sc = STATUS_CONFIG[r.status];
          return (
            <Card key={r.id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{r.code}</p>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{r.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="neutral" size="sm">{r.type}</Badge>
                      <Badge variant="accent" size="sm">{r.standard}</Badge>
                      <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[rgb(var(--text-muted))]">Hạn chót</p>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{r.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgb(var(--text-muted))]">Tiến độ</span>
                      <span className="font-semibold text-[rgb(var(--text-primary))]">{r.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.status === 'completed' ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--primary))]'}`}
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/qa/kiem-dinh/${r.id}`)}>Xem</Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/qa/kiem-dinh/${r.id}/minh-chung`)}>Minh chứng</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
