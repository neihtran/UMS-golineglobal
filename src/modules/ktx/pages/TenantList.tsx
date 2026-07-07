import { useState } from 'react';
import { Search, Download, UserPlus } from 'lucide-react';
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
  TableSkeleton,
  Card,
  CardContent,
  Select,
  Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useRoomRegistrationList, useRoomList } from '@/hooks/useKtx';
import { useDepartmentList } from '@/hooks/useHrm';
import type { RoomRegistrationFilters } from '@/services/ktx.service';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  pending: { variant: 'warning', label: 'Chờ duyệt' },
  approved: { variant: 'success', label: 'Đã duyệt' },
  checked_in: { variant: 'success', label: 'Đang ở' },
  checked_out: { variant: 'neutral', label: 'Đã chuyển đi' },
  rejected: { variant: 'error', label: 'Từ chối' },
  cancelled: { variant: 'neutral', label: 'Đã hủy' },
};

export default function TenantList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [block, setBlock] = useState('');
  const [addModal, setAddModal] = useState(false);

  const { data: deptData } = useDepartmentList({ pageSize: 100 });
  const buildings = deptData?.data ?? [];
  const { data: roomsData } = useRoomList({ pageSize: 200 });
  const rooms = roomsData?.data ?? [];

  const filters = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: status || undefined,
    sortBy: 'createdAt',
    sortDir: 'desc',
  } as RoomRegistrationFilters;

  const { data, isLoading } = useRoomRegistrationList(filters);

  const list: any[] = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const filtered = list;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Sinh viên KTX"
        description={`${total} sinh viên đăng ký KTX`}
        breadcrumbs={[{ label: 'KTX' }, { label: 'Sinh viên' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setAddModal(true)}>Nhận sinh viên mới</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <Input
                placeholder="Tìm theo tên hoặc mã SV..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select
              value={block}
              onChange={(e) => { setBlock(e.target.value); setPage(1); }}
              options={[{ value: '', label: 'Tất cả khu' }, ...buildings.map((b: any) => ({ value: b._id, label: b.name }))]}
              className="w-36"
            />
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              options={[
                { value: 'Tất cả', label: 'Tất cả' },
                { value: 'pending', label: 'Chờ duyệt' },
                { value: 'approved', label: 'Đã duyệt' },
                { value: 'checked_in', label: 'Đang ở' },
                { value: 'checked_out', label: 'Đã chuyển đi' },
                { value: 'rejected', label: 'Từ chối' },
              ]}
              className="w-36"
            />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Họ tên</TableHeadCell>
                <TableHeadCell>Phòng</TableHeadCell>
                <TableHeadCell>Khu</TableHeadCell>
                <TableHeadCell>Ngày vào</TableHeadCell>
                <TableHeadCell>Ngày ra</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton colSpan={8} rows={6} />
              ) : filtered.length === 0 ? (
                <TableEmpty colSpan={8} message="Không tìm thấy sinh viên" />
              ) : (
                filtered.map((reg: any, _i: number) => {
                  const sc = STATUS_CONFIG[reg.status] ?? { variant: 'neutral' as const, label: reg.status ?? '—' };
                  const initials = reg.studentName
                    ? reg.studentName.split(' ').slice(-1)[0][0]
                    : '?';

                  return (
                    <TableRow key={reg._id ?? reg.id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">
                        {reg.studentCode ?? reg.studentId ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                              {reg.studentName ?? '—'}
                            </p>
                            <p className="text-xs text-[rgb(var(--text-muted))]">
                              {reg.studentCode ?? reg.studentId ?? ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{reg.roomNumber ?? '—'}</TableCell>
                      <TableCell className="text-sm">{reg.building ?? '—'}</TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">
                        {reg.checkInDate ? new Date(reg.checkInDate).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-[rgb(var(--text-secondary))]">
                        {reg.checkOutDate ? new Date(reg.checkOutDate).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Chi tiết</Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Modal: Nhận sinh viên mới */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Nhận sinh viên vào KTX" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mã sinh viên" placeholder="VD: SV20240007" />
            <Input label="Họ tên" placeholder="Họ và tên đầy đủ" />
            <Select
              label="Giới tính"
              options={[
                { value: 'Nam', label: 'Nam' },
                { value: 'Nữ', label: 'Nữ' },
              ]}
            />
            <Input label="Ngày sinh" type="date" />
            <Select
              label="Khu"
              options={buildings.map((b: any) => ({ value: b._id, label: b.name }))}
            />
            <Select
              label="Phòng"
              options={rooms.map((r: any) => ({
                value: r._id,
                label: `${r.roomNumber} — ${r.building} — Còn ${Math.max(0, r.capacity - r.currentOccupancy)} chỗ`,
              }))}
            />
            <Input label="Ngày nhận phòng" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            <Input label="Hạn ở (kết thúc)" type="date" />
          </div>
          <hr className="border-[rgb(var(--border))]" />
          <Input label="Số điện thoại" placeholder="090x xxx xxx" />
          <Input label="Ghi chú" placeholder="Thông tin bổ sung, lý do đặc biệt..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddModal(false)}>Hủy</Button>
            <Button onClick={() => setAddModal(false)}>Xác nhận nhận cư dân</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
