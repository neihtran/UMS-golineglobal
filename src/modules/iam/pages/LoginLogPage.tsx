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
import { useIamLoginLogs } from '@/hooks/useIam';
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
];

export function LoginLogTabContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<LoginLog | null>(null);

  const query = useIamLoginLogs({
    per_page: pageSize,
    page,
    user_id: userIdFilter ? Number(userIdFilter) : undefined,
    ip_address: ipFilter.trim() || undefined,
    login_method: methodFilter || undefined,
    search: search.trim() || undefined,
  });

  const logs = query.data?.data ?? [];
  const meta = query.data?.meta;

  const handleExport = () => {
    if (!logs.length) { toast.warning('Không có dữ liệu để xuất.'); return; }
    const headers = ['ID', 'User ID', 'Phương thức', 'IP', 'Đăng nhập', 'Đăng xuất'];
    const rows = logs.map(l => [
      l.id, l.user_id ?? '', l.login_method,
      l.ip_address ?? '', l.logged_in_at, l.logged_out_at ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c)}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lich-su-dang-nhap-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${logs.length} phiên.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap items-end gap-3 flex-1 min-w-0">
          <div className="relative w-52 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="search"
              placeholder="Tìm user_id, IP..."
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
          <input
            type="text"
            placeholder="Địa chỉ IP"
            value={ipFilter}
            onChange={(e) => { setIpFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm w-36 shrink-0 placeholder:text-[rgb(var(--text-muted))]"
          />
          <select
            title="Lọc theo phương thức"
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] w-36 shrink-0"
          >
            {METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
          Xuất danh sách
        </Button>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Người dùng</TableHeadCell>
              <TableHeadCell>Phương thức</TableHeadCell>
              <TableHeadCell>IP</TableHeadCell>
              <TableHeadCell>Đăng nhập</TableHeadCell>
              <TableHeadCell>Đăng xuất</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[rgb(var(--text-muted))]">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Đang tải lịch sử đăng nhập...
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
              <TableEmpty colSpan={6} message="Không tìm thấy phiên nào" />
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
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{userLabel}</p>
                  </TableCell>
                  <TableCell><Badge variant={mc.variant} size="sm">{mc.label}</Badge></TableCell>
                  <TableCell>
                    <code className="text-xs font-mono text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 rounded">
                      {log.ip_address || '—'}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))] tabular-nums">{formatDateTime(log.logged_in_at)}</TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {log.logged_out_at ? (
                      <span className="text-[rgb(var(--text-muted))]">{formatDateTime(log.logged_out_at)}</span>
                    ) : (
                      <span className="text-[rgb(var(--success))]">Đang hoạt động</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isActive ? (
                      <Badge variant="success" dot>Đang phiên</Badge>
                    ) : (
                      <Badge variant="neutral">Đã đăng xuất</Badge>
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
        total={meta?.total ?? logs.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[15, 25, 50]}
      />

      <LoginLogSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelected(null); }}
        log={selected}
      />
    </div>
  );
}

export default LoginLogTabContent;