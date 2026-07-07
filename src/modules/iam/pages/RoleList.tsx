import { useState } from 'react';
import {
  Plus, Download, Shield, Save,
} from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, Checkbox,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import CreateRoleModal from './CreateRoleModal';

type PermKey = 'read' | 'write' | 'approve';
type Perms = Record<PermKey, boolean>;
type PermMatrix = Record<string, Record<string, Perms>>;

const ROLES = [
  { id: 'r01', code: 'ADMIN', name: 'Quản trị viên', description: 'Toàn quyền trên mọi phân hệ, không giới hạn', userCount: 1, permissions: 78, status: 'active', createdAt: '2024-01-15' },
  { id: 'r02', code: 'HIEU_TRUONG', name: 'Hiệu trưởng', description: 'Toàn quyền xem báo cáo và phê duyệt cấp cao', userCount: 1, permissions: 45, status: 'active', createdAt: '2024-01-15' },
  { id: 'r03', code: 'PHO_HIEU_TRUONG', name: 'Phó Hiệu trưởng', description: 'Hỗ trợ Hiệu trưởng, phê duyệt thay khi vắng mặt', userCount: 1, permissions: 40, status: 'active', createdAt: '2024-01-15' },
  { id: 'r04', code: 'TRUONG_KHOA', name: 'Trưởng khoa', description: 'Quản lý nhân sự và đào tạo cấp khoa', userCount: 12, permissions: 38, status: 'active', createdAt: '2024-02-01' },
  { id: 'r05', code: 'GIAO_VIEN', name: 'Giảng viên', description: 'Truy cập LMS, EXAM, SIS (giảng dạy), điểm danh', userCount: 310, permissions: 28, status: 'active', createdAt: '2024-01-20' },
  { id: 'r06', code: 'NHAN_VIEN', name: 'Nhân viên HC', description: 'Truy cập HRM, DMS, FIN, WMS cấp phòng ban', userCount: 89, permissions: 32, status: 'active', createdAt: '2024-02-10' },
  { id: 'r07', code: 'SINH_VIEN', name: 'Sinh viên', description: 'Đăng ký HP, xem điểm, nộp bài, tra cứu thư viện', userCount: 7240, permissions: 15, status: 'active', createdAt: '2024-01-20' },
];

const MODULES = ['IAM', 'HRM', 'SIS', 'LMS', 'EXAM', 'DMS', 'FIN', 'WMS', 'PORTAL', 'LIB', 'KTX', 'OCR', 'BI', 'DCE', 'QA', 'RIT', 'INT', 'PMS'];

const DEFAULT_PERMISSIONS: PermMatrix = {
  ADMIN: Object.fromEntries(MODULES.map(m => [m, { read: true, write: true, approve: true }])),
  HIEU_TRUONG: Object.fromEntries(MODULES.map(m => [m, { read: true, write: false, approve: true }])),
  PHO_HIEU_TRUONG: Object.fromEntries(MODULES.map(m => [m, { read: true, write: false, approve: true }])),
  TRUONG_KHOA: Object.fromEntries(MODULES.filter(m => !['INT', 'OCR', 'PMS'].includes(m)).map(m => [m, { read: true, write: true, approve: true }])),
  GIAO_VIEN: Object.fromEntries(['SIS', 'LMS', 'EXAM', 'DMS', 'WMS', 'PORTAL', 'LIB', 'DCE', 'QA', 'RIT'].map(m => [m, { read: true, write: true, approve: false }])),
  SINH_VIEN: Object.fromEntries(['SIS', 'LMS', 'EXAM', 'PORTAL', 'LIB', 'DCE'].map(m => [m, { read: true, write: true, approve: false }])),
  NHAN_VIEN: Object.fromEntries(['HRM', 'DMS', 'FIN', 'WMS', 'PORTAL', 'KTX', 'BI', 'QA'].map(m => [m, { read: true, write: true, approve: false }])),
};

export default function RoleList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissions, setPermissions] = useState<PermMatrix>(DEFAULT_PERMISSIONS);
  const [savedRole, setSavedRole] = useState<string | null>(null);

  const filtered = ROLES.filter((r) => {
    return !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const displayedRole = selectedRole ? ROLES.find(r => r.code === selectedRole) : null;

  const togglePerm = (roleCode: string, mod: string, key: PermKey) => {
    setPermissions(prev => ({
      ...prev,
      [roleCode]: {
        ...prev[roleCode],
        [mod]: {
          ...prev[roleCode][mod],
          [key]: !prev[roleCode][mod][key],
        },
      },
    }));
    setSavedRole(null);
  };

  const handleSave = (roleCode: string) => {
    setSavedRole(roleCode);
    setTimeout(() => setSavedRole(null), 2000);
  };

  const rolePermissions = displayedRole ? permissions[displayedRole.code] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Vai trò & Phân quyền"
        description="IAM-01 — Ma trận quyền module × hành động cho 10 vai trò hệ thống"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Vai trò & Phân quyền' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất ma trận</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>Tạo vai trò mới</Button>
          </>
        }
      />

      {/* Role list */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: roles */}
        <div className="space-y-3">
          <div className="flex items-end gap-3">
            <Input
              placeholder="Tìm vai trò..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              wrapperClassName="flex-1"
            />
          </div>
          <div className="space-y-2">
            {paged.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRole(selectedRole === r.code ? null : r.code)}
                className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedRole === r.code
                    ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] shadow-sm'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:border-[rgb(var(--primary-light))]'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  r.code === 'ADMIN' ? 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]' :
                  r.code === 'SINH_VIEN' ? 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]' :
                  r.code === 'GIANG_VIEN' ? 'bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]' :
                  'bg-[rgb(var(--border))] text-[rgb(var(--text-secondary))]'
                }`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[rgb(var(--text-primary))]">{r.name}</p>
                    <Badge variant={r.status === 'active' ? 'success' : 'neutral'} dot size="sm">{r.status}</Badge>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{r.code} · {r.userCount.toLocaleString()} người</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{r.permissions} quyền</p>
                </div>
              </div>
            ))}
          </div>
          <TablePagination
            page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
            onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            pageSizeOptions={[5, 10]}
          />
        </div>

        {/* Right: permission matrix */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Ma trận phân quyền</h3>
            {displayedRole && (
              <div className="flex items-center gap-2">
                <Badge variant="primary">{displayedRole.name}</Badge>
                <Button
                  size="sm"
                  variant={savedRole === displayedRole.code ? 'outline' : 'primary'}
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                  onClick={() => handleSave(displayedRole.code)}
                  disabled={savedRole === displayedRole.code}
                >
                  {savedRole === displayedRole.code ? 'Đã lưu' : 'Lưu thay đổi'}
                </Button>
              </div>
            )}
          </div>

          {displayedRole ? (
            <div className="space-y-1">
              <p className="text-xs text-[rgb(var(--text-muted))] mb-3">{displayedRole.description}</p>
              <div className="overflow-x-auto -mx-1">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Module</TableHeadCell>
                      <TableHeadCell className="text-center">Đọc</TableHeadCell>
                      <TableHeadCell className="text-center">Ghi</TableHeadCell>
                      <TableHeadCell className="text-center">Duyệt</TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {MODULES.map((mod) => {
                      const perms = rolePermissions?.[mod] ?? { read: false, write: false, approve: false };
                      return (
                        <TableRow key={mod}>
                          <TableCell className="text-[rgb(var(--text-secondary))]">{mod}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perms.read}
                                onChange={() => togglePerm(displayedRole.code, mod, 'read')}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perms.write}
                                onChange={() => togglePerm(displayedRole.code, mod, 'write')}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perms.approve}
                                onChange={() => togglePerm(displayedRole.code, mod, 'approve')}
                                className="cursor-pointer"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="h-12 w-12 text-[rgb(var(--border))] mb-3" />
              <p className="text-sm text-[rgb(var(--text-muted))]">Chọn một vai trò để xem ma trận phân quyền chi tiết</p>
            </div>
          )}
        </div>
      </div>

      <CreateRoleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
