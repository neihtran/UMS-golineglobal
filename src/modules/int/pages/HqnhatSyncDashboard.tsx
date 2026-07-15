/**
 * HqnhatSyncDashboard — Admin Dashboard cho Hqnhat Integration
 *
 * Dashboard chuyên biệt cho api.hqnhat.id.vn sync:
 * - Trạng thái health check của API
 * - Thống kê số lượng records đã sync
 * - Sync config per entity (MIRROR/MASTER/READ_ONLY)
 * - Nút sync thủ công cho từng entity
 * - Sync logs gần đây
 * - Retry queue & dead letter management
 */

import { useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Database,
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  Layers,
  Clock,
  Play,
  Pause,
  Trash2,
  Eye,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import {
  useHqnhatHealth,
  useHqnhatConfigs,
  useUpdateSyncConfig,
  useTriggerSync,
  useTriggerAllSyncs,
  useHqnhatLogs,
  useHqnhatMappingsStats,
  useRetryStats,
  useRunRetry,
  useDeadLetters,
  useResolveDeadLetter,
  useFailures,
  type SyncEntity,
  type SyncMode,
} from '@/hooks/useHqnhatSync';
import { usePagination } from '@/hooks';
import { useNotificationStore } from '@/stores/notificationStore';

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  Faculty: <Building2 className="h-4 w-4" />,
  Major: <Layers className="h-4 w-4" />,
  Course: <BookOpen className="h-4 w-4" />,
  Curriculum: <GraduationCap className="h-4 w-4" />,
  StudentClass: <Users className="h-4 w-4" />,
  Student: <Users className="h-4 w-4" />,
  CourseGroup: <Database className="h-4 w-4" />,
};

const ENTITY_LABELS: Record<string, string> = {
  Faculty: 'Khoa',
  Major: 'Ngành',
  Course: 'Học phần',
  Curriculum: 'CTĐT',
  StudentClass: 'Lớp SV',
  Student: 'Sinh viên',
  CourseGroup: 'Nhóm HP',
};

const MODE_COLORS: Record<SyncMode, string> = {
  MASTER: 'bg-blue-50 text-blue-600 border-blue-200',
  MIRROR: 'bg-green-50 text-green-600 border-green-200',
  READ_ONLY: 'bg-amber-50 text-amber-600 border-amber-200',
  DISABLED: 'bg-gray-50 text-gray-500 border-gray-200',
};

const MODE_LABELS: Record<SyncMode, string> = {
  MASTER: 'UMS quản lý',
  MIRROR: 'Mirror từ hqnhat',
  READ_ONLY: 'Chỉ đọc',
  DISABLED: 'Tắt',
};

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  ok: { variant: 'success', label: 'Hoạt động' },
  down: { variant: 'error', label: 'API lỗi' },
  success: { variant: 'success', label: 'Thành công' },
  failed: { variant: 'error', label: 'Thất bại' },
  skipped: { variant: 'neutral', label: 'Bỏ qua' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  color = 'primary',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${color})/0.1)] text-[rgb(var(--${color}))]`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{value}</p>
          {sub && <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Entity Sync Card ─────────────────────────────────────────────────────────
function EntitySyncCard({
  entity,
  config,
  stats,
  onSync,
  onToggle,
  syncing,
}: {
  entity: string;
  config?: { mode: SyncMode; enabled: boolean; lastRunAt?: string };
  stats?: { count: number; lastSyncedAt?: string };
  onSync: () => void;
  onToggle: () => void;
  syncing: boolean;
}) {
  const modeColor = config?.mode ? MODE_COLORS[config.mode] : 'bg-gray-50 text-gray-400 border-gray-200';
  const modeLabel = config?.mode ? MODE_LABELS[config.mode] : 'Chưa cấu hình';

  return (
    <Card className={!config?.enabled ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              {ENTITY_ICONS[entity] || <Database className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                {ENTITY_LABELS[entity] || entity}
              </p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{stats?.count ?? 0} records</p>
            </div>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${modeColor}`}
          >
            {modeLabel}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))] mb-3">
          <span>
            {config?.lastRunAt
              ? `Last sync: ${new Date(config.lastRunAt).toLocaleString('vi-VN')}`
              : 'Chưa sync lần nào'}
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-xs">{config?.enabled ? 'Bật' : 'Tắt'}</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={config?.enabled ?? false}
                onChange={onToggle}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-[rgb(var(--border))] peer-checked:bg-[rgb(var(--primary))] transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          leftIcon={<Play className="h-3.5 w-3.5" />}
          onClick={onSync}
          disabled={syncing || !config?.enabled}
        >
          {syncing ? 'Đang sync...' : 'Sync ngay'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function HqnhatSyncDashboard() {
  const { addNotification } = useNotificationStore();

  // ─── Data queries ─────────────────────────────────────────────────────────
  const { data: health, isLoading: healthLoading } = useHqnhatHealth();
  const { data: configs } = useHqnhatConfigs();
  const { data: mappingStats } = useHqnhatMappingsStats();
  const { data: logsData } = useHqnhatLogs({ limit: 20 });
  const { data: retryStats } = useRetryStats();
  const { data: deadLetters } = useDeadLetters();
  const { data: failuresData } = useFailures({ status: 'pending', pageSize: 5 });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const updateConfig = useUpdateSyncConfig();
  const triggerSync = useTriggerSync();
  const triggerAllSyncs = useTriggerAllSyncs();
  const runRetry = useRunRetry();
  const resolveDeadLetter = useResolveDeadLetter();

  // ─── Local state ─────────────────────────────────────────────────────────
  const [syncingEntity, setSyncingEntity] = useState<string | null>(null);
  const [showDeadLetters, setShowDeadLetters] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSync = async (entity: string) => {
    setSyncingEntity(entity);
    try {
      await triggerSync.mutateAsync({ entity: entity as SyncEntity, dryRun: false });
    } finally {
      setSyncingEntity(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      await triggerAllSyncs.mutateAsync({ dryRun: false });
    } catch (_) {
      // Error handled in hook
    }
  };

  const handleToggle = async (entity: string, enabled: boolean) => {
    const config = configs?.find((c) => c.entity === entity);
    if (!config) return;
    try {
      await updateConfig.mutateAsync({ entity: entity as SyncEntity, mode: config.mode, enabled });
    } catch (_) {
      // Error handled in hook
    }
  };

  const handleModeChange = async (entity: string, mode: SyncMode) => {
    try {
      await updateConfig.mutateAsync({ entity: entity as SyncEntity, mode, enabled: true });
      setShowConfigModal(false);
      setSelectedEntity(null);
    } catch (_) {
      // Error handled in hook
    }
  };

  const handleRunRetry = async () => {
    try {
      await runRetry.mutateAsync();
    } catch (_) {
      // Error handled in hook
    }
  };

  const handleResolveDeadLetter = async (id: string) => {
    try {
      await resolveDeadLetter.mutateAsync({ id, notes: 'Resolved by admin' });
    } catch (_) {
      // Error handled in hook
    }
  };

  // ─── Compute stats ────────────────────────────────────────────────────────
  const totalMappings = mappingStats?.total ?? 0;
  const entityStats = mappingStats?.byEntity ?? {};

  const healthColor =
    health?.status === 'ok' ? 'success' : health?.status === 'down' ? 'error' : 'warning';
  const healthLabel = health?.status === 'ok' ? 'Hoạt động' : 'API lỗi';

  const ENTITIES: SyncEntity[] = [
    'Faculty',
    'Major',
    'Course',
    'Curriculum',
    'StudentClass',
    'Student',
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Đồng bộ api.hqnhat.id.vn"
        description="Quản lý sync dữ liệu từ hệ thống đào tạo hqnhat"
        breadcrumbs={[{ label: 'INT', href: '/int' }, { label: 'Hqnhat Sync' }]}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={handleSyncAll}
              disabled={triggerAllSyncs.isPending}
            >
              {triggerAllSyncs.isPending ? 'Đang sync...' : 'Sync tất cả'}
            </Button>
          </>
        }
      />

      {/* ─── Health + Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Health */}
        <Card
          className={
            health?.status === 'ok'
              ? 'border-[rgb(var(--success))]'
              : health?.status === 'down'
              ? 'border-[rgb(var(--error))]'
              : ''
          }
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                health?.status === 'ok'
                  ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                  : 'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]'
              }`}
            >
              {health?.status === 'ok' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">
                API Health
              </p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                {healthLoading ? '...' : healthLabel}
              </p>
              {health?.latencyMs && (
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                  Latency: {health.latencyMs}ms
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <StatCard
          label="Tổng mappings"
          value={totalMappings}
          icon={<Globe className="h-5 w-5" />}
          color="primary"
        />

        <StatCard
          label="Pending retries"
          value={retryStats?.pending ?? 0}
          sub={`${retryStats?.dead_letter ?? 0} dead letters`}
          icon={<AlertCircle className="h-5 w-5" />}
          color={retryStats?.pending ? 'warning' : 'success'}
        />

        <StatCard
          label="Webhook configured"
          value={health?.apiUrl ? 'Có' : 'Chưa'}
          sub={health?.apiUrl ?? 'Set HQNHAT_WEBHOOK_SECRET'}
          icon={<Clock className="h-5 w-5" />}
          color="info"
        />
      </div>

      {/* ─── Entity Sync Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {ENTITIES.map((entity) => {
          const config = configs?.find((c) => c.entity === entity);
          const stats = entityStats[entity] ? { count: entityStats[entity] } : undefined;

          return (
            <EntitySyncCard
              key={entity}
              entity={entity}
              config={config}
              stats={stats}
              onSync={() => handleSync(entity)}
              onToggle={() => handleToggle(entity, !config?.enabled)}
              syncing={syncingEntity === entity || triggerSync.isPending}
            />
          );
        })}
      </div>

      {/* ─── Sync Config Table ──────────────────────────────────────────── */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cấu hình Sync</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
              Chế độ đồng bộ cho từng entity
            </p>
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Entity</TableHeadCell>
              <TableHeadCell>Mode</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
              <TableHeadCell>Last sync</TableHeadCell>
              <TableHeadCell>Thao tác</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ENTITIES.map((entity) => {
              const config = configs?.find((c) => c.entity === entity);
              return (
                <TableRow key={entity}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {ENTITY_ICONS[entity]}
                      <span className="text-sm font-medium">{ENTITY_LABELS[entity]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedEntity(entity);
                        setShowConfigModal(true);
                      }}
                      className="flex items-center gap-1 hover:text-[rgb(var(--primary))] transition-colors"
                    >
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          config?.mode ? MODE_COLORS[config.mode] : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}
                      >
                        {config?.mode ? MODE_LABELS[config.mode] : 'Chưa cấu hình'}
                      </span>
                      <ChevronDown className="h-3 w-3 text-[rgb(var(--text-muted))]" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={config?.enabled ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {config?.enabled ? 'Bật' : 'Tắt'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))]">
                    {config?.lastRunAt
                      ? new Date(config.lastRunAt).toLocaleString('vi-VN')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Play className="h-3.5 w-3.5" />}
                        onClick={() => handleSync(entity)}
                        disabled={!config?.enabled}
                      >
                        Sync
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* ─── Retry Queue + Dead Letters ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Retry Stats */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
              Retry Queue
              {retryStats && retryStats.pending > 0 && (
                <Badge variant="warning" size="sm" className="ml-2">
                  {retryStats.pending} pending
                </Badge>
              )}
            </h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={handleRunRetry}
              disabled={!retryStats?.pending}
            >
              Retry now
            </Button>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-[rgb(var(--bg-base))]">
                <p className="text-2xl font-bold text-[rgb(var(--warning))]">
                  {retryStats?.pending ?? 0}
                </p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Pending</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[rgb(var(--bg-base))]">
                <p className="text-2xl font-bold text-[rgb(var(--error))]">
                  {retryStats?.dead_letter ?? 0}
                </p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Dead letter</p>
              </div>
            </div>
            {failuresData?.data && failuresData.data.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-2">Recent failures</p>
                <div className="space-y-2">
                  {failuresData.data.slice(0, 3).map((f) => (
                    <div
                      key={f._id}
                      className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-2.5 text-xs"
                    >
                      <div>
                        <p className="font-medium text-[rgb(var(--text-primary))]">
                          {ENTITY_LABELS[f.entity] ?? f.entity}
                        </p>
                        <p className="text-[rgb(var(--text-muted))] truncate max-w-[200px]">
                          {f.lastError}
                        </p>
                      </div>
                      <Badge variant="error" size="sm">
                        {f.attempts}/{f.maxAttempts}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {retryStats?.dead_letter ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                leftIcon={<Eye className="h-3.5 w-3.5" />}
                onClick={() => setShowDeadLetters(true)}
              >
                Xem dead letters ({retryStats.dead_letter})
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {/* Webhook Status */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Webhook</h3>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
              Real-time trigger từ api.hqnhat.id.vn
            </p>
          </div>
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgb(var(--text-secondary))]">Endpoint</span>
                <code className="text-xs bg-[rgb(var(--bg-base))] px-2 py-1 rounded border border-[rgb(var(--border))]">
                  /api/webhooks/hqnhat
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgb(var(--text-secondary))]">Signature</span>
                <Badge variant={health?.apiUrl ? 'success' : 'warning'} size="sm">
                  {health?.apiUrl ? 'Đã bật' : 'Chưa bật'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgb(var(--text-secondary))]">Supported events</span>
                <span className="text-xs text-[rgb(var(--text-muted))]">
                  entity.created, entity.updated, entity.deleted
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgb(var(--text-secondary))]">Retry on failure</span>
                <Badge variant="success" size="sm">
                  Exponential backoff
                </Badge>
              </div>
            </div>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-4 p-3 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
              ⚠️ Nếu hqnhat API chưa hỗ trợ webhook, hệ thống sẽ dùng cron-based sync thay thế.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Recent Logs ────────────────────────────────────────────────── */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Sync logs gần đây</h3>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => setShowLogs(true)}
          >
            Xem tất cả
          </Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Thời gian</TableHeadCell>
              <TableHeadCell>Entity</TableHeadCell>
              <TableHeadCell>Trạng thái</TableHeadCell>
              <TableHeadCell className="text-right">Tạo mới</TableHeadCell>
              <TableHeadCell className="text-right">Cập nhật</TableHeadCell>
              <TableHeadCell className="text-right">Lỗi</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logsData?.data && logsData.data.length > 0 ? (
              logsData.data.slice(0, 10).map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="text-xs text-[rgb(var(--text-muted))]">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {ENTITY_LABELS[log.entity ?? ''] ?? log.entity ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'success'
                          ? 'success'
                          : log.status === 'failed'
                          ? 'error'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {log.status === 'success'
                        ? 'Thành công'
                        : log.status === 'failed'
                        ? 'Thất bại'
                        : log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {((log.metadata as any)?.created ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {((log.metadata as any)?.updated ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-[rgb(var(--error))]">
                    {((log.metadata as any)?.errors ?? 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty
                colSpan={6}
                message="Chưa có sync log nào"
              />
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ─── Config Modal ───────────────────────────────────────────────── */}
      <Modal
        open={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setSelectedEntity(null);
        }}
        title={`Cấu hình Sync — ${selectedEntity ? ENTITY_LABELS[selectedEntity] : ''}`}
        size="sm"
      >
        {selectedEntity && (
          <div className="space-y-3 p-2">
            <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
              Chọn chế độ đồng bộ cho entity này:
            </p>
            {(['MIRROR', 'MASTER', 'READ_ONLY', 'DISABLED'] as SyncMode[]).map((mode) => {
              const config = configs?.find((c) => c.entity === selectedEntity);
              return (
                <button
                  key={mode}
                  onClick={() => handleModeChange(selectedEntity, mode)}
                  className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-all hover:border-[rgb(var(--primary))] ${
                    config?.mode === mode
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]'
                      : 'border-[rgb(var(--border))]'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {MODE_LABELS[mode]}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      {mode === 'MIRROR' && 'UMS mirror từ hqnhat, ghi đè local'}
                      {mode === 'MASTER' && 'UMS quản lý, không sync từ hqnhat'}
                      {mode === 'READ_ONLY' && 'Chỉ đọc từ hqnhat, không lưu UMS'}
                      {mode === 'DISABLED' && 'Tắt sync cho entity này'}
                    </p>
                  </div>
                  {config?.mode === mode && (
                    <CheckCircle2 className="h-5 w-5 text-[rgb(var(--primary))]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Modal>

      {/* ─── Dead Letters Modal ─────────────────────────────────────────── */}
      <Modal
        open={showDeadLetters}
        onClose={() => setShowDeadLetters(false)}
        title="Dead Letters"
        description="Những sync failures đã hết retry attempts"
        size="lg"
      >
        {deadLetters && deadLetters.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {deadLetters.map((dl) => (
              <div
                key={dl._id}
                className="flex items-start justify-between rounded-lg border border-[rgb(var(--error)/0.3)] p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="error" size="sm">
                      {ENTITY_LABELS[dl.entity] ?? dl.entity}
                    </Badge>
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {dl.attempts}/{dl.maxAttempts} attempts
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--text-primary))] mb-1">
                    {dl.lastError}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">
                    Last attempt:{' '}
                    {dl.lastAttemptAt
                      ? new Date(dl.lastAttemptAt).toLocaleString('vi-VN')
                      : '—'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  onClick={() => handleResolveDeadLetter(dl._id)}
                >
                  Resolve
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-[rgb(var(--success))] mx-auto mb-3" />
            <p className="text-[rgb(var(--text-secondary))]">Không có dead letter nào</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
