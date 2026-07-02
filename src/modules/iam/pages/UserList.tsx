import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Download, Upload } from 'lucide-react';
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
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const MOCK_USERS = [
  { id: 'u001', name: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn', role: 'admin', unit: 'Phòng CNTT', status: 'active', lastLogin: '2026-06-25 09:15' },
  { id: 'u002', name: 'Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', role: 'giang-vien', unit: 'Khoa CNTT', status: 'active', lastLogin: '2026-06-25 08:30' },
  { id: 'u003', name: 'Nguyễn Văn An', email: 'an.nguyen@truong.edu.vn', role: 'sinh-vien', unit: 'K60 – CNTT', status: 'active', lastLogin: '2026-06-24 22:10' },
  { id: 'u004', name: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn', role: 'nhan-vien', unit: 'Phòng Tổ chức', status: 'active', lastLogin: '2026-06-25 07:45' },
  { id: 'u005', name: 'Lê Thị Bình', email: 'binh.le@truong.edu.vn', role: 'sinh-vien', unit: 'K59 – Kinh tế', status: 'locked', lastLogin: '2026-06-20 14:00' },
  { id: 'u006', name: 'Trần Minh Đức', email: 'minh.duc@truong.edu.vn', role: 'giang-vien', unit: 'Khoa Kinh tế', status: 'active', lastLogin: '2026-06-24 16:20' },
  { id: 'u007', name: 'Phạm Hoàng Nam', email: 'nam.pham@truong.edu.vn', role: 'sinh-vien', unit: 'K60 – Luật', status: 'pending', lastLogin: '—' },
  { id: 'u008', name: 'Đặng Thu Hà', email: 'ha.dang@truong.edu.vn', role: 'giang-vien', unit: 'Khoa Luật', status: 'active', lastLogin: '2026-06-23 11:30' },
  { id: 'u009', name: 'Bùi Minh Tuấn', email: 'tuan.bui@truong.edu.vn', role: 'nhan-vien', unit: 'Phòng Tài chính', status: 'active', lastLogin: '2026-06-25 08:00' },
  { id: 'u010', name: 'Hoàng Phương Linh', email: 'linh.hoang@truong.edu.vn', role: 'sinh-vien', unit: 'K61 – CNTT', status: 'active', lastLogin: '2026-06-24 20:15' },
  { id: 'u011', name: 'PGS.TS. Hoàng Văn Minh', email: 'hieu-truong@truong.edu.vn', role: 'hieu-truong', unit: 'Ban Giám hiệu', status: 'active', lastLogin: '2026-06-30 07:30' },
  { id: 'u012', name: 'TS. Lê Thị Lan', email: 'pho-hieu-truong@truong.edu.vn', role: 'pho-hieu-truong', unit: 'Ban Giám hiệu', status: 'active', lastLogin: '2026-06-29 17:00' },
  { id: 'u013', name: 'TS. Nguyễn Văn Khoa', email: 'truong-khoa-cntt@truong.edu.vn', role: 'truong-khoa', unit: 'Khoa CNTT', status: 'active', lastLogin: '2026-06-30 08:15' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị',
  'giang-vien': 'Giảng viên',
  'sinh-vien': 'Sinh viên',
  'nhan-vien': 'Nhân viên',
  'hieu-truong': 'Hiệu trưởng',
  'pho-hieu-truong': 'Phó Hiệu trưởng',
  'truong-khoa': 'Trưởng khoa',
};

const ROLE_VARIANT = (role: string): 'primary' | 'accent' | 'info' | 'neutral' | 'warning' | 'success' => {
  if (role === 'admin') return 'primary';
  if (role === 'giang-vien') return 'accent';
  if (role === 'sinh-vien') return 'info';
  if (role === 'hieu-truong') return 'warning';
  if (role === 'pho-hieu-truong') return 'success';
  if (role === 'truong-khoa') return 'neutral';
  return 'neutral';
};

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Hoạt động' },
  locked: { variant: 'error' as const, label: 'Bị khóa' },
  pending: { variant: 'warning' as const, label: 'Chờ kích hoạt' },
};

export default function UserList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tài khoản"
        description={`${filtered.length} tài khoản trong hệ thống`}
        breadcrumbs={[
          { label: 'IAM', href: '/iam' },
          { label: 'Tài khoản' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
              Import Excel
            </Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Xuất Excel
            </Button>
            <Button leftIcon={<UserPlus className="h-4 w-4" />}>
              Tạo tài khoản
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm tên hoặc email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-64"
        />
        <select
          title="Lọc theo vai trò"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Quản trị</option>
          <option value="giang-vien">Giảng viên</option>
          <option value="sinh-vien">Sinh viên</option>
          <option value="nhan-vien">Nhân viên</option>
          <option value="hieu-truong">Hiệu trưởng</option>
          <option value="pho-hieu-truong">Phó Hiệu trưởng</option>
          <option value="truong-khoa">Trưởng khoa</option>
        </select>
        <select
          title="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
          <option value="pending">Chờ kích hoạt</option>
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Người dùng</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Vai trò</TableHeadCell>
            <TableHeadCell>Đơn vị</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Đăng nhập cuối</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={7} message="Không tìm thấy tài khoản nào" />
          ) : (
            paged.map((u) => {
              const sc = STATUS_CONFIG[u.status as keyof typeof STATUS_CONFIG];
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link to={`/iam/tai-khoan/${u.id}`} className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{u.email}</TableCell>
                  <TableCell><Badge variant={ROLE_VARIANT(u.role)}>{ROLE_LABELS[u.role]}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{u.unit}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot>{sc.label}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] tabular-nums text-xs">{u.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link to={`/iam/tai-khoan/${u.id}`}>
                        <Button variant="ghost" size="sm">Chi tiết</Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                      </Button>
                    </div>
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
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}
