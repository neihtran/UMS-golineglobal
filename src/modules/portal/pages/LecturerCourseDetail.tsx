import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  MessageSquare,
  Download,
  Plus,
  FileText,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const COURSE_INFO = {
  code: 'CS101',
  name: 'Nhập môn Lập trình Python',
  instructor: 'TS. Nguyễn Văn Minh',
  semester: 'Học kỳ 2, 2025–2026',
  students: 312,
  completed: 78,
  schedule: 'Thứ 2, 4 (Tiết 1–3), Phòng 301',
  credits: 3,
};

const STUDENTS = [
  { id: 'sv1', name: 'Nguyễn Văn An', msv: 'SV2021002345', attendance: 95, avgScore: 8.5, status: 'active' },
  { id: 'sv2', name: 'Trần Thị Bình', msv: 'SV2021002346', attendance: 88, avgScore: 7.8, status: 'active' },
  { id: 'sv3', name: 'Lê Hoàng Nam', msv: 'SV2021002347', attendance: 72, avgScore: 6.5, status: 'warning' },
  { id: 'sv4', name: 'Phạm Thu Lan', msv: 'SV2021002348', attendance: 90, avgScore: 9.0, status: 'active' },
  { id: 'sv5', name: 'Vũ Minh Đức', msv: 'SV2021002349', attendance: 45, avgScore: 4.5, status: 'danger' },
  { id: 'sv6', name: 'Đặng Thị Hoa', msv: 'SV2021002350', attendance: 92, avgScore: 8.2, status: 'active' },
  { id: 'sv7', name: 'Bùi Văn Tùng', msv: 'SV2021002351', attendance: 85, avgScore: 7.5, status: 'active' },
  { id: 'sv8', name: 'Hoàng Thị Mai', msv: 'SV2021002352', attendance: 100, avgScore: 9.5, status: 'active' },
];

const ASSIGNMENTS = [
  { id: 'a1', title: 'Bài tập tuần 1: Cài đặt Python', type: 'file', deadline: '2026-06-15', submissions: 298, total: 312, status: 'graded' },
  { id: 'a2', title: 'Bài tập tuần 3: Biến và Kiểu dữ liệu', type: 'online', deadline: '2026-06-29', submissions: 245, total: 312, status: 'open' },
  { id: 'a3', title: 'Kiểm tra giữa kỳ', type: 'exam', deadline: '2026-07-15', submissions: 312, total: 312, status: 'closed' },
  { id: 'a4', title: 'Bài tập tuần 5: Hàm và Vòng lặp', type: 'online', deadline: '2026-07-13', submissions: 0, total: 312, status: 'upcoming' },
];

const ANNOUNCEMENTS = [
  { id: 'n1', title: 'Lịch thi giữa kỳ đã được cập nhật', date: '2026-06-20', pinned: true },
  { id: 'n2', title: 'Bài tập tuần 4 đã được đăng', date: '2026-06-18', pinned: false },
  { id: 'n3', title: 'Nhắc nhở nộp báo cáo thực hành', date: '2026-06-15', pinned: false },
];

const STATUS_BADGE: Record<string, { variant: string; label: string }> = {
  graded: { variant: 'success', label: 'Đã chấm' },
  open: { variant: 'primary', label: 'Đang mở' },
  closed: { variant: 'neutral', label: 'Đã đóng' },
  upcoming: { variant: 'info', label: 'Sắp mở' },
};

const STUDENT_STATUS_BADGE: Record<string, { variant: string; label: string }> = {
  active: { variant: 'success', label: 'Tốt' },
  warning: { variant: 'warning', label: 'Cần theo dõi' },
  danger: { variant: 'error', label: 'Nguy cơ' },
};

export default function LecturerCourseDetail() {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="space-y-6">
      <PageHeader
        title={COURSE_INFO.name}
        description={`${COURSE_INFO.code} · ${COURSE_INFO.semester}`}
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Lớp học', href: '/lms' },
          { label: COURSE_INFO.code },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/lms">Quay lại</Link>
          </Button>
        }
      />

      {/* Course info */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Giảng viên', value: COURSE_INFO.instructor, icon: <Users className="h-4 w-4" /> },
          { label: 'Sĩ số', value: `${COURSE_INFO.students} SV`, icon: <Users className="h-4 w-4" /> },
          { label: 'Tiến độ', value: `${COURSE_INFO.completed}%`, icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: 'Lịch học', value: COURSE_INFO.schedule, icon: <Clock className="h-4 w-4" /> },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-[rgb(var(--text-muted))]">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase">{item.label}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))] truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-[rgb(var(--border)/0.6)] px-5">
          <div className="flex gap-1">
            {[
              { id: 'students', label: 'Danh sách lớp' },
              { id: 'assignments', label: 'Bài tập & Kiểm tra' },
              { id: 'grades', label: 'Điểm số' },
              { id: 'announcements', label: 'Thông báo' },
              { id: 'discussions', label: 'Thảo luận' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                    : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Students tab */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Tổng <strong className="text-[rgb(var(--text-primary))]">{STUDENTS.length}</strong> sinh viên
                </p>
                <div className="flex gap-2">
                  <input
                    type="search"
                    placeholder="Tìm tên hoặc MSV..."
                    className="h-8 w-56 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary-light))/0.3]"
                  />
                  <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                    Xuất Excel
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border)/0.6)]">
                      {['STT', 'Sinh viên', 'MSV', 'Điểm danh', 'Điểm TB', 'Trạng thái', ''].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                    {STUDENTS.map((sv, i) => {
                      const sb = STUDENT_STATUS_BADGE[sv.status] || { variant: 'neutral', label: sv.status };
                      return (
                        <tr key={sv.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                          <td className="px-4 py-2.5 text-xs text-[rgb(var(--text-muted))]">{i + 1}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                                {sv.name.split(' ').map((n) => n[0]).slice(-2).join('')}
                              </div>
                              <span className="font-medium text-[rgb(var(--text-primary))]">{sv.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono text-[rgb(var(--text-muted))]">{sv.msv}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${sv.attendance >= 80 ? 'bg-[rgb(var(--success))]' : sv.attendance >= 60 ? 'bg-[rgb(var(--warning))]' : 'bg-[rgb(var(--error))]'}`}
                                  style={{ width: `${sv.attendance}%` }}
                                />
                              </div>
                              <span className="text-xs text-[rgb(var(--text-secondary))]">{sv.attendance}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-[rgb(var(--text-primary))]">{sv.avgScore.toFixed(1)}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant={sb.variant as any} size="sm">{sb.label}</Badge>
                          </td>
                          <td className="px-4 py-2.5">
                            <Button variant="ghost" size="sm">Chi tiết</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assignments tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">Tổng {ASSIGNMENTS.length} bài tập/kiểm tra</p>
                <Button leftIcon={<Plus className="h-4 w-4" />} size="sm">Tạo bài tập mới</Button>
              </div>
              {ASSIGNMENTS.map((a) => {
                const sb = STATUS_BADGE[a.status] || { variant: 'neutral', label: a.status };
                const pct = a.total > 0 ? Math.round((a.submissions / a.total) * 100) : 0;
                return (
                  <div key={a.id} className="flex items-center gap-4 rounded-lg border border-[rgb(var(--border))] p-4 hover:border-[rgb(var(--primary-light))] transition-colors">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      a.type === 'file' ? 'bg-[rgb(var(--info)/0.1)]' :
                      a.type === 'online' ? 'bg-[rgb(var(--success)/0.1)]' :
                      'bg-[rgb(var(--warning)/0.1)]'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        a.type === 'file' ? 'text-[rgb(var(--info))]' :
                        a.type === 'online' ? 'text-[rgb(var(--success))]' :
                        'text-[rgb(var(--warning))]'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{a.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--text-muted))]">
                        <span>Hạn: {a.deadline}</span>
                        <span>·</span>
                        <span>{a.submissions}/{a.total} đã nộp ({pct}%)</span>
                      </div>
                      {a.status === 'open' && (
                        <div className="mt-1.5 h-1.5 w-32 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                          <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={sb.variant as any} size="sm">{sb.label}</Badge>
                      <Button variant="ghost" size="sm">Chi tiết</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Announcements tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">Thông báo lớp học</p>
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Đăng thông báo</Button>
              </div>
              {ANNOUNCEMENTS.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 rounded-lg border p-4 ${n.pinned ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.05)]' : 'border-[rgb(var(--border))]'}`}>
                  {n.pinned && <span className="text-lg mt-0.5">📌</span>}
                  <div className="flex-1">
                    <p className={`text-sm ${n.pinned ? 'font-semibold text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-primary))]'}`}>{n.title}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{n.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">Sửa</Button>
                </div>
              ))}
            </div>
          )}

          {/* Grades & Discussions placeholder */}
          {activeTab === 'grades' && (
            <div className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
              <FileText className="h-10 w-10 mx-auto mb-3 text-[rgb(var(--text-muted))]" />
              Nhấp vào sinh viên để xem chi tiết điểm số
            </div>
          )}
          {activeTab === 'discussions' && (
            <div className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-[rgb(var(--text-muted))]" />
              Chưa có thảo luận nào
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
