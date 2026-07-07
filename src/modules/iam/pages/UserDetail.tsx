import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { History, Shield, Smartphone } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';

const USER_MAP: Record<string, {
  id: string; displayName: string; email: string; role: string;
  mfaEnabled: boolean; mfaMethod: string; lastLogin: string; lastMFA: string;
}> = {
  u001: { id: 'u001', displayName: 'PGS.TS. Nguyễn Hoàng Long', email: 'long.nguyen@truong.edu.vn', role: 'TRUONG_KHOA', mfaEnabled: true, mfaMethod: 'Authenticator App', lastLogin: '2026-06-25T08:32:15', lastMFA: '2026-06-25T08:32:10' },
  u002: { id: 'u002', displayName: 'Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn', role: 'GIANG_VIEN', mfaEnabled: true, mfaMethod: 'Authenticator App', lastLogin: '2026-06-25T08:30:00', lastMFA: '2026-06-25T08:29:55' },
  u003: { id: 'u003', displayName: 'Nguyễn Văn An', email: 'an.nguyen@truong.edu.vn', role: 'SINH_VIEN', mfaEnabled: false, mfaMethod: '', lastLogin: '2026-06-24T22:10:00', lastMFA: '' },
};

const PERMISSION_MATRIX = [
  { module: 'IAM', create: true, read: true, update: true, delete: false, approve: false, export: true },
  { module: 'HRM', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'SIS', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'DMS', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'FIN', create: false, read: true, update: false, delete: false, approve: false, export: true },
  { module: 'LMS', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'EXAM', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'PORTAL', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'LIB', create: true, read: true, update: true, delete: false, approve: false, export: true },
  { module: 'WMS', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'KTX', create: false, read: true, update: false, delete: false, approve: false, export: true },
  { module: 'RIT', create: true, read: true, update: true, delete: false, approve: true, export: true },
  { module: 'BI', create: false, read: true, update: false, delete: false, approve: false, export: true },
  { module: 'QA', create: false, read: true, update: false, delete: false, approve: false, export: false },
  { module: 'INT', create: false, read: true, update: false, delete: false, approve: false, export: false },
];

const AUDIT_LOG = [
  { id: 'a1', action: 'LOGIN', resource: 'Hệ thống', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-06-25 08:32:15', details: 'Đăng nhập thành công qua MFA' },
  { id: 'a2', action: 'UPDATE', resource: 'Hồ sơ viên chức', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-06-24 16:45:22', details: 'Cập nhật chức danh TS. Lê Văn Minh' },
  { id: 'a3', action: 'CREATE', resource: 'Tài khoản', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-06-24 14:12:08', details: 'Tạo tài khoản mới: sv2026001@truong.edu.vn' },
  { id: 'a4', action: 'LOGIN_FAILED', resource: 'Hệ thống', status: 'failure', ip: '192.xx.xx.8', timestamp: '2026-06-24 09:05:33', details: 'Mật khẩu sai (lần thử 3)' },
  { id: 'a5', action: 'EXPORT', resource: 'Danh sách sinh viên', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-06-23 11:22:10', details: 'Xuất Excel: DS sinh viên K62 CNTT' },
  { id: 'a6', action: 'APPROVE', resource: 'Nghỉ phép', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-06-22 15:08:44', details: 'Duyệt nghỉ phép 5 ngày cho VC Lê Thị Lan' },
  { id: 'a7', action: 'DISABLE_MFA', resource: 'Tài khoản', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-06-20 10:30:00', details: 'Tắt MFA tài khoản nhân viên mới' },
];

const TABS = [
  { id: 'permissions', label: 'Ma trận quyền', icon: <Shield className="h-4 w-4" /> },
  { id: 'audit', label: 'Nhật ký hoạt động', icon: <History className="h-4 w-4" /> },
  { id: 'mfa', label: 'Cấu hình MFA', icon: <Smartphone className="h-4 w-4" /> },
];

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'success', LOGOUT: 'neutral', LOGIN_FAILED: 'error',
  CREATE: 'primary', UPDATE: 'info', DELETE: 'error',
  APPROVE: 'success', REJECT: 'error', EXPORT: 'accent',
  DISABLE_MFA: 'warning', ENABLE_MFA: 'success', LOCK: 'error',
  UNLOCK: 'success', VIEW: 'neutral', DOWNLOAD: 'accent',
};

function CheckIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <div className="h-5 w-5 rounded bg-[rgb(var(--success))] flex items-center justify-center">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ) : (
    <div className="h-5 w-5 rounded border border-[rgb(var(--border))]" />
  );
}

interface UserDetailProps {
  id?: string;
}

export default function UserDetail({ id }: UserDetailProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const [activeTab, setActiveTab] = useState('permissions');
  const user = USER_MAP[actualId] ?? USER_MAP['u001'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-2xl font-bold text-white mb-4 ring-4 ring-[rgb(var(--primary)/0.2)]">
              {user.displayName.split(' ').slice(-2).map((n) => n[0]).join('')}
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{user.displayName}</h2>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{user.role}</p>
            <Badge variant="success" dot className="mt-2">Đang hoạt động</Badge>
            <div className="mt-6 w-full space-y-3">
              {[
                { label: 'Email', value: user.email },
                { label: 'MFA', value: user.mfaEnabled ? `${user.mfaMethod} ✓` : 'Chưa bật' },
                { label: 'Đăng nhập lần cuối', value: user.lastLogin.replace('T', ' ').slice(0, 16) },
              ].map(({ label, value }) => (
                <div key={label} className="border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                  <p className="text-[10px] uppercase tracking-wide text-[rgb(var(--text-muted))]">{label}</p>
                  <p className="text-sm text-[rgb(var(--text-primary))] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-[rgb(var(--border)/0.6)]">
              <div className="flex gap-1 px-4 pt-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                        : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {activeTab === 'permissions' && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Ma trận quyền RBAC</h3>
                    <Badge variant="neutral">{user.role}</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[rgb(var(--border)/0.6)]">
                          <th className="px-3 py-2.5 text-left font-semibold text-[rgb(var(--text-secondary))]">Module</th>
                          {['Tạo', 'Xem', 'Sửa', 'Xóa', 'Duyệt', 'Xuất'].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-center font-semibold text-[rgb(var(--text-secondary))] w-12">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                        {PERMISSION_MATRIX.map((row) => (
                          <tr key={row.module} className="hover:bg-[rgb(var(--bg-hover))]">
                            <td className="px-3 py-2.5 font-medium text-[rgb(var(--text-primary))]">{row.module}</td>
                            {[
                              row.create, row.read, row.update, row.delete, row.approve, row.export,
                            ].map((val, i) => (
                              <td key={i} className="px-3 py-2.5 text-center">
                                <div className="flex justify-center">
                                  <CheckIcon checked={val} />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Nhật ký hoạt động</h3>
                    <Button variant="outline" size="sm">Xuất log</Button>
                  </div>
                  <div className="space-y-0">
                    {AUDIT_LOG.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 border-b border-[rgb(var(--border)/0.4)] py-3 last:border-0">
                        <Badge variant={(ACTION_COLORS[log.action] as 'success' | 'error' | 'info' | 'warning' | 'accent' | 'primary' | 'neutral') ?? 'neutral'} size="sm">
                          {log.action}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-[rgb(var(--text-primary))]">
                            <span className="font-medium">{log.resource}</span>
                            {log.details && <span className="text-[rgb(var(--text-secondary))]"> — {log.details}</span>}
                          </p>
                          <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">
                            {log.timestamp} · IP: {log.ip} · {log.status === 'success' ? '✓' : '✗'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'mfa' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)]">
                        <Smartphone className="h-5 w-5 text-[rgb(var(--success))]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[rgb(var(--text-primary))]">MFA đang bật</p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">Qua Authenticator App — cặp khóa RSA-2048</p>
                      </div>
                    </div>
                    <Badge variant="success">Bật</Badge>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Phương thức đã đăng ký</h4>
                    <div className="space-y-3">
                      {[
                        { method: 'Authenticator App (Microsoft)', added: '2025-03-15', lastUsed: '2026-06-25 08:32:10', primary: true },
                        { method: 'Email (long.nguyen@truong.edu.vn)', added: '2025-01-10', lastUsed: '2026-05-12 14:20:00', primary: false },
                      ].map((mfa) => (
                        <div key={mfa.method} className={`flex items-center justify-between rounded-lg border p-4 ${
                          mfa.primary ? 'border-[rgb(var(--success)/0.3)] bg-[rgb(var(--bg-base))]' : 'border-[rgb(var(--border))]'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{mfa.method}</p>
                              {mfa.primary && <Badge variant="success" size="sm">Chính</Badge>}
                            </div>
                            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">Thêm: {mfa.added} · Dùng lần cuối: {mfa.lastUsed}</p>
                          </div>
                          {!mfa.primary && (
                            <Button variant="outline" size="sm">Đặt làm chính</Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm">Thêm phương thức MFA mới</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
