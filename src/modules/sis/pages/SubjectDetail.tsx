import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, BookOpen, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useDeleteSubject, type Subject } from '@/hooks/useSis';

type SubjectDetailProps = {
  id?: string;
  data?: Subject;
  isLoading?: boolean;
  isError?: boolean;
};

export default function SubjectDetail({ id, data: subject, isLoading, isError }: SubjectDetailProps) {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const deleteMutation = useDeleteSubject();

  const handleDelete = () => {
    if (!id || !subject) return;
    deleteMutation.mutate(id, {
      onSettled: () => navigate('/sis/chuong-trinh-dao-tao/mon-hoc'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Chi tiết môn học"
          breadcrumbs={[
            { label: 'SIS', href: '/sis' },
            { label: t('subject.titleList'), href: '/sis/chuong-trinh-dao-tao/mon-hoc' },
            { label: '...' },
          ]}
        />
        <div className="px-5 py-10">
          <LoadingState message="Đang tải thông tin môn học..." />
        </div>
      </div>
    );
  }

  if (isError || !subject) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Chi tiết môn học"
          breadcrumbs={[
            { label: 'SIS', href: '/sis' },
            { label: t('subject.titleList'), href: '/sis/chuong-trinh-dao-tao/mon-hoc' },
          ]}
        />
        <div className="px-5 py-10">
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="Không tìm thấy môn học"
            description="Môn học này có thể đã bị xóa hoặc không tồn tại."
            action={
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/chuong-trinh-dao-tao/mon-hoc')}>
                Quay lại danh sách
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const deptName =
    typeof subject.department === 'object' && subject.department
      ? (subject.department as any).name
      : '';

  return (
    <div className="space-y-6">
      <PageHeader
        title={subject.name}
        description={`${subject.code} · ${deptName}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('subject.titleList'), href: '/sis/chuong-trinh-dao-tao/mon-hoc' },
          { label: subject.code },
        ]}
        actions={
          <>
            <Link to="/sis/chuong-trinh-dao-tao/mon-hoc">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                {t('subject.detail.back')}
              </Button>
            </Link>
            <Link to={`/sis/chuong-trinh-dao-tao/mon-hoc/${subject._id}/sua`}>
              <Button leftIcon={<Edit2 className="h-4 w-4" />}>
                {t('subject.detail.edit')}
              </Button>
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('subject.detail.maMon'), value: subject.code },
          { label: t('subject.detail.soTinChi'), value: subject.credits },
          { label: t('subject.detail.soTietLT'), value: subject.theoryHours ?? 0 },
          { label: t('subject.detail.soTietTH'), value: subject.practiceHours ?? 0 },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
              <p className="mt-1 text-lg font-bold text-[rgb(var(--text-primary))]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thông tin */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('subject.detail.info')}</h3>
        </div>
        <CardContent className="grid grid-cols-2 gap-4 pt-5">
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.trangThai')}</p>
            <Badge variant={subject.isActive ? 'success' : 'neutral'} dot>
              {subject.isActive ? 'Hoạt động' : 'Ngừng sử dụng'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.khoaPhuTrach')}</p>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{deptName || '—'}</p>
          </div>
          {subject.description && (
            <div className="col-span-2">
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.moTa')}</p>
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{subject.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 border-t border-[rgb(var(--border)/0.3)] pt-4">
        <Button
          variant="outline"
          leftIcon={<Trash2 className="h-4 w-4" />}
          className="text-[rgb(var(--error))] hover:bg-[rgb(var(--error))]/5"
          onClick={() => {
            if (window.confirm(`Xóa môn học "${subject.name}" (${subject.code})? Hành động này không thể hoàn tác.`)) {
              handleDelete();
            }
          }}
        >
          Xóa môn học
        </Button>
      </div>
    </div>
  );
}
