import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Upload,
  ArrowUpDown,
  Bell,
  Eye,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';
import { useDocumentList } from '@/hooks/useDms';

const URGENCY_CONFIG: Record<string, { color: 'error' | 'warning' | 'neutral'; dot: string }> = {
  khẩn: { color: 'error', dot: '🔴' },
  thường: { color: 'neutral', dot: '⚪' },
  mật: { color: 'warning', dot: '🔒' },
  normal: { color: 'neutral', dot: '⚪' },
  urgent: { color: 'error', dot: '🔴' },
  very_urgent: { color: 'error', dot: '🔴' },
};

const TABS = [
  { id: 'inbox', labelKey: 'dashboard.tabInbox' },
  { id: 'sent', labelKey: 'dashboard.tabSent' },
  { id: 'internal', labelKey: 'dashboard.tabInternal' },
  { id: 'processed', labelKey: 'dashboard.tabProcessed' },
  { id: 'all', labelKey: 'dashboard.tabAll' },
];

function itemClass(selected: boolean) {
  let cls = 'w-full text-left px-4 py-3.5 transition-colors hover:bg-[rgb(var(--bg-hover))]';
  if (selected) cls += ' bg-[rgb(var(--primary)/0.05)] border-l-2 border-[rgb(var(--primary))]';
  return cls;
}

export default function DMSDashboard() {
  const { t } = useTranslation('dms');
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const statusFilter = activeTab === 'inbox' ? 'pending' :
    activeTab === 'sent' ? 'signed' :
    activeTab === 'processed' ? 'approved' :
    activeTab === 'internal' ? 'in_progress' : undefined;

  const { data: docsResp, isLoading } = useDocumentList({
    page: 1,
    pageSize: 50,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  });

  const allDocs = (docsResp?.data ?? []) as any[];
  const total = docsResp?.pagination?.total ?? 0;

  const todayDocs = allDocs.filter((d: any) => {
    if (!d.issuedDate) return false;
    const today = new Date();
    const issued = new Date(d.issuedDate);
    return issued.toDateString() === today.toDateString();
  });

  const pendingDocs = allDocs.filter((d: any) => d.status === 'pending' || d.status === 'draft' || d.status === 'in_progress');
  const signedDocs = allDocs.filter((d: any) => d.status === 'signed' || d.status === 'published');
  const expiringDocs = allDocs.filter((d: any) => {
    if (!d.effectiveDate) return false;
    const eff = new Date(d.effectiveDate);
    const daysLeft = (eff.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 30;
  });

  const statsCards = [
    { key: 'statsInboxToday', value: todayDocs.length, icon: '📥', color: 'primary' },
    { key: 'statsPending', value: pendingDocs.length, icon: '⏳', color: 'warning' },
    { key: 'statsSignedWeek', value: signedDocs.length, icon: '✅', color: 'success' },
    { key: 'statsExpiringSoon', value: expiringDocs.length, icon: '⚠️', color: 'error' },
  ];

  const tabCounts: Record<string, number> = useMemo(() => ({
    inbox: allDocs.filter((d: any) => d.status === 'pending' || d.status === 'in_progress').length,
    all: total,
  }), [allDocs, total]);

  const filtered = search
    ? allDocs.filter((d: any) =>
        (d.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (d.docNumber ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : allDocs;

  const doc = allDocs.find((d: any) => d._id === selectedDoc);
  const docUrgency = doc ? URGENCY_CONFIG[doc.urgency] ?? URGENCY_CONFIG['thường'] : null;

  const workflowSteps = [
    'dashboard.workflow.receiveDoc',
    'dashboard.workflow.assign',
    'dashboard.workflow.process',
    'dashboard.workflow.submitSign',
    'dashboard.workflow.complete',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={`${t('moduleCode')} — ${t('dashboard.description')}`}
        breadcrumbs={[{ label: 'DMS' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('common.exportReport')}</Button>
            <Button leftIcon={<Upload className="h-4 w-4" />}>{t('soanthao.newDoc')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statsCards.map((s) => (
          <Card key={s.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t(`dashboard.${s.key}`)}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Document list */}
        <div className={doc ? 'lg:col-span-1' : 'lg:col-span-3'}>
          <Card>
            <div className="border-b border-[rgb(var(--border)/0.6)]">
              {/* Tabs */}
              <div className="flex gap-1 px-4 pt-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-primary))]'
                        : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                    }`}
                  >
                    {tabCounts[tab.id] != null
                      ? `${t(tab.labelKey)} (${tabCounts[tab.id]})`
                      : t(tab.labelKey)}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="px-4 pb-3 pt-2">
                <Input
                  placeholder={t('dashboard.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            <div className="divide-y divide-[rgb(var(--border)/0.5)]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 animate-pulse">
                    <div className="h-3 w-3/4 rounded bg-[rgb(var(--bg-hover))]" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-[rgb(var(--bg-hover))]" />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">—</p>
              ) : (
                filtered.map((d: any) => (
                  <Link key={d._id} to={`/dms/van-ban/${d._id}`} onClick={() => setSelectedDoc(d._id)} className={itemClass(selectedDoc === d._id)}>
                    <div className="flex items-start gap-2.5">
                      {/* Urgency bar */}
                      <div className={`mt-1 h-8 w-1 rounded-full shrink-0 ${
                        d.urgency === 'urgent' || d.urgency === 'very_urgent' || d.urgency === 'khẩn' ? 'bg-[rgb(var(--error))]' :
                        d.urgency === 'mật' ? 'bg-[rgb(var(--warning))]' :
                        'bg-[rgb(var(--border))]'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm truncate font-medium text-[rgb(var(--text-primary))]">
                            {d.docNumber ?? '—'} — {d.title ?? '—'}
                          </p>
                          {d.status === 'pending' && <span className="h-2 w-2 rounded-full bg-[rgb(var(--primary))] shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[rgb(var(--text-muted))]">{d.issuedByName ?? d.issuedBy ?? '—'}</span>
                          <span className="text-xs text-[rgb(var(--text-muted))]">·</span>
                          <span className="text-xs text-[rgb(var(--text-muted))]">
                            {d.issuedDate ? new Date(d.issuedDate).toLocaleDateString('vi-VN') : '—'}
                          </span>
                          {d.effectiveDate && (() => {
                            const daysLeft = Math.ceil((new Date(d.effectiveDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            if (daysLeft < 0) {
                              return <Badge variant="error" size="sm">{t('dashboard.deadlineExpiring')}</Badge>;
                            }
                            if (daysLeft <= 5) {
                              return <Badge variant="warning" size="sm">{daysLeft} ngày</Badge>;
                            }
                            return null;
                          })()}
                        </div>
                        {Array.isArray(d.tags) && d.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {d.tags.map((tag: string) => (
                              <span key={tag} className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 text-[10px] text-[rgb(var(--text-muted))]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Preview panel */}
        {doc && (
          <div className="lg:col-span-2">
            <Card>
              {/* Doc header */}
              <div className="px-6 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={docUrgency!.color as 'error' | 'warning' | 'neutral'}>
                        {t(`urgency.${doc.urgency === 'khẩn' || doc.urgency === 'urgent' || doc.urgency === 'very_urgent' ? 'khan' : doc.urgency === 'mật' ? 'mat' : 'thuong'}`)}
                      </Badge>
                      <span className="font-mono text-sm text-[rgb(var(--text-secondary))]">{doc.docNumber ?? '—'}</span>
                    </div>
                    <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">{doc.title ?? '—'}</h2>
                    <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
                      {t('dashboard.from')}: {doc.issuedByName ?? doc.issuedBy ?? '—'} · {doc.issuedDate ? new Date(doc.issuedDate).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)}>✕</Button>
                </div>
              </div>

              {/* Doc body */}
              <CardContent className="space-y-4">
                {/* Tags */}
                {Array.isArray(doc.tags) && doc.tags.length > 0 && (
                  <div className="flex gap-2">
                    {doc.tags.map((tag: string) => (
                      <Badge key={tag} variant="neutral">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Preview text */}
                <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4">
                  <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                    {doc.summary ?? '—'}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                    {t('action.viewAll')}
                  </Button>
                </div>

                {/* Workflow steps */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3">{t('workflow.signatureProgress')}</h4>
                  <div className="flex items-center gap-0">
                    {workflowSteps.map((stepKey, i) => {
                      const completedSteps = doc.totalSteps ? Math.min(Math.round(((doc.currentStep ?? 0) / doc.totalSteps) * workflowSteps.length), workflowSteps.length) : 0;
                      const isDone = i < completedSteps;
                      return (
                        <div key={stepKey} className="flex items-center gap-0">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone ? 'bg-[rgb(var(--success))] text-white' : 'bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                            }`}>
                              {isDone ? '✓' : i + 1}
                            </div>
                            <span className="text-[10px] text-[rgb(var(--text-muted))] text-center w-16">{t(stepKey)}</span>
                          </div>
                          {i < workflowSteps.length - 1 && <div className={`flex-1 h-0.5 ${i < completedSteps - 1 ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--border))]'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgb(var(--border)/0.6)]">
                  <Button size="sm" leftIcon={<ArrowUpDown className="h-3.5 w-3.5" />}>{t('action.transfer')}</Button>
                  <Button size="sm" variant="outline" leftIcon={<FileText className="h-3.5 w-3.5" />}>{t('action.sign')}</Button>
                  <Button size="sm" variant="outline" leftIcon={<Bell className="h-3.5 w-3.5" />}>{t('action.remind')}</Button>
                  <Button size="sm" variant="outline">{t('action.archive')}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}