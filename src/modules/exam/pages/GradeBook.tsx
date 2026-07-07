import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useExamList } from '@/hooks/useExam';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  draft: { variant: 'neutral', label: 'Nháp' },
  published: { variant: 'success', label: 'Đã xuất bản' },
  ongoing: { variant: 'warning', label: 'Đang thi' },
  finished: { variant: 'success', label: 'Đã kết thúc' },
  graded: { variant: 'success', label: 'Đã chấm điểm' },
};

export default function GradeBook() {
  const { t } = useTranslation('exam');
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const { data: examData, isLoading: examLoading } = useExamList({
    search: undefined,
    status: 'published',
    page: 1,
    pageSize: 50,
  });

  const exams = examData?.data ?? [];
  const selectedExam = selectedExamId ? exams.find((e) => e._id === selectedExamId) : exams[0];

  if (examLoading && exams.length === 0) {
    return <div className="flex items-center justify-center h-64"><p className="text-[rgb(var(--text-muted))]">Đang tải...</p></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('gradebook.title')}
        description={t('gradebook.description')}
        breadcrumbs={[
          { label: t('breadcrumb.dashboard'), href: '/exam' },
          { label: t('breadcrumb.gradebook') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('gradebook.exportExcel')}</Button>
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>{t('gradebook.printGrade')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-3">
          {exams.map((exam: any) => {
            const sc = STATUS_CONFIG[exam.status] || { variant: 'neutral' as const, label: exam.status };
            return (
              <Card
                key={exam._id}
                className={`cursor-pointer transition-all ${selectedExam?._id === exam._id || (!selectedExamId && exams[0]?._id === exam._id) ? 'border-[rgb(var(--primary))] ring-1 ring-[rgb(var(--primary)/0.2]' : 'hover:border-[rgb(var(--border))]'}`}
                onClick={() => setSelectedExamId(exam._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{exam.code}</p>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{exam.title}</p>
                    </div>
                    <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-[rgb(var(--text-muted))]">
                      <div>{exam.courseName || exam.examType}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{selectedExam?.title || '—'}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  {selectedExam?.code} · {selectedExam?.examType || '—'}
                </p>
              </div>
            </div>
            <div className="p-5 text-center">
              <p className="text-sm text-[rgb(var(--text-muted))]">Chọn một kỳ thi từ danh sách bên trái để xem điểm</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
