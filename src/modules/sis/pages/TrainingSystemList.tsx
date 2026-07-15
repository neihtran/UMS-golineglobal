import { useMemo, useState } from 'react';
import { Download, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Badge,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import { useRole } from '@/hooks/usePermission';
import { ROLES } from '@/constants/modules';
import { TrainingSystemModal } from './TrainingSystemModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TrainingSystem {
  _id: string;
  code: string;
  name: string;
  description?: string;
  durationYears: number;
  status: 'draft' | 'pending' | 'published' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  published: 'Đã xuất bản',
  archived: 'Đã lưu trữ',
};

export default function TrainingSystemList() {
  const { t } = useTranslation('sis');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });

  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);
  const canDelete = useRole([ROLES.ADMIN]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data?: TrainingSystem;
  }>({ isOpen: false, mode: 'create' });

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<TrainingSystem | null>(null);

  // Mock data - replace with actual API hook
  const mockData: TrainingSystem[] = [
    {
      _id: '1',
      code: 'CQ',
      name: 'Chính quy',
      description: 'Hệ đào tạo chính quy, toàn thời gian',
      durationYears: 4,
      status: 'published',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      _id: '2',
      code: 'LT',
      name: 'Liên thông',
      description: 'Hệ liên thông từ Cao đẳng lên Đại học',
      durationYears: 2,
      status: 'published',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      _id: '3',
      code: 'VB2',
      name: 'Văn bằng 2',
      description: 'Hệ văn bằng 2, đào tạo từ đầu',
      durationYears: 4,
      status: 'published',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      _id: '4',
      code: 'VLVL',
      name: 'Vừa làm vừa học',
      description: 'Hình thức đào tạo vừa làm vừa học',
      durationYears: 4,
      status: 'draft',
      isActive: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockData.filter((ts) => {
      const matchSearch = !q || ts.name.toLowerCase().includes(q) || ts.code.toLowerCase().includes(q);
      const matchStatus =
        status === 'all' || (status === 'active' ? ts.isActive : !ts.isActive);
      return matchSearch && matchStatus;
    });
  }, [mockData, search, status]);

  const paged = useMemo(
    () =>
      filtered.slice(
        (pagination.page - 1) * pagination.pageSize,
        pagination.page * pagination.pageSize
      ),
    [filtered, pagination]
  );

  const handleView = (item: TrainingSystem) => {
    setModalState({ isOpen: true, mode: 'view', data: item });
  };

  const handleEdit = (item: TrainingSystem) => {
    setModalState({ isOpen: true, mode: 'edit', data: item });
  };

  const handleCreate = () => {
    setModalState({ isOpen: true, mode: 'create' });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'create' });
  };

  const handleDelete = (item: TrainingSystem) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = () => {
    // TODO: Call API to delete
    console.log('Delete:', deleteItem?._id);
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Hệ đào tạo"
        description={`${filtered.length} hệ đào tạo`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Hệ đào tạo' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Xuất Excel
            </Button>
            {canEdit && (
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Thêm hệ đào tạo
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
              placeholder="Tìm theo mã, tên hệ đào tạo..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'all' | 'active' | 'inactive');
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng sử dụng</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải danh sách hệ đào tạo..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              title={search || status !== 'all' ? 'Không tìm thấy hệ đào tạo' : 'Chưa có hệ đào tạo nào'}
              description={
                search || status !== 'all'
                  ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                  : 'Bắt đầu bằng cách thêm hệ đào tạo đầu tiên.'
              }
              action={
                canEdit && !search && status === 'all' ? (
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                    Thêm hệ đào tạo
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã hệ</TableHeadCell>
                <TableHeadCell>Tên hệ đào tạo</TableHeadCell>
                <TableHeadCell>Mô tả</TableHeadCell>
                <TableHeadCell>Thời gian</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right min-w-[120px]">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((ts, i) => (
                <TableRow key={ts._id} className="hover:bg-[rgb(var(--bg-hover))]">
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                    {ts.code}
                  </TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">
                    {ts.name}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] max-w-xs truncate">
                    {ts.description || '—'}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {ts.durationYears} năm
                  </TableCell>
                  <TableCell>
                    <Badge variant={ts.isActive ? 'success' : 'neutral'} dot size="sm">
                      {ts.isActive ? 'Hoạt động' : 'Ngừng sử dụng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(ts)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ts)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ts)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-[rgb(var(--error))]" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Create/Edit/View Modal */}
      <TrainingSystemModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        mode={modalState.mode}
        data={modalState.data}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa hệ đào tạo"
        itemName={deleteItem?.name}
      />
    </div>
  );
}
