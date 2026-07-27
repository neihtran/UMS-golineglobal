import { useState } from 'react';
import {
  Search,
  Edit,
  Eye,
  RotateCcw,
  Award,
  Undo2,
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
  useGraduationRecords,
  useGraduationRecord,
  useUpdateGraduationRecord,
  useRevokeGraduationRecord,
  useDeleteGraduationRecord,
  useGraduationBatches,
  type GraduationRecord,
  type GraduationRecordUpdatePayload,
  type GraduationBatch,
} from '@/hooks/useSisGraduation';

const RECORD_STATUS: Record<string, { variant: 'success' | 'error'; label: string }> = {
  graduated: { variant: 'success', label: 'Đã tốt nghiệp' },
  revoked: { variant: 'error', label: 'Đã thu hồi' },
};

const CLASSIFICATION_CONFIG: Record<string, string> = {
  excellent: 'Xuất sắc',
  very_good: 'Giỏi',
  good: 'Khá',
  average: 'Trung bình',
};

const emptyPayload = (): GraduationRecordUpdatePayload => ({
  graduation_date: null,
  degree_no: null,
  certificate_no: null,
  classification: null,
  decision_no: null,
  decision_date: null,
  note: null,
});

export function GraduationRecordSheet() {
  const { pagination, setPage, setPageSize } = usePagination({
    initialPage: 1,
    initialPageSize: 15,
  });
  const { page, pageSize } = pagination;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');

  const params = {
    page,
    per_page: pageSize,
    sort_by: 'id',
    sort_direction: 'desc' as const,
    graduation_batch_id: batchFilter ? Number(batchFilter) : undefined,
    status: statusFilter || undefined,
    classification: classificationFilter || undefined,
  };

  const { data, isLoading, isFetching } = useGraduationRecords(params);
  const { data: batchesData } = useGraduationBatches({ per_page: 100 });

  const items = Array.isArray(data?.data)
    ? (data.data as GraduationRecord[])
    : [];
  const total = data?.meta?.total ?? items.length;
  const batches = Array.isArray(batchesData?.data)
    ? (batchesData.data as GraduationBatch[])
    : [];

  // Modals
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<GraduationRecord | null>(null);
  const [editPayload, setEditPayload] = useState<GraduationRecordUpdatePayload>(
    emptyPayload()
  );
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeItem, setRevokeItem] = useState<GraduationRecord | null>(null);
  const [revokeNote, setRevokeNote] = useState('');
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<GraduationRecord | null>(null);

  const { data: detailData, isLoading: detailLoading } = useGraduationRecord(
    detailId ?? undefined
  );
  const updateMut = useUpdateGraduationRecord();
  const revokeMut = useRevokeGraduationRecord();
  const deleteMut = useDeleteGraduationRecord();
  const isProcessing =
    updateMut.isPending || revokeMut.isPending || deleteMut.isPending;

  const getBatchName = (id: number) =>
    batches.find((b: GraduationBatch) => b.id === id)?.name ?? `Đợt #${id}`;

  const openDetail = (item: GraduationRecord) => {
    setDetailId(item.id);
    setDetailOpen(true);
  };

  const openEdit = (item: GraduationRecord) => {
    setEditItem(item);
    setEditPayload({
      graduation_date: item.graduation_date ?? null,
      degree_no: item.degree_no ?? null,
      certificate_no: item.certificate_no ?? null,
      classification: item.classification ?? null,
      decision_no: item.decision_no ?? null,
      decision_date: item.decision_date ?? null,
      note: item.note ?? null,
    });
    setEditErrors({});
    setEditSubmitError(null);
    setEditOpen(true);
  };

  const openRevoke = (item: GraduationRecord) => {
    setRevokeItem(item);
    setRevokeNote('');
    setRevokeError(null);
    setRevokeOpen(true);
  };

  const openDelete = (item: GraduationRecord) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setBatchFilter('');
    setClassificationFilter('');
    setPage(1);
  };

  const handleEdit = async () => {
    setEditSubmitError(null);
    try {
      if (!editItem) return;
      await updateMut.mutateAsync({
        id: editItem.id,
        payload: editPayload,
      });
      setEditOpen(false);
      setEditItem(null);
    } catch (err: any) {
      setEditSubmitError(err?.message || 'Cập nhật thất bại');
    }
  };

  const handleRevoke = async () => {
    setRevokeError(null);
    if (!revokeItem) return;
    try {
      await revokeMut.mutateAsync({
        id: revokeItem.id,
        note: revokeNote || null,
      });
      setRevokeOpen(false);
      setRevokeItem(null);
    } catch (err: any) {
      setRevokeError(err?.message || 'Thu hồi thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMut.mutateAsync(deleteItem.id);
      setDeleteOpen(false);
      setDeleteItem(null);
    } catch (_) {}
  };

  const hasFilters =
    search || statusFilter || batchFilter || classificationFilter;

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
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="graduated">Đã tốt nghiệp</option>
            <option value="revoked">Đã thu hồi</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Xếp loại
          </label>
          <select
            value={classificationFilter}
            onChange={(e) => {
              setClassificationFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(CLASSIFICATION_CONFIG).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
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
            <TableHeadCell className="text-center">Ngày TN</TableHeadCell>
            <TableHeadCell>Số bằng</TableHeadCell>
            <TableHeadCell>Xếp loại</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell className="text-right w-36">Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-8 text-[rgb(var(--text-muted))]"
              >
                Chưa có bằng tốt nghiệp nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, i) => {
              const sc =
                RECORD_STATUS[item.status] ?? RECORD_STATUS.graduated;
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
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                      {item.student?.name ?? `SV #${item.student_id}`}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.graduation_batch?.name ??
                      getBatchName(item.graduation_batch_id)}
                  </TableCell>
                  <TableCell className="text-center text-sm text-[rgb(var(--text-muted))]">
                    {item.graduation_date
                      ? new Date(item.graduation_date).toLocaleDateString('vi-VN')
                      : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.degree_no || '—'}
                  </TableCell>
                  <TableCell>
                    {item.classification ? (
                      <Badge variant="info" size="sm">
                        {CLASSIFICATION_CONFIG[item.classification] ??
                          item.classification}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} size="sm" dot>
                      {sc.label}
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
                      {item.status === 'graduated' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(item)}
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRevoke(item)}
                            title="Thu hồi"
                          >
                            <Undo2 className="h-4 w-4 text-orange-500" />
                          </Button>
                        </>
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
        title="Chi tiết bằng tốt nghiệp"
        size="md"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
          </div>
        ) : detailData?.data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Award className="h-5 w-5 text-[rgb(var(--primary))]" />
              <h3 className="text-lg font-bold">
                {detailData.data.student?.name ?? `SV #${detailData.data.student_id}`}
              </h3>
              <Badge
                variant={
                  RECORD_STATUS[detailData.data.status]?.variant ?? 'success'
                }
                size="sm"
              >
                {RECORD_STATUS[detailData.data.status]?.label ?? '—'}
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
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Đợt xét</p>
                <p className="font-medium">
                  {detailData.data.graduation_batch?.name ??
                    `Đợt #${detailData.data.graduation_batch_id}`}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày TN</p>
                <p className="font-medium tabular-nums">
                  {detailData.data.graduation_date
                    ? new Date(detailData.data.graduation_date).toLocaleDateString(
                        'vi-VN'
                      )
                    : '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Xếp loại</p>
                <p className="font-medium">
                  {detailData.data.classification
                    ? CLASSIFICATION_CONFIG[detailData.data.classification] ??
                      detailData.data.classification
                    : '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số bằng</p>
                <p className="font-medium font-mono">
                  {detailData.data.degree_no || '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số chứng chỉ</p>
                <p className="font-medium font-mono">
                  {detailData.data.certificate_no || '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Số QĐ</p>
                <p className="font-medium">
                  {detailData.data.decision_no || '—'}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3">
                <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ngày QĐ</p>
                <p className="font-medium tabular-nums">
                  {detailData.data.decision_date
                    ? new Date(detailData.data.decision_date).toLocaleDateString(
                        'vi-VN'
                      )
                    : '—'}
                </p>
              </div>
              {detailData.data.note && (
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-3 col-span-2">
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Ghi chú</p>
                  <p className="font-medium">{detailData.data.note}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Đóng
              </Button>
              {detailData.data.status === 'graduated' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailOpen(false);
                    openEdit(detailData.data);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Sửa
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-[rgb(var(--text-muted))]">
            Không tìm thấy dữ liệu
          </p>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Cập nhật bằng tốt nghiệp"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit} loading={updateMut.isPending}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {editSubmitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {editSubmitError}
            </div>
          )}
          <FormField label="Ngày tốt nghiệp">
            <Input
              type="date"
              value={editPayload.graduation_date ?? ''}
              onChange={(e) =>
                setEditPayload({
                  ...editPayload,
                  graduation_date: e.target.value || null,
                })
              }
            />
          </FormField>
          <FormField label="Số bằng">
            <Input
              value={editPayload.degree_no ?? ''}
              onChange={(e) =>
                setEditPayload({
                  ...editPayload,
                  degree_no: e.target.value || null,
                })
              }
              placeholder="VD: BK-2024-001"
            />
          </FormField>
          <FormField label="Số chứng chỉ">
            <Input
              value={editPayload.certificate_no ?? ''}
              onChange={(e) =>
                setEditPayload({
                  ...editPayload,
                  certificate_no: e.target.value || null,
                })
              }
              placeholder="VD: CN-2024-001"
            />
          </FormField>
          <FormField label="Xếp loại">
            <select
              value={editPayload.classification ?? ''}
              onChange={(e) =>
                setEditPayload({
                  ...editPayload,
                  classification: e.target.value || null,
                })
              }
              className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm"
            >
              <option value="">-- Chọn xếp loại --</option>
              {Object.entries(CLASSIFICATION_CONFIG).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Số quyết định">
            <Input
              value={editPayload.decision_no ?? ''}
              onChange={(e) =>
                setEditPayload({
                  ...editPayload,
                  decision_no: e.target.value || null,
                })
              }
              placeholder="VD: 123/QĐ-DHBK"
            />
          </FormField>
          <FormField label="Ngày quyết định">
            <Input
              type="date"
              value={editPayload.decision_date ?? ''}
              onChange={(e) =>
                setEditPayload({
                  ...editPayload,
                  decision_date: e.target.value || null,
                })
              }
            />
          </FormField>
          <FormField label="Ghi chú">
            <Input
              value={editPayload.note ?? ''}
              onChange={(e) =>
                setEditPayload({
                  ...editPayload,
                  note: e.target.value || null,
                })
              }
              placeholder="Ghi chú..."
            />
          </FormField>
        </div>
      </Modal>

      {/* Revoke Modal */}
      <ConfirmModal
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        onConfirm={handleRevoke}
        title={`Thu hồi bằng tốt nghiệp — ${
          revokeItem?.student?.name ?? `SV #${revokeItem?.student_id ?? ''}`
        }`}
        description={`Hành động này sẽ thu hồi bằng tốt nghiệp của sinh viên. Không thể hoàn tác.`}
        confirmText="Thu hồi"
        variant="danger"
        loading={revokeMut.isPending}
      >
        <div className="mt-4 space-y-2">
          {revokeError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {revokeError}
            </div>
          )}
          <FormField label="Lý do thu hồi">
            <textarea
              value={revokeNote}
              onChange={(e) => setRevokeNote(e.target.value)}
              placeholder="VD: Thu hồi do phát hiện gian lận..."
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] resize-none"
            />
          </FormField>
        </div>
      </ConfirmModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bằng tốt nghiệp"
        description={`Bạn có chắc muốn xóa bằng tốt nghiệp của "${
          deleteItem?.student?.name ?? `SV #${deleteItem?.student_id ?? ''}`
        }"?`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteMut.isPending}
      />
    </div>
  );
}

export default GraduationRecordSheet;
