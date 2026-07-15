import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Badge,
  Card,
  ConfirmModal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  ActionButtons,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import { useSubjectList, useDeleteSubject, type Subject } from '@/hooks/useSis';
import { useDepartmentList } from '@/hooks/useHrm';
import { useRole } from '@/hooks/usePermission';
import { ROLES } from '@/constants/modules';

export default function SubjectList() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });

  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]);
  const canDelete = useRole([ROLES.ADMIN]);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('');
  const [pendingDelete, setPendingDelete] = useState<Subject | null>(null);

  const { data, isLoading, isError, refetch } = useSubjectList({ pageSize: 200 });
  const { data: deptResp } = useDepartmentList({ isActive: true });
  const deleteMutation = useDeleteSubject();

  const items: Subject[] = useMemo(
    () => ((data as any)?.data ?? []) as Subject[],
    [data]
  );

  const departments = useMemo(
    () => ((deptResp as any)?.data ?? []) as Array<{ _id: string; name: string; code: string }>,
    [deptResp]
  );

  const filtered = items.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    const subjectDeptId =
      typeof s.department === 'object' && s.department ? (s.department as any)._id : s.department;
    const matchDept = !department || subjectDeptId === department;
    const matchStatus = !status || (status === 'active' ? s.isActive : !s.isActive);
    return matchSearch && matchDept && matchStatus;
  });

  const paged = filtered.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete._id, {
      onSettled: () => setPendingDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('subject.title')}
        description={t('subject.description', { count: filtered.length })}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('subject.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              {t('subject.export')}
            </Button>
            {canEdit && (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc/tao')}
              >
                {t('subject.add')}
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('subject.filter.searchPlaceholder')}
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Khoa phụ trách
            </label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'active' | 'inactive' | '');
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng sử dụng</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải danh sách môn học..." />
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
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title={search || department || status ? 'Không tìm thấy môn học' : 'Chưa có môn học nào'}
              description={
                search || department || status
                  ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                  : 'Bắt đầu bằng cách thêm môn học đầu tiên.'
              }
              action={
                canEdit &&
                !search &&
                !department &&
                !status && (
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc/tao')}
                  >
                    Thêm môn học
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã môn</TableHeadCell>
                <TableHeadCell>Tên môn học</TableHeadCell>
                <TableHeadCell>Tín chỉ</TableHeadCell>
                <TableHeadCell>Giờ LT</TableHeadCell>
                <TableHeadCell>Giờ TH</TableHeadCell>
                <TableHeadCell>Khoa phụ trách</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right min-w-[120px]">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((s) => {
                const deptName =
                  typeof s.department === 'object' && s.department
                    ? (s.department as any).name
                    : '';
                return (
                  <TableRow key={s._id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                      {s.code}
                    </TableCell>
                    <TableCell className="font-medium text-[rgb(var(--text-primary))]">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{s.credits}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{s.theoryHours ?? 0}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{s.practiceHours ?? 0}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{deptName || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? 'success' : 'neutral'} dot size="sm">
                        {s.isActive ? 'Hoạt động' : 'Ngừng sử dụng'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right min-w-[120px]">
                      <div className="flex justify-end">
                        <ActionButtons
                          viewHref={`/sis/chuong-trinh-dao-tao/mon-hoc/${s._id}`}
                          editHref={canEdit ? `/sis/chuong-trinh-dao-tao/mon-hoc/${s._id}/sua` : undefined}
                          onDelete={canDelete ? () => setPendingDelete(s) : undefined}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {paged.length > 0 && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa môn học"
        description={
          pendingDelete
            ? `Bạn có chắc chắn muốn xóa môn học "${pendingDelete.name}" (${pendingDelete.code})? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmText={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
        variant="danger"
      />
    </div>
  );
}