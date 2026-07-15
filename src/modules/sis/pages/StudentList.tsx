import { useState } from 'react';
import { Download, Upload, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  Card,
  ConfirmModal,
  ActionButtons,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { usePagination } from '@/hooks';
import { useStudentList, useDeleteStudent, type Student } from '@/hooks/useSis';
import { useDepartmentList } from '@/hooks/useHrm';
import StudentCreateModal from './StudentCreateModal';
import StudentDetailModal from './StudentDetailModal';
import StudentEditModal from './StudentEditModal';

const GPA_COLOR = (gpa: number) =>
  gpa >= 3.6 ? 'success' : gpa >= 3.0 ? 'info' : gpa >= 2.0 ? 'warning' : 'error';

export default function StudentList() {
  const { t } = useTranslation('sis');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const deleteStudent = useDeleteStudent();

  const { data, isLoading, isError, refetch } = useStudentList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    department: dept || undefined,
    status: status || undefined,
  });

  const { data: deptResp } = useDepartmentList({ isActive: true });
  const departments = (deptResp as any)?.data ?? [];

  const items: Student[] = ((data as any)?.data ?? []) as Student[];
  const total = (data as any)?.total ?? items.length;

  const paged = items;

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!selectedStudent?._id) return;
    deleteStudent.mutate(selectedStudent._id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setSelectedStudent(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('student.title')}
        description={`${total} sinh viên trong hệ thống`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('student.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>{t('student.import')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('student.export')}</Button>
            <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              {t('student.add')}
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Tìm kiếm
            </label>
            <Input
              placeholder={t('student.filter.searchPlaceholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Khoa
            </label>
            <select
              value={dept}
              onChange={(e) => { setDept(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            >
              <option value="">Tất cả khoa</option>
              {departments.map((d: any) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
            >
              <option value="">Tất cả</option>
              <option value="studying">{t('student.status.studying')}</option>
              <option value="reserved">{t('student.status.reserved')}</option>
              <option value="suspended">{t('student.status.suspended')}</option>
              <option value="graduated">{t('student.status.graduated')}</option>
              <option value="expelled">Đình chỉ</option>
            </select>
          </div>
          <span className="text-sm text-[rgb(var(--text-muted))] ml-auto">
            {total} kết quả
          </span>
        </div>

        {isLoading ? (
          <div className="px-5 py-8">
            <LoadingState message="Đang tải danh sách sinh viên..." />
          </div>
        ) : isError ? (
          <div className="px-5 py-10">
            <EmptyState
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
              title={search || dept || status ? 'Không tìm thấy sinh viên' : 'Chưa có sinh viên nào'}
              description={
                search || dept || status
                  ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                  : 'Bắt đầu bằng cách thêm sinh viên đầu tiên.'
              }
              action={
                !search && !dept && !status && (
                  <Button
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Thêm sinh viên
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
                <TableHeadCell>Họ tên</TableHeadCell>
                <TableHeadCell>Mã SV</TableHeadCell>
                <TableHeadCell>Lớp</TableHeadCell>
                <TableHeadCell>Khoa</TableHeadCell>
                <TableHeadCell>GPA</TableHeadCell>
                <TableHeadCell>Tín chỉ</TableHeadCell>
                <TableHeadCell>Trạng thái</TableHeadCell>
                <TableHeadCell className="text-center">Thao tác</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((s, i) => {
                const deptName = typeof s.department === 'object' && s.department 
                  ? (s.department as any).name 
                  : '';
                
                const statusLabels: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
                  studying: { variant: 'success', label: 'Đang học' },
                  reserved: { variant: 'warning', label: 'Bảo lưu' },
                  suspended: { variant: 'warning', label: 'Tạm ngưng' },
                  graduated: { variant: 'info', label: 'Đã tốt nghiệp' },
                  expelled: { variant: 'error', label: 'Đình chỉ' },
                };
                const sc = statusLabels[s.status] ?? statusLabels['studying'];

                return (
                  <TableRow key={s._id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                      {(pagination.page - 1) * pagination.pageSize + i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                          {s.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-[rgb(var(--text-primary))]">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</TableCell>
                    <TableCell className="text-[rgb(var(--text-secondary))]">{s.className ?? '—'}</TableCell>
                    <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{deptName || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={GPA_COLOR(s.gpa ?? 0) as 'success' | 'warning' | 'error' | 'info'} className="font-mono">
                        {s.gpa != null && s.gpa > 0 ? s.gpa.toFixed(2) : '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{s.totalCredits ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <ActionButtons
                        onView={() => handleViewDetail(s)}
                        onEdit={() => handleEdit(s)}
                        onDelete={() => handleDelete(s)}
                      />
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
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}

      {/* Create Student Modal */}
      <StudentCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Detail Student Modal */}
      <StudentDetailModal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedStudent(null); }}
        student={selectedStudent}
      />

      {/* Edit Student Modal */}
      <StudentEditModal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedStudent(null); }}
        student={selectedStudent}
      />

      {/* Delete Student Confirm */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedStudent(null); }}
        onConfirm={confirmDelete}
        title={`Xóa sinh viên "${selectedStudent?.name ?? ''}"?`}
        description="Hành động này không thể hoàn tác. Sinh viên sẽ bị xóa vĩnh viễn khỏi hệ thống."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        loading={deleteStudent.isPending}
      />
    </div>
  );
}
