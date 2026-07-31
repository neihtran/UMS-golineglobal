import { useState } from 'react';
import { Download, Search, Loader2 } from 'lucide-react';
import {
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
  TablePagination,
  toast,
} from '@/components/ui';
import { useIamAuditLogs } from '@/hooks/useIam';
import { AuditLogSheet } from './sheets/AuditLogSheet';
import { formatDateTime } from '@/utils/formatters';
import type { AuditLog } from '@/types/iam.types';

// API trả action ở dạng lowercase: "create" | "update" | "delete" | "login" | ...
const ACTION_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  restore: 'success',
  login: 'neutral',
  logout: 'neutral',
  lock: 'error',
  unlock: 'success',
  reset_password: 'warning',
  assign_role: 'warning',
  revoke_role: 'warning',
  export: 'info',
  import: 'info',
  approve: 'success',
  reject: 'error',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  restore: 'Khôi phục',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  lock: 'Khóa',
  unlock: 'Mở khóa',
  reset_password: 'Reset mật khẩu',
  assign_role: 'Gán vai trò',
  revoke_role: 'Thu hồi vai trò',
  export: 'Xuất dữ liệu',
  import: 'Nhập dữ liệu',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
};

const ACTION_OPTIONS = [
  { value: '', label: 'Tất cả thao tác' },
  { value: 'create', label: 'Tạo mới' },
  { value: 'update', label: 'Cập nhật' },
  { value: 'delete', label: 'Xóa' },
  { value: 'login', label: 'Đăng nhập' },
  { value: 'logout', label: 'Đăng xuất' },
  { value: 'lock', label: 'Khóa' },
  { value: 'unlock', label: 'Mở khóa' },
  { value: 'reset_password', label: 'Reset mật khẩu' },
  { value: 'assign_role', label: 'Gán vai trò' },
  { value: 'revoke_role', label: 'Thu hồi vai trò' },
];

const MODULE_OPTIONS = [
  { value: '', label: 'Tất cả module' },
  { value: 'User', label: 'User' },
  { value: 'Role', label: 'Role' },
  { value: 'Permission', label: 'Permission' },
  { value: 'Auth', label: 'Auth' },
];

export function AuditLogTabContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const query = useIamAuditLogs({
    per_page: pageSize,
    page,
    action: actionFilter || undefined,
    module: moduleFilter || undefined,
    user_id: userIdFilter ? Number(userIdFilter) : undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    search: search.trim() || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const logs = query.data?.data ?? [];
  const meta = query.data?.meta;

  const handleExport = () => {
    if (!logs.length) { toast.warning('Không có dữ liệu để xuất.'); return; }
    const headers = ['ID', 'User ID', 'Thao tác', 'Module', 'Đối tượng', 'Mô tả', 'IP', 'Thời gian'];
    const rows = logs.map(l => [
      l.id, l.user_id ?? '', ACTION_LABELS[l.action] || l.action,
      l.module ?? '', l.resource_type ?? '', l.description ?? '', l.ip_address ?? '', l.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c)}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `nhat-ky-thao-tac-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${logs.length} bản ghi.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap items-end gap-3 flex-1 min-w-0">
          <div className="relative w-52 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="search"
              placeholder="Tìm mô tả, IP..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            />
          </div>
          <input
            type="number"
            placeholder="User ID"
            value={userIdFilter}
            onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm w-28 shrink-0 placeholder:text-[rgb(var(--text-muted))]"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm w-36"
            />
            <span className="text-[rgb(var(--text-muted))] shrink-0">—</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm w-36"
            />
          </div>
          <select
            title="Lọc theo thao tác"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] w-36 shrink-0"
          >
            {ACTION_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <select
            title="Lọc theo module"
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] w-32 shrink-0"
          >
            {MODULE_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
          Xuất nhật ký
        </Button>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Người thực hiện</TableHeadCell>
              <TableHeadCell>Thao tác</TableHeadCell>
              <TableHeadCell>Module</TableHeadCell>
              <TableHeadCell>Đối tượng</TableHeadCell>
              <TableHeadCell>Mô tả</TableHeadCell>
              <TableHeadCell>IP</TableHeadCell>
              <TableHeadCell>Thời gian</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--text-muted))]">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Đang tải nhật ký...
                </TableCell>
              </TableRow>
            )}
            {query.isError && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-[rgb(var(--error))]">
                  {(query.error as Error).message || 'Không thể tải nhật ký.'}
                </TableCell>
              </TableRow>
            )}
            {!query.isLoading && !query.isError && logs.length === 0 && (
              <TableEmpty colSpan={7} message="Không tìm thấy nhật ký nào" />
            )}
            {!query.isLoading && !query.isError && logs.map(log => {
              const variant = ACTION_VARIANT[log.action] || 'neutral';
              const actionLabel = ACTION_LABELS[log.action] || log.action;
              const userLabel = log.user_id != null ? `User #${log.user_id}` : 'Hệ thống';
              return (
                <TableRow
                  key={log.id}
                  className="hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer"
                  onClick={() => { setSelected(log); setSheetOpen(true); }}
                >
                  <TableCell>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{userLabel}</p>
                  </TableCell>
                  <TableCell><Badge variant={variant}>{actionLabel}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">{log.module || '—'}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{log.resource_type || '—'}</p>
                    {log.resource_id != null && (
                      <p className="text-xs text-[rgb(var(--text-muted))]">ID: {log.resource_id}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))] max-w-xs truncate">{log.description || '—'}</TableCell>
                  <TableCell>
                    <code className="text-xs font-mono text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">
                      {log.ip_address || '—'}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))] tabular-nums">{formatDateTime(log.created_at)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={meta?.total ?? logs.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[15, 25, 50]}
      />

      <AuditLogSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelected(null); }}
        log={selected}
      />
    </div>
  );
}

export default AuditLogTabContent;