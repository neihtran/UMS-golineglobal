import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Check, BookOpen, Users } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const REGISTRATIONS = [
  { id: 'r1', code: 'CS101', name: 'Nhập môn Lập trình Python', credits: 3, teacher: 'TS. Nguyễn Văn Minh', schedule: 'Thứ 2, Tiết 1-3', room: 'A101', enrolled: 45, max: 60, status: 'registered', midterm: true },
  { id: 'r2', code: 'MATH201', name: 'Giải tích 2', credits: 4, teacher: 'PGS.TS. Lê Thị Lan', schedule: 'Thứ 3, Tiết 4-6', room: 'B203', enrolled: 58, max: 60, status: 'registered', midterm: true },
  { id: 'r3', code: 'ENG301', name: 'Tiếng Anh Học thuật', credits: 3, teacher: 'ThS. Trần Hoàng Nam', schedule: 'Thứ 4, Tiết 7-9', room: 'C105', enrolled: 52, max: 55, status: 'pending', midterm: false },
];

const AVAILABLE_COURSES = [
  { id: 'c1', code: 'PHYS101', name: 'Vật lý Đại cương', credits: 3, teacher: 'TS. Bùi Minh Tuấn', schedule: 'Thứ 5, Tiết 1-3', room: 'D301', enrolled: 38, max: 50, status: 'available', midterm: false, prerequisite: null },
  { id: 'c2', code: 'CHEM101', name: 'Hóa học Đại cương', credits: 3, teacher: 'PGS.TS. Đặng Văn Minh', schedule: 'Thứ 6, Tiết 4-6', room: 'E102', enrolled: 40, max: 45, status: 'available', midterm: false, prerequisite: null },
  { id: 'c3', code: 'CS102', name: 'Cấu trúc Dữ liệu', credits: 4, teacher: 'TS. Nguyễn Văn Minh', schedule: 'Thứ 2, Tiết 4-6', room: 'A101', enrolled: 30, max: 60, status: 'available', midterm: true, prerequisite: 'CS101' },
  { id: 'c4', code: 'HIST101', name: 'Lịch sử Đảng Cộng sản Việt Nam', credits: 2, teacher: 'GS.TS. Phạm Văn Đức', schedule: 'Thứ 7, Tiết 1-2', room: 'F201', enrolled: 80, max: 100, status: 'available', midterm: false, prerequisite: null },
  { id: 'c5', code: 'PE101', name: 'Giáo dục Thể chất 1', credits: 1, teacher: 'ThS. Hoàng Đình Nam', schedule: 'Thứ 3, Tiết 10-11', room: 'Sân TDTT', enrolled: 35, max: 40, status: 'full', midterm: false, prerequisite: null },
];

export default function PortalCourseRegistration() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [registered, setRegistered] = useState<string[]>(REGISTRATIONS.filter(r => r.status === 'registered').map(r => r.id));

  const filtered = AVAILABLE_COURSES.filter((c) => {
    return !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
  });

  const toggleRegister = (id: string) => {
    if (registered.includes(id)) {
      setRegistered(prev => prev.filter(x => x !== id));
    } else {
      setRegistered(prev => [...prev, id]);
    }
  };

  const totalCredits = registered.length > 0
    ? [...REGISTRATIONS, ...AVAILABLE_COURSES].filter(c => registered.includes(c.id)).reduce((sum, c) => sum + c.credits, 0)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('courseReg.title')}
        description={t('courseReg.description')}
        breadcrumbs={[{ label: 'PORTAL', href: '/portal' }, { label: t('courseReg.breadcrumb') }]}
        actions={<Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/portal')}>{t('courseReg.back')}</Button>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('courseReg.statRegistered'), value: registered.length, icon: <Check className="h-5 w-5" />, color: 'success' },
          { label: t('courseReg.statCredits'), value: totalCredits, icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
          { label: t('courseReg.statMax'), value: '21', icon: <Users className="h-5 w-5" />, color: 'info' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>{s.icon}</div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {registered.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('courseReg.registeredCourses')}</h3>
            <Badge variant="success">{registered.length} {t('courseReg.courseCount')}</Badge>
          </div>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {[t('courseReg.table.code'), t('courseReg.table.courseName'), t('grades.table.credits'), t('courseReg.table.teacher'), t('courseReg.table.schedule'), t('courseReg.table.room')].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...REGISTRATIONS, ...AVAILABLE_COURSES].filter(c => registered.includes(c.id)).map((c) => (
                  <tr key={c.id} className="border-b border-[rgb(var(--border)/0.4)] hover:bg-[rgb(var(--bg-hover))]">
                    <td className="px-4 py-3"><Badge variant="primary" size="sm">{c.code}</Badge></td>
                    <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{c.credits}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{c.teacher}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{c.schedule}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{c.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('courseReg.availableCourses')}</h3>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('courseReg.searchPlaceholder')}
              className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.3)] w-80"
            />
          </div>

          <div className="divide-y divide-[rgb(var(--border)/0.4)]">
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-sm text-[rgb(var(--text-muted))]">{t('courseReg.noCourses')}</p>
            ) : (
              filtered.map((c) => {
                const isFull = c.enrolled >= c.max;
                const isRegistered = registered.includes(c.id);

                return (
                  <div key={c.id} className={`flex items-center gap-4 py-3 ${isFull && !isRegistered ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => !isFull && toggleRegister(c.id)}
                      disabled={isFull}
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        isRegistered
                          ? 'border-[rgb(var(--success))] bg-[rgb(var(--success))]'
                          : isFull
                          ? 'border-[rgb(var(--border))] cursor-not-allowed'
                          : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] cursor-pointer'
                      }`}
                    >
                      {isRegistered && <Check className="h-3 w-3 text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm">{c.code}</Badge>
                        <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.name}</span>
                        {c.prerequisite && <Badge variant="neutral" size="sm">{t('courseReg.prerequisite')}: {c.prerequisite}</Badge>}
                        {c.midterm && <Badge variant="info" size="sm">{t('courseReg.hasMidterm')}</Badge>}
                        {isFull && <Badge variant="error" size="sm">{t('courseReg.full')}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                        <span>{c.credits} {t('courseReg.credits')}</span>
                        <span>·</span>
                        <span>{c.teacher}</span>
                        <span>·</span>
                        <span>{c.schedule}</span>
                        <span>·</span>
                        <span>{c.room}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-[rgb(var(--text-muted))]">{c.enrolled}/{c.max} SV</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {registered.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
              {t('courseReg.selected')} <span className="text-[rgb(var(--primary))]">{registered.length} học phần</span>
            </p>
            <p className="text-xs text-[rgb(var(--text-muted))]">{totalCredits} {t('courseReg.credits')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">{t('courseReg.cancelAll')}</Button>
            <Button leftIcon={<Check className="h-4 w-4" />}>{t('courseReg.submitReg')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
