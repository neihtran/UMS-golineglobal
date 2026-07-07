import { useState } from 'react';
import {
  Puzzle,
  Download,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const TYPE_BADGE: Record<string, 'primary' | 'accent' | 'info' | 'warning'> = {
  ERP: 'primary', LMS: 'accent', Email: 'info', Portal: 'warning',
  Exam: 'primary', Library: 'accent', Government: 'info', KTX: 'warning',
};

const DIR_LABEL: Record<string, string> = {
  bidirectional: '←→',
  pull: '←',
  push: '→',
};

export default function INTDashboard() {
  const { t } = useTranslation('int');
  const [, setDrawerOpen] = useState(false);

  const INT_STATS = [
    { label: t('dashboard.totalIntegrations'), value: '18', change: t('dashboard.newIntegrations', {count:'3'}), icon: <Puzzle className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.active'), value: '16', sub: t('dashboard.uptimePercent', {percent:'88.9'}), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { label: t('dashboard.warnings'), value: '2', sub: t('dashboard.needCheck'), icon: <AlertCircle className="h-5 w-5" />, color: 'warning' },
    { label: t('dashboard.eventsToday'), value: '1,847', sub: t('dashboard.vsYesterday', {percent:'12'}), icon: <Clock className="h-5 w-5" />, color: 'info' },
  ];

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    active: { variant: 'success', label: t('list.status.active') },
    warning: { variant: 'warning', label: t('list.status.warning') },
    inactive: { variant: 'neutral', label: t('list.status.inactive') },
  };

  const UPTIME_TREND = [
    { day: 'T2', uptime: 99.8 }, { day: 'T3', uptime: 99.9 },
    { day: 'T4', uptime: 99.7 }, { day: 'T5', uptime: 100 },
    { day: 'T6', uptime: 99.9 }, { day: 'T7', uptime: 99.5 },
    { day: 'CN', uptime: 99.8 },
  ];

  const INTEGRATIONS = [
    { id: 'i1', name: 'HEMIS API', type: 'ERP', direction: 'bidirectional', status: 'active', uptime: 99.8, lastSync: '5 phút trước', eventsToday: 1240, desc: 'Đồng bộ dữ liệu sinh viên, nhân sự, đào tạo' },
    { id: 'i2', name: 'Học trực tuyến LMS', type: 'LMS', direction: 'pull', status: 'active', uptime: 99.2, lastSync: '2 phút trước', eventsToday: 480, desc: 'Nhận kết quả học tập, điểm thi, tiến độ' },
    { id: 'i3', name: 'Email University', type: 'Email', direction: 'push', status: 'active', uptime: 100, lastSync: '1 phút trước', eventsToday: 124, desc: 'Gửi thông báo, nhắc nhở, newsletter' },
    { id: 'i4', name: 'Cổng thông tin PORTAL', type: 'Portal', direction: 'bidirectional', status: 'active', uptime: 99.5, lastSync: '3 phút trước', eventsToday: 85, desc: 'Hiển thị tin tức, thông báo, dữ liệu công khai' },
    { id: 'i5', name: 'Thi trực tuyến EXAM', type: 'Exam', direction: 'pull', status: 'active', uptime: 98.7, lastSync: '10 phút trước', eventsToday: 62, desc: 'Lấy danh sách thi, gửi kết quả thi' },
    { id: 'i6', name: 'Thư viện số LIB', type: 'Library', direction: 'pull', status: 'warning', uptime: 95.2, lastSync: '1 giờ trước', eventsToday: 28, desc: 'Tra cứu tài liệu, lịch sử mượn trả' },
    { id: 'i7', name: 'API Tuyển sinh Bộ', type: 'Government', direction: 'push', status: 'active', uptime: 100, lastSync: '30 phút trước', eventsToday: 3, desc: 'Gửi dữ liệu tuyển sinh lên hệ thống Bộ GD&ĐT' },
    { id: 'i8', name: 'Hệ thống KTX', type: 'KTX', direction: 'bidirectional', status: 'warning', uptime: 94.1, lastSync: '2 giờ trước', eventsToday: 15, desc: 'Đồng bộ danh sách sinh viên ở KTX' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'INT' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>{t('syncAll')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>{t('addIntegration')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INT_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Integration list */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('list.integrationList')}</h3>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>{t('syncAll')}</Button>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {INTEGRATIONS.map((int) => {
              const sc = STATUS_CONFIG[int.status];
              return (
                <div key={int.id} className="px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Globe className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{int.name}</span>
                        <Badge variant={TYPE_BADGE[int.type]} size="sm">{int.type}</Badge>
                        <span className="font-mono text-[10px] text-[rgb(var(--text-muted))] border border-[rgb(var(--border))] rounded px-1">{DIR_LABEL[int.direction]}</span>
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                      </div>
                      <p className="text-xs text-[rgb(var(--text-secondary))]">{int.desc}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                        <span>{t('list.sync')}: {int.lastSync}</span>
                        <span>📊 {int.eventsToday} {t('list.eventsToday')}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${int.uptime >= 99 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]'}`}>
                        {int.uptime}%
                      </p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('list.uptime')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Uptime trend */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.uptimeTrend')}</h3>
          </div>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={UPTIME_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[94, 101]} tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={(v: number) => [`Uptime: ${v}%`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="uptime" stroke="rgb(var(--success))" strokeWidth={2.5} dot={{ r: 4 }}  animationDuration={1500} animationEasing="ease-out" activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-5 pb-4">
            <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-center">
              <p className="text-2xl font-bold text-[rgb(var(--success))]">99.7%</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.avgUptime')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
