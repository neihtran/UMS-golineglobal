import { useState } from 'react';
import {
  Users,
  FileText,
  Plus,
  Download,
  Edit2,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COURSE = {
  id: 'c1', code: 'CS101', name: 'Nhập môn Lập trình Python',
  instructor: 'TS. Nguyễn Văn Minh', instructorTitle: 'Giảng viên',
  dept: 'Khoa CNTT', semester: '2026-1', credits: 4, students: 312, enrolled: 298,
  completionRate: 78, rating: 4.8, status: 'published',
  startDate: '2026-01-15', endDate: '2026-05-30',
  description: 'Môn học giới thiệu về lập trình Python cho sinh viên năm nhất, bao gồm các khái niệm cơ bản về biến, vòng lặp, hàm, cấu trúc dữ liệu và lập trình hướng đối tượng.',
  syl: 'CS101-SYL-2026.pdf',
};

const ASSIGNMENTS = [
  { id: 'a1', title: 'Bài tập tuần 1 — Biến và Kiểu dữ liệu', type: 'individual', due: '2026-06-28', maxScore: 10, submissions: 245, graded: 240, status: 'closed' },
  { id: 'a2', title: 'Bài tập tuần 4 — Vòng lặp', type: 'individual', due: '2026-06-21', maxScore: 10, submissions: 268, graded: 260, status: 'closed' },
  { id: 'a3', title: 'Dự án nhóm — Xây dựng ứng dụng Todo', type: 'group', due: '2026-07-05', maxScore: 30, submissions: 72, graded: 0, status: 'open' },
  { id: 'a4', title: 'Bài tập tuần 8 — Hàm', type: 'individual', due: '2026-06-14', maxScore: 10, submissions: 290, graded: 285, status: 'closed' },
];

const GRADE_DIST = [
  { grade: 'A', count: 142, color: 'rgb(var(--success))' },
  { grade: 'B+', count: 218, color: 'rgb(var(--primary))' },
  { grade: 'B', count: 310, color: 'rgb(var(--info))' },
  { grade: 'C+', count: 245, color: 'rgb(var(--accent))' },
  { grade: 'C', count: 178, color: 'rgb(var(--warning))' },
  { grade: 'D', count: 89, color: 'rgb(var(--error))' },
];

const TABS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'assignments', label: 'Bài tập' },
  { id: 'students', label: 'Sinh viên' },
  { id: 'gradebook', label: 'Bảng điểm' },
];

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <PageHeader
        title={COURSE.name}
        description={`${COURSE.code} · ${COURSE.dept} · ${COURSE.semester}`}
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Khóa học', href: '/lms/khoa-hoc' }, { label: COURSE.name }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Xuất danh sách</Button>
            <Button leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => window.location.href = `/lms/khoa-hoc/${COURSE.id}/sua`}>Chỉnh sửa</Button>
          </>
        }
      />

      {/* Course header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="success">Đã xuất bản</Badge>
                <span className="text-xs text-[rgb(var(--text-muted))]">📅 {COURSE.startDate} → {COURSE.endDate}</span>
                <span className="text-xs text-[rgb(var(--text-muted))]">🎓 {COURSE.credits} tín chỉ</span>
              </div>
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{COURSE.description}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-[rgb(var(--text-primary))]">{COURSE.rating}</span>
                <svg className="h-5 w-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{COURSE.enrolled}/{COURSE.students} SV</p>
              <div className="mt-2 h-1.5 w-24 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: `${COURSE.completionRate}%` }} />
              </div>
              <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">{COURSE.completionRate}% hoàn thành</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[rgb(var(--border)/0.6)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Thông tin khóa học</h3>
            </div>
            <CardContent className="space-y-4 p-5">
              {[
                { label: 'Giảng viên', value: `${COURSE.instructor} — ${COURSE.instructorTitle}` },
                { label: 'Khoa', value: COURSE.dept },
                { label: 'Học kỳ', value: COURSE.semester },
                { label: 'Số tín chỉ', value: `${COURSE.credits} tín chỉ` },
                { label: 'Số sinh viên', value: `${COURSE.enrolled} SV` },
                { label: 'Ngày bắt đầu', value: COURSE.startDate },
                { label: 'Ngày kết thúc', value: COURSE.endDate },
                { label: 'File đề cương', value: COURSE.syl },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-b border-[rgb(var(--border)/0.4)] pb-2 last:border-0 last:pb-0">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                <h4 className="font-semibold text-[rgb(var(--text-primary))]">Thống kê nhanh</h4>
              </div>
              <CardContent className="space-y-3 pt-3">
                {[
                  { label: 'Bài tập đã giao', value: '12' },
                  { label: 'Bài tập đã chấm', value: '10' },
                  { label: 'Bài thi', value: '2' },
                  { label: 'Tài liệu', value: '24' },
                  { label: 'Video bài giảng', value: '48' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--text-muted))]">{label}</span>
                    <span className="font-semibold text-[rgb(var(--text-primary))]">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Assignments tab */}
      {activeTab === 'assignments' && (
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Danh sách bài tập</h3>
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>Thêm bài tập</Button>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {ASSIGNMENTS.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  a.status === 'open' ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]' : 'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-muted))]'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{a.title}</p>
                    <Badge variant={a.type === 'group' ? 'accent' : 'neutral'} size="sm">{a.type === 'group' ? 'Nhóm' : 'Cá nhân'}</Badge>
                    <Badge variant={a.status === 'open' ? 'success' : 'neutral'} size="sm">
                      {a.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">📅 {a.due} · Tối đa {a.maxScore} điểm</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary)]">{a.submissions}/{COURSE.enrolled}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">nộp · {a.graded} đã chấm</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Students tab */}
      {activeTab === 'students' && (
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Danh sách sinh viên ({COURSE.enrolled})</h3>
            <Button variant="outline" size="sm">Danh sách lớp</Button>
          </div>
          <div className="px-5 py-10 text-center">
            <Users className="h-12 w-12 text-[rgb(var(--text-muted))] mx-auto mb-3" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">{COURSE.enrolled} sinh viên đã đăng ký</p>
            <Button variant="outline" size="sm" className="mt-4">Xem danh sách</Button>
          </div>
        </Card>
      )}

      {/* Gradebook tab */}
      {activeTab === 'gradebook' && (
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Phân bổ điểm</h3>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Xuất điểm</Button>
          </div>
          <div className="p-5 space-y-3">
            {GRADE_DIST.map((g) => (
              <div key={g.grade} className="flex items-center gap-3">
                <div className="w-10 shrink-0 text-center">
                  <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{g.grade}</span>
                </div>
                <div className="flex-1 h-4 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(g.count / 300) * 100}%`, background: g.color }} />
                </div>
                <div className="w-20 shrink-0 text-right">
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{g.count} SV</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
