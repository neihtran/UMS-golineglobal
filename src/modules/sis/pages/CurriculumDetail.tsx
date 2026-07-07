import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, BookOpen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useCurriculumDetail } from '@/hooks/useSis';
import type { Curriculum } from '@/services/sis.service';

export default function CurriculumDetail() {
  const { t } = useTranslation('sis');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: curriculumData, isLoading } = useCurriculumDetail(id || '');
  const c = curriculumData as Curriculum | undefined;

  if (isLoading || !c) {
    return (
      <div className="space-y-6">
        <PageHeader title={isLoading ? 'Đang tải...' : 'Không tìm thấy'} breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'CTĐT' }]} />
        <div className="flex items-center justify-center h-64">
          <p className="text-[rgb(var(--text-muted))]">{isLoading ? 'Đang tải chương trình đào tạo...' : 'Không tìm thấy CTĐT này.'}</p>
        </div>
      </div>
    );
  }

  const semesters = (c as any).semesters || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={c.name || '—'}
        description={`${c.code || ''} · ${c.totalCredits || 0} tín chỉ`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.breadcrumb.list', { defaultValue: 'CTĐT' }), href: '/sis/chuong-trinh-dao-tao' },
          { label: c.code || '' },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/chuong-trinh-dao-tao')}>Quay lại</Button>
            <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />}>Chỉnh sửa</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <Badge variant={c.status === 'active' ? 'success' : 'neutral'} size="sm">{c.status === 'active' ? 'Hiệu lực' : 'Hết hiệu lực'}</Badge>
                <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mt-1">{c.name}</h2>
                <p className="text-xs text-[rgb(var(--text-muted))] font-mono mt-0.5">{c.code || ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgb(var(--border)/0.6)]">
              {[
                { label: 'Tổng tín chỉ', value: String(c.totalCredits || 0) },
                { label: 'Năm ban hành', value: String((c as any).startYear || (c as any).year || '') },
                { label: 'Bậc đào tạo', value: (c as any).degree || '' },
                { label: 'Thời gian', value: (c as any).duration || '' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-[rgb(var(--bg-base))] p-3 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{item.label}</p>
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            {c.description && (
              <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed border-t border-[rgb(var(--border)/0.6)] pt-3">
                {c.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Semesters */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Cấu trúc chương trình theo học kỳ</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {semesters.length > 0 ? semesters.map((sem: any) => (
                <div key={sem.semester || sem._id} className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--bg-base))] border-b border-[rgb(var(--border))]">
                    <Users className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                    <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{sem.name || `Học kỳ ${sem.semester}`}</span>
                    <Badge variant="neutral" size="sm">{sem.subjects?.length || 0} môn</Badge>
                    <span className="ml-auto text-xs text-[rgb(var(--text-muted))]">
                      {sem.subjects?.reduce((acc: number, s: any) => acc + (s.credits || 0), 0) || 0} tín chỉ
                    </span>
                  </div>
                  <div className="divide-y divide-[rgb(var(--border)/0.4)]">
                    {(sem.subjects || []).map((sub: any) => (
                      <div key={sub._id || sub.code} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-xs font-mono text-[rgb(var(--text-muted))] w-20 shrink-0">{sub.code}</span>
                        <span className="text-sm text-[rgb(var(--text-primary))] flex-1 min-w-0 truncate">{sub.name}</span>
                        <Badge variant="neutral" size="sm">{sub.credits} TC</Badge>
                        <span className="text-xs text-[rgb(var(--text-muted))] w-16 text-right shrink-0">{sub.hours || 0} tiết</span>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Chưa có cấu trúc học kỳ. Backend cần trả về dữ liệu semesters.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
