import { FileText, Plus, Download } from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useDetailModal } from '@/hooks/useDetailModal';
import { useTranslation } from 'react-i18next';
import BanNhapDetailPage from './BanNhapDetailPage';

const DRAFTS = [
  { id: 'd1', number: 'CV-2026-001', title: 'Quy chế đào tạo thạc sĩ ngành CNTT', type: 'cv', urgency: 'thường', from: 'Phòng Đào tạo', date: '25/06/2026', status: 'draft', content: 'Quy chế đào tạo thạc sĩ...' },
  { id: 'd2', number: 'QD-2026-012', title: 'Ban hành danh mục học liệu năm học 2026-2027', type: 'qd', urgency: 'khẩn', from: 'Phòng Tổ chức', date: '24/06/2026', status: 'draft', content: 'Danh mục học liệu...' },
  { id: 'd3', number: 'TB-2026-003', title: 'Thông báo lịch thi giữa kỳ HK2/2025-2026', type: 'tb', urgency: 'thường', from: 'Phòng Khảo thí', date: '23/06/2026', status: 'draft', content: 'Lịch thi giữa kỳ...' },
  { id: 'd4', number: 'HD-2026-001', title: 'Hướng dẫn đăng ký học phần HK2/2025-2026', type: 'hd', urgency: 'thường', from: 'Phòng Đào tạo', date: '22/06/2026', status: 'review', content: 'Hướng dẫn đăng ký...' },
];

const TYPE_LABELS: Record<string, string> = { cv: 'Công văn', qd: 'Quyết định', tb: 'Thông báo', hd: 'Hướng dẫn' };
const URGENCY_CONFIG: Record<string, 'error' | 'warning' | 'neutral'> = { khẩn: 'error', thường: 'neutral', mật: 'warning' };
const STATUS_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'neutral'; labelKey: string }> = {
  draft: { variant: 'info', labelKey: 'status.draft' },
  review: { variant: 'warning', labelKey: 'status.review' },
  submitted: { variant: 'success', labelKey: 'status.submitted' },
};

const TABLE_HEADERS = [
  { key: 'draft.documentNumber', sortable: false },
  { key: 'common.title', sortable: false },
  { key: 'common.type', sortable: false },
  { key: 'common.urgency', sortable: false },
  { key: 'draft.unitLabel', sortable: false },
  { key: 'common.createdAt', sortable: false },
  { key: 'common.status', sortable: false },
  { key: 'common.action', sortable: false },
] as const;

export default function DraftList() {
  const { t } = useTranslation('dms');
  const { selectedId, openDetail, close } = useDetailModal<string>({ size: 'fullscreen' });

  const selectedDraft = selectedId ? DRAFTS.find((d) => d.id === selectedId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('draft.title')}
        description={t('draft.description')}
        breadcrumbs={[
          { label: 'DMS', href: '/dms' },
          { label: t('draft.breadcrumb') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('draft.export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/dms/soan-thao'}>
              {t('draft.newDraft')}
            </Button>
          </>
        }
      />

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              {TABLE_HEADERS.map((h) => (
                <TableHeadCell key={String(h.key)}>{t(String(h.key))}</TableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {DRAFTS.map((d) => {
              const sc = STATUS_CONFIG[d.status];
              const urgencyKey = d.urgency === 'khẩn' ? 'khan' : d.urgency === 'mật' ? 'mat' : 'thuong';
              return (
                <TableRow key={d.id} className="cursor-pointer hover:bg-[rgb(var(--bg-hover))]" onClick={() => openDetail(d.id)}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{d.number}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))] max-w-xs truncate">{d.title}</TableCell>
                  <TableCell><Badge variant="neutral" size="sm">{TYPE_LABELS[d.type]}</Badge></TableCell>
                  <TableCell><Badge variant={URGENCY_CONFIG[d.urgency]} size="sm">{t(`urgency.${urgencyKey}`)}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{d.from}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{d.date}</TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge></TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(d.id)}>{t('common.edit')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => window.location.href = '/dms/cho-ky'}>{t('common.send')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedDraft ? `${selectedDraft.number} — ${t('common.detail')}` : t('common.detail')}
        description={selectedDraft?.title}
        size="fullscreen"
      >
        {selectedId && <BanNhapDetailPage id={selectedId} />}
      </DetailModal>
    </div>
  );
}