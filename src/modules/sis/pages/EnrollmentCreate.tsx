import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const SEMESTERS = ['HK1/2025-2026', 'HK2/2025-2026', 'HK1/2026-2027'];
const STUDENTS = [
  { id: 'sv001', msv: 'SV-2024-0142', name: 'Nguyễn Minh Tuấn', class: 'CNTT-K24' },
  { id: 'sv002', msv: 'SV-2024-0167', name: 'Trần Thu Hà', class: 'CNTT-K24' },
  { id: 'sv003', msv: 'SV-2024-0089', name: 'Lê Đình Phong', class: 'CNTT-K24' },
  { id: 'sv004', msv: 'SV-2023-0211', name: 'Phạm Thị Lan', class: 'KT-K23' },
  { id: 'sv005', msv: 'SV-2024-0056', name: 'Bùi Hoàng Nam', class: 'LUAT-K24' },
];
const COURSES = [
  { code: 'INT1005', name: 'Nhập môn Tin học', credits: 3, semester: 1 },
  { code: 'INT2201', name: 'Cấu trúc dữ liệu', credits: 4, semester: 2 },
  { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, semester: 3 },
  { code: 'INT3201', name: 'Mạng máy tính', credits: 3, semester: 3 },
  { code: 'INT3301', name: 'Lập trình hướng đối tượng', credits: 4, semester: 2 },
  { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, semester: 5 },
  { code: 'INT4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8 },
  { code: 'GEN1011', name: 'Toán cao cấp A1', credits: 4, semester: 1 },
  { code: 'GEN1012', name: 'Tiếng Anh A1', credits: 3, semester: 1 },
  { code: 'GEN2011', name: 'Xác suất thống kê', credits: 3, semester: 3 },
];

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

export default function EnrollmentCreate() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const [form, setForm] = useState({ semester: SEMESTERS[0], studentId: '' });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedStudent = STUDENTS.find((s) => s.id === form.studentId);
  const filteredCourses = COURSES.filter(
    (c) => !selectedCourses.includes(c.code) &&
    (c.name.toLowerCase().includes(searchCourse.toLowerCase()) || c.code.toLowerCase().includes(searchCourse.toLowerCase()))
  );
  const selectedCourseDetails = COURSES.filter((c) => selectedCourses.includes(c.code));
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
    if (!form.studentId) e.studentId = t('enrollment.form.validation.selectStudent');
    if (selectedCourses.length === 0) e.courses = t('enrollment.form.validation.selectCourse');
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/sis/dang-ky-hoc-phan');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('enrollment.form.titleCreate')}
        description={t('enrollment.form.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('enrollment.titleList'), href: '/sis/dang-ky-hoc-phan' },
          { label: t('enrollment.breadcrumb.create') },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/sis/dang-ky-hoc-phan')}>{t('enrollment.form.back')}</Button>}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

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
              <Input type="date" value="2026-01-15" onChange={() => {}} />
            </Field>
          </CardContent>
        </Card>

        {/* Chọn sinh viên */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('enrollment.form.selectStudent')}</h3>
          </div>
          <CardContent className="pt-5 space-y-3">
            {selectedStudent ? (
              <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
                    {selectedStudent.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedStudent.name}</p>
                    <p className="text-xs text-[rgb(var(--text-secondary))]">{selectedStudent.msv} · {selectedStudent.class}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, studentId: '' }))}>{t('enrollment.form.doi')}</Button>
              </div>
            ) : (
              <>
                <Input
                  placeholder={t('enrollment.form.findStudent')}
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[rgb(var(--border))]">
                  {STUDENTS.filter(
                    (s) => !form.studentId && (
                      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      s.msv.toLowerCase().includes(searchStudent.toLowerCase())
                    )
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setForm((f) => ({ ...f, studentId: s.id })); setSearchStudent(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[rgb(var(--bg-hover))] transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {s.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{s.name}</p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">{s.msv} · {s.class}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.studentId && <p className="text-xs text-[rgb(var(--error))]">{errors.studentId}</p>}
              </>
            )}
          </CardContent>
        </Card>

        {/* Chọn học phần */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('enrollment.form.selectCourse')}</h3>
            {selectedCourses.length > 0 && (
              <Badge variant="primary">{t('enrollment.form.selectedCount', { count: selectedCourses.length, credits: totalCredits })}</Badge>
            )}
          </div>
          <CardContent className="pt-5 space-y-3">
            {errors.courses && <p className="text-xs text-[rgb(var(--error))]">{errors.courses}</p>}

            {/* Đã chọn */}
            {selectedCourses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{t('enrollment.form.selected')}</p>
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
                {filteredCourses.map((c) => (
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
                      <Plus className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                    </div>
                  </button>
                ))}
                {filteredCourses.length === 0 && (
                  <p className="text-center py-4 text-xs text-[rgb(var(--text-muted))]">{t('enrollment.form.noMoreCourses')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/dang-ky-hoc-phan')}>{t('enrollment.form.back')}</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>{t('enrollment.form.save')}</Button>
        </div>
      </form>
    </div>
  );
}
