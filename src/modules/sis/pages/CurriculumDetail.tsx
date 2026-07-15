import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Download,
  BookOpen,
  Users,
  GraduationCap,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent, ConfirmModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { LoadingState } from '@/components/data-display/LoadingState';
import { EmptyState } from '@/components/data-display/EmptyState';
import {
  useCurriculumDetail,
  useDeleteCurriculum,
  type Curriculum,
} from '@/hooks/useSis';
import { useRole } from '@/hooks/usePermission';
import { ROLES } from '@/constants/modules';

interface CurriculumDetailProps {
  id: string;
}

const STATUS_CONFIG: Record<
  Curriculum['status'],
  { variant: 'success' | 'warning' | 'neutral'; label: string }
> = {
  active: { variant: 'success', label: 'Đang áp dụng' },
  draft: { variant: 'warning', label: 'Bản nháp' },
  archived: { variant: 'neutral', label: 'Lưu trữ' },
};

export default function CurriculumDetail({ id }: CurriculumDetailProps) {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();

  const canEdit = useRole([ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG]);
  const canDelete = useRole([ROLES.ADMIN]);

  const { data: program, isLoading, isError } = useCurriculumDetail(id);
  const deleteMutation = useDeleteCurriculum();
  const [pendingDelete, setPendingDelete] = useState(false);

  // Nhóm môn học theo học kỳ (từ `program.subjects[].semester`)
  const semesters = useMemo(() => {
    if (!program) return [];
    const groups = new Map<number, Array<any>>();
    (program.subjects ?? []).forEach((s: any) => {
      const subjObj = typeof s.subject === 'object' ? s.subject : null;
      const sem = s.semester ?? 0;
      const credits = subjObj?.credits ?? 0;
      const arr = groups.get(sem) ?? [];
      arr.push({
        code: subjObj?.code ?? '—',
        name: subjObj?.name ?? '—',
        credits,
        type: credits >= 5 ? 'project' : 'theory',
        required: s.isRequired,
      });
      groups.set(sem, arr);
    });
    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([sem, subjects]) => ({ semester: sem, subjects }));
  }, [program]);

  if (isLoading) {
    return <LoadingState message="Đang tải chương trình đào tạo..." />;
  }

  if (isError || !program) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Không tìm thấy chương trình đào tạo"
          description="Chương trình này có thể đã bị xóa hoặc bạn không có quyền truy cập."
          action={
            <Button variant="outline" onClick={() => navigate('/sis/chuong-trinh-dao-tao')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  const departmentName =
    typeof program.department === 'object' ? (program.department as any).name : program.department;

  const handleConfirmDelete = () => {
    deleteMutation.mutate(program._id, {
      onSettled: () => setPendingDelete(false),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={program.name}
        description={`${program.code} · ${program.degreeType} · ${departmentName || '—'}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.titleList'), href: '/sis/chuong-trinh-dao-tao' },
          { label: program.code },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/sis/chuong-trinh-dao-tao')}
            >
              {t('curriculum.detail.back')}
            </Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              {t('curriculum.export')}
            </Button>
            {canEdit && (
              <Button
                leftIcon={<Edit2 className="h-4 w-4" />}
                onClick={() => navigate(`/sis/chuong-trinh-dao-tao/${program._id}/sua`)}
              >
                {t('curriculum.detail.edit')}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                leftIcon={<Trash2 className="h-4 w-4 text-[rgb(var(--error))]" />}
                onClick={() => setPendingDelete(true)}
              >
                <span className="text-[rgb(var(--error))]">Xóa</span>
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          icon={<BookOpen className="h-4 w-4" />}
          label={t('curriculum.detail.tongTinChi')}
          value={program.totalCredits}
        />
        <Stat
          icon={<BookOpen className="h-4 w-4" />}
          label={t('curriculum.detail.soMon')}
          value={(program.subjects ?? []).length}
        />
        <Stat
          icon={<GraduationCap className="h-4 w-4" />}
          label={t('curriculum.detail.thoiGian')}
          value={`${program.durationYears} năm`}
        />
        <Stat
          icon={<Users className="h-4 w-4" />}
          label={t('curriculum.detail.nam')}
          value={program.effectiveYear}
        />
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">
            {t('curriculum.detail.intro')}
          </h3>
        </div>
        <CardContent>
          {program.description ? (
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
              {program.description}
            </p>
          ) : (
            <p className="text-sm italic text-[rgb(var(--text-muted))]">
              Chưa có mô tả cho chương trình này.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="primary">{t('curriculum.detail.nganh')}: {departmentName || '—'}</Badge>
            <Badge variant="info">{t('curriculum.detail.bac')}: {program.degreeType}</Badge>
            <Badge variant="success">{t('curriculum.detail.nam')}: {program.effectiveYear}</Badge>
            <Badge variant={STATUS_CONFIG[program.status]?.variant ?? 'neutral'} dot>
              {STATUS_CONFIG[program.status]?.label ?? program.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {semesters.length === 0 ? (
        <Card>
          <div className="px-5 py-8">
            <EmptyState
              title="Chưa có môn học nào"
              description="Chương trình này chưa được gán môn học nào."
              action={
                canEdit && (
                  <Button
                    leftIcon={<Edit2 className="h-4 w-4" />}
                    onClick={() => navigate(`/sis/chuong-trinh-dao-tao/${program._id}/sua`)}
                  >
                    Chỉnh sửa để thêm môn
                  </Button>
                )
              }
            />
          </div>
        </Card>
      ) : (
        semesters.map((sem) => {
          const totalCredits = sem.subjects.reduce((acc, s) => acc + s.credits, 0);
          return (
            <Card key={sem.semester}>
              <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary))] text-sm font-bold text-white">
                    HK{sem.semester}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                      Học kỳ {sem.semester}
                    </h3>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      {sem.subjects.length} môn · {totalCredits} tín chỉ
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[rgb(var(--bg-base))]">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">
                        {t('curriculum.tableDetail.maMonHoc')}
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">
                        {t('curriculum.tableDetail.tenMonHoc')}
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">
                        {t('curriculum.tableDetail.tongTc')}
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">
                        Bắt buộc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                    {sem.subjects.map((s) => (
                      <tr key={s.code} className="hover:bg-[rgb(var(--bg-hover))]">
                        <td className="px-4 py-2.5 font-mono text-xs text-[rgb(var(--text-secondary))]">
                          {s.code}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">
                          {s.name}
                        </td>
                        <td className="px-4 py-2.5 text-center text-[rgb(var(--text-secondary))]">
                          {s.credits}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Badge variant={s.required ? 'success' : 'neutral'} size="sm">
                            {s.required ? 'Bắt buộc' : 'Tự chọn'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })
      )}

      <ConfirmModal
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa chương trình đào tạo"
        description={`Bạn có chắc chắn muốn xóa chương trình "${program.name}" (${program.code})? Hành động này không thể hoàn tác.`}
        confirmText={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
        variant="danger"
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
          {icon}
        </div>
        <div>
          <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
          <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
