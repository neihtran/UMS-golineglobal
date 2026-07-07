import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Bed,
  Download,
  Plus,
  Home,
  Wrench,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const ROOMS = [
  { id: 'A101', block: 'Khu A', floor: 1, capacity: 6, occupied: 6, gender: 'Nam', status: 'full', issues: 0 },
  { id: 'A102', block: 'Khu A', floor: 1, capacity: 6, occupied: 5, gender: 'Nam', status: 'available', issues: 0 },
  { id: 'A201', block: 'Khu A', floor: 2, capacity: 6, occupied: 6, gender: 'Nam', status: 'full', issues: 1 },
  { id: 'B101', block: 'Khu B', floor: 1, capacity: 8, occupied: 7, gender: 'Nữ', status: 'available', issues: 0 },
  { id: 'B102', block: 'Khu B', floor: 1, capacity: 8, occupied: 8, gender: 'Nữ', status: 'full', issues: 0 },
  { id: 'B201', block: 'Khu B', floor: 2, capacity: 8, occupied: 6, gender: 'Nữ', status: 'available', issues: 2 },
  { id: 'C301', block: 'Khu C', floor: 3, capacity: 4, occupied: 4, gender: 'Nam', status: 'full', issues: 0 },
  { id: 'C302', block: 'Khu C', floor: 3, capacity: 4, occupied: 3, gender: 'Nam', status: 'available', issues: 0 },
];

const OCCUPANCY = [
  { name: 'Khu A', used: 78, total: 84 },
  { name: 'Khu B', used: 92, total: 112 },
  { name: 'Khu C', used: 44, total: 56 },
];

const REQUESTS = [
  { id: 'r1', student: 'Nguyễn Văn An', room: 'A102', type: 'Chuyển phòng', reason: 'Gần khoa hơn', status: 'pending', date: '2026-06-22' },
  { id: 'r2', student: 'Trần Thị Bình', room: 'B201', type: 'Sửa chữa', reason: 'Bóng đèn hỏng, ổ cắm lỏng', status: 'pending', date: '2026-06-23' },
  { id: 'r3', student: 'Lê Hoàng Nam', room: 'C302', type: 'Gia hạn', reason: 'Học kỳ 3', status: 'approved', date: '2026-06-20' },
  { id: 'r4', student: 'Phạm Thu Lan', room: 'B102', type: 'Đăng ký mới', reason: 'Sinh viên năm nhất K60', status: 'pending', date: '2026-06-24' },
];

const BLOCKS_KEYS = ['all', 'Khu A', 'Khu B', 'Khu C'];

export default function KTXDashboard() {
  const { t } = useTranslation('ktx');
  const navigate = useNavigate();
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const blocks = BLOCKS_KEYS.map(k => k === 'all' ? t('filter.all') : k);

  const KTX_STATS = [
    { label: t('dashboard.totalRooms'), value: '120', change: '+10 ' + t('dashboard.newRooms'), icon: <Bed className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.occupying'), value: '412', sub: '88.5% ' + t('dashboard.capacity'), icon: <Users className="h-5 w-5" />, color: 'success' },
    { label: t('dashboard.emptyRooms'), value: '14', sub: 'Khu A: 8, Khu B: 6', icon: <Home className="h-5 w-5" />, color: 'accent' },
    { label: t('dashboard.debtWarning'), value: '23', sub: '⚠️ ' + t('dashboard.collectDebt'), icon: <CreditCard className="h-5 w-5" />, color: 'error' },
  ];

  const filteredRooms = ROOMS.filter((r) => blockFilter === 'all' || r.block === blockFilter);

  const ROOM_STATUS_I18N: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    full: { variant: 'success', label: t('room.status.full') },
    available: { variant: 'warning', label: t('room.status.availableShort') },
    maintenance: { variant: 'neutral', label: t('room.status.maintenance') },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'KTX' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/ktx/dang-ky')}>{t('registerNew')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KTX_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.roomList')}</h3>
            <div className="flex gap-2">
              {blocks.map((block) => (
                <button
                  key={block}
                  onClick={() => setBlockFilter(block === t('filter.all') ? 'all' : block)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    (blockFilter === 'all' && block === t('filter.all')) || blockFilter === block
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08] text-[rgb(var(--primary))]'
                      : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3]'
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {[t('table.room'), t('table.block'), t('table.floor'), t('table.gender'), t('table.capacity'), t('dashboard.occupying'), t('table.condition'), t('table.incident'), ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {filteredRooms.map((room) => {
                  const sc = ROOM_STATUS_I18N[room.status];
                  return (
                    <tr key={room.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-[rgb(var(--text-primary))]">{room.id}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{room.block}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{room.floor}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={room.gender === 'Nam' ? 'info' : 'accent'} size="sm">{room.gender}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{room.capacity}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{room.occupied}</td>
                      <td className="px-4 py-2.5"><Badge variant={sc.variant} size="sm">{sc.label}</Badge></td>
                      <td className="px-4 py-2.5">
                        {room.issues > 0 ? (
                          <Badge variant="warning" size="sm">{room.issues} {t('room.incident')}</Badge>
                        ) : (
                          <span className="text-xs text-[rgb(var(--success))]">✓ {t('room.ok')}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/ktx/phong/${room.id}`)}>{t('room.detail')}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[rgb(var(--warning))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.pendingRequests')}</h3>
            </div>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {REQUESTS.map((req) => (
              <div key={req.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{req.student}</p>
                  <Badge
                    variant={req.status === 'pending' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {req.status === 'pending' ? t('dashboard.pending') : t('dashboard.approved')}
                  </Badge>
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{req.type} · {t('table.room')} {req.room}</p>
                <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">{req.reason}</p>
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">{t('dashboard.reject')}</Button>
                    <Button size="sm">{t('dashboard.approve')}</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.capacityByBlock')}</h3>
        </div>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={OCCUPANCY} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} domain={[0, 120]} />
              <Tooltip
                contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name: string) => [`${v} ${t('dashboard.occupancy')}`, name === 'used' ? t('dashboard.used') : t('dashboard.total')]}
              />
              <Bar dataKey="total" fill="rgb(var(--border))" radius={[4, 4, 0, 0]} name={t('dashboard.total')}  animationDuration={1500} animationEasing="ease-out" />
              <Bar dataKey="used" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.used')}  animationDuration={1500} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
