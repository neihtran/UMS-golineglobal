import { useMemo, useState } from 'react';
import { Plus, Eye, Trash2, Link } from 'lucide-react';
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

interface Prerequisite {
  _id: string;
  subject: { code: string; name: string };
  prerequisite: { code: string; name: string };
  type: 'prerequisite' | 'corequisite';
  note?: string;
  isActive: boolean;
}

export default function PrerequisiteList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });
  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);

  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Mock data
  const mockData: Prerequisite[] = [
    { _id: '1', subject: { code: 'CS201', name: 'Cấu trúc dữ liệu' }, prerequisite: { code: 'CS101', name: 'Lập trình Cơ bản' }, type: 'prerequisite', isActive: true },
    { _id: '2', subject: { code: 'CS301', name: 'Cơ sở dữ liệu' }, prerequisite: { code: 'CS201', name: 'Cấu trúc dữ liệu' }, type: 'prerequisite', isActive: true },
    { _id: '3', subject: { code: 'CS401', name: 'Lập trình Web' }, prerequisite: { code: 'CS301', name: 'Cơ sở dữ liệu' }, type: 'corequisite', isActive: true },
    { _id: '4', subject: { code: 'MATH202', name: 'Toán rời rạc' }, prerequisite: { code: 'MATH101', name: 'Toán cao cấp A1' }, type: 'prerequisite', isActive: true },
    { _id: '5', subject: { code: 'PHY201', name: 'Vật lý 2' }, prerequisite: { code: 'PHY101', name: 'Vật lý 1' }, type: 'prerequisite', isActive: true },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    return mockData.filter((p) => {
      const matchSubject = !subjectFilter || p.subject.code === subjectFilter || p.subject.name.toLowerCase().includes(subjectFilter.toLowerCase());
      const matchType = !typeFilter || p.type === typeFilter;
      return matchSubject && matchType;
    });
  }, [mockData, subjectFilter, typeFilter]);

  const paged = useMemo(
    () => filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize),
    [filtered, pagination]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Môn Tiên Quyết"
        description={`${filtered.length} điều kiện tiên quyết`}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Danh mục' }, { label: 'Môn tiên quyết' }]}
        actions={
          canEdit && (
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Thêm tiên quyết
            </Button>
          )
        }
      />

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Môn học
            </label>
            <input
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Mã hoặc tên môn học..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Loại
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              <option value="prerequisite">Tiên quyết</option>
              <option value="corequisite">Song hành</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải tiên quyết..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<Link className="h-12 w-12" />}
              title="Chưa có tiên quyết nào"
              description="Thêm điều kiện tiên quyết giữa các môn học."
              action={
                canEdit && (
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Thêm tiên quyết
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
                <TableHeadCell>Môn học</TableHeadCell>
                <TableHeadCell>Loại</TableHeadCell>
                <TableHeadCell>Môn tiên quyết</TableHeadCell>
                <TableHeadCell>Ghi chú</TableHeadCell>
                {canEdit && <TableHeadCell className="text-right">Thao tác</TableHeadCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((p, i) => (
                <TableRow key={p._id} className="hover:bg-[rgb(var(--bg-hover))]">
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {p.subject.name}
                    <span className="ml-2 text-xs text-[rgb(var(--text-muted))]">{p.subject.code}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.type === 'prerequisite' ? 'warning' : 'info'} size="sm">
                      {p.type === 'prerequisite' ? 'Tiên quyết' : 'Song hành'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {p.prerequisite.name}
                    <span className="ml-2 text-xs text-[rgb(var(--text-muted))]">{p.prerequisite.code}</span>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] max-w-[150px] truncate">
                    {p.note || '—'}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-[rgb(var(--error))]" />
                        </Button>
                      </div>
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
