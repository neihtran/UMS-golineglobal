import { useMemo, useState } from 'react';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useRoomList,
  useRoomRegistrationList,
} from '@/hooks/useKtx';

export default function KTXDashboard() {
  const { t } = useTranslation('ktx');
  const navigate = useNavigate();
  const [blockFilter, setBlockFilter] = useState<string>('all');

  // Fetch rooms (pageSize limit because list endpoint is paginated)
  const roomsQuery = useRoomList({ page: 1, pageSize: 200 });
  const rooms = roomsQuery.data?.data ?? [];

  // Fetch pending room registrations
  const registrationsQuery = useRoomRegistrationList({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });
  const registrations = registrationsQuery.data?.data ?? [];

  // Departments for block filter (KTX uses building/floor concept, but we fall back
  // to deriving unique buildings from fetched rooms)
  const buildings = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      if (r.building) set.add(r.building);
    });
    return ['all', ...Array.from(set).sort()];
  }, [rooms]);

  const blocks = buildings.map((k) => (k === 'all' ? t('filter.all') : k));

  // Compute dashboard statistics from real data
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalOccupied = rooms.reduce(
    (sum, r) => sum + (r.currentOccupancy || 0),
    0,
  );
  const occupancyPct =
    totalCapacity > 0
      ? Math.round((totalOccupied / totalCapacity) * 1000) / 10
      : 0;
  const emptyRooms = rooms.filter((r) => r.status === 'available').length;
  const maintenanceRooms = rooms.filter(
    (r) => r.status === 'maintenance' || r.status === 'closed',
  ).length;
  const availableByBuilding = rooms
    .filter((r) => r.status === 'available')
    .reduce<Record<string, number>>((acc, r) => {
      const b = r.building || '—';
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {});
  const emptyRoomsSub = Object.entries(availableByBuilding)
    .map(([b, c]) => `${b}: ${c}`)
    .join(', ');

  const pendingRequests = registrations.filter(
    (r) => r.status === 'pending',
  );

  const KTX_STATS = [
    {
      label: t('dashboard.totalRooms'),
      value: totalRooms.toLocaleString('vi-VN'),
      sub: maintenanceRooms > 0 ? `${maintenanceRooms} bảo trì` : undefined,
      icon: <Bed className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: t('dashboard.occupying'),
      value: totalOccupied.toLocaleString('vi-VN'),
      sub: `${occupancyPct}% ${t('dashboard.capacity')}`,
      icon: <Users className="h-5 w-5" />,
      color: 'success',
    },
    {
      label: t('dashboard.emptyRooms'),
      value: emptyRooms.toLocaleString('vi-VN'),
      sub: emptyRoomsSub || '—',
      icon: <Home className="h-5 w-5" />,
      color: 'accent',
    },
    {
      label: t('dashboard.debtWarning'),
      value: pendingRequests.length.toLocaleString('vi-VN'),
      sub: `⚠️ ${t('dashboard.collectDebt')}`,
      icon: <CreditCard className="h-5 w-5" />,
      color: 'error',
    },
  ];

  const filteredRooms = rooms.filter(
    (r) => blockFilter === 'all' || r.building === blockFilter,
  );

  const ROOM_STATUS_I18N: Record<
    string,
    { variant: 'success' | 'warning' | 'neutral'; label: string }
  > = {
    full: { variant: 'success', label: t('room.status.full') },
    available: { variant: 'warning', label: t('room.status.availableShort') },
    maintenance: { variant: 'neutral', label: t('room.status.maintenance') },
    closed: { variant: 'neutral', label: t('room.status.closed', 'Đã đóng') },
  };

  const genderLabel = (g?: string) => {
    if (g === 'male') return 'Nam';
    if (g === 'female') return 'Nữ';
    return 'Hỗn hợp';
  };

  const occupancyData = useMemo(() => {
    const grouped = rooms.reduce<
      Record<string, { used: number; total: number }>
    >((acc, r) => {
      const b = r.building || '—';
      if (!acc[b]) acc[b] = { used: 0, total: 0 };
      acc[b].used += r.currentOccupancy || 0;
      acc[b].total += r.capacity || 0;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, v]) => ({
      name,
      used: v.used,
      total: v.total,
    }));
  }, [rooms]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'KTX' }]}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
            >
              {t('export')}
            </Button>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/ktx/dang-ky')}
            >
              {t('registerNew')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KTX_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                  {s.value}
                </p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
              {t('dashboard.roomList')}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {blocks.map((block) => (
                <button
                  key={block}
                  onClick={() =>
                    setBlockFilter(block === t('filter.all') ? 'all' : block)
                  }
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    (blockFilter === 'all' && block === t('filter.all')) ||
                    blockFilter === block
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
                  {[
                    t('table.room'),
                    t('table.block'),
                    t('table.floor'),
                    t('table.gender'),
                    t('table.capacity'),
                    t('dashboard.occupying'),
                    t('table.condition'),
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {roomsQuery.isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]"
                    >
                      {t('common:common.loading')}
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]"
                    >
                      Không có phòng nào
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => {
                    const sc = ROOM_STATUS_I18N[room.status] ??
                      ROOM_STATUS_I18N.available;
                    return (
                      <tr
                        key={room._id}
                        className="hover:bg-[rgb(var(--bg-hover))] transition-colors"
                      >
                        <td className="px-4 py-2.5 font-semibold text-[rgb(var(--text-primary))]">
                          {room.roomNumber}
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">
                          {room.building}
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">
                          {room.floor}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant={
                              room.genderAllowed === 'male' ? 'info' : 'accent'
                            }
                            size="sm"
                          >
                            {genderLabel(room.genderAllowed)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">
                          {room.capacity}
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">
                          {room.currentOccupancy}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant={sc.variant} size="sm">
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/ktx/phong/${room._id}`)
                            }
                          >
                            {t('room.detail')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[rgb(var(--warning))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                {t('dashboard.pendingRequests')}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {registrationsQuery.isLoading ? (
              <p className="px-5 py-3 text-sm text-[rgb(var(--text-muted))]">
                {t('common:common.loading')}
              </p>
            ) : registrations.length === 0 ? (
              <p className="px-5 py-3 text-sm text-[rgb(var(--text-muted))]">
                Không có yêu cầu nào
              </p>
            ) : (
              registrations.slice(0, 4).map((req) => (
                <div key={req._id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {req.studentName ?? req.studentCode ?? req.studentId}
                    </p>
                    <Badge
                      variant={
                        req.status === 'pending' ? 'warning' : 'success'
                      }
                      size="sm"
                    >
                      {req.status === 'pending'
                        ? t('dashboard.pending')
                        : t('dashboard.approved')}
                    </Badge>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">
                    {t('table.room')} {req.roomNumber ?? req.roomId}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">
                    {req.note ?? req.reason ?? '—'}
                  </p>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">
                        {t('dashboard.reject')}
                      </Button>
                      <Button size="sm">{t('dashboard.approve')}</Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">
            {t('dashboard.capacityByBlock')}
          </h3>
        </div>
        <CardContent className="h-64">
          {occupancyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-[rgb(var(--text-muted))]">
              Chưa có dữ liệu công suất
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={occupancyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'dataMax + 10']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--bg-card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number, name: string) => [
                    `${v} ${t('dashboard.occupancy')}`,
                    name === 'used'
                      ? t('dashboard.used')
                      : t('dashboard.total'),
                  ]}
                />
                <Bar
                  dataKey="total"
                  fill="rgb(var(--border))"
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard.total')}
                />
                <Bar
                  dataKey="used"
                  fill="rgb(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard.used')}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
