import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  Download,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Target,
  Megaphone,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useStandardList,
  useEvidenceList,
  useAssessmentList,
  useComplaintList,
} from '@/hooks/useQa';
import type { Standard, Evidence, Assessment, Complaint } from '@/services/qa.service';

export default function QADashboard() {
  const { t } = useTranslation('qa');
  const [tab, setTab] = useState<
    'overview' | 'evidence' | 'timeline' | 'complaints' | 'reviews'
  >('overview');

  // Fetch data from API hooks
  const standardsQuery = useStandardList({ page: 1, pageSize: 50 });
  const standards: Standard[] = standardsQuery.data?.data ?? [];

  const evidencesQuery = useEvidenceList({
    page: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });
  const evidences: Evidence[] = evidencesQuery.data?.data ?? [];

  const assessmentsQuery = useAssessmentList({
    page: 1,
    pageSize: 50,
    sortBy: 'assessmentDate',
    sortDir: 'desc',
  });
  const assessments: Assessment[] = assessmentsQuery.data?.data ?? [];

  const complaintsQuery = useComplaintList({
    page: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });
  const complaints: Complaint[] = complaintsQuery.data?.data ?? [];

  // Compute stats from real data
  const standardsTotal = standards.length;
  const totalEvidence = evidences.length;
  const upcomingAssessments = assessments.filter(
    (a: Assessment) =>
      a.status === 'draft' ||
      a.status === 'in_progress' ||
      a.status === 'submitted',
  );
  const upcomingDeadline = upcomingAssessments
    .map((a: Assessment) => a.assessmentDate)
    .filter(Boolean)
    .sort()[0];
  const upcomingDeadlineLabel = upcomingDeadline
    ? new Date(upcomingDeadline).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      })
    : '—';
  const upcomingDeadlineSub = upcomingDeadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(upcomingDeadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      ) + ' ' + t('dashboard.statDaysRemaining', { days: '' }).replace(
        '{{days}}',
        '',
      )
    : '';

  const standardsByActive = useMemo(
    () => ({
      submitted: standards.filter((s: Standard) => s.isActive).length,
      self_assessed: standards.filter((s: Standard) => s.isActive).length,
      in_progress: standards.filter((s: Standard) => s.isActive).length,
      not_started: 0,
    }),
    [standards],
  );

  // Map standards to chart data using aggregated assessment scores by standard
  const standardScores = useMemo(() => {
    const byStandard: Record<string, { self: number | null; ext: number | null }> = {};
    standards.forEach((s: Standard) => {
      const matches = assessments.filter((a: Assessment) => a.standardId === s._id);
      if (matches.length > 0) {
        const avgPct =
          matches.reduce((sum: number, a: Assessment) => sum + (a.overallPercentage || 0), 0) /
          matches.length;
        const score = (avgPct / 100) * 5;
        byStandard[s.code] = {
          self: Math.round(score * 10) / 10,
          ext: null,
        };
      } else {
        byStandard[s.code] = { self: null, ext: null };
      }
    });
    return Object.entries(byStandard).map(([standard, v]) => ({
      standard,
      self: v.self,
      ext: v.ext,
    }));
  }, [standards, assessments]);

  // Approximate evidence count per standard from related evidences
  const evidenceCountByStandard = useMemo(() => {
    const counts: Record<string, number> = {};
    evidences.forEach((e: Evidence) => {
      if (e.standardId) {
        counts[e.standardId] = (counts[e.standardId] || 0) + 1;
      }
    });
    return counts;
  }, [evidences]);

  const STATUS_CONFIG: Record<
    string,
    { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string }
  > = {
    submitted: { variant: 'success', label: t('accreditation.status.submitted') },
    self_assessed: { variant: 'info', label: t('accreditation.status.self_assessed') },
    in_progress: { variant: 'warning', label: t('accreditation.status.in_progress') },
    not_started: { variant: 'neutral', label: t('accreditation.status.not_started') },
  };

  const EVIDENCE_STATUS: Record<
    string,
    { variant: 'success' | 'warning' | 'neutral' | 'error'; label: string }
  > = {
    approved: { variant: 'success', label: t('evidence.status.approved') },
    submitted: { variant: 'warning', label: t('evidence.status.review') },
    draft: { variant: 'neutral', label: t('evidence.status.draft') },
    rejected: { variant: 'error', label: t('evidence.status.rejected', 'Từ chối') },
    superseded: { variant: 'neutral', label: t('evidence.status.superseded', 'Thay thế') },
  };

  const COMPLAINT_STATUS_CONFIG: Record<
    string,
    { variant: 'success' | 'warning' | 'neutral' | 'error'; label: string }
  > = {
    resolved: { variant: 'success', label: t('complaint.status.resolved') },
    closed: { variant: 'success', label: t('complaint.status.resolved') },
    investigating: { variant: 'warning', label: t('complaint.status.processing') },
    pending_response: { variant: 'warning', label: t('complaint.status.processing') },
    received: { variant: 'neutral', label: t('complaint.status.pending') },
    escalated: { variant: 'error', label: t('complaint.status.escalated', 'Leo thang') },
  };

  const REVIEW_STATUS_CONFIG: Record<
    string,
    { variant: 'success' | 'warning' | 'neutral'; label: string }
  > = {
    approved: { variant: 'success', label: t('review.status.completed') },
    submitted: { variant: 'success', label: t('review.status.completed') },
    reviewed: { variant: 'success', label: t('review.status.completed') },
    in_progress: { variant: 'warning', label: t('review.status.in_progress') },
    draft: { variant: 'warning', label: t('review.status.in_progress') },
    rejected: { variant: 'warning', label: t('review.status.in_progress') },
  };

  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN') : '—';

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'QA' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              {t('export')}
            </Button>
            <Button leftIcon={<Upload className="h-4 w-4" />}>
              {t('upload')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: t('dashboard.statAUN'),
            value: `${standardsByActive.in_progress + standardsByActive.submitted}/${standardsTotal}`,
            sub: standardsTotal === 0 ? '—' : `${standardsTotal} tiêu chuẩn`,
            icon: <Target className="h-5 w-5" />,
            color: 'primary',
          },
          {
            label: t('dashboard.statSelfAssess'),
            value: `${standardsByActive.self_assessed}/${standardsTotal}`,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: 'success',
          },
          {
            label: t('dashboard.statEvidence'),
            value: totalEvidence.toLocaleString('vi-VN'),
            sub: t('dashboard.statEvidenceWeek'),
            icon: <FileText className="h-5 w-5" />,
            color: 'accent',
          },
          {
            label: t('dashboard.statDaysLeft'),
            value: upcomingDeadlineLabel,
            sub: upcomingDeadlineSub,
            icon: <Clock className="h-5 w-5" />,
            color: 'info',
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">
                  {s.value}
                </p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-1 border-b border-[rgb(var(--border)/0.6)]">
        {[
          { id: 'overview', label: t('dashboard.overview') },
          { id: 'evidence', label: t('dashboard.evidenceMgmt') },
          { id: 'timeline', label: t('dashboard.timeline') },
          { id: 'complaints', label: t('complaint.title', 'Khiếu nại') },
          { id: 'reviews', label: t('review.title', 'Đánh giá') },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id as typeof tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === tabItem.id
                ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {standardsQuery.isLoading ? (
              <div className="col-span-full px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                {t('common:common.loading')}
              </div>
            ) : standards.length === 0 ? (
              <div className="col-span-full px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                Chưa có tiêu chuẩn nào
              </div>
            ) : (
              standards.map((std: Standard) => {
                const statusKey = std.isActive ? 'in_progress' : 'not_started';
                const sc = STATUS_CONFIG[statusKey];
                const evidenceCount =
                  evidenceCountByStandard[std._id] ?? 0;

                const relatedAssessments = assessments.filter(
                  (a: Assessment) => a.standardId === std._id,
                );
                const avgPct =
                  relatedAssessments.length === 0
                    ? null
                    : relatedAssessments.reduce(
                        (sum: number, a: Assessment) => sum + (a.overallPercentage || 0),
                        0,
                      ) / relatedAssessments.length;
                const selfScore =
                  avgPct === null ? null : Math.round((avgPct / 100) * 5 * 10) / 10;
                const scoreColor = selfScore
                  ? selfScore >= 4
                    ? 'text-[rgb(var(--success))]'
                    : selfScore >= 3
                    ? 'text-[rgb(var(--warning))]'
                    : 'text-[rgb(var(--error))]'
                  : 'text-[rgb(var(--text-muted))]';

                return (
                  <Card
                    key={std._id}
                    className="hover:border-[rgb(var(--primary-light))] transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1] text-sm font-bold text-[rgb(var(--primary))]">
                          {std.code}
                        </div>
                        <Badge variant={sc.variant} size="sm">
                          {sc.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))] leading-tight">
                        {std.title}
                      </p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                        {t('dashboard.weight')}: {std.totalCriteria ?? 0} {t('criteria', { defaultValue: 'tiêu chí' })}
                      </p>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-[rgb(var(--text-muted))]">
                            {t('dashboard.selfScore')}
                          </p>
                          <p className={`text-xl font-bold ${scoreColor}`}>
                            {selfScore ? selfScore.toFixed(1) : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[rgb(var(--text-muted))]">
                            {t('dashboard.extScore')}
                          </p>
                          <p className="text-xl font-bold text-[rgb(var(--text-muted))]">
                            —
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-[rgb(var(--text-muted))]">
                        <span>
                          📁 {evidenceCount} {t('dashboard.evidenceCount')}
                        </span>
                        <Button variant="ghost" size="sm">
                          {t('complaint.detail')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                {t('dashboard.scoreChart')}
              </h3>
              <Badge variant="info">{t('dashboard.scale')}</Badge>
            </div>
            <CardContent className="h-64">
              {standardScores.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-[rgb(var(--text-muted))]">
                  Chưa có dữ liệu điểm
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={standardScores}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="standard"
                      tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v?.toFixed(1) ?? '—'}/5`]}
                      contentStyle={{
                        background: 'rgb(var(--bg-card))',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="self"
                      fill="rgb(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name={t('dashboard.selfAssess')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'evidence' && (
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
              {t('dashboard.evidenceMgmt')}
            </h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="h-3.5 w-3.5" />}
            >
              {t('upload')}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {[
                    t('evidence.tenMc'),
                    t('accreditation.tieuChuan'),
                    t('evidence.loai'),
                    t('evidence.dungLuong'),
                    t('evidence.nguoiTai'),
                    t('evidence.ngayTai'),
                    t('evidence.trangThai'),
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {evidencesQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                      {t('common:common.loading')}
                    </td>
                  </tr>
                ) : evidences.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                      Chưa có minh chứng nào
                    </td>
                  </tr>
                ) : (
                  evidences.map((ev: Evidence) => {
                    const sc = EVIDENCE_STATUS[ev.status] ??
                      EVIDENCE_STATUS.draft;
                    const standard = standards.find((s: Standard) => s._id === ev.standardId);
                    return (
                      <tr key={ev._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1]">
                              <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                            </div>
                            <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                              {ev.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="primary" size="sm">
                            {standard?.code ?? ev.standardTitle ?? '—'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="neutral" size="sm">
                            {ev.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))] font-mono text-xs">
                          {formatSize(ev.fileSize)}
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">
                          {ev.uploadedByName ?? ev.uploadedBy}
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">
                          {formatDate(ev.createdAt)}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant={sc.variant} size="sm">
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                          >
                            {t('evidence.view')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'timeline' && (
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">
              {t('dashboard.timelineTitle')}
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-[rgb(var(--border))]" />
              <div className="space-y-0">
                {assessmentsQuery.isLoading ? (
                  <p className="text-sm text-[rgb(var(--text-muted))]">
                    {t('common:common.loading')}
                  </p>
                ) : assessments.length === 0 ? (
                  <p className="text-sm text-[rgb(var(--text-muted))]">
                    Chưa có lịch trình đánh giá
                  </p>
                ) : (
                  assessments.slice(0, 8).map((item: Assessment, i: number) => {
                    const isDone =
                      item.status === 'approved' || item.status === 'reviewed';
                    const isCurrent =
                      item.status === 'in_progress' || item.status === 'submitted';
                    const statusKey = isDone
                      ? 'done'
                      : isCurrent
                      ? 'in_progress'
                      : 'pending';
                    return (
                      <div
                        key={item._id ?? i}
                        className="relative flex items-start gap-5 pb-6 last:pb-0"
                      >
                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                            isDone
                              ? 'border-[rgb(var(--success))] bg-[rgb(var(--success))]'
                              : isCurrent
                              ? 'border-[rgb(var(--warning))] bg-[rgb(var(--warning))]'
                              : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          ) : isCurrent ? (
                            <Clock className="h-5 w-5 text-white" />
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-[rgb(var(--border))" />
                          )}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                              {item.title}
                            </p>
                            <Badge
                              variant={
                                isDone ? 'success' : isCurrent ? 'warning' : 'neutral'
                              }
                              size="sm"
                            >
                              {statusKey === 'done'
                                ? t('dashboard.done')
                                : statusKey === 'in_progress'
                                ? t('dashboard.inProgress')
                                : t('dashboard.upcoming')}
                            </Badge>
                          </div>
                          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                            {formatDate(item.assessmentDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {t('dashboard.display')} <strong>{complaints.length}</strong>{' '}
              {t('dashboard.complaints')}
            </p>
            <Button variant="outline" size="sm">
              {t('complaint.advancedFilter')}
            </Button>
          </div>
          {complaintsQuery.isLoading ? (
            <p className="text-sm text-[rgb(var(--text-muted))] px-4 py-8 text-center">
              {t('common:common.loading')}
            </p>
          ) : complaints.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))] px-4 py-8 text-center">
              Chưa có khiếu nại nào
            </p>
          ) : (
            complaints.slice(0, 8).map((c: Complaint) => {
              const sc = COMPLAINT_STATUS_CONFIG[c.status] ??
                COMPLAINT_STATUS_CONFIG.received;
              return (
                <Card
                  key={c._id}
                  className="hover:border-[rgb(var(--primary)/0.3] transition-colors"
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        c.priority === 'high' || c.priority === 'urgent'
                          ? 'bg-[rgb(var(--error)/0.1] text-[rgb(var(--error))]'
                          : c.priority === 'normal'
                          ? 'bg-[rgb(var(--warning)/0.1] text-[rgb(var(--warning))]'
                          : 'bg-[rgb(var(--success)/0.1] text-[rgb(var(--success))]'
                      }`}
                    >
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs text-[rgb(var(--text-muted))]">
                          {c._id?.slice(-6).toUpperCase() ?? '—'}
                        </span>
                        <Badge
                          variant={
                            c.priority === 'high' || c.priority === 'urgent'
                              ? 'error'
                              : c.priority === 'normal'
                              ? 'warning'
                              : 'success'
                          }
                          size="sm"
                        >
                          {t(`complaint.priority.${c.priority}`)}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {c.type}
                        </Badge>
                        <Badge variant={sc.variant} dot size="sm">
                          {sc.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                        {c.title}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                        <span>📧 {c.complainantName ?? c.complainantId}</span>
                        <span>📅 {formatDate(c.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm">
                        {t('complaint.detail')}
                      </Button>
                      {(c.status === 'received' ||
                        c.status === 'pending_response') && (
                        <Button variant="primary" size="sm">
                          {t('complaint.receive')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {t('dashboard.display')} <strong>{assessments.length}</strong>{' '}
              {t('dashboard.activities')}
            </p>
            <Button variant="outline" size="sm">
              {t('dashboard.viewStandards')}
            </Button>
          </div>
          {assessmentsQuery.isLoading ? (
            <p className="text-sm text-[rgb(var(--text-muted))] px-4 py-8 text-center">
              {t('common:common.loading')}
            </p>
          ) : assessments.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))] px-4 py-8 text-center">
              Chưa có hoạt động kiểm định nào
            </p>
          ) : (
            assessments.slice(0, 8).map((r: Assessment) => {
              const sc = REVIEW_STATUS_CONFIG[r.status] ??
                REVIEW_STATUS_CONFIG.in_progress;
              const progress = Math.round(r.overallPercentage ?? 0);
              return (
                <Card
                  key={r._id}
                  className="hover:border-[rgb(var(--primary)/0.3] transition-colors"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-[rgb(var(--text-muted))]">
                            {r._id?.slice(-6).toUpperCase() ?? '—'}
                          </span>
                          <Badge variant="accent" size="sm">
                            {r.standardTitle ?? '—'}
                          </Badge>
                          <Badge variant={sc.variant} dot size="sm">
                            {sc.label}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                          {r.title}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                          {r.departmentName ?? r.department}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[rgb(var(--text-muted))]">
                          {t('review.hanChot')}
                        </p>
                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">
                          {formatDate(r.assessmentDate)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[rgb(var(--text-muted))]">
                          {t('report.tienDo')}
                        </span>
                        <span className="font-semibold text-[rgb(var(--text-primary))]">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            r.status === 'approved'
                              ? 'bg-[rgb(var(--success))]'
                              : progress > 50
                              ? 'bg-[rgb(var(--primary))]'
                              : 'bg-[rgb(var(--warning))]'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
