import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, BookOpen } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useHqnhatSubject, useDeleteHqnhatSubject, useHqnhatSubjectTypes } from '@/hooks/useHqnhat';

const STATUS_CONFIG: Record<number, { label: string; variant: 'success' | 'neutral' }> = {
  1: { label: 'Hoạt động', variant: 'success' },
  0: { label: 'Ngừng sử dụng', variant: 'neutral' },
};

type Props = {
  id?: string;
};

export default function SubjectDetail({ id }: Props) {
  const numericId = id ? Number(id) : undefined;
  const { data, isLoading, isError } = useHqnhatSubject(numericId);
  const { data: subjectTypesData } = useHqnhatSubjectTypes({ per_page: 100 });
  const deleteMut = useDeleteHqnhatSubject();
  const navigate = useNavigate();

  const item = data?.data;
  const subjectTypes = subjectTypesData?.data ?? [];
  const subjectTypeMap = new Map(subjectTypes.map((t) => [t.id, t.name]));

  const handleDelete = async () => {
    if (!numericId) return;
    try {
      await deleteMut.mutateAsync(numericId);
      navigate('/sis/mon-hoc');
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

  if (isError || !item) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Chi tiết môn học"
          breadcrumbs={[
            { label: 'SIS', href: '/sis' },
            { label: 'Danh mục', href: '/sis' },
            { label: 'Môn học', href: '/sis/mon-hoc' },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <BookOpen className="h-12 w-12 text-[rgb(var(--text-muted))]" />
          <p className="text-[rgb(var(--text-muted))]">Không tìm thấy môn học</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.name}
        description={`Mã: ${item.code}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Danh mục', href: '/sis' },
          { label: 'Môn học', href: '/sis/mon-hoc' },
          { label: item.code },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/mon-hoc')}>
              Quay lại
            </Button>
            <Button
              variant="outline"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => navigate(`/sis/mon-hoc/${id}/sua`)}
            >
              Sửa
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                if (window.confirm(`Xóa môn học "${item.name}" (${item.code})? Hành động này không thể hoàn tác.`)) {
                  handleDelete();
                }
              }}
            >
              Xóa
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Mã môn</p>
          <p className="text-xl font-bold font-mono">{item.code}</p>
        </div>
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Tín chỉ</p>
          <p className="text-3xl font-bold">{item.credit}</p>
        </div>
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Giờ LT</p>
          <p className="text-3xl font-bold">{item.theory_hours}</p>
        </div>
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Giờ TH</p>
          <p className="text-3xl font-bold">{item.practice_hours}</p>
        </div>
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1">Giờ Lab</p>
          <p className="text-3xl font-bold">{item.lab_hours}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Nhóm môn học</p>
            <p className="font-medium">{subjectTypeMap.get(item.subject_type_id) ?? `ID: ${item.subject_type_id}`}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Trạng thái</p>
            <Badge variant={statusConfig.variant} dot>{statusConfig.label}</Badge>
          </div>
        </div>
        {item.description && (
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Mô tả</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{item.description}</p>
          </div>
        )}
        {(item.created_at || item.updated_at) && (
          <div className="border-t border-[rgb(var(--border))] pt-4 mt-4 flex gap-6 text-xs text-[rgb(var(--text-muted))]">
            {item.created_at && <p>Ngày tạo: {new Date(item.created_at).toLocaleString('vi-VN')}</p>}
            {item.updated_at && <p>Cập nhật: {new Date(item.updated_at).toLocaleString('vi-VN')}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
