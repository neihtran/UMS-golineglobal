import { useMemo, useState } from 'react';
import { Plus, Eye, Pencil, Calendar } from 'lucide-react';
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
import { ScheduleModal } from './ScheduleModal';

interface Schedule {
  _id: string;
  course: { name: string; code: string };
  lecturer: { name: string; code: string };
  room?: { name: string; code: string };
  dayOfWeek: number;
  lessonFrom: number;
  lessonTo: number;
  startDate?: string;
  endDate?: string;
  note?: string;
  isActive: boolean;
}

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ScheduleList() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 20 });
  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN]);

  const [search, setSearch] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data?: Schedule;
  }>({ isOpen: false, mode: 'create' });

  // Mock data
  const mockData: Schedule[] = [
    { _id: '1', course: { name: 'Toán cao cấp A1', code: 'MATH101' }, lecturer: { name: 'Nguyễn Văn A', code: 'GV001' }, room: { name: 'A101', code: 'A101' }, dayOfWeek: 2, lessonFrom: 1, lessonTo: 3, isActive: true },
    { _id: '2', course: { name: 'Vật lý đại cương', code: 'PHY101' }, lecturer: { name: 'Trần Thị B', code: 'GV002' }, room: { name: 'B202', code: 'B202' }, dayOfWeek: 3, lessonFrom: 4, lessonTo: 6, isActive: true },
    { _id: '3', course: { name: 'Lập trình C++', code: 'CS101' }, lecturer: { name: 'Lê Văn C', code: 'GV003' }, dayOfWeek: 4, lessonFrom: 1, lessonTo: 5, isActive: true },
    { _id: '4', course: { name: 'Tiếng Anh A1', code: 'ENG101' }, lecturer: { name: 'Phạm Thị D', code: 'GV004' }, room: { name: 'C303', code: 'C303' }, dayOfWeek: 5, lessonFrom: 7, lessonTo: 9, isActive: true },
    { _id: '5', course: { name: 'Giải tích', code: 'MATH102' }, lecturer: { name: 'Nguyễn Văn A', code: 'GV001' }, room: { name: 'A102', code: 'A102' }, dayOfWeek: 6, lessonFrom: 1, lessonTo: 2, isActive: true },
  ];

  const isLoading = false;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockData.filter((s) => {
      const matchSearch =
        !q ||
        s.course.name.toLowerCase().includes(q) ||
        s.course.code.toLowerCase().includes(q) ||
        s.lecturer.name.toLowerCase().includes(q);
      const matchDay = !dayOfWeek || s.dayOfWeek === Number(dayOfWeek);
      return matchSearch && matchDay;
    });
  }, [mockData, search, dayOfWeek]);

  const paged = useMemo(
    () => filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize),
    [filtered, pagination]
  );

  const handleView = (item: Schedule) => setModalState({ isOpen: true, mode: 'view', data: item });
  const handleEdit = (item: Schedule) => setModalState({ isOpen: true, mode: 'edit', data: item });
  const handleCreate = () => setModalState({ isOpen: true, mode: 'create' });
  const handleClose = () => setModalState({ isOpen: false, mode: 'create' });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Lịch học"
        description={`${filtered.length} lịch học`}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Danh mục' }, { label: 'Lịch học' }]}
        actions={
          canEdit && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
              Thêm lịch học
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
              placeholder="Môn học, giảng viên..."
              className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Ngày trong tuần
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => {
                setDayOfWeek(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))]/40"
            >
              <option value="">Tất cả</option>
              {DAY_LABELS.map((d, i) => (
                <option key={i} value={i + 1}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải lịch học..." />
          </div>
        ) : paged.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title="Chưa có lịch học nào"
              description="Bắt đầu bằng cách thêm lịch học đầu tiên."
              action={
                canEdit && (
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
                    Thêm lịch học
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
                <TableHeadCell>Thứ</TableHeadCell>
                <TableHeadCell>Tiết</TableHeadCell>
                <TableHeadCell>Môn học</TableHeadCell>
                <TableHeadCell>Giảng viên</TableHeadCell>
                <TableHeadCell>Phòng</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-right">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((s, i) => (
                <TableRow key={s._id} className="hover:bg-[rgb(var(--bg-hover))]">
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">
                      {DAY_LABELS[s.dayOfWeek - 1]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {s.lessonFrom} - {s.lessonTo}
                  </TableCell>
                  <TableCell className="font-medium">
                    {s.course.name}
                    <span className="ml-2 text-xs text-[rgb(var(--text-muted))]">{s.course.code}</span>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.lecturer.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.room?.name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? 'success' : 'neutral'} dot size="sm">
                      {s.isActive ? 'Hoạt động' : 'Khóa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleView(s)}>
                        <Eye className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                      </Button>
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}>
                          <Pencil className="h-4 w-4 text-[rgb(var(--primary))]" />
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
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      <ScheduleModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        mode={modalState.mode}
        data={modalState.data}
      />
    </div>
  );
}
