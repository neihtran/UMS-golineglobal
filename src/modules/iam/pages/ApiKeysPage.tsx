import { useState } from 'react';
import {
  Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle2,
  RefreshCw, Shield, Globe, Activity, ToggleLeft, ToggleRight,
} from 'lucide-react';
import {
  Button, Badge, Card, CardContent, Switch,
} from '@/components/ui';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/layout';
import { toast } from '@/components/ui/Toast';
import CreateApiKeyModal from './CreateApiKeyModal';

const API_KEYS = [
  {
    id: 'key01', name: 'HEMIS Integration Key', description: 'Kết nối HEMIS — đồng bộ sinh viên, nhân sự, đào tạo',
    keyPreview: 'ums_hemis_sk_•••••••••••••••••a3f8', createdBy: 'Nguyễn Văn Admin', createdAt: '2024-01-15', lastUsed: '2026-06-26 11:30', scope: ['sis:read', 'hrm:read', 'lms:write'], status: 'active', usage: 12847, dailyLimit: 100000,
  },
  {
    id: 'key02', name: 'VNeID Authentication', description: 'Xác thực định danh điện tử qua VNeID — Bộ Công an',
    keyPreview: 'ums_vneid_sk_•••••••••••••••••b7d2', createdBy: 'Nguyễn Văn Admin', createdAt: '2024-03-10', lastUsed: '2026-06-26 10:45', scope: ['auth:verify'], status: 'active', usage: 4521, dailyLimit: 5000,
  },
  {
    id: 'key03', name: 'CSDL Văn bằng Quốc gia', description: 'Truy vấn và cập nhật văn bằng lên CSDL văn bằng quốc gia',
    keyPreview: 'ums_vbqg_sk_•••••••••••••••••9c4e', createdBy: 'Nguyễn Văn Admin', createdAt: '2024-06-01', lastUsed: '2026-06-20 08:00', scope: ['vbqg:write', 'vbqg:read'], status: 'active', usage: 342, dailyLimit: 1000,
  },
  {
    id: 'key04', name: 'Kho bạc Nhà nước', description: 'Kết nối Kho bạc Nhà nước — thanh toán học phí, chi lương',
    keyPreview: 'ums_kbnn_sk_•••••••••••••••••2f91', createdBy: 'Nguyễn Văn Admin', createdAt: '2024-08-15', lastUsed: '2026-06-25 16:00', scope: ['fin:write', 'fin:read'], status: 'active', usage: 1245, dailyLimit: 5000,
  },
  {
    id: 'key05', name: 'LMS Backup Key (Staging)', description: 'Key dự phòng môi trường staging — không dùng production',
    keyPreview: 'ums_lms_bk_••••••••••••••••••3a7c', createdBy: 'Nguyễn Văn Admin', createdAt: '2025-01-20', lastUsed: '2026-06-01 09:00', scope: ['lms:read'], status: 'inactive', usage: 0, dailyLimit: 1000,
  },
  {
    id: 'key06', name: 'CDIO Analytics Export', description: 'Export dữ liệu CDIO cho báo cáo kiểm định AUN-QA',
    keyPreview: 'ums_cdio_sk_•••••••••••••••••5d28', createdBy: 'Thảo Nguyễn', createdAt: '2025-04-12', lastUsed: '2026-06-24 18:00', scope: ['dce:read', 'sis:read'], status: 'active', usage: 892, dailyLimit: 2000,
  },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'neutral' | 'error'; label: string }> = {
  active: { variant: 'success', label: 'Hoạt động' },
  inactive: { variant: 'neutral', label: 'Tắt' },
  revoked: { variant: 'error', label: 'Đã thu hồi' },
};

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(API_KEYS.filter(k => k.status === 'active').map(k => k.id)));

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDeleteKey = () => {
    if (!deleteTarget) return;
    toast.success(`Đã xóa API Key "${deleteTarget.name}"`);
    setDeleteTarget(null);
  };

  const handleRegenerateAll = () => {
    toast.success('Đã regenerate tất cả API Keys. Token mới đang được tạo...');
  };

  const handleToggleKey = (keyId: string, keyName: string) => {
    setActiveKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
        toast.warning(`API Key "${keyName}" đã bị tắt`);
      } else {
        next.add(keyId);
        toast.success(`API Key "${keyName}" đã bật hoạt động`);
      }
      return next;
    });
  };

  const activeCount = activeKeys.size;
  const totalUsage = API_KEYS.reduce((s, k) => s + k.usage, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="API Keys & Integrations"
        description="IAM-01 — Quản lý API keys cho kết nối hệ thống bên ngoài và tích hợp quốc gia"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'API Keys' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={handleRegenerateAll}>Regenerate all</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>Tạo API Key mới</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'API Keys đang hoạt động', value: activeCount, icon: <Key className="h-5 w-5" />, color: 'success' },
          { label: 'Tổng lượt gọi tháng này', value: totalUsage.toLocaleString(), icon: <Activity className="h-5 w-5" />, color: 'primary' },
          { label: 'Hệ thống tích hợp', value: 5, icon: <Globe className="h-5 w-5" />, color: 'info' },
          { label: 'Scopes đã cấp phép', value: 12, icon: <Shield className="h-5 w-5" />, color: 'accent' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Keys list */}
      <div className="space-y-4">
        {API_KEYS.map((apiKey) => {
          const isActive = activeKeys.has(apiKey.id);
          const sc = isActive
            ? { variant: 'success' as const, label: 'Hoạt động' }
            : { variant: 'neutral' as const, label: 'Tắt' };
          const usagePercent = Math.round((apiKey.usage / apiKey.dailyLimit) * 100);
          const isShow = showKey === apiKey.id;

          return (
            <Card key={apiKey.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? 'bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]'
                      : 'bg-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                  }`}>
                    <Key className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-[rgb(var(--text-primary))]">{apiKey.name}</h4>
                      <Badge variant={sc.variant} dot>{sc.label}</Badge>
                    </div>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">{apiKey.description}</p>

                    {/* Key display */}
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-3 py-2 font-mono text-xs text-[rgb(var(--text-secondary))]">
                        {isShow ? apiKey.keyPreview.replace('•••••••••••••••••', 'ZxK9mP2qR8wL3nB4vJ7hT1') : apiKey.keyPreview}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowKey(isShow ? null : apiKey.id)}
                        title={isShow ? 'Ẩn key' : 'Hiện key'}
                      >
                        {isShow ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy('ums_sk_' + apiKey.id + '_secret', apiKey.id)}
                      >
                        {copied === apiKey.id ? <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Scope tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {apiKey.scope.map((s) => (
                        <span key={s} className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-2.5 py-0.5 text-[10px] font-mono font-semibold text-[rgb(var(--text-secondary))]">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Usage bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[rgb(var(--text-muted))]">
                          {apiKey.usage.toLocaleString()} / {apiKey.dailyLimit.toLocaleString()} lượt gọi hôm nay
                        </span>
                        <span className={`text-[10px] font-semibold ${usagePercent > 80 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--text-muted))]'}`}>
                          {usagePercent}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-[rgb(var(--warning))]' : 'bg-[rgb(var(--success))]'}`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-[10px] text-[rgb(var(--text-muted))]">
                      <span>Tạo bởi: {apiKey.createdBy}</span>
                      <span>·</span>
                      <span>Ngày tạo: {apiKey.createdAt}</span>
                      <span>·</span>
                      <span>Sử dụng lần cuối: {apiKey.lastUsed}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Switch
                      checked={activeKeys.has(apiKey.id)}
                      onChange={() => handleToggleKey(apiKey.id, apiKey.name)}
                    />
                    <Button variant="ghost" size="sm" className="text-[rgb(var(--error))]" onClick={() => setDeleteTarget({ id: apiKey.id, name: apiKey.name })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <CreateApiKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteKey}
        title="Xóa API Key"
        description={`Bạn có chắc chắn muốn xóa API Key "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
