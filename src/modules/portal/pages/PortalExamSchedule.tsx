import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Download, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const EXAMS = [
  { id: 'e1', courseCode: 'CS101', courseName: 'Nhập môn Lập trình Python', examDate: '2026-07-15', examTime: '08:00 - 10:00', duration: '120 phút', room: 'A101', floor: 'Tầng 1', studentCount: 52, format: 'Thi viết', semester: 'HK2 2025-2026', status: 'upcoming' },
  { id: 'e2', courseCode: 'MATH201', courseName: 'Giải tích 2', examDate: '2026-07-16', examTime: '14:00 - 16:00', duration: '120 phút', room: 'B201', floor: 'Tầng 2', studentCount: 58, format: 'Thi viết', semester: 'HK2 2025-2026', status: 'upcoming' },
  { id: 'e3', courseCode: 'ENG301', courseName: 'Tiếng Anh Học thuật', examDate: '2026-07-17', examTime: '08:00 - 10:00', duration: '90 phút', room: 'C105', floor: 'Tầng 1', studentCount: 48, format: 'Thi trắc nghiệm', semester: 'HK2 2025-2026', status: 'upcoming' },
  { id: 'e4', courseCode: 'PHYS101', courseName: 'Vật lý Đại cương', examDate: '2026-07-18', examTime: '14:00 - 16:30', duration: '150 phút', room: 'D301', floor: 'Tầng 3', studentCount: 38, format: 'Thi viết + Bài tập', semester: 'HK2 2025-2026', status: 'upcoming' },
  { id: 'e5', courseCode: 'CHEM101', courseName: 'Hóa học Đại cương', examDate: '2026-07-19', examTime: '08:00 - 10:30', duration: '150 phút', room: 'E102', floor: 'Tầng 1', studentCount: 40, format: 'Thi viết', semester: 'HK2 2025-2026', status: 'upcoming' },
  { id: 'e6', courseCode: 'HIST101', courseName: 'Lịch sử Đảng Cộng sản Việt Nam', examDate: '2026-06-20', examTime: '14:00 - 15:30', duration: '90 phút', room: 'F201', floor: 'Tầng 2', studentCount: 75, format: 'Thi viết', semester: 'HK2 2025-2026', status: 'done' },
];

export default function PortalExamSchedule() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

  const formats = ['all', 'Thi viết', 'Thi trắc nghiệm', 'Thi viết + Bài tập'];

  const filtered = EXAMS.filter((e) => {
    const matchSearch = !search || e.courseName.toLowerCase().includes(search.toLowerCase()) || e.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchFormat = formatFilter === 'all' || e.format.includes(formatFilter.split(' ')[0]);
    return matchSearch && matchFormat;
  });

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, exam) => {
    if (!acc[exam.examDate]) acc[exam.examDate] = [];
    acc[exam.examDate].push(exam);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('examSchedule.title')}
        description={t('examSchedule.description')}
        breadcrumbs={[{ label: 'PORTAL', href: '/portal' }, { label: t('examSchedule.breadcrumb') }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/portal')}>{t('examSchedule.back')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('examSchedule.downloadSchedule')}</Button>
          </div>
        }
      />

      <div className="flex items-start gap-3 p-4 rounded-xl border border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.04)]">
        <Calendar className="h-5 w-5 text-[rgb(var(--accent))] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('examSchedule.examNotice')}</p>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">
            {t('examSchedule.examNoticeText')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('examSchedule.searchPlaceholder')}
            className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
          />
        </div>
        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)]"
        >
          {formats.map(f => <option key={f} value={f}>{f === 'all' ? t('filter.all') : f}</option>)}
        </select>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-[rgb(var(--text-muted))] mx-auto mb-3" />
          <p className="text-sm text-[rgb(var(--text-muted))]">{t('examSchedule.noExams')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary))]">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                  {new Date(date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <Badge variant="neutral">{grouped[date].length} {t('examSchedule.examCount')}</Badge>
              </div>
              <div className="space-y-2 pl-12">
                {grouped[date].map((exam) => (
                  <Card key={exam.id} className={`hover:border-[rgb(var(--primary-light))] transition-colors ${exam.status === 'done' ? 'opacity-60' : ''}`}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="primary" size="sm">{exam.courseCode}</Badge>
                          <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{exam.courseName}</span>
                          {exam.status === 'done' && <Badge variant="success" size="sm">{t('examSchedule.done')}</Badge>}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--text-secondary))]">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.examTime} · {exam.duration}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{exam.room} · {exam.floor}</span>
                          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{exam.format}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[rgb(var(--text-muted))]">{exam.studentCount} {t('examSchedule.students')}</p>
                        <Badge variant="neutral" size="sm" className="mt-1">{exam.semester}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
