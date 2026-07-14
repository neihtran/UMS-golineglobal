import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { History, Shield, Smartphone, Lock, Unlock, Trash2, Mail, Plus } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { useUserDetail, useDisableMfa, useEnableMfa } from '@/hooks/useIam';

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

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị cao cấp',
  ADMIN: 'Quản trị',
  HIEU_TRUONG: 'Hiệu trưởng',
  PHO_HIEU_TRUONG: 'Phó Hiệu trưởng',
  TRUONG_KHOA: 'Trưởng khoa',
  PHO_TRUONG_KHOA: 'Phó trưởng khoa',
  GIAO_VIEN: 'Giảng viên',
  CAN_BO_PHAN_CONG: 'Cán bộ phân công',
  CHUYEN_VIEN: 'Chuyên viên',
  NHAN_VIEN: 'Nhân viên',
  SINH_VIEN: 'Sinh viên',
  KHAI_THA: 'Khai thác',
};

const STATUS_CONFIG = {
  active: { variant: 'success' as const, label: 'Hoạt động' },
  locked: { variant: 'error' as const, label: 'Bị khóa' },
  inactive: { variant: 'neutral' as const, label: 'Không hoạt động' },
  pending: { variant: 'warning' as const, label: 'Chờ kích hoạt' },
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'success', LOGOUT: 'neutral', LOGIN_FAILED: 'error',
  CREATE: 'primary', UPDATE: 'info', DELETE: 'error',
  APPROVE: 'success', REJECT: 'error', EXPORT: 'accent',
  DISABLE_MFA: 'warning', ENABLE_MFA: 'success', LOCK: 'error',
  UNLOCK: 'success', VIEW: 'neutral', DOWNLOAD: 'accent',
};

const TABS = [
  { id: 'permissions', label: 'Ma trận quyền', icon: <Shield className="h-4 w-4" /> },
  { id: 'audit', label: 'Nhật ký hoạt động', icon: <History className="h-4 w-4" /> },
  { id: 'mfa', label: 'Cấu hình MFA', icon: <Smartphone className="h-4 w-4" /> },
];

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

interface MfaMethod {
  id: string;
  type: 'totp' | 'email' | 'sms';
  label: string;
  value: string;
  addedAt: string;
  lastUsed?: string;
  isPrimary: boolean;
}

interface UserDetailProps {
  id?: string;
}

export default function UserDetail({ id }: UserDetailProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const [activeTab, setActiveTab] = useState('permissions');
  const [mfaMethods, setMfaMethods] = useState<MfaMethod[]>([
    { id: '1', type: 'totp', label: 'Authenticator App (Microsoft)', value: 'Microsoft Authenticator', addedAt: '2025-03-15', lastUsed: '2026-07-09 10:30:15', isPrimary: true },
    { id: '2', type: 'email', label: 'Email', value: 'long.nguyen@truong.edu.vn', addedAt: '2025-01-10', lastUsed: '2026-05-12 14:20:00', isPrimary: false },
  ]);
  const [showAddMfa, setShowAddMfa] = useState(false);

  // Fetch user data from backend
  const { data, isLoading } = useUserDetail(actualId);
  const disableMfaMutation = useDisableMfa();
  const enableMfaMutation = useEnableMfa();

  const user = data?.data;
  const statusConfig = user ? STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG] || { variant: 'neutral' as const, label: user.status } : { variant: 'neutral' as const, label: '—' };

  const handleSetPrimaryMfa = async (methodId: string) => {
    setMfaMethods(prev => prev.map(m => ({
      ...m,
      isPrimary: m.id === methodId
    })));
  };

  const handleAddMfaMethod = () => {
    setShowAddMfa(true);
  };

  const handleDeleteMfaMethod = (methodId: string) => {
    setMfaMethods(prev => prev.filter(m => m.id !== methodId));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left sidebar - User info */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-2xl font-bold text-white mb-4 ring-4 ring-[rgb(var(--primary)/0.2)]">
              {(user?.displayName || user?.email || 'U').split(' ').slice(-2).map((n: string) => n?.[0]).join('')}
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{user?.displayName || '—'}</h2>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{ROLE_LABELS[user?.role || ''] || user?.role || '—'}</p>
            <Badge variant={statusConfig.variant} dot className="mt-2">
              {statusConfig.label}
            </Badge>
            <div className="mt-6 w-full space-y-3">
              {[
                { label: 'Email', value: user?.email },
                { label: 'MFA', value: user?.mfaEnabled ? 'Đã bật ✓' : 'Chưa bật' },
                { label: 'Đăng nhập cuối', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : '—' },
                { label: 'Số lần đăng nhập sai', value: user?.failedLoginAttempts || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                  <p className="text-[10px] uppercase tracking-wide text-[rgb(var(--text-muted))]">{label}</p>
                  <p className="text-sm text-[rgb(var(--text-primary))] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right content - Tabs */}
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
                    <Badge variant="neutral">{ROLE_LABELS[user?.role || ''] || user?.role}</Badge>
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
                    {[
                      { id: 'a1', action: 'LOGIN', resource: 'Hệ thống', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-07-09 10:32:15', details: 'Đăng nhập thành công qua MFA' },
                      { id: 'a2', action: 'UPDATE', resource: 'Hồ sơ viên chức', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-07-08 16:45:22', details: 'Cập nhật chức danh TS. Lê Văn Minh' },
                      { id: 'a3', action: 'CREATE', resource: 'Tài khoản', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-07-08 14:12:08', details: 'Tạo tài khoản mới: sv2026001@truong.edu.vn' },
                      { id: 'a4', action: 'LOGIN_FAILED', resource: 'Hệ thống', status: 'failure', ip: '192.xx.xx.8', timestamp: '2026-07-08 09:05:33', details: 'Mật khẩu sai (lần thử 3)' },
                      { id: 'a5', action: 'EXPORT', resource: 'Danh sách sinh viên', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-07-07 11:22:10', details: 'Xuất Excel: DS sinh viên K62 CNTT' },
                      { id: 'a6', action: 'APPROVE', resource: 'Nghỉ phép', status: 'success', ip: '103.xx.xx.42', timestamp: '2026-07-06 15:08:44', details: 'Duyệt nghỉ phép 5 ngày cho VC Lê Thị Lan' },
                    ].map((log) => (
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
                  {/* MFA Status */}
                  <div className={`flex items-center justify-between rounded-lg border p-4 ${
                    user?.mfaEnabled 
                      ? 'border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)]' 
                      : 'border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.05)]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        user?.mfaEnabled 
                          ? 'bg-[rgb(var(--success)/0.1)]' 
                          : 'bg-[rgb(var(--warning)/0.1)]'
                      }`}>
                        <Smartphone className={`h-5 w-5 ${
                          user?.mfaEnabled 
                            ? 'text-[rgb(var(--success))]' 
                            : 'text-[rgb(var(--warning))]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-[rgb(var(--text-primary))]">
                          {user?.mfaEnabled ? 'MFA đang bật' : 'MFA chưa bật'}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                          {user?.mfaEnabled 
                            ? 'Đã xác thực qua Authenticator App — cặp khóa RSA-2048' 
                            : 'Bật MFA để tăng cường bảo mật tài khoản'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.mfaEnabled ? (
                        <Badge variant="success">Bật</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => enableMfaMutation.mutate(actualId)}
                          loading={enableMfaMutation.isPending}
                        >
                          Bật MFA
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* MFA Methods List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Phương thức đã đăng ký</h4>
                    <div className="space-y-3">
                      {mfaMethods.map((mfa) => (
                        <div key={mfa.id} className={`flex items-center justify-between rounded-lg border p-4 ${
                          mfa.isPrimary 
                            ? 'border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.02)]' 
                            : 'border-[rgb(var(--border))]'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                {mfa.type === 'totp' ? 'Authenticator App' : 'Email OTP'}
                              </p>
                              {mfa.isPrimary && <Badge variant="success" size="sm">Chính</Badge>}
                            </div>
                            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                              {mfa.value}
                            </p>
                            <p className="text-[10px] text-[rgb(var(--text-muted))] mt-1">
                              Thêm: {new Date(mfa.addedAt).toLocaleDateString('vi-VN')} 
                              {mfa.lastUsed && ` · Dùng lần cuối: ${mfa.lastUsed}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!mfa.isPrimary && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSetPrimaryMfa(mfa.id)}
                              >
                                Đặt làm chính
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMfaMethod(mfa.id)}
                            >
                              <Trash2 className="h-4 w-4 text-[rgb(var(--error))]" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add MFA Method Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={handleAddMfaMethod}
                    >
                      Thêm phương thức MFA mới
                    </Button>

                    {/* Add MFA Modal/Form */}
                    {showAddMfa && (
                      <Card className="border-[rgb(var(--primary)/0.3)]">
                        <CardContent className="space-y-4 pt-4">
                          <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Thêm phương thức MFA mới</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] cursor-pointer transition-colors">
                              <Smartphone className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                              <div>
                                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Authenticator App</p>
                                <p className="text-xs text-[rgb(var(--text-muted))]">Quét mã QR hoặc nhập khóa bí mật</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] cursor-pointer transition-colors">
                              <Mail className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                              <div>
                                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Email OTP</p>
                                <p className="text-xs text-[rgb(var(--text-muted))]">Nhận mã qua email đã đăng ký</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={() => setShowAddMfa(false)}>
                              Hủy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
