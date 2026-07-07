import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useSubjectDetail } from '@/hooks/useSis';

const TYPE_CONFIG: Record<string, { variant: 'info' | 'accent' | 'warning' | 'primary'; label: string }> = {
  theory: { variant: 'info', label: 'Lý thuyết' },
  practice: { variant: 'accent', label: 'Thực hành' },
  project: { variant: 'warning', label: 'Đồ án' },
  internship: { variant: 'primary', label: 'Thực tập' },
};

export default function SubjectDetail() {
  const { t } = useTranslation('sis');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: subjectData, isLoading } = useSubjectDetail(id || '');
  const s = subjectData as any;

  if (isLoading || !s) {
    return (
      <div className="space-y-6">
        <PageHeader title={isLoading ? 'Đang tải...' : 'Không tìm thấy'} breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: 'Môn học' }]} />
        <div className="flex items-center justify-center h-64">
          <p className="text-[rgb(var(--text-muted))]">{isLoading ? 'Đang tải thông tin môn học...' : 'Không tìm thấy môn học này.'}</p>
        </div>
      </div>
    );
  }

  const tc = TYPE_CONFIG[s.type as string] ?? { variant: 'info', label: s.type || '' };
  const displayCode = s.code || '';

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.name || '—'}
        description={`${displayCode} · ${tc.label} · ${s.credits} tín chỉ · HK${s.semester}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('subject.breadcrumb.list', { defaultValue: 'Môn học' }), href: '/sis/mon-hoc' },
          { label: displayCode },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/sis/mon-hoc')}>Quay lại</Button>
            <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/sis/mon-hoc/${s._id}/sua`)}>Chỉnh sửa</Button>
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
                <Badge variant={tc.variant} size="sm">{tc.label}</Badge>
                <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mt-1">{s.name}</h2>
                <p className="text-xs text-[rgb(var(--text-muted))] font-mono mt-0.5">{displayCode}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgb(var(--border)/0.6)]">
              {[
                { label: 'Tín chỉ', value: String(s.credits || 0) },
                { label: 'Số giờ', value: `${s.hours || 0} tiết` },
                { label: 'Học kỳ', value: `HK${s.semester || ''}` },
                { label: 'Khoa', value: s.department?.name || '' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-[rgb(var(--bg-base))] p-3 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{item.label}</p>
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin môn học</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {[
                { label: 'Mã môn', value: displayCode },
                { label: 'Tên môn', value: s.name || '' },
                { label: 'Loại', value: tc.label },
                { label: 'Khoa', value: s.department?.name || '' },
                { label: 'Học kỳ', value: `HK${s.semester || ''}` },
                { label: 'Tín chỉ', value: String(s.credits || 0) },
                { label: 'Số giờ', value: `${s.hours || 0} tiết` },
                { label: 'Hình thức thi', value: (s as any).examType || (s as any).exam || '' },
                { label: 'Mô tả', value: s.description || '' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 py-2 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                  <p className="w-36 shrink-0 text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-[rgb(var(--text-primary))]">{value || '—'}</p>
                </div>
              ))}
              {(s.prerequisites?.length || 0) > 0 && (
                <div className="flex gap-4 py-2">
                  <p className="w-36 shrink-0 text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide">Môn tiên quyết</p>
                  <div className="flex flex-wrap gap-2">
                    {s.prerequisites?.map((p: string) => (
                      <Badge key={p} variant="neutral" size="sm">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
