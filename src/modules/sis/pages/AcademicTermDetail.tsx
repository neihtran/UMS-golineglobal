import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  Button,
  Badge,
  ConfirmModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useHqnhatAcademicTerm, useDeleteHqnhatAcademicTerm } from '@/hooks/useHqnhat';
import { useState } from 'react';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  0: { label: 'Lập kế hoạch', variant: 'neutral' },
  1: { label: 'Mở đăng ký', variant: 'info' },
  2: { label: 'Đang học', variant: 'success' },
  3: { label: 'Đã kết thúc', variant: 'warning' },
};

const SEMESTER_LABELS: Record<number, string> = {
  1: 'Học kỳ 1',
  2: 'Học kỳ 2',
  3: 'Học kỳ hè',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AcademicTermDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, error } = useHqnhatAcademicTerm(id);
  const deleteMut = useDeleteHqnhatAcademicTerm();

  const term = data?.data;

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMut.mutateAsync(Number(id));
      window.location.href = '/sis/hoc-ky';
    } catch {
      // error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Không tìm thấy học kỳ hoặc lỗi khi tải dữ liệu.</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[term.status] ?? STATUS_CONFIG[0];
  const semesterLabel = SEMESTER_LABELS[term.semester] || `Học kỳ ${term.semester}`;

  const dateRows = [
    {
      label: 'Ngày bắt đầu học kỳ',
      value: formatDate(term.start_date),
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: 'Ngày kết thúc học kỳ',
      value: formatDate(term.end_date),
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: 'Ngày bắt đầu đăng ký',
      value: formatDate(term.registration_start),
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: 'Ngày kết thúc đăng ký',
      value: formatDate(term.registration_end),
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={term.code}
        description={`${semesterLabel} - Năm học ${term.academic_year}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục', href: '/sis' },
          { label: 'Học kỳ', href: '/sis/hoc-ky' },
          { label: term.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} asChild>
              <Link to="/sis/hoc-ky">Quay lại</Link>
            </Button>
            <Button
              variant="outline"
              leftIcon={<Edit className="h-4 w-4" />}
              asChild
            >
              <Link to={`/sis/hoc-ky/${id}/sua`}>Sửa</Link>
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Xóa
            </Button>
          </>
        }
      />

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Mã HK</span>
          </div>
          <p className="text-xl font-bold">{term.code}</p>
          <p className="text-xs text-[rgb(var(--text-muted))]">Mã học kỳ</p>
        </div>

        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Năm học</span>
          </div>
          <p className="text-xl font-bold">{term.academic_year}</p>
          <p className="text-xs text-[rgb(var(--text-muted))]">Năm học</p>
        </div>

        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Học kỳ</span>
          </div>
          <p className="text-xl font-bold">{semesterLabel}</p>
          <p className="text-xs text-[rgb(var(--text-muted))]">Học kỳ trong năm</p>
        </div>

        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</span>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </div>

      {/* Date Timeline */}
      <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl">
        <div className="px-6 py-4 border-b border-[rgb(var(--border))]">
          <h3 className="font-semibold">Lịch trình học kỳ</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dateRows.map((row) => (
              <div key={row.label} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center text-[rgb(var(--primary))]">
                  {row.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{row.label}</p>
                </div>
                <div className="text-sm text-[rgb(var(--text-muted))] font-medium">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metadata */}
      {(term.created_at || term.updated_at) && (
        <div className="text-xs text-[rgb(var(--text-muted))] space-y-1">
          {term.created_at && <p>Ngày tạo: {new Date(term.created_at).toLocaleString('vi-VN')}</p>}
          {term.updated_at && <p>Cập nhật: {new Date(term.updated_at).toLocaleString('vi-VN')}</p>}
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa học kỳ"
        message={`Bạn có chắc muốn xóa học kỳ "${term.code}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
