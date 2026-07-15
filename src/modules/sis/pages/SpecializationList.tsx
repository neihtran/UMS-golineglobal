import { useMemo, useState } from 'react';
import { Download, Plus, Eye, Pencil, Trash2, Layers } from 'lucide-react';
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
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import { useRole } from '@/hooks/usePermission';
import { ROLES } from '@/constants/modules';
import { SpecializationModal } from './SpecializationModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface Major {
  _id: string;
  code: string;
  name: string;
}

interface Specialization {
  _id: string;
  code: string;
  name: string;
  description?: string;
  major: Major;
  status: 'draft' | 'pending' | 'published' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SpecializationList() {
  const { t } = useTranslation('sis');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });

  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);
  const canDelete = useRole([ROLES.ADMIN]);

  const [search, setSearch] = useState('');
  const [major, setMajor] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data?: Specialization;
  }>({ isOpen: false, mode: 'create' });

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<Specialization | null>(null);

  // Mock data
  const mockMajors: Major[] = [
    { _id: '1', code: 'CNTT', name: 'Công nghệ thông tin' },
    { _id: '2', code: 'KTPM', name: 'Kỹ thuật phần mềm' },
    { _id: '3', code: 'ATTT', name: 'An toàn thông tin' },
    { _id: '4', code: 'KHMT', name: 'Khoa học máy tính' },
  ];

  const mockData: Specialization[] = [
    {
      _id: '1',
      code: 'AI',
      name: 'Trí tuệ nhân tạo',
      description: 'Chuyên ngành về AI và Machine Learning',
      major: mockMajors[3],
      status: 'published',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      _id: '2',
      code: 'KTTT',
      name: 'Kỹ thuật tri thức',
      description: 'Chuyên ngành về xử lý ngôn ngữ tự nhiên',
      major: mockMajors[3],
      status: 'published',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      _id: '3',
      code: 'ATBM',
      name: 'An toàn bảo mật mạng',
      description: 'Chuyên ngành về bảo mật mạng',
      major: mockMajors[2],
      status: 'published',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      _id: '4',
      code: 'PTPM',
      name: 'Phát triển phần mềm',
      description: 'Chuyên ngành phát triển ứng dụng',
      major: mockMajors[1],
      status: 'draft',
      isActive: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockData.filter((sp) => {
      const matchSearch =
        !q ||
        sp.name.toLowerCase().includes(q) ||
        sp.code.toLowerCase().includes(q);
      const matchMajor = !major || (sp.major && (sp.major as any)._id === major);
      const matchStatus =
        status === 'all' || (status === 'active' ? sp.isActive : !sp.isActive);
      return matchSearch && matchMajor && matchStatus;
    });
  }, [mockData, search, major, status]);

  const paged = useMemo(
    () =>
      filtered.slice(
        (pagination.page - 1) * pagination.pageSize,
        pagination.page * pagination.pageSize
      ),
    [filtered, pagination]
  );

  const handleView = (item: Specialization) => {
    setModalState({ isOpen: true, mode: 'view', data: item });
  };

  const handleEdit = (item: Specialization) => {
    setModalState({ isOpen: true, mode: 'edit', data: item });
  };

  const handleCreate = () => {
    setModalState({ isOpen: true, mode: 'create' });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'create' });
  };

  const handleDelete = (item: Specialization) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = () => {
    console.log('Delete:', deleteItem?._id);
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Chuyên ngành"
        description={`${filtered.length} chuyên ngành`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục' },
          { label: 'Chuyên ngành' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Xuất Excel
            </Button>
            {canEdit && (
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                Thêm chuyên ngành
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
              placeholder="Tìm theo mã, tên chuyên ngành..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Ngành
            </label>
            <select
              value={major}
              onChange={(e) => {
                setMajor(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              {mockMajors.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
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
            <LoadingState message="Đang tải danh sách chuyên ngành..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<Layers className="h-12 w-12" />}
              title={search || major || status !== 'all' ? 'Không tìm thấy chuyên ngành' : 'Chưa có chuyên ngành nào'}
              description={
                search || major || status !== 'all'
                  ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                  : 'Bắt đầu bằng cách thêm chuyên ngành đầu tiên.'
              }
              action={
                canEdit && !search && !major && status === 'all' ? (
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                    Thêm chuyên ngành
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
                <TableHeadCell>Mã CN</TableHeadCell>
                <TableHeadCell>Tên chuyên ngành</TableHeadCell>
                <TableHeadCell>Ngành cha</TableHeadCell>
                <TableHeadCell>Mô tả</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right min-w-[120px]">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((sp, i) => (
                <TableRow key={sp._id} className="hover:bg-[rgb(var(--bg-hover))]">
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                    {sp.code}
                  </TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">
                    {sp.name}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {(sp.major as any)?.name || '—'}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] max-w-xs truncate">
                    {sp.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sp.isActive ? 'success' : 'neutral'} dot size="sm">
                      {sp.isActive ? 'Hoạt động' : 'Ngừng sử dụng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(sp)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(sp)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sp)}
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
      <SpecializationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        mode={modalState.mode}
        data={modalState.data}
        majors={mockMajors}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa chuyên ngành"
        itemName={deleteItem?.name}
      />
    </div>
  );
}
