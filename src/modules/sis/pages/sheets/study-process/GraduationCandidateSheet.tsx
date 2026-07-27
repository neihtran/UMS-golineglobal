import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableSkeleton,
  Modal,
  ConfirmModal,
} from '@/components/ui';
import { FormField } from '@/components/forms';
import { usePagination } from '@/hooks';
import {
  useGraduationCandidates,
  useGraduationCandidate,
  useApproveGraduationCandidate,
  useRejectGraduationCandidate,
  useUpdateGraduationCandidate,
  useGraduationBatches,
  type GraduationCandidate,
  type AcademicTerm,
  type GraduationBatch,
} from '@/hooks/useSisGraduation';

const RESULT_CONFIG: Record<
  string,
  {
    variant: 'warning' | 'success' | 'error' | 'info' | 'neutral';
    label: string;
    icon: React.ElementType;
  }
> = {
  pending: { variant: 'warning', label: 'Chờ xử lý', icon: AlertCircle },
  eligible: { variant: 'success', label: 'Đủ điều kiện', icon: CheckCircle2 },
  ineligible: { variant: 'error', label: 'Không đủ điều kiện', icon: XCircle },
  approved: { variant: 'success', label: 'Đã phê duyệt', icon: CheckCircle2 },
  rejected: { variant: 'error', label: 'Bị từ chối', icon: XCircle },
};

const CLASSIFICATION_CONFIG: Record<string, string> = {
  excellent: 'Xuất sắc',
  very_good: 'Giỏi',
  good: 'Khá',
  average: 'Trung bình',
};

interface ApprovePayload {
  graduation_date?: string;
  degree_no?: string;
  certificate_no?: string;
  classification?: string;
  decision_no?: string;
  decision_date?: string;
  note?: string;
}

export function GraduationCandidateSheet() {
  const { pagination, setPage, setPageSize } = usePagination({
    initialPage: 1,
    initialPageSize: 15,
  });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    student_id: undefined as number | undefined,
    graduation_batch_id: batchFilter ? Number(batchFilter) : undefined,
    result: resultFilter || undefined,
  };

  const { data, isLoading, isFetching } = useGraduationCandidates(params);
  const { data: batchesData } = useGraduationBatches({ per_page: 100 });

  const items = Array.isArray(data?.data)
    ? (data.data as GraduationCandidate[])
    : [];
  const total = data?.meta?.total ?? items.length;
  const batches = Array.isArray(batchesData?.data)
    ? (batchesData.data as GraduationBatch[])
    : [];

  // Modals
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveItem, setApproveItem] = useState<GraduationCandidate | null>(null);
  const [approvePayload, setApprovePayload] = useState<ApprovePayload>({});
  const [approveError, setApproveError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectItem, setRejectItem] = useState<GraduationCandidate | null>(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [remarkItem, setRemarkItem] = useState<GraduationCandidate | null>(null);
  const [remarkForm, setRemarkForm] = useState('');
  const [remarkError, setRemarkError] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useGraduationCandidate(
    detailId ?? undefined
  );
  const approveMut = useApproveGraduationCandidate();
  const rejectMut = useRejectGraduationCandidate();
  const updateRemarkMut = useUpdateGraduationCandidate();
  const isProcessing =
    approveMut.isPending || rejectMut.isPending || updateRemarkMut.isPending;

  const getBatchName = (id: number) =>
    batches.find((b: GraduationBatch) => b.id === id)?.name ?? `Đợt #${id}`;

  const openDetail = (item: GraduationCandidate) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openApprove = (item: GraduationCandidate) => {
    setApproveItem(item);
    setApprovePayload({
      classification: 'good',
    });
    setApproveError(null);
    setApproveOpen(true);
  };

  const openReject = (item: GraduationCandidate) => {
    setRejectItem(item);
    setRejectRemark('');
    setRejectError(null);
    setRejectOpen(true);
  };

  const openRemark = (item: GraduationCandidate) => {
    setRemarkItem(item);
    setRemarkForm(item.remark ?? '');
    setRemarkError(null);
    setRemarkOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setResultFilter('');
    setBatchFilter('');
    setPage(1);
  };

  const handleApprove = async () => {
    setApproveError(null);
    if (!approveItem) return;
    try {
      await approveMut.mutateAsync({
        id: approveItem.id,
        payload: approvePayload,
      });
      setApproveOpen(false);
      setApproveItem(null);
    } catch (err: any) {
      setApproveError(err?.message || 'Phê duyệt thất bại');
    }
  };

  const handleReject = async () => {
    setRejectError(null);
    if (!rejectItem) return;
    try {
      await rejectMut.mutateAsync({
        id: rejectItem.id,
        remark: rejectRemark || null,
      });
      setRejectOpen(false);
      setRejectItem(null);
    } catch (err: any) {
      setRejectError(err?.message || 'Từ chối thất bại');
    }
  };

  const handleRemark = async () => {
    setRemarkError(null);
    if (!remarkItem) return;
    try {
      await updateRemarkMut.mutateAsync({
        id: remarkItem.id,
        payload: { remark: remarkForm || null },
      });
      setRemarkOpen(false);
      setRemarkItem(null);
    } catch (err: any) {
      setRemarkError(err?.message || 'Cập nhật thất bại');
    }
  };

  const hasFilters = search || resultFilter || batchFilter;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Tìm theo tên đợt xét..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
          wrapperClassName="w-64"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Kết quả
          </label>
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(RESULT_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Đợt xét
          </label>
          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm min-w-[200px]"
          >
            <option value="">Tất cả đợt</option>
            {batches.map((b: GraduationBatch) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={resetFilters}
          >
            Đặt lại
          </Button>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="w-14">STT</TableHeadCell>
            <TableHeadCell>Mã SV</TableHeadCell>
            <TableHeadCell>Họ tên</TableHeadCell>
            <TableHeadCell>Đợt xét</TableHeadCell>
            <TableHeadCell className="text-center">GPA</TableHeadCell>
            <TableHeadCell className="text-center">Tín chỉ</TableHeadCell>
            <TableHeadCell>Kết quả</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-[rgb(var(--text-muted))]"
              >
                Chưa có ứng viên tốt nghiệp nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const rc = RESULT_CONFIG[item.result] ?? RESULT_CONFIG.pending;
              const ResultIcon = rc.icon;
              return (
                <TableRow
                  key={item.id}
                  className={isFetching && !isLoading ? 'opacity-50' : ''}
                >
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.student?.code ?? `SV #${item.student_id}`}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.student?.name ?? `SV #${item.student_id}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.graduation_batch?.name ??
                      getBatchName(item.graduation_batch_id)}
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold text-[rgb(var(--accent))]">
                    {item.gpa != null ? item.gpa.toFixed(2) : '—'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {item.total_credits ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rc.variant} size="sm" dot>
                      {rc.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(item)}
                        title="Chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(item.result === 'pending' ||
                        item.result === 'eligible') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openApprove(item)}
                            title="Phê duyệt"
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReject(item)}
                            title="Từ chối"
                          >
                            <XCircle className="h-4 w-4 text-orange-500" />
                          </Button>
                        </>
                      )}
                      {(item.result === 'ineligible' ||
                        item.result === 'approved' ||
                        item.result === 'rejected') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRemark(item)}
                          title="Ghi chú"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        pageSizeOptions={[10, 15, 25, 50]}
      />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết ứng viên tốt nghiệp"
        size="md"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-lg font-bold">
                {detailData.data.student?.name ?? `SV #${detailData.data.student_id}`}
              </h3>
              <Badge
                variant={
                  RESULT_CONFIG[detailData.data.result]?.variant ?? 'neutral'
                }
                size="sm"
              >
                {RESULT_CONFIG[detailData.data.result]?.label ?? '—'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mã SV</p>
                <p className="font-medium font-mono">
                  {detailData.data.student?.code ?? '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Lớp</p>
                <p className="font-medium">
                  {detailData.data.student?.class_name ?? '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đợt xét</p>
                <p className="font-medium">
                  {detailData.data.graduation_batch?.name ??
                    `Đợt #${detailData.data.graduation_batch_id}`}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">CPA</p>
                <p className="font-semibold tabular-nums text-[rgb(var(--accent))]">
                  {detailData.data.cpa != null
                    ? detailData.data.cpa.toFixed(2)
                    : '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">GPA</p>
                <p className="font-medium tabular-nums">
                  {detailData.data.gpa != null
                    ? detailData.data.gpa.toFixed(2)
                    : '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Tổng tín chỉ</p>
                <p className="font-medium tabular-nums">
                  {detailData.data.total_credits ?? '—'}
                </p>
              </div>
              {detailData.data.thesis_title && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 col-span-2">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đề tài TN</p>
                  <p className="font-medium">{detailData.data.thesis_title}</p>
                </div>
              )}
              {detailData.data.thesis_score != null && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Điểm TN</p>
                  <p className="font-medium tabular-nums">
                    {detailData.data.thesis_score}
                  </p>
                </div>
              )}
              {detailData.data.remark && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 col-span-2">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p>
                  <p className="font-medium">{detailData.data.remark}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy dữ liệu
          </p>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title={`Phê duyệt tốt nghiệp — ${
          approveItem?.student?.name ?? `SV #${approveItem?.student_id ?? ''}`
        }`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleApprove} loading={approveMut.isPending}>
              Phê duyệt
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {approveError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {approveError}
            </div>
          )}
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Hệ thống sẽ tự động xếp loại dựa trên CPA. Bạn có thể ghi đè xếp loại
            hoặc bổ sung thông tin bằng cấp.
          </p>
          <FormField label="Ngày tốt nghiệp">
            <Input
              type="date"
              value={approvePayload.graduation_date ?? ''}
              onChange={(e) =>
                setApprovePayload({
                  ...approvePayload,
                  graduation_date: e.target.value || undefined,
                })
              }
            />
          </FormField>
          <FormField label="Số bằng">
            <Input
              value={approvePayload.degree_no ?? ''}
              onChange={(e) =>
                setApprovePayload({
                  ...approvePayload,
                  degree_no: e.target.value || undefined,
                })
              }
              placeholder="VD: BK-2024-001"
            />
          </FormField>
          <FormField label="Số chứng chỉ">
            <Input
              value={approvePayload.certificate_no ?? ''}
              onChange={(e) =>
                setApprovePayload({
                  ...approvePayload,
                  certificate_no: e.target.value || undefined,
                })
              }
              placeholder="VD: CN-2024-001"
            />
          </FormField>
          <FormField label="Xếp loại (tự động nếu bỏ trống)">
            <select
              value={approvePayload.classification ?? ''}
              onChange={(e) =>
                setApprovePayload({
                  ...approvePayload,
                  classification: e.target.value || undefined,
                })
              }
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value="">Tự động theo CPA</option>
              {Object.entries(CLASSIFICATION_CONFIG).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Số quyết định">
            <Input
              value={approvePayload.decision_no ?? ''}
              onChange={(e) =>
                setApprovePayload({
                  ...approvePayload,
                  decision_no: e.target.value || undefined,
                })
              }
              placeholder="VD: 123/QĐ-DHBK"
            />
          </FormField>
          <FormField label="Ngày quyết định">
            <Input
              type="date"
              value={approvePayload.decision_date ?? ''}
              onChange={(e) =>
                setApprovePayload({
                  ...approvePayload,
                  decision_date: e.target.value || undefined,
                })
              }
            />
          </FormField>
          <FormField label="Ghi chú">
            <Input
              value={approvePayload.note ?? ''}
              onChange={(e) =>
                setApprovePayload({
                  ...approvePayload,
                  note: e.target.value || undefined,
                })
              }
              placeholder="Ghi chú bổ sung..."
            />
          </FormField>
        </div>
      </Modal>

      {/* Reject Modal */}
      <ConfirmModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        title={`Từ chối tốt nghiệp — ${
          rejectItem?.student?.name ?? `SV #${rejectItem?.student_id ?? ''}`
        }`}
        description={`Xác nhận từ chối tốt nghiệp cho sinh viên này?`}
        confirmText="Từ chối"
        variant="danger"
        loading={rejectMut.isPending}
      >
        <div className="mt-4 space-y-2">
          {rejectError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {rejectError}
            </div>
          )}
          <FormField label="Lý do từ chối (ghi chú)">
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="VD: Sinh viên còn nợ học phí kỳ 2/2024..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
            />
          </FormField>
        </div>
      </ConfirmModal>

      {/* Remark Modal */}
      <Modal
        open={remarkOpen}
        onClose={() => setRemarkOpen(false)}
        title={`Ghi chú — ${
          remarkItem?.student?.name ?? `SV #${remarkItem?.student_id ?? ''}`
        }`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRemarkOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleRemark} loading={updateRemarkMut.isPending}>
              Lưu ghi chú
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {remarkError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {remarkError}
            </div>
          )}
          <FormField label="Ghi chú">
            <textarea
              value={remarkForm}
              onChange={(e) => setRemarkForm(e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={4}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

export default GraduationCandidateSheet;
