import { useState } from 'react';
import { FileText, Plus, Download } from 'lucide-react';
import { Card, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentList } from '@/hooks/useDms';
import { useDebounce } from '@/hooks';
import type { Document as DocItem } from '@/services/dms.service';

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
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useDocumentList({
    search: debouncedSearch || undefined,
    page: 1,
    pageSize: 50,
  });

  const documents = (data?.data ?? []) as DocItem[];

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
        <div className="p-4">
          <input
            type="text"
            placeholder={t('draft.searchPlaceholder') || 'Tìm kiếm văn bản...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-input))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              {TABLE_HEADERS.map((h) => (
                <TableHeadCell key={String(h.key)}>{t(String(h.key))}</TableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} colSpan={TABLE_HEADERS.length} />
            ) : documents.length === 0 ? (
              <TableEmpty colSpan={TABLE_HEADERS.length} message={t('common.noData')} />
            ) : (
              documents.map((d) => {
                const sc = STATUS_CONFIG[d.status] ?? { variant: 'neutral' as const, labelKey: 'common.status' };
                const urgencyKey = d.urgency === 'urgent' ? 'khan' : d.urgency === 'very_urgent' ? 'mat' : 'thuong';
                return (
                  <TableRow key={d._id} className="cursor-pointer hover:bg-[rgb(var(--bg-hover))]" onClick={() => navigate(`/dms/ban-nhap/${d._id}`)}>
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{d.docNumber}</TableCell>
                    <TableCell className="font-medium text-[rgb(var(--text-primary))] max-w-xs truncate">{d.title}</TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{TYPE_LABELS[d.type] ?? d.type}</Badge></TableCell>
                    <TableCell><Badge variant={URGENCY_CONFIG[d.urgency] ?? 'neutral'} size="sm">{t(`urgency.${urgencyKey}`)}</Badge></TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{d.issuedByName ?? d.issuedBy}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{d.issuedDate ? new Date(d.issuedDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                    <TableCell><Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge></TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dms/ban-nhap/${d._id}`)}>{t('common.edit')}</Button>
                        <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => navigate('/dms/cho-ky')}>{t('common.send')}</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function TableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-[rgb(var(--bg-hover))] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[rgb(var(--text-muted))]" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">{message}</p>
        </div>
      </td>
    </tr>
  );
}
