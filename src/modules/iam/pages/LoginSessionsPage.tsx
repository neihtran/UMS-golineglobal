import { useState } from 'react';
import { Search, Loader2, ShieldAlert, Filter, Calendar } from 'lucide-react';
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
import {
  useIamLoginLogs,
  useIamLogoutAll,
} from '@/hooks/useIam';
import { LoginLogSheet } from './sheets/LoginLogSheet';
import { formatDateTime } from '@/utils/formatters';
import type { LoginLog } from '@/types/iam.types';

const METHOD_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'neutral'; label: string }> = {
  password: { variant: 'info', label: 'Mật khẩu' },
  sso: { variant: 'success', label: 'SSO' },
  oauth: { variant: 'warning', label: 'OAuth' },
  mfa: { variant: 'success', label: 'MFA' },
  webauthn: { variant: 'success', label: 'WebAuthn' },
  magic_link: { variant: 'info', label: 'Magic link' },
};

const METHOD_OPTIONS = [
  { value: '', label: 'Tất cả phương thức' },
  { value: 'password', label: 'Mật khẩu' },
  { value: 'sso', label: 'SSO' },
  { value: 'oauth', label: 'OAuth' },
  { value: 'mfa', label: 'MFA' },
  { value: 'webauthn', label: 'WebAuthn' },
  { value: 'magic_link', label: 'Magic link' },
];

export function LoginSessionsTabContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<LoginLog | null>(null);

  const query = useIamLoginLogs({
    per_page: pageSize,
    page,
    login_method: methodFilter || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    search: search.trim() || undefined,
  });

  const logs = query.data?.data ?? [];
  const meta = query.data?.meta;
  const total = meta?.total ?? 0;
  const activeCount = logs.filter(l => !l.logged_out_at).length;

  const logoutAllMut = useIamLogoutAll();

  const handleLogoutAll = async () => {
    if (!window.confirm('Đăng xuất khỏi tất cả thiết bị? Bạn sẽ phải đăng nhập lại trên mọi thiết bị.')) return;
    try {
      await logoutAllMut.mutateAsync();
      toast.success('Đã đăng xuất khỏi tất cả thiết bị');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as Error).message
        || 'Không thể đăng xuất tất cả thiết bị';
      toast.error(msg);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setMethodFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header stats + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">
            Tổng: {total} phiên
          </Badge>
          {activeCount > 0 && (
            <Badge variant="success" dot>
              {activeCount} phiên đang hoạt động
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(s => !s)}
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc nâng cao'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ShieldAlert className="h-4 w-4" />}
            onClick={handleLogoutAll}
            disabled={logoutAllMut.isPending}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            {logoutAllMut.isPending ? 'Đang xử lý...' : 'Đăng xuất tất cả thiết bị'}
          </Button>
        </div>
      </div>

      {/* Search row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            type="search"
            placeholder="Tìm theo IP, user ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
          />
        </div>
        <select
          title="Lọc theo phương thức"
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          {METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Từ ngày</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Đến ngày</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Đặt lại
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Người dùng</TableHeadCell>
              <TableHeadCell>Phương thức</TableHeadCell>
              <TableHeadCell>Địa chỉ IP</TableHeadCell>
              <TableHeadCell>Thời gian đăng nhập</TableHeadCell>
              <TableHeadCell>Thời gian đăng xuất</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Đang tải lịch sử phiên đăng nhập...
                </TableCell>
              </TableRow>
            )}
            {query.isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--error))]">
                  {(query.error as Error).message || 'Không thể tải dữ liệu.'}
                </TableCell>
              </TableRow>
            )}
            {!query.isLoading && !query.isError && logs.length === 0 && (
              <TableEmpty colSpan={6} message="Không tìm thấy phiên đăng nhập nào" />
            )}
            {!query.isLoading && !query.isError && logs.map(log => {
              const mc = METHOD_CONFIG[log.login_method as string] || { variant: 'neutral' as const, label: log.login_method };
              const isActive = !log.logged_out_at;
              const userLabel = log.user_id != null ? `User #${log.user_id}` : 'Hệ thống';
              return (
                <TableRow
                  key={log.id}
                  className="hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer"
                  onClick={() => { setSelected(log); setSheetOpen(true); }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                        U{log.user_id ?? '?'}
                      </div>
                      <span className="font-medium text-[rgb(var(--text-primary))]">{userLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={mc.variant} dot>{mc.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">
                      {log.ip_address || '—'}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))] tabular-nums">
                    {formatDateTime(log.logged_in_at)}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))] tabular-nums">
                    {log.logged_out_at ? formatDateTime(log.logged_out_at) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                  </TableCell>
                  <TableCell>
                    {isActive ? (
                      <Badge variant="success" dot>Đang hoạt động</Badge>
                    ) : (
                      <Badge variant="neutral">Đã đóng</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 15, 25, 50]}
      />

      <LoginLogSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        log={selected}
      />
    </div>
  );
}

export default function LoginSessionsPage() {
  return <LoginSessionsTabContent />;
}