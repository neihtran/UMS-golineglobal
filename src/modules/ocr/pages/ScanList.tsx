import { useState } from 'react';
import { Download, Search, Upload, Eye, FileText } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, DetailModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import ScanDetail from './ScanDetail';

const DOCUMENTS = [
  { id: 'd1', name: 'Hồ sơ tuyển dụng 2026-001', type: 'Hồ sơ nhân sự', pages: 8, processed: '2026-06-20', status: 'done', accuracy: 98.2, docType: 'PDF', size: '4.2 MB', source: 'HRM' },
  { id: 'd2', name: 'Hợp đồng lao động HLĐ-2026-042', type: 'Hợp đồng', pages: 3, processed: '2026-06-20', status: 'done', accuracy: 99.5, docType: 'PDF', size: '1.8 MB', source: 'HRM' },
  { id: 'd3', name: 'Bằng tốt nghiệp SV-2020-001', type: 'Bằng cấp', pages: 2, processed: '2026-06-19', status: 'done', accuracy: 97.8, docType: 'JPG', size: '2.1 MB', source: 'SIS' },
  { id: 'd4', name: 'Sổ điểm K60-CNTT', type: 'Sổ điểm', pages: 120, processed: '2026-06-18', status: 'review', accuracy: 84.2, docType: 'PDF', size: '45.6 MB', source: 'SIS' },
  { id: 'd5', name: 'Báo cáo NCKH 2025', type: 'Báo cáo', pages: 45, processed: '2026-06-17', status: 'done', accuracy: 96.1, docType: 'PDF', size: '18.3 MB', source: 'RIT' },
  { id: 'd6', name: 'Hồ sơ tuyển sinh K62', type: 'Tuyển sinh', pages: 240, processed: '2026-06-16', status: 'processing', accuracy: 0, docType: 'ZIP', size: '120 MB', source: 'SIS' },
  { id: 'd7', name: 'Quyết định công tác QĐ-2026-088', type: 'Văn bản', pages: 5, processed: '2026-06-15', status: 'done', accuracy: 95.4, docType: 'PDF', size: '1.1 MB', source: 'DMS' },
  { id: 'd8', name: 'Hóa đơn tài chính Q2/2026', type: 'Tài chính', pages: 18, processed: '2026-06-14', status: 'review', accuracy: 88.7, docType: 'PDF', size: '3.4 MB', source: 'FIN' },
  { id: 'd9', name: 'Giấy chứng nhận đào tạo CL', type: 'Chứng nhận', pages: 4, processed: '2026-06-13', status: 'done', accuracy: 99.1, docType: 'PDF', size: '0.9 MB', source: 'SIS' },
  { id: 'd10', name: 'Đề cương chi tiết môn CS101', type: 'Giáo trình', pages: 22, processed: '2026-06-12', status: 'done', accuracy: 97.3, docType: 'PDF', size: '5.6 MB', source: 'LMS' },
  { id: 'd11', name: 'Biên bản họp Hội đồng Khoa CNTT', type: 'Biên bản', pages: 6, processed: '2026-06-11', status: 'done', accuracy: 94.5, docType: 'PDF', size: '1.3 MB', source: 'DMS' },
  { id: 'd12', name: 'Danh sách thí sinh xét tuyển 2026', type: 'Tuyển sinh', pages: 320, processed: '2026-06-10', status: 'processing', accuracy: 0, docType: 'ZIP', size: '180 MB', source: 'SIS' },
];

const ACCURACY_COLOR = (acc: number) =>
  acc >= 97 ? 'success' : acc >= 90 ? 'info' : acc >= 80 ? 'warning' : 'error';

const STATUS_CONFIG = {
  done: { variant: 'success' as const, label: 'Hoàn thành' },
  review: { variant: 'warning' as const, label: 'Cần rà soát' },
  processing: { variant: 'neutral' as const, label: 'Đang xử lý' },
  failed: { variant: 'error' as const, label: 'Lỗi' },
};

const SOURCE_COLORS: Record<string, string> = {
  HRM: 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]',
  SIS: 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]',
  RIT: 'bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]',
  DMS: 'bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))]',
  FIN: 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]',
  LMS: 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]',
};

export default function ScanList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('Tất cả');

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedDoc = selectedId ? DOCUMENTS.find((d) => d.id === selectedId) : null;

  const filtered = DOCUMENTS.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchSource = sourceFilter === 'Tất cả' || d.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách tài liệu số hóa"
        description={`${filtered.length} tài liệu đã xử lý OCR trong hệ thống`}
        breadcrumbs={[{ label: 'OCR', href: '/ocr' }, { label: 'Tài liệu số hóa' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất dữ liệu</Button>
            <Button leftIcon={<Upload className="h-4 w-4" />}>Tải lên tài liệu</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên hoặc loại tài liệu..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] w-72"
          />
        </div>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          {['Tất cả', 'HRM', 'SIS', 'RIT', 'DMS', 'FIN', 'LMS'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]">
          <option value="all">Tất cả trạng thái</option>
          <option value="done">Hoàn thành</option>
          <option value="review">Cần rà soát</option>
          <option value="processing">Đang xử lý</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Tài liệu</TableHeadCell>
            <TableHeadCell>Loại</TableHeadCell>
            <TableHeadCell>Nguồn</TableHeadCell>
            <TableHeadCell className="text-right">Trang</TableHeadCell>
            <TableHeadCell>Định dạng</TableHeadCell>
            <TableHeadCell>Kích thước</TableHeadCell>
            <TableHeadCell>Ngày xử lý</TableHeadCell>
            <TableHeadCell>Độ chính xác</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((doc) => {
            const sc = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG];
            return (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                      <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))] max-w-[220px] truncate">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="neutral" size="sm">{doc.type}</Badge></TableCell>
                <TableCell>
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${SOURCE_COLORS[doc.source] || 'bg-[rgb(var(--border))] text-[rgb(var(--text-secondary))]'}`}>
                    {doc.source}
                  </span>
                </TableCell>
                <TableCell numeric className="text-[rgb(var(--text-secondary))] tabular-nums">{doc.pages}</TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))] font-mono">{doc.docType}</TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{doc.size}</TableCell>
                <TableCell className="text-xs text-[rgb(var(--text-secondary))]">{doc.processed}</TableCell>
                <TableCell>
                  {doc.accuracy > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                        <div className={`h-full rounded-full bg-[rgb(var(--${ACCURACY_COLOR(doc.accuracy)}))]`} style={{ width: `${doc.accuracy}%` }} />
                      </div>
                      <span className={`text-xs font-semibold text-[rgb(var(--${ACCURACY_COLOR(doc.accuracy)}))]`}>
                        {doc.accuracy}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                  )}
                </TableCell>
                <TableCell><Badge variant={sc.variant} size="sm">{sc.label}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => openDetail(doc.id)}>Xem</Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedDoc ? selectedDoc.name : ''}
        description={selectedDoc ? `${selectedDoc.docType} · ${selectedDoc.pages} trang · ${selectedDoc.size}` : ''}
        size="fullscreen"
      >
        {selectedDoc ? <ScanDetail id={selectedDoc.id} /> : null}
      </DetailModal>
    </div>
  );
}
