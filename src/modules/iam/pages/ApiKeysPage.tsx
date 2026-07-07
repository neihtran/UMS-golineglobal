import { useState } from 'react';
import {
  Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle2,
  RefreshCw, Shield, Globe, Activity, ToggleLeft, ToggleRight,
} from 'lucide-react';
import {
  Button, Badge, Card, CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useApiKeys, useToggleApiKey, useDeleteApiKey } from '@/hooks/useIam';
import CreateApiKeyModal from './CreateApiKeyModal';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'neutral' | 'error'; label: string }> = {
  active: { variant: 'success', label: 'Hoạt động' },
  inactive: { variant: 'neutral', label: 'Tắt' },
  revoked: { variant: 'error', label: 'Đã thu hồi' },
};

export default function ApiKeysPage() {
  const { data, isLoading } = useApiKeys();
  const toggleMutation = useToggleApiKey();
  const deleteMutation = useDeleteApiKey();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const apiKeys = data?.data ?? [];
  const activeCount = apiKeys.filter(k => k.status === 'active').length;
  const totalUsage = apiKeys.reduce((s, k) => s + k.usage, 0);

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa API Key này? Hành động này không thể hoàn tác.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`ums_sk_${id}_secret_full_key_here`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="API Keys & Integrations"
        description="IAM-01 — Quản lý API keys cho kết nối hệ thống bên ngoài và tích hợp quốc gia"
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'API Keys' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>Regenerate all</Button>
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
        {isLoading ? (
          <div className="text-center py-12 text-[rgb(var(--text-muted))]">Đang tải...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-12 w-12 mx-auto mb-3 text-[rgb(var(--text-muted))]" />
            <p className="text-[rgb(var(--text-muted))]">Chưa có API Key nào.</p>
            <Button className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
              Tạo API Key đầu tiên
            </Button>
          </div>
        ) : (
          apiKeys.map((apiKey) => {
            const sc = STATUS_CONFIG[apiKey.status] ?? STATUS_CONFIG.inactive;
            const usagePercent = Math.round((apiKey.usage / apiKey.dailyLimit) * 100);
            const isShow = showKey === apiKey._id;
            const isToggling = toggleMutation.isPending && toggleMutation.variables === apiKey._id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === apiKey._id;

            return (
              <Card key={apiKey._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      apiKey.status === 'active'
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
                          {isShow ? apiKey.keyPreview.replace(/•+/, 'ZxK9mP2qR8wL3nB4vJ7hT1') : apiKey.keyPreview}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowKey(isShow ? null : apiKey._id)}
                          title={isShow ? 'Ẩn key' : 'Hiện key'}
                        >
                          {isShow ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(apiKey._id)}
                          disabled={copied !== null}
                        >
                          {copied === apiKey._id ? <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* Scope tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {apiKey.scopes.map((s) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(apiKey._id)}
                        title={apiKey.status === 'active' ? 'Tắt / Thu hồi' : 'Kích hoạt lại'}
                        disabled={isToggling}
                        loading={isToggling}
                        className={apiKey.status === 'active' ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--success))]'}
                      >
                        {apiKey.status === 'active' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(apiKey._id)}
                        title="Xóa API Key"
                        disabled={isDeleting}
                        loading={isDeleting}
                        className="text-[rgb(var(--error))]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      <CreateApiKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
