import { useMemo, useState } from 'react';
import { Plus, Pencil, BookOpen } from 'lucide-react';
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

interface SubjectType {
  _id: string;
  code: string;
  name: string;
  category: string;
  displayOrder: number;
  status: string;
  isActive: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Chung',
  foundation: 'Nền tảng',
  specialization: 'Chuyên ngành',
  internship: 'Thực tập',
  thesis: 'Luận văn',
  military: 'GDQP',
  physical: 'GDTC',
};

const CATEGORY_COLORS: Record<string, string> = {
  general: 'info',
  foundation: 'success',
  specialization: 'warning',
  internship: 'error',
  thesis: 'neutral',
  military: 'info',
  physical: 'success',
};

export default function SubjectTypeList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });
  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);

  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Mock data
  const mockData: SubjectType[] = [
    { _id: '1', code: 'GEN', name: 'Môn học chung', category: 'general', displayOrder: 1, status: 'active', isActive: true },
    { _id: '2', code: 'FOU', name: 'Môn nền tảng', category: 'foundation', displayOrder: 2, status: 'active', isActive: true },
    { _id: '3', code: 'SPE', name: 'Môn chuyên ngành', category: 'specialization', displayOrder: 3, status: 'active', isActive: true },
    { _id: '4', code: 'INT', name: 'Thực tập', category: 'internship', displayOrder: 4, status: 'active', isActive: true },
    { _id: '5', code: 'THE', name: 'Luận văn tốt nghiệp', category: 'thesis', displayOrder: 5, status: 'active', isActive: true },
    { _id: '6', code: 'MIL', name: 'Giáo dục Quốc phòng', category: 'military', displayOrder: 6, status: 'active', isActive: true },
    { _id: '7', code: 'PHY', name: 'Giáo dục thể chất', category: 'physical', displayOrder: 7, status: 'active', isActive: true },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockData.filter((t) => {
      const matchCategory = !categoryFilter || t.category === categoryFilter;
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [mockData, categoryFilter, search]);

  const paged = useMemo(
    () => filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize),
    [filtered, pagination]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loại Môn học"
        description={`${filtered.length} loại môn học`}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Danh mục' }, { label: 'Loại môn học' }]}
        actions={
          canEdit && (
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Thêm loại môn học
            </Button>
          )
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
              placeholder="Mã, tên loại môn học..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Danh mục
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="general">Chung</option>
              <option value="foundation">Nền tảng</option>
              <option value="specialization">Chuyên ngành</option>
              <option value="internship">Thực tập</option>
              <option value="thesis">Luận văn</option>
              <option value="military">GDQP</option>
              <option value="physical">GDTC</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải loại môn học..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="Chưa có loại môn học nào"
              description="Bắt đầu bằng cách thêm loại môn học đầu tiên."
              action={
                canEdit && (
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Thêm loại môn học
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>STT</TableHeadCell>
                <TableHeadCell>Mã</TableHeadCell>
                <TableHeadCell>Tên loại môn học</TableHeadCell>
                <TableHeadCell>Danh mục</TableHeadCell>
                <TableHeadCell>Thứ tự</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                {canEdit && <TableHeadCell className="text-right">Thao tác</TableHeadCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((t, i) => (
                <TableRow key={t._id} className="hover:bg-[rgb(var(--bg-hover))]">
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{t.code}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant={CATEGORY_COLORS[t.category] as any} size="sm">
                      {CATEGORY_LABELS[t.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{t.displayOrder}</TableCell>
                  <TableCell>
                    <Badge variant={t.isActive ? 'success' : 'neutral'} dot size="sm">
                      {t.isActive ? 'Hoạt động' : 'Khóa'}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
                      </Button>
                    </TableCell>
                  )}
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
          pageSizeOptions={[10, 20, 50]}
        />
      )}
    </div>
  );
}
