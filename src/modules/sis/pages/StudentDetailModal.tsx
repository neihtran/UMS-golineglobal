import { useState } from 'react';
import { X, User, BookOpen, GraduationCap, Calendar, Award, Mail, Phone, MapPin, Hash, Users } from 'lucide-react';
import { Modal, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Card } from '@/components/ui';
import { useDepartmentList } from '@/hooks/useHrm';
import { useEnrollmentList, useCourseList, useCurriculumList, useGraduationList } from '@/hooks/useSis';
import type { Student } from '@/hooks/useSis';

interface StudentDetailModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  studying: { variant: 'success', label: 'Đang học' },
  reserved: { variant: 'warning', label: 'Bảo lưu' },
  suspended: { variant: 'warning', label: 'Tạm ngưng' },
  graduated: { variant: 'info', label: 'Đã tốt nghiệp' },
  expelled: { variant: 'error', label: 'Đình chỉ' },
};

const ENROLLMENT_STATUS: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; label: string }> = {
  enrolled: { variant: 'info', label: 'Đã đăng ký' },
  in_progress: { variant: 'warning', label: 'Đang học' },
  completed: { variant: 'success', label: 'Hoàn thành' },
  failed: { variant: 'error', label: 'Trượt' },
  withdrawn: { variant: 'neutral', label: 'Đã rút' },
};

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[rgb(var(--border)/0.5)] last:border-0">
      <span className="text-sm text-[rgb(var(--text-secondary))] shrink-0">{label}</span>
      <span className={`text-sm font-medium text-[rgb(var(--text-primary))] text-right ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

export default function StudentDetailModal({ open, onClose, student }: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: deptResp } = useDepartmentList({ isActive: true });
  const departments = (deptResp as any)?.data ?? [];
  const deptName = departments.find((d: any) => d._id === student?.department)?.name ?? '';

  // Bảng điểm: enrollments theo student
  const { data: enrollmentData } = useEnrollmentList({
    student: student?._id,
    pageSize: 100,
  });
  const enrollments = (enrollmentData as any)?.data ?? [];

  // CTĐT: danh sách curricula theo khoa
  const { data: curriculumData } = useCurriculumList({
    department: typeof student?.department === 'string' ? student.department : undefined,
    pageSize: 100,
  });
  const curricula = (curriculumData as any)?.data ?? [];

  // Lịch học: courses theo khoa
  const { data: courseData } = useCourseList({
    department: typeof student?.department === 'string' ? student.department : undefined,
    pageSize: 100,
  });
  const courses = (courseData as any)?.data ?? [];

  // Văn bằng: graduations theo student (lọc từ danh sách nếu backend không hỗ trợ filter trực tiếp)
  const { data: graduationData } = useGraduationList({ pageSize: 100 });
  const allGraduations = (graduationData as any)?.data ?? [];
  const graduations = allGraduations.filter((g: any) => {
    const sId = typeof g.student === 'object' ? g.student?._id : g.student;
    return sId === student?._id;
  });

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  const scoreLabel = (s?: number | null) => {
    if (s == null) return '—';
    return Number(s).toFixed(2);
  };

  const scoreLetter = (s?: number | null) => {
    if (s == null) return '';
    if (s >= 8.5) return 'A';
    if (s >= 7.0) return 'B';
    if (s >= 5.5) return 'C';
    if (s >= 4.0) return 'D';
    return 'F';
  };

  const status = student ? STATUS_CONFIG[student.status] ?? STATUS_CONFIG['studying'] : null;

  return (
    <Modal open={open} onClose={onClose} title="" size="xl" className="max-w-4xl">
      {student && (
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-5 pb-5 border-b border-[rgb(var(--border))]">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xl font-bold text-[rgb(var(--primary))]">
                {student.name.split(' ').slice(-2).map((n) => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{student.name}</h2>
                  <Badge variant={status?.variant ?? 'neutral'} size="sm" dot>{status?.label}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-[rgb(var(--text-secondary))]">
                  <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{student.code}</span>
                  {deptName && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{deptName}</span>}
                  {student.className && <span>Lớp {student.className}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b border-[rgb(var(--border))] mb-4">
              <TabsTrigger value="overview"><User className="inline h-4 w-4 mr-1.5" />Tổng quan</TabsTrigger>
              <TabsTrigger value="grades"><BookOpen className="inline h-4 w-4 mr-1.5" />Bảng điểm</TabsTrigger>
              <TabsTrigger value="curriculum"><GraduationCap className="inline h-4 w-4 mr-1.5" />CTĐT</TabsTrigger>
              <TabsTrigger value="schedule"><Calendar className="inline h-4 w-4 mr-1.5" />Lịch học</TabsTrigger>
              <TabsTrigger value="degree"><Award className="inline h-4 w-4 mr-1.5" />Văn bằng</TabsTrigger>
            </TabsList>

            {/* ─── Tổng quan ─── */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <Section title="Thông tin cá nhân">
                  <InfoRow label="Họ tên" value={student.name} />
                  <InfoRow label="Ngày sinh" value={formatDate(student.dob)} />
                  <InfoRow label="Giới tính" value={student.gender} />
                  <InfoRow label="Dân tộc" value={student.ethnicity} />
                  <InfoRow label="Số CCCD" value={student.cccd} mono />
                </Section>

                <Section title="Liên hệ">
                  <InfoRow
                    label="Điện thoại"
                    value={student.phone ? (
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />{student.phone}</span>
                    ) : null}
                  />
                  <InfoRow
                    label="Email"
                    value={student.email ? (
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />{student.email}</span>
                    ) : null}
                  />
                  <InfoRow
                    label="Địa chỉ"
                    value={student.address ? (
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />{student.address}</span>
                    ) : null}
                  />
                </Section>

                <Section title="Thông tin học tập">
                  <InfoRow label="Khoa" value={deptName} />
                  <InfoRow label="Lớp" value={student.className} />
                  <InfoRow label="Khoá (Năm thứ)" value={student.courseYear} />
                  <InfoRow label="Ngày nhập học" value={formatDate(student.enrollmentDate)} />
                  <InfoRow label="Tín chỉ tích lũy" value={student.totalCredits ?? 0} mono />
                  <InfoRow
                    label="GPA"
                    value={
                      student.gpa != null && student.gpa > 0 ? (
                        <span className="flex items-center gap-2">
                          <span>{student.gpa.toFixed(2)}</span>
                          <span className="text-xs text-[rgb(var(--text-muted))]">/ 4.0</span>
                        </span>
                      ) : null
                    }
                    mono
                  />
                </Section>

                <Section title="Hệ thống">
                  <InfoRow label="Mã sinh viên" value={student.code} mono />
                  <InfoRow label="Trạng thái" value={status?.label} />
                  <InfoRow label="Ngày tạo" value={formatDate(student.createdAt)} />
                  <InfoRow label="Cập nhật" value={formatDate(student.updatedAt)} />
                </Section>
              </div>
            </TabsContent>

            {/* ─── Bảng điểm ─── */}
            <TabsContent value="grades">
              {enrollments.length === 0 ? (
                <Card>
                  <div className="px-5 py-10 text-center">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 text-[rgb(var(--text-muted))]" />
                    <p className="text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu bảng điểm</p>
                  </div>
                </Card>
              ) : (
                <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[rgb(var(--bg-muted))] text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                      <tr>
                        <th className="px-3 py-2.5 text-left">STT</th>
                        <th className="px-3 py-2.5 text-left">Môn học</th>
                        <th className="px-3 py-2.5 text-center">TC</th>
                        <th className="px-3 py-2.5 text-center">Giữa kỳ</th>
                        <th className="px-3 py-2.5 text-center">Cuối kỳ</th>
                        <th className="px-3 py-2.5 text-center">Tổng</th>
                        <th className="px-3 py-2.5 text-center">Chữ</th>
                        <th className="px-3 py-2.5 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e: any, i: number) => {
                        const course = typeof e.course === 'object' ? e.course : null;
                        const subject = course?.subject;
                        const midterm = e.midtermScore;
                        const final = e.finalScore;
                        const total = midterm != null && final != null ? (midterm * 0.4 + final * 0.6) : null;
                        const stCfg = ENROLLMENT_STATUS[e.status] ?? ENROLLMENT_STATUS['enrolled'];
                        return (
                          <tr key={e._id} className="border-t border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--bg-hover))]">
                            <td className="px-3 py-2 text-[rgb(var(--text-muted))] tabular-nums">{i + 1}</td>
                            <td className="px-3 py-2">
                              <div className="font-medium text-[rgb(var(--text-primary))]">{subject?.name ?? course?.name ?? '—'}</div>
                              <div className="text-xs text-[rgb(var(--text-muted))] font-mono">{course?.code ?? '—'}</div>
                            </td>
                            <td className="px-3 py-2 text-center font-mono">{subject?.credits ?? course?.credits ?? '—'}</td>
                            <td className="px-3 py-2 text-center font-mono">{scoreLabel(midterm)}</td>
                            <td className="px-3 py-2 text-center font-mono">{scoreLabel(final)}</td>
                            <td className="px-3 py-2 text-center font-mono font-semibold">{scoreLabel(total)}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge variant={total != null && total >= 5.5 ? 'success' : total != null ? 'error' : 'neutral'} size="sm">
                                {scoreLetter(total)}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Badge variant={stCfg.variant} size="sm" dot>{stCfg.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ─── CTĐT ─── */}
            <TabsContent value="curriculum">
              {curricula.length === 0 ? (
                <Card>
                  <div className="px-5 py-10 text-center">
                    <GraduationCap className="h-10 w-10 mx-auto mb-2 text-[rgb(var(--text-muted))]" />
                    <p className="text-sm text-[rgb(var(--text-muted))]">Chưa có chương trình đào tạo cho khoa này</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {curricula.map((c: any) => (
                    <Card key={c._id}>
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{c.name}</h4>
                              <Badge variant="info" size="sm">{c.code}</Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-[rgb(var(--text-muted))]">
                              <span>Bậc: {c.degreeType}</span>
                              <span>•</span>
                              <span>Thời gian: {c.durationYears} năm</span>
                              <span>•</span>
                              <span>Niên khoá: {c.effectiveYear}</span>
                            </div>
                          </div>
                          <Badge variant={c.status === 'active' ? 'success' : 'neutral'} size="sm">
                            {c.status === 'active' ? 'Đang áp dụng' : c.status === 'draft' ? 'Bản nháp' : c.status === 'archived' ? 'Đã lưu' : c.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[rgb(var(--border)/0.5)]">
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">Tổng TC</div>
                            <div className="font-mono font-semibold text-[rgb(var(--text-primary))]">{c.totalCredits}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">Số môn</div>
                            <div className="font-mono font-semibold text-[rgb(var(--text-primary))]">{c.subjects?.length ?? 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">Môn bắt buộc</div>
                            <div className="font-mono font-semibold text-[rgb(var(--text-primary))]">
                              {c.subjects?.filter((s: any) => s.isRequired).length ?? 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">Môn tự chọn</div>
                            <div className="font-mono font-semibold text-[rgb(var(--text-primary))]">
                              {c.subjects?.filter((s: any) => !s.isRequired).length ?? 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Lịch học ─── */}
            <TabsContent value="schedule">
              {courses.length === 0 ? (
                <Card>
                  <div className="px-5 py-10 text-center">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-[rgb(var(--text-muted))]" />
                    <p className="text-sm text-[rgb(var(--text-muted))]">Chưa có lịch học cho khoa này</p>
                  </div>
                </Card>
              ) : (
                <div className="rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[rgb(var(--bg-muted))] text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                      <tr>
                        <th className="px-3 py-2.5 text-left">Mã lớp HP</th>
                        <th className="px-3 py-2.5 text-left">Tên lớp</th>
                        <th className="px-3 py-2.5 text-center">HK</th>
                        <th className="px-3 py-2.5 text-center">Năm học</th>
                        <th className="px-3 py-2.5 text-left">Phòng</th>
                        <th className="px-3 py-2.5 text-left">Lịch</th>
                        <th className="px-3 py-2.5 text-center">SV</th>
                        <th className="px-3 py-2.5 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c: any) => (
                        <tr key={c._id} className="border-t border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--bg-hover))]">
                          <td className="px-3 py-2 font-mono text-xs">{c.code}</td>
                          <td className="px-3 py-2 font-medium text-[rgb(var(--text-primary))]">{c.name}</td>
                          <td className="px-3 py-2 text-center font-mono">{c.semester}</td>
                          <td className="px-3 py-2 text-center font-mono">{c.academicYear}</td>
                          <td className="px-3 py-2">{c.room ?? '—'}</td>
                          <td className="px-3 py-2 text-xs">{c.schedule ?? '—'}</td>
                          <td className="px-3 py-2 text-center font-mono">
                            {c.currentStudents ?? 0}/{c.maxStudents}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge
                              variant={
                                c.status === 'open' ? 'success' :
                                c.status === 'in_progress' ? 'warning' :
                                c.status === 'completed' ? 'info' :
                                c.status === 'cancelled' ? 'error' : 'neutral'
                              }
                              size="sm"
                              dot
                            >
                              {c.status === 'open' ? 'Mở' :
                               c.status === 'in_progress' ? 'Đang học' :
                               c.status === 'completed' ? 'Hoàn thành' :
                               c.status === 'cancelled' ? 'Huỷ' :
                               c.status === 'draft' ? 'Nháp' :
                               c.status === 'closed' ? 'Đóng' : c.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ─── Văn bằng ─── */}
            <TabsContent value="degree">
              {graduations.length === 0 ? (
                <Card>
                  <div className="px-5 py-10 text-center">
                    <Award className="h-10 w-10 mx-auto mb-2 text-[rgb(var(--text-muted))]" />
                    <p className="text-sm text-[rgb(var(--text-muted))]">Chưa có văn bằng tốt nghiệp</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {graduations.map((g: any) => (
                    <Card key={g._id}>
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-[rgb(var(--text-primary))]">
                              {g.degree ?? 'Văn bằng'} - Khoá {g.cohort}
                            </h4>
                            <div className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                              Tốt nghiệp: {g.graduationSemester}/{g.graduationYear}
                            </div>
                          </div>
                          <Badge
                            variant={
                              g.status === 'graduated' || g.status === 'diploma_issued' ? 'success' :
                              g.status === 'not_met' ? 'error' : 'warning'
                            }
                            size="sm"
                            dot
                          >
                            {g.status === 'pending_review' ? 'Chờ xét' :
                             g.status === 'graduated' ? 'Đã tốt nghiệp' :
                             g.status === 'diploma_issued' ? 'Đã cấp VB' :
                             g.status === 'not_met' ? 'Không đủ ĐK' : g.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[rgb(var(--border)/0.5)]">
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">GPA</div>
                            <div className="font-mono font-semibold text-[rgb(var(--text-primary))]">{g.gpa?.toFixed(2) ?? '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">Tổng TC</div>
                            <div className="font-mono font-semibold text-[rgb(var(--text-primary))]">{g.totalCredits ?? '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">Số VB</div>
                            <div className="font-mono font-semibold text-[rgb(var(--text-primary))]">{g.diplomaNo ?? '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">Ngày cấp</div>
                            <div className="font-medium text-[rgb(var(--text-primary))]">{formatDate(g.diplomaDate)}</div>
                          </div>
                        </div>

                        {g.thesisTitle && (
                          <div className="mt-3 pt-3 border-t border-[rgb(var(--border)/0.5)]">
                            <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Khoá luận / Đồ án</div>
                            <div className="text-sm font-medium text-[rgb(var(--text-primary))]">{g.thesisTitle}</div>
                            {g.thesisScore != null && (
                              <div className="text-xs text-[rgb(var(--text-muted))] mt-1">
                                Điểm: <span className="font-mono font-semibold">{g.thesisScore.toFixed(2)}</span>
                                {g.thesisAdvisor && <> • GVHD: {g.thesisAdvisor}</>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Modal>
  );
}