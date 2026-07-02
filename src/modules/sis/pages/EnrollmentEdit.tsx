import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SEMESTERS = ['HK1/2025-2026', 'HK2/2025-2026', 'HK1/2026-2027'];

const STUDENT = {
  id: 'er01', studentId: 'SV-2024-0142', studentName: 'Nguyễn Minh Tuấn',
  class: 'CNTT-K24', major: 'Công nghệ thông tin', dept: 'Khoa CNTT',
  semester: 'HK2/2025-2026', registerDate: '2026-01-15',
  approvedBy: 'ThS. Trần Văn B', approvedAt: '2026-01-16',
  status: 'registered',
};

// Các học phần có thể đăng ký
const AVAILABLE_COURSES = [
  { code: 'INT1005', name: 'Nhập môn Tin học', credits: 3, semester: 1 },
  { code: 'INT2201', name: 'Cấu trúc dữ liệu', credits: 4, semester: 2 },
  { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, semester: 3 },
  { code: 'INT3201', name: 'Mạng máy tính', credits: 3, semester: 3 },
  { code: 'INT3301', name: 'Lập trình hướng đối tượng', credits: 4, semester: 2 },
  { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, semester: 5 },
  { code: 'INT3501', name: 'An toàn thông tin', credits: 3, semester: 4 },
  { code: 'INT4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8 },
  { code: 'GEN1011', name: 'Toán cao cấp A1', credits: 4, semester: 1 },
  { code: 'GEN1012', name: 'Tiếng Anh A1', credits: 3, semester: 1 },
  { code: 'GEN2011', name: 'Xác suất thống kê', credits: 3, semester: 3 },
  { code: 'GEN2012', name: 'Tư tưởng HCM', credits: 2, semester: 1 },
];

// Học phần đã đăng ký (pre-populated)
const INITIAL_SELECTED = ['INT3110', 'INT3201', 'GEN2011', 'GEN2012', 'INT3301', 'INT3401', 'INT3501'];

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}{required && <span className="text-[rgb(var(--error))] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[rgb(var(--error))]">{error}</p>}
    </div>
  );
}

export default function EnrollmentEdit() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const [form, setForm] = useState({ semester: STUDENT.semester });
  const [selectedCourses, setSelectedCourses] = useState<string[]>(INITIAL_SELECTED);
  const [searchCourse, setSearchCourse] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCourseDetails = AVAILABLE_COURSES.filter((c) => selectedCourses.includes(c.code));
  const totalCredits = selectedCourseDetails.reduce((acc, c) => acc + c.credits, 0);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const toggleCourse = (code: string) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (selectedCourses.length === 0) e.courses = t('enrollment.form.validation.selectCourse');
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate(`/sis/dang-ky-hoc-phan/${STUDENT.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('enrollment.form.titleEdit')}
        description={`${STUDENT.studentName} · ${STUDENT.studentId} · ${STUDENT.semester}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('enrollment.titleList'), href: '/sis/dang-ky-hoc-phan' },
          { label: `${STUDENT.studentName}`, href: `/sis/dang-ky-hoc-phan/${STUDENT.id}` },
          { label: t('enrollment.breadcrumb.edit') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate(`/sis/dang-ky-hoc-phan/${STUDENT.id}`)}>{t('enrollment.form.back')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Thông tin sinh viên (readonly) */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('enrollment.form.studentInfo')}</h3>
          </div>
          <CardContent className="pt-5">
            <div className="flex items-center gap-4 rounded-lg border border-[rgb(var(--border))] p-4 bg-[rgb(var(--bg-base))]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-base font-bold text-white">
                {STUDENT.studentName.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('enrollment.table.hoTen')}</p>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{STUDENT.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('enrollment.table.maSV')}</p>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{STUDENT.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('enrollment.table.lop')}</p>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{STUDENT.class}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('enrollment.table.nganh')}</p>
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{STUDENT.major}</p>
                </div>
              </div>
              <Badge variant="info" dot>{t('enrollment.status.registered')}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin đăng ký */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('enrollment.form.enrollmentInfo')}</h3>
          </div>
          <CardContent className="grid grid-cols-2 gap-4 pt-5">
            <Field label={t('enrollment.form.hocKy')} required>
              <select
                value={form.semester}
                onChange={(e) => set('semester', e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light) / 0.2)]"
              >
                {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label={t('enrollment.form.ngayDangKy')}>
              <Input type="date" value={STUDENT.registerDate} onChange={() => {}} />
            </Field>
          </CardContent>
        </Card>

        {/* Chọn học phần */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('enrollment.form.enrolledCourses')}</h3>
            {selectedCourses.length > 0 && (
              <Badge variant="primary">{t('enrollment.form.selectedCount', { count: selectedCourses.length, credits: totalCredits })}</Badge>
            )}
          </div>
          <CardContent className="pt-5 space-y-4">
            {errors.courses && <p className="text-xs text-[rgb(var(--error))]">{errors.courses}</p>}

            {/* Đã chọn */}
            {selectedCourses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{t('enrollment.form.selected')} ({selectedCourses.length} {t('enrollment.filter.searchStudent')})</p>
                <div className="space-y-1.5">
                  {selectedCourseDetails.map((c) => (
                    <div key={c.code} className="flex items-center justify-between rounded-lg border border-[rgb(var(--primary)/0.3)] bg-[rgb(var(--primary)/0.04)] px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[rgb(var(--primary))] font-semibold">{c.code}</span>
                        <span className="text-sm text-[rgb(var(--text-primary))]">{c.name}</span>
                        <span className="text-xs text-[rgb(var(--text-muted))]">HK{c.semester}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[rgb(var(--text-secondary))]">{c.credits} TC</span>
                        <button
                          type="button"
                          onClick={() => toggleCourse(c.code)}
                          className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--error))]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thêm học phần */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{t('enrollment.form.addCourse')}</p>
              <Input
                placeholder={t('enrollment.form.findCourse')}
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[rgb(var(--border))]">
                {AVAILABLE_COURSES.filter(
                  (c) => !selectedCourses.includes(c.code) && (
                    c.name.toLowerCase().includes(searchCourse.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchCourse.toLowerCase())
                  )
                ).map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => toggleCourse(c.code)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgb(var(--bg-hover))] transition-colors"
                  >
                    <div>
                      <span className="font-mono text-xs text-[rgb(var(--text-secondary))] mr-2">{c.code}</span>
                      <span className="text-sm text-[rgb(var(--text-primary))]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[rgb(var(--text-muted))]">HK{c.semester}</span>
                      <span className="text-xs text-[rgb(var(--text-secondary))]">{c.credits} TC</span>
                      <svg className="h-4 w-4 text-[rgb(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </button>
                ))}
                {AVAILABLE_COURSES.filter(
                  (c) => !selectedCourses.includes(c.code) && (
                    c.name.toLowerCase().includes(searchCourse.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchCourse.toLowerCase())
                  )
                ).length === 0 && (
                  <p className="text-center py-4 text-xs text-[rgb(var(--text-muted))]">{t('enrollment.form.noMoreCourses')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate(`/sis/dang-ky-hoc-phan/${STUDENT.id}`)}>{t('enrollment.form.back')}</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{t('enrollment.form.saveChanges')}</Button>
        </div>
      </form>
    </div>
  );
}
