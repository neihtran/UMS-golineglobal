import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload, Download, CheckCircle2, Clock, FileText,
  Eye, Target, Megaphone,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AUN_STANDARDS = [
  { id: '1', code: 'AUN 1', name: 'Mục tiêu và chuẩn đầu ra', weight: 10, selfScore: 4.2, extScore: 4.0, status: 'submitted', evidence: 18 },
  { id: '2', code: 'AUN 2', name: 'Chương trình đào tạo', weight: 15, selfScore: 3.8, extScore: null, status: 'in_progress', evidence: 24 },
  { id: '3', code: 'AUN 3', name: 'Giáo viên và nhân viên', weight: 15, selfScore: 4.5, extScore: null, status: 'in_progress', evidence: 31 },
  { id: '4', code: 'AUN 4', name: 'Sinh viên', weight: 15, selfScore: 4.0, extScore: null, status: 'self_assessed', evidence: 22 },
  { id: '5', code: 'AUN 5', name: 'Chương trình đào tạo', weight: 15, selfScore: 3.5, extScore: null, status: 'in_progress', evidence: 19 },
  { id: '6', code: 'AUN 6', name: 'Cơ sở vật chất', weight: 10, selfScore: 4.1, extScore: null, status: 'self_assessed', evidence: 15 },
  { id: '7', code: 'AUN 7', name: 'Quản lý chất lượng', weight: 10, selfScore: 3.9, extScore: null, status: 'not_started', evidence: 8 },
  { id: '8', code: 'AUN 8', name: 'Kết quả đầu ra', weight: 10, selfScore: null, extScore: null, status: 'not_started', evidence: 12 },
];

const EVIDENCE = [
  { id: 'e1', title: 'Đề án thành lập trường', standard: 'AUN 1', type: 'document', size: '2.4 MB', uploadedBy: 'PGS.TS. Nguyễn Hoàng Long', uploadedAt: '2026-04-15', status: 'approved' },
  { id: 'e2', title: 'Báo cáo tự đánh giá chuẩn AUN-QA', standard: 'AUN 1', type: 'document', size: '8.1 MB', uploadedBy: 'TS. Trần Thị Lan', uploadedAt: '2026-05-20', status: 'approved' },
  { id: 'e3', title: 'Video giới thiệu cơ sở vật chất', standard: 'AUN 6', type: 'video', size: '240 MB', uploadedBy: 'ThS. Bùi Đình Nam', uploadedAt: '2026-05-10', status: 'review' },
  { id: 'e4', title: 'Hồ sơ giảng viên cơ hữu', standard: 'AUN 3', type: 'document', size: '5.2 MB', uploadedBy: 'Phạm Thu Hà', uploadedAt: '2026-05-25', status: 'uploaded' },
  { id: 'e5', title: 'Kết quả khảo sát sinh viên', standard: 'AUN 4', type: 'document', size: '3.7 MB', uploadedBy: 'TS. Lê Văn Minh', uploadedAt: '2026-06-01', status: 'review' },
  { id: 'e6', title: 'Tài liệu CTĐT ngành CNTT', standard: 'AUN 2', type: 'link', size: '—', uploadedBy: 'Ngô Thanh Sơn', uploadedAt: '2026-06-05', status: 'uploaded' },
];

const TIMELINE = [
  { date: '2026-04-01', event: 'Khởi động đánh giá AUN-QA năm 2026', status: 'done' },
  { date: '2026-04-30', event: 'Hoàn thành thu thập minh chứng giai đoạn 1', status: 'done' },
  { date: '2026-05-31', event: 'Hoàn thành tự đánh giá tất cả 8 tiêu chuẩn', status: 'in_progress' },
  { date: '2026-06-30', event: 'Nộp báo cáo tự đánh giá cho Đoàn đánh giá ngoài', status: 'pending' },
  { date: '2026-09-15', event: 'Đoàn đánh giá ngoài đến làm việc', status: 'pending' },
  { date: '2026-10-30', event: 'Công bố kết quả kiểm định', status: 'pending' },
];

const SCORE_TREND = [
  { standard: 'AUN 1', self: 4.2, ext: null },
  { standard: 'AUN 2', self: 3.8, ext: null },
  { standard: 'AUN 3', self: 4.5, ext: null },
  { standard: 'AUN 4', self: 4.0, ext: null },
  { standard: 'AUN 5', self: 3.5, ext: null },
  { standard: 'AUN 6', self: 4.1, ext: null },
];

const COMPLAINTS = [
  { id: 'c1', code: 'KN001', title: 'Khiếu nại về chất lượng giảng dạy môn Python', category: 'Chất lượng GD', from: 'SV2026003', date: '2026-06-20', status: 'pending', priority: 'high' },
  { id: 'c2', code: 'KN002', title: 'Phản ánh về cơ sở vật chất phòng lab A3', category: 'CSVC', from: 'SV2026001', date: '2026-06-18', status: 'in-progress', priority: 'medium' },
  { id: 'c3', code: 'KN003', title: 'Khiếu nại thời gian thi không phù hợp', category: 'Thi cử', from: 'SV2026004', date: '2026-06-15', status: 'resolved', priority: 'low' },
  { id: 'c4', code: 'KN004', title: 'Yêu cầu xem lại điểm thi giữa kỳ', category: 'Điểm thi', from: 'SV2026005', date: '2026-06-22', status: 'pending', priority: 'high' },
];

const REVIEWS = [
  { id: 'r1', code: 'KD2026001', name: 'Kiểm định chương trình CNTT', type: 'Kiểm định CTĐT', standard: 'AUN-QA', status: 'in-progress', deadline: '2026-09-30', progress: 65 },
  { id: 'r2', code: 'KD2025003', name: 'Đánh giá nội bộ hệ thống quản lý', type: 'Đánh giá nội bộ', standard: 'ISO 9001', status: 'in-progress', deadline: '2026-08-15', progress: 40 },
  { id: 'r3', code: 'KD2024001', name: 'Kiểm định chương trình Kế toán', type: 'Kiểm định CTĐT', standard: 'AUN-QA', status: 'completed', deadline: '2025-12-31', progress: 100 },
  { id: 'r4', code: 'KD2026002', name: 'Cập nhật hồ sơ kiểm định Vật lý', type: 'Cập nhật HS', standard: 'AUN-QA', status: 'pending', deadline: '2026-12-31', progress: 10 },
];

export default function QADashboard() {
  const { t } = useTranslation('qa');
  const [tab, setTab] = useState<'overview' | 'evidence' | 'timeline' | 'complaints' | 'reviews'>('overview');

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
    submitted: { variant: 'success', label: t('accreditation.status.submitted') },
    self_assessed: { variant: 'info', label: t('accreditation.status.self_assessed') },
    in_progress: { variant: 'warning', label: t('accreditation.status.in_progress') },
    not_started: { variant: 'neutral', label: t('accreditation.status.not_started') },
  };

  const EVIDENCE_STATUS: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    approved: { variant: 'success', label: t('evidence.status.approved') },
    review: { variant: 'warning', label: t('evidence.status.review') },
    uploaded: { variant: 'neutral', label: t('evidence.status.uploaded') },
    draft: { variant: 'neutral', label: t('evidence.status.draft') },
  };

  const COMPLAINT_STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    resolved: { variant: 'success', label: t('complaint.status.resolved') },
    'in-progress': { variant: 'warning', label: t('complaint.status.processing') },
    pending: { variant: 'neutral', label: t('complaint.status.pending') },
  };

  const REVIEW_STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    completed: { variant: 'success', label: t('review.status.completed') },
    'in-progress': { variant: 'warning', label: t('review.status.in_progress') },
    pending: { variant: 'neutral', label: t('review.status.pending') },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'QA' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Upload className="h-4 w-4" />}>{t('upload')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('dashboard.statAUN'), value: '8/8', icon: <Target className="h-5 w-5" />, color: 'primary' },
          { label: t('dashboard.statSelfAssess'), value: '3/8', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: t('dashboard.statEvidence'), value: '137', sub: t('dashboard.statEvidenceWeek'), icon: <FileText className="h-5 w-5" />, color: 'accent' },
          { label: t('dashboard.statDaysLeft'), value: '15/09', sub: '81 ' + t('dashboard.statDaysRemaining', { days: '' }).replace('{{days}}', ''), icon: <Clock className="h-5 w-5" />, color: 'info' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub ?? ''}</p>
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
            {AUN_STANDARDS.map((std) => {
              const sc = STATUS_CONFIG[std.status];
              const scoreColor = std.selfScore
                ? std.selfScore >= 4 ? 'text-[rgb(var(--success))]' : std.selfScore >= 3 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--error))]'
                : 'text-[rgb(var(--text-muted))]';
              return (
                <Card key={std.id} className="hover:border-[rgb(var(--primary-light))] transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1] text-sm font-bold text-[rgb(var(--primary))]">
                        {std.code}
                      </div>
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] leading-tight">{std.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('dashboard.weight')}: {std.weight}%</p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('dashboard.selfScore')}</p>
                        <p className={`text-xl font-bold ${scoreColor}`}>
                          {std.selfScore ? std.selfScore.toFixed(1) : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('dashboard.extScore')}</p>
                        <p className="text-xl font-bold text-[rgb(var(--text-muted))]">
                          {std.extScore ? std.extScore.toFixed(1) : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[rgb(var(--text-muted))]">
                      <span>📁 {std.evidence} {t('dashboard.evidenceCount')}</span>
                      <Button variant="ghost" size="sm">{t('complaint.detail')}</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.scoreChart')}</h3>
              <Badge variant="info">{t('dashboard.scale')}</Badge>
            </div>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="standard" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v?.toFixed(1) ?? '—'}/5`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="self" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.selfAssess')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'evidence' && (
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.evidenceMgmt')}</h3>
            <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />}>{t('upload')}</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {[t('evidence.tenMc'), t('accreditation.tieuChuan'), t('evidence.loai'), t('evidence.dungLuong'), t('evidence.nguoiTai'), t('evidence.ngayTai'), t('evidence.trangThai'), ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {EVIDENCE.map((ev) => {
                  const sc = EVIDENCE_STATUS[ev.status];
                  return (
                    <tr key={ev.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1]">
                            <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                          </div>
                          <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{ev.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5"><Badge variant="primary" size="sm">{ev.standard}</Badge></td>
                      <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{ev.type}</Badge></td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))] font-mono text-xs">{ev.size}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{ev.uploadedBy}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{ev.uploadedAt}</td>
                      <td className="px-4 py-2.5"><Badge variant={sc.variant} size="sm">{sc.label}</Badge></td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>{t('evidence.view')}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'timeline' && (
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.timelineTitle')}</h3>
          </div>
          <CardContent className="p-6">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-[rgb(var(--border))]" />
              <div className="space-y-0">
                {TIMELINE.map((item, i) => {
                  const isDone = item.status === 'done';
                  const isCurrent = item.status === 'in_progress';
                  return (
                    <div key={i} className="relative flex items-start gap-5 pb-6 last:pb-0">
                      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                        isDone ? 'border-[rgb(var(--success))] bg-[rgb(var(--success))]' :
                        isCurrent ? 'border-[rgb(var(--warning))] bg-[rgb(var(--warning))]' :
                        'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]'
                      }`}>
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
                          <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{item.event}</p>
                          <Badge variant={isDone ? 'success' : isCurrent ? 'warning' : 'neutral'} size="sm">
                            {isDone ? t('dashboard.done') : isCurrent ? t('dashboard.inProgress') : t('dashboard.upcoming')}
                          </Badge>
                        </div>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{item.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {t('dashboard.display')} <strong>{COMPLAINTS.length}</strong> {t('dashboard.complaints')}
            </p>
            <Button variant="outline" size="sm">{t('complaint.advancedFilter')}</Button>
          </div>
          {COMPLAINTS.map((c) => {
            const sc = COMPLAINT_STATUS_CONFIG[c.status];
            return (
              <Card key={c.id} className="hover:border-[rgb(var(--primary)/0.3] transition-colors">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    c.priority === 'high' ? 'bg-[rgb(var(--error)/0.1] text-[rgb(var(--error))]' :
                    c.priority === 'medium' ? 'bg-[rgb(var(--warning)/0.1] text-[rgb(var(--warning))]' :
                    'bg-[rgb(var(--success)/0.1] text-[rgb(var(--success))]'
                  }`}>
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{c.code}</span>
                      <Badge variant={c.priority === 'high' ? 'error' : c.priority === 'medium' ? 'warning' : 'success'} size="sm">
                        {t(`complaint.priority.${c.priority}`)}
                      </Badge>
                      <Badge variant="neutral" size="sm">{c.category}</Badge>
                      <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{c.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                      <span>📧 {c.from}</span>
                      <span>📅 {c.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="outline" size="sm">{t('complaint.detail')}</Button>
                    {c.status === 'pending' && (
                      <Button variant="primary" size="sm">{t('complaint.receive')}</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {t('dashboard.display')} <strong>{REVIEWS.length}</strong> {t('dashboard.activities')}
            </p>
            <Button variant="outline" size="sm">{t('dashboard.viewStandards')}</Button>
          </div>
          {REVIEWS.map((r) => {
            const sc = REVIEW_STATUS_CONFIG[r.status];
            return (
              <Card key={r.id} className="hover:border-[rgb(var(--primary)/0.3] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{r.code}</span>
                        <Badge variant="accent" size="sm">{r.standard}</Badge>
                        <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{r.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{r.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[rgb(var(--text-muted))]">{t('review.hanChot')}</p>
                      <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{r.deadline}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgb(var(--text-muted))]">{t('report.tienDo')}</span>
                      <span className="font-semibold text-[rgb(var(--text-primary))]">{r.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${r.status === 'completed' ? 'bg-[rgb(var(--success))]' : r.progress > 50 ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--warning))]'}`}
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
