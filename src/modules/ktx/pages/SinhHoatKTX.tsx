import { useState } from 'react';
import { Search, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
  Card,
  CardContent,
  Select,
  Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const BLOCKS = ['Tất cả', 'Khu A', 'Khu B', 'Khu C'];
const ACTIVITIES = ['Tất cả', 'Sinh hoạt lớp', 'Họp khu', 'Văn nghệ', 'Thể thao', 'An ninh', 'Vệ sinh', 'Khác'];

const EVENTS = [
  { id: 'e1', date: '2026-06-26', time: '19:00', name: 'Sinh hoạt lớp K60A', block: 'Khu A', room: 'A101', attendees: 42, absent: 3, type: 'Sinh hoạt lớp', leader: 'Nguyễn Văn An', status: 'present', note: 'Đầy đủ, có biên bản' },
  { id: 'e2', date: '2026-06-25', time: '20:00', name: 'Họp khu A — tháng 6', block: 'Khu A', room: 'Hội trường A', attendees: 78, absent: 2, type: 'Họp khu', leader: 'Lê Văn Cường', status: 'present', note: 'Bàn về PCCC' },
  { id: 'e3', date: '2026-06-24', time: '15:00', name: 'Giải bóng đá KTX 2026', block: 'Khu B', room: 'Sân B', attendees: 60, absent: 0, type: 'Thể thao', leader: 'Trần Thị Bình', status: 'present', note: 'Khu B thắng 3-1' },
  { id: 'e4', date: '2026-06-23', time: '18:00', name: 'Văn nghệ KTX — tháng 6', block: 'Khu C', room: 'Hội trường C', attendees: 55, absent: 5, type: 'Văn nghệ', leader: 'Phạm Thu Dung', status: 'partial', note: 'Thiếu 5 SV K60' },
  { id: 'e5', date: '2026-06-22', time: '08:00', name: 'Kiểm tra phòng ở tháng 6', block: 'Khu A', room: 'Tất cả', attendees: 120, absent: 0, type: 'Vệ sinh', leader: 'Hoàng Minh Tuấn', status: 'present', note: 'Tất cả đạt' },
  { id: 'e6', date: '2026-06-21', time: '21:00', name: 'Tuần tra an ninh đêm', block: 'Khu B', room: 'Khu B', attendees: 8, absent: 0, type: 'An ninh', leader: 'Đặng Thị Hà', status: 'present', note: 'Phát hiện 1 trường hợp vi phạm giờ giới nghiêm' },
];

const ATTENDANCE_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error'; label: string; icon: React.ReactNode }> = {
  present: { variant: 'success', label: 'Đầy đủ', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  partial: { variant: 'warning', label: 'Còn thiếu', icon: <Clock className="h-3.5 w-3.5" /> },
  absent: { variant: 'error', label: 'Hủy / Vắng', icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default function SinhHoatKTX() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [block, setBlock] = useState('Tất cả');
  const [activityType, setActivityType] = useState('Tất cả');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createModal, setCreateModal] = useState(false);

  const filtered = EVENTS.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.leader.toLowerCase().includes(search.toLowerCase());
    const matchBlock = block === 'Tất cả' || e.block === block;
    const matchType = activityType === 'Tất cả' || e.type === activityType;
    const matchDateFrom = !dateFrom || e.date >= dateFrom;
    const matchDateTo = !dateTo || e.date <= dateTo;
    return matchSearch && matchBlock && matchType && matchDateFrom && matchDateTo;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const totalEvents = EVENTS.length;
  const totalPresent = EVENTS.filter(e => e.status === 'present').length;
  const totalPartial = EVENTS.filter(e => e.status === 'partial').length;
  const totalAttendees = EVENTS.reduce((sum, e) => sum + e.attendees, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sinh hoạt KTX"
        description="Quản lý sinh hoạt, sự kiện và tham gia của sinh viên KTX"
        breadcrumbs={[{ label: 'KTX' }, { label: 'Sinh hoạt' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Users className="h-4 w-4" />}>Xuất báo cáo</Button>
            <Button leftIcon={<Users className="h-4 w-4" />} onClick={() => setCreateModal(true)}>Tạo hoạt động mới</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Tổng hoạt động</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{totalEvents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Đầy đủ</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{totalPresent}</p>
              <p className="text-xs text-[rgb(var(--success))]">{Math.round(totalPresent / totalEvents * 100)}% đạt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Còn thiếu</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{totalPartial}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">Tổng tham gia</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{totalAttendees}</p>
              <p className="text-xs text-[rgb(var(--accent))]">lượt người</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input placeholder="Tìm hoạt động, người phụ trách..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={block} onChange={(e) => { setBlock(e.target.value); setPage(1); }} options={BLOCKS.map(b => ({ value: b, label: b }))} className="w-36" />
            <Select value={activityType} onChange={(e) => { setActivityType(e.target.value); setPage(1); }} options={ACTIVITIES.map(a => ({ value: a, label: a }))} className="w-44" />
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40" label="Từ ngày" />
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40" label="Đến ngày" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tên hoạt động</TableHeadCell>
                <TableHeadCell>Ngày / Giờ</TableHeadCell>
                <TableHeadCell>Khu / Địa điểm</TableHeadCell>
                <TableHeadCell>Loại</TableHeadCell>
                <TableHeadCell>Người phụ trách</TableHeadCell>
                <TableHeadCell>Tham gia</TableHeadCell>
                <TableHeadCell>Tình trạng</TableHeadCell>
                <TableHeadCell>Ghi chú</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmpty colSpan={8} message="Không tìm thấy hoạt động nào" />
              ) : (
                paged.map((e) => {
                  const ac = ATTENDANCE_CONFIG[e.status];
                  return (
                    <TableRow key={e.id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{e.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">Mã: {e.id}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{e.date}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{e.time}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{e.block}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{e.room}</p>
                      </TableCell>
                      <TableCell className="text-sm">{e.type}</TableCell>
                      <TableCell className="text-sm">{e.leader}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-[rgb(var(--success))]">{e.attendees}</span>
                          {e.absent > 0 && (
                            <span className="text-xs text-[rgb(var(--error))]">/ {e.attendees + e.absent} (-{e.absent})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ac.variant} size="sm" dot>{ac.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[rgb(var(--text-secondary))] max-w-[160px] truncate" title={e.note}>
                        {e.note}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </CardContent>
      </Card>

      {/* Modal: Tạo hoạt động mới */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tạo hoạt động sinh hoạt KTX" size="lg">
        <div className="space-y-4">
          <Input label="Tên hoạt động" placeholder="VD: Sinh hoạt lớp K60A, Giải bóng đá KTX 2026..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ngày tổ chức" type="date" />
            <Input label="Giờ tổ chức" type="time" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Khu"
              options={[
                { value: 'Khu A', label: 'Khu A' },
                { value: 'Khu B', label: 'Khu B' },
                { value: 'Khu C', label: 'Khu C' },
                { value: 'Toàn KTX', label: 'Toàn KTX' },
              ]}
            />
            <Select
              label="Loại hoạt động"
              options={[
                { value: 'sinh-hoat-lop', label: 'Sinh hoạt lớp' },
                { value: 'hop-khu', label: 'Họp khu' },
                { value: 'van-nghe', label: 'Văn nghệ' },
                { value: 'the-thao', label: 'Thể thao' },
                { value: 'an-ninh', label: 'An ninh' },
                { value: 've-sinh', label: 'Vệ sinh' },
                { value: 'khac', label: 'Khác' },
              ]}
            />
          </div>
          <Input label="Địa điểm / phòng" placeholder="VD: Hội trường A, Sân B..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Người phụ trách" placeholder="Họ và tên" />
            <Input label="Số người tham gia (dự kiến)" placeholder="VD: 50" />
          </div>
          <Input label="Nội dung / mô tả" placeholder="Mô tả chi tiết hoạt động..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Hủy</Button>
            <Button onClick={() => setCreateModal(false)}>Tạo hoạt động</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
