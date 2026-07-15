import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Search } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useCreateEnrollment, useStudentList, useCourseList } from '@/hooks/useSis';

export default function EnrollmentCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateEnrollment();
  const [searchStudent, setSearchStudent] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: studentsResp } = useStudentList({ pageSize: 100, search: searchStudent || undefined });
  const { data: coursesResp } = useCourseList({ pageSize: 100, search: searchCourse || undefined });

  const students: any[] = ((studentsResp as any)?.data ?? []).filter(
    (s: any) => s.status === 'studying'
  );
  const courses: any[] = ((coursesResp as any)?.data ?? []);

  const selectedStudent = students.find((s) => s._id === selectedStudentId);
  const selectedCourseDetails = courses.filter((c) => selectedCourseIds.includes(c._id));
  const totalCredits = selectedCourseDetails.reduce(
    (acc, c) => acc + (typeof c.subject === 'object' ? (c.subject as any).credits ?? 0 : c.credits ?? 0),
    0
  );

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedStudentId) e.student = 'Vui lòng chọn sinh viên';
    if (selectedCourseIds.length === 0) e.courses = 'Vui lòng chọn ít nhất một học phần';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Create enrollment for each selected course
    const promises = selectedCourseIds.map((courseId) =>
      createMutation.mutateAsync({ student: selectedStudentId, course: courseId })
    );

    Promise.all(promises)
      .then(() => navigate('/sis/dang-ky-hoc-phan'))
      .catch(() => { /* error handled by mutation */ });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo đăng ký học phần"
        description="Chọn sinh viên và học phần để tạo đăng ký."
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Đăng ký học phần', href: '/sis/dang-ky-hoc-phan' },
          { label: 'Tạo mới' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/sis/dang-ky-hoc-phan')}>
            Quay lại
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chọn sinh viên */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Chọn sinh viên</h3>
          </div>
          <CardContent className="pt-5 space-y-3">
            {selectedStudent ? (
              <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white">
                    {selectedStudent.name.split(' ').slice(-2).map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedStudent.name}</p>
                    <p className="text-xs text-[rgb(var(--text-secondary))]">
                      {selectedStudent.code} · {selectedStudent.className ?? '—'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudentId('')}>Đổi</Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
                  <input
                    placeholder="Tìm theo tên hoặc mã sinh viên..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[rgb(var(--border))]">
                  {students.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => { setSelectedStudentId(s._id); setSearchStudent(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[rgb(var(--bg-hover))] transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {s.name.split(' ').slice(-2).map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{s.name}</p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">{s.code} · {s.className ?? '—'}</p>
                      </div>
                    </button>
                  ))}
                  {students.length === 0 && (
                    <p className="text-center py-4 text-sm text-[rgb(var(--text-muted))]">
                      {searchStudent ? 'Không tìm thấy sinh viên' : 'Nhập từ khóa để tìm kiếm'}
                    </p>
                  )}
                </div>
                {errors.student && <p className="text-xs text-[rgb(var(--error))]">{errors.student}</p>}
              </>
            )}
          </CardContent>
        </Card>

        {/* Chọn học phần */}
        <Card>
          <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Chọn học phần</h3>
            {selectedCourseIds.length > 0 && (
              <Badge variant="primary">
                {selectedCourseIds.length} học phần · {totalCredits} tín chỉ
              </Badge>
            )}
          </div>
          <CardContent className="pt-5 space-y-3">
            {errors.courses && <p className="text-xs text-[rgb(var(--error))]">{errors.courses}</p>}

            {selectedCourseIds.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">Đã chọn</p>
                <div className="space-y-1.5">
                  {selectedCourseDetails.map((c) => {
                    const credits = typeof c.subject === 'object' ? (c.subject as any).credits ?? 0 : c.credits ?? 0;
                    return (
                      <div
                        key={c._id}
                        className="flex items-center justify-between rounded-lg border border-[rgb(var(--primary)/0.3)] bg-[rgb(var(--primary)/0.04)] px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[rgb(var(--primary))] font-semibold">
                            {(c as any).code ?? c.code ?? '—'}
                          </span>
                          <span className="text-sm text-[rgb(var(--text-primary))]">{(c as any).name ?? c.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[rgb(var(--text-secondary))]">{credits} TC</span>
                          <button
                            type="button"
                            onClick={() => toggleCourse(c._id)}
                            className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--error))]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">Thêm học phần</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
                <input
                  placeholder="Tìm theo tên hoặc mã học phần..."
                  value={searchCourse}
                  onChange={(e) => setSearchCourse(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[rgb(var(--border))]">
                {courses
                  .filter((c) => !selectedCourseIds.includes(c._id))
                  .map((c) => {
                    const code = (c as any).code ?? '—';
                    const name = (c as any).name ?? '—';
                    const credits = typeof c.subject === 'object' ? (c.subject as any).credits ?? 0 : c.credits ?? 0;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => toggleCourse(c._id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgb(var(--bg-hover))] transition-colors"
                      >
                        <div>
                          <span className="font-mono text-xs text-[rgb(var(--text-secondary))] mr-2">{code}</span>
                          <span className="text-sm text-[rgb(var(--text-primary))]">{name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[rgb(var(--text-secondary))]">{credits} TC</span>
                          <span className="text-xs text-[rgb(var(--primary))]">+</span>
                        </div>
                      </button>
                    );
                  })}
                {courses.length === 0 && (
                  <p className="text-center py-4 text-sm text-[rgb(var(--text-muted))]">
                    {searchCourse ? 'Không tìm thấy học phần' : 'Nhập từ khóa để tìm kiếm'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/sis/dang-ky-hoc-phan')}>
            Quay lại
          </Button>
          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu đăng ký'}
          </Button>
        </div>
      </form>
    </div>
  );
}
