import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Users,
} from 'lucide-react';
import {
  Button,
  Badge,
  ConfirmModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useHqnhatCurriculum, useDeleteHqnhatCurriculum, useHqnhatMajors, useHqnhatTrainingSystems } from '@/hooks/useHqnhat';
import { useState } from 'react';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'error' }> = {
  0: { label: 'Ngừng hoạt động', variant: 'error' },
  1: { label: 'Đang hoạt động', variant: 'success' },
};

export default function CurriculumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, error } = useHqnhatCurriculum(id);
  const { data: majorsData } = useHqnhatMajors({ per_page: 100 });
  const { data: trainingSystemsData } = useHqnhatTrainingSystems({ per_page: 100 });
  const deleteMut = useDeleteHqnhatCurriculum();

  const item = data?.data;
  const majors = majorsData?.data ?? [];
  const trainingSystems = trainingSystemsData?.data ?? [];

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMut.mutateAsync(Number(id));
      window.location.href = '/sis/ctdt';
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

  if (error || !item) {
    return (
      <div className="flex items-center justify-center h-64 text-[rgb(var(--text-muted))]">
        <p>Không tìm thấy CTĐT hoặc lỗi khi tải dữ liệu.</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];
  const major = majors.find(m => m.id === item.major_id);
  const trainingSystem = trainingSystems.find(t => t.id === item.training_system_id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.name}
        description={`Mã: ${item.code}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục', href: '/sis' },
          { label: 'CTĐT', href: '/sis/ctdt' },
          { label: item.name },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} asChild>
              <Link to="/sis/ctdt">Quay lại</Link>
            </Button>
            <Button
              variant="outline"
              leftIcon={<Edit className="h-4 w-4" />}
              asChild
            >
              <Link to={`/sis/ctdt/${id}/sua`}>Sửa</Link>
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
            <BookOpen className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Mã CTĐT</span>
          </div>
          <p className="text-xl font-bold font-mono">{item.code}</p>
        </div>

        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Ngành</span>
          </div>
          <p className="text-lg font-bold">{major?.name ?? `ID: ${item.major_id}`}</p>
          {major && <p className="text-xs text-[rgb(var(--text-muted))]">{major.code}</p>}
        </div>

        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Hệ đào tạo</span>
          </div>
          <p className="text-lg font-bold">{trainingSystem?.name ?? `ID: ${item.training_system_id}`}</p>
        </div>

        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Trạng thái</span>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </div>

      {/* Credits */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Tổng tín chỉ</p>
          <p className="text-3xl font-bold">{item.total_credit}</p>
        </div>
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Tín chỉ tự chọn</p>
          <p className="text-3xl font-bold">{item.elective_credit}</p>
        </div>
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Khóa sinh viên</p>
          <p className="text-3xl font-bold">{item.course_id}</p>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6">
          <h3 className="font-semibold mb-2">Mô tả</h3>
          <p className="text-sm text-[rgb(var(--text-secondary))]">{item.description}</p>
        </div>
      )}

      {/* Metadata */}
      {(item.created_at || item.updated_at) && (
        <div className="text-xs text-[rgb(var(--text-muted))] space-y-1">
          {item.created_at && <p>Ngày tạo: {new Date(item.created_at).toLocaleString('vi-VN')}</p>}
          {item.updated_at && <p>Cập nhật: {new Date(item.updated_at).toLocaleString('vi-VN')}</p>}
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa CTĐT"
        message={`Bạn có chắc muốn xóa CTĐT "${item.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
