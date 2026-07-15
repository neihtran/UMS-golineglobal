import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  ConfirmModal,
  ActionButtons,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useCurriculumList, useDeleteCurriculum, type Curriculum } from '@/hooks/useSis';
import { useRole } from '@/hooks/usePermission';
import { ROLES } from '@/constants/modules';

const STATUS_CONFIG: Record<
  Curriculum['status'],
  { variant: 'success' | 'warning' | 'neutral'; label: string }
> = {
  active: { variant: 'success', label: 'Đang áp dụng' },
  draft: { variant: 'warning', label: 'Bản nháp' },
  archived: { variant: 'neutral', label: 'Lưu trữ' },
};

export default function Curriculum() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();

  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]);
  const canDelete = useRole([ROLES.ADMIN]);

  const [filters, setFilters] = useState<{ status?: string; degreeType?: string; search?: string }>(
    {}
  );
  const [pendingDelete, setPendingDelete] = useState<Curriculum | null>(null);

  const { data, isLoading, isError, refetch } = useCurriculumList({
    ...(filters.status ? { status: filters.status as Curriculum['status'] } : {}),
    ...(filters.degreeType
      ? { degreeType: filters.degreeType as Curriculum['degreeType'] }
      : {}),
    pageSize: 100,
  });

  const deleteMutation = useDeleteCurriculum();

  const items: Curriculum[] = useMemo(
    () => ((data as any)?.data ?? []) as Curriculum[],
    [data]
  );

  const searchFiltered = filters.search
    ? items.filter((p) => {
        const q = filters.search!.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          (typeof p.department === 'object' && p.department.name?.toLowerCase().includes(q))
        );
      })
    : items;

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete._id, {
      onSettled: () => setPendingDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('curriculum.title')}
        description={t('curriculum.description', { count: items.length })}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              {t('curriculum.export')}
            </Button>
            {canEdit && (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate('/sis/chuong-trinh-dao-tao/tao')}
              >
                {t('curriculum.add')}
              </Button>
            )}
          </>
        }
      />

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Tìm kiếm
            </label>
            <input
              value={filters.search ?? ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t('curriculum.searchPlaceholder')}
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Trạng thái
            </label>
            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="active">Đang áp dụng</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Bậc đào tạo
            </label>
            <select
              value={filters.degreeType ?? ''}
              onChange={(e) => setFilters({ ...filters, degreeType: e.target.value || undefined })}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="Cử nhân">Cử nhân</option>
              <option value="Kỹ sư">Kỹ sư</option>
              <option value="Thạc sĩ">Thạc sĩ</option>
              <option value="Tiến sĩ">Tiến sĩ</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải danh sách chương trình đào tạo..." />
          </div>
        ) : isError ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="Không thể tải dữ liệu"
              description="Vui lòng kiểm tra kết nối và thử lại."
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Thử lại
                </Button>
              }
            />
          </div>
        ) : searchFiltered.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="Chưa có chương trình đào tạo nào"
              description="Hãy tạo chương trình đào tạo đầu tiên cho trường."
              action={
                canEdit && (
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => navigate('/sis/chuong-trinh-dao-tao/tao')}
                  >
                    Tạo CTĐT mới
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã CTĐT</TableHeadCell>
                <TableHeadCell>Tên chương trình</TableHeadCell>
                <TableHeadCell>Khoa</TableHeadCell>
                <TableHeadCell>Bậc</TableHeadCell>
                <TableHeadCell>Năm</TableHeadCell>
                <TableHeadCell>Tổng TC</TableHeadCell>
                <TableHeadCell>Môn học</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right min-w-[120px]">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchFiltered.map((p) => (
                <TableRow key={p._id} className="hover:bg-[rgb(var(--bg-hover))]">
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                    {p.code}
                  </TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {typeof p.department === 'object'
                      ? (p.department as any).name
                      : p.department || '—'}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {p.degreeType}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {p.effectiveYear}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {p.totalCredits}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {(p.subjects ?? []).length}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_CONFIG[p.status]?.variant ?? 'neutral'} dot size="sm">
                      {STATUS_CONFIG[p.status]?.label ?? p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right min-w-[120px]">
                    <div className="flex justify-end">
                      <ActionButtons
                        viewHref={`/sis/chuong-trinh-dao-tao/${p._id}`}
                        editHref={canEdit ? `/sis/chuong-trinh-dao-tao/${p._id}/sua` : undefined}
                        onDelete={canDelete ? () => setPendingDelete(p) : undefined}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa chương trình đào tạo"
        description={
          pendingDelete
            ? `Bạn có chắc chắn muốn xóa chương trình "${pendingDelete.name}" (${pendingDelete.code})? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmText={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
        variant="danger"
      />
    </div>
  );
}
