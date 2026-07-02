import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Building2, Eye } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ROOMS = [
  { id: 'r1', code: 'A101', floor: 'Tầng 1', type: 'Nam', capacity: 6, occupied: 5, status: 'available', building: 'Khu A' },
  { id: 'r2', code: 'A102', floor: 'Tầng 1', type: 'Nữ', capacity: 6, occupied: 6, status: 'full', building: 'Khu A' },
  { id: 'r3', code: 'B201', floor: 'Tầng 2', type: 'Nam', capacity: 8, occupied: 7, status: 'available', building: 'Khu B' },
  { id: 'r4', code: 'B202', floor: 'Tầng 2', type: 'Nữ', capacity: 8, occupied: 3, status: 'available', building: 'Khu B' },
  { id: 'r5', code: 'C301', floor: 'Tầng 3', type: 'Nam', capacity: 4, occupied: 4, status: 'full', building: 'Khu C' },
  { id: 'r6', code: 'C302', floor: 'Tầng 3', type: 'Nam', capacity: 4, occupied: 2, status: 'available', building: 'Khu C' },
];

const TYPES_KEYS = ['all', 'Nam', 'Nữ'];

export default function KTXRoomPage() {
  const { t } = useTranslation('ktx');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'error' | 'warning'; label: string }> = {
    available: { variant: 'success', label: t('room.status.availableShort') },
    full: { variant: 'error', label: t('room.status.fullShort') },
  };

  const types = TYPES_KEYS.map(k => k === 'all' ? t('filter.all') : k);

  const filtered = ROOMS.filter((r) => {
    const match = !search || r.code.toLowerCase().includes(search.toLowerCase()) || r.building.includes(search);
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return match && matchType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('room.title')}
        description={t('room.description', { count: ROOMS.length, resident: ROOMS.reduce((s, r) => s + r.occupied, 0) })}
        breadcrumbs={[{ label: 'KTX', href: '/ktx' }, { label: t('room.breadcrumb') }]}
        actions={<Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />} onClick={() => navigate('/ktx/phong/A102')}>{t('room.viewDetail')}</Button>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t('dashboard.totalRooms'), value: ROOMS.length, color: 'primary' },
          { label: t('room.status.available'), value: ROOMS.filter(r => r.status === 'available').length, color: 'success' },
          { label: t('room.status.full'), value: ROOMS.filter(r => r.status === 'full').length, color: 'error' },
          { label: t('room.resident'), value: ROOMS.reduce((s, r) => s + r.occupied, 0), color: 'accent' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('room.search')} className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
        {types.map((typeLabel, i) => (
          <button key={typeLabel} onClick={() => setTypeFilter(TYPES_KEYS[i])}
            className={`h-9 rounded-lg border px-3 text-sm font-medium transition-colors ${typeFilter === TYPES_KEYS[i] ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08] text-[rgb(var(--primary))]' : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3]'}`}>
            {typeLabel}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((r) => {
          const pct = Math.round((r.occupied / r.capacity) * 100);
          return (
            <Card key={r.id} className="hover:border-[rgb(var(--primary)/0.3] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${r.type === 'Nam' ? 'bg-[rgb(var(--primary)/0.1] text-[rgb(var(--primary))]' : 'bg-[rgb(var(--accent)/0.1] text-[rgb(var(--accent))]'}`}>
                      {r.code}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{r.building} · {r.floor}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{r.type === 'Nam' ? '🏠 Nam' : '🏠 Nữ'}</p>
                    </div>
                  </div>
                  <Badge variant={STATUS_CONFIG[r.status].variant} dot size="sm">{STATUS_CONFIG[r.status].label}</Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[rgb(var(--text-muted))]">{t('room.resident')}</span>
                    <span className="font-bold text-[rgb(var(--text-primary))]">{r.occupied}/{r.capacity}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.status === 'full' ? 'bg-[rgb(var(--error))]' : 'bg-[rgb(var(--success))]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[rgb(var(--text-muted))] text-right">{pct}% {t('room.occupancy')}</p>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate(`/ktx/phong/${r.code}`)}>{t('room.detail')}</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
