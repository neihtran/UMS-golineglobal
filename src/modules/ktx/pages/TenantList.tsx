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
  Card,
  CardContent,
  Select,
  Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const TENANTS = [
  { id: 'tt001', name: 'Nguyễn Văn An', studentId: 'SV20240001', room: 'A101', block: 'Khu A', gender: 'Nam', checkIn: '2026-09-01', checkOut: '2027-06-30', fee: '1.2M', status: 'active', debt: '0' },
  { id: 'tt002', name: 'Trần Thị Bình', studentId: 'SV20240002', room: 'B101', block: 'Khu B', gender: 'Nữ', checkIn: '2026-09-01', checkOut: '2027-06-30', fee: '1.2M', status: 'active', debt: '0' },
  { id: 'tt003', name: 'Lê Văn Cường', studentId: 'SV20230005', room: 'A201', block: 'Khu A', gender: 'Nam', checkIn: '2025-09-01', checkOut: '2026-06-30', fee: '1.0M', status: 'warning', debt: '200K' },
  { id: 'tt004', name: 'Phạm Thu Dung', studentId: 'SV20240003', room: 'B102', block: 'Khu B', gender: 'Nữ', checkIn: '2026-09-01', checkOut: '2027-06-30', fee: '1.2M', status: 'active', debt: '0' },
  { id: 'tt005', name: 'Hoàng Minh Tuấn', studentId: 'SV20230008', room: 'C301', block: 'Khu C', gender: 'Nam', checkIn: '2025-09-01', checkOut: '2026-06-30', fee: '1.0M', status: 'active', debt: '0' },
  { id: 'tt006', name: 'Đặng Thị Hà', studentId: 'SV20240004', room: 'B201', block: 'Khu B', gender: 'Nữ', checkIn: '2026-09-01', checkOut: '2027-06-30', fee: '1.2M', status: 'active', debt: '0' },
];

const BLOCKS = ['Tất cả', 'Khu A', 'Khu B', 'Khu C'];
const STATUSES: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  active: { variant: 'success', label: 'Đang ở' },
  warning: { variant: 'warning', label: 'Sắp hết hạn' },
  overstay: { variant: 'error', label: 'Quá hạn' },
  moved_out: { variant: 'neutral', label: 'Đã chuyển đi' },
};

export default function TenantList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [block, setBlock] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const [addModal, setAddModal] = useState(false);

  const filtered = TENANTS.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.studentId.toLowerCase().includes(search.toLowerCase());
    const matchBlock = block === 'Tất cả' || t.block === block;
    const matchStatus = status === 'Tất cả' || t.status === status;
    return matchSearch && matchBlock && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Sinh viên KTX"
        description="Quản lý sinh viên đang ở ký túc xá"
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
              <Input placeholder="Tìm theo tên hoặc mã SV..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={block} onChange={(e) => setBlock(e.target.value)} options={BLOCKS.map(b => ({ value: b, label: b }))} className="w-36" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[
              { value: 'Tất cả', label: 'Tất cả' }, { value: 'active', label: 'Đang ở' }, { value: 'warning', label: 'Sắp hết hạn' }, { value: 'overstay', label: 'Quá hạn' }, { value: 'moved_out', label: 'Đã chuyển đi' }
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Họ tên</TableHeadCell>
                <TableHeadCell>Phòng</TableHeadCell>
                <TableHeadCell>Khu</TableHeadCell>
                <TableHeadCell>Giới tính</TableHeadCell>
                <TableHeadCell>Ngày vào</TableHeadCell>
                <TableHeadCell>Hạn ở</TableHeadCell>
                <TableHeadCell>Công nợ</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmpty colSpan={10} message="Không tìm thấy sinh viên" />
              ) : (
                paged.map((t) => (
                  <TableRow key={t.id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{t.studentId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                          {t.name.split(' ').slice(-1)[0][0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t.name}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{t.studentId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{t.room}</TableCell>
                    <TableCell className="text-sm">{t.block}</TableCell>
                    <TableCell className="text-sm">{t.gender}</TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{t.checkIn}</TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{t.checkOut}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${t.debt !== '0' ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}`}>
                        {t.debt === '0' ? 'Không' : t.debt}
                      </span>
                    </TableCell>
                    <TableCell><Badge variant={STATUSES[t.status]?.variant ?? 'neutral'} size="sm">{STATUSES[t.status]?.label}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm">Chi tiết</Button></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
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
              options={[
                { value: 'Khu A', label: 'Khu A (Nam)' },
                { value: 'Khu B', label: 'Khu B (Nữ)' },
                { value: 'Khu C', label: 'Khu C (Nam)' },
              ]}
            />
            <Select
              label="Phòng"
              options={[
                { value: 'A101', label: 'A101 — Còn 1 chỗ' },
                { value: 'A102', label: 'A102 — Còn 1 chỗ' },
                { value: 'B101', label: 'B101 — Còn 1 chỗ' },
                { value: 'B102', label: 'B102 — Đầy' },
              ]}
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
