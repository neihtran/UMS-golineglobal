import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Home, CheckCircle2 } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ROOMS = [
  { id: 'k1', name: 'Ký túc xá A', address: 'Số 123 Đường ABC, Phường XYZ', type: 'nam', floor: 4, total: 120, occupied: 108, available: 12, gender: 'Nam', facilities: ['Wifi', 'Máy lạnh', 'Gym', 'Thư viện'], price: 1200000, image: '🏢' },
  { id: 'k2', name: 'Ký túc xá B', address: 'Số 456 Đường DEF, Phường UVW', type: 'nu', floor: 3, total: 80, occupied: 75, available: 5, gender: 'Nữ', facilities: ['Wifi', 'Máy lạnh', 'Nhà bếp', 'Sân chơi'], price: 1100000, image: '🏠' },
  { id: 'k3', name: 'Ký túc xá C', address: 'Số 789 Đường GHI, Phường RST', type: 'nam', floor: 5, total: 200, occupied: 190, available: 10, gender: 'Nam', facilities: ['Wifi', 'Máy lạnh', 'Phòng học', 'Căng tin'], price: 1000000, image: '🏗️' },
];

const REGISTRATIONS = [
  { id: 'reg1', studentId: '2022-0001', studentName: 'Nguyễn Văn An', room: 'Ký túc xá A', bed: 'A-302', status: 'registered', startDate: '2025-09-01', endDate: '2026-08-31', fee: 1200000, paid: true },
];

export default function PortalKTXRegistration() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('Tất cả');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const filtered = ROOMS.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.address.toLowerCase().includes(search.toLowerCase());
    const matchGender = genderFilter === 'Tất cả' || r.gender === genderFilter;
    return matchSearch && matchGender;
  });

  const myReg = REGISTRATIONS[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng ký Ký túc xá"
        description="Học kỳ 3, năm học 2025-2026 · Đợt đăng ký: 01/07 - 15/07/2026"
        breadcrumbs={[{ label: 'PORTAL', href: '/portal' }, { label: 'Đăng ký KTX' }]}
        actions={<Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/portal')}>Quay lại</Button>}
      />

      {/* My registration status */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-[rgb(var(--success))] bg-[rgb(var(--success)/0.04)]">
        <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))] mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Bạn đã đăng ký KTX thành công</p>
            <Badge variant="success" size="sm">Đã xác nhận</Badge>
          </div>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">
            {myReg.room} · Giường {myReg.bed} · {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(myReg.fee)}/tháng · Đã thanh toán
          </p>
        </div>
        <Button variant="outline" size="sm">Xem chi tiết</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên hoặc địa chỉ KTX..."
            className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
          />
        </div>
        <div className="flex gap-2">
          {['Tất cả', 'Nam', 'Nữ'].map(g => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`h-9 px-4 rounded-lg border text-sm font-medium transition-all ${
                genderFilter === g
                  ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                  : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Room cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((room) => {
          const occupancyRate = Math.round((room.occupied / room.total) * 100);
          return (
            <Card key={room.id} className={`overflow-hidden hover:border-[rgb(var(--primary-light))] transition-colors ${room.available === 0 ? 'opacity-60' : ''}`}>
              <div className="h-32 bg-[rgb(var(--primary)/0.1)] flex items-center justify-center text-6xl">
                {room.image}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-[rgb(var(--text-primary))]">{room.name}</h4>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{room.address}</p>
                  </div>
                  <Badge variant="neutral" size="sm">{room.gender}</Badge>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[rgb(var(--text-muted))]">Sức chứa</span>
                    <span className="text-[rgb(var(--text-secondary))]">{room.occupied}/{room.total} giường · {room.available} trống</span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${occupancyRate >= 95 ? 'bg-[rgb(var(--error))]' : occupancyRate >= 80 ? 'bg-[rgb(var(--warning))]' : 'bg-[rgb(var(--success))]'}`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1.5">
                  {room.facilities.map(f => (
                    <span key={f} className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-2 py-0.5 text-[10px] text-[rgb(var(--text-muted))]">{f}</span>
                  ))}
                </div>

                {/* Price & action */}
                <div className="flex items-center justify-between pt-2 border-t border-[rgb(var(--border)/0.4)]">
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))]">Giá/người/tháng</p>
                    <p className="text-base font-bold text-[rgb(var(--primary))]">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={room.available === 0}
                    onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
                    variant={selectedRoom === room.id ? 'primary' : 'outline'}
                  >
                    {room.available === 0 ? 'Hết chỗ' : selectedRoom === room.id ? 'Đã chọn' : 'Chọn'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-[rgb(var(--text-muted))] mx-auto mb-3" />
          <p className="text-sm text-[rgb(var(--text-muted))]">Không có ký túc xá phù hợp</p>
        </div>
      )}

      {/* Submit */}
      {selectedRoom && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] sticky bottom-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-2xl">
              {ROOMS.find(r => r.id === selectedRoom)?.image}
            </div>
            <div>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{ROOMS.find(r => r.id === selectedRoom)?.name}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ROOMS.find(r => r.id === selectedRoom)?.price || 0)}/tháng
              </p>
            </div>
          </div>
          <Button>Đăng ký ngay</Button>
        </div>
      )}
    </div>
  );
}
