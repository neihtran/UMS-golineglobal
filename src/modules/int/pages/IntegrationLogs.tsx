import { useState } from 'react';
import {
  Download, Search, RefreshCw, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownLeft, BarChart3, Globe,
} from 'lucide-react';
import {
  Button, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const LOGS = [
  { id: 'log01', timestamp: '2026-06-26 11:42:18', method: 'GET', endpoint: '/api/v1/sis/students', status: 200, duration: 245, size: '4.2 KB', direction: 'incoming', source: 'HEMIS', ip: '10.0.1.100', description: 'Đồng bộ danh sách sinh viên mới đăng ký' },
  { id: 'log02', timestamp: '2026-06-26 11:41:55', method: 'POST', endpoint: '/api/v1/lms/grades/push', status: 200, duration: 312, size: '1.8 KB', direction: 'outgoing', source: '→ LMS', ip: '10.0.1.101', description: 'Đẩy điểm quá trình HK2/2025-2026' },
  { id: 'log03', timestamp: '2026-06-26 11:41:30', method: 'GET', endpoint: '/api/v1/vneid/verify', status: 200, duration: 189, size: '0.8 KB', direction: 'incoming', source: 'VNeID', ip: '10.0.1.102', description: 'Xác thực định danh sinh viên Nguyễn Văn A' },
  { id: 'log04', timestamp: '2026-06-26 11:40:44', method: 'POST', endpoint: '/api/v1/vbqg/degrees', status: 201, duration: 567, size: '12.5 KB', direction: 'outgoing', source: '→ CSDL VBQG', ip: '10.0.1.103', description: 'Đăng ký 3 văn bằng tốt nghiệp mới' },
  { id: 'log05', timestamp: '2026-06-26 11:40:12', method: 'GET', endpoint: '/api/v1/kbnn/payments', status: 200, duration: 892, size: '8.1 KB', direction: 'incoming', source: 'Kho bạc NN', ip: '10.0.1.104', description: 'Truy vấn trạng thái thanh toán học phí' },
  { id: 'log06', timestamp: '2026-06-26 11:38:55', method: 'POST', endpoint: '/api/v1/exam/results', status: 200, duration: 445, size: '6.3 KB', direction: 'outgoing', source: '→ EXAM', ip: '10.0.1.105', description: 'Gửi kết quả thi giữa kỳ HK2' },
  { id: 'log07', timestamp: '2026-06-26 11:37:22', method: 'GET', endpoint: '/api/v1/lib/catalog', status: 200, duration: 156, size: '22.4 KB', direction: 'incoming', source: 'LIB', ip: '10.0.1.106', description: 'Tra cứu danh mục sách theo ISBN' },
  { id: 'log08', timestamp: '2026-06-26 11:36:44', method: 'POST', endpoint: '/api/v1/fin/tuition/push', status: 500, duration: 234, size: '0.2 KB', direction: 'outgoing', source: '→ FIN', ip: '10.0.1.107', description: 'LỖI: Không thể gửi học phí — timeout sau 30s', error: true },
  { id: 'log09', timestamp: '2026-06-26 11:35:10', method: 'GET', endpoint: '/api/v1/sis/enrollment', status: 200, duration: 378, size: '5.9 KB', direction: 'incoming', source: 'HEMIS', ip: '10.0.1.108', description: 'Đăng ký học phần HK2/2025-2026' },
  { id: 'log10', timestamp: '2026-06-26 11:34:33', method: 'POST', endpoint: '/api/v1/auth/sso', status: 200, duration: 445, size: '1.2 KB', direction: 'incoming', source: 'VNeID', ip: '10.0.1.109', description: 'SSO callback — tạo session mới' },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-50 text-blue-600',
  POST: 'bg-green-50 text-green-600',
  PUT: 'bg-amber-50 text-amber-600',
  DELETE: 'bg-red-50 text-red-600',
  PATCH: 'bg-purple-50 text-purple-600',
};

const STATUS_COLORS: Record<number, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  200: 'success', 201: 'success', 204: 'success',
  400: 'warning', 401: 'warning', 403: 'warning', 404: 'warning',
  500: 'error', 502: 'error', 503: 'error',
};

export default function IntegrationLogs() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 15 });
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [direction, setDirection] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = LOGS.filter((log) => {
    const matchSearch = !search || log.endpoint.toLowerCase().includes(search.toLowerCase()) || log.description.toLowerCase().includes(search.toLowerCase());
    const matchMethod = method === 'all' || log.method === method;
    const matchDir = direction === 'all' || log.direction === direction;
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'success' && log.status < 400) ||
      (statusFilter === 'error' && log.status >= 400);
    return matchSearch && matchMethod && matchDir && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const successRate = Math.round((LOGS.filter(l => l.status < 400).length / LOGS.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Nhật ký Tích hợp"
        description="INT-01 — Theo dõi API calls, sync status và lỗi tích hợp với hệ thống bên ngoài"
        breadcrumbs={[{ label: 'INT', href: '/int' }, { label: 'Nhật ký API' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất log</Button>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>Làm mới</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng API calls hôm nay', value: LOGS.length, icon: <Globe className="h-5 w-5" />, color: 'primary' },
          { label: 'Thành công', value: LOGS.filter(l => l.status < 400).length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: 'Lỗi', value: LOGS.filter(l => l.status >= 400).length, icon: <XCircle className="h-5 w-5" />, color: 'error' },
          { label: 'Tỷ lệ thành công', value: `${successRate}%`, icon: <BarChart3 className="h-5 w-5" />, color: successRate >= 95 ? 'success' : 'warning' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 max-w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm endpoint, mô tả..."
            className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
          />
        </div>
        <select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả method</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select value={direction} onChange={(e) => { setDirection(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả hướng</option>
          <option value="incoming">← Nhận</option>
          <option value="outgoing">→ Gửi</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]">
          <option value="all">Tất cả</option>
          <option value="success">Thành công (2xx)</option>
          <option value="error">Lỗi (4xx/5xx)</option>
        </select>
      </div>

      {/* Logs table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Thời gian</TableHeadCell>
            <TableHeadCell>Method</TableHeadCell>
            <TableHeadCell>Endpoint</TableHeadCell>
            <TableHeadCell>Hướng</TableHeadCell>
            <TableHeadCell>Nguồn</TableHeadCell>
            <TableHeadCell className="text-center">Duration</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Mô tả</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={8} message="Không có log nào" />
          ) : (
            paged.map((log) => (
              <TableRow key={log.id} className={log.error ? 'bg-red-50/30' : ''}>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))] whitespace-nowrap">{log.timestamp}</TableCell>
                <TableCell>
                  <span className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold ${METHOD_COLORS[log.method] || 'bg-slate-50 text-slate-600'}`}>
                    {log.method}
                  </span>
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono text-[rgb(var(--text-primary))]">{log.endpoint}</code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {log.direction === 'incoming' ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
                    )}
                    <span className="text-xs text-[rgb(var(--text-muted))]">{log.direction === 'incoming' ? 'Nhận' : 'Gửi'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="rounded bg-[rgb(var(--border))] px-2 py-0.5 text-xs font-medium text-[rgb(var(--text-secondary))]">{log.source}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-mono text-xs font-semibold ${
                    log.duration > 500 ? 'text-[rgb(var(--error))]' : log.duration > 200 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--text-secondary))]'
                  }`}>
                    {log.duration}ms
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[log.status] || 'neutral'} size="sm">{log.status}</Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className={`text-xs leading-tight ${log.error ? 'text-red-600' : 'text-[rgb(var(--text-secondary))]'}`}>
                    {log.description}
                  </p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">IP: {log.ip}</p>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[15, 30, 50]}
      />
    </div>
  );
}
